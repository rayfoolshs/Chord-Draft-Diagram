import React from 'react';
import { ArrowRight } from 'lucide-react';

interface TheoryReferenceViewProps {
  onOpenLearnChords: () => void;
  onOpenStudio: () => void;
}

const CHORD_FORMULAS = [
  {
    name: 'Major Triad',
    symbol: 'C',
    formula: '1 · 3 · 5',
    example: 'C · E · G',
    character: 'Stable, bright, resolved foundation triad.',
  },
  {
    name: 'Minor Triad',
    symbol: 'Cm',
    formula: '1 · ♭3 · 5',
    example: 'C · E♭ · G',
    character: 'Lowered third gives a reflective, darker timbre.',
  },
  {
    name: 'Dominant 7th',
    symbol: 'C7',
    formula: '1 · 3 · 5 · ♭7',
    example: 'C · E · G · B♭',
    character: 'Tritone between 3 and ♭7 drives harmonic resolution.',
  },
  {
    name: 'Major 7th',
    symbol: 'Cmaj7',
    formula: '1 · 3 · 5 · 7',
    example: 'C · E · G · B',
    character: 'Warm, lyrical jazz and acoustic tonic color.',
  },
  {
    name: 'Minor 7th',
    symbol: 'Cm7',
    formula: '1 · ♭3 · 5 · ♭7',
    example: 'C · E♭ · G · B♭',
    character: 'Smooth minor seventh common in soul, folk, and ii–V–I.',
  },
  {
    name: 'Suspended 4th',
    symbol: 'Csus4',
    formula: '1 · 4 · 5',
    example: 'C · F · G',
    character: 'Omits the third in favor of the fourth; seeks resolution.',
  },
  {
    name: 'Suspended 2nd',
    symbol: 'Csus2',
    formula: '1 · 2 · 5',
    example: 'C · D · G',
    character: 'Open, modern ringing voicing with no major/minor third.',
  },
  {
    name: 'Added 9th',
    symbol: 'Cadd9',
    formula: '1 · 3 · 5 · 9',
    example: 'C · E · G · D',
    character: 'Major triad enriched by the ninth without a seventh.',
  },
  {
    name: 'Half-Diminished',
    symbol: 'Cm7♭5',
    formula: '1 · ♭3 · ♭5 · ♭7',
    example: 'C · E♭ · G♭ · B♭',
    character: 'Leading ii°7 chord in minor-key progressions.',
  },
];

export const TheoryReferenceView: React.FC<TheoryReferenceViewProps> = ({
  onOpenLearnChords,
  onOpenStudio,
}) => {
  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8 space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-sky-700 dark:text-sky-400">
            Music Educator &amp; Student Reference
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Reading Guitar Chord Diagrams &amp; Harmony
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            A concise visual primer for decoding fretboard notation, fretting-hand finger numbers, barre symbols, and the interval formulas behind guitar chord voicings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenLearnChords}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 whitespace-nowrap"
          >
            Start Learn Chords
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onOpenStudio}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
          >
            Diagram Studio
          </button>
        </div>
      </div>

      {/* Section 1: Anatomy of a Diagram */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2.5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
            01. Strings, Nut &amp; Frets
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            In standard vertical diagrams, the six vertical lines represent strings from{' '}
            <strong className="font-medium text-slate-800 dark:text-slate-100">
              6th (Low E)
            </strong>{' '}
            on the left to{' '}
            <strong className="font-medium text-slate-800 dark:text-slate-100">
              1st (High E)
            </strong>{' '}
            on the right. A thick top bar marks the nut (open position); higher voicings display a fret marker such as{' '}
            <span className="font-mono text-slate-800 dark:text-slate-200">3fr</span> or{' '}
            <span className="font-mono text-slate-800 dark:text-slate-200">5fr</span>.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2.5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
            02. Open (O) &amp; Muted (×)
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Symbols above the nut tell your strumming hand which unfretted strings to play. An open circle{' '}
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              O
            </span>{' '}
            means the string rings open; an{' '}
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              ×
            </span>{' '}
            means keep that string silent so unwanted bass notes do not muddy the chord root.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2.5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
            03. Finger Numbers &amp; Barres
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Numbers inside dots map your fretting hand:{' '}
            <span className="font-mono text-slate-800 dark:text-slate-200">1</span> Index,{' '}
            <span className="font-mono text-slate-800 dark:text-slate-200">2</span> Middle,{' '}
            <span className="font-mono text-slate-800 dark:text-slate-200">3</span> Ring,{' '}
            <span className="font-mono text-slate-800 dark:text-slate-200">4</span> Pinky, and{' '}
            <span className="font-mono text-slate-800 dark:text-slate-200">T</span> Thumb. A rounded bar spanning multiple strings indicates a{' '}
            <strong className="font-medium text-slate-800 dark:text-slate-100">
              barre
            </strong>{' '}
            pressed flat by one finger.
          </p>
        </div>
      </div>

      {/* Section 2: Chord Formulas Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-100">
            Common Chord Interval Formulas (Root = C)
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Switch Dot Labels to &ldquo;Intervals&rdquo; in the Diagram Studio to see these exact harmonic roles directly on the fretboard.
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-2.5 pr-4 font-medium">Chord Quality</th>
                <th className="px-4 py-2.5 font-medium">Symbol</th>
                <th className="px-4 py-2.5 font-medium">Scale Formula</th>
                <th className="px-4 py-2.5 font-medium">Notes in C</th>
                <th className="pl-4 py-2.5 font-medium">Harmonic Character</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {CHORD_FORMULAS.map((row) => (
                <tr
                  key={row.symbol}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50"
                >
                  <td className="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-sky-700 dark:text-sky-400 whitespace-nowrap">
                    {row.symbol}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {row.formula}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {row.example}
                  </td>
                  <td className="pl-4 py-3 text-slate-600 dark:text-slate-300">
                    {row.character}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
