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
import { roundSymmetric } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Line, Node, Path, Text, VBox } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { NucleusType } from "../../common/model/NucleusType.js";
import { createPanelTitle } from "../../common/view/controlHelpers.js";
import { NucleusGlyph } from "../../common/view/NucleusGlyph.js";
import { nucleusColor } from "../../common/view/nucleusColors.js";
import { StringManager } from "../../i18n/StringManager.js";
import SimplifiedMRIColors from "../../SimplifiedMRIColors.js";
import { CONTROL_WIDTH, ENERGY_DIAGRAM, FONTS, MAGNET, RADIO, RESONANCE } from "../../SimplifiedMRIConstants.js";
import type { NMRModel } from "../model/NMRModel.js";

/** Frequency (MHz) drawn as the full height. */
const FULL_SCALE = NucleusType.HYDROGEN_1.gyromagneticRatio * MAGNET.MAIN_FIELD_RANGE.max;

export class EnergyLevelDiagram extends VBox {
  public constructor(model: NMRModel) {
    const strings = StringManager.getInstance().getCommonStrings();
    const diagram = new Node();
    const levelWidth = CONTROL_WIDTH - ENERGY_DIAGRAM.LEVEL_LEFT;

    // Energy axis.
    const axis = new ArrowNode(ENERGY_DIAGRAM.AXIS_X, ENERGY_DIAGRAM.HEIGHT, ENERGY_DIAGRAM.AXIS_X, 0, {
      headHeight: ENERGY_DIAGRAM.AXIS_HEAD_SIZE,
      headWidth: ENERGY_DIAGRAM.AXIS_HEAD_SIZE,
      tailWidth: ENERGY_DIAGRAM.AXIS_TAIL_WIDTH,
      fill: SimplifiedMRIColors.textColorProperty,
      stroke: null,
    });
    const axisLabel = new Text(strings.energyStringProperty, {
      font: FONTS.SMALL,
      fill: SimplifiedMRIColors.textColorProperty,
      rotation: -Math.PI / 2,
      maxWidth: ENERGY_DIAGRAM.HEIGHT * ENERGY_DIAGRAM.AXIS_LABEL_HEIGHT_FACTOR,
    });
    axisLabel.boundsProperty.link(() => {
      axisLabel.right = ENERGY_DIAGRAM.AXIS_X - ENERGY_DIAGRAM.LABEL_GAP;
      axisLabel.centerY = ENERGY_DIAGRAM.HEIGHT / 2;
    });

    const lowerLine = new Line(ENERGY_DIAGRAM.LEVEL_LEFT, 0, CONTROL_WIDTH, 0, {
      lineWidth: ENERGY_DIAGRAM.LINE_WIDTH,
    });
    const upperLine = new Line(ENERGY_DIAGRAM.LEVEL_LEFT, 0, CONTROL_WIDTH, 0, {
      lineWidth: ENERGY_DIAGRAM.LINE_WIDTH,
    });
    const squiggle = new Path(null, {
      stroke: SimplifiedMRIColors.radioWaveColorProperty,
      lineWidth: ENERGY_DIAGRAM.LINE_WIDTH,
    });
    const resonanceText = new Text(strings.onResonanceStringProperty, {
      font: FONTS.READOUT_VALUE,
      fill: SimplifiedMRIColors.energyLevelResonantColorProperty,
      maxWidth: levelWidth,
    });

    // One icon per nucleus on each level; only the right number are shown.
    const count = model.nuclei.length;
    const lowerIcons: NucleusGlyph[] = [];
    const upperIcons: NucleusGlyph[] = [];
    const iconLayer = new Node();
    for (let i = 0; i < count; i++) {
      const lower = new NucleusGlyph(ENERGY_DIAGRAM.ICON_RADIUS, SimplifiedMRIColors.hydrogen1ColorProperty);
      const upper = new NucleusGlyph(ENERGY_DIAGRAM.ICON_RADIUS, SimplifiedMRIColors.hydrogen1ColorProperty, {
        rotation: Math.PI,
      });
      lowerIcons.push(lower);
      upperIcons.push(upper);
      iconLayer.addChild(lower);
      iconLayer.addChild(upper);
    }
    const iconSpacing = Math.min(
      2 * ENERGY_DIAGRAM.ICON_RADIUS + 1,
      (levelWidth - 2 * ENERGY_DIAGRAM.ICON_RADIUS) / Math.max(1, count - 1),
    );

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
        const gap = (ENERGY_DIAGRAM.HEIGHT - ENERGY_DIAGRAM.LEVEL_HEIGHT_INSET) * (resonance / FULL_SCALE);
        const lowerY = ENERGY_DIAGRAM.HEIGHT - ENERGY_DIAGRAM.LOWER_LEVEL_INSET;
        const upperY = lowerY - gap;
        const onResonance = strength >= RESONANCE.INDICATOR_THRESHOLD && power > 0;
        const levelColor = onResonance
          ? SimplifiedMRIColors.energyLevelResonantColorProperty
          : SimplifiedMRIColors.energyLevelColorProperty;
        lowerLine.setLine(ENERGY_DIAGRAM.LEVEL_LEFT, lowerY, CONTROL_WIDTH, lowerY);
        upperLine.setLine(ENERGY_DIAGRAM.LEVEL_LEFT, upperY, CONTROL_WIDTH, upperY);
        lowerLine.stroke = levelColor;
        upperLine.stroke = levelColor;
        lowerLine.lineWidth = onResonance ? ENERGY_DIAGRAM.RESONANT_LINE_WIDTH : ENERGY_DIAGRAM.LINE_WIDTH;
        upperLine.lineWidth = onResonance ? ENERGY_DIAGRAM.RESONANT_LINE_WIDTH : ENERGY_DIAGRAM.LINE_WIDTH;
        resonanceText.visible = onResonance;
        resonanceText.right = CONTROL_WIDTH;
        resonanceText.bottom = Math.max(
          ENERGY_DIAGRAM.MIN_READOUT_Y,
          upperY - 2 * ENERGY_DIAGRAM.ICON_RADIUS - ENERGY_DIAGRAM.LABEL_GAP,
        );

        // Squiggle from the lower level up by the photon energy; more wiggles at higher f.
        const height = (ENERGY_DIAGRAM.HEIGHT - ENERGY_DIAGRAM.LEVEL_HEIGHT_INSET) * (frequency / FULL_SCALE);
        const cycles = Math.max(
          1,
          roundSymmetric((frequency / RADIO.FREQUENCY_RANGE.max) * ENERGY_DIAGRAM.MAX_WAVE_CYCLES),
        );
        const shape = new Shape();
        const segments = ENERGY_DIAGRAM.WAVE_SEGMENTS;
        for (let i = 0; i <= segments; i++) {
          const s = i / segments;
          const x = ENERGY_DIAGRAM.SQUIGGLE_X + ENERGY_DIAGRAM.WAVE_AMPLITUDE * Math.sin(2 * Math.PI * cycles * s);
          const y = lowerY - s * height;
          if (i === 0) {
            shape.moveTo(x, y);
          } else {
            shape.lineTo(x, y);
          }
        }
        squiggle.shape = shape;
        squiggle.opacity = power > 0 ? 1 : ENERGY_DIAGRAM.INACTIVE_OPACITY;

        const fill = nucleusColor(type);
        for (let i = 0; i < count; i++) {
          const lower = lowerIcons[i];
          const upper = upperIcons[i];
          if (!(lower && upper)) {
            continue;
          }
          const x = ENERGY_DIAGRAM.LEVEL_LEFT + ENERGY_DIAGRAM.ICON_RADIUS + i * iconSpacing;
          lower.visible = i < aligned;
          upper.visible = i < count - aligned;
          lower.setBodyFill(fill);
          upper.setBodyFill(fill);
          lower.translation = lower.translation.setXY(
            x,
            lowerY - ENERGY_DIAGRAM.ICON_RADIUS * ENERGY_DIAGRAM.ICON_Y_FACTOR,
          );
          upper.translation = upper.translation.setXY(
            x,
            upperY - ENERGY_DIAGRAM.ICON_RADIUS * ENERGY_DIAGRAM.ICON_Y_FACTOR,
          );
        }
      },
    );

    super({
      spacing: ENERGY_DIAGRAM.PANEL_SPACING,
      align: "left",
      children: [createPanelTitle(strings.energyLevelsStringProperty), diagram],
    });
  }
}
