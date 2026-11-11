/**
 * NMRScreen.ts
 *
 * The NMR screen (PhET's "Simplified NMR" tab). Registered in src/main.ts.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createNMRIcon } from "../common/SimplifiedMRIScreenIcons.js";
import SimplifiedMRIColors from "../SimplifiedMRIColors.js";
import { NMRModel } from "./model/NMRModel.js";
import { NMRKeyboardHelpContent } from "./view/NMRKeyboardHelpContent.js";
import { NMRScreenView } from "./view/NMRScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type NMRScreenOptions = ScreenOptions & { tandem: Tandem };

export class NMRScreen extends Screen<NMRModel, NMRScreenView> {
  public constructor(snapToResonanceProperty: TReadOnlyProperty<boolean>, options: NMRScreenOptions) {
    super(
      () => new NMRModel(),
      (model) => new NMRScreenView(model, snapToResonanceProperty, { tandem: options.tandem.createTandem("view") }),
      optionize<NMRScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: SimplifiedMRIColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new NMRKeyboardHelpContent(),
          homeScreenIcon: createNMRIcon(),
          navigationBarIcon: createNMRIcon(),
        },
        options,
      ),
    );
  }
}
