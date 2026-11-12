/**
 * ResonanceModel.ts
 *
 * The magnetic-resonance model shared by the NMR and MRI screens: nuclei in the chamber
 * between the main-magnet coils, optional gradient magnets, and a radio-wave source under
 * the lower coil. Ported from PhET's MriModel and its agents (absorption, relaxation,
 * thermal noise, spin populations), with these changes (see doc/model.md):
 *
 *   - Emitted photons carry γB at the emitting nucleus. PhET used the lower coil alone,
 *     half the main field, so they were emitted at half the absorbed frequency.
 *   - Strong RF saturates the populations toward 50/50 through stimulated emission. PhET
 *     modelled absorption only, so resonant RF inverted the populations.
 *   - Absorption follows a Gaussian line (σ = 0.35 MHz) instead of a hard ±3.4 MHz window,
 *     and each photon gets one absorption roll per nucleus its path crosses.
 *   - The absorption probability is the same everywhere. PhET's grew with distance from
 *     the source, apparently a sign error in its "linear probability" strategy.
 *   - Populations run from 50/50 at zero field to 90/10 at 3 T. PhET's formula gave 45/55
 *     at zero field.
 *
 * Subclasses supply the nuclei (positionsAndStates) and, for the MRI screen, a detector.
 */

import {
  BooleanProperty,
  createObservableArray,
  DerivedProperty,
  EnumerationProperty,
  NumberProperty,
  type ObservableArray,
  StringUnionProperty,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { dotRandom, type Random, type Vector2 } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { CHAMBER, DETECTOR, MAGNET, NUCLEUS, RADIO, RESONANCE, SPIN } from "../../SimplifiedMRIConstants.js";
import { TimeModel } from "../TimeModel.js";
import type { Detector } from "./Detector.js";
import { Nucleus, type SpinState } from "./Nucleus.js";
import { NucleusType } from "./NucleusType.js";
import { Photon } from "./Photon.js";
import { absorptionProbability, larmorFrequency, lineStrength, targetAlignedCount } from "./resonancePhysics.js";

export const RadioViewValues = ["wave", "photon"] as const;
export type RadioView = (typeof RadioViewValues)[number];

/** Time advanced by one press of the step button (s). */
export const STEP_DT = 1 / 25;

/** Largest time step the model accepts (s); longer frames are clamped. */
const MAX_DT = 0.1;

/** A nucleus to create: position (cm), initial spin state, and whether it belongs to a tumour. */
export type NucleusSpec = { position: Vector2; spinState: SpinState; isTumor?: boolean };

export type ResonanceModelOptions = {
  /** Random source; tests pass a seeded instance. */
  random?: Random;

  /** The MRI screen's detector, or null. */
  detector?: Detector | null;
};

export class ResonanceModel implements TModel {
  public readonly random: Random;
  public readonly timer = new TimeModel(true);

  // ── Controls ────────────────────────────────────────────────────────────────
  public readonly nucleusTypeProperty = new EnumerationProperty(NucleusType.HYDROGEN_1);
  public readonly mainFieldProperty = new NumberProperty(MAGNET.MAIN_FIELD_DEFAULT, {
    range: MAGNET.MAIN_FIELD_RANGE,
  });
  public readonly horizontalGradientProperty = new NumberProperty(MAGNET.GRADIENT_DEFAULT, {
    range: MAGNET.GRADIENT_RANGE,
  });
  public readonly verticalGradientProperty = new NumberProperty(MAGNET.GRADIENT_DEFAULT, {
    range: MAGNET.GRADIENT_RANGE,
  });
  public readonly powerProperty = new NumberProperty(RADIO.POWER_DEFAULT, { range: RADIO.POWER_RANGE });
  public readonly frequencyProperty = new NumberProperty(RADIO.FREQUENCY_DEFAULT, {
    range: RADIO.FREQUENCY_RANGE,
  });

  // ── View state kept here so Reset All restores it ───────────────────────────
  public readonly radioViewProperty = new StringUnionProperty<RadioView>("wave", { validValues: RadioViewValues });
  public readonly fieldArrowsVisibleProperty = new BooleanProperty(true);
  public readonly precessionVisibleProperty = new BooleanProperty(false);

  /** True until the user first changes the power or frequency (PhET's "wiggle me" hint). */
  public readonly hintVisibleProperty = new BooleanProperty(true);

  // ── Derived ─────────────────────────────────────────────────────────────────
  /** Resonance frequency γB at the chamber centre, where the gradients add nothing (MHz). */
  public readonly resonanceFrequencyProperty: TReadOnlyProperty<number>;

  /** Absorption line strength (0–1) of the source frequency at the chamber centre. */
  public readonly lineStrengthProperty: TReadOnlyProperty<number>;

  /** Number of nuclei in the aligned (lower-energy) state. */
  public readonly alignedCountProperty = new NumberProperty(0);

  // ── State ───────────────────────────────────────────────────────────────────
  public readonly nuclei: ObservableArray<Nucleus> = createObservableArray<Nucleus>();
  public readonly photons: Photon[] = [];
  public readonly detector: Detector | null;

  /** Elapsed simulation time (s). */
  private time = 0;

  /** Seconds until the next thermal flip. */
  private thermalCountdown: number;

  /** Fractional photons owed by the source (emission is a steady rate). */
  private photonDebt = 0;

  public constructor(specs: readonly NucleusSpec[], options?: ResonanceModelOptions) {
    this.random = options?.random ?? dotRandom;
    this.detector = options?.detector ?? null;

    for (const spec of specs) {
      this.nuclei.push(new Nucleus(spec.position, spec.spinState, this.random, spec.isTumor ?? false));
    }

    this.resonanceFrequencyProperty = new DerivedProperty(
      [this.nucleusTypeProperty, this.mainFieldProperty],
      (type, field) => larmorFrequency(type.gyromagneticRatio, field),
    );
    this.lineStrengthProperty = new DerivedProperty(
      [this.frequencyProperty, this.resonanceFrequencyProperty],
      (frequency, resonance) => lineStrength(frequency - resonance),
    );

    // PhET re-balanced the populations whenever the main field changed.
    this.mainFieldProperty.lazyLink(() => this.setPopulations());

    const hideHint = (): void => {
      this.hintVisibleProperty.value = false;
    };
    this.powerProperty.lazyLink(hideHint);
    this.frequencyProperty.lazyLink(hideHint);

    this.thermalCountdown = this.drawThermalInterval();
    this.setPopulations();
  }

  /** Total field at a point (T): the main field plus both gradients. */
  public fieldAt(x: number, y: number): number {
    return (
      this.mainFieldProperty.value +
      (this.horizontalGradientProperty.value * (x - CHAMBER.WIDTH / 2)) / CHAMBER.WIDTH +
      (this.verticalGradientProperty.value * (y - CHAMBER.HEIGHT / 2)) / CHAMBER.HEIGHT
    );
  }

  /** Resonance frequency of the current nucleus type at a point (MHz). */
  public resonanceFrequencyAt(x: number, y: number): number {
    return larmorFrequency(this.nucleusTypeProperty.value.gyromagneticRatio, this.fieldAt(x, y));
  }

  /** Display precession rate (rev/s) at a point. */
  public precessionRateAt(x: number, y: number): number {
    return this.nucleusTypeProperty.value.gyromagneticRatio * this.fieldAt(x, y) * NUCLEUS.PRECESSION_DISPLAY_RATE;
  }

  /**
   * Snaps the frequency onto resonance if it is within RESONANCE.SNAP_WINDOW of it (PhET's
   * snap-to on slider release). Returns true if it snapped.
   */
  public snapFrequency(): boolean {
    const resonance = this.resonanceFrequencyProperty.value;
    const detuning = Math.abs(this.frequencyProperty.value - resonance);
    if (detuning > 0 && detuning < RESONANCE.SNAP_WINDOW && RADIO.FREQUENCY_RANGE.contains(resonance)) {
      this.frequencyProperty.value = resonance;
      return true;
    }
    return false;
  }

  /** Snaps the main field onto resonance with the source frequency, as snapFrequency does. */
  public snapMainField(): boolean {
    const gamma = this.nucleusTypeProperty.value.gyromagneticRatio;
    const matchingField = this.frequencyProperty.value / gamma;
    const detuning = Math.abs(this.resonanceFrequencyProperty.value - this.frequencyProperty.value);
    if (detuning > 0 && detuning < RESONANCE.SNAP_WINDOW && MAGNET.MAIN_FIELD_RANGE.contains(matchingField)) {
      this.mainFieldProperty.value = matchingField;
      return true;
    }
    return false;
  }

  /**
   * Flips randomly chosen nuclei until the aligned count matches the target for the main
   * field (PhET's DeterministicPolicy). Flips made here are thermal: they do not emit.
   */
  public setPopulations(): void {
    const nuclei = [...this.nuclei];
    const target = targetAlignedCount(nuclei.length, this.mainFieldProperty.value);
    let aligned = nuclei.filter((nucleus) => nucleus.isAligned);
    let anti = nuclei.filter((nucleus) => !nucleus.isAligned);
    while (aligned.length > target) {
      const nucleus = this.random.sample(aligned);
      this.thermalFlip(nucleus);
      aligned = aligned.filter((n) => n !== nucleus);
      anti.push(nucleus);
    }
    while (aligned.length < target && anti.length > 0) {
      const nucleus = this.random.sample(anti);
      this.thermalFlip(nucleus);
      anti = anti.filter((n) => n !== nucleus);
      aligned.push(nucleus);
    }
    this.updateAlignedCount();
  }

  /** Steps the model if playing. */
  public step(dt: number): void {
    if (this.timer.isPlayingProperty.value) {
      this.stepModel(dt);
    }
  }

  /** Advances one step-button increment regardless of the play state. */
  public stepOnce(): void {
    this.stepModel(STEP_DT);
  }

  /** Advances the model by dt seconds. */
  public stepModel(dt: number): void {
    const h = Math.min(dt, MAX_DT);
    this.time += h;
    this.timer.timeProperty.value = this.time;

    this.emitIncomingPhotons(h);
    this.movePhotons(h);
    this.relax(h);
    this.thermalNoise(h);

    for (const nucleus of this.nuclei) {
      nucleus.step(h, this.precessionRateAt(nucleus.position.x, nucleus.position.y));
    }
    this.detector?.update(this.time);
    this.updateAlignedCount();
  }

  /** The source emits photons at a steady rate proportional to its power. */
  private emitIncomingPhotons(dt: number): void {
    this.photonDebt += ((RADIO.MAX_PHOTON_RATE * this.powerProperty.value) / RADIO.POWER_RANGE.max) * dt;
    const halfWidth = (RADIO.SOURCE_WIDTH_FACTOR * CHAMBER.WIDTH) / 2;
    while (this.photonDebt >= 1) {
      this.photonDebt -= 1;
      const x = CHAMBER.WIDTH / 2 + (2 * this.random.nextDouble() - 1) * halfWidth;
      this.photons.push(new Photon(x, RADIO.SOURCE_Y, 0, RADIO.PHOTON_SPEED, this.frequencyProperty.value, false));
    }
  }

  /** Moves photons, processes incoming encounters, and removes photons that leave. */
  private movePhotons(dt: number): void {
    const detectorX = CHAMBER.WIDTH + DETECTOR.GAP;
    const stimulated: Photon[] = [];
    for (let i = this.photons.length - 1; i >= 0; i--) {
      const photon = this.photons[i];
      if (!photon) {
        continue;
      }
      const startY = photon.y;
      photon.step(dt);
      if (photon.isEmitted) {
        if (photon.x >= detectorX) {
          this.photons.splice(i, 1);
          this.detector?.detect(this.time);
        }
      } else {
        const absorbed = this.interactAlongPath(photon, startY, stimulated);
        if (absorbed || photon.y > CHAMBER.HEIGHT + RESONANCE.CAPTURE_RADIUS) {
          this.photons.splice(i, 1);
        }
      }
    }
    this.photons.push(...stimulated);
  }

  /**
   * Incoming photons travel straight up. Find where the segment enters each capture circle
   * and visit those circles in order, including for stimulated photons created along the path.
   * Returns whether the original photon was absorbed.
   */
  private interactAlongPath(photon: Photon, startY: number, stimulated: Photon[]): boolean {
    const radiusSquared = RESONANCE.CAPTURE_RADIUS ** 2;
    const encounters: { nucleus: Nucleus; entryY: number }[] = [];
    for (const nucleus of this.nuclei) {
      const halfChordSquared = radiusSquared - (photon.x - nucleus.position.x) ** 2;
      if (halfChordSquared <= 0 || photon.encountered.has(nucleus)) {
        continue;
      }
      const halfChord = Math.sqrt(halfChordSquared);
      const entryY = nucleus.position.y - halfChord;
      if (entryY < photon.y && nucleus.position.y + halfChord > startY) {
        encounters.push({ nucleus, entryY: Math.max(entryY, startY) });
      }
    }
    if (encounters.length === 0) {
      return false;
    }
    encounters.sort((a, b) => a.entryY - b.entryY);

    const beam = [photon];
    for (const { nucleus } of encounters) {
      this.interactWithNucleus(beam, nucleus, photon.frequency);
      if (beam.length === 0) {
        break;
      }
    }
    const originalSurvives = beam[0] === photon;
    if (photon.y <= CHAMBER.HEIGHT + RESONANCE.CAPTURE_RADIUS) {
      stimulated.push(...beam.slice(originalSurvives ? 1 : 0));
    }
    return !originalSurvives;
  }

  private interactWithNucleus(beam: Photon[], nucleus: Nucleus, frequency: number): void {
    const detuning = frequency - this.resonanceFrequencyAt(nucleus.position.x, nucleus.position.y);
    const probability = absorptionProbability(detuning);
    // Twins enter the beam after this encounter. They can interact with later nuclei.
    for (let i = beam.length - 1; i >= 0; i--) {
      const ray = beam[i];
      if (!ray) {
        continue;
      }
      ray.encountered.add(nucleus);
      if (this.random.nextDouble() >= probability) {
        continue;
      }
      if (nucleus.isAligned) {
        nucleus.setSpinState("antiAligned", this.random);
        nucleus.relaxationCountdown = this.drawWait(SPIN.RELAXATION_TIME);
        beam.splice(i, 1);
      } else {
        nucleus.relaxationCountdown = null;
        nucleus.setSpinState("aligned", this.random);
        const twin = new Photon(ray.x, ray.y, ray.vx, ray.vy, ray.frequency, false);
        for (const passed of ray.encountered) {
          twin.encountered.add(passed);
        }
        beam.push(twin);
      }
    }
  }

  /** Excited nuclei whose wait is over return to the aligned state and emit toward +x. */
  private relax(dt: number): void {
    for (const nucleus of this.nuclei) {
      if (nucleus.relaxationCountdown === null) {
        continue;
      }
      nucleus.relaxationCountdown -= dt;
      if (nucleus.relaxationCountdown <= 0) {
        nucleus.relaxationCountdown = null;
        nucleus.setSpinState("aligned", this.random);
        const { x, y } = nucleus.position;
        this.photons.push(new Photon(x, y, RADIO.PHOTON_SPEED, 0, this.resonanceFrequencyAt(x, y), true));
      }
    }
  }

  /**
   * At random intervals one nucleus flips toward the target population: an aligned one
   * if there are too many aligned, otherwise an anti-aligned one (PhET's ThermalNoise).
   */
  private thermalNoise(dt: number): void {
    this.thermalCountdown -= dt;
    if (this.thermalCountdown > 0) {
      return;
    }
    this.thermalCountdown = this.drawThermalInterval();
    const nuclei = [...this.nuclei];
    if (nuclei.length === 0) {
      return;
    }
    const target = targetAlignedCount(nuclei.length, this.mainFieldProperty.value);
    const aligned = nuclei.filter((nucleus) => nucleus.isAligned);
    const anti = nuclei.filter((nucleus) => !nucleus.isAligned);
    const pool = aligned.length > target ? aligned : anti;
    if (pool.length > 0) {
      this.thermalFlip(this.random.sample(pool));
    }
  }

  /** A flip that does not emit: any pending relaxation is cancelled. */
  private thermalFlip(nucleus: Nucleus): void {
    nucleus.relaxationCountdown = null;
    nucleus.flip(this.random);
  }

  /** Gaussian waiting time with mean `mean`, never shorter than MIN_WAIT_FRACTION of it. */
  private drawWait(mean: number): number {
    const wait = mean * (1 + SPIN.WAIT_SPREAD * this.random.nextGaussian());
    return Math.max(SPIN.MIN_WAIT_FRACTION * mean, wait);
  }

  /** Thermal flips slow down as the field grows, as in PhET. */
  private drawThermalInterval(): number {
    const field = this.mainFieldProperty.value;
    return this.drawWait(SPIN.THERMAL_FLIP_INTERVAL * (1 + (5 * field) / MAGNET.MAIN_FIELD_RANGE.max));
  }

  protected updateAlignedCount(): void {
    let count = 0;
    for (const nucleus of this.nuclei) {
      if (nucleus.isAligned) {
        count++;
      }
    }
    this.alignedCountProperty.value = count;
  }

  /** Removes all photons (used on reset and when the sample changes). */
  protected clearPhotons(): void {
    this.photons.length = 0;
    this.photonDebt = 0;
  }

  public reset(): void {
    this.timer.reset();
    this.nucleusTypeProperty.reset();
    this.mainFieldProperty.reset();
    this.horizontalGradientProperty.reset();
    this.verticalGradientProperty.reset();
    this.powerProperty.reset();
    this.frequencyProperty.reset();
    this.radioViewProperty.reset();
    this.fieldArrowsVisibleProperty.reset();
    this.precessionVisibleProperty.reset();
    this.hintVisibleProperty.reset();
    this.clearPhotons();
    this.detector?.reset();
    this.time = 0;
    for (const nucleus of this.nuclei) {
      nucleus.reset();
    }
    this.thermalCountdown = this.drawThermalInterval();
    this.setPopulations();
  }
}
