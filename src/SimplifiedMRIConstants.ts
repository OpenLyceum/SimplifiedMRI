/**
 * SimplifiedMRIConstants.ts
 *
 * Named constants for the simulation: layout sizes in view pixels and the model's
 * physical parameters.
 *
 * Model units (see doc/model.md):
 *   length     centimetres, y up, origin at the sample chamber's lower-left corner
 *   time       seconds of simulation time (the Relaxation screen keeps its tissue
 *              clock in milliseconds; see RELAXATION)
 *   field      tesla
 *   frequency  megahertz
 *
 * Several values are deliberately not to scale (photon speed, population excess,
 * relaxation time on the NMR/MRI screens, precession display rate). Each is flagged
 * where it is defined and listed in doc/model.md.
 */

import { Range } from "scenerystack/dot";
import { PhetFont } from "scenerystack/scenery-phet";
import SimplifiedMRINamespace from "./SimplifiedMRINamespace.js";

/** Margin (view px) between screen content and the layoutBounds edges. */
export const SCREEN_VIEW_MARGIN = 20;

/** Corner radius (view px) for every panel. */
export const PANEL_CORNER_RADIUS = 6;

/** Width (view px) of the controls inside the right-hand panels. */
export const CONTROL_WIDTH = 250;

/** Fonts shared by every screen. */
export const FONTS = {
  PANEL_TITLE: new PhetFont({ size: 15, weight: "bold" }),
  CONTROL_TITLE: new PhetFont({ size: 13, weight: "bold" }),
  CONTROL_LABEL: new PhetFont(13),
  READOUT: new PhetFont(13),
  READOUT_VALUE: new PhetFont({ size: 13, weight: "bold" }),
  SMALL: new PhetFont(11),
  TICK_LABEL: new PhetFont(10),
  AXIS_LABEL: new PhetFont(12),
  HINT: new PhetFont({ size: 14, weight: "bold" }),
} as const;

/** The sample chamber between the main-magnet coils (cm). Same 8:7 aspect as PhET's. */
export const CHAMBER = {
  WIDTH: 24,
  HEIGHT: 21,

  /** View scale for the chamber (px per cm). */
  VIEW_SCALE: 17,
} as const;

/** Main and gradient magnets. */
export const MAGNET = {
  /** Main field at the centre of the chamber (T). */
  MAIN_FIELD_RANGE: new Range(0, 3),
  MAIN_FIELD_DEFAULT: 0.75,

  /**
   * Gradient strength: the difference in field between the two edges of the chamber (T).
   * PhET's range was 0–0.08 T; 0.2 T spreads hydrogen's resonance across ±4.3 MHz, wide
   * enough for the 0.35 MHz line width to select a slice of the head.
   */
  GRADIENT_RANGE: new Range(0, 0.2),
  GRADIENT_DEFAULT: 0,
} as const;

/** The radio-wave source under the lower coil. */
export const RADIO = {
  /** Frequency range (MHz). PhET's 10–110 MHz left nitrogen-14 and sulfur-33 unreachable. */
  FREQUENCY_RANGE: new Range(1, 130),

  /** PhET's default: hydrogen at half the maximum field. */
  FREQUENCY_DEFAULT: 64,

  /** Power (percent of maximum). */
  POWER_RANGE: new Range(0, 100),
  POWER_DEFAULT: 0,

  /** Photons emitted per second at full power (PhET: 5 per 40 ms frame). */
  MAX_PHOTON_RATE: 125,

  /** Photon speed (cm/s). Not to scale: radio waves travel at c. */
  PHOTON_SPEED: 18,

  /** The source spans 1.1 chamber widths, centred under the chamber. */
  SOURCE_WIDTH_FACTOR: 1.1,

  /** Height (cm) at which incoming photons start, just under the chamber floor. */
  SOURCE_Y: -0.5,
} as const;

/** The resonance condition f = γB. */
export const RESONANCE = {
  /** Standard deviation of the Gaussian absorption line (MHz). */
  LINE_WIDTH: 0.35,

  /** Absorption probability for one photon passing one nucleus exactly on resonance. */
  PEAK_ABSORPTION_PROBABILITY: 0.6,

  /** A photon interacts with a nucleus it passes within this distance of (cm). */
  CAPTURE_RADIUS: 1.8,

  /** Releasing a slider within this many MHz of resonance snaps it onto resonance. */
  SNAP_WINDOW: 1.5,

  /** Line strength above which the energy diagram reports "on resonance". */
  INDICATOR_THRESHOLD: 0.5,
} as const;

