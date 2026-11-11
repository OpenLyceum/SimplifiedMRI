# AGENTS.md — Simplified MRI

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

A SceneryStack port of PhET's retired Java sim **Simplified MRI** (`mri` 1.08.00, Ron LeMaster),
with its physics oddities fixed and a third screen added. Forked from `SceneryStackTemplate` on
11 Nov 2026. The Java source is pinned in `../Baseline/PhET/mri` (fetch with
`Baseline/scripts/fetch-baselines.sh --only PhET/mri`); read it before changing ported behaviour.

| Screen | Folder | Content |
|---|---|---|
| NMR | `src/nmr/` | PhET's "Simplified NMR" tab: 20 nuclei, main field 0–3 T, seven sample nuclei, radio source (power, 1–130 MHz, wave/photon view), energy-level diagram |
| MRI | `src/mri/` | PhET's "Simplified MRI" tab: vector head, horizontal and vertical gradients, detector, add/remove tumour |
| Relaxation | `src/relaxation/` | New: net magnetization on a Bloch sphere, RF pulse of any flip angle, T1/T2 graphs and signal, isochromats, six tissues or custom T1/T2 |

Physics, units and every change from PhET: [`doc/model.md`](doc/model.md). Architecture and
decisions: [`doc/implementation-notes.md`](doc/implementation-notes.md).

### Things to know first

- **Units are cm, s, T and MHz** on the NMR and MRI screens (γ is γ/2π in MHz/T); the Relaxation
  screen's tissue clock is in **ms**. Chamber origin is its lower-left corner, y up.
- **Spin states are `"aligned"` (lower energy) and `"antiAligned"`.** PhET called them "down"
  and "up"; do not reintroduce those names.
- **Deliberate departures from PhET are listed in `doc/model.md`** (emitted frequency, stimulated
  emission, Gaussian line, uniform absorption, population target, frequency and gradient ranges,
  tumour lattice). Keep that table current when changing the model.
- **Several things are not to scale on purpose** (population excess, photon speed, precession
  rate, wave spacing, signal oscillation). Each is labelled in the UI or in `doc/model.md`.
- **Random numbers come from the model's `Random`** (`dotRandom` by default), never `Math.random`.
  Tests pass a seeded one.
- **Never bind a node's `visibleProperty` to a model Property and then set `visible` on it**: the
  setter writes through and silently changes the model (this hid the isochromats once).
- **Node >=26** is required (`engines` / `devEngines`). If `node -v` is older, run
  `source ~/.nvm/nvm.sh && nvm use 26` before npm or git commit (the pre-commit hook runs npm).

## Key files

| File | Purpose |
|---|---|
| `src/common/model/ResonanceModel.ts` | Shared NMR/MRI model: fields, photons, absorption and stimulated emission, relaxation, thermal flips, snap-to |
| `src/common/model/resonancePhysics.ts` | Pure functions: Larmor frequency, line shape, population target, real thermal excess |
| `src/common/model/sampleGeometry.ts` | NMR grid, head and ear ellipses, tumour lattice (PhET geometry in cm) |
| `src/common/model/Nucleus.ts` | Spin state, relaxation countdown, damped glyph swing, precession phase |
| `src/common/view/ResonanceScreenView.ts` | Shared play area and layout constants (`LAYOUT`) |
| `src/common/view/RadioWavesNode.ts` | Wave bands and pooled photon glyphs |
| `src/relaxation/model/blochPhysics.ts` | Exact Bloch relaxation, x′ rotation, isochromat offsets, chart windows |
| `src/relaxation/model/Tissue.ts` | Tissue T1/T2 presets at 1.5 T with references |
| `src/SimplifiedMRIConstants.ts` | Grouped `as const` blocks: `CHAMBER`, `MAGNET`, `RADIO`, `RESONANCE`, `SPIN`, `NUCLEUS`, `SAMPLE`, `DETECTOR`, `RELAXATION`, `FONTS` |
| `src/SimplifiedMRIColors.ts` | Every colour, default and projector |
| `src/preferences/` | One preference, Snap sliders to resonance (`?snapToResonance=false`), passed to the NMR and MRI screens |

## Accessibility

Standard fleet pattern. Per-screen a11y strings live under `a11y.<screenKey>` in each locale JSON
(`a11y.common` for strings shared by NMR and MRI), reached via `StringManager.get<Screen>A11yStrings()`;
visible strings via `getCommonStrings()`, `getMRIStrings()` and `getRelaxationStrings()`. Every
screen has a live `*ScreenSummaryContent`, `pdomOrder` on the play and control areas, and a
`*KeyboardHelpContent`. The NMR screen announces reaching and leaving resonance; the MRI screen
announces the tumour; the Relaxation screen announces a pulse. There are no draggable objects.
Full convention: [Baton/ACCESSIBILITY.md](https://github.com/OpenLyceum/Baton/blob/main/ACCESSIBILITY.md).

## Compliance carve-outs

- **Grouped constants.** `SimplifiedMRIConstants.ts` uses topical `as const` objects rather than a
  flat list of exports, as PhotonInteractions and RelativisticDynamics do.

## `package.json` overrides

JSON cannot carry comments, so the rationale for forced transitive pins lives here. Prefer
**tilde (`~`) or exact** versions — caret (`^`) lets minors drift under what is meant to be a
hard pin. Dependabot ignores these three names (see `.github/dependabot.yml`) so it does not
open PRs that fight the overrides. Revisit when SceneryStack drops or re-pins them upstream.

| Override | Pin | Why |
|---|---|---|
| `lodash` | `~4.18.1` | SceneryStack declares `~4.17.12`. Bump clears Dependabot/npm advisories patched in 4.18.x (e.g. GHSA-r5fr-rjxr-66jc, GHSA-f23m-r3pf-42rh). |
| `three` | `~0.125.2` | SceneryStack declares `^0.104.0`. Floor is 0.125.0 for GHSA-fq6p-x6j3-cmmq (ReDoS). Staying on the 0.125 line avoids a larger API jump; **0.125.x still has open CVEs** (e.g. XSS GHSA-7vvq-7r29-5vg3, fixed only in ≥0.137.0). Remove this override if/when SceneryStack stops depending on `three` or pins a patched line itself. |
| `brace-expansion` | `~5.0.12` | Transitive via `vite-plugin-pwa` / Workbox. Clears npm audit (originally GHSA-mh99-v99m-4gvg; keep ≥5.0.9 for GHSA-rgw5-rvv9-x895; ≥5.0.12 for the CPU-DoS advisory). |

## Commands

```bash
npm run lint && npm run check && npm run build && npm test
```

Dev server for screenshots: `npx vite --port <free port>`; screen models are reachable from the
console as `phet.joist.sim.screens[i].model` (with `?screens=n`, index 0).
