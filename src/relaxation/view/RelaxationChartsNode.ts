/**
 * RelaxationChartsNode.ts
 *
 * Two charts of the magnetization since the last pulse, each with its own time window:
 *
 *   longitudinal   Mz/M0, recovering toward 1 with time constant T1 (window about 5 T1)
 *   transverse     |Mxy|/M0, decaying with time constant T2 (window about 5 T2), and the
 *                  signal a receiver coil would pick up, Mxy oscillating at the Larmor
 *                  frequency (drawn with RELAXATION.SIGNAL_CYCLES oscillations across the
 *                  window; the real signal oscillates about 64,000 times per millisecond)
 *
 * A dashed marker on each chart shows T1 or T2.
 */

import { Multilink } from "scenerystack/axon";
import { LinePlot } from "scenerystack/bamboo";
import { Range, Vector2 } from "scenerystack/dot";
import { Line, Node, RichText, Text, VBox } from "scenerystack/scenery";
import { ChartFrameNode } from "../../common/view/ChartFrameNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import SimplifiedMRIColors from "../../SimplifiedMRIColors.js";
import { FONTS, RELAXATION, RELAXATION_CHART } from "../../SimplifiedMRIConstants.js";
import type { RelaxationModel } from "../model/RelaxationModel.js";

export class RelaxationChartsNode extends VBox {
  private readonly model: RelaxationModel;
  private readonly mzPlot: LinePlot;
  private readonly mxyPlot: LinePlot;
  private readonly signalPlot: LinePlot;
  private drawnVersion = -1;
  private drawnSignalEnd = -1;

  public constructor(model: RelaxationModel) {
    const strings = StringManager.getInstance().getRelaxationStrings();

    const longitudinal = new ChartFrameNode({
      viewWidth: RELAXATION_CHART.WIDTH,
      viewHeight: RELAXATION_CHART.HEIGHT,
      xRange: new Range(0, model.longitudinalWindowProperty.value),
      yRange: RELAXATION_CHART.Y_RANGE,
      xAxisLabelProperty: strings.timeAxisStringProperty,
      yAxisLabelProperty: strings.mzAxisStringProperty,
      targetDivisions: RELAXATION_CHART.TARGET_DIVISIONS,
    });
    const transverse = new ChartFrameNode({
      viewWidth: RELAXATION_CHART.WIDTH,
      viewHeight: RELAXATION_CHART.HEIGHT,
      xRange: new Range(0, model.transverseWindowProperty.value),
      yRange: RELAXATION_CHART.Y_RANGE,
      xAxisLabelProperty: strings.timeAxisStringProperty,
      yAxisLabelProperty: strings.mxyAxisStringProperty,
      targetDivisions: RELAXATION_CHART.TARGET_DIVISIONS,
    });

    const mzPlot = new LinePlot(longitudinal.chartTransform, [], {
      stroke: SimplifiedMRIColors.mzCurveColorProperty,
      lineWidth: RELAXATION_CHART.CURVE_WIDTH,
    });
    const signalPlot = new LinePlot(transverse.chartTransform, [], {
      stroke: SimplifiedMRIColors.signalCurveColorProperty,
      lineWidth: RELAXATION_CHART.SIGNAL_WIDTH,
      visibleProperty: model.signalVisibleProperty,
    });
    const mxyPlot = new LinePlot(transverse.chartTransform, [], {
      stroke: SimplifiedMRIColors.mxyCurveColorProperty,
      lineWidth: RELAXATION_CHART.CURVE_WIDTH,
    });
    longitudinal.plotLayer.addChild(mzPlot);
    transverse.plotLayer.addChild(signalPlot);
    transverse.plotLayer.addChild(mxyPlot);

    // Zero lines, and T1 / T2 markers.
    const zeroLine = (frame: ChartFrameNode): Line => {
      const y = frame.chartTransform.modelToViewY(0);
      return new Line(0, y, RELAXATION_CHART.WIDTH, y, {
        stroke: SimplifiedMRIColors.chartAxisColorProperty,
        lineWidth: RELAXATION_CHART.ZERO_LINE_WIDTH,
      });
    };
    longitudinal.plotLayer.addChild(zeroLine(longitudinal));
    transverse.plotLayer.addChild(zeroLine(transverse));
    const marker = (frame: ChartFrameNode, label: string): { line: Line; text: RichText } => {
      const line = new Line(0, 0, 0, RELAXATION_CHART.HEIGHT, {
        stroke: SimplifiedMRIColors.secondaryTextColorProperty,
        lineDash: [...RELAXATION_CHART.MARKER_DASH],
      });
      const text = new RichText(label, { font: FONTS.SMALL, fill: SimplifiedMRIColors.secondaryTextColorProperty });
      frame.overlayLayer.children = [line, text];
      return { line, text };
    };
    const t1Marker = marker(longitudinal, "T<sub>1</sub>");
    const t2Marker = marker(transverse, "T<sub>2</sub>");

    const title = (property: typeof strings.longitudinalTitleStringProperty): Text =>
      new Text(property, {
        font: FONTS.CONTROL_TITLE,
        fill: SimplifiedMRIColors.textColorProperty,
        maxWidth: RELAXATION_CHART.MAX_TEXT_WIDTH,
      });
    const signalNote = new Text(strings.signalNoteStringProperty, {
      font: FONTS.SMALL,
      fill: SimplifiedMRIColors.secondaryTextColorProperty,
      maxWidth: RELAXATION_CHART.MAX_TEXT_WIDTH,
      visibleProperty: model.signalVisibleProperty,
    });

    super({
      spacing: RELAXATION_CHART.SPACING,
      align: "left",
      children: [
        title(strings.longitudinalTitleStringProperty),
        new Node({ children: [longitudinal] }),
        title(strings.transverseTitleStringProperty),
        new Node({ children: [transverse] }),
        signalNote,
      ],
    });
    this.model = model;
    this.mzPlot = mzPlot;
    this.mxyPlot = mxyPlot;
    this.signalPlot = signalPlot;

    Multilink.multilink(
      [model.longitudinalWindowProperty, model.transverseWindowProperty, model.t1Property, model.t2Property],
      (longWindow, shortWindow, t1, t2) => {
        longitudinal.setRanges(new Range(0, longWindow), RELAXATION_CHART.Y_RANGE);
        transverse.setRanges(new Range(0, shortWindow), RELAXATION_CHART.Y_RANGE);
        const place = (frame: ChartFrameNode, m: { line: Line; text: RichText }, t: number, window: number): void => {
          const x = frame.chartTransform.modelToViewX(Math.min(t, window));
          m.line.setLine(x, 0, x, RELAXATION_CHART.HEIGHT);
          m.text.left = x + RELAXATION_CHART.MARKER_LABEL_X_GAP;
          m.text.top = RELAXATION_CHART.MARKER_LABEL_TOP;
          m.line.visible = t <= window;
          m.text.visible = t <= window;
        };
        place(longitudinal, t1Marker, t1, longWindow);
        place(transverse, t2Marker, t2, shortWindow);
        this.drawnVersion = -1;
      },
    );
  }

