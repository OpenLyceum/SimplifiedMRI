/**
 * MRIModel.ts
 *
 * The MRI screen (PhET's "Simplified MRI" tab): a head full of hydrogen nuclei, horizontal and
 * vertical gradient magnets that make the resonance frequency depend on position, a detector
 * that counts the photons relaxing nuclei emit, and an optional tumour of denser nuclei.
 */

import { BooleanProperty } from "scenerystack/axon";
import type { Random } from "scenerystack/dot";
import { Detector } from "../../common/model/Detector.js";
import { Nucleus } from "../../common/model/Nucleus.js";
import { ResonanceModel } from "../../common/model/ResonanceModel.js";
import { headSpecs, tumorSpecs } from "../../common/model/sampleGeometry.js";

export class MRIModel extends ResonanceModel {
  public readonly tumorPresentProperty = new BooleanProperty(false);
  public readonly headVisibleProperty = new BooleanProperty(true);
  public readonly nucleiVisibleProperty = new BooleanProperty(true);

  public constructor(options?: { random?: Random }) {
    super(headSpecs(), { ...options, detector: new Detector() });

    this.tumorPresentProperty.lazyLink((present) => {
      if (present) {
        for (const spec of tumorSpecs()) {
          this.nuclei.push(new Nucleus(spec.position, spec.spinState, this.random, true));
        }
      } else {
        const tumorNuclei = this.nuclei.filter((nucleus) => nucleus.isTumor);
        for (const nucleus of tumorNuclei) {
          this.nuclei.remove(nucleus);
          nucleus.dispose();
        }
      }
      this.setPopulations();
    });
  }

  public override reset(): void {
    this.tumorPresentProperty.reset();
    this.headVisibleProperty.reset();
    this.nucleiVisibleProperty.reset();
    super.reset();
  }
}
