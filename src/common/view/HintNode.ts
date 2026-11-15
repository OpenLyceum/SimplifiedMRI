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
import { FONTS, HINT } from "../../SimplifiedMRIConstants.js";

export class HintNode extends Node {
  public constructor(textProperty: TReadOnlyProperty<string>, visibleProperty: TReadOnlyProperty<boolean>) {
    super({ pickable: false, visibleProperty });
    const text = new Text(textProperty, {
      font: FONTS.HINT,
      fill: SimplifiedMRIColors.hintTextColorProperty,
      maxWidth: HINT.MAX_TEXT_WIDTH,
    });
    const bubble = new Path(null, {
      fill: SimplifiedMRIColors.hintFillColorProperty,
      stroke: SimplifiedMRIColors.hintTextColorProperty,
      lineWidth: HINT.LINE_WIDTH,
    });
    this.children = [bubble, text];

    text.boundsProperty.link((bounds) => {
      const width = bounds.width + 2 * HINT.PADDING;
      const height = bounds.height + 2 * HINT.PADDING;
      bubble.shape = new Shape()
        .roundRect(0, 0, width, height, HINT.CORNER_RADIUS, HINT.CORNER_RADIUS)
        .moveTo(width * HINT.POINTER_X_FRACTION - HINT.POINTER_LENGTH / 2, height)
        .lineTo(width * HINT.POINTER_X_FRACTION, height + HINT.POINTER_LENGTH)
        .lineTo(width * HINT.POINTER_X_FRACTION + HINT.POINTER_LENGTH / 2, height)
        .close();
      text.left = HINT.PADDING;
      text.top = HINT.PADDING;
    });
  }

  /** Point (in parent coordinates) the bubble's pointer should touch. */
  public setPointerTip(x: number, y: number): void {
    const bubbleBounds = this.localBounds;
    this.x = x - bubbleBounds.width * HINT.POINTER_X_FRACTION;
    this.y = y - bubbleBounds.height;
  }
}
