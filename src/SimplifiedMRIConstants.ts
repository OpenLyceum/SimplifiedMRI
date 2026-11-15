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

import { Dimension2, Range, Vector2 } from "scenerystack/dot";
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
  PREFERENCES_TITLE: new PhetFont({ size: 18, weight: "bold" }),
  PREFERENCES_LABEL: new PhetFont(16),
  PREFERENCES_DESCRIPTION: new PhetFont(14),
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
  /** Growth of the thermal wait at maximum field (dimensionless). */
  THERMAL_FIELD_FACTOR: 5,

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
  /** Angle below which a slowly moving glyph settles (rad). */
  ANGLE_TOLERANCE: 0.01,
  /** Maximum glyph angular speed for settling (rad/s). */
  ANGULAR_SPEED_TOLERANCE: 0.5,

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
  /** Fallback custom tissue times (ms). */
  FALLBACK_T1: 1000,
  FALLBACK_T2: 100,
  /** Chart duration in multiples of T1 or T2 (dimensionless). */
  WINDOW_TIME_CONSTANTS: 5,

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

/** Simulation time (s). */
export const TIME = {
  /** Time advanced by one step-button press (s). */
  STEP_DT: 1 / 25,
  /** Long frames are clamped to this duration (s). */
  MAX_DT: 0.1,
} as const;

/** Unit conversion factors. */
export const UNITS = {
  /** Hertz per megahertz. */
  HZ_PER_MHZ: 1e6,
} as const;

/** Isotope gyromagnetic ratio magnitudes |gamma|/2pi (MHz/T). */
export const GYROMAGNETIC_RATIOS = {
  HYDROGEN_1: 42.577,
  NITROGEN_14: 3.077,
  SODIUM_23: 11.262,
  CARBON_13: 10.708,
  OXYGEN_17: 5.772,
  SULFUR_33: 3.272,
  UNKNOWN: 12.103,
} as const;

/** Tissue T1/T2 presets at RELAXATION.FIELD (ms); references in Tissue.ts. */
export const TISSUE_TIMES = {
  FAT_T1: 340,
  FAT_T2: 60,
  WHITE_MATTER_T1: 880,
  WHITE_MATTER_T2: 70,
  GRAY_MATTER_T1: 1120,
  GRAY_MATTER_T2: 95,
  MUSCLE_T1: 1010,
  MUSCLE_T2: 45,
  BLOOD_T1: 1440,
  BLOOD_T2: 290,
  CSF_T1: 4000,
  CSF_T2: 2000,
} as const;

/** Tumour chamber fractions (dimensionless) and vertical radius (cm). */
export const TUMOR_GEOMETRY = {
  WIDTH_RADIUS_FRACTION: 0.15,
  HEIGHT_RADIUS: CHAMBER.HEIGHT / 12,
  TOP_INSET_FRACTION: 0.15,
} as const;

/** Main-field slider ticks and step (T), readout precision, and spacing (px). */
export const MAIN_FIELD_CONTROL = {
  MAJOR_TICKS: [0, 1, 2, 3],
  DELTA: 0.01,
  SPACING: 6,
} as const;

/** Radio controls: ticks/steps in MHz or percent power; layout lengths in px. */
export const RADIO_CONTROLS = {
  SLIDER_WIDTH: 170,
  POWER_TICKS: [0, 50, 100],
  FREQUENCY_DELTA: 0.1,
  VIEW_RADIO_WIDTH: 130,
  VIEW_LABEL_WIDTH: 120,
  SPACING: 10,
  Y_MARGIN: 8,
  FREQUENCY_TICKS: [1, 40, 80, 130],
  POWER_DELTA: 1,
  X_MARGIN: 10,
} as const;

/** Gradient slider ticks and step (T), readout precision, and spacing (px). */
export const GRADIENT_CONTROLS = {
  MAJOR_TICKS: [0, 0.1, 0.2],
  DELTA: 0.005,
  SPACING: 8,
} as const;

/** Relaxation-screen layout (px and radius factors), flip-angle ticks and step (degrees). */
export const RELAXATION_LAYOUT = {
  SPHERE_RADIUS: 125,
  MAJOR_TICKS: [10, 90, 180],
  SPHERE_X_FACTOR: 1.25,
  SPHERE_Y_FACTOR: 1.6,
  NOTE_WIDTH_FACTOR: 2.4,
  NOTE_SPACING: 4,
  NOTE_Y_FACTOR: 1.15,
  TOP_GAP: 14,
  CHART_X_FACTOR: 2.6,
  CHART_X_OFFSET: 70,
  COMBO_TEXT_INSET: 60,
  PANEL_SPACING: 8,
  FLIP_ANGLE_DELTA: 5,
  BUTTON_TEXT_INSET: 24,
  DISPLAY_SPACING: 6,
} as const;

