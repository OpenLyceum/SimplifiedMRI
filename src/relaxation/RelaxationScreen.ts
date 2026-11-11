/**
 * RelaxationScreen.ts
 *
 * The Relaxation screen, an addition to PhET's two tabs: precession, T1 recovery and T2
 * decay of a tissue's net magnetization after an RF pulse. Registered in src/main.ts.
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createRelaxationIcon } from "../common/SimplifiedMRIScreenIcons.js";
import SimplifiedMRIColors from "../SimplifiedMRIColors.js";
import { RelaxationModel } from "./model/RelaxationModel.js";
import { RelaxationKeyboardHelpContent } from "./view/RelaxationKeyboardHelpContent.js";
import { RelaxationScreenView } from "./view/RelaxationScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type RelaxationScreenOptions = ScreenOptions & { tandem: Tandem };

export class RelaxationScreen extends Screen<RelaxationModel, RelaxationScreenView> {
  public constructor(options: RelaxationScreenOptions) {
    super(
      () => new RelaxationModel(),
      (model) => new RelaxationScreenView(model, { tandem: options.tandem.createTandem("view") }),
      optionize<RelaxationScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: SimplifiedMRIColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new RelaxationKeyboardHelpContent(),
          homeScreenIcon: createRelaxationIcon(),
          navigationBarIcon: createRelaxationIcon(),
        },
        options,
      ),
    );
  }
}
