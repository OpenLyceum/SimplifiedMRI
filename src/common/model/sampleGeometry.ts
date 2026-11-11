/**
 * sampleGeometry.ts
 *
 * Where the nuclei sit: the NMR screen's rectangular grid, and the MRI screen's head and
 * tumour. Ports PhET's SampleChamber.createDipoles and MriUtil.createDipolesForEllipse,
 * converted from PhET's pixel units (400 × 350 chamber) to centimetres (24 × 21).
 */

import { Vector2 } from "scenerystack/dot";
import { CHAMBER, RESONANCE, SAMPLE } from "../../SimplifiedMRIConstants.js";
import type { SpinState } from "./Nucleus.js";
import type { NucleusSpec } from "./ResonanceModel.js";

/** An axis-aligned ellipse (cm). */
export type Ellipse = { centerX: number; centerY: number; radiusX: number; radiusY: number };

/** The head's skull: full chamber height, inset from the sides by the ears' width. */
export const SKULL: Ellipse = {
  centerX: CHAMBER.WIDTH / 2,
  centerY: CHAMBER.HEIGHT / 2,
  radiusX: CHAMBER.WIDTH / 2 - SAMPLE.EAR_WIDTH,
  radiusY: CHAMBER.HEIGHT / 2,
};

/** The two ears, centred in the gaps between skull and chamber walls. */
export const EARS: readonly Ellipse[] = [
  {
    centerX: SAMPLE.EAR_WIDTH / 2,
    centerY: SAMPLE.EAR_CENTER_Y,
    radiusX: SAMPLE.EAR_WIDTH / 2,
    radiusY: SAMPLE.EAR_HEIGHT / 2,
  },
  {
    centerX: CHAMBER.WIDTH - SAMPLE.EAR_WIDTH / 2,
    centerY: SAMPLE.EAR_CENTER_Y,
    radiusX: SAMPLE.EAR_WIDTH / 2,
    radiusY: SAMPLE.EAR_HEIGHT / 2,
  },
];

/**
 * The tumour, placed as PhET placed it relative to the head's bounds: left edge at the
 * middle, 15% down from the top, 30% of the width and a sixth of the height.
 */
export const TUMOR: Ellipse = {
  centerX: CHAMBER.WIDTH * 0.5 + CHAMBER.WIDTH * 0.15,
  centerY: CHAMBER.HEIGHT - CHAMBER.HEIGHT * 0.15 - CHAMBER.HEIGHT / 12,
  radiusX: CHAMBER.WIDTH * 0.15,
  radiusY: CHAMBER.HEIGHT / 12,
};

/** Alternating initial spin states, as in PhET. */
function alternatingState(index: number): SpinState {
  return index % 2 === 0 ? "aligned" : "antiAligned";
}

/**
 * The NMR screen's grid: the narrowest column count whose columns-to-rows ratio reaches the
 * chamber's aspect ratio, nuclei evenly spaced with a half-gap margin (PhET: 5 × 4).
 */
export function nmrGridSpecs(count = SAMPLE.NMR_NUCLEUS_COUNT): NucleusSpec[] {
  const aspect = CHAMBER.WIDTH / CHAMBER.HEIGHT;
  let columns = 0;
  let rows = 0;
  do {
    columns++;
    rows = Math.floor(count / columns);
  } while (columns / rows < aspect);

  const columnSpacing = CHAMBER.WIDTH / (columns + 1);
  const rowSpacing = CHAMBER.HEIGHT / (rows + 1);
  const specs: NucleusSpec[] = [];
  for (let row = 1; row <= rows; row++) {
    for (let column = 1; column <= columns; column++) {
      specs.push({
        position: new Vector2(column * columnSpacing, CHAMBER.HEIGHT - row * rowSpacing),
        spinState: alternatingState(specs.length),
      });
    }
  }
  return specs;
}

/** True if the point is inside the ellipse. */
export function ellipseContains(ellipse: Ellipse, x: number, y: number): boolean {
  const u = (x - ellipse.centerX) / ellipse.radiusX;
  const v = (y - ellipse.centerY) / ellipse.radiusY;
  return u * u + v * v < 1;
}

/**
 * Grid points inside an ellipse, centred on it and spaced `spacing` apart, keeping only
 * points at least half a capture radius inside the edge (PhET's "working bounds").
 */
export function ellipseGridPositions(ellipse: Ellipse, spacing: number): Vector2[] {
  const inset = RESONANCE.CAPTURE_RADIUS / 2;
  const working: Ellipse = {
    centerX: ellipse.centerX,
    centerY: ellipse.centerY,
    radiusX: ellipse.radiusX - inset,
    radiusY: ellipse.radiusY - inset,
  };
  const positions: Vector2[] = [];
  const columns = Math.floor(ellipse.radiusX / spacing);
  const rows = Math.floor(ellipse.radiusY / spacing);
  for (let j = -rows; j <= rows; j++) {
    for (let i = -columns; i <= columns; i++) {
      const x = ellipse.centerX + i * spacing;
      const y = ellipse.centerY + j * spacing;
      if (working.radiusX > 0 && working.radiusY > 0 && ellipseContains(working, x, y)) {
        positions.push(new Vector2(x, y));
      }
    }
  }
  return positions;
}

/** The head's nuclei: a grid in the skull plus one at the centre of each ear. */
export function headSpecs(): NucleusSpec[] {
  const positions = [
    ...ellipseGridPositions(SKULL, SAMPLE.HEAD_SPACING),
    ...EARS.map((ear) => new Vector2(ear.centerX, ear.centerY)),
  ];
  return positions.map((position, index) => ({ position, spinState: alternatingState(index) }));
}

/**
 * The tumour's denser nuclei: the points of a lattice at half the head's spacing, anchored on
 * the head's own lattice, that fall inside the tumour and are not already head nuclei. The
 * tumour region therefore ends up with four times the density of the rest of the head.
 * (PhET placed a separate grid, which overlapped the head's nuclei; with its inset the thin
 * tumour held a single row of five.)
 */
export function tumorSpecs(): NucleusSpec[] {
  const spacing = SAMPLE.TUMOR_SPACING;
  const working: Ellipse = {
    centerX: TUMOR.centerX,
    centerY: TUMOR.centerY,
    radiusX: TUMOR.radiusX - SAMPLE.TUMOR_INSET,
    radiusY: TUMOR.radiusY - SAMPLE.TUMOR_INSET,
  };
  const iMin = Math.ceil((working.centerX - working.radiusX - SKULL.centerX) / spacing);
  const iMax = Math.floor((working.centerX + working.radiusX - SKULL.centerX) / spacing);
  const jMin = Math.ceil((working.centerY - working.radiusY - SKULL.centerY) / spacing);
  const jMax = Math.floor((working.centerY + working.radiusY - SKULL.centerY) / spacing);
  const specs: NucleusSpec[] = [];
  for (let j = jMin; j <= jMax; j++) {
    for (let i = iMin; i <= iMax; i++) {
      const onHeadLattice = i % 2 === 0 && j % 2 === 0;
      const x = SKULL.centerX + i * spacing;
      const y = SKULL.centerY + j * spacing;
      if (!onHeadLattice && ellipseContains(working, x, y)) {
        specs.push({ position: new Vector2(x, y), spinState: alternatingState(specs.length), isTumor: true });
      }
    }
  }
  return specs;
}
