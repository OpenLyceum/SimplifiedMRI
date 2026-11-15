/**
 * DetectorNode.ts
 *
 * PhET's detector: a tall bar to the right of the chamber with a stub on its back. It glows
 * with the rate of photons arriving; DetectorPanel gives the rate as a number.
 */

import type { Bounds2 } from "scenerystack/dot";
import { Node, Rectangle, Text } from "scenerystack/scenery";
import type { Detector } from "../../common/model/Detector.js";
import { StringManager } from "../../i18n/StringManager.js";
import SimplifiedMRIColors from "../../SimplifiedMRIColors.js";
import { DETECTOR_VIEW, FONTS } from "../../SimplifiedMRIConstants.js";

export class DetectorNode extends Node {
  /**
   * @param detector - the model detector
   * @param viewBounds - the detector bar in view coordinates
   */
  public constructor(detector: Detector, viewBounds: Bounds2) {
    super();
    const strings = StringManager.getInstance().getMRIStrings();
    const radius = viewBounds.width / 2;

    const bar = Rectangle.bounds(viewBounds, {
      cornerRadius: radius,
      fill: SimplifiedMRIColors.detectorColorProperty,
      stroke: SimplifiedMRIColors.textColorProperty,
      lineWidth: DETECTOR_VIEW.LINE_WIDTH,
    });
    const glow = Rectangle.bounds(viewBounds, {
      cornerRadius: radius,
      fill: SimplifiedMRIColors.detectorGlowColorProperty,
      opacity: 0,
    });
    const stub = new Rectangle(
      viewBounds.maxX,
      viewBounds.centerY - DETECTOR_VIEW.STUB_HALF_HEIGHT,
      DETECTOR_VIEW.STUB_WIDTH,
      DETECTOR_VIEW.STUB_HEIGHT,
      {
        fill: SimplifiedMRIColors.detectorColorProperty,
        stroke: SimplifiedMRIColors.textColorProperty,
      },
    );
    const label = new Text(strings.detectorStringProperty, {
      font: FONTS.CONTROL_TITLE,
      fill: SimplifiedMRIColors.textColorProperty,
      rotation: -Math.PI / 2,
      maxWidth: viewBounds.height * DETECTOR_VIEW.LABEL_HEIGHT_FACTOR,
    });
    label.boundsProperty.link(() => {
      label.center = viewBounds.center;
    });

    detector.countProperty.link((count) => {
      glow.opacity = Math.min(1, count / DETECTOR_VIEW.FULL_GLOW_RATE);
    });

    this.children = [stub, bar, glow, label];
  }
}
