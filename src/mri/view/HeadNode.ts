/**
 * HeadNode.ts
 *
 * A vector silhouette of the head, drawn from the same ellipses the model uses for the
 * nuclei: skull and ears, a lighter brain, faint facial features, and the tumour when
 * present. Replaces PhET's photograph.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Node, Path } from "scenerystack/scenery";
import { EARS, type Ellipse, SKULL, TUMOR } from "../../common/model/sampleGeometry.js";
import SimplifiedMRIColors from "../../SimplifiedMRIColors.js";
import { HEAD_VIEW } from "../../SimplifiedMRIConstants.js";

/** View-space ellipse for a model ellipse. */
function ellipseShape(ellipse: Ellipse, transform: ModelViewTransform2): Shape {
  const center = transform.modelToViewXY(ellipse.centerX, ellipse.centerY);
  return Shape.ellipse(
    center.x,
    center.y,
    transform.modelToViewDeltaX(ellipse.radiusX),
    Math.abs(transform.modelToViewDeltaY(ellipse.radiusY)),
    0,
  );
}

export class HeadNode extends Node {
  public constructor(
    modelViewTransform: ModelViewTransform2,
    headVisibleProperty: TReadOnlyProperty<boolean>,
    tumorPresentProperty: TReadOnlyProperty<boolean>,
  ) {
    super({ pickable: false });
    const t = modelViewTransform;

    const ears = EARS.map(
      (ear) =>
        new Path(ellipseShape(ear, t), {
          fill: SimplifiedMRIColors.headFillColorProperty,
          stroke: SimplifiedMRIColors.headStrokeColorProperty,
          lineWidth: HEAD_VIEW.EAR_LINE_WIDTH,
        }),
    );
    const skull = new Path(ellipseShape(SKULL, t), {
      fill: SimplifiedMRIColors.headFillColorProperty,
      stroke: SimplifiedMRIColors.headStrokeColorProperty,
      lineWidth: HEAD_VIEW.SKULL_LINE_WIDTH,
    });

    // Brain: the upper part of the skull, inset by about 1.5 cm.
    const brain = new Path(
      ellipseShape(
        {
          centerX: SKULL.centerX,
          centerY: SKULL.centerY + HEAD_VIEW.BRAIN_CENTER_Y_OFFSET,
          radiusX: SKULL.radiusX - HEAD_VIEW.BRAIN_X_INSET,
          radiusY: SKULL.radiusY - HEAD_VIEW.BRAIN_Y_INSET,
        },
        t,
      ),
      { fill: SimplifiedMRIColors.brainFillColorProperty },
    );

    // Faint face: eyes, nose and mouth in the lower half.
    const face = new Shape();
    const eyeY = SKULL.centerY - HEAD_VIEW.EYE_Y_OFFSET;
    for (const side of [-1, 1]) {
      const eye = t.modelToViewXY(SKULL.centerX + side * HEAD_VIEW.EYE_X_OFFSET, eyeY);
      face.ellipse(
        eye.x,
        eye.y,
        t.modelToViewDeltaX(HEAD_VIEW.EYE_RADIUS_X),
        t.modelToViewDeltaX(HEAD_VIEW.EYE_RADIUS_Y),
        0,
      );
    }
    const noseTop = t.modelToViewXY(SKULL.centerX, eyeY - HEAD_VIEW.NOSE_TOP_Y_OFFSET);
    const noseBottom = t.modelToViewXY(
      SKULL.centerX - HEAD_VIEW.NOSE_BOTTOM_X_OFFSET,
      eyeY - HEAD_VIEW.NOSE_BOTTOM_Y_OFFSET,
    );
    const noseEnd = t.modelToViewXY(SKULL.centerX + HEAD_VIEW.NOSE_END_X_OFFSET, eyeY - HEAD_VIEW.NOSE_END_Y_OFFSET);
    face.moveToPoint(noseTop).lineToPoint(noseBottom).lineToPoint(noseEnd);
    const mouthLeft = t.modelToViewXY(SKULL.centerX - HEAD_VIEW.MOUTH_HALF_WIDTH, eyeY - HEAD_VIEW.MOUTH_Y_OFFSET);
    const mouthRight = t.modelToViewXY(SKULL.centerX + HEAD_VIEW.MOUTH_HALF_WIDTH, eyeY - HEAD_VIEW.MOUTH_Y_OFFSET);
    const mouthMid = t.modelToViewXY(SKULL.centerX, eyeY - HEAD_VIEW.MOUTH_MID_Y_OFFSET);
    face.moveToPoint(mouthLeft).quadraticCurveToPoint(mouthMid, mouthRight);
    const facePath = new Path(face, {
      stroke: SimplifiedMRIColors.headStrokeColorProperty,
      lineWidth: HEAD_VIEW.FACE_LINE_WIDTH,
      opacity: HEAD_VIEW.FACE_OPACITY,
    });

    const head = new Node({ children: [...ears, skull, brain, facePath], visibleProperty: headVisibleProperty });

    const tumor = new Path(ellipseShape(TUMOR, t), {
      fill: SimplifiedMRIColors.tumorFillColorProperty,
      stroke: SimplifiedMRIColors.tumorNucleusColorProperty,
      lineWidth: HEAD_VIEW.TUMOR_LINE_WIDTH,
      lineDash: [HEAD_VIEW.TUMOR_DASH_LENGTH, HEAD_VIEW.TUMOR_DASH_GAP],
      visibleProperty: tumorPresentProperty,
    });

    this.children = [head, tumor];
  }
}
