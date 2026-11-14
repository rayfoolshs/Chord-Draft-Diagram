# Build & Architecture Guide

This document covers local setup, verification, production builds, theming, audio architecture, and codebase organization for **Chord Draft Diagram Make by Ray Foo**.

---

## Prerequisites

- **Node.js**: v20+ recommended (matching `@types/node` `^22.14.0`)
- **Package Manager**: `npm` (or `bun`, lockfile `bun.lock` is present)

---

## Tech Stack

- **Framework**: React 19 (`react`, `react-dom`) + TypeScript (`^7.0.2`)
- **Bundler**: Vite (`^8.3.0`) with `@vitejs/plugin-react`
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`, `@import "tailwindcss";` + `@custom-variant dark (&:where(.dark, .dark *));` in `src/index.css`)
- **Icons**: `lucide-react` (`^0.546.0`)
- **Audio**: `soundfont-player` (`^0.12.0`, loading `FluidR3_GM` General MIDI guitar programs `25–32`) paired with an offline Web Audio API Karplus-Strong physical modeling fallback

---

## NPM Scripts

All scripts are defined in `package.json`:

| Command | Action | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `vite --port=3000 --host=0.0.0.0` | Start local development server on port `3000` |
| `npm run lint` | `tsc --noEmit` | Run strict TypeScript type checking |
| `npm run build` | `vite build` | Compile and bundle production static assets into `dist/` |
| `npm run preview` | `vite preview` | Preview the compiled `dist/` production bundle locally |
| `npm run clean` | `rm -rf dist server.js` | Remove compiled build artifacts |

---

## Step-by-Step Build Verification

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Type-check the codebase**

   ```bash
   npm run lint
   ```

3. **Create the production bundle**

   ```bash
   npm run build
   ```

   Vite outputs static HTML, JS, and CSS assets into `dist/`.

4. **Verify the production bundle locally**

   ```bash
   npm run preview
   ```

---

## Project Directory Structure

```text
/
├── index.html                        # Entry HTML, metadata, Google Fonts (Outfit, DM Sans, IBM Plex Mono)
├── metadata.json                     # Applet metadata
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript configuration
├── vite.config.ts                    # Vite + React + Tailwind v4 configuration
├── README.md                         # Project overview & quick start
├── BUILD.md                          # Build, scripts, and architecture guide
├── EMBED_GUIDE.md                    # Vanilla JS embed & SVG/PNG/JSON export reference
└── src/
    ├── main.tsx                      # React root mount
    ├── index.css                     # Tailwind v4 import, @custom-variant dark, base typography
    ├── App.tsx                       # Main workspace shell, theme slider state, Diagram Studio
    ├── types/
    │   ├── chord.ts                  # Shared TypeScript interfaces & GM GuitarTone union
    │   └── soundfont-player.d.ts     # Module type declarations for soundfont-player
    ├── data/
    │   └── chordLibrary.ts           # Open & movable CAGED voicing library + chord query parser
    ├── utils/
    │   ├── musicTheory.ts            # Pitch spelling, tuning presets, chord detection engine, transposition
    │   ├── audioEngine.ts            # FluidR3_GM General MIDI SoundFont loader + Karplus-Strong fallback
    │   ├── svgGenerator.ts           # Self-contained SVG builder & high-DPI Canvas PNG rasterizer
    │   └── embedGenerator.ts         # Zero-dependency Vanilla JS widget & JSON spec generator
    └── components/
        ├── Header.tsx                # 3-zone top navigation bar
        ├── ThemeSliderBar.tsx        # 0%–100% Light-to-Dark workspace luminance slider
        ├── FretboardSvg.tsx          # Interactive SVG fretboard (click, barre drag, open/mute, pluck)
        ├── ChordTheoryPanel.tsx      # Real-time harmonic detection & per-string interval table
        ├── LookupSidebar.tsx         # Root/quality grid, quick search, mini SVG voicing previews
        ├── CustomizeSidebar.tsx      # Finger tools, title, frets, orientation, handedness, tuning, theme
        ├── LearnChordsView.tsx       # Beginner chord lessons & Practice & Check exercise validator
        ├── ProgressionSheetView.tsx  # Multi-chord chart builder, BPM player, sheet PNG/SVG export
        ├── EmbedExportView.tsx       # PNG/SVG download & Vanilla JS / SVG / JSON code studio
        └── TheoryReferenceView.tsx   # Chord diagram reading primer & interval formula reference
```

---

## Audio & Theme Notes

- **General MIDI SoundFont & Offline Fallback**: `src/utils/audioEngine.ts` caches loaded `FluidR3_GM` instruments in memory via `soundfont-player`. If a voice is still downloading or network access is restricted, playback falls back immediately to a per-program Karplus-Strong Web Audio synthesizer (including soft-clipping waveshaping for `overdriven_guitar` and `distortion_guitar`, short palm-damping for `electric_guitar_muted`, and octave overtone shaping for `guitar_harmonics`).
- **Light-to-Dark Luminance Slider**: `src/App.tsx` defaults to `50` (`Dusk Slate`, dark mode enabled), persists the slider value (`0–100`) under `chorddraft-theme-level` in `localStorage`, updates the `--canvas-bg` CSS variable smoothly, and toggles the `.dark` class on `<html>` at `>= 50`.
- **Browser Audio Policy**: Browsers require a user gesture before unlocking `AudioContext`. All playback calls ensure and resume the context on demand inside click handlers.
