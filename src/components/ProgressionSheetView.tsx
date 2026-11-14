import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Download,
  FileImage,
  Play,
  Plus,
  Square,
  Trash2,
} from 'lucide-react';
import { ChordDiagramConfig, GuitarTone, SavedChordSlot } from '../types/chord';
import { TUNING_PRESETS, detectChord } from '../utils/musicTheory';
import { guitarAudio } from '../utils/audioEngine';
import {
  generateChordSvgString,
  svgToPngBlob,
  triggerDownload,
} from '../utils/svgGenerator';

interface ProgressionSheetViewProps {
  slots: SavedChordSlot[];
  currentConfig: ChordDiagramConfig;
  tone: GuitarTone;
  onAddCurrentToSheet: () => void;
  onRemoveSlot: (id: string) => void;
  onMoveSlot: (index: number, delta: -1 | 1) => void;
  onLoadSlotInStudio: (config: ChordDiagramConfig) => void;
  onLoadStarterProgression: (slots: SavedChordSlot[]) => void;
}

const STANDARD_MIDI = TUNING_PRESETS[0].midi;

function makeQuickSlot(
  id: string,
  title: string,
  frets: (number | null)[],
  fingers: ('' | '1' | '2' | '3' | '4' | 'T')[],
  barres: { fret: number; fromString: number; toString: number; finger: '1' }[] = []
): SavedChordSlot {
  const positive = frets.filter((f): f is number => f !== null && f > 0);
  const maxF = positive.length ? Math.max(...positive) : 1;
  const minF = positive.length ? Math.min(...positive) : 1;
  const baseFret = maxF <= 4 ? 1 : minF;

  const config: ChordDiagramConfig = {
    title,
    subtitle: '',
    syncTitleWithDetected: true,
    strings: frets.map((f, idx) => ({
      fret: f,
      muted: f === null,
      finger: fingers[idx] || '',
    })),
    barres: barres.map((b, i) => ({ id: `${id}-b-${i}`, ...b })),
    baseFret,
    fretCount: 4,
    tuningId: 'standard',
    customTuningMidi: STANDARD_MIDI,
    handedness: 'right',
    orientation: 'vertical',
    dotLabelMode: 'finger',
    showTuningLabels: true,
    showChordTitle: true,
    showIntervalsFooter: false,
    theme: 'classic',
    accentColor: '#0284C7',
  };
  return {
    id,
    config,
    detectedShortName: title,
  };
}

const STARTER_PROGRESSIONS: {
  id: string;
  label: string;
  description: string;
  slots: () => SavedChordSlot[];
}[] = [
  {
    id: 'pop-axis',
    label: 'I – V – vi – IV in G',
    description: 'G · D · Em · C',
    slots: () => [
      makeQuickSlot('pop-1', 'G', [3, 2, 0, 0, 0, 3], ['2', '1', '', '', '', '3']),
      makeQuickSlot('pop-2', 'D', [null, null, 0, 2, 3, 2], ['', '', '', '1', '3', '2']),
      makeQuickSlot('pop-3', 'Em', [0, 2, 2, 0, 0, 0], ['', '2', '3', '', '', '']),
      makeQuickSlot('pop-4', 'C', [null, 3, 2, 0, 1, 0], ['', '3', '2', '', '1', '']),
    ],
  },
  {
    id: 'fifties',
    label: 'I – vi – IV – V in C',
    description: 'C · Am · F · G7',
    slots: () => [
      makeQuickSlot('50s-1', 'C', [null, 3, 2, 0, 1, 0], ['', '3', '2', '', '1', '']),
      makeQuickSlot('50s-2', 'Am', [null, 0, 2, 2, 1, 0], ['', '', '2', '3', '1', '']),
      makeQuickSlot(
        '50s-3',
        'F',
        [null, null, 3, 2, 1, 1],
        ['', '', '3', '2', '1', '1'],
        [{ fret: 1, fromString: 4, toString: 5, finger: '1' }]
      ),
      makeQuickSlot('50s-4', 'G7', [3, 2, 0, 0, 0, 1], ['3', '2', '', '', '', '1']),
    ],
  },
  {
    id: 'blues-a',
    label: 'Blues Turnaround in A',
    description: 'A7 · D7 · A7 · E7',
    slots: () => [
      makeQuickSlot('bl-1', 'A7', [null, 0, 2, 0, 2, 0], ['', '', '1', '', '2', '']),
      makeQuickSlot('bl-2', 'D7', [null, null, 0, 2, 1, 2], ['', '', '', '2', '1', '3']),
      makeQuickSlot('bl-3', 'A7', [null, 0, 2, 0, 2, 0], ['', '', '1', '', '2', '']),
      makeQuickSlot('bl-4', 'E7', [0, 2, 0, 1, 0, 0], ['', '2', '', '1', '', '']),
    ],
  },
];

