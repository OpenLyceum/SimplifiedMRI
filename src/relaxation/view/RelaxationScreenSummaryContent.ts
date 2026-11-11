/**
 * RelaxationScreenSummaryContent.ts
 *
 * Screen summary for the Relaxation screen. The current-details paragraph reports the
 * tissue, its relaxation times and the magnetization.
 */

import { DerivedProperty } from "scenerystack/axon";
import { toFixed } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import type { RelaxationModel } from "../model/RelaxationModel.js";
import { Tissue } from "../model/Tissue.js";

export class RelaxationScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: RelaxationModel) {
    const sm = StringManager.getInstance();
    const a11y = sm.getRelaxationA11yStrings();
    const tissues = sm.getRelaxationStrings().tissues;
    const tissueNameProperty = new DerivedProperty(
      [
        model.tissueProperty,
        tissues.fatStringProperty,
        tissues.whiteMatterStringProperty,
        tissues.grayMatterStringProperty,
        tissues.muscleStringProperty,
        tissues.bloodStringProperty,
        tissues.csfStringProperty,
        tissues.customStringProperty,
      ],
      (tissue, ...names) => {
        const index = Tissue.enumeration.values.indexOf(tissue);
        return names[index] ?? "";
      },
    );
    const currentDetailsProperty = new DerivedProperty(
      [
        a11y.currentDetailsPatternStringProperty,
        tissueNameProperty,
        model.t1Property,
        model.t2Property,
        model.mzProperty,
        model.mxyProperty,
      ],
      (pattern, tissue, t1, t2, mz, mxy) =>
        StringUtils.fillIn(pattern, { tissue, t1, t2, mz: toFixed(mz, 2), mxy: toFixed(mxy, 2) }),
    );
    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
