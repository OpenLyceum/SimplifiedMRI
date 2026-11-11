/**
 * Unit tests for the Relaxation screen: exact Bloch relaxation and the screen model.
 */

import { describe, expect, it } from "vitest";
import {
  chooseWindow,
  EQUILIBRIUM,
  isochromatOffsets,
  longitudinalAfterPulse,
  relax,
  rotateAboutX,
  transverseMagnitude,
} from "../src/relaxation/model/blochPhysics.js";
import { RelaxationModel } from "../src/relaxation/model/RelaxationModel.js";
import { Tissue } from "../src/relaxation/model/Tissue.js";
import { RELAXATION } from "../src/SimplifiedMRIConstants.js";

describe("Bloch physics", () => {
  it("tips equilibrium magnetization into the transverse plane with a 90° pulse", () => {
    const m = rotateAboutX(EQUILIBRIUM, Math.PI / 2);
    expect(m.z).toBeCloseTo(0, 12);
    expect(m.y).toBeCloseTo(-1, 12);
    expect(transverseMagnitude(m)).toBeCloseTo(1, 12);
  });

  it("inverts with a 180° pulse", () => {
    const m = rotateAboutX(EQUILIBRIUM, Math.PI);
    expect(m.z).toBeCloseTo(-1, 12);
    expect(transverseMagnitude(m)).toBeCloseTo(0, 12);
  });

  it("decays the transverse part to 1/e after T2 and recovers Mz to 1 − 1/e after T1", () => {
    const tipped = rotateAboutX(EQUILIBRIUM, Math.PI / 2);
    const afterT2 = relax(tipped, 100, 1000, 100);
    expect(transverseMagnitude(afterT2)).toBeCloseTo(Math.exp(-1), 12);
    const afterT1 = relax(tipped, 1000, 1000, 100);
    expect(afterT1.z).toBeCloseTo(1 - Math.exp(-1), 12);
  });

  it("composes exactly: two half steps equal one full step", () => {
    const tipped = rotateAboutX(EQUILIBRIUM, 1);
    const full = relax(tipped, 300, 800, 90);
    const half = relax(relax(tipped, 150, 800, 90), 150, 800, 90);
    expect(half.x).toBeCloseTo(full.x, 12);
    expect(half.y).toBeCloseTo(full.y, 12);
    expect(half.z).toBeCloseTo(full.z, 12);
  });

  it("crosses zero at T1 ln 2 after an inversion", () => {
    expect(longitudinalAfterPulse(Math.PI, 1000 * Math.LN2, 1000)).toBeCloseTo(0, 12);
  });

  it("spreads isochromats symmetrically, faster for shorter T2", () => {
    const slow = isochromatOffsets(200);
    const fast = isochromatOffsets(50);
    expect(slow).toHaveLength(RELAXATION.ISOCHROMAT_COUNT);
    expect((slow[0] ?? 0) + (slow[slow.length - 1] ?? 0)).toBeCloseTo(0, 12);
    expect(Math.abs(fast[0] ?? 0)).toBeCloseTo(4 * Math.abs(slow[0] ?? 0), 12);
  });

  it("chooses the smallest chart window that fits", () => {
    expect(chooseWindow(450)).toBe(500);
    expect(chooseWindow(500)).toBe(500);
    expect(chooseWindow(1e9)).toBe(20000);
  });
});

describe("RelaxationModel", () => {
  /** Runs the model for `seconds` of wall-clock time. */
  const run = (model: RelaxationModel, seconds: number): void => {
    for (let i = 0; i < Math.round(seconds * 60); i++) {
      model.stepModel(1 / 60);
    }
  };

  it("follows a tissue preset and switches to Custom when a slider moves", () => {
    const model = new RelaxationModel();
    model.tissueProperty.value = Tissue.FAT;
    expect(model.t1Property.value).toBe(Tissue.FAT.t1);
    expect(model.t2Property.value).toBe(Tissue.FAT.t2);
    model.t1Property.value = 500;
    expect(model.tissueProperty.value).toBe(Tissue.CUSTOM);
  });

  it("never lets T2 exceed T1", () => {
    const model = new RelaxationModel();
    model.t2Property.value = 2000;
    expect(model.t1Property.value).toBeGreaterThanOrEqual(2000);
    model.t1Property.value = 100;
    expect(model.t2Property.value).toBeLessThanOrEqual(100);
  });

  it("tips the magnetization with an animated pulse, then relaxes along the exact curve", () => {
    const model = new RelaxationModel();
    model.applyPulse();
    run(model, RELAXATION.PULSE_DURATION + 0.01);
    expect(model.pulseActiveProperty.value).toBe(false);
    expect(model.tissueTime).not.toBeNull();
    const t = model.tissueTime ?? 0;
    const t1 = model.t1Property.value;
    expect(model.magnetization.z).toBeCloseTo(longitudinalAfterPulse(Math.PI / 2, t, t1), 6);

    run(model, 2);
    const t2 = model.t2Property.value;
    const elapsed = model.tissueTime ?? 0;
    expect(model.mxyProperty.value).toBeCloseTo(Math.exp(-elapsed / t2), 6);
    expect(model.mzProperty.value).toBeCloseTo(longitudinalAfterPulse(Math.PI / 2, elapsed, t1), 6);
    expect(model.samples.length).toBeGreaterThan(10);
  });

  it("returns to equilibrium on reset", () => {
    const model = new RelaxationModel();
    model.tissueProperty.value = Tissue.CSF;
    model.applyPulse();
    run(model, 1);
    model.reset();
    expect(model.magnetization).toEqual(EQUILIBRIUM);
    expect(model.tissueProperty.value).toBe(Tissue.WHITE_MATTER);
    expect(model.samples).toHaveLength(0);
  });
});
