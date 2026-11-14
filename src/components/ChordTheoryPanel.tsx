import React from 'react';
import { Volume2 } from 'lucide-react';
import { DetectedChord } from '../types/chord';

interface ChordTheoryPanelProps {
  detected: DetectedChord;
  onPluckString: (stringIndex: number) => void;
  onSelectAlternative: (shortName: string) => void;
}

export const ChordTheoryPanel: React.FC<ChordTheoryPanelProps> = ({
  detected,
  onPluckString,
  onSelectAlternative,
}) => {
  return (
    <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Detected Harmonic Analysis
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {detected.name}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
          <span>Formula: {detected.formula}</span>
          {detected.isSlash && (
            <>
              <span aria-hidden="true">·</span>
              <span>Bass: {detected.bassName}</span>
            </>
          )}
        </div>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {detected.description}
      </p>

      {detected.alternatives.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Enharmonic / Alt:</span>
          {detected.alternatives.map((alt, idx) => (
            <React.Fragment key={alt.shortName}>
              {idx > 0 && <span aria-hidden="true">·</span>}
              <button
                type="button"
                onClick={() => onSelectAlternative(alt.shortName)}
                className="font-medium text-sky-700 hover:text-sky-900 hover:underline dark:text-sky-400 dark:hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded"
              >
                {alt.shortName}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* String-by-String Pitch & Interval Breakdown Table */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="py-2 pr-3 font-medium">String</th>
              <th className="px-3 py-2 font-medium">Fret</th>
              <th className="px-3 py-2 font-medium">Pitch</th>
              <th className="px-3 py-2 font-medium">Interval</th>
              <th className="pl-3 py-2 text-right font-medium">Audition</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono tabular-nums dark:divide-slate-800/80">
            {detected.stringNotes.map((st) => (
              <tr
                key={st.stringIndex}
                className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/60"
              >
                <td className="py-2 pr-3 text-slate-700 dark:text-slate-300">
                  {6 - st.stringIndex} ({st.openNoteName})
                </td>
                <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                  {st.muted ? '×' : st.fret === 0 ? '0 (Open)' : st.fret}
                </td>
                <td
                  className={`px-3 py-2 font-medium ${
                    st.muted
                      ? 'text-slate-400 dark:text-slate-600'
                      : st.isRoot
                        ? 'text-sky-700 dark:text-sky-400'
                        : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {st.noteWithOctave}
                </td>
                <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                  {st.isRoot ? 'R (Root)' : st.interval}
                </td>
                <td className="pl-3 py-2 text-right">
                  <button
                    type="button"
                    disabled={st.muted}
                    onClick={() => onPluckString(st.stringIndex)}
                    aria-label={`Pluck string ${6 - st.stringIndex}`}
                    className={`inline-flex items-center gap-1 rounded px-2 py-1 font-sans text-xs font-medium transition-colors whitespace-nowrap ${
                      st.muted
                        ? 'cursor-not-allowed text-slate-300 dark:text-slate-700'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-sky-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400'
                    }`}
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    Pluck
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
