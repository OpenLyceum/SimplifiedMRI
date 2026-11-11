/**
 * EnergyLevelDiagram.ts
 *
 * PhET's energy monitor: the two spin energy levels, split by ΔE = hγB, with one nucleus
 * icon on each level for every nucleus in that state, and beside them a radio-wave
 * "squiggle" whose height is the photon energy hf. When the squiggle reaches exactly from
 * the lower level to the upper one the source is on resonance, and the levels turn green.
 *
 * Energies are drawn to one scale: hydrogen at 3 T (127.7 MHz) spans the full height.
 */

import { Multilink } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Line, Node, Path, Text, VBox } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { NucleusType } from "../../common/model/NucleusType.js";
import { createPanelTitle } from "../../common/view/controlHelpers.js";
import { NucleusGlyph } from "../../common/view/NucleusGlyph.js";
import { nucleusColor } from "../../common/view/nucleusColors.js";
import { StringManager } from "../../i18n/StringManager.js";
import SimplifiedMRIColors from "../../SimplifiedMRIColors.js";
import { CONTROL_WIDTH, FONTS, MAGNET, RADIO, RESONANCE } from "../../SimplifiedMRIConstants.js";
import type { NMRModel } from "../model/NMRModel.js";

const HEIGHT = 170;
const AXIS_X = 10;
const SQUIGGLE_X = 42;
const LEVEL_LEFT = 62;
const LEVEL_WIDTH = CONTROL_WIDTH - LEVEL_LEFT;
const ICON_RADIUS = 6;

/** Frequency (MHz) drawn as the full height. */
const FULL_SCALE = NucleusType.HYDROGEN_1.gyromagneticRatio * MAGNET.MAIN_FIELD_RANGE.max;

export class EnergyLevelDiagram extends VBox {
  public constructor(model: NMRModel) {
    const strings = StringManager.getInstance().getCommonStrings();
    const diagram = new Node();

    // Energy axis.
    const axis = new ArrowNode(AXIS_X, HEIGHT, AXIS_X, 0, {
      headHeight: 8,
      headWidth: 8,
      tailWidth: 1.5,
      fill: SimplifiedMRIColors.textColorProperty,
      stroke: null,
    });
    const axisLabel = new Text(strings.energyStringProperty, {
      font: FONTS.SMALL,
      fill: SimplifiedMRIColors.textColorProperty,
      rotation: -Math.PI / 2,
      maxWidth: HEIGHT * 0.6,
    });
    axisLabel.boundsProperty.link(() => {
      axisLabel.right = AXIS_X - 4;
      axisLabel.centerY = HEIGHT / 2;
    });

    const lowerLine = new Line(LEVEL_LEFT, 0, LEVEL_LEFT + LEVEL_WIDTH, 0, { lineWidth: 2 });
    const upperLine = new Line(LEVEL_LEFT, 0, LEVEL_LEFT + LEVEL_WIDTH, 0, { lineWidth: 2 });
    const squiggle = new Path(null, { stroke: SimplifiedMRIColors.radioWaveColorProperty, lineWidth: 2 });
    const resonanceText = new Text(strings.onResonanceStringProperty, {
      font: FONTS.READOUT_VALUE,
      fill: SimplifiedMRIColors.energyLevelResonantColorProperty,
      maxWidth: LEVEL_WIDTH,
    });

    // One icon per nucleus on each level; only the right number are shown.
    const count = model.nuclei.length;
    const lowerIcons: NucleusGlyph[] = [];
    const upperIcons: NucleusGlyph[] = [];
    const iconLayer = new Node();
    for (let i = 0; i < count; i++) {
      const lower = new NucleusGlyph(ICON_RADIUS, SimplifiedMRIColors.hydrogen1ColorProperty);
      const upper = new NucleusGlyph(ICON_RADIUS, SimplifiedMRIColors.hydrogen1ColorProperty, { rotation: Math.PI });
      lowerIcons.push(lower);
      upperIcons.push(upper);
      iconLayer.addChild(lower);
      iconLayer.addChild(upper);
    }
    const iconSpacing = Math.min(2 * ICON_RADIUS + 1, (LEVEL_WIDTH - 2 * ICON_RADIUS) / Math.max(1, count - 1));

    diagram.children = [axis, axisLabel, lowerLine, upperLine, squiggle, iconLayer, resonanceText];

    Multilink.multilink(
      [
        model.resonanceFrequencyProperty,
        model.frequencyProperty,
        model.powerProperty,
        model.alignedCountProperty,
        model.lineStrengthProperty,
        model.nucleusTypeProperty,
      ],
      (resonance, frequency, power, aligned, strength, type) => {
        const gap = (HEIGHT - 30) * (resonance / FULL_SCALE);
        const lowerY = HEIGHT - 12;
        const upperY = lowerY - gap;
        const onResonance = strength >= RESONANCE.INDICATOR_THRESHOLD && power > 0;
        const levelColor = onResonance
          ? SimplifiedMRIColors.energyLevelResonantColorProperty
          : SimplifiedMRIColors.energyLevelColorProperty;
        lowerLine.setLine(LEVEL_LEFT, lowerY, LEVEL_LEFT + LEVEL_WIDTH, lowerY);
        upperLine.setLine(LEVEL_LEFT, upperY, LEVEL_LEFT + LEVEL_WIDTH, upperY);
        lowerLine.stroke = levelColor;
        upperLine.stroke = levelColor;
        lowerLine.lineWidth = onResonance ? 3 : 2;
        upperLine.lineWidth = onResonance ? 3 : 2;
        resonanceText.visible = onResonance;
        resonanceText.right = LEVEL_LEFT + LEVEL_WIDTH;
        resonanceText.bottom = Math.max(14, upperY - 2 * ICON_RADIUS - 4);

        // Squiggle from the lower level up by the photon energy; more wiggles at higher f.
        const height = (HEIGHT - 30) * (frequency / FULL_SCALE);
        const cycles = Math.max(1, Math.round((frequency / RADIO.FREQUENCY_RANGE.max) * 9));
        const shape = new Shape();
        const segments = 60;
        for (let i = 0; i <= segments; i++) {
          const s = i / segments;
          const x = SQUIGGLE_X + 5 * Math.sin(2 * Math.PI * cycles * s);
          const y = lowerY - s * height;
          if (i === 0) {
            shape.moveTo(x, y);
          } else {
            shape.lineTo(x, y);
          }
        }
        squiggle.shape = shape;
        squiggle.opacity = power > 0 ? 1 : 0.35;

        const fill = nucleusColor(type);
        for (let i = 0; i < count; i++) {
          const lower = lowerIcons[i];
          const upper = upperIcons[i];
          if (!(lower && upper)) {
            continue;
          }
          const x = LEVEL_LEFT + ICON_RADIUS + i * iconSpacing;
          lower.visible = i < aligned;
          upper.visible = i < count - aligned;
          lower.setBodyFill(fill);
          upper.setBodyFill(fill);
          lower.translation = lower.translation.setXY(x, lowerY - ICON_RADIUS * 1.1);
          upper.translation = upper.translation.setXY(x, upperY - ICON_RADIUS * 1.1);
        }
      },
    );

    super({ spacing: 6, align: "left", children: [createPanelTitle(strings.energyLevelsStringProperty), diagram] });
  }
}
