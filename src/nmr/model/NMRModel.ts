/**
 * NMRModel.ts
 *
 * The NMR screen (PhET's "Simplified NMR" tab): twenty nuclei in a uniform field, a choice of
 * nucleus, and the radio-wave source. Everything else lives in ResonanceModel.
 */

import { ResonanceModel, type ResonanceModelOptions } from "../../common/model/ResonanceModel.js";
import { nmrGridSpecs } from "../../common/model/sampleGeometry.js";

export class NMRModel extends ResonanceModel {
  public constructor(options?: ResonanceModelOptions) {
    super(nmrGridSpecs(), options);
  }
}
