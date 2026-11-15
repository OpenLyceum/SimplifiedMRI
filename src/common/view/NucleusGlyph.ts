/**
 * NucleusGlyph.ts
 *
 * The picture of one nucleus: a spinning-top "donut" with a red magnetic-moment arrow
 * through it, after PhET's dipole image. Used in the chamber and as icons in the energy
 * diagram.
 *
 * The donut stays level; setArrowAngle() turns the arrow alone, which is how precession is
 * drawn (the arrow sweeps around a cone about the spin axis, seen side-on).
 */

import { Shape } from "scenerystack/kite";
import type { TPaint } from "scenerystack/scenery";
import { Node, type NodeOptions, Path } from "scenerystack/scenery";
import SimplifiedMRIColors from "../../SimplifiedMRIColors.js";
import { GLYPH } from "../../SimplifiedMRIConstants.js";

export class NucleusGlyph extends Node {
  private readonly arrow: Path;
  private readonly body: Path;

  /** Cone traced by the arrow tip when precession is shown. */
  public readonly cone: Path;

  /**
   * @param radius - half the donut's width (px)
   * @param bodyFill - donut colour
   * @param providedOptions
   */
  public constructor(radius: number, bodyFill: TPaint, providedOptions?: NodeOptions) {
    super();

    const arrowLength = GLYPH.ARROW_LENGTH_FACTOR * radius;
    const headLength = GLYPH.HEAD_LENGTH_FACTOR * radius;
    const headWidth = GLYPH.HEAD_WIDTH_FACTOR * radius;
    const shaftWidth = GLYPH.SHAFT_WIDTH_FACTOR * radius;

    // Arrow pointing up (−y) in local coordinates, centred on the donut.
    const arrowShape = new Shape()
      .moveTo(-shaftWidth / 2, arrowLength * GLYPH.TAIL_LENGTH_FACTOR)
      .lineTo(-shaftWidth / 2, -arrowLength + headLength)
      .lineTo(-headWidth / 2, -arrowLength + headLength)
      .lineTo(0, -arrowLength)
      .lineTo(headWidth / 2, -arrowLength + headLength)
      .lineTo(shaftWidth / 2, -arrowLength + headLength)
      .lineTo(shaftWidth / 2, arrowLength * GLYPH.TAIL_LENGTH_FACTOR)
      .close();
    this.arrow = new Path(arrowShape, {
      fill: SimplifiedMRIColors.nucleusArrowColorProperty,
      stroke: SimplifiedMRIColors.nucleusStrokeColorProperty,
      lineWidth: GLYPH.ARROW_LINE_WIDTH,
    });

    this.body = new Path(Shape.ellipse(0, 0, radius, radius * GLYPH.BODY_RADIUS_FACTOR, 0), {
      fill: bodyFill,
      stroke: SimplifiedMRIColors.nucleusStrokeColorProperty,
      lineWidth: GLYPH.LINE_WIDTH,
    });
    const hole = new Path(
      Shape.ellipse(
        0,
        -radius * GLYPH.HOLE_Y_FACTOR,
        radius * GLYPH.HOLE_WIDTH_FACTOR,
        radius * GLYPH.HOLE_HEIGHT_FACTOR,
        0,
      ),
      {
        fill: SimplifiedMRIColors.nucleusStrokeColorProperty,
        opacity: GLYPH.HOLE_OPACITY,
      },
    );

    this.cone = new Path(
      Shape.ellipse(
        0,
        -arrowLength * GLYPH.CONE_Y_FACTOR,
        arrowLength * GLYPH.CONE_WIDTH_FACTOR,
        arrowLength * GLYPH.CONE_HEIGHT_FACTOR,
        0,
      ),
      {
        stroke: SimplifiedMRIColors.precessionConeColorProperty,
        lineWidth: GLYPH.LINE_WIDTH,
        visible: false,
      },
    );

    this.children = [this.cone, this.arrow, this.body, hole];
    this.mutate(providedOptions);
  }

  /** Turns the arrow relative to the donut (rad, clockwise on screen). */
  public setArrowAngle(angle: number): void {
    this.arrow.rotation = angle;
  }

  public setBodyFill(fill: TPaint): void {
    this.body.fill = fill;
  }
}
