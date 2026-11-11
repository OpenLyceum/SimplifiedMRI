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
import { CoilNode } from "./view/CoilNode.js";
import { NucleusGlyph } from "./view/NucleusGlyph.js";

const W = 548;
const H = 373;

function background(): Rectangle {
  return new Rectangle(0, 0, W, H, { fill: SimplifiedMRIColors.backgroundColorProperty });
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
  for (let i = 0; i <= 80; i++) {
    const s = i / 80;
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
  const lowerY = 290;
  const upperY = 110;
  const levelOptions = { stroke: SimplifiedMRIColors.energyLevelResonantColorProperty, lineWidth: 8 };
  const children: Node[] = [
    background(),
    new Line(170, lowerY, 500, lowerY, levelOptions),
    new Line(170, upperY, 500, upperY, levelOptions),
    new Path(squiggle(90, lowerY, upperY, 5, 22), {
      stroke: SimplifiedMRIColors.radioWaveColorProperty,
      lineWidth: 8,
    }),
  ];
  for (let i = 0; i < 4; i++) {
    children.push(
      new NucleusGlyph(26, SimplifiedMRIColors.hydrogen1ColorProperty, { x: 215 + i * 75, y: lowerY - 30 }),
    );
  }
  for (let i = 0; i < 2; i++) {
    children.push(
      new NucleusGlyph(26, SimplifiedMRIColors.hydrogen1ColorProperty, {
        x: 215 + i * 75,
        y: upperY - 30,
        rotation: Math.PI,
      }),
    );
  }
  return iconFrom(new Node({ children }));
}

export function createMRIIcon(): ScreenIcon {
  const full = new NumberProperty(0.8);
  const upper = new CoilNode(420, 40, "horizontal", full, { loops: 4, left: 64, top: 12 });
  const lower = new CoilNode(420, 40, "horizontal", full, { loops: 4, left: 64, bottom: H - 12 });
  const headFill = SimplifiedMRIColors.headStrokeColorProperty;
  const head = new Path(Shape.ellipse(W / 2, H / 2, 110, 128, 0), {
    fill: SimplifiedMRIColors.headFillColorProperty,
    stroke: headFill,
    lineWidth: 6,
  });
  const ears = [W / 2 - 128, W / 2 + 128].map(
    (x) =>
      new Path(Shape.ellipse(x, H / 2 + 6, 20, 30, 0), {
        fill: SimplifiedMRIColors.headFillColorProperty,
        stroke: headFill,
        lineWidth: 5,
      }),
  );
  const tumor = new Path(Shape.ellipse(W / 2 + 40, H / 2 - 55, 42, 22, 0), {
    fill: SimplifiedMRIColors.tumorNucleusColorProperty,
    opacity: 0.8,
  });
  const nuclei: Node[] = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      nuclei.push(
        new NucleusGlyph(15, SimplifiedMRIColors.hydrogen1ColorProperty, { x: W / 2 + i * 62, y: H / 2 + 20 + j * 52 }),
      );
    }
  }
  return iconFrom(new Node({ children: [background(), ...ears, head, tumor, ...nuclei, upper, lower] }));
}

export function createRelaxationIcon(): ScreenIcon {
  const cx = 150;
  const cy = 200;
  const r = 120;
  const sphere = new Path(Shape.circle(cx, cy, r), { stroke: SimplifiedMRIColors.sphereColorProperty, lineWidth: 5 });
  const equator = new Path(Shape.ellipse(cx, cy, r, r * 0.3, 0), {
    stroke: SimplifiedMRIColors.sphereColorProperty,
    lineWidth: 4,
  });
  const field = new ArrowNode(cx, cy, cx, cy - r - 40, {
    headHeight: 30,
    headWidth: 30,
    tailWidth: 8,
    fill: SimplifiedMRIColors.fieldColorProperty,
    stroke: null,
  });
  const magnetization = new ArrowNode(cx, cy, cx + 90, cy - 70, {
    headHeight: 34,
    headWidth: 34,
    tailWidth: 12,
    fill: SimplifiedMRIColors.magnetizationColorProperty,
    stroke: null,
  });

  // Recovery and decay curves on simple axes.
  const left = 310;
  const right = 530;
  const top = 80;
  const bottom = 320;
  const axes = new Path(new Shape().moveTo(left, top).lineTo(left, bottom).lineTo(right, bottom), {
    stroke: SimplifiedMRIColors.chartAxisColorProperty,
    lineWidth: 5,
  });
  const recovery = new Shape();
  const decay = new Shape();
  for (let i = 0; i <= 60; i++) {
    const s = i / 60;
    const x = left + (right - left) * s;
    const yRecovery = bottom - (bottom - top) * (1 - Math.exp(-4 * s));
    const yDecay = bottom - (bottom - top) * Math.exp(-9 * s);
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
        new Path(recovery, { stroke: SimplifiedMRIColors.mzCurveColorProperty, lineWidth: 8 }),
        new Path(decay, { stroke: SimplifiedMRIColors.mxyCurveColorProperty, lineWidth: 8 }),
      ],
    }),
  );
}