export const ProgressionSheetView: React.FC<ProgressionSheetViewProps> = ({
  slots,
  tone,
  onAddCurrentToSheet,
  onRemoveSlot,
  onMoveSlot,
  onLoadSlotInStudio,
  onLoadStarterProgression,
}) => {
  const [bpm, setBpm] = useState<number>(84);
  const [sheetTitle, setSheetTitle] = useState<string>('Lesson Chord Sheet');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activePlayIdx, setActivePlayIdx] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const stopPlayback = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    guitarAudio.stopAll();
    setIsPlaying(false);
    setActivePlayIdx(null);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  const togglePlayProgression = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    if (slots.length === 0) return;

    setIsPlaying(true);
    let idx = 0;
    const playStep = () => {
      const slot = slots[idx];
      if (!slot) return;
      setActivePlayIdx(idx);
      guitarAudio.playChord(
        slot.config.strings,
        slot.config.customTuningMidi,
        'down',
        tone
      );
      idx = (idx + 1) % slots.length;
    };

    playStep();
    const intervalMs = Math.round((60 / bpm) * 2 * 1000);
    timerRef.current = window.setInterval(playStep, intervalMs);
  };

  const buildSheetSvg = (): string => {
    const cols = Math.min(4, Math.max(1, slots.length));
    const rows = Math.ceil(slots.length / cols);
    const cellW = 240;
    const cellH = 270;
    const padX = 36;
    const headerH = 72;
    const totalW = padX * 2 + cols * cellW;
    const totalH = headerH + rows * cellH + 28;

    const cardSvgs = slots.map((slot, idx) => {
      const detected = detectChord(
        slot.config.strings,
        slot.config.customTuningMidi
      );
      const innerSvg = generateChordSvgString(slot.config, detected, {
        width: 220,
      });
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = padX + col * cellW + 10;
      const y = headerH + row * cellH;
      return innerSvg.replace('<svg ', `<svg x="${x}" y="${y}" `);
    });

    const escapedTitle = sheetTitle
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
      <rect width="${totalW}" height="${totalH}" fill="#FFFFFF" />
      <text x="${padX}" y="42" font-family="'Outfit', system-ui, sans-serif" font-size="24" font-weight="700" fill="#0F172A">${escapedTitle}</text>
      <line x1="${padX}" y1="56" x2="${totalW - padX}" y2="56" stroke="#E2E8F0" stroke-width="1.5" />
      ${cardSvgs.join('\n')}
    </svg>`;
  };

  const handleDownloadSheetSvg = () => {
    if (slots.length === 0) return;
    const svg = buildSheetSvg();
    triggerDownload(
      new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
      'chord-progression-sheet.svg'
    );
  };

  const handleDownloadSheetPng = async () => {
    if (slots.length === 0) return;
    const svg = buildSheetSvg();
    const png = await svgToPngBlob(svg, 2);
    triggerDownload(png, 'chord-progression-sheet.png');
  };

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-sky-700 dark:text-sky-400">
            Classroom Worksheets &amp; Song Charts
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Chord Progression Sheet Builder
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Assemble multi-chord sequences for lessons or song charts, audition progressions at any tempo, and export the full sheet as a print-ready PNG or SVG.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onAddCurrentToSheet}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Add Studio Chord
          </button>
          <button
            type="button"
            onClick={handleDownloadSheetPng}
            disabled={slots.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 whitespace-nowrap"
          >
            <FileImage className="h-4 w-4" />
            Export Sheet PNG
          </button>
          <button
            type="button"
            onClick={handleDownloadSheetSvg}
            disabled={slots.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 whitespace-nowrap"
          >
            <Download className="h-4 w-4" />
            Export Sheet SVG
          </button>
        </div>
      </div>

      {/* Playback & Starter Controls */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="sheet-title-input"
              className="text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              Sheet Title
            </label>
            <input
              id="sheet-title-input"
              type="text"
              value={sheetTitle}
              onChange={(e) => setSheetTitle(e.target.value)}
              className="w-52 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
            />
          </div>

          <div className="flex items-center gap-3 border-l border-slate-200 pl-4 dark:border-slate-700">
            <button
              type="button"
              onClick={togglePlayProgression}
              disabled={slots.length === 0}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                isPlaying
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-sky-50 text-sky-800 hover:bg-sky-100 dark:bg-sky-950/70 dark:text-sky-300 dark:hover:bg-sky-900/70'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="h-3.5 w-3.5" />
                  Stop Playback
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  Play Progression
                </>
              )}
            </button>

            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span>Tempo:</span>
              <input
                type="range"
                min={50}
                max={140}
                value={bpm}
                onChange={(e) => {
                  setBpm(Number(e.target.value));
                  if (isPlaying) stopPlayback();
                }}
                className="w-24 accent-sky-600"
              />
              <span className="font-mono font-semibold tabular-nums text-slate-800 dark:text-slate-200 w-14">
                {bpm} BPM
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Starter Templates:
          </span>
          {STARTER_PROGRESSIONS.map((prog) => (
            <button
              key={prog.id}
              type="button"
              onClick={() => {
                stopPlayback();
                onLoadStarterProgression(prog.slots());
              }}
              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-sky-500 hover:bg-sky-50 hover:text-sky-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-700 whitespace-nowrap"
            >
              {prog.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progression Grid */}
      {slots.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
            Your progression sheet is empty
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Click &ldquo;Add Studio Chord&rdquo; above or load one of the starter progressions to build your chart.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {slots.map((slot, idx) => {
            const detected = detectChord(
              slot.config.strings,
              slot.config.customTuningMidi
            );
            const svg = generateChordSvgString(slot.config, detected, {
              width: 240,
            });
            const isActive = activePlayIdx === idx;
            return (
              <div
                key={slot.id}
                className={`flex flex-col rounded-xl border bg-white p-4 transition-colors dark:bg-slate-900 ${
                  isActive
                    ? 'border-sky-600 ring-2 ring-sky-600/20 dark:border-sky-400'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                  <span className="font-mono text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">
                    Bar {idx + 1} · {detected.shortName}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => onMoveSlot(idx, -1)}
                      aria-label="Move chord left"
                      className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === slots.length - 1}
                      onClick={() => onMoveSlot(idx, 1)}
                      aria-label="Move chord right"
                      className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveSlot(slot.id)}
                      aria-label="Remove chord from sheet"
                      className="rounded p-1 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/60 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div
                  className="my-3 flex justify-center cursor-pointer"
                  onClick={() =>
                    guitarAudio.playChord(
                      slot.config.strings,
                      slot.config.customTuningMidi,
                      'down',
                      tone
                    )
                  }
                  title="Click to strum chord"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() =>
                      guitarAudio.playChord(
                        slot.config.strings,
                        slot.config.customTuningMidi,
                        'down',
                        tone
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-sky-700 dark:text-slate-300 dark:hover:text-sky-400"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Audition
                  </button>
                  <button
                    type="button"
                    onClick={() => onLoadSlotInStudio(slot.config)}
                    className="text-xs font-medium text-sky-700 hover:text-sky-900 hover:underline dark:text-sky-400 dark:hover:text-sky-300"
                  >
                    Edit in Studio
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
