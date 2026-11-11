/**
 * resonancePhysics.ts
 *
 * Pure functions for the magnetic-resonance model: the Larmor (resonance) frequency, the
 * absorption line shape, the target spin populations, and the real thermal population
 * excess the sim exaggerates. No state, so every function is unit-tested directly.
 */

import { clamp } from "scenerystack/dot";
import { MAGNET, RESONANCE, SPIN } from "../../SimplifiedMRIConstants.js";

/** Planck constant (J s). */
const PLANCK = 6.62607015e-34;

/** Boltzmann constant (J/K). */
const BOLTZMANN = 1.380649e-23;

/**
 * Resonance (Larmor) frequency f = γB, with γ the gyromagnetic ratio over 2π.
 *
 * @param gyromagneticRatio - γ/2π (MHz/T)
 * @param field - magnetic field (T)
 * @returns frequency (MHz)
 */
export function larmorFrequency(gyromagneticRatio: number, field: number): number {
  return gyromagneticRatio * field;
}

/**
 * Relative strength of the Gaussian absorption line at a detuning from resonance:
 * 1 on resonance, falling to e^(-1/2) one line width away.
 *
 * @param detuning - photon frequency minus resonance frequency (MHz)
 */
export function lineStrength(detuning: number): number {
  const x = detuning / RESONANCE.LINE_WIDTH;
  return Math.exp(-0.5 * x * x);
}

/**
 * Probability that one photon passing one aligned nucleus is absorbed.
 *
 * @param detuning - photon frequency minus the nucleus's resonance frequency (MHz)
 */
export function absorptionProbability(detuning: number): number {
  return RESONANCE.PEAK_ABSORPTION_PROBABILITY * lineStrength(detuning);
}

/**
 * Target fraction of nuclei in the aligned (lower-energy) state at a field. Rises linearly
 * from 0.5 at zero field to 0.9 at the maximum field. This is the sim's deliberate
 * exaggeration; see thermalAlignedExcess() for the real value.
 *
 * @param field - magnetic field (T); clamped to the main-field range
 */
export function targetAlignedFraction(field: number): number {
  const range = MAGNET.MAIN_FIELD_RANGE;
  const t = clamp(field, range.min, range.max) / range.max;
  return (
    SPIN.ALIGNED_FRACTION_AT_ZERO_FIELD + (SPIN.ALIGNED_FRACTION_AT_MAX_FIELD - SPIN.ALIGNED_FRACTION_AT_ZERO_FIELD) * t
  );
}

/**
 * Real fractional excess (N_aligned − N_anti) / N of spin-½ nuclei in thermal equilibrium,
 * tanh(hf / 2kT). For protons at 3 T and 310 K this is about 1e-5, which is why the sim
 * exaggerates it.
 *
 * @param frequency - Larmor frequency (MHz)
 * @param temperature - temperature (K)
 */
export function thermalAlignedExcess(frequency: number, temperature: number): number {
  const energy = PLANCK * frequency * 1e6;
  return Math.tanh(energy / (2 * BOLTZMANN * temperature));
}

/**
 * Number of nuclei that should be aligned for a sample of a given size at a field, rounded
 * to the nearest whole nucleus.
 */
export function targetAlignedCount(nucleusCount: number, field: number): number {
  return Math.round(targetAlignedFraction(field) * nucleusCount);
}
