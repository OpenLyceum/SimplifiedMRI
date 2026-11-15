/**
 * DetectorPanel.ts
 *
 * Readout of the detector: the rate of emitted photons arriving, as a number and as a bar.
 * Tuning the frequency across a gradient and watching this rate is how a slice through the
 * tumour shows up.
 */

import { DerivedProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node, Rectangle, Text, VBox } from "scenerystack/scenery";
import type { Detector } from "../../common/model/Detector.js";
import { SimplifiedMRIPanel } from "../../common/SimplifiedMRIPanel.js";
import { createPanelTitle } from "../../common/view/controlHelpers.js";
import { StringManager } from "../../i18n/StringManager.js";
import SimplifiedMRIColors from "../../SimplifiedMRIColors.js";
import { CONTROL_WIDTH, DETECTOR_PANEL, FONTS } from "../../SimplifiedMRIConstants.js";

/** Rate (photons/s) that fills the bar. */

export class DetectorPanel extends SimplifiedMRIPanel {
  public constructor(detector: Detector) {
    const strings = StringManager.getInstance().getMRIStrings();
    const rateText = new Text(
      new DerivedProperty([strings.detectorRatePatternStringProperty, detector.countProperty], (pattern, count) =>
        StringUtils.fillIn(pattern, { count }),
      ),
      {
        font: FONTS.READOUT_VALUE,
        fill: SimplifiedMRIColors.textColorProperty,
        maxWidth: DETECTOR_PANEL.READOUT_WIDTH,
      },
    );
    const barWidth = CONTROL_WIDTH - DETECTOR_PANEL.BAR_WIDTH_INSET;
    const track = new Rectangle(0, 0, barWidth, DETECTOR_PANEL.BAR_HEIGHT, {
      fill: SimplifiedMRIColors.chamberFillColorProperty,
      stroke: SimplifiedMRIColors.panelBorderColorProperty,
    });
    const bar = new Rectangle(0, 0, 0, DETECTOR_PANEL.BAR_HEIGHT, {
      fill: SimplifiedMRIColors.detectorGlowColorProperty,
    });
    detector.countProperty.link((count) => {
      bar.rectWidth = barWidth * Math.min(1, count / DETECTOR_PANEL.FULL_SCALE_RATE);
    });

    super(
      new VBox({
        spacing: DETECTOR_PANEL.PANEL_SPACING,
        align: "left",
        children: [
          createPanelTitle(strings.detectorStringProperty),
          new HBox({
            spacing: DETECTOR_PANEL.READOUT_SPACING,
            children: [new Node({ children: [track, bar] }), rateText],
          }),
        ],
      }),
    );
  }
}
