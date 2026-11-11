/**
 * Detector.ts
 *
 * The MRI screen's receiver coil, drawn as PhET's vertical bar to the right of the chamber.
 * It absorbs every emitted photon that reaches its face and reports how many arrived during
 * the last second (a sliding window, where PhET reset its count every 0.67 s).
 */

import { NumberProperty } from "scenerystack/axon";
import { DETECTOR } from "../../SimplifiedMRIConstants.js";

export class Detector {
  /** Photons detected during the last DETECTOR.WINDOW seconds. */
  public readonly countProperty = new NumberProperty(0, { isValidValue: (value) => value >= 0 });

  /** Simulation times (s) of the detections still inside the window, oldest first. */
  private readonly detectionTimes: number[] = [];

  /** Records one photon arriving at time `time` (s). */
  public detect(time: number): void {
    this.detectionTimes.push(time);
    this.countProperty.value = this.detectionTimes.length;
  }

  /** Drops detections older than the window, as of time `time` (s). */
  public update(time: number): void {
    const cutoff = time - DETECTOR.WINDOW;
    let removed = 0;
    while (removed < this.detectionTimes.length && (this.detectionTimes[removed] ?? 0) <= cutoff) {
      removed++;
    }
    if (removed > 0) {
      this.detectionTimes.splice(0, removed);
      this.countProperty.value = this.detectionTimes.length;
    }
  }

  public reset(): void {
    this.detectionTimes.length = 0;
    this.countProperty.reset();
  }

  public dispose(): void {
    this.countProperty.dispose();
  }
}
