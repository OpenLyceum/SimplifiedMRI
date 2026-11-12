/**
 * BlochSphereNode.ts
 *
 * The net magnetization on a sphere of radius M0, in an oblique 3-D view with the main field
 * B0 pointing up:
 *
 *   red arrow       the net magnetization M
 *   blue arrows     individual spin isochromats fanning out to illustrate loss of transverse coherence
 *   faint trail     the recent path of M's tip (the nutation spiral during a pulse)
 *   dashed lines    M's projections onto the transverse plane and the field axis
 *
 * In the lab frame everything turns about B0 at a display rate slowed by about 1e8. In the
 * rotating frame that turning is removed and only the relaxation is left.
 */

import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Line, Node, Path, RichText, Text } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import SimplifiedMRIColors from "../../SimplifiedMRIColors.js";
import { FONTS, RELAXATION } from "../../SimplifiedMRIConstants.js";
import type { Magnetization } from "../model/blochPhysics.js";
import type { RelaxationModel } from "../model/RelaxationModel.js";

/** Screen directions (y down) of the unit x, y and z axes in the oblique view. */
const EX = new Vector2(-0.55, 0.32);
const EY = new Vector2(0.88, 0.16);
const EZ = new Vector2(0, -1);

/** Number of trail points kept (about two seconds at 60 frames per second). */
const TRAIL_LENGTH = 120;

export class BlochSphereNode extends Node {
  private readonly model: RelaxationModel;
  private readonly radius: number;
  private readonly magnetizationArrow: ArrowNode;
  private readonly isochromatArrows: ArrowNode[] = [];
  private readonly isochromatLayer = new Node();
  private readonly trailPath: Path;
  private readonly projectionPath: Path;
  private readonly xLabel: Text;
  private readonly yLabel: Text;
  private readonly trail: Vector2[] = [];

  public constructor(model: RelaxationModel, radius: number) {
    super();
    this.model = model;
    this.radius = radius;

    const outline = new Path(Shape.circle(0, 0, radius), {
      stroke: SimplifiedMRIColors.sphereColorProperty,
      lineWidth: 1.5,
    });
    const equator = new Path(
      this.circleShape((theta) => ({ x: Math.cos(theta), y: Math.sin(theta), z: 0 })),
      {
        stroke: SimplifiedMRIColors.sphereColorProperty,
        lineWidth: 1,
      },
    );
    const meridian = new Path(
      this.circleShape((theta) => ({ x: Math.sin(theta), y: 0, z: Math.cos(theta) })),
      {
        stroke: SimplifiedMRIColors.sphereColorProperty,
        lineWidth: 0.7,
        lineDash: [3, 4],
      },
    );

    const axisOptions = { stroke: SimplifiedMRIColors.axisColorProperty, lineWidth: 1 };
    const xEnd = this.project({ x: 1.25, y: 0, z: 0 });
    const yEnd = this.project({ x: 0, y: 1.25, z: 0 });
    const xAxis = new Line(0, 0, xEnd.x, xEnd.y, axisOptions);
    const yAxis = new Line(0, 0, yEnd.x, yEnd.y, axisOptions);
    this.xLabel = new Text("x", { font: FONTS.CONTROL_LABEL, fill: SimplifiedMRIColors.axisColorProperty });
    this.yLabel = new Text("y", { font: FONTS.CONTROL_LABEL, fill: SimplifiedMRIColors.axisColorProperty });
    this.xLabel.center = this.project({ x: 1.38, y: 0, z: 0 });
    this.yLabel.center = this.project({ x: 0, y: 1.38, z: 0 });

    const fieldTop = this.project({ x: 0, y: 0, z: 1.45 });
    const fieldArrow = new ArrowNode(0, radius * 0.2, fieldTop.x, fieldTop.y, {
      headHeight: 12,
      headWidth: 12,
      tailWidth: 3,
      fill: SimplifiedMRIColors.fieldColorProperty,
      stroke: null,
      opacity: 0.8,
    });
    const fieldLabel = new RichText("B<sub>0</sub>", {
      font: FONTS.CONTROL_TITLE,
      fill: SimplifiedMRIColors.fieldColorProperty,
      left: fieldTop.x + 8,
      centerY: fieldTop.y + 8,
    });

    this.trailPath = new Path(null, { stroke: SimplifiedMRIColors.trailColorProperty, lineWidth: 1.5 });
    this.projectionPath = new Path(null, {
      stroke: SimplifiedMRIColors.magnetizationColorProperty,
      lineWidth: 1,
      lineDash: [3, 3],
      opacity: 0.7,
    });

    for (let k = 0; k < RELAXATION.ISOCHROMAT_COUNT; k++) {
      const arrow = new ArrowNode(0, 0, 1, 0, {
        headHeight: 7,
        headWidth: 7,
        tailWidth: 1.5,
        fill: SimplifiedMRIColors.isochromatColorProperty,
        stroke: null,
      });
      this.isochromatArrows.push(arrow);
      this.isochromatLayer.addChild(arrow);
    }

    this.magnetizationArrow = new ArrowNode(0, 0, 0, -radius, {
      headHeight: 16,
      headWidth: 16,
      tailWidth: 5,
      fill: SimplifiedMRIColors.magnetizationColorProperty,
      stroke: SimplifiedMRIColors.nucleusStrokeColorProperty,
      lineWidth: 0.8,
    });
    const mLabel = new Text("M", {
      font: FONTS.CONTROL_TITLE,
      fill: SimplifiedMRIColors.magnetizationColorProperty,
    });
    this.magnetizationArrow.boundsProperty.link(() => {
      const tip = this.magnetizationArrow.tipX;
      mLabel.left = tip + 6;
      mLabel.bottom = this.magnetizationArrow.tipY - 2;
    });

    model.rotatingFrameProperty.link((rotating) => {
      this.xLabel.string = rotating ? "x′" : "x";
      this.yLabel.string = rotating ? "y′" : "y";
    });

    this.children = [
      outline,
      meridian,
      equator,
      xAxis,
      yAxis,
      this.xLabel,
      this.yLabel,
      fieldArrow,
      fieldLabel,
      this.trailPath,
      this.projectionPath,
      this.isochromatLayer,
      this.magnetizationArrow,
      mLabel,
    ];
    this.update();
  }

