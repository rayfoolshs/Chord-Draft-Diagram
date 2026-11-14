import React, { useMemo, useState } from 'react';
import { Compass, Search } from 'lucide-react';
import {
  QUALITY_OPTIONS,
  ROOT_OPTIONS,
  findChordVariations,
  getVoicingsForChord,
  searchChordQuery,
} from '../data/chordLibrary';
import { ChordVoicingPreset } from '../types/chord';
import { TUNING_PRESETS } from '../utils/musicTheory';

interface LookupSidebarProps {
  tuningMidi?: number[];
  onApplyVoicing: (
    voicing: ChordVoicingPreset,
    chordShortTitle: string
  ) => void;
}

const MiniVoicingPreview: React.FC<{ voicing: ChordVoicingPreset }> = ({
  voicing,
}) => {
  const fretCount = 4;
  return (
    <svg
      width="46"
      height="54"
      viewBox="0 0 46 54"
      aria-hidden="true"
      className="shrink-0 rounded border border-slate-200 bg-white dark:border-slate-700"
    >
      {voicing.baseFret === 1 ? (
        <rect x="7" y="9" width="32" height="2.5" fill="#0F172A" />
      ) : (
        <text
          x="3"
          y="18"
          fontSize="6"
          fontFamily="monospace"
          fill="#64748B"
          fontWeight="600"
        >
          {voicing.baseFret}
        </text>
      )}
      {[0, 1, 2, 3, 4].map((f) => (
        <line
          key={f}
          x1="8"
          y1={11 + f * 9}
          x2="38"
          y2={11 + f * 9}
          stroke="#CBD5E1"
          strokeWidth="0.8"
        />
      ))}
      {[0, 1, 2, 3, 4, 5].map((s) => (
        <line
          key={s}
          x1={8 + s * 6}
          y1="11"
          x2={8 + s * 6}
          y2="47"
          stroke="#64748B"
          strokeWidth="0.8"
        />
      ))}
      {voicing.frets.map((fret, s) => {
        const cx = 8 + s * 6;
        if (fret === null) {
          return (
            <text
              key={s}
              x={cx}
              y="7"
              textAnchor="middle"
              fontSize="6"
              fill="#94A3B8"
            >
              ×
            </text>
          );
        }
        if (fret === 0) {
          return (
            <circle
              key={s}
              cx={cx}
              cy="5.5"
              r="1.8"
              fill="none"
              stroke="#0F172A"
              strokeWidth="0.9"
            />
          );
        }
        const rel = fret - voicing.baseFret + 1;
        if (rel < 1 || rel > fretCount) return null;
        return (
          <circle
            key={s}
            cx={cx}
            cy={11 + (rel - 0.5) * 9}
            r="2.4"
            fill="#0284C7"
          />
        );
      })}
    </svg>
  );
};

