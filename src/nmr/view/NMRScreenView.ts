/**
 * NMRScreenView.ts
 *
 * The NMR screen: the shared magnet and chamber (ResonanceScreenView), with a right-hand
 * column holding the energy-level diagram, the main-magnet control, the sample-nucleus
 * choice and the display options.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { Node, Text, VBox } from "scenerystack/scenery";
import type { ScreenViewOptions } from "scenerystack/sim";
import { ComboBox } from "scenerystack/sun";
import { NucleusType } from "../../common/model/NucleusType.js";
import { SIMPLIFIED_MRI_COMBO_BOX_OPTIONS } from "../../common/SimplifiedMRIButtonOptions.js";
import { SimplifiedMRIPanel } from "../../common/SimplifiedMRIPanel.js";
import { createCheckbox, createPanelTitle } from "../../common/view/controlHelpers.js";
import { MainMagnetPanel } from "../../common/view/MainMagnetPanel.js";
import { ResonanceScreenView } from "../../common/view/ResonanceScreenView.js";
import { StringManager } from "../../i18n/StringManager.js";
import SimplifiedMRIColors from "../../SimplifiedMRIColors.js";
import { CONTROL_WIDTH, FONTS, RESONANCE } from "../../SimplifiedMRIConstants.js";
import type { NMRModel } from "../model/NMRModel.js";
import { EnergyLevelDiagram } from "./EnergyLevelDiagram.js";
import { NMRScreenSummaryContent } from "./NMRScreenSummaryContent.js";

export type NMRScreenViewOptions = ScreenViewOptions;

export class NMRScreenView extends ResonanceScreenView {
  public constructor(
    model: NMRModel,
    snapToResonanceProperty: TReadOnlyProperty<boolean>,
    providedOptions?: NMRScreenViewOptions,
  ) {
    const options = optionize<NMRScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new NMRScreenSummaryContent(model) },
      providedOptions,
    );
    super(model, snapToResonanceProperty, options);

    const sm = StringManager.getInstance();
    const strings = sm.getCommonStrings();
    const a11y = sm.getCommonA11yStrings();

    const energyPanel = new SimplifiedMRIPanel(new EnergyLevelDiagram(model));
    const magnetPanel = new MainMagnetPanel(model, snapToResonanceProperty);

    // Sample nucleus.
    const listParent = new Node();
    const nucleusItems = NucleusType.enumeration.values.map((type) => ({
      value: type,
      createNode: () =>
        new Text(strings.nuclei[`${type.key}StringProperty` as keyof typeof strings.nuclei], {
          font: FONTS.CONTROL_LABEL,
          fill: SimplifiedMRIColors.controlSurfaceTextColorProperty,
          maxWidth: CONTROL_WIDTH - 60,
        }),
      accessibleName: strings.nuclei[`${type.key}StringProperty` as keyof typeof strings.nuclei],
    }));
    const nucleusComboBox = new ComboBox(model.nucleusTypeProperty, nucleusItems, listParent, {
      ...SIMPLIFIED_MRI_COMBO_BOX_OPTIONS,
      accessibleName: a11y.nucleusStringProperty,
      accessibleHelpText: a11y.nucleusHelpStringProperty,
    });
    const nucleusPanel = new SimplifiedMRIPanel(
      new VBox({
        spacing: 6,
        align: "left",
        children: [createPanelTitle(strings.sampleNucleusStringProperty), nucleusComboBox],
      }),
    );

    const fieldCheckbox = createCheckbox(
      model.fieldArrowsVisibleProperty,
      strings.fieldArrowsStringProperty,
      a11y.fieldArrowsStringProperty,
    );
    const precessionCheckbox = createCheckbox(
      model.precessionVisibleProperty,
      strings.precessionStringProperty,
      a11y.precessionStringProperty,
    );
    const showPanel = new SimplifiedMRIPanel(
      new VBox({
        spacing: 6,
        align: "left",
        children: [createPanelTitle(strings.showStringProperty), fieldCheckbox, precessionCheckbox],
      }),
    );

    const panels = [energyPanel, magnetPanel, nucleusPanel, showPanel];
    this.layoutRightColumn(panels);
    this.addChild(listParent);

    // Announce when the source comes onto or goes off resonance.
    const onResonanceProperty = new DerivedProperty(
      [model.lineStrengthProperty, model.powerProperty],
      (strength, power) => strength >= RESONANCE.INDICATOR_THRESHOLD && power > 0,
    );
    onResonanceProperty.lazyLink((onResonance) => {
      this.addAccessibleResponse(onResonance ? a11y.resonanceReachedStringProperty : a11y.resonanceLostStringProperty);
    });

    this.pdomPlayAreaNode.pdomOrder = [this.radioSourcePanel, magnetPanel, nucleusComboBox];
    this.pdomControlAreaNode.pdomOrder = [showPanel, this.timeControlNode, this.resetAllButton];
  }
}
