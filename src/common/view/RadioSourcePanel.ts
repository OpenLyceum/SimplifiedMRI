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
import { FONTS, PANEL_CORNER_RADIUS, RADIO, RADIO_CONTROLS, READOUT_PRECISION } from "../../SimplifiedMRIConstants.js";
import type { RadioView, ResonanceModel } from "../model/ResonanceModel.js";
import { createNumberControl, createRadioButtonGroup } from "./controlHelpers.js";

export class RadioSourcePanel extends Panel {
  public constructor(model: ResonanceModel, snapToResonanceProperty: TReadOnlyProperty<boolean>) {
    const strings = StringManager.getInstance().getCommonStrings();
    const a11y = StringManager.getInstance().getCommonA11yStrings();

    const powerControl = createNumberControl(model.powerProperty, RADIO.POWER_RANGE, {
      titleProperty: strings.powerStringProperty,
      valuePatternProperty: strings.percentPatternStringProperty,
      accessibleName: a11y.powerStringProperty,
      accessibleHelpText: a11y.powerHelpStringProperty,
      decimalPlaces: READOUT_PRECISION.POWER,
      delta: RADIO_CONTROLS.POWER_DELTA,
      width: RADIO_CONTROLS.SLIDER_WIDTH,
      majorTicks: RADIO_CONTROLS.POWER_TICKS.map((value) => ({ value, label: `${value}` })),
    });

    const frequencyControl = createNumberControl(model.frequencyProperty, RADIO.FREQUENCY_RANGE, {
      titleProperty: strings.frequencyStringProperty,
      valuePatternProperty: strings.megahertzPatternStringProperty,
      accessibleName: a11y.frequencyStringProperty,
      accessibleHelpText: a11y.frequencyHelpStringProperty,
      decimalPlaces: READOUT_PRECISION.FREQUENCY,
      delta: RADIO_CONTROLS.FREQUENCY_DELTA,
      width: RADIO_CONTROLS.SLIDER_WIDTH,
      majorTicks: RADIO_CONTROLS.FREQUENCY_TICKS.map((value) => ({ value, label: `${value}` })),
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
        width: RADIO_CONTROLS.VIEW_RADIO_WIDTH,
      },
    );

    const title = new Text(strings.radioSourceStringProperty, {
      font: FONTS.PANEL_TITLE,
      fill: SimplifiedMRIColors.textColorProperty,
      maxWidth: RADIO_CONTROLS.VIEW_LABEL_WIDTH,
    });

    super(
      new HBox({
        spacing: RADIO_CONTROLS.SPACING,
        align: "center",
        children: [
          powerControl,
          new VBox({ spacing: RADIO_CONTROLS.SPACING, children: [title, viewRadio] }),
          frequencyControl,
        ],
      }),
      {
        fill: SimplifiedMRIColors.sourceFillColorProperty,
        stroke: SimplifiedMRIColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: RADIO_CONTROLS.X_MARGIN,
        yMargin: RADIO_CONTROLS.Y_MARGIN,
      },
    );
  }
}
