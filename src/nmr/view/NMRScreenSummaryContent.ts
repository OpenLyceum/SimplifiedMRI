/**
 * NMRScreenSummaryContent.ts
 *
 * Screen summary for the NMR screen. The current-details paragraph reports the field, the
 * source settings, the spin populations and whether the source is on resonance.
 */

import { DerivedProperty } from "scenerystack/axon";
import { toFixed } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import { RESONANCE } from "../../SimplifiedMRIConstants.js";
import type { NMRModel } from "../model/NMRModel.js";

export class NMRScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: NMRModel) {
    const a11y = StringManager.getInstance().getNMRA11yStrings();
    const currentDetailsProperty = new DerivedProperty(
      [
        a11y.currentDetailsPatternStringProperty,
        a11y.onResonanceStringProperty,
        a11y.offResonanceStringProperty,
        model.mainFieldProperty,
        model.frequencyProperty,
        model.powerProperty,
        model.alignedCountProperty,
        model.lineStrengthProperty,
      ],
      (pattern, onText, offText, field, frequency, power, aligned, strength) =>
        StringUtils.fillIn(pattern, {
          field: toFixed(field, 2),
          frequency: toFixed(frequency, 1),
          power: toFixed(power, 0),
          aligned,
          total: model.nuclei.length,
          resonance: strength >= RESONANCE.INDICATOR_THRESHOLD && power > 0 ? onText : offText,
        }),
    );
    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