  /** Redraws the curves if the recorded samples changed; called each frame. */
  public update(): void {
    const shortWindow = this.model.transverseWindowProperty.value;
    const signalEnd = Math.min(this.model.tissueTime ?? -1, shortWindow);
    if (this.drawnVersion === this.model.samplesVersion && this.drawnSignalEnd === signalEnd) {
      return;
    }
    this.drawnVersion = this.model.samplesVersion;
    this.drawnSignalEnd = signalEnd;
    const longWindow = this.model.longitudinalWindowProperty.value;

    const mz: Vector2[] = [];
    const mxy: Vector2[] = [];
    for (const sample of this.model.samples) {
      if (sample.t <= longWindow) {
        mz.push(new Vector2(sample.t, sample.mz));
      }
      if (sample.t <= shortWindow) {
        mxy.push(new Vector2(sample.t, sample.mxy));
      }
    }
    // Resolve the display carrier on a fixed grid even when tissue time advances by
    // more than one carrier period in a frame.
    const signal: Vector2[] = [];
    if (signalEnd >= 0) {
      const omega = (2 * Math.PI * RELAXATION.SIGNAL_CYCLES) / shortWindow;
      const spacing = shortWindow / (RELAXATION.SIGNAL_CYCLES * RELAXATION_CHART.SIGNAL_SAMPLES_PER_CYCLE);
      const t2 = this.model.t2Property.value;
      const amplitude = this.model.pulseTransverse;
      const point = (t: number): Vector2 => new Vector2(t, amplitude * Math.exp(-t / t2) * Math.cos(omega * t));
      for (let i = 0; i * spacing < signalEnd; i++) {
        signal.push(point(i * spacing));
      }
      signal.push(point(signalEnd));
    }
    this.mzPlot.setDataSet(mz);
    this.mxyPlot.setDataSet(mxy);
    this.signalPlot.setDataSet(signal);
  }
}
