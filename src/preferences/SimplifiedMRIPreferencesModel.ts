/**
 * SimplifiedMRIPreferencesModel.ts
 *
 * Simulation-specific preferences, shown in Preferences → Simulation. Initial values come
 * from the query parameters. One instance is created in main.ts and shared by the screens.
 */

import { BooleanProperty } from "scenerystack/axon";
import type { Tandem } from "scenerystack/tandem";
import SimplifiedMRINamespace from "../SimplifiedMRINamespace.js";
import simplifiedMRIQueryParameters from "./simplifiedMRIQueryParameters.js";

export class SimplifiedMRIPreferencesModel {
  /** Whether releasing a slider near resonance snaps it onto resonance (PhET's behaviour). */
  public readonly snapToResonanceProperty: BooleanProperty;

  public constructor(tandem?: Tandem) {
    this.snapToResonanceProperty = new BooleanProperty(
      simplifiedMRIQueryParameters.snapToResonance,
      tandem ? { tandem: tandem.createTandem("snapToResonanceProperty") } : undefined,
    );
  }

  public reset(): void {
    this.snapToResonanceProperty.reset();
  }
}

SimplifiedMRINamespace.register("SimplifiedMRIPreferencesModel", SimplifiedMRIPreferencesModel);
