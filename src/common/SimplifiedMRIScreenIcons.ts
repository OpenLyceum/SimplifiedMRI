/**
 * SimplifiedMRIScreenIcons.ts
 *
 * Home-screen and navigation-bar icons, drawn in a 548 × 373 frame (the joist aspect ratio):
 *
 *   NMR          two energy levels with nuclei on them and a radio-wave squiggle
 *   MRI          a head between gold magnet coils
 *   Relaxation   a magnetization arrow on a sphere beside a recovery curve
 */

import { NumberProperty } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Line, Node, Path, Rectangle } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { ScreenIcon } from "scenerystack/sim";
import SimplifiedMRIColors from "../SimplifiedMRIColors.js";
import { ICON_WAVE, MRI_ICON, NMR_ICON, RELAXATION_ICON, SCREEN_ICONS } from "../SimplifiedMRIConstants.js";
import { CoilNode } from "./view/CoilNode.js";
import { NucleusGlyph } from "./view/NucleusGlyph.js";

function background(): Rectangle {
  return new Rectangle(0, 0, SCREEN_ICONS.WIDTH, SCREEN_ICONS.HEIGHT, {
    fill: SimplifiedMRIColors.backgroundColorProperty,
  });
}

function iconFrom(content: Node): ScreenIcon {
  return new ScreenIcon(content, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: SimplifiedMRIColors.backgroundColorProperty,
  });
}

/** Vertical sine squiggle from (x, yBottom) up to yTop. */
function squiggle(x: number, yBottom: number, yTop: number, cycles: number, amplitude: number): Shape {
  const shape = new Shape();
  for (let i = 0; i <= ICON_WAVE.SEGMENTS; i++) {
    const s = i / ICON_WAVE.SEGMENTS;
    const px = x + amplitude * Math.sin(2 * Math.PI * cycles * s);
    const py = yBottom + (yTop - yBottom) * s;
    if (i === 0) {
      shape.moveTo(px, py);
    } else {
      shape.lineTo(px, py);
    }
  }
  return shape;
}

export function createNMRIcon(): ScreenIcon {
  const lowerY = NMR_ICON.LOWER_Y;
  const upperY = NMR_ICON.UPPER_Y;
  const levelOptions = { stroke: SimplifiedMRIColors.energyLevelResonantColorProperty, lineWidth: NMR_ICON.LINE_WIDTH };
  const children: Node[] = [
    background(),
    new Line(NMR_ICON.LEVEL_LEFT, lowerY, NMR_ICON.LEVEL_RIGHT, lowerY, levelOptions),
    new Line(NMR_ICON.LEVEL_LEFT, upperY, NMR_ICON.LEVEL_RIGHT, upperY, levelOptions),
    new Path(squiggle(NMR_ICON.WAVE_X, lowerY, upperY, NMR_ICON.WAVE_CYCLES, NMR_ICON.WAVE_AMPLITUDE), {
      stroke: SimplifiedMRIColors.radioWaveColorProperty,
      lineWidth: NMR_ICON.LINE_WIDTH,
    }),
  ];
  for (let i = 0; i < NMR_ICON.LOWER_COUNT; i++) {
    children.push(
      new NucleusGlyph(NMR_ICON.NUCLEUS_RADIUS, SimplifiedMRIColors.hydrogen1ColorProperty, {
        x: NMR_ICON.NUCLEUS_LEFT + i * NMR_ICON.NUCLEUS_SPACING,
        y: lowerY - NMR_ICON.NUCLEUS_Y_OFFSET,
      }),
    );
  }
  for (let i = 0; i < NMR_ICON.UPPER_COUNT; i++) {
    children.push(
      new NucleusGlyph(NMR_ICON.NUCLEUS_RADIUS, SimplifiedMRIColors.hydrogen1ColorProperty, {
        x: NMR_ICON.NUCLEUS_LEFT + i * NMR_ICON.NUCLEUS_SPACING,
        y: upperY - NMR_ICON.NUCLEUS_Y_OFFSET,
        rotation: Math.PI,
      }),
    );
  }
  return iconFrom(new Node({ children }));
}

