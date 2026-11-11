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

    const arrowLength = 1.45 * radius;
    const headLength = 0.55 * radius;
    const headWidth = 0.7 * radius;
    const shaftWidth = 0.22 * radius;

    // Arrow pointing up (−y) in local coordinates, centred on the donut.
    const arrowShape = new Shape()
      .moveTo(-shaftWidth / 2, arrowLength * 0.75)
      .lineTo(-shaftWidth / 2, -arrowLength + headLength)
      .lineTo(-headWidth / 2, -arrowLength + headLength)
      .lineTo(0, -arrowLength)
      .lineTo(headWidth / 2, -arrowLength + headLength)
      .lineTo(shaftWidth / 2, -arrowLength + headLength)
      .lineTo(shaftWidth / 2, arrowLength * 0.75)
      .close();
    this.arrow = new Path(arrowShape, {
      fill: SimplifiedMRIColors.nucleusArrowColorProperty,
      stroke: SimplifiedMRIColors.nucleusStrokeColorProperty,
      lineWidth: 0.6,
    });

    this.body = new Path(Shape.ellipse(0, 0, radius, radius * 0.42, 0), {
      fill: bodyFill,
      stroke: SimplifiedMRIColors.nucleusStrokeColorProperty,
      lineWidth: 0.8,
    });
    const hole = new Path(Shape.ellipse(0, -radius * 0.05, radius * 0.32, radius * 0.12, 0), {
      fill: SimplifiedMRIColors.nucleusStrokeColorProperty,
      opacity: 0.5,
    });

    this.cone = new Path(Shape.ellipse(0, -arrowLength * 0.95, arrowLength * 0.42, arrowLength * 0.13, 0), {
      stroke: SimplifiedMRIColors.precessionConeColorProperty,
      lineWidth: 0.8,
      visible: false,
    });

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
