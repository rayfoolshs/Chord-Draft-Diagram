import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import {
  ChordDiagramConfig,
  DiagramThemeId,
  DotLabelMode,
  FingerTool,
} from '../types/chord';
import { TUNING_PRESETS, getNoteName } from '../utils/musicTheory';
import { DIAGRAM_THEMES } from '../utils/svgGenerator';

interface CustomizeSidebarProps {
  config: ChordDiagramConfig;
  fingerTool: FingerTool;
  onSelectFingerTool: (tool: FingerTool) => void;
  onUpdateConfig: (patch: Partial<ChordDiagramConfig>) => void;
  onSelectTuning: (tuningId: string) => void;
  onStepStringTuning: (stringIndex: number, delta: number) => void;
  onRemoveBarre: (id: string) => void;
}

const ACCENT_SWATCHES = [
  { label: 'Cerulean', color: '#0284C7' },
  { label: 'Charcoal', color: '#0F172A' },
  { label: 'Emerald', color: '#059669' },
  { label: 'Amber', color: '#D97706' },
  { label: 'Crimson', color: '#DC2626' },
  { label: 'Indigo', color: '#4F46E5' },
];

export const CustomizeSidebar: React.FC<CustomizeSidebarProps> = ({
  config,
  fingerTool,
  onSelectFingerTool,
  onUpdateConfig,
  onSelectTuning,
  onStepStringTuning,
  onRemoveBarre,
}) => {
  const fingerTools: { id: FingerTool; label: string }[] = [
    { id: 'auto', label: 'Auto' },
    { id: '1', label: '1' },
    { id: '2', label: '2' },
    { id: '3', label: '3' },
    { id: '4', label: '4' },
    { id: 'T', label: 'T' },
    { id: 'barre', label: 'Barre' },
    { id: 'erase', label: 'Erase' },
  ];

  const dotModes: { id: DotLabelMode; label: string }[] = [
    { id: 'finger', label: 'Fingers' },
    { id: 'note', label: 'Notes' },
    { id: 'interval', label: 'Intervals' },
    { id: 'none', label: 'Plain' },
  ];

  return (
    <div className="space-y-5">
      {/* Placement Tool */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Click Placement Tool
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {fingerTool === 'barre'
              ? 'Drag across strings'
              : fingerTool === 'erase'
                ? 'Click dot to remove'
                : 'Click fret cell'}
          </span>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {fingerTools.map((tool) => {
            const active = fingerTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => onSelectFingerTool(tool.id)}
                className={`rounded-md border px-2 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tool.label}
              </button>
            );
          })}
        </div>

        {config.barres.length > 0 && (
          <div className="mt-2.5 space-y-1.5">
            {config.barres.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <span className="font-mono tabular-nums">
                  Barre Fr {b.fret} · Str {6 - b.fromString}–{6 - b.toString}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveBarre(b.id)}
                  className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                  aria-label="Remove barre"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Title & Subtitle */}
      <div className="border-t border-slate-200 pt-4 space-y-3 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <label
            htmlFor="chord-title-input"
            className="text-xs font-medium text-slate-600 dark:text-slate-300"
          >
            Diagram Title
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.syncTitleWithDetected}
              onChange={(e) =>
                onUpdateConfig({ syncTitleWithDetected: e.target.checked })
              }
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-600 dark:border-slate-600 dark:bg-slate-800"
            />
            Auto-sync detected
          </label>
        </div>
        <input
          id="chord-title-input"
          type="text"
          disabled={config.syncTitleWithDetected}
          value={config.title}
          onChange={(e) => onUpdateConfig({ title: e.target.value })}
          placeholder="Custom title (e.g. Cmaj7)"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 disabled:bg-slate-50 disabled:text-slate-400 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:disabled:bg-slate-800/50 dark:disabled:text-slate-500"
        />
        <div>
          <label
            htmlFor="chord-subtitle-input"
            className="block text-xs font-medium text-slate-600 dark:text-slate-300"
          >
            Subtitle / Lesson Note
          </label>
          <input
            id="chord-subtitle-input"
            type="text"
            value={config.subtitle}
            onChange={(e) => onUpdateConfig({ subtitle: e.target.value })}
            placeholder="Optional (e.g. Open Position · Beginner)"
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Fret Window & Layout */}
      <div className="border-t border-slate-200 pt-4 grid grid-cols-2 gap-3 dark:border-slate-800">
        <div>
          <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            Starting Fret
          </span>
          <div className="mt-1.5 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() =>
                onUpdateConfig({ baseFret: Math.max(1, config.baseFret - 1) })
              }
              aria-label="Decrease starting fret"
              className="rounded p-1 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {config.baseFret}
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateConfig({ baseFret: Math.min(15, config.baseFret + 1) })
              }
              aria-label="Increase starting fret"
              className="rounded p-1 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div>
          <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            Visible Frets
          </span>
          <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {[4, 5, 6].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => onUpdateConfig({ fretCount: cnt })}
                className={`rounded-md py-1 font-mono text-xs font-medium transition-colors ${
                  config.fretCount === cnt
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {cnt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dot Labels */}
      <div className="border-t border-slate-200 pt-4 space-y-3 dark:border-slate-800">
        <div>
          <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            Dot Labels
          </span>
          <div className="mt-1.5 grid grid-cols-4 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {dotModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => onUpdateConfig({ dotLabelMode: mode.id })}
                className={`rounded-md py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  config.dotLabelMode === mode.id
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Orientation
            </span>
            <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {(['vertical', 'horizontal'] as const).map((ori) => (
                <button
                  key={ori}
                  type="button"
                  onClick={() => onUpdateConfig({ orientation: ori })}
                  className={`rounded-md py-1.5 text-xs font-medium capitalize transition-colors ${
                    config.orientation === ori
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {ori === 'vertical' ? 'Vertical' : 'Horiz'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Handedness
            </span>
            <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {(['right', 'left'] as const).map((hand) => (
                <button
                  key={hand}
                  type="button"
                  onClick={() => onUpdateConfig({ handedness: hand })}
                  className={`rounded-md py-1.5 text-xs font-medium capitalize transition-colors ${
                    config.handedness === hand
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {hand}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tuning */}
      <div className="border-t border-slate-200 pt-4 space-y-2.5 dark:border-slate-800">
        <label
          htmlFor="tuning-preset-select"
          className="block text-xs font-medium text-slate-600 dark:text-slate-300"
        >
          Guitar Tuning
        </label>
        <select
          id="tuning-preset-select"
          value={config.tuningId}
          onChange={(e) => onSelectTuning(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          {TUNING_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
          {config.tuningId === 'custom' && (
            <option value="custom">Custom Tuning</option>
          )}
        </select>

        <div className="grid grid-cols-6 gap-1">
          {config.customTuningMidi.map((midi, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center rounded border border-slate-200 bg-slate-50 py-1 dark:border-slate-700 dark:bg-slate-800"
            >
              <button
                type="button"
                onClick={() => onStepStringTuning(idx, 1)}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-1.5"
                aria-label={`Tune string ${6 - idx} up`}
              >
                +
              </button>
              <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">
                {getNoteName(midi)}
              </span>
              <button
                type="button"
                onClick={() => onStepStringTuning(idx, -1)}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-1.5"
                aria-label={`Tune string ${6 - idx} down`}
              >
                −
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Theme & Accent */}
      <div className="border-t border-slate-200 pt-4 space-y-3 dark:border-slate-800">
        <div>
          <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            Diagram Surface Theme
          </span>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {(Object.keys(DIAGRAM_THEMES) as DiagramThemeId[]).map((tId) => {
              const t = DIAGRAM_THEMES[tId];
              const active = config.theme === tId;
              return (
                <button
                  key={tId}
                  type="button"
                  onClick={() => onUpdateConfig({ theme: tId })}
                  className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'border-sky-600 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/70 dark:text-sky-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-300 dark:border-slate-600"
                    style={{ backgroundColor: t.bg }}
                  />
                  <span className="truncate">{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">
            Dot Accent Color
          </span>
          <div className="mt-2 flex items-center gap-2">
            {ACCENT_SWATCHES.map((swatch) => {
              const active = config.accentColor === swatch.color;
              return (
                <button
                  key={swatch.color}
                  type="button"
                  onClick={() => onUpdateConfig({ accentColor: swatch.color })}
                  aria-label={`Set dot color to ${swatch.label}`}
                  title={swatch.label}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    active
                      ? 'scale-110 border-slate-900 ring-2 ring-sky-600/30 dark:border-white'
                      : 'border-white shadow-xs hover:scale-105 dark:border-slate-700'
                  }`}
                  style={{ backgroundColor: swatch.color }}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showChordTitle}
              onChange={(e) =>
                onUpdateConfig({ showChordTitle: e.target.checked })
              }
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-600 dark:border-slate-600 dark:bg-slate-800"
            />
            Show chord title header
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showTuningLabels}
              onChange={(e) =>
                onUpdateConfig({ showTuningLabels: e.target.checked })
              }
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-600 dark:border-slate-600 dark:bg-slate-800"
            />
            Show string tuning labels
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showIntervalsFooter}
              onChange={(e) =>
                onUpdateConfig({ showIntervalsFooter: e.target.checked })
              }
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-600 dark:border-slate-600 dark:bg-slate-800"
            />
            Show note summary footer
          </label>
        </div>
      </div>
    </div>
  );
};
