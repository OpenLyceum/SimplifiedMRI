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
          lineWidth: 1.5,
        }),
    );
    const skull = new Path(ellipseShape(SKULL, t), {
      fill: SimplifiedMRIColors.headFillColorProperty,
      stroke: SimplifiedMRIColors.headStrokeColorProperty,
      lineWidth: 2,
    });

    // Brain: the upper part of the skull, inset by about 1.5 cm.
    const brain = new Path(
      ellipseShape(
        {
          centerX: SKULL.centerX,
          centerY: SKULL.centerY + 2.2,
          radiusX: SKULL.radiusX - 1.5,
          radiusY: SKULL.radiusY - 3.2,
        },
        t,
      ),
      { fill: SimplifiedMRIColors.brainFillColorProperty },
    );

    // Faint face: eyes, nose and mouth in the lower half.
    const face = new Shape();
    const eyeY = SKULL.centerY - 1.5;
    for (const side of [-1, 1]) {
      const eye = t.modelToViewXY(SKULL.centerX + side * 3.2, eyeY);
      face.ellipse(eye.x, eye.y, t.modelToViewDeltaX(1.2), t.modelToViewDeltaX(0.5), 0);
    }
    const noseTop = t.modelToViewXY(SKULL.centerX, eyeY - 0.5);
    const noseBottom = t.modelToViewXY(SKULL.centerX - 0.8, eyeY - 3.8);
    const noseEnd = t.modelToViewXY(SKULL.centerX + 0.4, eyeY - 4.1);
    face.moveToPoint(noseTop).lineToPoint(noseBottom).lineToPoint(noseEnd);
    const mouthLeft = t.modelToViewXY(SKULL.centerX - 2.4, eyeY - 6.2);
    const mouthRight = t.modelToViewXY(SKULL.centerX + 2.4, eyeY - 6.2);
    const mouthMid = t.modelToViewXY(SKULL.centerX, eyeY - 7);
    face.moveToPoint(mouthLeft).quadraticCurveToPoint(mouthMid, mouthRight);
    const facePath = new Path(face, {
      stroke: SimplifiedMRIColors.headStrokeColorProperty,
      lineWidth: 1.2,
      opacity: 0.6,
    });

    const head = new Node({ children: [...ears, skull, brain, facePath], visibleProperty: headVisibleProperty });

    const tumor = new Path(ellipseShape(TUMOR, t), {
      fill: SimplifiedMRIColors.tumorFillColorProperty,
      stroke: SimplifiedMRIColors.tumorNucleusColorProperty,
      lineWidth: 1,
      lineDash: [4, 3],
      visibleProperty: tumorPresentProperty,
    });

    this.children = [head, tumor];
  }
}
