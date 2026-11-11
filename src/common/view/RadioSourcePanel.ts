/**
 * RadioSourcePanel.ts
 *
 * PhET's radio-wave source control under the magnet: power on the left, frequency on the
 * right, and the wave/photon view choice in the middle. Releasing the frequency slider
 * near resonance snaps it onto resonance when that preference is on.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { HBox, Text, VBox } from "scenerystack/scenery";
import { Panel } from "scenerystack/sun";
import { StringManager } from "../../i18n/StringManager.js";
import SimplifiedMRIColors from "../../SimplifiedMRIColors.js";
import { FONTS, PANEL_CORNER_RADIUS, RADIO } from "../../SimplifiedMRIConstants.js";
import type { RadioView, ResonanceModel } from "../model/ResonanceModel.js";
import { createNumberControl, createRadioButtonGroup } from "./controlHelpers.js";

const SLIDER_CONTROL_WIDTH = 170;

export class RadioSourcePanel extends Panel {
  public constructor(model: ResonanceModel, snapToResonanceProperty: TReadOnlyProperty<boolean>) {
    const strings = StringManager.getInstance().getCommonStrings();
    const a11y = StringManager.getInstance().getCommonA11yStrings();

    const powerControl = createNumberControl(model.powerProperty, RADIO.POWER_RANGE, {
      titleProperty: strings.powerStringProperty,
      valuePatternProperty: strings.percentPatternStringProperty,
      accessibleName: a11y.powerStringProperty,
      accessibleHelpText: a11y.powerHelpStringProperty,
      decimalPlaces: 0,
      delta: 1,
      width: SLIDER_CONTROL_WIDTH,
      majorTicks: [0, 50, 100].map((value) => ({ value, label: `${value}` })),
    });

    const frequencyControl = createNumberControl(model.frequencyProperty, RADIO.FREQUENCY_RANGE, {
      titleProperty: strings.frequencyStringProperty,
      valuePatternProperty: strings.megahertzPatternStringProperty,
      accessibleName: a11y.frequencyStringProperty,
      accessibleHelpText: a11y.frequencyHelpStringProperty,
      decimalPlaces: 1,
      delta: 0.1,
      width: SLIDER_CONTROL_WIDTH,
      majorTicks: [1, 40, 80, 130].map((value) => ({ value, label: `${value}` })),
      endDrag: () => {
        if (snapToResonanceProperty.value) {
          model.snapFrequency();
        }
      },
    });

    const viewRadio = createRadioButtonGroup<RadioView>(
      model.radioViewProperty,
      [
        { value: "wave", labelProperty: strings.waveViewStringProperty, accessibleName: a11y.waveViewStringProperty },
        {
          value: "photon",
          labelProperty: strings.photonViewStringProperty,
          accessibleName: a11y.photonViewStringProperty,
        },
      ],
      {
        accessibleName: a11y.radioViewStringProperty,
        accessibleHelpText: a11y.radioViewHelpStringProperty,
        width: 130,
      },
    );

    const title = new Text(strings.radioSourceStringProperty, {
      font: FONTS.PANEL_TITLE,
      fill: SimplifiedMRIColors.textColorProperty,
      maxWidth: 120,
    });

    super(
      new HBox({
        spacing: 10,
        align: "center",
        children: [powerControl, new VBox({ spacing: 10, children: [title, viewRadio] }), frequencyControl],
      }),
      {
        fill: SimplifiedMRIColors.sourceFillColorProperty,
        stroke: SimplifiedMRIColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: 10,
        yMargin: 8,
      },
    );
  }
}