/** Relaxation-time ticks (ms) and slider step (log10 ms). */
export const LOG_TIME_CONTROL = {
  MAJOR_TICKS: [10, 100, 1000],
  DELTA: 0.01,
} as const;

/** Shared control dimensions and spacing (px); arrow-button scale is dimensionless. */
export const CONTROLS = {
  THUMB_SIZE: new Dimension2(12, 22),
  STANDALONE_TRACK_SIZE: new Dimension2(150, 3),
  NUMBER_CONTROL_TRACK_SIZE: new Dimension2(110, 3),
  SLIDER_PADDING: 4,
  TITLE_WIDTH_INSET: 100,
  ARROW_BUTTON_SCALE: 0.75,
  TRACK_WIDTH_INSET: 60,
  TRACK_HEIGHT: 3,
  TICK_LENGTH: 8,
  CHECKBOX_TEXT_INSET: 30,
  CHECKBOX_BOX_WIDTH: 16,
  LABEL_SPACING: 6,
  BUTTON_TEXT_INSET: 24,
  RADIO_TEXT_INSET: 40,
  RADIO_RADIUS: 7,
  ARROW_BUTTON_SPACING: 3,
  VERTICAL_SPACING: 4,
  CHECKBOX_SPACING: 4,
} as const;

/** Panel margins and width inset (px). */
export const PANEL = {
  X_MARGIN: 12,
  Y_MARGIN: 10,
  CONTENT_WIDTH_INSET: 24,
} as const;

/** NMR/MRI magnet assembly, panels, hint and time-control layout (px). */
export const RESONANCE_LAYOUT = {
  TOP: 14,
  MAIN_COIL_THICKNESS: 22,
  GRADIENT_COIL_THICKNESS: 16,
  GAP: 3,

  /** Left edge of the chamber, leaving room for the vertical gradient coil. */
  CHAMBER_LEFT: 52,
  VERTICAL_COIL_LEFT: 22,

  /** Left edge of the right-hand column of panels. */
  RIGHT_COLUMN_LEFT: 600,
  PANEL_SPACING: 8,
  HINT_X_OFFSET: 110,
  HINT_Y_OFFSET: 4,
  TIME_CONTROL_GAP: 30,
} as const;

/** NMR panel layout (px). */
export const NMR_LAYOUT = {
  COMBO_TEXT_INSET: 60,
  PANEL_SPACING: 6,
} as const;

/** MRI gradient-coil segment/loop counts and panel spacing (px). */
export const MRI_LAYOUT = {
  HORIZONTAL_COIL_SEGMENTS: 8,
  COIL_LOOPS: 3,
  VERTICAL_COIL_SEGMENTS: 7,
  PANEL_SPACING: 6,
} as const;

/** Detector drawing (px), label height fraction, and full-glow count per detector window. */
export const DETECTOR_VIEW = {
  FULL_GLOW_RATE: 30,
  LINE_WIDTH: 1.5,
  STUB_HALF_HEIGHT: 8,
  STUB_WIDTH: 12,
  STUB_HEIGHT: 16,
  LABEL_HEIGHT_FACTOR: 0.6,
} as const;

/** Detector readout layout (px) and full-scale count per detector window. */
export const DETECTOR_PANEL = {
  FULL_SCALE_RATE: 40,
  BAR_HEIGHT: 10,
  READOUT_WIDTH: 110,
  BAR_WIDTH_INSET: 120,
  PANEL_SPACING: 6,
  READOUT_SPACING: 10,
} as const;

/** Field-arrow grid counts, side margin (cm), arrow dimensions (px) and length/spacing ratio. */
export const FIELD_ARROWS = {
  COLUMNS: 7,
  ROWS: 7,
  SIDE_MARGIN: 2,
  LENGTH_SPACING_FACTOR: 1.4,
  HEAD_HEIGHT: 12,
  HEAD_WIDTH: 16,
  TAIL_WIDTH: 7,
  LINE_WIDTH: 1,
} as const;

/** Hint bubble dimensions (px) and pointer horizontal fraction. */
export const HINT = {
  PADDING: 8,
  POINTER_LENGTH: 14,
  MAX_TEXT_WIDTH: 260,
  CORNER_RADIUS: 8,
  POINTER_X_FRACTION: 0.25,
  LINE_WIDTH: 1,
} as const;

