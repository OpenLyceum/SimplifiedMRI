/**
 * ResonanceScreenView.ts
 *
 * The play area shared by the NMR and MRI screens, laid out as in PhET:
 *
 *   upper main coil
 *   sample chamber (nuclei, field arrows, radio waves)
 *   [room for the MRI screen's horizontal gradient coil]
 *   lower main coil
 *   radio-wave source panel
 *
 * The right-hand column of panels belongs to each subclass, which adds its panels through
 * layoutRightColumn(). Time controls and Reset All sit at the bottom right.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Bounds2, Vector2 } from "scenerystack/dot";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Node, Rectangle, VBox } from "scenerystack/scenery";
import { ResetAllButton, TimeControlNode } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import SimplifiedMRIColors from "../../SimplifiedMRIColors.js";
import { CHAMBER, DETECTOR, MAGNET, SCREEN_VIEW_MARGIN } from "../../SimplifiedMRIConstants.js";
import type { ResonanceModel } from "../model/ResonanceModel.js";
import { FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS, FLAT_RESET_ALL_BUTTON_OPTIONS } from "../SimplifiedMRIButtonOptions.js";
import { CoilNode } from "./CoilNode.js";
import { FieldArrowsNode } from "./FieldArrowsNode.js";
import { HintNode } from "./HintNode.js";
import { NucleiLayer } from "./NucleiLayer.js";
import { RadioSourcePanel } from "./RadioSourcePanel.js";
import { RadioWavesNode } from "./RadioWavesNode.js";

/** Vertical layout of the magnet assembly (view px). */
export const LAYOUT = {
  TOP: 14,
  MAIN_COIL_THICKNESS: 22,
  GRADIENT_COIL_THICKNESS: 16,
  GAP: 3,

  /** Left edge of the chamber, leaving room for the vertical gradient coil. */
  CHAMBER_LEFT: 52,
  VERTICAL_COIL_LEFT: 22,

  /** Left edge of the right-hand column of panels. */
  RIGHT_COLUMN_LEFT: 600,
} as const;

export abstract class ResonanceScreenView extends ScreenView {
  protected readonly model: ResonanceModel;
  protected readonly modelViewTransform: ModelViewTransform2;

  /** The chamber in view coordinates. */
  protected readonly chamberViewBounds: Bounds2;

  /** Top of the space between the chamber and the lower main coil (view px). */
  protected readonly gradientCoilTop: number;

  /** Content drawn under the nuclei (the MRI screen's head). */
  protected readonly underNucleiLayer = new Node();

  /** Content drawn beside the chamber (the MRI screen's coils and detector). */
  protected readonly besideChamberLayer = new Node();

  protected readonly nucleiLayer: NucleiLayer;
  protected readonly radioSourcePanel: RadioSourcePanel;
  protected readonly timeControlNode: TimeControlNode;
  protected readonly resetAllButton: ResetAllButton;

  private readonly radioWavesNode: RadioWavesNode;

  protected constructor(
    model: ResonanceModel,
    snapToResonanceProperty: TReadOnlyProperty<boolean>,
    options: ScreenViewOptions,
  ) {
    super(options);
    this.model = model;
    const bounds = this.layoutBounds;

    const chamberTop = bounds.minY + LAYOUT.TOP + LAYOUT.MAIN_COIL_THICKNESS + LAYOUT.GAP;
    const chamberHeight = CHAMBER.HEIGHT * CHAMBER.VIEW_SCALE;
    const chamberLeft = bounds.minX + LAYOUT.CHAMBER_LEFT;
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2(chamberLeft, chamberTop + chamberHeight),
      CHAMBER.VIEW_SCALE,
    );
    this.chamberViewBounds = this.modelViewTransform.modelToViewBounds(
      new Bounds2(0, 0, CHAMBER.WIDTH, CHAMBER.HEIGHT),
    );
    const chamber = this.chamberViewBounds;

