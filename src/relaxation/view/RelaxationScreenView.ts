/**
 * RelaxationScreenView.ts
 *
 * Layout:
 *
 *   left     the Bloch sphere, with readouts and notes below it
 *   middle   the longitudinal and transverse charts
 *   right    tissue and relaxation times, the RF pulse, display options;
 *            time controls (with speed) and Reset All at the bottom
 */

import { DerivedProperty, Multilink } from "scenerystack/axon";
import { toFixed } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, Node, RichText, Text, VBox } from "scenerystack/scenery";
import { ResetAllButton, TimeControlNode, TimeSpeed } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { ComboBox } from "scenerystack/sun";
import { NucleusType } from "../../common/model/NucleusType.js";
import { larmorFrequency } from "../../common/model/resonancePhysics.js";
import {
  FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS,
  FLAT_RESET_ALL_BUTTON_OPTIONS,
  SIMPLIFIED_MRI_COMBO_BOX_OPTIONS,
  TIME_CONTROL_SPEED_RADIO_OPTIONS,
} from "../../common/SimplifiedMRIButtonOptions.js";
import { SimplifiedMRIPanel } from "../../common/SimplifiedMRIPanel.js";
import {
  createCheckbox,
  createNumberControl,
  createPanelTitle,
  createPushButton,
} from "../../common/view/controlHelpers.js";
import { StringManager } from "../../i18n/StringManager.js";
import SimplifiedMRIColors from "../../SimplifiedMRIColors.js";
import { CONTROL_WIDTH, FONTS, RELAXATION, SCREEN_VIEW_MARGIN } from "../../SimplifiedMRIConstants.js";
import type { RelaxationModel } from "../model/RelaxationModel.js";
import { Tissue } from "../model/Tissue.js";
import { BlochSphereNode } from "./BlochSphereNode.js";
import { createLogTimeControl } from "./createLogTimeControl.js";
import { RelaxationChartsNode } from "./RelaxationChartsNode.js";
import { RelaxationScreenSummaryContent } from "./RelaxationScreenSummaryContent.js";

export type RelaxationScreenViewOptions = ScreenViewOptions;

const SPHERE_RADIUS = 125;

export class RelaxationScreenView extends ScreenView {
  private readonly sphere: BlochSphereNode;
  private readonly charts: RelaxationChartsNode;

  public constructor(model: RelaxationModel, providedOptions?: RelaxationScreenViewOptions) {
    const options = optionize<RelaxationScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      { screenSummaryContent: new RelaxationScreenSummaryContent(model) },
      providedOptions,
    );
    super(options);
    const bounds = this.layoutBounds;
    const sm = StringManager.getInstance();
    const strings = sm.getRelaxationStrings();
    const a11y = sm.getRelaxationA11yStrings();

    // ── Sphere and its notes ────────────────────────────────────────────────────
    this.sphere = new BlochSphereNode(model, SPHERE_RADIUS);
    this.sphere.x = bounds.minX + SCREEN_VIEW_MARGIN + SPHERE_RADIUS * 1.25;
    this.sphere.y = bounds.minY + SCREEN_VIEW_MARGIN + SPHERE_RADIUS * 1.6;

