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
import { MAGNET } from "../../SimplifiedMRIConstants.js";

export class GradientMagnetsPanel extends SimplifiedMRIPanel {
  public constructor(model: ResonanceModel) {
    const common = StringManager.getInstance().getCommonStrings();
    const strings = StringManager.getInstance().getMRIStrings();
    const a11y = StringManager.getInstance().getMRIA11yStrings();
    const ticks = [0, 0.1, 0.2].map((value) => ({ value, label: `${value}` }));

    const horizontal = createNumberControl(model.horizontalGradientProperty, MAGNET.GRADIENT_RANGE, {
      titleProperty: strings.horizontalStringProperty,
      valuePatternProperty: common.teslaPatternStringProperty,
      accessibleName: a11y.horizontalGradientStringProperty,
      accessibleHelpText: a11y.gradientHelpStringProperty,
      decimalPlaces: 3,
      delta: 0.005,
      majorTicks: ticks,
    });
    const vertical = createNumberControl(model.verticalGradientProperty, MAGNET.GRADIENT_RANGE, {
      titleProperty: strings.verticalStringProperty,
      valuePatternProperty: common.teslaPatternStringProperty,
      accessibleName: a11y.verticalGradientStringProperty,
      accessibleHelpText: a11y.gradientHelpStringProperty,
      decimalPlaces: 3,
      delta: 0.005,
      majorTicks: ticks,
    });

    super(
      new VBox({
        spacing: 8,
        align: "left",
        children: [createPanelTitle(strings.gradientMagnetsStringProperty), horizontal, vertical],
      }),
    );
  }
}
