/**
 * SimplifiedMRIPreferencesNode.ts
 *
 * Content of Preferences → Simulation: the snap-to-resonance toggle and its description.
 */

import { RichText, Text, VBox } from "scenerystack/scenery";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { StringManager } from "../i18n/StringManager.js";
import SimplifiedMRIColors from "../SimplifiedMRIColors.js";
import { FONTS, PREFERENCES_LAYOUT } from "../SimplifiedMRIConstants.js";
import SimplifiedMRINamespace from "../SimplifiedMRINamespace.js";
import type { SimplifiedMRIPreferencesModel } from "./SimplifiedMRIPreferencesModel.js";

export class SimplifiedMRIPreferencesNode extends VBox {
  public constructor(preferencesModel: SimplifiedMRIPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    const header = new Text(prefStrings.titleStringProperty, {
      font: FONTS.PREFERENCES_TITLE,
      fill: SimplifiedMRIColors.controlSurfaceTextColorProperty,
    });

    const snapCheckbox = new Checkbox(
      preferencesModel.snapToResonanceProperty,
      new Text(prefStrings.snapToResonanceStringProperty, {
        font: FONTS.PREFERENCES_LABEL,
        fill: SimplifiedMRIColors.controlSurfaceTextColorProperty,
      }),
      {
        checkboxColor: SimplifiedMRIColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: SimplifiedMRIColors.controlSurfaceColorProperty,
        spacing: PREFERENCES_LAYOUT.CONTROL_SPACING,
        accessibleHelpText: prefStrings.snapToResonanceDescriptionStringProperty,
        ...(tandem && { tandem: tandem.createTandem("snapToResonanceCheckbox") }),
      },
    );

    const description = new RichText(prefStrings.snapToResonanceDescriptionStringProperty, {
      font: FONTS.PREFERENCES_DESCRIPTION,
      fill: SimplifiedMRIColors.controlSurfaceTextColorProperty,
      lineWrap: PREFERENCES_LAYOUT.DESCRIPTION_WIDTH,
    });

    super({
      align: "left",
      spacing: PREFERENCES_LAYOUT.SECTION_SPACING,
      children: [header, snapCheckbox, description],
    });
  }
}

SimplifiedMRINamespace.register("SimplifiedMRIPreferencesNode", SimplifiedMRIPreferencesNode);