/** Nucleus glyph proportions and hole opacity (dimensionless); stroke widths in px. */
export const GLYPH = {
  ARROW_LENGTH_FACTOR: 1.45,
  HEAD_LENGTH_FACTOR: 0.55,
  HEAD_WIDTH_FACTOR: 0.7,
  SHAFT_WIDTH_FACTOR: 0.22,
  TAIL_LENGTH_FACTOR: 0.75,
  ARROW_LINE_WIDTH: 0.6,
  BODY_RADIUS_FACTOR: 0.42,
  CONE_WIDTH_FACTOR: 0.42,
  LINE_WIDTH: 0.8,
  HOLE_Y_FACTOR: 0.05,
  HOLE_WIDTH_FACTOR: 0.32,
  HOLE_HEIGHT_FACTOR: 0.12,
  CONE_Y_FACTOR: 0.95,
  CONE_HEIGHT_FACTOR: 0.13,
  HOLE_OPACITY: 0.5,
} as const;

/** Coil loop count, drawing dimensions (px), corner-radius divisor, highlight ratio and opacity. */
export const COIL = {
  DEFAULT_LOOPS: 4,
  MIN_LOOP_RADIUS: 1.5,
  HIGHLIGHT_INSET: 3,
  HIGHLIGHT_OFFSET_FACTOR: 0.4,
  HIGHLIGHT_LINE_WIDTH: 0.8,
  MAX_GLOW_OPACITY: 0.55,
  CORNER_RADIUS_DIVISOR: 3,
  END_INSET: 1,
  LINE_WIDTH: 2,
} as const;

/** Photon geometry and clipping (cm), packet arc width and band overlap (px), counts (dimensionless). */
export const RADIO_VIEW = {
  BAND_COUNT: 48,
  MAX_BAND_OPACITY: 0.38,
  /** Display wavelength (cm) = this factor (cm MHz) / frequency (MHz). Not to scale. */
  WAVELENGTH_FACTOR: 360,
  /** Display wavelength limits (cm). */
  MIN_WAVELENGTH: 2.2,
  MAX_WAVELENGTH: 18,
  WIGGLE_SEGMENTS: 24,
  PACKET_ARCS: 3,
  PACKET_ARC_WIDTH: 5,
  PHOTON_LENGTH: 1.2,
  PHOTON_AMPLITUDE: 0.18,
  PACKET_HEIGHT: 0.9,
  CLIP_LEFT_MARGIN: 1.5,
  CLIP_TOP_MARGIN: 0.6,
  CLIP_BOTTOM_MARGIN: 0.8,
  BAND_OVERLAP: 0.5,
  PHOTON_LINE_WIDTH: 2,
  PHOTON_CYCLES: 2,
} as const;

/** Energy diagram dimensions (px), wave counts, opacity and icon/label scale factors. */
export const ENERGY_DIAGRAM = {
  HEIGHT: 170,
  AXIS_X: 10,
  SQUIGGLE_X: 42,
  LEVEL_LEFT: 62,

  ICON_RADIUS: 6,
  AXIS_HEAD_SIZE: 8,
  AXIS_TAIL_WIDTH: 1.5,
  AXIS_LABEL_HEIGHT_FACTOR: 0.6,
  LABEL_GAP: 4,
  LEVEL_HEIGHT_INSET: 30,
  LOWER_LEVEL_INSET: 12,
  RESONANT_LINE_WIDTH: 3,
  MIN_READOUT_Y: 14,
  MAX_WAVE_CYCLES: 9,
  WAVE_SEGMENTS: 60,
  WAVE_AMPLITUDE: 5,
  INACTIVE_OPACITY: 0.35,
  ICON_Y_FACTOR: 1.1,
  PANEL_SPACING: 6,
  LINE_WIDTH: 2,
} as const;

/** Chart frame dimensions (px) and target tick-division count. */
export const CHART_FRAME = {
  TARGET_DIVISIONS: 5,
  LABEL_EXTENT: 6,
  X_LABEL_GAP: 20,
  Y_LABEL_GAP: 32,
  TICK_EXTENT: 5,
  LINE_WIDTH: 1,
} as const;

/** Relaxation chart dimensions (px), normalized magnetization range and sampling/tick counts. */
export const RELAXATION_CHART = {
  WIDTH: 250,
  HEIGHT: 120,
  SIGNAL_SAMPLES_PER_CYCLE: 16,
  Y_RANGE: new Range(-1.05, 1.05),
  TARGET_DIVISIONS: 4,
  CURVE_WIDTH: 2.5,
  SIGNAL_WIDTH: 1.2,
  ZERO_LINE_WIDTH: 0.8,
  MARKER_LABEL_X_GAP: 3,
  MAX_TEXT_WIDTH: 300,
  SPACING: 6,
  MARKER_LABEL_TOP: 2,
  MARKER_DASH: [4, 3],
} as const;

