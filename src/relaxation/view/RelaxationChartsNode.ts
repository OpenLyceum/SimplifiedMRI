/**
 * RelaxationChartsNode.ts
 *
 * Two charts of the magnetization since the last pulse, each with its own time window:
 *
 *   longitudinal   Mz/M0, recovering toward 1 with time constant T1 (window about 5 T1)
 *   transverse     |Mxy|/M0, decaying with time constant T2 (window about 5 T2), and the
 *                  signal a receiver coil would pick up, Mxy oscillating at the Larmor
 *                  frequency (drawn with RELAXATION.SIGNAL_CYCLES oscillations across the
 *                  window; the real signal oscillates millions of times per millisecond)
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
import { FONTS, RELAXATION } from "../../SimplifiedMRIConstants.js";
import type { RelaxationModel } from "../model/RelaxationModel.js";

const CHART_WIDTH = 250;
const CHART_HEIGHT = 120;
const Y_RANGE = new Range(-1.05, 1.05);

export class RelaxationChartsNode extends VBox {
  private readonly model: RelaxationModel;
  private readonly mzPlot: LinePlot;
  private readonly mxyPlot: LinePlot;
  private readonly signalPlot: LinePlot;
  private drawnVersion = -1;

  public constructor(model: RelaxationModel) {
    const strings = StringManager.getInstance().getRelaxationStrings();

    const longitudinal = new ChartFrameNode({
      viewWidth: CHART_WIDTH,
      viewHeight: CHART_HEIGHT,
      xRange: new Range(0, model.longitudinalWindowProperty.value),
      yRange: Y_RANGE,
      xAxisLabelProperty: strings.timeAxisStringProperty,
      yAxisLabelProperty: strings.mzAxisStringProperty,
      targetDivisions: 4,
    });
    const transverse = new ChartFrameNode({
      viewWidth: CHART_WIDTH,
      viewHeight: CHART_HEIGHT,
      xRange: new Range(0, model.transverseWindowProperty.value),
      yRange: Y_RANGE,
      xAxisLabelProperty: strings.timeAxisStringProperty,
      yAxisLabelProperty: strings.mxyAxisStringProperty,
      targetDivisions: 4,
    });

    const mzPlot = new LinePlot(longitudinal.chartTransform, [], {
      stroke: SimplifiedMRIColors.mzCurveColorProperty,
      lineWidth: 2.5,
    });
    const signalPlot = new LinePlot(transverse.chartTransform, [], {
      stroke: SimplifiedMRIColors.signalCurveColorProperty,
      lineWidth: 1.2,
      visibleProperty: model.signalVisibleProperty,
    });
    const mxyPlot = new LinePlot(transverse.chartTransform, [], {
      stroke: SimplifiedMRIColors.mxyCurveColorProperty,
      lineWidth: 2.5,
    });
    longitudinal.plotLayer.addChild(mzPlot);
    transverse.plotLayer.addChild(signalPlot);
    transverse.plotLayer.addChild(mxyPlot);

    // Zero lines, and T1 / T2 markers.
    const zeroLine = (frame: ChartFrameNode): Line => {
      const y = frame.chartTransform.modelToViewY(0);
      return new Line(0, y, CHART_WIDTH, y, { stroke: SimplifiedMRIColors.chartAxisColorProperty, lineWidth: 0.8 });
    };
    longitudinal.plotLayer.addChild(zeroLine(longitudinal));
    transverse.plotLayer.addChild(zeroLine(transverse));
    const marker = (frame: ChartFrameNode, label: string): { line: Line; text: RichText } => {
      const line = new Line(0, 0, 0, CHART_HEIGHT, {
        stroke: SimplifiedMRIColors.secondaryTextColorProperty,
        lineDash: [4, 3],
      });
      const text = new RichText(label, { font: FONTS.SMALL, fill: SimplifiedMRIColors.secondaryTextColorProperty });
      frame.overlayLayer.children = [line, text];
      return { line, text };
    };
    const t1Marker = marker(longitudinal, "T<sub>1</sub>");
    const t2Marker = marker(transverse, "T<sub>2</sub>");

    const title = (property: typeof strings.longitudinalTitleStringProperty): Text =>
      new Text(property, { font: FONTS.CONTROL_TITLE, fill: SimplifiedMRIColors.textColorProperty, maxWidth: 300 });
    const signalNote = new Text(strings.signalNoteStringProperty, {
      font: FONTS.SMALL,
      fill: SimplifiedMRIColors.secondaryTextColorProperty,
      maxWidth: 300,
      visibleProperty: model.signalVisibleProperty,
    });

    super({
      spacing: 6,
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
        longitudinal.setRanges(new Range(0, longWindow), Y_RANGE);
        transverse.setRanges(new Range(0, shortWindow), Y_RANGE);
        const place = (frame: ChartFrameNode, m: { line: Line; text: RichText }, t: number, window: number): void => {
          const x = frame.chartTransform.modelToViewX(Math.min(t, window));
          m.line.setLine(x, 0, x, CHART_HEIGHT);
          m.text.left = x + 3;
          m.text.top = 2;
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
    if (this.drawnVersion === this.model.samplesVersion) {
      return;
    }
    this.drawnVersion = this.model.samplesVersion;
    const samples = this.model.samples;
    const longWindow = this.model.longitudinalWindowProperty.value;
    const shortWindow = this.model.transverseWindowProperty.value;
    const omega = (2 * Math.PI * RELAXATION.SIGNAL_CYCLES) / shortWindow;

    const mz: Vector2[] = [];
    const mxy: Vector2[] = [];
    const signal: Vector2[] = [];
    for (const sample of samples) {
      if (sample.t <= longWindow) {
        mz.push(new Vector2(sample.t, sample.mz));
      }
      if (sample.t <= shortWindow) {
        mxy.push(new Vector2(sample.t, sample.mxy));
        signal.push(new Vector2(sample.t, sample.mxy * Math.cos(omega * sample.t)));
      }
    }
    this.mzPlot.setDataSet(mz);
    this.mxyPlot.setDataSet(mxy);
    this.signalPlot.setDataSet(signal);
  }
}
