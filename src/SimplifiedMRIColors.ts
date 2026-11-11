/**
 * SimplifiedMRIColors.ts
 *
 * Every colour in the simulation, as a ProfileColorProperty with a default (dark) and a
 * projector (light) value. Never hard-code a colour in a view; add it here.
 */

import { ProfileColorProperty } from "scenerystack/scenery";
import SimplifiedMRINamespace from "./SimplifiedMRINamespace.js";

const SimplifiedMRIColors = {
  // ── Chrome ──────────────────────────────────────────────────────────────────
  backgroundColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),
  accentColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1565c0",
  }),
  panelBackgroundColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),
  panelBorderColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "panelBorder", {
    default: "#0f3460",
    projector: "#999999",
  }),
  textColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),
  secondaryTextColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "secondaryText", {
    default: "#a8b3c7",
    projector: "#555555",
  }),
  controlSurfaceColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "controlSurfaceDisabled", {
    default: "#cccccc",
    projector: "#cccccc",
  }),
  controlSurfaceTextColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),
  hintFillColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "hintFill", {
    default: "#fff59d",
    projector: "#fff59d",
  }),
  hintTextColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "hintText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),

  // ── Magnet and chamber ──────────────────────────────────────────────────────
  chamberFillColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "chamberFill", {
    default: "#10182b",
    projector: "#eef3f8",
  }),
  chamberStrokeColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "chamberStroke", {
    default: "#3a4a6b",
    projector: "#9aa8b8",
  }),
  coilColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "coil", {
    default: "#c9962b",
    projector: "#b8860b",
  }),
  coilHighlightColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "coilHighlight", {
    default: "#ffe08a",
    projector: "#ffd34d",
  }),
  coilShadowColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "coilShadow", {
    default: "#6b4e12",
    projector: "#7a5a10",
  }),
  gradientCoilColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "gradientCoil", {
    default: "#b87333",
    projector: "#a0522d",
  }),
  fieldArrowFillColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "fieldArrowFill", {
    default: "rgba(220,230,255,0.10)",
    projector: "rgba(40,60,120,0.06)",
  }),
  fieldArrowStrokeColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "fieldArrowStroke", {
    default: "rgba(200,215,255,0.55)",
    projector: "rgba(40,60,120,0.45)",
  }),

  // ── Nuclei ──────────────────────────────────────────────────────────────────
  nucleusArrowColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "nucleusArrow", {
    default: "#ff5252",
    projector: "#d32f2f",
  }),
  nucleusStrokeColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "nucleusStroke", {
    default: "#0b1020",
    projector: "#333333",
  }),
  precessionConeColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "precessionCone", {
    default: "rgba(255,255,255,0.35)",
    projector: "rgba(0,0,0,0.30)",
  }),
  hydrogen1ColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "hydrogen1", {
    default: "#4dd0e1",
    projector: "#00acc1",
  }),
  nitrogen14ColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "nitrogen14", {
    default: "#7986cb",
    projector: "#3f51b5",
  }),
  sodium23ColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "sodium23", {
    default: "#ba68c8",
    projector: "#8e24aa",
  }),
  carbon13ColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "carbon13", {
    default: "#bdbdbd",
    projector: "#616161",
  }),
  oxygen17ColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "oxygen17", {
    default: "#ef9a9a",
    projector: "#e53935",
  }),
  sulfur33ColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "sulfur33", {
    default: "#fff176",
    projector: "#c0a000",
  }),
  unknownColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "unknown", {
    default: "#a1887f",
    projector: "#6d4c41",
  }),
  tumorNucleusColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "tumorNucleus", {
    default: "#aed581",
    projector: "#558b2f",
  }),

  // ── Radio waves and photons ─────────────────────────────────────────────────
  radioWaveColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "radioWave", {
    default: "#66bb6a",
    projector: "#2e7d32",
  }),
  emittedPhotonColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "emittedPhoton", {
    default: "#ffb74d",
    projector: "#ef6c00",
  }),
  sourceFillColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "sourceFill", {
    default: "#24324f",
    projector: "#dfe7ef",
  }),

  // ── Head, tumour, detector ──────────────────────────────────────────────────
  headFillColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "headFill", {
    default: "rgba(233,190,160,0.30)",
    projector: "rgba(205,150,120,0.35)",
  }),
  headStrokeColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "headStroke", {
    default: "#e9bea0",
    projector: "#a0705a",
  }),
  brainFillColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "brainFill", {
    default: "rgba(240,170,180,0.20)",
    projector: "rgba(200,110,130,0.18)",
  }),
  tumorFillColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "tumorFill", {
    default: "rgba(174,213,129,0.30)",
    projector: "rgba(85,139,47,0.25)",
  }),
  detectorColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "detector", {
    default: "#5c6b80",
    projector: "#8a96a6",
  }),
  detectorGlowColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "detectorGlow", {
    default: "#ffb74d",
    projector: "#ef6c00",
  }),

  // ── Energy diagram ──────────────────────────────────────────────────────────
  energyLevelColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "energyLevel", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),
  energyLevelResonantColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "energyLevelResonant", {
    default: "#66bb6a",
    projector: "#2e7d32",
  }),

  // ── Relaxation screen ───────────────────────────────────────────────────────
  sphereColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "sphere", {
    default: "rgba(160,190,255,0.35)",
    projector: "rgba(40,70,140,0.35)",
  }),
  axisColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "axis", {
    default: "#a8b3c7",
    projector: "#555555",
  }),
  magnetizationColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "magnetization", {
    default: "#ff5252",
    projector: "#d32f2f",
  }),
  isochromatColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "isochromat", {
    default: "rgba(79,195,247,0.75)",
    projector: "rgba(21,101,192,0.7)",
  }),
  trailColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "trail", {
    default: "rgba(255,82,82,0.45)",
    projector: "rgba(211,47,47,0.4)",
  }),
  fieldColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "field", {
    default: "#c9962b",
    projector: "#b8860b",
  }),
  mzCurveColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "mzCurve", {
    default: "#ff8a65",
    projector: "#d84315",
  }),
  mxyCurveColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "mxyCurve", {
    default: "#4fc3f7",
    projector: "#1565c0",
  }),
  signalCurveColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "signalCurve", {
    default: "rgba(102,187,106,0.85)",
    projector: "rgba(46,125,50,0.85)",
  }),
  chartBackgroundColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "chartBackground", {
    default: "#10182b",
    projector: "#ffffff",
  }),
  chartGridColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "chartGrid", {
    default: "#24324f",
    projector: "#e3e3e3",
  }),
  chartAxisColorProperty: new ProfileColorProperty(SimplifiedMRINamespace, "chartAxis", {
    default: "#a8b3c7",
    projector: "#555555",
  }),
};

SimplifiedMRINamespace.register("SimplifiedMRIColors", SimplifiedMRIColors);

export default SimplifiedMRIColors;
