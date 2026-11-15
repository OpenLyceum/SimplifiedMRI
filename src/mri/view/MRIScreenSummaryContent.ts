/**
 * MRIScreenSummaryContent.ts
 *
 * Screen summary for the MRI screen. The current-details paragraph reports the fields,
 * the source settings, the detector rate and whether a tumour is present.
 */

import { DerivedProperty } from "scenerystack/axon";
import { toFixed } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import { READOUT_PRECISION } from "../../SimplifiedMRIConstants.js";
import type { MRIModel } from "../model/MRIModel.js";

export class MRIScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: MRIModel) {
    const a11y = StringManager.getInstance().getMRIA11yStrings();
    const countProperty = model.detector?.countProperty ?? model.alignedCountProperty;
    const currentDetailsProperty = new DerivedProperty(
      [
        a11y.currentDetailsPatternStringProperty,
        a11y.tumorPresentStringProperty,
        a11y.tumorAbsentStringProperty,
        model.mainFieldProperty,
        model.horizontalGradientProperty,
        model.verticalGradientProperty,
        model.frequencyProperty,
        model.powerProperty,
        countProperty,
        model.tumorPresentProperty,
      ],
      (pattern, present, absent, field, horizontal, vertical, frequency, power, count, tumor) =>
        StringUtils.fillIn(pattern, {
          field: toFixed(field, READOUT_PRECISION.FIELD),
          horizontal: toFixed(horizontal, READOUT_PRECISION.GRADIENT),
          vertical: toFixed(vertical, READOUT_PRECISION.GRADIENT),
          frequency: toFixed(frequency, READOUT_PRECISION.FREQUENCY),
          power: toFixed(power, READOUT_PRECISION.POWER),
          count,
          tumor: tumor ? present : absent,
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
