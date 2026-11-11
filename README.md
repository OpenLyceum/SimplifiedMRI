# Simplified MRI

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

How magnetic resonance works, from nuclear spins in a magnet to an image of a head. Tune radio
waves until nuclei absorb and flip, add gradient magnets so only one slice of the head
resonates, then watch a tissue's magnetization precess and relax after an RF pulse. A
SceneryStack reimplementation of PhET's retired Java sim *Simplified MRI*, with its oddities
fixed and a third screen on relaxation. Built with [SceneryStack](https://scenerystack.org/);
runs offline as a Progressive Web App.

## Features

- **NMR.** Twenty nuclei in a uniform field from 0 to 3 T. A radio-wave source (power,
  frequency from 1 to 130 MHz, wave or photon view) sends photons up through the sample; a
  nucleus absorbs only when f = γB, flips to the higher-energy state, and later relaxes and
  emits. An energy-level diagram counts the nuclei on each level and compares the photon energy
  with the gap. Seven sample nuclei, including a mystery one to identify from its resonance.
- **MRI.** A head full of hydrogen nuclei, horizontal and vertical gradient magnets, a detector
  that counts emitted photons, and a tumour of densely packed nuclei to add or remove. With a
  gradient on, each frequency excites one slice; sweep it to find the tumour.
- **Relaxation** (new). A tissue's net magnetization on a sphere: apply a pulse of any flip
  angle and watch it nutate, precess and relax. Graphs of Mz recovering with T1 and |Mxy| (and
  the signal) decaying with T2; individual spins show the dephasing behind T2. Six tissues with
  typical 1.5 T values, or set T1 and T2 yourself.
- **Physics fixes over PhET's original:** emitted photons carry the right frequency; strong RF
  saturates the populations (stimulated emission) instead of inverting them; absorption follows
  a resonance line instead of a hard window; every nucleus can be brought to resonance. Details in
  [`doc/model.md`](doc/model.md).
- **Accessible:** every control works from the keyboard; live screen summaries and resonance
  announcements; keyboard-help dialogs. English, French and Spanish; default and projector
  colour profiles; installable PWA. A preference (or `?snapToResonance=false`) turns off PhET's
  snap-to-resonance on slider release.

## Quick Start

```bash
npm install
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Vitest unit tests (includes memory-leak suite) |
| `npm run test:fuzz` | Optional Playwright fuzz smoke: pointer (`?fuzz`) + keyboard (`?fuzzBoard`), with `?ea`, 30s each |
| `npm run test:fuzz -- 90` | Same fuzz for 90 seconds (`--duration 90` or `FUZZ_DURATION=90` also work) |
| `npm run test:fuzz:quick` | Shorter fuzz smoke (10s) |
| `npm run test:fuzz:long` | Longer fuzz smoke (300s) |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |
| `npm run clean` | Remove `dist/` |

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.6 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^2 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenLyceum org license](https://github.com/OpenLyceum/.github/blob/main/LICENSE).
This is an independent OpenLyceum reimplementation, not an official PhET product. See
[CREDITS.md](CREDITS.md) for the original's authors.

## Contributing

See [OpenLyceum contributing guidelines](https://github.com/OpenLyceum/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