    const readout = new RichText(
      new DerivedProperty(
        [strings.readoutPatternStringProperty, model.mzProperty, model.mxyProperty],
        (pattern, mz, mxy) => StringUtils.fillIn(pattern, { mz: toFixed(mz, 2), mxy: toFixed(mxy, 2) }),
      ),
      { font: FONTS.READOUT_VALUE, fill: SimplifiedMRIColors.textColorProperty, maxWidth: 2.4 * SPHERE_RADIUS },
    );
    const larmor = new Text(
      new DerivedProperty([strings.larmorPatternStringProperty], (pattern) =>
        StringUtils.fillIn(pattern, {
          field: toFixed(RELAXATION.FIELD, 1),
          frequency: toFixed(larmorFrequency(NucleusType.HYDROGEN_1.gyromagneticRatio, RELAXATION.FIELD), 1),
        }),
      ),
      { font: FONTS.READOUT, fill: SimplifiedMRIColors.secondaryTextColorProperty, maxWidth: 2.4 * SPHERE_RADIUS },
    );
    const precessionNote = new Text(strings.precessionNoteStringProperty, {
      font: FONTS.SMALL,
      fill: SimplifiedMRIColors.secondaryTextColorProperty,
      maxWidth: 2.4 * SPHERE_RADIUS,
      visibleProperty: DerivedProperty.not(model.rotatingFrameProperty),
    });
    const pulseHint = new Text(strings.pulseHintStringProperty, {
      font: FONTS.HINT,
      fill: SimplifiedMRIColors.accentColorProperty,
      maxWidth: 2.4 * SPHERE_RADIUS,
    });
    const notes = new VBox({ spacing: 4, align: "left", children: [readout, larmor, precessionNote, pulseHint] });
    notes.left = bounds.minX + SCREEN_VIEW_MARGIN;
    notes.top = this.sphere.y + SPHERE_RADIUS * 1.15 + 14;

    // ── Charts ──────────────────────────────────────────────────────────────────
    this.charts = new RelaxationChartsNode(model);
    this.charts.left = bounds.minX + 2.6 * SPHERE_RADIUS + 70;
    this.charts.top = bounds.minY + SCREEN_VIEW_MARGIN;

    // ── Tissue panel ────────────────────────────────────────────────────────────
    const listParent = new Node();
    const tissueItems = Tissue.enumeration.values.map((tissue) => {
      const name = strings.tissues[`${tissue.key}StringProperty` as keyof typeof strings.tissues];
      return {
        value: tissue,
        createNode: () =>
          new Text(name, {
            font: FONTS.CONTROL_LABEL,
            fill: SimplifiedMRIColors.controlSurfaceTextColorProperty,
            maxWidth: CONTROL_WIDTH - 60,
          }),
        accessibleName: name,
      };
    });
    const tissueComboBox = new ComboBox(model.tissueProperty, tissueItems, listParent, {
      ...SIMPLIFIED_MRI_COMBO_BOX_OPTIONS,
      accessibleName: a11y.tissueStringProperty,
      accessibleHelpText: a11y.tissueHelpStringProperty,
    });
    const t1Control = createLogTimeControl(model.t1Property, RELAXATION.T1_RANGE, {
      titleProperty: strings.t1StringProperty,
      patternProperty: strings.millisecondsPatternStringProperty,
      accessibleName: a11y.t1StringProperty,
      accessibleHelpText: a11y.t1HelpStringProperty,
    });
    const t2Control = createLogTimeControl(model.t2Property, RELAXATION.T2_RANGE, {
      titleProperty: strings.t2StringProperty,
      patternProperty: strings.millisecondsPatternStringProperty,
      accessibleName: a11y.t2StringProperty,
      accessibleHelpText: a11y.t2HelpStringProperty,
    });
    const tissuePanel = new SimplifiedMRIPanel(
      new VBox({
        spacing: 8,
        align: "left",
        children: [createPanelTitle(strings.tissueStringProperty), tissueComboBox, t1Control, t2Control],
      }),
    );