    // ── Magnet ──────────────────────────────────────────────────────────────────
    const coilStrengthProperty = new DerivedProperty(
      [model.mainFieldProperty],
      (field) => field / MAGNET.MAIN_FIELD_RANGE.max,
    );
    const upperCoil = new CoilNode(chamber.width, LAYOUT.MAIN_COIL_THICKNESS, "horizontal", coilStrengthProperty, {
      left: chamber.minX,
      bottom: chamber.minY - LAYOUT.GAP,
    });
    this.gradientCoilTop = chamber.maxY + LAYOUT.GAP;
    const lowerCoil = new CoilNode(chamber.width, LAYOUT.MAIN_COIL_THICKNESS, "horizontal", coilStrengthProperty, {
      left: chamber.minX,
      top: this.gradientCoilTop + LAYOUT.GRADIENT_COIL_THICKNESS + LAYOUT.GAP,
    });

    const chamberRectangle = Rectangle.bounds(chamber, {
      fill: SimplifiedMRIColors.chamberFillColorProperty,
      stroke: SimplifiedMRIColors.chamberStrokeColorProperty,
    });

    // ── Chamber contents ────────────────────────────────────────────────────────
    this.nucleiLayer = new NucleiLayer(model, this.modelViewTransform);
    const fieldArrows = new FieldArrowsNode(model, this.modelViewTransform);
    const detectorFaceX = this.modelViewTransform.modelToViewX(CHAMBER.WIDTH + DETECTOR.GAP);
    this.radioWavesNode = new RadioWavesNode(model, this.modelViewTransform, detectorFaceX);

    // ── Radio-wave source ───────────────────────────────────────────────────────
    this.radioSourcePanel = new RadioSourcePanel(model, snapToResonanceProperty);
    this.radioSourcePanel.left = bounds.minX + SCREEN_VIEW_MARGIN;
    this.radioSourcePanel.top = lowerCoil.bottom + 8;

    const hint = new HintNode(
      StringManager.getInstance().getCommonStrings().hintStringProperty,
      model.hintVisibleProperty,
    );
    hint.setPointerTip(this.radioSourcePanel.left + 110, this.radioSourcePanel.top + 4);

    // ── Time controls and Reset All ─────────────────────────────────────────────
    this.timeControlNode = new TimeControlNode(model.timer.isPlayingProperty, {
      playPauseStepButtonOptions: {
        ...FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS,
        stepForwardButtonOptions: {
          ...FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS.stepForwardButtonOptions,
          listener: () => model.stepOnce(),
        },
      },
    });
    this.resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        this.reset();
      },
      right: bounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: bounds.maxY - SCREEN_VIEW_MARGIN,
    });
    this.timeControlNode.right = this.resetAllButton.left - 30;
    this.timeControlNode.centerY = this.resetAllButton.centerY;

    this.children = [
      chamberRectangle,
      this.underNucleiLayer,
      fieldArrows,
      this.nucleiLayer,
      this.radioWavesNode,
      upperCoil,
      lowerCoil,
      this.besideChamberLayer,
      this.radioSourcePanel,
      hint,
      this.timeControlNode,
      this.resetAllButton,
    ];
  }

  /** Stacks the subclass's panels in the right-hand column. */
  protected layoutRightColumn(panels: readonly Node[]): VBox {
    const column = new VBox({
      spacing: 8,
      align: "left",
      stretch: true,
      children: [...panels],
      left: this.layoutBounds.minX + LAYOUT.RIGHT_COLUMN_LEFT,
      top: this.layoutBounds.minY + LAYOUT.TOP,
    });
    this.addChild(column);
    return column;
  }

  /** Resets view-only state. */
  public reset(): void {
    // All view state lives in the model.
  }

  public override step(dt: number): void {
    this.nucleiLayer.update();
    this.radioWavesNode.update(this.model.timer.isPlayingProperty.value ? dt : 0);
  }
}
