/**
 * MRIScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createMRIIcon() in src/common/SimplifiedMRIScreenIcons.ts
 * (see doc/multi-screen.md).
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createMRIIcon } from "../common/SimplifiedMRIScreenIcons.js";
import SimplifiedMRIColors from "../SimplifiedMRIColors.js";
import { MRIModel } from "./model/MRIModel.js";
import { MRIKeyboardHelpContent } from "./view/MRIKeyboardHelpContent.js";
import { MRIScreenView } from "./view/MRIScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type MRIScreenOptions = ScreenOptions & { tandem: Tandem };

export class MRIScreen extends Screen<MRIModel, MRIScreenView> {
  public constructor(snapToResonanceProperty: TReadOnlyProperty<boolean>, options: MRIScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new MRIModel(),
      // View factory — receives the model instance
      (model) => new MRIScreenView(model, snapToResonanceProperty, { tandem: options.tandem.createTandem("view") }),
      optionize<MRIScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: SimplifiedMRIColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new MRIKeyboardHelpContent(),
          homeScreenIcon: createMRIIcon(),
          navigationBarIcon: createMRIIcon(),
        },
        options,
      ),
    );
  }
}
