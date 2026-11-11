/**
 * Unit tests for the magnetic-resonance model shared by the NMR and MRI screens.
 */

import { Random } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import { NucleusType } from "../src/common/model/NucleusType.js";
import {
  absorptionProbability,
  larmorFrequency,
  lineStrength,
  targetAlignedCount,
  targetAlignedFraction,
  thermalAlignedExcess,
} from "../src/common/model/resonancePhysics.js";
import { EARS, headSpecs, nmrGridSpecs, SKULL, TUMOR, tumorSpecs } from "../src/common/model/sampleGeometry.js";
import { MRIModel } from "../src/mri/model/MRIModel.js";
import { NMRModel } from "../src/nmr/model/NMRModel.js";
import { CHAMBER, MAGNET, RADIO, RESONANCE } from "../src/SimplifiedMRIConstants.js";

const seeded = (seed = 1): Random => new Random({ seed });

/** Runs a model for `seconds` in steps of 1/60 s. */
function run(model: { stepModel: (dt: number) => void }, seconds: number): void {
  const steps = Math.round(seconds * 60);
  for (let i = 0; i < steps; i++) {
    model.stepModel(1 / 60);
  }
}

describe("resonance physics", () => {
  it("gives hydrogen 42.58 MHz per tesla", () => {
    expect(larmorFrequency(NucleusType.HYDROGEN_1.gyromagneticRatio, 1)).toBeCloseTo(42.577, 3);
    expect(larmorFrequency(NucleusType.HYDROGEN_1.gyromagneticRatio, 1.5)).toBeCloseTo(63.87, 2);
  });

  it("puts every nucleus's resonance inside the frequency range somewhere in the field range", () => {
    for (const type of NucleusType.enumeration.values) {
      const top = larmorFrequency(type.gyromagneticRatio, MAGNET.MAIN_FIELD_RANGE.max);
      expect(top).toBeGreaterThan(RADIO.FREQUENCY_RANGE.min);
    }
  });

  it("has a Gaussian line one line width wide", () => {
    expect(lineStrength(0)).toBe(1);
    expect(lineStrength(RESONANCE.LINE_WIDTH)).toBeCloseTo(Math.exp(-0.5), 10);
    expect(lineStrength(-3 * RESONANCE.LINE_WIDTH)).toBeCloseTo(lineStrength(3 * RESONANCE.LINE_WIDTH), 12);
    expect(absorptionProbability(0)).toBe(RESONANCE.PEAK_ABSORPTION_PROBABILITY);
    expect(absorptionProbability(10 * RESONANCE.LINE_WIDTH)).toBeLessThan(1e-20);
  });

  it("targets 50/50 at zero field and 90/10 at the maximum field", () => {
    expect(targetAlignedFraction(0)).toBe(0.5);
    expect(targetAlignedFraction(MAGNET.MAIN_FIELD_RANGE.max)).toBeCloseTo(0.9, 12);
    expect(targetAlignedCount(20, 0)).toBe(10);
    expect(targetAlignedCount(20, 3)).toBe(18);
  });

  it("documents why the populations are exaggerated: the real excess is about 1e-5", () => {
    const f = larmorFrequency(NucleusType.HYDROGEN_1.gyromagneticRatio, 3);
    const excess = thermalAlignedExcess(f, 310);
    expect(excess).toBeGreaterThan(5e-6);
    expect(excess).toBeLessThan(2e-5);
  });
});

describe("sample geometry", () => {
  it("lays out PhET's 5 × 4 grid of twenty nuclei inside the chamber", () => {
    const specs = nmrGridSpecs();
    expect(specs).toHaveLength(20);
    const xs = new Set(specs.map((spec) => spec.position.x.toFixed(3)));
    const ys = new Set(specs.map((spec) => spec.position.y.toFixed(3)));
    expect(xs.size).toBe(5);
    expect(ys.size).toBe(4);
    for (const spec of specs) {
      expect(spec.position.x).toBeGreaterThan(0);
      expect(spec.position.x).toBeLessThan(CHAMBER.WIDTH);
    }
  });

  it("fills the head with nuclei, one in each ear", () => {
    const specs = headSpecs();
    expect(specs.length).toBeGreaterThan(40);
    for (const ear of EARS) {
      expect(specs.some((spec) => spec.position.x === ear.centerX && spec.position.y === ear.centerY)).toBe(true);
    }
    expect(SKULL.radiusY).toBe(CHAMBER.HEIGHT / 2);
  });

  it("puts tumour nuclei inside the tumour, never on top of a head nucleus", () => {
    const head = headSpecs();
    const tumor = tumorSpecs();
    expect(tumor.length).toBeGreaterThan(4);
    for (const spec of tumor) {
      const u = (spec.position.x - TUMOR.centerX) / TUMOR.radiusX;
      const v = (spec.position.y - TUMOR.centerY) / TUMOR.radiusY;
      expect(u * u + v * v).toBeLessThan(1);
      expect(head.some((h) => h.position.distance(spec.position) < 0.5)).toBe(false);
    }
  });
});

