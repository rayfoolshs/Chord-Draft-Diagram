# Chord Draft Diagram Make by Ray Foo

An interactive SVG guitar chord diagram maker, harmonic detector, beginner chord trainer, General MIDI SoundFont player, progression sheet builder, and export studio for music educators, guitar learners, and web developers.

---

## Core Modules

- **Diagram Studio (`src/App.tsx`, `src/components/FretboardSvg.tsx`)**
  - Interactive vertical and horizontal SVG fretboard supporting click-to-place notes, drag-to-create barres, open (`O`) and muted (`×`) nut toggles, left- and right-handed layouts, adjustable starting fret (`1–15`) and fret window (`4–6`), undo/redo history, and `±1` semitone transposition.
  - Switch dot labels between **Fingers (`1–4, T`)**, **Note Names**, **Scale Intervals (`R, 3, 5, ♭7`)**, or **Plain** dots across four diagram themes (`Classic Print`, `Sheet Parchment`, `Studio Dark`, `Blueprint`).
- **Workspace Light-to-Dark Mode Slider (`src/components/ThemeSliderBar.tsx`)**
  - Continuous `0%–100%` luminance slider (`Daylight` → `Soft Paper` → `Dusk Slate` → `Studio Dark`) with quick **Light** and **Dark** endpoint buttons and `localStorage` persistence.
- **General MIDI Guitar SoundFont & Audio Preview (`src/utils/audioEngine.ts`)**
  - Plays chords (`Strum Down`, `Strum Up`, `Arpeggiate`) and individual strings using `soundfont-player` (`FluidR3_GM`) across all 8 General MIDI guitar programs (`GM 25`–`GM 32`):
    - `GM 25` Acoustic Guitar (Nylon)
    - `GM 26` Acoustic Guitar (Steel)
    - `GM 27` Electric Guitar (Jazz)
    - `GM 28` Electric Guitar (Clean)
    - `GM 29` Electric Guitar (Muted)
    - `GM 30` Overdriven Guitar
    - `GM 31` Distortion Guitar
    - `GM 32` Guitar Harmonics
  - Includes an automatic per-program Karplus-Strong physical modeling synthesizer fallback while SoundFonts load or when offline.
- **Real-Time Chord Detection (`src/utils/musicTheory.ts`, `src/components/ChordTheoryPanel.tsx`)**
  - Analyzes sounding pitches across standard and alternate tunings (`Standard`, `Drop D`, `Half-Step Down`, `DADGAD`, `Open G`, `Open D`, or custom per-string tuning) to detect triads, sevenths, suspended chords, extensions, slash chords (`/Bass`), enharmonic alternatives, and per-string interval roles.
- **Chord Lookup Library (`src/data/chordLibrary.ts`, `src/components/LookupSidebar.tsx`)**
  - Instant symbol search (for example `Am7`, `F#m`, `Cmaj7`) and browsing across 12 root notes and 16 chord qualities with mini SVG voicing previews for open, easy, movable, and barre shapes.
- **Learn Chords (`src/components/LearnChordsView.tsx`)**
  - Introduces 8 foundational beginner open chords (`Em`, `Am`, `C`, `G`, `D`, `E`, `A`, and 4-string `F`).
  - **Guided Lesson** mode presents step-by-step finger placement tables, open/muted string guidance, posture tips, and per-string audio auditioning.
  - **Practice & Check** mode lets learners build each chord from memory on an interactive fretboard, audition their attempt, request a 1-string hint, and run **Check My Chord** for string-by-string reference comparison.
- **Progression Sheet (`src/components/ProgressionSheetView.tsx`)**
  - Assemble multi-chord song or lesson charts, load starter progressions, audition sequences in tempo (`50–140 BPM`), and export full sheets as **PNG** or **SVG**.
- **Developer Embed & Export (`src/components/EmbedExportView.tsx`, `src/utils/svgGenerator.ts`, `src/utils/embedGenerator.ts`)**
  - Download standalone `.svg` vector diagrams and high-DPI (`2×`–`4×`) `.png` rasters, or copy inline SVG markup, structured JSON chord specs, and a zero-dependency Vanilla JS embed widget.
- **Theory Guide (`src/components/TheoryReferenceView.tsx`)**
  - Visual primer on reading chord diagrams, finger numbering, barre symbols, and common chord interval formulas.

---

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

For full build, verification, and architecture details, see [`BUILD.md`](./BUILD.md).  
For integrating exported diagrams into websites and LMS pages, see [`EMBED_GUIDE.md`](./EMBED_GUIDE.md).