/** Spin populations and relaxation on the NMR and MRI screens. */
export const SPIN = {
  /**
   * Fraction of nuclei in the aligned (lower-energy) state at zero field and at the maximum
   * field. Hugely exaggerated so the difference is visible: the real excess for protons at
   * 3 T and body temperature is about 1e-5 (see thermalAlignedExcess()).
   */
  ALIGNED_FRACTION_AT_ZERO_FIELD: 0.5,
  ALIGNED_FRACTION_AT_MAX_FIELD: 0.9,

  /** Mean time an excited nucleus waits before relaxing and emitting (s). PhET: 250 × 12 ms / 3.6. */
  RELAXATION_TIME: 0.83,

  /** Mean interval between thermal flips at zero field (s); grows with field as in PhET. */
  THERMAL_FLIP_INTERVAL: 1.67,

  /** Relative spread (standard deviation / mean) of the random waiting times. */
  WAIT_SPREAD: 0.5,

  /** Shortest relaxation wait, as a fraction of the mean, so a Gaussian draw never goes negative. */
  MIN_WAIT_FRACTION: 0.1,
} as const;

/** Visual behaviour of each nucleus glyph. */
export const NUCLEUS = {
  /** Angular spring constant pulling the glyph toward its spin direction (s^-2). PhET's, in seconds. */
  SPRING: 270,

  /** Angular damping (s^-1). */
  DAMPING: 10.5,

  /** Angular speed given to a glyph when its spin flips (rad/s), in a random direction. */
  FLIP_KICK: 9,

  /** Largest integration step for the glyph motion (s). */
  MAX_SUBSTEP: 1 / 120,

  /** Tilt of the spin axis from the field when precession is shown (rad). */
  PRECESSION_TILT: (25 * Math.PI) / 180,

  /**
   * Display precession rate: revolutions per second per MHz of Larmor frequency. Slowed by
   * about 4e7 so a 40 MHz nucleus turns once a second.
   */
  PRECESSION_DISPLAY_RATE: 1 / 40,

  /** Glyph size in the chamber (cm). */
  RADIUS: 0.75,
} as const;

/** Sample geometry (cm, chamber coordinates). */
export const SAMPLE = {
  /** The NMR screen's 5 × 4 grid of nuclei (PhET's layout for 20 nuclei). */
  NMR_NUCLEUS_COUNT: 20,

  /** Grid spacing of nuclei inside the head (cm). PhET: 40 units. */
  HEAD_SPACING: 2.4,

  /** Grid spacing of the denser tumour nuclei (cm). PhET: 20 units. */
  TUMOR_SPACING: 1.2,

  /** How far inside the tumour outline its nuclei must sit (cm). */
  TUMOR_INSET: 0.2,

  /** Width of each ear (cm), as in PhET (70 × 2/3 units). */
  EAR_WIDTH: 2.8,
  EAR_HEIGHT: 3,

  /** Height of the ears' centre above the chamber floor (cm). */
  EAR_CENTER_Y: 21 - 8.7,
} as const;

/** The MRI screen's detector to the right of the chamber (cm). */
export const DETECTOR = {
  /** Gap between the chamber's right edge and the detector's face. */
  GAP: 4.8,
  WIDTH: 1.5,

  /** Extent above and below the chamber (PhET: 2.4 and 3.6 cm, which ran into the source). */
  OVERHANG_TOP: 1.2,
  OVERHANG_BOTTOM: 1.2,

  /** Counts are reported over a sliding window of this length (s). */
  WINDOW: 1,
} as const;

/** The Relaxation screen. Tissue time is in milliseconds. */
export const RELAXATION = {
  /** Field for the tissue presets (T); their T1 and T2 are typical 1.5 T values. */
  FIELD: 1.5,

  /** Tissue milliseconds per wall-clock second at each speed. */
  SLOW_RATE: 20,
  NORMAL_RATE: 200,
  FAST_RATE: 1000,

  /** Duration of the animated RF pulse (wall-clock s). */
  PULSE_DURATION: 0.6,

  /** Flip angle range and default (degrees). */
  FLIP_ANGLE_RANGE: new Range(10, 180),
  FLIP_ANGLE_DEFAULT: 90,

  /** Custom T1 and T2 ranges (ms). */
  T1_RANGE: new Range(50, 5000),
  T2_RANGE: new Range(10, 3000),

  /** Number of spin isochromats drawn to show dephasing. */
  ISOCHROMAT_COUNT: 12,

  /** Lab-frame precession shown on the sphere (rev per wall-clock s). Slowed by about 1e8. */
  DISPLAY_PRECESSION_RATE: 0.6,

  /** Oscillations of the displayed signal across the transverse chart (slowed for display). */
  SIGNAL_CYCLES: 12,

  /** Recorded samples are thinned to at most this many per chart. */
  MAX_SAMPLES: 600,

  /** Chart windows are chosen from this list (ms). */
  WINDOW_CHOICES: [100, 200, 500, 1000, 2000, 5000, 10000, 20000],
} as const;

SimplifiedMRINamespace.register("SimplifiedMRIConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  CONTROL_WIDTH,
  CHAMBER,
  MAGNET,
  RADIO,
  RESONANCE,
  SPIN,
  NUCLEUS,
  SAMPLE,
  DETECTOR,
  RELAXATION,
});
