/**
 * NucleiLayer.ts
 *
 * Draws every nucleus in a ResonanceModel and keeps the glyphs in step with the model:
 * one glyph per nucleus, added and removed with the model's array (the MRI screen's
 * tumour), coloured by nucleus type, turned to the nucleus's orientation each frame, and
 * precessing when precession is shown.
 */

import { Multilink } from "scenerystack/axon";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Node } from "scenerystack/scenery";
import SimplifiedMRIColors from "../../SimplifiedMRIColors.js";
import { NUCLEUS } from "../../SimplifiedMRIConstants.js";
import type { Nucleus } from "../model/Nucleus.js";
import type { ResonanceModel } from "../model/ResonanceModel.js";
import { NucleusGlyph } from "./NucleusGlyph.js";
import { nucleusColor } from "./nucleusColors.js";

export class NucleiLayer extends Node {
  private readonly model: ResonanceModel;
  private readonly glyphs = new Map<Nucleus, NucleusGlyph>();

  public constructor(model: ResonanceModel, modelViewTransform: ModelViewTransform2) {
    super();
    this.model = model;
    const radius = modelViewTransform.modelToViewDeltaX(NUCLEUS.RADIUS);

    const addGlyph = (nucleus: Nucleus): void => {
      const glyph = new NucleusGlyph(
        radius,
        nucleus.isTumor ? SimplifiedMRIColors.tumorNucleusColorProperty : nucleusColor(model.nucleusTypeProperty.value),
      );
      glyph.translation = modelViewTransform.modelToViewPosition(nucleus.position);
      this.glyphs.set(nucleus, glyph);
      this.addChild(glyph);
      this.updateGlyph(nucleus, glyph);
    };
    const removeGlyph = (nucleus: Nucleus): void => {
      const glyph = this.glyphs.get(nucleus);
      if (glyph) {
        this.removeChild(glyph);
        glyph.dispose();
        this.glyphs.delete(nucleus);
      }
    };
    model.nuclei.forEach(addGlyph);
    model.nuclei.addItemAddedListener(addGlyph);
    model.nuclei.addItemRemovedListener(removeGlyph);

    Multilink.multilink([model.nucleusTypeProperty, model.precessionVisibleProperty], (type, precession) => {
      for (const [nucleus, glyph] of this.glyphs) {
        if (!nucleus.isTumor) {
          glyph.setBodyFill(nucleusColor(type));
        }
        glyph.cone.visible = precession;
        this.updateGlyph(nucleus, glyph);
      }
    });
  }

  /** Redraws every glyph from the model; called each frame. */
  public update(): void {
    for (const [nucleus, glyph] of this.glyphs) {
      this.updateGlyph(nucleus, glyph);
    }
  }

  private updateGlyph(nucleus: Nucleus, glyph: NucleusGlyph): void {
    // Model orientation 0 is along the field (up on screen); scenery rotation is clockwise.
    glyph.rotation = nucleus.orientation;
    glyph.cone.visible = this.model.precessionVisibleProperty.value;
    if (this.model.precessionVisibleProperty.value) {
      // Side-on view of an arrow tilted from the axis and turning about it.
      const tilt = NUCLEUS.PRECESSION_TILT;
      glyph.setArrowAngle(Math.atan2(Math.sin(tilt) * Math.cos(nucleus.precessionPhase), Math.cos(tilt)));
    } else {
      glyph.setArrowAngle(0);
    }
  }
}
