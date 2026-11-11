/**
 * MRIScreenView.ts
 *
 * The MRI screen: the shared magnet and chamber (ResonanceScreenView) with the head under
 * the nuclei, gradient coils below and to the left of the chamber, the detector on the
 * right, and a right-hand column with the main magnet, gradient magnets and head controls.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Bounds2 } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { VBox } from "scenerystack/scenery";
import type { ScreenViewOptions } from "scenerystack/sim";
import { SimplifiedMRIPanel } from "../../common/SimplifiedMRIPanel.js";
import { CoilNode } from "../../common/view/CoilNode.js";
import { createCheckbox, createPanelTitle, createPushButton } from "../../common/view/controlHelpers.js";
import { MainMagnetPanel } from "../../common/view/MainMagnetPanel.js";
import { LAYOUT, ResonanceScreenView } from "../../common/view/ResonanceScreenView.js";
import { StringManager } from "../../i18n/StringManager.js";
import { CHAMBER, DETECTOR, MAGNET } from "../../SimplifiedMRIConstants.js";
import type { MRIModel } from "../model/MRIModel.js";
import { DetectorNode } from "./DetectorNode.js";
import { DetectorPanel } from "./DetectorPanel.js";
import { GradientMagnetsPanel } from "./GradientMagnetsPanel.js";
import { HeadNode } from "./HeadNode.js";
import { MRIScreenSummaryContent } from "./MRIScreenSummaryContent.js";

export type MRIScreenViewOptions = ScreenViewOptions;

export class MRIScreenView extends ResonanceScreenView {
  public constructor(
    model: MRIModel,
    snapToResonanceProperty: TReadOnlyProperty<boolean>,
    providedOptions?: MRIScreenViewOptions,
  ) {
    const options = optionize<MRIScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new MRIScreenSummaryContent(model) },
      providedOptions,
    );
    super(model, snapToResonanceProperty, options);

    const sm = StringManager.getInstance();
    const common = sm.getCommonStrings();
    const commonA11y = sm.getCommonA11yStrings();
    const strings = sm.getMRIStrings();
    const a11y = sm.getMRIA11yStrings();
    const t = this.modelViewTransform;
    const chamber = this.chamberViewBounds;

    // ── Play area additions ─────────────────────────────────────────────────────
    this.underNucleiLayer.addChild(new HeadNode(t, model.headVisibleProperty, model.tumorPresentProperty));
    this.nucleiLayer.visibleProperty = model.nucleiVisibleProperty;

    const horizontalStrength = new DerivedProperty(
      [model.horizontalGradientProperty],
      (gradient) => gradient / MAGNET.GRADIENT_RANGE.max,
    );
    const verticalStrength = new DerivedProperty(
      [model.verticalGradientProperty],
      (gradient) => gradient / MAGNET.GRADIENT_RANGE.max,
    );
    const horizontalCoil = new CoilNode(
      chamber.width,
      LAYOUT.GRADIENT_COIL_THICKNESS,
      "horizontal",
      horizontalStrength,
      {
        segments: 8,
        loops: 3,
        left: chamber.minX,
        top: this.gradientCoilTop,
      },
    );
    const verticalCoil = new CoilNode(chamber.height, LAYOUT.GRADIENT_COIL_THICKNESS, "vertical", verticalStrength, {
      segments: 7,
      loops: 3,
      left: this.layoutBounds.minX + LAYOUT.VERTICAL_COIL_LEFT,
      top: chamber.minY,
    });

    const detectorBounds = t.modelToViewBounds(
      new Bounds2(
        CHAMBER.WIDTH + DETECTOR.GAP,
        -DETECTOR.OVERHANG_BOTTOM,
        CHAMBER.WIDTH + DETECTOR.GAP + DETECTOR.WIDTH,
        CHAMBER.HEIGHT + DETECTOR.OVERHANG_TOP,
      ),
    );
    const detector = model.detector;
    const detectorNode = detector ? new DetectorNode(detector, detectorBounds) : null;
    this.besideChamberLayer.children = detectorNode
      ? [horizontalCoil, verticalCoil, detectorNode]
      : [horizontalCoil, verticalCoil];

    // ── Right column ────────────────────────────────────────────────────────────
    const magnetPanel = new MainMagnetPanel(model, snapToResonanceProperty);
    const gradientPanel = new GradientMagnetsPanel(model);

    const tumorButtonLabel = new DerivedProperty(
      [model.tumorPresentProperty, strings.addTumorStringProperty, strings.removeTumorStringProperty],
      (present, add, remove) => (present ? remove : add),
    );
    const tumorButton = createPushButton(tumorButtonLabel, {
      accessibleName: tumorButtonLabel,
      accessibleHelpText: a11y.tumorButtonHelpStringProperty,
      listener: () => {
        model.tumorPresentProperty.toggle();
        this.addAccessibleResponse(
          model.tumorPresentProperty.value ? a11y.tumorAddedStringProperty : a11y.tumorRemovedStringProperty,
        );
      },
    });
    const headPanel = new SimplifiedMRIPanel(
      new VBox({
        spacing: 6,
        align: "left",
        children: [
          createPanelTitle(common.showStringProperty),
          createCheckbox(model.headVisibleProperty, strings.showHeadStringProperty, a11y.showHeadStringProperty),
          createCheckbox(model.nucleiVisibleProperty, strings.showNucleiStringProperty, a11y.showNucleiStringProperty),
          createCheckbox(
            model.fieldArrowsVisibleProperty,
            common.fieldArrowsStringProperty,
            commonA11y.fieldArrowsStringProperty,
          ),
          createCheckbox(
            model.precessionVisibleProperty,
            common.precessionStringProperty,
            commonA11y.precessionStringProperty,
          ),
          tumorButton,
        ],
      }),
    );

    const panels = detector
      ? [magnetPanel, gradientPanel, new DetectorPanel(detector), headPanel]
      : [magnetPanel, gradientPanel, headPanel];
    this.layoutRightColumn(panels);

    this.pdomPlayAreaNode.pdomOrder = [this.radioSourcePanel, magnetPanel, gradientPanel, tumorButton];
    this.pdomControlAreaNode.pdomOrder = [headPanel, this.timeControlNode, this.resetAllButton];
  }
}