describe("ResonanceModel", () => {
  it("starts with the target populations", () => {
    const model = new NMRModel({ random: seeded() });
    expect(model.alignedCountProperty.value).toBe(targetAlignedCount(20, MAGNET.MAIN_FIELD_DEFAULT));
  });

  it("re-balances the populations when the main field changes", () => {
    const model = new NMRModel({ random: seeded() });
    model.mainFieldProperty.value = 3;
    expect(model.alignedCountProperty.value).toBe(18);
    model.mainFieldProperty.value = 0;
    expect(model.alignedCountProperty.value).toBe(10);
  });

  it("adds the gradients to the main field, zero at the centre", () => {
    const model = new MRIModel({ random: seeded() });
    model.mainFieldProperty.value = 1;
    model.horizontalGradientProperty.value = 0.2;
    model.verticalGradientProperty.value = 0.1;
    expect(model.fieldAt(CHAMBER.WIDTH / 2, CHAMBER.HEIGHT / 2)).toBeCloseTo(1, 12);
    expect(model.fieldAt(CHAMBER.WIDTH, CHAMBER.HEIGHT / 2)).toBeCloseTo(1.1, 12);
    expect(model.fieldAt(0, CHAMBER.HEIGHT / 2)).toBeCloseTo(0.9, 12);
    expect(model.fieldAt(CHAMBER.WIDTH / 2, CHAMBER.HEIGHT)).toBeCloseTo(1.05, 12);
  });

  it("emits photons at a rate set by the power", () => {
    const model = new NMRModel({ random: seeded() });
    model.frequencyProperty.value = 120; // far from resonance: nothing is absorbed
    model.powerProperty.value = 50;
    model.stepModel(0.1);
    expect(model.photons.length).toBe(Math.floor(RADIO.MAX_PHOTON_RATE * 0.5 * 0.1));
  });

  it("absorbs on resonance and not off resonance", () => {
    const onResonance = new NMRModel({ random: seeded(3) });
    onResonance.powerProperty.value = 100;
    onResonance.frequencyProperty.value = onResonance.resonanceFrequencyProperty.value;
    const offResonance = new NMRModel({ random: seeded(3) });
    offResonance.powerProperty.value = 100;
    offResonance.frequencyProperty.value = offResonance.resonanceFrequencyProperty.value + 10;

    let emittedOn = 0;
    let emittedOff = 0;
    for (let i = 0; i < 180; i++) {
      onResonance.stepModel(1 / 60);
      offResonance.stepModel(1 / 60);
      emittedOn = Math.max(emittedOn, onResonance.photons.filter((p) => p.isEmitted).length);
      emittedOff = Math.max(emittedOff, offResonance.photons.filter((p) => p.isEmitted).length);
    }
    expect(emittedOn).toBeGreaterThan(0);
    expect(emittedOff).toBe(0);
  });

  it("emits photons at the resonance frequency of the emitting nucleus", () => {
    const model = new NMRModel({ random: seeded(5) });
    model.powerProperty.value = 100;
    model.frequencyProperty.value = model.resonanceFrequencyProperty.value;
    run(model, 3);
    const emitted = model.photons.filter((photon) => photon.isEmitted);
    expect(emitted.length).toBeGreaterThan(0);
    for (const photon of emitted) {
      expect(photon.frequency).toBeCloseTo(model.resonanceFrequencyProperty.value, 10);
    }
  });

  it("selects a slice with a gradient: only nuclei near the resonant line absorb", () => {
    const model = new MRIModel({ random: seeded(7) });
    model.mainFieldProperty.value = 1;
    model.horizontalGradientProperty.value = MAGNET.GRADIENT_RANGE.max;
    model.powerProperty.value = 100;

    // Resonant at x = 3/4 of the chamber width.
    const xResonant = 0.75 * CHAMBER.WIDTH;
    model.frequencyProperty.value = model.resonanceFrequencyAt(xResonant, CHAMBER.HEIGHT / 2);
    const excitedXs: number[] = [];
    for (let i = 0; i < 600; i++) {
      model.stepModel(1 / 60);
      for (const nucleus of model.nuclei) {
        if (nucleus.relaxationCountdown !== null) {
          excitedXs.push(nucleus.position.x);
        }
      }
    }
    // The Gaussian line has tails, so a rare absorption far off the slice is allowed.
    expect(excitedXs.length).toBeGreaterThan(0);
    const inSlice = excitedXs.filter((x) => Math.abs(x - xResonant) < 3.5).length;
    expect(inSlice / excitedXs.length).toBeGreaterThan(0.9);
  });

  it("saturates but never inverts the populations under strong resonant RF", () => {
    const model = new NMRModel({ random: seeded(13) });
    model.powerProperty.value = 100;
    model.frequencyProperty.value = model.resonanceFrequencyProperty.value;
    let total = 0;
    let samples = 0;
    for (let i = 0; i < 1200; i++) {
      model.stepModel(1 / 60);
      if (i >= 300) {
        total += model.alignedCountProperty.value;
        samples++;
      }
    }
    const meanAligned = total / samples;
    expect(meanAligned).toBeGreaterThan(8);
    expect(meanAligned).toBeLessThan(targetAlignedCount(20, MAGNET.MAIN_FIELD_DEFAULT));
  });

  it("counts emitted photons at the detector", () => {
    const model = new MRIModel({ random: seeded(11) });
    model.powerProperty.value = 100;
    model.frequencyProperty.value = model.resonanceFrequencyProperty.value;
    let maxCount = 0;
    for (let i = 0; i < 240; i++) {
      model.stepModel(1 / 60);
      maxCount = Math.max(maxCount, model.detector?.countProperty.value ?? 0);
    }
    expect(maxCount).toBeGreaterThan(0);
  });

  it("snaps onto resonance only within the snap window", () => {
    const model = new NMRModel({ random: seeded() });
    const resonance = model.resonanceFrequencyProperty.value;
    model.frequencyProperty.value = resonance + RESONANCE.SNAP_WINDOW / 2;
    expect(model.snapFrequency()).toBe(true);
    expect(model.frequencyProperty.value).toBe(resonance);

    model.frequencyProperty.value = resonance + 2 * RESONANCE.SNAP_WINDOW;
    expect(model.snapFrequency()).toBe(false);

    model.frequencyProperty.value = 60;
    model.mainFieldProperty.value = 60 / NucleusType.HYDROGEN_1.gyromagneticRatio + 0.01;
    expect(model.snapMainField()).toBe(true);
    expect(model.resonanceFrequencyProperty.value).toBeCloseTo(60, 10);
  });

  it("adds and removes the tumour's nuclei", () => {
    const model = new MRIModel({ random: seeded() });
    const headCount = model.nuclei.length;
    model.tumorPresentProperty.value = true;
    expect(model.nuclei.length).toBe(headCount + tumorSpecs().length);
    model.tumorPresentProperty.value = false;
    expect(model.nuclei.length).toBe(headCount);
  });

  it("returns to its initial state on reset", () => {
    const model = new MRIModel({ random: seeded() });
    const initialAligned = model.alignedCountProperty.value;
    model.powerProperty.value = 100;
    model.mainFieldProperty.value = 2;
    model.tumorPresentProperty.value = true;
    run(model, 2);
    model.reset();
    expect(model.photons).toHaveLength(0);
    expect(model.nuclei.length).toBe(headSpecs().length);
    expect(model.alignedCountProperty.value).toBe(initialAligned);
    expect(model.hintVisibleProperty.value).toBe(true);
  });

  it("swings a flipped nucleus glyph to its new orientation", () => {
    const model = new NMRModel({ random: seeded() });
    const nucleus = model.nuclei[0];
    expect(nucleus).toBeDefined();
    if (nucleus) {
      nucleus.setSpinState(nucleus.isAligned ? "antiAligned" : "aligned", model.random);
      for (let i = 0; i < 180; i++) {
        nucleus.step(1 / 60, 0);
      }
      const target = nucleus.isAligned ? 0 : Math.PI;
      const difference = Math.atan2(Math.sin(nucleus.orientation - target), Math.cos(nucleus.orientation - target));
      expect(Math.abs(difference)).toBeLessThan(0.02);
    }
  });
});