  /** Clears the tip trail (after a reset or a return to equilibrium). */
  public clearTrail(): void {
    this.trail.length = 0;
  }

  /** Redraws from the model; called each frame. */
  public update(): void {
    const model = this.model;
    const phase = model.rotatingFrameProperty.value ? 0 : -model.labPhase;
    const m = rotateAboutZ(model.magnetization, phase);

    const tip = this.project(m);
    this.magnetizationArrow.setTailAndTip(0, 0, tip.x, tip.y);
    this.magnetizationArrow.visible = tip.magnitude > 2;

    const foot = this.project({ x: m.x, y: m.y, z: 0 });
    this.projectionPath.shape = new Shape().moveTo(0, 0).lineToPoint(foot).lineToPoint(tip);

    // Trail of the tip.
    if (model.timer.isPlayingProperty.value) {
      this.trail.push(tip);
      if (this.trail.length > TRAIL_LENGTH) {
        this.trail.shift();
      }
    }
    const trailShape = new Shape();
    this.trail.forEach((point, i) => {
      if (i === 0) {
        trailShape.moveToPoint(point);
      } else {
        trailShape.lineToPoint(point);
      }
    });
    this.trailPath.shape = trailShape;

    // Isochromats: each keeps unit length, fanning out from the transverse direction the
    // pulse left behind, and tipped no further than that pulse tipped the net magnetization.
    const transverse = Math.min(Math.sqrt(Math.max(0, 1 - m.z * m.z)), model.pulseTransverse);
    const showSpins = model.tissueTime !== null && !model.pulseActiveProperty.value && transverse > 0.02;
    this.isochromatLayer.visible = model.isochromatsVisibleProperty.value && showSpins;
    if (this.isochromatLayer.visible) {
      const offsets = model.isochromatOffsets;
      const time = model.tissueTime ?? 0;
      this.isochromatArrows.forEach((arrow, k) => {
        const angle = model.isochromatBasePhase + (offsets[k] ?? 0) * time + phase;
        const point = this.project({ x: transverse * Math.cos(angle), y: transverse * Math.sin(angle), z: m.z });
        arrow.setTailAndTip(0, 0, point.x, point.y);
      });
    }
  }

  /** Screen position (px, origin at the sphere centre) of a magnetization. */
  private project(m: Magnetization): Vector2 {
    return new Vector2(
      this.radius * (m.x * EX.x + m.y * EY.x + m.z * EZ.x),
      this.radius * (m.x * EX.y + m.y * EY.y + m.z * EZ.y),
    );
  }

  /** Closed curve through the projections of a parametrised unit circle. */
  private circleShape(point: (theta: number) => Magnetization): Shape {
    const shape = new Shape();
    const segments = 72;
    for (let i = 0; i <= segments; i++) {
      const p = this.project(point((2 * Math.PI * i) / segments));
      if (i === 0) {
        shape.moveToPoint(p);
      } else {
        shape.lineToPoint(p);
      }
    }
    return shape;
  }
}

/** Rotates a magnetization about z by `angle` (rad). */
function rotateAboutZ(m: Magnetization, angle: number): Magnetization {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: m.x * cos - m.y * sin, y: m.x * sin + m.y * cos, z: m.z };
}
