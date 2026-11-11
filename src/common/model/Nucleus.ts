/**
 * Nucleus.ts
 *
 * One nucleus in the sample: a fixed position, a spin state (aligned with the field, the
 * lower energy, or anti-aligned, the higher), and the bookkeeping for relaxation.
 *
 * PhET called the lower-energy state "down" and the upper "up"; here they are named for
 * their orientation relative to the field, which is what the glyph shows.
 *
 * The nucleus also integrates two display quantities so the motion is deterministic and
 * frame-rate independent: the glyph's swing toward its new orientation after a flip (PhET's
 * damped-pendulum behaviour) and its precession phase.
 */

import { StringUnionProperty } from "scenerystack/axon";
import type { Random, Vector2 } from "scenerystack/dot";
import { NUCLEUS } from "../../SimplifiedMRIConstants.js";

export const SpinStateValues = ["aligned", "antiAligned"] as const;
export type SpinState = (typeof SpinStateValues)[number];

export class Nucleus {
  /** Position in the chamber (cm). */
  public readonly position: Vector2;

  /** True for the denser nuclei of the MRI screen's tumour. */
  public readonly isTumor: boolean;

  public readonly spinStateProperty: StringUnionProperty<SpinState>;

  /** Spin state at construction, restored by reset(). */
  private readonly initialSpinState: SpinState;

  /**
   * Seconds until this nucleus relaxes and emits a photon, or null when it is not waiting
   * to relax (aligned, or anti-aligned by a thermal flip, which does not emit).
   */
  public relaxationCountdown: number | null = null;

  /** Glyph angle from the field direction (rad): 0 when aligned, π when anti-aligned. */
  public orientation: number;

  /** Glyph angular velocity (rad/s). */
  private angularVelocity = 0;

  /** Precession phase about the field (rad). */
  public precessionPhase: number;

  public constructor(position: Vector2, spinState: SpinState, random: Random, isTumor = false) {
    this.position = position;
    this.isTumor = isTumor;
    this.initialSpinState = spinState;
    this.spinStateProperty = new StringUnionProperty<SpinState>(spinState, { validValues: SpinStateValues });
    this.orientation = Nucleus.targetOrientation(spinState);
    this.precessionPhase = random.nextDouble() * 2 * Math.PI;
  }

  public get isAligned(): boolean {
    return this.spinStateProperty.value === "aligned";
  }

  /** The glyph angle for a spin state. */
  public static targetOrientation(spinState: SpinState): number {
    return spinState === "aligned" ? 0 : Math.PI;
  }

  /**
   * Changes the spin state and starts the glyph swinging, in a random direction, toward the
   * new orientation.
   */
  public setSpinState(spinState: SpinState, random: Random): void {
    if (spinState !== this.spinStateProperty.value) {
      this.spinStateProperty.value = spinState;
      this.angularVelocity = (random.nextBoolean() ? 1 : -1) * NUCLEUS.FLIP_KICK;
    }
  }

  /** Flips to the other spin state. */
  public flip(random: Random): void {
    this.setSpinState(this.isAligned ? "antiAligned" : "aligned", random);
  }

  /**
   * Advances the glyph swing and the precession phase.
   *
   * @param dt - time step (s)
   * @param precessionRate - display precession rate (rev/s)
   */
  public step(dt: number, precessionRate: number): void {
    this.precessionPhase = (this.precessionPhase + 2 * Math.PI * precessionRate * dt) % (2 * Math.PI);

    const target = Nucleus.targetOrientation(this.spinStateProperty.value);
    const substeps = Math.max(1, Math.ceil(dt / NUCLEUS.MAX_SUBSTEP));
    const h = dt / substeps;
    for (let i = 0; i < substeps; i++) {
      const phi = Math.atan2(Math.sin(target - this.orientation), Math.cos(target - this.orientation));
      if (Math.abs(phi) < 0.01 && Math.abs(this.angularVelocity) < 0.5) {
        this.orientation = target;
        this.angularVelocity = 0;
        break;
      }

      // Semi-implicit Euler on θ'' = K sin φ − D θ'.
      this.angularVelocity += (NUCLEUS.SPRING * Math.sin(phi) - NUCLEUS.DAMPING * this.angularVelocity) * h;
      this.orientation += this.angularVelocity * h;
    }
  }

  /** Restores the initial spin state with the glyph at rest. The precession phase is kept. */
  public reset(): void {
    this.spinStateProperty.value = this.initialSpinState;
    this.relaxationCountdown = null;
    this.orientation = Nucleus.targetOrientation(this.initialSpinState);
    this.angularVelocity = 0;
  }

  public dispose(): void {
    this.spinStateProperty.dispose();
  }
}