/** Bloch-sphere unit-axis projections, radius factors, glyph dimensions (px), opacity and trail/segment counts. */
export const BLOCH_SPHERE = {
  PROJECTION_X: new Vector2(-0.55, 0.32),
  PROJECTION_Y: new Vector2(0.88, 0.16),
  PROJECTION_Z: new Vector2(0, -1),
  /** About two seconds of trail at 60 frames/s (points). */
  TRAIL_LENGTH: 120,
  OUTLINE_WIDTH: 1.5,
  MERIDIAN_WIDTH: 0.7,
  FIELD_TAIL_WIDTH: 3,
  AXIS_LENGTH_FACTOR: 1.25,
  AXIS_LABEL_FACTOR: 1.38,
  FIELD_LENGTH_FACTOR: 1.45,
  FIELD_TAIL_FACTOR: 0.2,
  FIELD_HEAD_SIZE: 12,
  FIELD_OPACITY: 0.8,
  FIELD_LABEL_GAP: 8,
  SPIN_HEAD_SIZE: 7,
  MAGNETIZATION_HEAD_SIZE: 16,
  MAGNETIZATION_TAIL_WIDTH: 5,
  MAGNETIZATION_LABEL_X_GAP: 6,
  MIN_ARROW_LENGTH: 2,
  MIN_TRANSVERSE_MAGNETIZATION: 0.02,
  CIRCLE_SEGMENTS: 72,
  MERIDIAN_DASH: [3, 4],
  PROJECTION_DASH: [3, 3],
  MAGNETIZATION_LINE_WIDTH: 0.8,
  PROJECTION_OPACITY: 0.7,
  SPIN_TAIL_WIDTH: 1.5,
  MAGNETIZATION_LABEL_Y_GAP: 2,
  AXIS_LINE_WIDTH: 1,
} as const;

/** Face geometry (cm), stroke widths and dash lengths (px), opacity (dimensionless). */
export const HEAD_VIEW = {
  BRAIN_CENTER_Y_OFFSET: 2.2,
  BRAIN_X_INSET: 1.5,
  BRAIN_Y_INSET: 3.2,
  EYE_Y_OFFSET: 1.5,
  EYE_X_OFFSET: 3.2,
  EYE_RADIUS_X: 1.2,
  EYE_RADIUS_Y: 0.5,
  EAR_LINE_WIDTH: 1.5,
  SKULL_LINE_WIDTH: 2,
  NOSE_TOP_Y_OFFSET: 0.5,
  NOSE_BOTTOM_X_OFFSET: 0.8,
  NOSE_BOTTOM_Y_OFFSET: 3.8,
  NOSE_END_X_OFFSET: 0.4,
  NOSE_END_Y_OFFSET: 4.1,
  MOUTH_HALF_WIDTH: 2.4,
  MOUTH_Y_OFFSET: 6.2,
  MOUTH_MID_Y_OFFSET: 7,
  FACE_LINE_WIDTH: 1.2,
  FACE_OPACITY: 0.6,
  TUMOR_DASH_LENGTH: 4,
  TUMOR_DASH_GAP: 3,
  TUMOR_LINE_WIDTH: 1,
} as const;

/** Preferences spacing and description width (px). */
export const PREFERENCES_LAYOUT = {
  CONTROL_SPACING: 8,
  DESCRIPTION_WIDTH: 520,
  SECTION_SPACING: 12,
} as const;

/** Physical constants in SI units (J s and J/K). */
export const PHYSICAL = {
  PLANCK: 6.62607015e-34,
  BOLTZMANN: 1.380649e-23,
} as const;

/** Home-screen icon drawing frame (px). */
export const SCREEN_ICONS = {
  WIDTH: 548,
  HEIGHT: 373,
} as const;

/** Icon geometry (px); counts, opacity and curve rates are dimensionless. */
export const ICON_WAVE = {
  SEGMENTS: 80,
} as const;

/** Icon geometry (px); counts, opacity and curve rates are dimensionless. */
export const NMR_ICON = {
  LOWER_Y: 290,
  UPPER_Y: 110,
  LINE_WIDTH: 8,
  LEVEL_LEFT: 170,
  LEVEL_RIGHT: 500,
  WAVE_X: 90,
  WAVE_CYCLES: 5,
  WAVE_AMPLITUDE: 22,
  LOWER_COUNT: 4,
  NUCLEUS_RADIUS: 26,
  NUCLEUS_LEFT: 215,
  NUCLEUS_SPACING: 75,
  NUCLEUS_Y_OFFSET: 30,
  UPPER_COUNT: 2,
} as const;