export function createMRIIcon(): ScreenIcon {
  const fullProperty = new NumberProperty(MRI_ICON.STRENGTH);
  const upper = new CoilNode(MRI_ICON.COIL_WIDTH, MRI_ICON.COIL_THICKNESS, "horizontal", fullProperty, {
    loops: MRI_ICON.COIL_LOOPS,
    left: MRI_ICON.COIL_LEFT,
    top: MRI_ICON.COIL_MARGIN,
  });
  const lower = new CoilNode(MRI_ICON.COIL_WIDTH, MRI_ICON.COIL_THICKNESS, "horizontal", fullProperty, {
    loops: MRI_ICON.COIL_LOOPS,
    left: MRI_ICON.COIL_LEFT,
    bottom: SCREEN_ICONS.HEIGHT - MRI_ICON.COIL_MARGIN,
  });
  const headFill = SimplifiedMRIColors.headStrokeColorProperty;
  const head = new Path(
    Shape.ellipse(SCREEN_ICONS.WIDTH / 2, SCREEN_ICONS.HEIGHT / 2, MRI_ICON.HEAD_RADIUS_X, MRI_ICON.HEAD_RADIUS_Y, 0),
    {
      fill: SimplifiedMRIColors.headFillColorProperty,
      stroke: headFill,
      lineWidth: MRI_ICON.HEAD_LINE_WIDTH,
    },
  );
  const ears = [SCREEN_ICONS.WIDTH / 2 - MRI_ICON.EAR_X_OFFSET, SCREEN_ICONS.WIDTH / 2 + MRI_ICON.EAR_X_OFFSET].map(
    (x) =>
      new Path(
        Shape.ellipse(
          x,
          SCREEN_ICONS.HEIGHT / 2 + MRI_ICON.EAR_Y_OFFSET,
          MRI_ICON.EAR_RADIUS_X,
          MRI_ICON.EAR_RADIUS_Y,
          0,
        ),
        {
          fill: SimplifiedMRIColors.headFillColorProperty,
          stroke: headFill,
          lineWidth: MRI_ICON.EAR_LINE_WIDTH,
        },
      ),
  );
  const tumor = new Path(
    Shape.ellipse(
      SCREEN_ICONS.WIDTH / 2 + MRI_ICON.TUMOR_X_OFFSET,
      SCREEN_ICONS.HEIGHT / 2 - MRI_ICON.TUMOR_Y_OFFSET,
      MRI_ICON.TUMOR_RADIUS_X,
      MRI_ICON.TUMOR_RADIUS_Y,
      0,
    ),
    {
      fill: SimplifiedMRIColors.tumorNucleusColorProperty,
      opacity: MRI_ICON.TUMOR_OPACITY,
    },
  );
  const nuclei: Node[] = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      nuclei.push(
        new NucleusGlyph(MRI_ICON.NUCLEUS_RADIUS, SimplifiedMRIColors.hydrogen1ColorProperty, {
          x: SCREEN_ICONS.WIDTH / 2 + i * MRI_ICON.NUCLEUS_SPACING_X,
          y: SCREEN_ICONS.HEIGHT / 2 + MRI_ICON.NUCLEUS_Y_OFFSET + j * MRI_ICON.NUCLEUS_SPACING_Y,
        }),
      );
    }
  }
  return iconFrom(new Node({ children: [background(), ...ears, head, tumor, ...nuclei, upper, lower] }));
}

export function createRelaxationIcon(): ScreenIcon {
  const cx = RELAXATION_ICON.SPHERE_X;
  const cy = RELAXATION_ICON.SPHERE_Y;
  const r = RELAXATION_ICON.SPHERE_RADIUS;
  const sphere = new Path(Shape.circle(cx, cy, r), {
    stroke: SimplifiedMRIColors.sphereColorProperty,
    lineWidth: RELAXATION_ICON.LINE_WIDTH,
  });
  const equator = new Path(Shape.ellipse(cx, cy, r, r * RELAXATION_ICON.EQUATOR_HEIGHT_FACTOR, 0), {
    stroke: SimplifiedMRIColors.sphereColorProperty,
    lineWidth: RELAXATION_ICON.EQUATOR_LINE_WIDTH,
  });
  const field = new ArrowNode(cx, cy, cx, cy - r - RELAXATION_ICON.FIELD_EXTENSION, {
    headHeight: RELAXATION_ICON.FIELD_HEAD_SIZE,
    headWidth: RELAXATION_ICON.FIELD_HEAD_SIZE,
    tailWidth: RELAXATION_ICON.FIELD_TAIL_WIDTH,
    fill: SimplifiedMRIColors.fieldColorProperty,
    stroke: null,
  });
  const magnetization = new ArrowNode(
    cx,
    cy,
    cx + RELAXATION_ICON.MAGNETIZATION_X,
    cy - RELAXATION_ICON.MAGNETIZATION_Y,
    {
      headHeight: RELAXATION_ICON.MAGNETIZATION_HEAD_SIZE,
      headWidth: RELAXATION_ICON.MAGNETIZATION_HEAD_SIZE,
      tailWidth: RELAXATION_ICON.MAGNETIZATION_TAIL_WIDTH,
      fill: SimplifiedMRIColors.magnetizationColorProperty,
      stroke: null,
    },
  );

  // Recovery and decay curves on simple axes.
  const left = RELAXATION_ICON.CHART_LEFT;
  const right = RELAXATION_ICON.CHART_RIGHT;
  const top = RELAXATION_ICON.CHART_TOP;
  const bottom = RELAXATION_ICON.CHART_BOTTOM;
  const axes = new Path(new Shape().moveTo(left, top).lineTo(left, bottom).lineTo(right, bottom), {
    stroke: SimplifiedMRIColors.chartAxisColorProperty,
    lineWidth: RELAXATION_ICON.LINE_WIDTH,
  });
  const recovery = new Shape();
  const decay = new Shape();
  for (let i = 0; i <= RELAXATION_ICON.CURVE_SEGMENTS; i++) {
    const s = i / RELAXATION_ICON.CURVE_SEGMENTS;
    const x = left + (right - left) * s;
    const yRecovery = bottom - (bottom - top) * (1 - Math.exp(-RELAXATION_ICON.RECOVERY_RATE * s));
    const yDecay = bottom - (bottom - top) * Math.exp(-RELAXATION_ICON.DECAY_RATE * s);
    if (i === 0) {
      recovery.moveTo(x, yRecovery);
      decay.moveTo(x, yDecay);
    } else {
      recovery.lineTo(x, yRecovery);
      decay.lineTo(x, yDecay);
    }
  }
  return iconFrom(
    new Node({
      children: [
        background(),
        sphere,
        equator,
        field,
        magnetization,
        axes,
        new Path(recovery, {
          stroke: SimplifiedMRIColors.mzCurveColorProperty,
          lineWidth: RELAXATION_ICON.CURVE_LINE_WIDTH,
        }),
        new Path(decay, {
          stroke: SimplifiedMRIColors.mxyCurveColorProperty,
          lineWidth: RELAXATION_ICON.CURVE_LINE_WIDTH,
        }),
      ],
    }),
  );
}
