/**
 * RelaxationModel.ts
 *
 * The Relaxation screen, an addition to PhET's sim: the net magnetization of a tissue's
 * protons, tipped by an RF pulse, precessing about the field and relaxing back.
 *
 * The physics runs in the rotating frame on a tissue clock in milliseconds (exact Bloch
 * relaxation, blochPhysics.ts). Two display quantities run on the wall clock instead:
 *   - the lab-frame precession phase, slowed by about 1e8 so the precession can be seen;
 *   - the RF pulse, animated over RELAXATION.PULSE_DURATION as a nutation, with the tissue
 *     clock held (a real pulse lasts microseconds to milliseconds, far shorter than T2).
 *
 * After each pulse the tissue clock restarts at zero and the recorded curves are cleared.
 */

import {
  BooleanProperty,
  DerivedProperty,
  EnumerationProperty,
  NumberProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { toRadians } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { TimeSpeed } from "scenerystack/scenery-phet";
import { TimeModel } from "../../common/TimeModel.js";
import { RELAXATION } from "../../SimplifiedMRIConstants.js";
import {
  chooseWindow,
  EQUILIBRIUM,
  isochromatOffsets,
  type Magnetization,
  relax,
  rotateAboutX,
  transverseMagnitude,
} from "./blochPhysics.js";
import { Tissue } from "./Tissue.js";

/** Wall-clock time advanced by one press of the step button (s). */
const STEP_DT = 1 / 25;

/** Largest wall-clock step accepted (s). */
const MAX_DT = 0.1;

/** One recorded point of the relaxation curves. */
export type RelaxationSample = { readonly t: number; readonly mz: number; readonly mxy: number };

const DEFAULT_TISSUE = Tissue.WHITE_MATTER;

export class RelaxationModel implements TModel {
  public readonly timer = new TimeModel(true);
  public readonly timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);

  // ── Controls ────────────────────────────────────────────────────────────────
  public readonly tissueProperty = new EnumerationProperty(DEFAULT_TISSUE);
  public readonly t1Property = new NumberProperty(DEFAULT_TISSUE.t1 ?? 1000, {
    range: RELAXATION.T1_RANGE,
  });
  public readonly t2Property = new NumberProperty(DEFAULT_TISSUE.t2 ?? 100, {
    range: RELAXATION.T2_RANGE,
  });
  public readonly flipAngleProperty = new NumberProperty(RELAXATION.FLIP_ANGLE_DEFAULT, {
    range: RELAXATION.FLIP_ANGLE_RANGE,
  });

  // ── View state ──────────────────────────────────────────────────────────────
  public readonly rotatingFrameProperty = new BooleanProperty(false);
  public readonly isochromatsVisibleProperty = new BooleanProperty(true);
  public readonly signalVisibleProperty = new BooleanProperty(true);

  // ── Derived ─────────────────────────────────────────────────────────────────
  /** Time span (ms) of the longitudinal chart: about five T1. */
  public readonly longitudinalWindowProperty: TReadOnlyProperty<number>;

  /** Time span (ms) of the transverse chart: about five T2. */
  public readonly transverseWindowProperty: TReadOnlyProperty<number>;

  /** True while an RF pulse is being applied. */
  public readonly pulseActiveProperty = new BooleanProperty(false);

  /** Longitudinal and transverse magnetization, for readouts and descriptions. */
  public readonly mzProperty = new NumberProperty(1);
  public readonly mxyProperty = new NumberProperty(0);

  // ── State ───────────────────────────────────────────────────────────────────
  /** Net magnetization in the rotating frame (units of M0). */
  public magnetization: Magnetization = EQUILIBRIUM;

  /** Lab-frame precession phase for display (rad). */
  public labPhase = 0;

  /** Tissue time since the last pulse ended (ms), or null before any pulse. */
  public tissueTime: number | null = null;

  /** Transverse direction (rad, in the rotating frame) right after the last pulse. */
  public isochromatBasePhase = -Math.PI / 2;

  /**
   * |Mxy| right after the last pulse: the most each spin can be tipped from the field.
   * Zero after a 180° pulse, which leaves no transverse coherence to dephase.
   */
  public pulseTransverse = 0;

  /** Recorded curves since the last pulse. */
  public readonly samples: RelaxationSample[] = [];

  /** Increments whenever `samples` changes, so the charts know to redraw. */
  public samplesVersion = 0;

  private pulseProgress = 0;
  private pulseStart: Magnetization = EQUILIBRIUM;
  private pulseAngle = 0;
  private settingFromTissue = false;

  public constructor() {
    this.longitudinalWindowProperty = new DerivedProperty([this.t1Property], (t1) => chooseWindow(5 * t1));
    this.transverseWindowProperty = new DerivedProperty([this.t2Property], (t2) => chooseWindow(5 * t2));

    // Choosing a tissue sets T1 and T2; moving either slider switches to Custom.
    this.tissueProperty.lazyLink((tissue) => {
      if (tissue.t1 !== null && tissue.t2 !== null) {
        this.settingFromTissue = true;
        this.t1Property.value = tissue.t1;
        this.t2Property.value = tissue.t2;
        this.settingFromTissue = false;
      }
      this.returnToEquilibrium();
    });
    const markCustom = (): void => {
      if (!this.settingFromTissue) {
        this.tissueProperty.value = Tissue.CUSTOM;
      }
    };

    // T2 can never exceed T1.
    this.t1Property.lazyLink((t1) => {
      markCustom();
      if (this.t2Property.value > t1) {
        this.t2Property.value = Math.max(t1, RELAXATION.T2_RANGE.min);
      }
    });
    this.t2Property.lazyLink((t2) => {
      markCustom();
      if (t2 > this.t1Property.value) {
        this.t1Property.value = Math.min(t2, RELAXATION.T1_RANGE.max);
      }
    });
  }

  /** Tissue milliseconds per wall-clock second at the current speed. */
  public get rate(): number {
    const speed = this.timeSpeedProperty.value;
    return speed === TimeSpeed.SLOW
      ? RELAXATION.SLOW_RATE
      : speed === TimeSpeed.FAST
        ? RELAXATION.FAST_RATE
        : RELAXATION.NORMAL_RATE;
  }

  /** Isochromat frequency offsets for the current T2 (rad/ms). */
  public get isochromatOffsets(): number[] {
    return isochromatOffsets(this.t2Property.value);
  }

  /** Starts an RF pulse of the current flip angle. */
  public applyPulse(): void {
    this.pulseStart = this.magnetization;
    this.pulseAngle = toRadians(this.flipAngleProperty.value);
    this.pulseProgress = 0;
    this.pulseActiveProperty.value = true;
    this.timer.isPlayingProperty.value = true;
  }

  /** Puts the magnetization back along the field and clears the curves. */
  public returnToEquilibrium(): void {
    this.magnetization = EQUILIBRIUM;
    this.pulseTransverse = 0;
    this.pulseActiveProperty.value = false;
    this.tissueTime = null;
    this.clearSamples();
    this.updateReadouts();
  }

  public step(dt: number): void {
    if (this.timer.isPlayingProperty.value) {
      this.stepModel(dt);
    }
  }

  public stepOnce(): void {
    this.stepModel(STEP_DT);
  }

  /** Advances by dt wall-clock seconds. */
  public stepModel(dt: number): void {
    const h = Math.min(dt, MAX_DT);
    this.labPhase = (this.labPhase + 2 * Math.PI * RELAXATION.DISPLAY_PRECESSION_RATE * h) % (2 * Math.PI);
    this.timer.timeProperty.value += h;

    if (this.pulseActiveProperty.value) {
      this.pulseProgress = Math.min(1, this.pulseProgress + h / RELAXATION.PULSE_DURATION);
      this.magnetization = rotateAboutX(this.pulseStart, this.pulseAngle * this.pulseProgress);
      if (this.pulseProgress >= 1) {
        this.pulseActiveProperty.value = false;
        this.tissueTime = 0;
        this.isochromatBasePhase = Math.atan2(this.magnetization.y, this.magnetization.x);
        this.pulseTransverse = transverseMagnitude(this.magnetization);
        this.clearSamples();
        this.record();
      }
    } else if (this.tissueTime !== null) {
      const dtTissue = h * this.rate;
      this.magnetization = relax(this.magnetization, dtTissue, this.t1Property.value, this.t2Property.value);
      this.tissueTime += dtTissue;
      this.record();
    }
    this.updateReadouts();
  }

  /** Records a sample if enough tissue time has passed, while inside the longer window. */
  private record(): void {
    if (this.tissueTime === null) {
      return;
    }
    const window = Math.max(this.longitudinalWindowProperty.value, this.transverseWindowProperty.value);
    if (this.tissueTime > window) {
      return;
    }
    const minimumGap = Math.min(this.longitudinalWindowProperty.value, this.transverseWindowProperty.value);
    const last = this.samples[this.samples.length - 1];
    if (!last || this.tissueTime - last.t >= minimumGap / RELAXATION.MAX_SAMPLES) {
      this.samples.push({
        t: this.tissueTime,
        mz: this.magnetization.z,
        mxy: transverseMagnitude(this.magnetization),
      });
      this.samplesVersion++;
    }
  }

  private clearSamples(): void {
    this.samples.length = 0;
    this.samplesVersion++;
  }

  private updateReadouts(): void {
    this.mzProperty.value = this.magnetization.z;
    this.mxyProperty.value = transverseMagnitude(this.magnetization);
  }

  public reset(): void {
    this.timer.reset();
    this.timeSpeedProperty.reset();
    this.settingFromTissue = true;
    this.tissueProperty.reset();
    this.t1Property.reset();
    this.t2Property.reset();
    this.settingFromTissue = false;
    this.flipAngleProperty.reset();
    this.rotatingFrameProperty.reset();
    this.isochromatsVisibleProperty.reset();
    this.signalVisibleProperty.reset();
    this.labPhase = 0;
    this.returnToEquilibrium();
  }
}
