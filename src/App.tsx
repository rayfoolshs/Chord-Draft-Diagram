import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  ListMusic,
  Plus,
  RotateCcw,
  Sliders,
  Sparkles,
  Undo2,
  Redo2,
  Volume2,
} from 'lucide-react';
import {
  ChordDiagramConfig,
  ChordVoicingPreset,
  FingerLabel,
  FingerTool,
  GuitarTone,
  SavedChordSlot,
} from './types/chord';
import {
  TUNING_PRESETS,
  autoAssignFingers,
  detectChord,
  transposeDiagram,
} from './utils/musicTheory';
import {
  GM_GUITAR_PRESETS,
  SoundfontStatus,
  guitarAudio,
} from './utils/audioEngine';
import { generateChordSvgString, triggerDownload } from './utils/svgGenerator';
import { Header, WorkspaceView } from './components/Header';
import { ThemeSliderBar } from './components/ThemeSliderBar';
import { FretboardSvg } from './components/FretboardSvg';
import { ChordTheoryPanel } from './components/ChordTheoryPanel';
import { LookupSidebar } from './components/LookupSidebar';
import { CustomizeSidebar } from './components/CustomizeSidebar';
import { EmbedExportView } from './components/EmbedExportView';
import { LearnChordsView } from './components/LearnChordsView';
import { ProgressionSheetView } from './components/ProgressionSheetView';
import { TheoryReferenceView } from './components/TheoryReferenceView';

const INITIAL_CONFIG: ChordDiagramConfig = {
  title: 'C',
  subtitle: 'Open Position',
  syncTitleWithDetected: true,
  strings: [
    { fret: null, muted: true, finger: '' },
    { fret: 3, muted: false, finger: '3' },
    { fret: 2, muted: false, finger: '2' },
    { fret: 0, muted: false, finger: '' },
    { fret: 1, muted: false, finger: '1' },
    { fret: 0, muted: false, finger: '' },
  ],
  barres: [],
  baseFret: 1,
  fretCount: 5,
  tuningId: 'standard',
  customTuningMidi: [...TUNING_PRESETS[0].midi],
  handedness: 'right',
  orientation: 'vertical',
  dotLabelMode: 'finger',
  showTuningLabels: true,
  showChordTitle: true,
  showIntervalsFooter: true,
  theme: 'classic',
  accentColor: '#0284C7',
};

const INITIAL_PROGRESSION: SavedChordSlot[] = [
  {
    id: 'init-1',
    detectedShortName: 'C',
    config: INITIAL_CONFIG,
  },
  {
    id: 'init-2',
    detectedShortName: 'G',
    config: {
      ...INITIAL_CONFIG,
      title: 'G',
      subtitle: '',
      strings: [
        { fret: 3, muted: false, finger: '2' },
        { fret: 2, muted: false, finger: '1' },
        { fret: 0, muted: false, finger: '' },
        { fret: 0, muted: false, finger: '' },
        { fret: 0, muted: false, finger: '' },
        { fret: 3, muted: false, finger: '3' },
      ],
    },
  },
  {
    id: 'init-3',
    detectedShortName: 'Am',
    config: {
      ...INITIAL_CONFIG,
      title: 'Am',
      subtitle: '',
      strings: [
        { fret: null, muted: true, finger: '' },
        { fret: 0, muted: false, finger: '' },
        { fret: 2, muted: false, finger: '2' },
        { fret: 2, muted: false, finger: '3' },
        { fret: 1, muted: false, finger: '1' },
        { fret: 0, muted: false, finger: '' },
      ],
    },
  },
  {
    id: 'init-4',
    detectedShortName: 'F',
    config: {
      ...INITIAL_CONFIG,
      title: 'F',
      subtitle: '',
      strings: [
        { fret: null, muted: true, finger: '' },
        { fret: null, muted: true, finger: '' },
        { fret: 3, muted: false, finger: '3' },
        { fret: 2, muted: false, finger: '2' },
        { fret: 1, muted: false, finger: '1' },
        { fret: 1, muted: false, finger: '1' },
      ],
      barres: [{ id: 'init-f-b', fret: 1, fromString: 4, toString: 5, finger: '1' }],
    },
  },
];

