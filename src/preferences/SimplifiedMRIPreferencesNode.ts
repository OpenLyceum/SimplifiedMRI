/**
 * SimplifiedMRIPreferencesNode.ts
 *
 * Content of Preferences → Simulation: the snap-to-resonance toggle and its description.
 */

import { RichText, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { StringManager } from "../i18n/StringManager.js";
import SimplifiedMRIColors from "../SimplifiedMRIColors.js";
import SimplifiedMRINamespace from "../SimplifiedMRINamespace.js";
import type { SimplifiedMRIPreferencesModel } from "./SimplifiedMRIPreferencesModel.js";

export class SimplifiedMRIPreferencesNode extends VBox {
  public constructor(preferencesModel: SimplifiedMRIPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: 18, weight: "bold" }),
      fill: SimplifiedMRIColors.controlSurfaceTextColorProperty,
    });

    const snapCheckbox = new Checkbox(
      preferencesModel.snapToResonanceProperty,
      new Text(prefStrings.snapToResonanceStringProperty, {
        font: new PhetFont(16),
        fill: SimplifiedMRIColors.controlSurfaceTextColorProperty,
      }),
      {
        checkboxColor: SimplifiedMRIColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: SimplifiedMRIColors.controlSurfaceColorProperty,
        spacing: 8,
        accessibleHelpText: prefStrings.snapToResonanceDescriptionStringProperty,
        ...(tandem && { tandem: tandem.createTandem("snapToResonanceCheckbox") }),
      },
    );

    const description = new RichText(prefStrings.snapToResonanceDescriptionStringProperty, {
      font: new PhetFont(14),
      fill: SimplifiedMRIColors.controlSurfaceTextColorProperty,
      lineWrap: 520,
    });

    super({
      align: "left",
      spacing: 12,
      children: [header, snapCheckbox, description],
    });
  }
}

SimplifiedMRINamespace.register("SimplifiedMRIPreferencesNode", SimplifiedMRIPreferencesNode);
