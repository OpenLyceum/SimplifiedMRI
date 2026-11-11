/**
 * HintNode.ts
 *
 * PhET's "wiggle me": a yellow speech bubble pointing down at the radio-wave source until
 * the user first changes the power or frequency.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Node, Path, Text } from "scenerystack/scenery";
import SimplifiedMRIColors from "../../SimplifiedMRIColors.js";
import { FONTS } from "../../SimplifiedMRIConstants.js";

const PADDING = 8;
const POINTER = 14;

export class HintNode extends Node {
  public constructor(textProperty: TReadOnlyProperty<string>, visibleProperty: TReadOnlyProperty<boolean>) {
    super({ pickable: false, visibleProperty });
    const text = new Text(textProperty, {
      font: FONTS.HINT,
      fill: SimplifiedMRIColors.hintTextColorProperty,
      maxWidth: 260,
    });
    const bubble = new Path(null, {
      fill: SimplifiedMRIColors.hintFillColorProperty,
      stroke: SimplifiedMRIColors.hintTextColorProperty,
      lineWidth: 1,
    });
    this.children = [bubble, text];

    text.boundsProperty.link((bounds) => {
      const width = bounds.width + 2 * PADDING;
      const height = bounds.height + 2 * PADDING;
      bubble.shape = new Shape()
        .roundRect(0, 0, width, height, 8, 8)
        .moveTo(width * 0.25 - POINTER / 2, height)
        .lineTo(width * 0.25, height + POINTER)
        .lineTo(width * 0.25 + POINTER / 2, height)
        .close();
      text.left = PADDING;
      text.top = PADDING;
    });
  }

  /** Point (in parent coordinates) the bubble's pointer should touch. */
  public setPointerTip(x: number, y: number): void {
    const bubbleBounds = this.localBounds;
    this.x = x - bubbleBounds.width * 0.25;
    this.y = y - bubbleBounds.height;
  }
}