function computeCanvasBg(level: number): string {
  if (level < 50) {
    // 0 -> #f8fafc, 49 -> #e9eef5
    const t = level / 49;
    const r = Math.round(248 - t * 15);
    const g = Math.round(250 - t * 12);
    const b = Math.round(252 - t * 7);
    return `rgb(${r}, ${g}, ${b})`;
  }
  // 50 -> #111827, 100 -> #020617
  const t = (level - 50) / 50;
  const r = Math.round(17 - t * 15);
  const g = Math.round(24 - t * 18);
  const b = Math.round(39 - t * 16);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function App() {
  const [themeLevel, setThemeLevel] = useState<number>(() => {
    try {
      const saved = window.localStorage.getItem('chorddraft-theme-level');
      if (saved !== null) {
        const parsed = Number(saved);
        if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage access errors
    }
    return 50;
  });

  useEffect(() => {
    const isDark = themeLevel >= 50;
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.setProperty(
      '--canvas-bg',
      computeCanvasBg(themeLevel)
    );
    try {
      window.localStorage.setItem('chorddraft-theme-level', String(themeLevel));
    } catch {
      // Ignore storage access errors
    }
  }, [themeLevel]);

  const [activeView, setActiveView] = useState<WorkspaceView>('studio');
  const [config, setConfig] = useState<ChordDiagramConfig>(INITIAL_CONFIG);
  const [history, setHistory] = useState<ChordDiagramConfig[]>([]);
  const [redoStack, setRedoStack] = useState<ChordDiagramConfig[]>([]);
  const [rightTab, setRightTab] = useState<'lookup' | 'customize' | 'export'>(
    'lookup'
  );
  const [fingerTool, setFingerTool] = useState<FingerTool>('auto');
  const [tone, setTone] = useState<GuitarTone>('acoustic_guitar_steel');
  const [sfStatus, setSfStatus] = useState<SoundfontStatus>('idle');

  useEffect(() => {
    setSfStatus(guitarAudio.getStatus(tone));
    const unsub = guitarAudio.onStatusChange((changedTone, status) => {
      if (changedTone === tone) {
        setSfStatus(status);
      }
    });
    return unsub;
  }, [tone]);
  const [activeStringIndex, setActiveStringIndex] = useState<number | null>(
    null
  );
  const [progressionSlots, setProgressionSlots] =
    useState<SavedChordSlot[]>(INITIAL_PROGRESSION);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const detected = useMemo(
    () => detectChord(config.strings, config.customTuningMidi),
    [config.strings, config.customTuningMidi]
  );

  const commitConfig = useCallback(
    (updater: (prev: ChordDiagramConfig) => ChordDiagramConfig) => {
      setConfig((prev) => {
        const next = updater(prev);
        setHistory((h) => [...h.slice(-24), prev]);
        setRedoStack([]);
        return next;
      });
    },
    []
  );

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setRedoStack((r) => [...r, config]);
    setConfig(prev);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, -1));
    setHistory((h) => [...h, config]);
    setConfig(next);
  };

  const handleCellClick = (stringIndex: number, absFret: number) => {
    commitConfig((prev) => {
      const nextStrings = prev.strings.map((s) => ({ ...s }));
      const curr = nextStrings[stringIndex];
      const isSameFret = !curr.muted && curr.fret === absFret;

      if (fingerTool === 'erase') {
        if (isSameFret) {
          nextStrings[stringIndex] = { fret: 0, muted: false, finger: '' };
        }
        return { ...prev, strings: nextStrings };
      }

      if (fingerTool === 'auto' || fingerTool === 'barre') {
        if (isSameFret) {
          nextStrings[stringIndex] = { fret: 0, muted: false, finger: '' };
          return { ...prev, strings: autoAssignFingers(nextStrings) };
        }
        nextStrings[stringIndex] = { fret: absFret, muted: false, finger: '' };
        guitarAudio.pluckMidi(prev.customTuningMidi[stringIndex] + absFret, tone);
        return { ...prev, strings: autoAssignFingers(nextStrings) };
      }

      const targetFinger = fingerTool as FingerLabel;
      if (isSameFret && curr.finger === targetFinger) {
        nextStrings[stringIndex] = { fret: 0, muted: false, finger: '' };
      } else {
        nextStrings[stringIndex] = {
          fret: absFret,
          muted: false,
          finger: targetFinger,
        };
        guitarAudio.pluckMidi(prev.customTuningMidi[stringIndex] + absFret, tone);
      }
      return { ...prev, strings: nextStrings };
    });
  };

  const handleToggleOpenMute = (stringIndex: number) => {
    commitConfig((prev) => {
      const nextStrings = prev.strings.map((s) => ({ ...s }));
      const curr = nextStrings[stringIndex];
      if (curr.muted || curr.fret === null) {
        nextStrings[stringIndex] = { fret: 0, muted: false, finger: '' };
        guitarAudio.pluckMidi(prev.customTuningMidi[stringIndex], tone);
      } else {
        nextStrings[stringIndex] = { fret: null, muted: true, finger: '' };
      }
      return { ...prev, strings: nextStrings };
    });
  };

  const handleCreateBarre = (
    fret: number,
    fromString: number,
    toString: number
  ) => {
    const lo = Math.min(fromString, toString);
    const hi = Math.max(fromString, toString);
    commitConfig((prev) => {
      const nextStrings = prev.strings.map((s, idx) => {
        if (idx >= lo && idx <= hi) {
          return { fret, muted: false, finger: '1' as FingerLabel };
        }
        return { ...s };
      });
      const filteredBarres = prev.barres.filter((b) => b.fret !== fret);
      return {
        ...prev,
        strings: nextStrings,
        barres: [
          ...filteredBarres,
          {
            id: `barre-${Date.now()}`,
            fret,
            fromString: lo,
            toString: hi,
            finger: '1',
          },
        ],
      };
    });
  };

  const handleRemoveBarre = (barreId: string) => {
    commitConfig((prev) => ({
      ...prev,
      barres: prev.barres.filter((b) => b.id !== barreId),
    }));
  };

  const handlePluckString = (stringIndex: number) => {
    const st = config.strings[stringIndex];
    if (st.muted || st.fret === null) return;
    setActiveStringIndex(stringIndex);
    guitarAudio.pluckMidi(config.customTuningMidi[stringIndex] + st.fret, tone);
    window.setTimeout(() => setActiveStringIndex(null), 350);
  };

  const handleApplyVoicing = (
    voicing: ChordVoicingPreset,
    chordShortTitle: string
  ) => {
    commitConfig((prev) => ({
      ...prev,
      title: chordShortTitle,
      subtitle: voicing.label,
      baseFret: voicing.baseFret,
      strings: voicing.frets.map((f, idx) => ({
        fret: f,
        muted: f === null,
        finger: voicing.fingers[idx] || '',
      })),
      barres: (voicing.barres || []).map((b, i) => ({
        id: `preset-b-${Date.now()}-${i}`,
        ...b,
      })),
    }));
  };

  const handleClearFretboard = () => {
    commitConfig((prev) => ({
      ...prev,
      title: 'Empty',
      subtitle: '',
      baseFret: 1,
      strings: Array.from({ length: 6 }, () => ({
        fret: 0,
        muted: false,
        finger: '',
      })),
      barres: [],
    }));
  };

  const handleSelectTuning = (tuningId: string) => {
    const preset = TUNING_PRESETS.find((t) => t.id === tuningId);
    if (!preset) return;
    commitConfig((prev) => ({
      ...prev,
      tuningId: preset.id,
      customTuningMidi: [...preset.midi],
    }));
  };

  const handleStepStringTuning = (stringIndex: number, delta: number) => {
    commitConfig((prev) => {
      const nextMidi = [...prev.customTuningMidi];
      nextMidi[stringIndex] = Math.max(
        28,
        Math.min(76, nextMidi[stringIndex] + delta)
      );
      return {
        ...prev,
        tuningId: 'custom',
        customTuningMidi: nextMidi,
      };
    });
  };

  const handleQuickExportSvg = () => {
    const svg = generateChordSvgString(config, detected);
    const slug = (
      (config.syncTitleWithDetected ? detected.shortName : config.title) ||
      'chord-diagram'
    )
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    triggerDownload(
      new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
      `${slug || 'chord'}.svg`
    );
  };

  const handleAddCurrentToSheet = () => {
    const label = config.syncTitleWithDetected
      ? detected.shortName
      : config.title || detected.shortName;
    const clonedConfig: ChordDiagramConfig = {
      ...config,
      strings: config.strings.map((s) => ({ ...s })),
      barres: config.barres.map((b) => ({ ...b })),
      customTuningMidi: [...config.customTuningMidi],
    };
    setProgressionSlots((prev) => [
      ...prev,
      {
        id: `slot-${Date.now()}`,
        config: clonedConfig,
        detectedShortName: label,
      },
    ]);
    setAddedToast(`Added ${label} to Progression Sheet`);
    window.setTimeout(() => setAddedToast(null), 2200);
  };

  return (
    <div
      className="min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-150"
      style={{ backgroundColor: 'var(--canvas-bg)' }}
    >
      <Header
        activeView={activeView}
        onSelectView={setActiveView}
        onQuickExportSvg={handleQuickExportSvg}
      />
      <ThemeSliderBar
        themeLevel={themeLevel}
        onChangeThemeLevel={setThemeLevel}
      />

      {activeView === 'studio' && (
        <main className="mx-auto max-w-[1440px] px-6 py-7">
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 items-start">
            {/* Left / Center Stage: Interactive SVG Fretboard + Audio + Harmonic Analysis */}
            <section className="lg:col-span-7 xl:col-span-7 space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                {/* Stage Top Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleUndo}
                      disabled={history.length === 0}
                      title="Undo"
                      aria-label="Undo"
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <Undo2 className="h-3.5 w-3.5" />
                      Undo
                    </button>
                    <button
                      type="button"
                      onClick={handleRedo}
                      disabled={redoStack.length === 0}
                      title="Redo"
                      aria-label="Redo"
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <Redo2 className="h-3.5 w-3.5" />
                      Redo
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        commitConfig((prev) => transposeDiagram(prev, -1))
                      }
                      title="Transpose down 1 semitone"
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                      −1 Semi
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        commitConfig((prev) => transposeDiagram(prev, 1))
                      }
                      title="Transpose up 1 semitone"
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                      +1 Semi
                    </button>
                    <button
                      type="button"
                      onClick={handleClearFretboard}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Clear
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCurrentToSheet}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-800 hover:bg-sky-100 whitespace-nowrap dark:border-sky-800 dark:bg-sky-950/70 dark:text-sky-300 dark:hover:bg-sky-900/70"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add to Sheet ({progressionSlots.length})
                  </button>
                </div>

                {addedToast && (
                  <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {addedToast}
                  </div>
                )}

                {/* Interactive SVG Fretboard Centerpiece */}
                <div className="my-6 flex flex-col items-center justify-center">
                  <FretboardSvg
                    config={config}
                    detected={detected}
                    fingerTool={fingerTool}
                    activeStringIndex={activeStringIndex}
                    onCellClick={handleCellClick}
                    onToggleOpenMute={handleToggleOpenMute}
                    onCreateBarre={handleCreateBarre}
                    onRemoveBarre={handleRemoveBarre}
                    onPluckString={handlePluckString}
                  />
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Click frets to place or remove notes · Click top O / × markers to mute or open · Click tuning letters to pluck individual strings
                  </p>
                </div>

                {/* Audio Preview & Tone Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        guitarAudio.playChord(
                          config.strings,
                          config.customTuningMidi,
                          'down',
                          tone,
                          setActiveStringIndex
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-sky-700 whitespace-nowrap"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                      Strum Down
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        guitarAudio.playChord(
                          config.strings,
                          config.customTuningMidi,
                          'up',
                          tone,
                          setActiveStringIndex
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                      Strum Up
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        guitarAudio.playChord(
                          config.strings,
                          config.customTuningMidi,
                          'arp',
                          tone,
                          setActiveStringIndex
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      Arpeggiate
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor="gm-soundfont-select"
                      className="text-xs font-medium text-slate-500 dark:text-slate-400"
                    >
                      GM SoundFont
                    </label>
                    <select
                      id="gm-soundfont-select"
                      value={tone}
                      onChange={(e) => {
                        const nextTone = e.target.value as GuitarTone;
                        setTone(nextTone);
                        void guitarAudio.preloadSoundfont(nextTone);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      {GM_GUITAR_PRESETS.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                    {sfStatus === 'loading' && (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Loading GM…
                      </span>
                    )}
                    {sfStatus === 'ready' && (
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        FluidR3 GM Ready
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Real-Time Chord Detection & Interval Breakdown */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <ChordTheoryPanel
                  detected={detected}
                  onPluckString={handlePluckString}
                  onSelectAlternative={(altShort) =>
                    commitConfig((prev) => ({
                      ...prev,
                      syncTitleWithDetected: false,
                      title: altShort,
                    }))
                  }
                />
              </div>
            </section>

            {/* Right Control Deck: Chord Lookup / Customize / Quick Export */}
            <aside className="lg:col-span-5 xl:col-span-5 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setRightTab('lookup')}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                    rightTab === 'lookup'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <ListMusic className="h-3.5 w-3.5" />
                  Chord Lookup
                </button>
                <button
                  type="button"
                  onClick={() => setRightTab('customize')}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                    rightTab === 'customize'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5" />
                  Fretboard &amp; Style
                </button>
                <button
                  type="button"
                  onClick={() => setRightTab('export')}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                    rightTab === 'export'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Export / Embed
                </button>
              </div>

              <div className="mt-5">
                {rightTab === 'lookup' && (
                  <LookupSidebar
                    tuningMidi={config.customTuningMidi}
                    onApplyVoicing={handleApplyVoicing}
                  />
                )}
                {rightTab === 'customize' && (
                  <CustomizeSidebar
                    config={config}
                    fingerTool={fingerTool}
                    onSelectFingerTool={setFingerTool}
                    onUpdateConfig={(patch) =>
                      commitConfig((prev) => ({ ...prev, ...patch }))
                    }
                    onSelectTuning={handleSelectTuning}
                    onStepStringTuning={handleStepStringTuning}
                    onRemoveBarre={handleRemoveBarre}
                  />
                )}
                {rightTab === 'export' && (
                  <EmbedExportView config={config} detected={detected} compact />
                )}
              </div>
            </aside>
          </div>
        </main>
      )}

      {activeView === 'learn' && (
        <LearnChordsView
          tone={tone}
          onLoadInStudio={(lessonConfig) => {
            commitConfig(() => lessonConfig);
            setActiveView('studio');
          }}
        />
      )}

      {activeView === 'progression' && (
        <ProgressionSheetView
          slots={progressionSlots}
          currentConfig={config}
          tone={tone}
          onAddCurrentToSheet={handleAddCurrentToSheet}
          onRemoveSlot={(id) =>
            setProgressionSlots((prev) => prev.filter((s) => s.id !== id))
          }
          onMoveSlot={(idx, delta) => {
            setProgressionSlots((prev) => {
              const target = idx + delta;
              if (target < 0 || target >= prev.length) return prev;
              const copy = [...prev];
              [copy[idx], copy[target]] = [copy[target], copy[idx]];
              return copy;
            });
          }}
          onLoadSlotInStudio={(slotConfig) => {
            commitConfig(() => slotConfig);
            setActiveView('studio');
          }}
          onLoadStarterProgression={(newSlots) => setProgressionSlots(newSlots)}
        />
      )}

      {activeView === 'embed' && (
        <EmbedExportView config={config} detected={detected} />
      )}

      {activeView === 'theory' && (
        <TheoryReferenceView
          onOpenLearnChords={() => setActiveView('learn')}
          onOpenStudio={() => setActiveView('studio')}
        />
      )}
    </div>
  );
}
