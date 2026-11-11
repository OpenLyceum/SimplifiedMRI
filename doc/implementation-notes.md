# Implementation notes — Simplified MRI

How the code is put together and why. Physics and the list of changes from PhET: [`model.md`](model.md).

## Layout

```
src/
  common/
    model/
      resonancePhysics.ts   pure: Larmor frequency, line shape, population target, real excess
      NucleusType.ts        EnumerationValue with γ/2π
      Nucleus.ts            spin state, relaxation countdown, glyph swing, precession phase
      Photon.ts             plain mutable object (no Properties)
      Detector.ts           sliding-window photon count
      sampleGeometry.ts     NMR grid, head ellipses, tumour lattice
      ResonanceModel.ts     shared model for NMR and MRI
    view/
      ResonanceScreenView.ts  shared play area: coils, chamber, layers, source panel, time controls
      CoilNode.ts, FieldArrowsNode.ts, NucleusGlyph.ts, NucleiLayer.ts, RadioWavesNode.ts,
      RadioSourcePanel.ts, MainMagnetPanel.ts, HintNode.ts, controlHelpers.ts,
      ChartFrameNode.ts, chartUtils.ts (both from PhotonInteractions), nucleusColors.ts
    SimplifiedMRIScreenIcons.ts
  nmr/          NMRModel (20-nucleus grid); EnergyLevelDiagram, NMRScreenView
  mri/          MRIModel (head, tumour, detector); HeadNode, DetectorNode, DetectorPanel,
                GradientMagnetsPanel, MRIScreenView
  relaxation/   blochPhysics.ts (pure), Tissue, RelaxationModel; BlochSphereNode,
                RelaxationChartsNode, createLogTimeControl, RelaxationScreenView
  preferences/  snapToResonance (?snapToResonance=false)
```

## Decisions

- **One model class for NMR and MRI.** PhET's `AbstractMriModule` shared everything but the
  sample; `ResonanceModel` does the same, taking the nuclei as constructor specs and an optional
  detector. Gradient Properties exist on both screens and stay at zero on NMR.
- **Agents become private methods.** PhET's model elements (`ThermalNoise`, `DipoleFlipper`,
  `PhotonDipoleCollisionAgent`, `CollisionAgent`) are steps of `stepModel`, in a fixed order:
  emit, move, absorb, relax, thermal noise, glyph motion, detector.
- **Photons are not Properties.** Up to a couple of hundred exist at once. The model keeps a plain
  array; `RadioWavesNode` repositions pooled `Path`s each frame.
- **Glyph motion lives in the model.** `Nucleus.step` integrates PhET's damped pendulum
  (spring 270 s⁻², damping 10.5 s⁻¹, kick 9 rad/s, PhET's constants converted to seconds) with
  substeps of at most 1/120 s, so the swing does not depend on the frame rate and tests can
  check it.
- **Randomness.** All draws use the model's `Random` (default `dotRandom`), never `Math.random`.
  Tests pass `new Random({ seed })`.
- **View state on the model.** Wave/photon view, field arrows, precession, head and nuclei
  visibility and the hint are Properties on the model so Reset All restores them in one place.
- **Equal-width panels.** `SimplifiedMRIPanel` defaults to `minWidth = CONTROL_WIDTH + 24`, and
  the right-hand columns are `VBox`es with `stretch: true`.
- **Log sliders for T1 and T2.** `createLogTimeControl` drives a log10 copy of the time Property,
  synced both ways; the readout and aria-valuetext show milliseconds. NumberDisplay forbids
  `numberFormatter` together with `valuePattern`/`decimalPlaces`, so `createNumberControl` passes
  one set or the other.
- **Do not bind a node's `visibleProperty` to a model Property and then set `visible`.** The
  setter writes through to the model. `BlochSphereNode` sets its isochromat layer's visibility
  each frame and therefore reads the preference instead of binding it.

## Testing

- `tests/resonance.test.ts`: physics functions, sample geometry, populations, gradient field,
  emission rate, on/off resonance, emitted frequency, slice selection with a gradient,
  saturation without inversion, detector counts, snap-to, tumour add/remove, reset, glyph swing.
- `tests/relaxation.test.ts`: pulses, exact relaxation (1/e at T1 and T2, composition of steps,
  T1 ln 2 zero crossing), isochromat spread, window choice, the model's tissue/custom logic,
  T2 ≤ T1, a pulse followed by relaxation, reset.
- `tests/memory-leak.test.ts`: TimeModel, Detector, Nucleus.

Screen models are reachable from the browser console as `phet.joist.sim.screens[i].model`.
