/**
 * MainMagnetPanel.ts
 *
 * The main-magnet field control (PhET's "Main Magnet" panel, 0–3 T). Releasing the slider
 * near resonance snaps the field onto resonance when that preference is on.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { VBox } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import { MAGNET } from "../../SimplifiedMRIConstants.js";
import type { ResonanceModel } from "../model/ResonanceModel.js";
import { SimplifiedMRIPanel } from "../SimplifiedMRIPanel.js";
import { createNumberControl, createPanelTitle } from "./controlHelpers.js";

export class MainMagnetPanel extends SimplifiedMRIPanel {
  public constructor(model: ResonanceModel, snapToResonanceProperty: TReadOnlyProperty<boolean>) {
    const strings = StringManager.getInstance().getCommonStrings();
    const a11y = StringManager.getInstance().getCommonA11yStrings();

    const fieldControl = createNumberControl(model.mainFieldProperty, MAGNET.MAIN_FIELD_RANGE, {
      titleProperty: strings.fieldStringProperty,
      valuePatternProperty: strings.teslaPatternStringProperty,
      accessibleName: a11y.mainFieldStringProperty,
      accessibleHelpText: a11y.mainFieldHelpStringProperty,
      decimalPlaces: 2,
      delta: 0.01,
      majorTicks: [0, 1, 2, 3].map((value) => ({ value, label: `${value}` })),
      endDrag: () => {
        if (snapToResonanceProperty.value) {
          model.snapMainField();
        }
      },
    });

    super(
      new VBox({
        spacing: 6,
        align: "left",
        children: [createPanelTitle(strings.mainMagnetStringProperty), fieldControl],
      }),
    );
  }
}
