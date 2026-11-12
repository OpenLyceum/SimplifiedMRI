/**
 * Photon.ts
 *
 * A radio-frequency photon: incoming ones rise from the source through the chamber;
 * emitted ones leave a relaxing nucleus and travel toward the detector (+x).
 *
 * Photons are plain mutable objects, not Properties: there can be a hundred or more at once
 * and the view redraws them each frame from the model's array.
 */

import type { Nucleus } from "./Nucleus.js";

export class Photon {
  /** Position (cm). */
  public x: number;
  public y: number;

  /** Velocity (cm/s). */
  public readonly vx: number;
  public readonly vy: number;

  /** Frequency (MHz). */
  public readonly frequency: number;

  /** True for a photon emitted by a relaxing nucleus. Emitted photons are never re-absorbed. */
  public readonly isEmitted: boolean;

  /**
   * Nuclei this photon has already passed within capture range of. Each encounter gets one
   * interaction roll, even if the photon remains in range across several steps.
   */
  public readonly encountered = new Set<Nucleus>();

  public constructor(x: number, y: number, vx: number, vy: number, frequency: number, isEmitted: boolean) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.frequency = frequency;
    this.isEmitted = isEmitted;
  }

  public step(dt: number): void {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }
}
