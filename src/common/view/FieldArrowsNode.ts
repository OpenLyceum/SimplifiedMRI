/**
 * FieldArrowsNode.ts
 *
 * PhET's 7 × 7 grid of hollow arrows showing the magnetic field: each points along the field
 * with a length proportional to the total field at its position, so the gradients show
 * as arrows that lengthen across the chamber.
 */

import { Multilink } from "scenerystack/axon";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Node } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import SimplifiedMRIColors from "../../SimplifiedMRIColors.js";
import { CHAMBER, FIELD_ARROWS, MAGNET } from "../../SimplifiedMRIConstants.js";
import type { ResonanceModel } from "../model/ResonanceModel.js";

export class FieldArrowsNode extends Node {
  public constructor(model: ResonanceModel, modelViewTransform: ModelViewTransform2) {
    super({ pickable: false, visibleProperty: model.fieldArrowsVisibleProperty });

    const minX = -FIELD_ARROWS.SIDE_MARGIN;
    const spacingX = (CHAMBER.WIDTH + 2 * FIELD_ARROWS.SIDE_MARGIN) / FIELD_ARROWS.COLUMNS;
    const spacingY = CHAMBER.HEIGHT / FIELD_ARROWS.ROWS;
    // As in PhET, arrows at the strongest field overlap their neighbours a little.
    const maxLength = modelViewTransform.modelToViewDeltaX(FIELD_ARROWS.LENGTH_SPACING_FACTOR * spacingY);
    const maxField = MAGNET.MAIN_FIELD_RANGE.max + MAGNET.GRADIENT_RANGE.max;

    const arrows: { arrow: ArrowNode; x: number; y: number }[] = [];
    for (let i = 0; i < FIELD_ARROWS.COLUMNS; i++) {
      for (let j = 0; j < FIELD_ARROWS.ROWS; j++) {
        const x = minX + spacingX * (i + 0.5);
        const y = spacingY * (j + 0.5);
        const arrow = new ArrowNode(0, 0, 0, -1, {
          headHeight: FIELD_ARROWS.HEAD_HEIGHT,
          headWidth: FIELD_ARROWS.HEAD_WIDTH,
          tailWidth: FIELD_ARROWS.TAIL_WIDTH,
          fill: SimplifiedMRIColors.fieldArrowFillColorProperty,
          stroke: SimplifiedMRIColors.fieldArrowStrokeColorProperty,
          lineWidth: FIELD_ARROWS.LINE_WIDTH,
        });
        arrows.push({ arrow, x, y });
        this.addChild(arrow);
      }
    }

    Multilink.multilink(
      [model.mainFieldProperty, model.horizontalGradientProperty, model.verticalGradientProperty],
      () => {
        for (const { arrow, x, y } of arrows) {
          const field = model.fieldAt(x, y);
          const length = (maxLength * field) / maxField;
          const center = modelViewTransform.modelToViewXY(x, y);
          arrow.visible = Math.abs(length) > 1;
          arrow.setTailAndTip(center.x, center.y + length / 2, center.x, center.y - length / 2);
        }
      },
    );
  }
}
