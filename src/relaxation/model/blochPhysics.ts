/**
 * blochPhysics.ts
 *
 * The Bloch equations without RF, solved exactly over a step, in the frame rotating at the
 * Larmor frequency. Magnetization is in units of its equilibrium value M0 (along +z).
 *
 *   transverse   Mx, My decay as e^(-t/T2)
 *   longitudinal Mz recovers as 1 - (1 - Mz0) e^(-t/T1)
 *
 * An RF pulse about the rotating x′ axis tips the magnetization by the flip angle.
 */

import { RELAXATION } from "../../SimplifiedMRIConstants.js";

export type Magnetization = { readonly x: number; readonly y: number; readonly z: number };

export const EQUILIBRIUM: Magnetization = { x: 0, y: 0, z: 1 };

/**
 * Relaxes a magnetization for `dt` milliseconds.
 *
 * @param m - magnetization at the start of the step
 * @param dt - step (ms)
 * @param t1 - longitudinal relaxation time (ms)
 * @param t2 - transverse relaxation time (ms)
 */
export function relax(m: Magnetization, dt: number, t1: number, t2: number): Magnetization {
  const transverse = Math.exp(-dt / t2);
  const longitudinal = Math.exp(-dt / t1);
  return { x: m.x * transverse, y: m.y * transverse, z: 1 - (1 - m.z) * longitudinal };
}

/**
 * Rotates a magnetization about the x′ axis by `angle` radians (an RF pulse along x′).
 * Starting from equilibrium, a positive angle tips the magnetization toward −y′.
 */
export function rotateAboutX(m: Magnetization, angle: number): Magnetization {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: m.x, y: m.y * cos - m.z * sin, z: m.y * sin + m.z * cos };
}

/** Length of the transverse component, |Mxy|. */
export function transverseMagnitude(m: Magnetization): number {
  return Math.hypot(m.x, m.y);
}

/**
 * Mz(t) after a pulse of flip angle α from equilibrium: 1 − (1 − cos α) e^(−t/T1).
 * Used by the tests and for the zero crossing of an inversion recovery.
 */
export function longitudinalAfterPulse(flipAngle: number, t: number, t1: number): number {
  return 1 - (1 - Math.cos(flipAngle)) * Math.exp(-t / t1);
}

/**
 * Frequency offsets of the spin isochromats (rad/ms): quantiles of a Lorentzian of half
 * width 1/T2, the distribution whose dephasing gives an exponential decay with time
 * constant T2. With a dozen spins this is only an illustration of dephasing; the net
 * magnetization drawn and plotted is the exact Bloch solution.
 */
export function isochromatOffsets(t2: number, count: number = RELAXATION.ISOCHROMAT_COUNT): number[] {
  const offsets: number[] = [];
  for (let k = 0; k < count; k++) {
    offsets.push(Math.tan(Math.PI * ((k + 0.5) / count - 0.5)) / t2);
  }
  return offsets;
}

/** The smallest chart window from RELAXATION.WINDOW_CHOICES that holds `duration` (ms). */
export function chooseWindow(duration: number): number {
  const choices = RELAXATION.WINDOW_CHOICES;
  for (const choice of choices) {
    if (choice >= duration) {
      return choice;
    }
  }
  return choices[choices.length - 1] ?? duration;
}
