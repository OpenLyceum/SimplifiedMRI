/**
 * CoilNode.ts
 *
 * An electromagnet coil seen edge-on, in the style of PhET's gold coils.
 *
 *   main coil       one long winding: thin loops stacked across its thickness
 *   gradient coil   a row of short windings along its length
 *
 * A glow over each winding shows its current. A main coil glows uniformly with the field;
 * a gradient coil's windings glow more toward its high-field end, so the gradient's
 * direction is visible.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Node, type NodeOptions, Path, Rectangle } from "scenerystack/scenery";
import SimplifiedMRIColors from "../../SimplifiedMRIColors.js";

export type CoilOrientation = "horizontal" | "vertical";

export type CoilNodeOptions = NodeOptions & {
  /** Number of separate windings along the coil (1 for a main coil). */
  segments?: number;

  /** Loops drawn in each winding. */
  loops?: number;
};

export class CoilNode extends Node {
  /**
   * @param length - extent along the coil's axis (px)
   * @param thickness - extent across it (px)
   * @param orientation - direction of the long axis
   * @param strengthProperty - 0–1, how strongly the coil is driven
   * @param providedOptions
   */
  public constructor(
    length: number,
    thickness: number,
    orientation: CoilOrientation,
    strengthProperty: TReadOnlyProperty<number>,
    providedOptions?: CoilNodeOptions,
  ) {
    const { segments = 1, loops = 4, ...nodeOptions } = providedOptions ?? {};
    super();

    const isGradient = segments > 1;
    const segmentLength = length / segments;
    const glows: Rectangle[] = [];
    for (let s = 0; s < segments; s++) {
      const start = s * segmentLength;
      const coil = new Shape();
      const highlight = new Shape();
      for (let k = 0; k < loops; k++) {
        // Each loop is a flat ellipse across the coil.
        const offset = ((k + 0.5) / loops) * thickness;
        const rx = segmentLength / 2 - 1;
        const ry = Math.max(1.5, thickness / loops / 2);
        if (orientation === "horizontal") {
          coil.ellipse(start + segmentLength / 2, offset, rx, ry, 0);
          highlight.moveTo(start + 3, offset - ry * 0.4).lineTo(start + segmentLength - 3, offset - ry * 0.4);
        } else {
          coil.ellipse(offset, start + segmentLength / 2, ry, rx, 0);
          highlight.moveTo(offset - ry * 0.4, start + 3).lineTo(offset - ry * 0.4, start + segmentLength - 3);
        }
      }
      this.addChild(
        new Path(coil, {
          fill: SimplifiedMRIColors.coilShadowColorProperty,
          stroke: isGradient ? SimplifiedMRIColors.gradientCoilColorProperty : SimplifiedMRIColors.coilColorProperty,
          lineWidth: 2,
        }),
      );
      this.addChild(new Path(highlight, { stroke: SimplifiedMRIColors.coilHighlightColorProperty, lineWidth: 0.8 }));

      const glow =
        orientation === "horizontal"
          ? new Rectangle(start, 0, segmentLength, thickness, { cornerRadius: thickness / 3 })
          : new Rectangle(0, start, thickness, segmentLength, { cornerRadius: thickness / 3 });
      glow.fill = SimplifiedMRIColors.coilHighlightColorProperty;
      glow.pickable = false;
      glows.push(glow);
      this.addChild(glow);
    }

    strengthProperty.link((strength) => {
      glows.forEach((glow, s) => {
        // Horizontal gradients increase to the right; vertical ones upward (y is down here).
        const position = (s + 0.5) / segments;
        const weight = isGradient ? (orientation === "horizontal" ? position : 1 - position) : 1;
        glow.opacity = 0.55 * strength * weight;
      });
    });

    this.mutate(nodeOptions);
  }
}
