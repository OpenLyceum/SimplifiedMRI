# Model — Simplified MRI

The physics behind each screen, what is to scale and what is not, and how this port differs from
PhET's Java original (`mri` 1.08.00, pinned in `Baseline/PhET/mri`). Code: `src/common/model/`,
`src/relaxation/model/`.

## Units

| Quantity | Unit | Notes |
|---|---|---|
| Length | cm | Chamber 24 × 21 cm, origin at its lower-left corner, y up. PhET's 400 × 350 px × 0.06 cm/px. |
| Time (NMR, MRI) | s | PhET's clock: 12 units per 40 ms frame, so 1 unit = 1/300 s. |
| Time (Relaxation) | ms of tissue time | Runs at 20, 200 or 1000 ms per second of wall time. |
| Field | T | |
| Frequency | MHz | γ is quoted as γ/2π in MHz/T. |

## NMR and MRI screens (`ResonanceModel`)

### Field

The main magnet gives a uniform field B0 (0–3 T). Each gradient magnet adds a linear term, zero
at the chamber centre, with the slider value G the difference between the two edges:

B(x, y) = B0 + Gx (x − W/2)/W + Gy (y − H/2)/H, with G from 0 to 0.2 T.

### Resonance

A nucleus at position r resonates at its Larmor frequency f(r) = γ |B(r)|. The sign of B sets the local field direction and the
direction of display precession. Gyromagnetic ratios
(|γ|/2π, MHz/T): ¹H 42.577, ¹⁴N 3.077, ²³Na 11.262, ¹³C 10.708, ¹⁷O 5.772, ³³S 3.272, and
the unknown nucleus ⁶⁵Cu 12.103. (PhET's values, identified by isotope. ¹⁷O's γ is negative;
only its magnitude matters here.)

A photon of frequency f gets one interaction roll when its path passes within 1.8 cm of a nucleus,
with probability

P = 0.6 exp(−(f − f(r))² / 2σ²), σ = 0.35 MHz.

- An aligned (lower-energy) nucleus absorbs the photon and flips to anti-aligned.
- An anti-aligned nucleus undergoes stimulated emission: it flips to aligned and a second,
  identical photon joins the beam.

An excited nucleus relaxes after a Gaussian wait (mean 0.83 s, spread 50%, at least 0.083 s) and
emits a photon toward the detector (+x) at f(r) of its own position.

### Populations

The target fraction of aligned nuclei rises linearly from 0.5 at 0 T to 0.9 at 3 T. Changing B0
flips random nuclei until the population matches. At random intervals (mean 1.67 s × (1 + 5B0/3 T),
spread 50%) one nucleus flips toward the target. These thermal flips do not emit.

### Not to scale

- **Population excess.** The real excess at 3 T and 310 K is tanh(hf/2kT) ≈ 1 × 10⁻⁵
  (`thermalAlignedExcess`, checked in the tests). The sim uses a 90/10 split at 3 T, an 80% fractional excess.
- **Photon speed.** 18 cm/s, not c.
- **Relaxation.** 0.83 s, about real T1 for these tissues, but the delay is a random wait, not the
  exponential recovery the Relaxation screen shows.
- **Precession.** When shown, nuclei precess at f/40 MHz revolutions per second, about 4 × 10⁷
  times slower than real. They do keep their relative rates, so a gradient visibly speeds up
  precession across the head.
- **Wave view.** The band spacing is 360/f cm (clamped to 2.2–18 cm). Real radio wavelengths at
  these frequencies are metres.

### Snap to resonance

As in PhET, releasing the field or frequency slider within 1.5 MHz of resonance at the chamber
centre moves it exactly onto resonance. Preferences → Simulation (or `?snapToResonance=false`)
turns this off.

### Detector (MRI)

The detector face is 4.8 cm right of the chamber. Every emitted photon reaching it is counted;
the readout is the count over the last second.

## Changes from PhET's original

| PhET 1.08 | This port | Why |
|---|---|---|
| Spin states named "down" (lower energy) and "up" | aligned / anti-aligned with the field | PhET's names were the reverse of the glyphs and of the usual convention for protons. |
| Emitted photons used the lower coil's field, B0/2 | γB at the emitting nucleus | They were emitted at half the absorbed frequency. |
| Absorption only | absorption and stimulated emission, at equal rates | Resonant RF pumped nearly every nucleus into the upper state (population inversion). Real RF saturates toward 50/50. |
| Hard window, |Δf| < ε = γ_H·3 T/150·4 ≈ 3.4 MHz | Gaussian line, σ = 0.35 MHz | The window was as wide as the whole gradient spread, so a gradient could barely select a slice. |
| One absorption roll per frame while overlapping | One roll per photon–nucleus encounter along the photon path | Repeated frames inside the same capture circle no longer create extra rolls, and a step can detect an encounter between its endpoints. |
| Absorption probability rising with distance from the source | Uniform | PhET's `LinearCollisionProbability` subtracted the absolute y of the nucleus, which reversed the intended attenuation. |
| Target aligned fraction 0.9(0.5 + 0.5B/3), 45% at 0 T | 0.5 + 0.4B/3 | Equal populations at zero field. |
| Frequency 10–110 MHz | 1–130 MHz | Nitrogen-14 and sulfur-33 could never reach resonance, and hydrogen above 2.58 T could not either. |
| Gradient 0–0.08 T | 0–0.2 T | With the narrower line, a stronger gradient makes slices distinct. |
| Tumour: separate grid, one row of five nuclei | Half-spacing lattice anchored on the head's grid, skipping head positions | No overlapping glyphs; a visibly denser region. |
| Detector count reset every 0.67 s | Sliding one-second window | Steadier readout. |
| PhET's screenshot shows 1.98 T with 57.8 MHz | Resonance at γB0 | The screenshot predates 1.08; in the pinned code, `isTransitionMatch` already uses the total field at the centre, γB0. |

## Relaxation screen (new)

The net magnetization M of a tissue's protons, in units of M0, at 1.5 T (63.9 MHz).

- **RF pulse.** A rotation about the rotating-frame x′ axis by the flip angle α (10–180°),
  animated over 0.6 s of wall time with the tissue clock held. A real pulse lasts microseconds to
  milliseconds, much less than T2.
- **Relaxation.** The exact solution of the Bloch equations with no RF, in the rotating frame:
  Mxy decays as e^(−t/T2), and Mz recovers as 1 − (1 − Mz(0)) e^(−t/T1). After an inversion
  (α = 180°), Mz crosses zero at T1 ln 2.
- **Precession.** In the lab frame, M turns about B0 at 0.6 rev/s of wall time (slowed about
  10⁸ times). The rotating-frame view removes this.
- **Isochromats.** Twelve spins with frequency offsets at the quantiles of a Lorentzian of half
  width 1/T2. The fixed offsets qualitatively illustrate how transverse coherence is lost.
  In MRI, static frequency offsets produce reversible dephasing that contributes to T2*.
  The net arrow and the graphs use the exact Bloch solution with intrinsic T2.
- **Signal.** Mxy cos(ωt), with ω chosen to give 12 oscillations across the transverse graph. The
  real signal oscillates at 63.9 MHz.
- **Tissues (1.5 T, ms).** Fat 340/60, white matter 880/70, gray matter 1120/95, muscle 1010/45,
  blood 1440/290, cerebrospinal fluid 4000/2000. Typical values after Stanisz et al. 2005 and
  Bojorquez et al. 2017; published values vary by tens of percent. T2 is held at or below T1.
