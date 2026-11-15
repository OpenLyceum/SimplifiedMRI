/**
 * controlHelpers.ts
 *
 * Factories for the themed controls used on every screen, so sizes, fonts, colours and
 * accessible names are set in one place.
 */

import type { PhetioProperty, TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2, type Range } from "scenerystack/dot";
import { type Node, RichText, Text } from "scenerystack/scenery";
import { NumberControl } from "scenerystack/scenery-phet";
import { Checkbox, RectangularPushButton, VerticalAquaRadioButtonGroup } from "scenerystack/sun";
import SimplifiedMRIColors from "../../SimplifiedMRIColors.js";
import { CONTROL_WIDTH, CONTROLS, FONTS } from "../../SimplifiedMRIConstants.js";
import { FLAT_RECTANGULAR_BUTTON_OPTIONS, LIGHT_SURFACE_TEXT_FILL } from "../SimplifiedMRIButtonOptions.js";

export type NumberControlConfig = {
  titleProperty: TReadOnlyProperty<string>;
  valuePatternProperty: TReadOnlyProperty<string>;
  accessibleName: TReadOnlyProperty<string>;
  accessibleHelpText: TReadOnlyProperty<string>;
  decimalPlaces: number;

  /** Arrow-button and keyboard step. */
  delta: number;

  /** Major ticks to label under the slider. */
  majorTicks?: readonly { value: number; label: string }[];

  /** Called when a slider drag (or keyboard adjustment) ends. */
  endDrag?: () => void;
  width?: number;

  /** Formats the readout instead of valuePatternProperty (for a log-scale slider). */
  numberFormatter?: (value: number) => string;
  numberFormatterDependencies?: TReadOnlyProperty<unknown>[];

  /** Value read by screen readers, when it differs from the slider's own value. */
  ariaValueText?: (value: number) => string;
};

/** A titled slider with a value readout and arrow buttons. */
export const createNumberControl = (
  property: PhetioProperty<number>,
  range: Range,
  config: NumberControlConfig,
): NumberControl => {
  const width = config.width ?? CONTROL_WIDTH;
  return new NumberControl(config.titleProperty, property, range, {
    layoutFunction: NumberControl.createLayoutFunction4({
      sliderPadding: CONTROLS.SLIDER_PADDING,
      verticalSpacing: CONTROLS.VERTICAL_SPACING,
    }),
    delta: config.delta,
    titleNodeOptions: {
      font: FONTS.CONTROL_TITLE,
      fill: SimplifiedMRIColors.textColorProperty,
      maxWidth: width - CONTROLS.TITLE_WIDTH_INSET,
    },
    numberDisplayOptions: {
      textOptions: {
        font: FONTS.READOUT_VALUE,
        fill: SimplifiedMRIColors.controlSurfaceTextColorProperty,
      },
      backgroundFill: SimplifiedMRIColors.controlSurfaceColorProperty,
      backgroundStroke: SimplifiedMRIColors.panelBorderColorProperty,

      // A number formatter replaces the pattern and decimal places (NumberDisplay forbids both).
      ...(config.numberFormatter
        ? {
            numberFormatter: config.numberFormatter,
            numberFormatterDependencies: config.numberFormatterDependencies ?? [],
          }
        : { valuePattern: config.valuePatternProperty, decimalPlaces: config.decimalPlaces }),
    },
    arrowButtonOptions: { ...FLAT_RECTANGULAR_BUTTON_OPTIONS, scale: CONTROLS.ARROW_BUTTON_SCALE },
    sliderOptions: {
      trackSize: new Dimension2(width - CONTROLS.TRACK_WIDTH_INSET, CONTROLS.TRACK_HEIGHT),
      thumbSize: CONTROLS.THUMB_SIZE,
      thumbFill: SimplifiedMRIColors.accentColorProperty,
      trackFillEnabled: SimplifiedMRIColors.textColorProperty,
      majorTickLength: CONTROLS.TICK_LENGTH,
      majorTickStroke: SimplifiedMRIColors.textColorProperty,
      ...(config.endDrag ? { endDrag: config.endDrag } : {}),
      ...(config.ariaValueText
        ? { pdomCreateAriaValueText: (_mapped: number, value: number) => config.ariaValueText?.(value) ?? "" }
        : {}),
      ...(config.majorTicks
        ? {
            majorTicks: config.majorTicks.map((tick) => ({
              value: tick.value,
              label: new Text(tick.label, { font: FONTS.TICK_LABEL, fill: SimplifiedMRIColors.textColorProperty }),
            })),
          }
        : {}),
    },
    accessibleName: config.accessibleName,
    accessibleHelpText: config.accessibleHelpText,
  });
};