    // ── RF pulse panel ──────────────────────────────────────────────────────────
    const flipAngleControl = createNumberControl(model.flipAngleProperty, RELAXATION.FLIP_ANGLE_RANGE, {
      titleProperty: strings.flipAngleStringProperty,
      valuePatternProperty: strings.degreesPatternStringProperty,
      accessibleName: a11y.flipAngleStringProperty,
      accessibleHelpText: a11y.flipAngleHelpStringProperty,
      decimalPlaces: 0,
      delta: 5,
      majorTicks: [10, 90, 180].map((value) => ({ value, label: `${value}°` })),
    });
    const notPulsingProperty = DerivedProperty.not(model.pulseActiveProperty);
    const pulseButton = createPushButton(strings.applyPulseStringProperty, {
      accessibleName: a11y.applyPulseStringProperty,
      accessibleHelpText: a11y.applyPulseHelpStringProperty,
      enabledProperty: notPulsingProperty,
      maxTextWidth: CONTROL_WIDTH / 2 - 24,
      listener: () => {
        model.applyPulse();
        this.addAccessibleResponse(a11y.pulseAppliedStringProperty);
      },
    });
    const equilibriumButton = createPushButton(strings.equilibriumStringProperty, {
      accessibleName: a11y.equilibriumStringProperty,
      accessibleHelpText: a11y.equilibriumHelpStringProperty,
      maxTextWidth: CONTROL_WIDTH / 2 - 24,
      listener: () => {
        model.returnToEquilibrium();
        this.sphere.clearTrail();
      },
    });
    const pulsePanel = new SimplifiedMRIPanel(
      new VBox({
        spacing: 8,
        align: "left",
        children: [
          createPanelTitle(strings.rfPulseStringProperty),
          flipAngleControl,
          new HBox({ spacing: 8, children: [pulseButton, equilibriumButton] }),
        ],
      }),
    );

    // ── Display options ─────────────────────────────────────────────────────────
    const rotatingCheckbox = createCheckbox(
      model.rotatingFrameProperty,
      strings.rotatingFrameStringProperty,
      a11y.rotatingFrameStringProperty,
    );
    rotatingCheckbox.accessibleHelpText = a11y.rotatingFrameHelpStringProperty;
    const showPanel = new SimplifiedMRIPanel(
      new VBox({
        spacing: 6,
        align: "left",
        children: [
          createPanelTitle(sm.getCommonStrings().showStringProperty),
          rotatingCheckbox,
          createCheckbox(
            model.isochromatsVisibleProperty,
            strings.isochromatsStringProperty,
            a11y.isochromatsStringProperty,
          ),
          createCheckbox(model.signalVisibleProperty, strings.signalStringProperty, a11y.signalStringProperty),
        ],
      }),
    );

    const panels = [tissuePanel, pulsePanel, showPanel];
    const column = new VBox({ spacing: 8, align: "left", stretch: true, children: panels });
    column.right = bounds.maxX - SCREEN_VIEW_MARGIN;
    column.top = bounds.minY + 14;

    // ── Time controls and Reset All ─────────────────────────────────────────────
    const timeControlNode = new TimeControlNode(model.timer.isPlayingProperty, {
      timeSpeedProperty: model.timeSpeedProperty,
      timeSpeeds: [TimeSpeed.FAST, TimeSpeed.NORMAL, TimeSpeed.SLOW],
      ...TIME_CONTROL_SPEED_RADIO_OPTIONS,
      playPauseStepButtonOptions: {
        ...FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS,
        stepForwardButtonOptions: {
          ...FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS.stepForwardButtonOptions,
          listener: () => model.stepOnce(),
        },
      },
    });
    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        this.reset();
      },
      right: bounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: bounds.maxY - SCREEN_VIEW_MARGIN,
    });
    timeControlNode.left = this.charts.left;
    timeControlNode.centerY = resetAllButton.centerY;

    // The pulse hint shows until the first pulse.
    Multilink.multilink([model.pulseActiveProperty, model.mzProperty], () => {
      pulseHint.visible = model.tissueTime === null && !model.pulseActiveProperty.value;
    });

    this.children = [this.sphere, notes, this.charts, column, timeControlNode, resetAllButton, listParent];

    this.pdomPlayAreaNode.pdomOrder = [
      tissueComboBox,
      t1Control,
      t2Control,
      flipAngleControl,
      pulseButton,
      equilibriumButton,
    ];
    this.pdomControlAreaNode.pdomOrder = [showPanel, timeControlNode, resetAllButton];
  }

  public reset(): void {
    this.sphere.clearTrail();
  }

  public override step(_dt: number): void {
    this.sphere.update();
    this.charts.update();
  }
}
