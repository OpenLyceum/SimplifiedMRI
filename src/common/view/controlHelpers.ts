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
import { CONTROL_WIDTH, FONTS } from "../../SimplifiedMRIConstants.js";
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
    layoutFunction: NumberControl.createLayoutFunction4({ sliderPadding: 4, verticalSpacing: 4 }),
    delta: config.delta,
    titleNodeOptions: {
      font: FONTS.CONTROL_TITLE,
      fill: SimplifiedMRIColors.textColorProperty,
      maxWidth: width - 100,
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
    arrowButtonOptions: { ...FLAT_RECTANGULAR_BUTTON_OPTIONS, scale: 0.75 },
    sliderOptions: {
      trackSize: new Dimension2(width - 60, 3),
      thumbSize: new Dimension2(12, 22),
      thumbFill: SimplifiedMRIColors.accentColorProperty,
      trackFillEnabled: SimplifiedMRIColors.textColorProperty,
      majorTickLength: 8,
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
      maxWidth: width - 30,
    }),
    {
      boxWidth: 16,
      spacing: 6,
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
      maxWidth: config.maxTextWidth ?? CONTROL_WIDTH - 24,
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
          maxWidth: (config.width ?? CONTROL_WIDTH) - 40,
        }),
      options: { accessibleName: item.accessibleName },
    })),
    {
      spacing: 6,
      align: "left",
      radioButtonOptions: {
        radius: 7,
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