export const LookupSidebar: React.FC<LookupSidebarProps> = ({
  tuningMidi = TUNING_PRESETS[0].midi,
  onApplyVoicing,
}) => {
  const [selectedRoot, setSelectedRoot] = useState<number>(0);
  const [selectedQuality, setSelectedQuality] = useState<string>('major');
  const [searchText, setSearchText] = useState<string>('');
  const [variationsKey, setVariationsKey] = useState<string | null>(null);

  const voicings = useMemo(
    () => getVoicingsForChord(selectedRoot, selectedQuality),
    [selectedRoot, selectedQuality]
  );

  const activeChordKey = `${selectedRoot}:${selectedQuality}:${tuningMidi.join(',')}`;
  const showVariations = variationsKey === activeChordKey;

  const suggestedVariations = useMemo(() => {
    if (!showVariations) return [];
    return findChordVariations(
      selectedRoot,
      selectedQuality,
      tuningMidi,
      voicings,
      8
    );
  }, [showVariations, selectedRoot, selectedQuality, tuningMidi, voicings]);

  const rootObj = ROOT_OPTIONS.find((r) => r.pc === selectedRoot)!;
  const qualityObj = QUALITY_OPTIONS.find((q) => q.id === selectedQuality)!;
  const cleanRootLabel = rootObj.label.split(' / ')[0];
  const fullShortTitle = `${cleanRootLabel}${qualityObj.suffix}`;

  const handleSearchChange = (val: string) => {
    setSearchText(val);
    const parsed = searchChordQuery(val);
    if (parsed) {
      setSelectedRoot(parsed.rootPc);
      setSelectedQuality(parsed.qualityId);
    }
  };

  return (
    <div className="space-y-5">
      {/* Quick Search */}
      <div>
        <label
          htmlFor="chord-lookup-search"
          className="block text-xs font-medium text-slate-600 dark:text-slate-300"
        >
          Quick Chord Search
        </label>
        <div className="relative mt-1.5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="chord-lookup-search"
            type="text"
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Type chord (e.g. Am7, F#m, Cmaj7, G7)"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Root Selector */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Root Note
          </span>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {rootObj.label}
          </span>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {ROOT_OPTIONS.map((root) => {
            const active = selectedRoot === root.pc;
            return (
              <button
                key={root.pc}
                type="button"
                onClick={() => setSelectedRoot(root.pc)}
                className={`rounded-md border px-2 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700'
                }`}
              >
                {root.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quality Selector */}
      <div>
        <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">
          Chord Quality
        </span>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {QUALITY_OPTIONS.map((q) => {
            const active = selectedQuality === q.id;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setSelectedQuality(q.id)}
                className={`flex items-center justify-between rounded-md border px-2.5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'border-sky-600 bg-sky-50 text-sky-900 dark:border-sky-500 dark:bg-sky-950/70 dark:text-sky-200'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700'
                }`}
              >
                <span className="truncate">{q.label}</span>
                <span className="ml-1.5 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                  {q.suffix || 'maj'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voicings List & Find Variations */}
      <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
              Voicings for {fullShortTitle}
            </h3>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {voicings.length} standard shapes
              {showVariations && ` · +${suggestedVariations.length} variations`}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setVariationsKey(showVariations ? null : activeChordKey)
            }
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              showVariations
                ? 'border-sky-600 bg-sky-600 text-white hover:bg-sky-700'
                : 'border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/70 dark:text-sky-300 dark:hover:bg-sky-900/70'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            {showVariations ? 'Hide Variations' : 'Find Variations'}
          </button>
        </div>

        <div className="mt-2.5 space-y-2">
          {voicings.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onApplyVoicing(v, fullShortTitle)}
              className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-2.5 text-left transition-colors hover:border-sky-500 hover:bg-sky-50/40 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-sky-500 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
            >
              <MiniVoicingPreview voicing={v} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {v.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {v.level}
                  <span aria-hidden="true"> · </span>
                  <span className="font-mono tabular-nums">
                    {v.frets.map((f) => (f === null ? 'x' : f)).join(' ')}
                  </span>
                </p>
              </div>
            </button>
          ))}
        </div>

        {showVariations && (
          <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
            <div className="flex items-baseline justify-between">
              <h4 className="font-display text-xs font-semibold text-slate-700 dark:text-slate-200">
                Suggested Fretboard Variations ({fullShortTitle})
              </h4>
              <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                Frets 1–14
              </span>
            </div>

            {suggestedVariations.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                No additional playable variations found within a 4-fret span for this tuning.
              </p>
            ) : (
              <div className="mt-2.5 space-y-2">
                {suggestedVariations.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onApplyVoicing(v, fullShortTitle)}
                    className="flex w-full items-center gap-3 rounded-lg border border-sky-200/80 bg-sky-50/30 p-2.5 text-left transition-colors hover:border-sky-500 hover:bg-sky-50/70 dark:border-sky-900/70 dark:bg-sky-950/30 dark:hover:border-sky-500 dark:hover:bg-sky-950/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                  >
                    <MiniVoicingPreview voicing={v} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {v.label}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {v.level}
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono tabular-nums">
                          {v.frets.map((f) => (f === null ? 'x' : f)).join(' ')}
                        </span>
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