/** Icon geometry (px); counts, opacity and curve rates are dimensionless. */
export const MRI_ICON = {
  STRENGTH: 0.8,
  COIL_WIDTH: 420,
  COIL_THICKNESS: 40,
  COIL_LOOPS: 4,
  COIL_LEFT: 64,
  COIL_MARGIN: 12,
  HEAD_RADIUS_X: 110,
  HEAD_RADIUS_Y: 128,
  HEAD_LINE_WIDTH: 6,
  EAR_RADIUS_X: 20,
  EAR_RADIUS_Y: 30,
  EAR_LINE_WIDTH: 5,
  TUMOR_Y_OFFSET: 55,
  TUMOR_RADIUS_X: 42,
  TUMOR_RADIUS_Y: 22,
  NUCLEUS_RADIUS: 15,
  NUCLEUS_SPACING_X: 62,
  NUCLEUS_SPACING_Y: 52,
  TUMOR_X_OFFSET: 40,
  EAR_Y_OFFSET: 6,
  NUCLEUS_Y_OFFSET: 20,
  TUMOR_OPACITY: 0.8,
  EAR_X_OFFSET: 128,
} as const;

/** Icon geometry (px); counts, opacity and curve rates are dimensionless. */
export const RELAXATION_ICON = {
  SPHERE_X: 150,
  SPHERE_Y: 200,
  SPHERE_RADIUS: 120,
  LINE_WIDTH: 5,
  EQUATOR_HEIGHT_FACTOR: 0.3,
  EQUATOR_LINE_WIDTH: 4,
  FIELD_EXTENSION: 40,
  FIELD_HEAD_SIZE: 30,
  CURVE_LINE_WIDTH: 8,
  MAGNETIZATION_X: 90,
  MAGNETIZATION_Y: 70,
  MAGNETIZATION_HEAD_SIZE: 34,
  MAGNETIZATION_TAIL_WIDTH: 12,
  CHART_LEFT: 310,
  CHART_RIGHT: 530,
  CHART_TOP: 80,
  CHART_BOTTOM: 320,
  CURVE_SEGMENTS: 60,
  DECAY_RATE: 9,
  FIELD_TAIL_WIDTH: 8,
  RECOVERY_RATE: 4,
} as const;

/** Readout precision (decimal places). */
export const READOUT_PRECISION = {
  FIELD: 2,
  GRADIENT: 3,
  FREQUENCY: 1,
  POWER: 0,
  MAGNETIZATION: 2,
  RELAXATION_FIELD: 1,
  FLIP_ANGLE: 0,
  TIME: 0,
} as const;

/** Tick-spacing choices and rounding thresholds (dimensionless). */
export const CHART_TICKS = {
  DEFAULT_DIVISIONS: 5,
  UNIT_THRESHOLD: 1.5,
  TWO_THRESHOLD: 3,
  FIVE_THRESHOLD: 7,
  MAX_DECIMAL_PLACES: 4,
} as const;

SimplifiedMRINamespace.register("SimplifiedMRIConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  CONTROL_WIDTH,
  FONTS,
  CHAMBER,
  MAGNET,
  RADIO,
  RESONANCE,
  SPIN,
  NUCLEUS,
  SAMPLE,
  DETECTOR,
  RELAXATION,
  TIME,
  UNITS,
  GYROMAGNETIC_RATIOS,
  TISSUE_TIMES,
  TUMOR_GEOMETRY,
  MAIN_FIELD_CONTROL,
  RADIO_CONTROLS,
  GRADIENT_CONTROLS,
  RELAXATION_LAYOUT,
  LOG_TIME_CONTROL,
  CONTROLS,
  PANEL,
  RESONANCE_LAYOUT,
  NMR_LAYOUT,
  MRI_LAYOUT,
  DETECTOR_VIEW,
  DETECTOR_PANEL,
  FIELD_ARROWS,
  HINT,
  GLYPH,
  COIL,
  RADIO_VIEW,
  ENERGY_DIAGRAM,
  CHART_FRAME,
  RELAXATION_CHART,
  BLOCH_SPHERE,
  HEAD_VIEW,
  PREFERENCES_LAYOUT,
  PHYSICAL,
  SCREEN_ICONS,
  ICON_WAVE,
  NMR_ICON,
  MRI_ICON,
  RELAXATION_ICON,
  READOUT_PRECISION,
  CHART_TICKS,
});
