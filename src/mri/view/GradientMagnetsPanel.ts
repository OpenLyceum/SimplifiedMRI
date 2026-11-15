/**
 * GradientMagnetsPanel.ts
 *
 * PhET's "Gradient Magnets" panel: horizontal and vertical gradient strengths, each the
 * difference in field between the two edges of the chamber.
 */

import { VBox } from "scenerystack/scenery";
import type { ResonanceModel } from "../../common/model/ResonanceModel.js";
import { SimplifiedMRIPanel } from "../../common/SimplifiedMRIPanel.js";
import { createNumberControl, createPanelTitle } from "../../common/view/controlHelpers.js";
import { StringManager } from "../../i18n/StringManager.js";
import { GRADIENT_CONTROLS, MAGNET, READOUT_PRECISION } from "../../SimplifiedMRIConstants.js";

export class GradientMagnetsPanel extends SimplifiedMRIPanel {
  public constructor(model: ResonanceModel) {
    const common = StringManager.getInstance().getCommonStrings();
    const strings = StringManager.getInstance().getMRIStrings();
    const a11y = StringManager.getInstance().getMRIA11yStrings();
    const ticks = GRADIENT_CONTROLS.MAJOR_TICKS.map((value) => ({ value, label: `${value}` }));

    const horizontal = createNumberControl(model.horizontalGradientProperty, MAGNET.GRADIENT_RANGE, {
      titleProperty: strings.horizontalStringProperty,
      valuePatternProperty: common.teslaPatternStringProperty,
      accessibleName: a11y.horizontalGradientStringProperty,
      accessibleHelpText: a11y.gradientHelpStringProperty,
      decimalPlaces: READOUT_PRECISION.GRADIENT,
      delta: GRADIENT_CONTROLS.DELTA,
      majorTicks: ticks,
    });
    const vertical = createNumberControl(model.verticalGradientProperty, MAGNET.GRADIENT_RANGE, {
      titleProperty: strings.verticalStringProperty,
      valuePatternProperty: common.teslaPatternStringProperty,
      accessibleName: a11y.verticalGradientStringProperty,
      accessibleHelpText: a11y.gradientHelpStringProperty,
      decimalPlaces: READOUT_PRECISION.GRADIENT,
      delta: GRADIENT_CONTROLS.DELTA,
      majorTicks: ticks,
    });

    super(
      new VBox({
        spacing: GRADIENT_CONTROLS.SPACING,
        align: "left",
        children: [createPanelTitle(strings.gradientMagnetsStringProperty), horizontal, vertical],
      }),
    );
  }
}
