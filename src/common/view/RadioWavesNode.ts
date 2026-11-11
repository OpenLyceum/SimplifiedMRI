/**
 * RadioWavesNode.ts
 *
 * Draws the radio waves in the chamber.
 *
 *   Wave view    the source's wave as horizontal bands rising through the chamber, brighter
 *                with power and closer together at higher frequency (PhET's plane wave).
 *                The individual incoming photons are hidden, as in PhET. Emitted photons
 *                are drawn as short wave packets.
 *   Photon view  every photon as a small wiggle: green rising from the source, orange
 *                leaving relaxing nuclei.
 *
 * Photons are drawn from reusable pools, repositioned each frame from the model's array.
 */

import { DerivedProperty } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Node, Path, Rectangle } from "scenerystack/scenery";
import SimplifiedMRIColors from "../../SimplifiedMRIColors.js";
import { CHAMBER, RADIO } from "../../SimplifiedMRIConstants.js";
import type { ResonanceModel } from "../model/ResonanceModel.js";

/** Number of horizontal bands in the wave view. */
const BAND_COUNT = 48;

/** Peak band opacity at full power. */
const MAX_BAND_OPACITY = 0.38;

/** Displayed wavelength (cm) = this / frequency (MHz), clamped (radio wavelengths are metres). */
const WAVELENGTH_FACTOR = 360;
const MIN_WAVELENGTH = 2.2;
const MAX_WAVELENGTH = 18;

/** Wiggle drawn for a photon: `cycles` periods over `length` px, along +x. */
function wiggleShape(length: number, amplitude: number, cycles: number): Shape {
  const shape = new Shape();
  const segments = 24;
  for (let i = 0; i <= segments; i++) {
    const s = i / segments;
    const x = (s - 0.5) * length;
    const y = amplitude * Math.sin(2 * Math.PI * cycles * s);
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  return shape;
}

/** Three arcs, PhET's emitted wave cycle, travelling along +x. */
function packetShape(height: number): Shape {
  const shape = new Shape();
  for (let k = 0; k < 3; k++) {
    const x = (k - 1) * 5;
    shape.moveTo(x, -height / 2).quadraticCurveTo(x + 5, 0, x, height / 2);
  }
  return shape;
}

export class RadioWavesNode extends Node {
  private readonly model: ResonanceModel;
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly bands: Rectangle[] = [];
  private readonly incomingPool: Path[] = [];
  private readonly emittedPool: Path[] = [];
  private readonly incomingLayer = new Node();
  private readonly emittedLayer = new Node();
  private readonly incomingShape: Shape;
  private readonly emittedPhotonShape: Shape;
  private readonly emittedPacketShape: Shape;
  private wavePhase = 0;

  public constructor(model: ResonanceModel, modelViewTransform: ModelViewTransform2, rightEdge: number) {
    super({ pickable: false });
    this.model = model;
    this.modelViewTransform = modelViewTransform;

    const scale = modelViewTransform.modelToViewDeltaX(1);
    this.incomingShape = wiggleShape(1.2 * scale, 0.18 * scale, 2);
    this.emittedPhotonShape = wiggleShape(1.2 * scale, 0.18 * scale, 2);
    this.emittedPacketShape = packetShape(0.9 * scale);

    // Bands cover the chamber; the source spans a little wider, but the chamber walls bound
    // what is drawn.
    const topLeft = modelViewTransform.modelToViewXY(0, CHAMBER.HEIGHT);
    const bottomRight = modelViewTransform.modelToViewXY(CHAMBER.WIDTH, 0);
    const bandHeight = (bottomRight.y - topLeft.y) / BAND_COUNT;
    const bandLayer = new Node();
    for (let i = 0; i < BAND_COUNT; i++) {
      const band = new Rectangle(topLeft.x, topLeft.y + i * bandHeight, bottomRight.x - topLeft.x, bandHeight + 0.5, {
        fill: SimplifiedMRIColors.radioWaveColorProperty,
      });
      this.bands.push(band);
      bandLayer.addChild(band);
    }

    bandLayer.visibleProperty = new DerivedProperty([model.radioViewProperty], (view) => view === "wave");
    this.incomingLayer.visibleProperty = new DerivedProperty([model.radioViewProperty], (view) => view === "photon");

    // Photons outside the chamber and the path to the detector are not drawn.
    const clipTopLeft = modelViewTransform.modelToViewXY(-1.5, CHAMBER.HEIGHT + 0.6);
    const clipBottom = modelViewTransform.modelToViewY(-0.8);
    this.clipArea = Shape.rect(clipTopLeft.x, clipTopLeft.y, rightEdge - clipTopLeft.x, clipBottom - clipTopLeft.y);

    this.children = [bandLayer, this.incomingLayer, this.emittedLayer];
    this.update(0);
  }

  /** Redraws the waves and photons; dt (s) advances the wave animation. */
  public update(dt: number): void {
    const model = this.model;
    const isWaveView = model.radioViewProperty.value === "wave";

    // ── Bands ─────────────────────────────────────────────────────────────────
    if (isWaveView) {
      const wavelength = Math.min(
        MAX_WAVELENGTH,
        Math.max(MIN_WAVELENGTH, WAVELENGTH_FACTOR / model.frequencyProperty.value),
      );
      const k = (2 * Math.PI) / wavelength;
      this.wavePhase = (this.wavePhase + k * RADIO.PHOTON_SPEED * dt) % (2 * Math.PI);
      const amplitude = (MAX_BAND_OPACITY * model.powerProperty.value) / RADIO.POWER_RANGE.max;
      this.bands.forEach((band, i) => {
        // Band i is counted from the top; y is the band centre in cm.
        const y = CHAMBER.HEIGHT * (1 - (i + 0.5) / BAND_COUNT);
        band.opacity = amplitude * (0.5 + 0.5 * Math.cos(k * y - this.wavePhase));
      });
    }

    // ── Photons ───────────────────────────────────────────────────────────────
    let incoming = 0;
    let emitted = 0;
    for (const photon of model.photons) {
      const position = this.modelViewTransform.modelToViewXY(photon.x, photon.y);
      if (photon.isEmitted) {
        const path = this.poolPath(this.emittedPool, this.emittedLayer, emitted++, true);
        path.shape = isWaveView ? this.emittedPacketShape : this.emittedPhotonShape;
        path.translation = position;
      } else if (!isWaveView) {
        const path = this.poolPath(this.incomingPool, this.incomingLayer, incoming++, false);
        path.translation = position;
      }
    }
    for (let i = incoming; i < this.incomingPool.length; i++) {
      const path = this.incomingPool[i];
      if (path) {
        path.visible = false;
      }
    }
    for (let i = emitted; i < this.emittedPool.length; i++) {
      const path = this.emittedPool[i];
      if (path) {
        path.visible = false;
      }
    }
  }

  /** Returns pool entry `index`, creating it if needed, made visible. */
  private poolPath(pool: Path[], layer: Node, index: number, isEmitted: boolean): Path {
    let path = pool[index];
    if (!path) {
      path = new Path(isEmitted ? this.emittedPhotonShape : this.incomingShape, {
        stroke: isEmitted ? SimplifiedMRIColors.emittedPhotonColorProperty : SimplifiedMRIColors.radioWaveColorProperty,
        lineWidth: 2,
        // Incoming photons travel up: turn the +x wiggle to vertical.
        rotation: isEmitted ? 0 : -Math.PI / 2,
      });
      pool.push(path);
      layer.addChild(path);
    }
    path.visible = true;
    return path;
  }
}