/** A themed checkbox with a text label. */
export const createCheckbox = (
  property: PhetioProperty<boolean>,
  labelProperty: TReadOnlyProperty<string>,
  accessibleName: TReadOnlyProperty<string>,
  width = CONTROL_WIDTH,
): Checkbox =>
  new Checkbox(
    property,
    new Text(labelProperty, {
      font: FONTS.CONTROL_LABEL,
      fill: SimplifiedMRIColors.textColorProperty,
      maxWidth: width - CONTROLS.CHECKBOX_TEXT_INSET,
    }),
    {
      boxWidth: CONTROLS.CHECKBOX_BOX_WIDTH,
      spacing: CONTROLS.LABEL_SPACING,
      checkboxColor: SimplifiedMRIColors.textColorProperty,
      checkboxColorBackground: SimplifiedMRIColors.panelBackgroundColorProperty,
      accessibleName,
    },
  );

/** A flat push button with a text label. */
export const createPushButton = (
  labelProperty: TReadOnlyProperty<string>,
  config: {
    accessibleName: TReadOnlyProperty<string>;
    accessibleHelpText: TReadOnlyProperty<string>;
    enabledProperty?: TReadOnlyProperty<boolean>;
    listener: () => void;
    maxTextWidth?: number;
  },
): RectangularPushButton =>
  new RectangularPushButton({
    ...FLAT_RECTANGULAR_BUTTON_OPTIONS,
    content: new Text(labelProperty, {
      font: FONTS.CONTROL_LABEL,
      fill: LIGHT_SURFACE_TEXT_FILL,
      maxWidth: config.maxTextWidth ?? CONTROL_WIDTH - CONTROLS.BUTTON_TEXT_INSET,
    }),
    baseColor: SimplifiedMRIColors.controlSurfaceColorProperty,
    ...(config.enabledProperty ? { enabledProperty: config.enabledProperty } : {}),
    listener: config.listener,
    accessibleName: config.accessibleName,
    accessibleHelpText: config.accessibleHelpText,
  });

/** A vertical group of themed radio buttons. */
export const createRadioButtonGroup = <T>(
  property: PhetioProperty<T>,
  items: readonly {
    value: T;
    labelProperty: TReadOnlyProperty<string>;
    accessibleName: TReadOnlyProperty<string>;
  }[],
  config: {
    accessibleName: TReadOnlyProperty<string>;
    accessibleHelpText: TReadOnlyProperty<string>;
    width?: number;
  },
): VerticalAquaRadioButtonGroup<T> =>
  new VerticalAquaRadioButtonGroup<T>(
    property,
    items.map((item) => ({
      value: item.value,
      createNode: () =>
        new Text(item.labelProperty, {
          font: FONTS.CONTROL_LABEL,
          fill: SimplifiedMRIColors.textColorProperty,
          maxWidth: (config.width ?? CONTROL_WIDTH) - CONTROLS.RADIO_TEXT_INSET,
        }),
      options: { accessibleName: item.accessibleName },
    })),
    {
      spacing: CONTROLS.LABEL_SPACING,
      align: "left",
      radioButtonOptions: {
        radius: CONTROLS.RADIO_RADIUS,
        selectedColor: SimplifiedMRIColors.accentColorProperty,
        deselectedColor: SimplifiedMRIColors.controlSurfaceColorProperty,
        stroke: SimplifiedMRIColors.textColorProperty,
      },
      accessibleName: config.accessibleName,
      accessibleHelpText: config.accessibleHelpText,
    },
  );

/** A panel title. */
export const createPanelTitle = (labelProperty: TReadOnlyProperty<string>, width = CONTROL_WIDTH): Node =>
  new RichText(labelProperty, {
    font: FONTS.PANEL_TITLE,
    fill: SimplifiedMRIColors.textColorProperty,
    maxWidth: width,
  });
