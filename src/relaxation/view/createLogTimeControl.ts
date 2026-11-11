/**
 * createLogTimeControl.ts
 *
 * A NumberControl for a relaxation time on a logarithmic slider. T1 and T2 span two orders
 * of magnitude (fat's T2 is 60 ms, cerebrospinal fluid's T1 is 4000 ms), so a linear slider
 * would crowd most tissues into its first few percent.
 *
 * The control drives a log10 copy of the time Property, kept in sync both ways; its readout
 * and the value read by screen readers show the time itself in milliseconds.
 */

import { NumberProperty, type PhetioProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import type { NumberControl } from "scenerystack/scenery-phet";
import { createNumberControl } from "../../common/view/controlHelpers.js";

export function createLogTimeControl(
  timeProperty: PhetioProperty<number>,
  range: Range,
  config: {
    titleProperty: TReadOnlyProperty<string>;
    patternProperty: TReadOnlyProperty<string>;
    accessibleName: TReadOnlyProperty<string>;
    accessibleHelpText: TReadOnlyProperty<string>;
  },
): NumberControl {
  const logRange = new Range(Math.log10(range.min), Math.log10(range.max));
  const logProperty = new NumberProperty(Math.log10(timeProperty.value), { range: logRange });

  let syncing = false;
  timeProperty.lazyLink((time) => {
    if (!syncing) {
      syncing = true;
      logProperty.value = Math.log10(time);
      syncing = false;
    }
  });
  logProperty.lazyLink((log) => {
    if (!syncing) {
      syncing = true;
      timeProperty.value = range.constrainValue(Math.round(10 ** log));
      syncing = false;
    }
  });

  const format = (log: number): string =>
    StringUtils.fillIn(config.patternProperty.value, { value: Math.round(10 ** log) });

  const ticks = [10, 100, 1000]
    .filter((value) => range.contains(value))
    .map((value) => ({ value: Math.log10(value), label: `${value}` }));

  const control = createNumberControl(logProperty, logRange, {
    titleProperty: config.titleProperty,
    valuePatternProperty: config.patternProperty,
    accessibleName: config.accessibleName,
    accessibleHelpText: config.accessibleHelpText,
    decimalPlaces: 0,
    delta: 0.01,
    majorTicks: ticks,
    numberFormatter: format,
    numberFormatterDependencies: [config.patternProperty],
    ariaValueText: (log: number) => format(log),
  });
  return control;
}
