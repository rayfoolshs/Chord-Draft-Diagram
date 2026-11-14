import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  XCircle,
} from 'lucide-react';
import {
  ChordDiagramConfig,
  DotLabelMode,
  FingerLabel,
  GuitarTone,
} from '../types/chord';
import { TUNING_PRESETS, detectChord } from '../utils/musicTheory';
import { guitarAudio } from '../utils/audioEngine';
import { FretboardSvg } from './FretboardSvg';

interface BeginnerChordLesson {
  id: string;
  shortName: string;
  fullName: string;
  difficulty: 'First Week' | 'Core Open' | 'Bridge Shape';
  frets: (number | null)[];
  fingers: FingerLabel[];
  barres?: {
    fret: number;
    fromString: number;
    toString: number;
    finger: FingerLabel;
  }[];
  summary: string;
  fingerSteps: { finger: string; placement: string; role: string }[];
  openMutedNote: string;
  techniqueTip: string;
}

const BEGINNER_LESSONS: BeginnerChordLesson[] = [
  {
    id: 'em',
    shortName: 'Em',
    fullName: 'E Minor',
    difficulty: 'First Week',
    frets: [0, 2, 2, 0, 0, 0],
    fingers: ['', '2', '3', '', '', ''],
    summary:
      'The most accessible two-finger open chord on guitar. All six strings ring together for a full, resonant minor sound.',
    fingerSteps: [
      {
        finger: '2 (Middle)',
        placement: '5th string (A), 2nd fret',
        role: 'Perfect 5th (B)',
      },
      {
        finger: '3 (Ring)',
        placement: '4th string (D), 2nd fret',
        role: 'Root octave (E)',
      },
    ],
    openMutedNote: 'Strum all 6 strings. Strings 6, 3, 2, and 1 ring open.',
    techniqueTip:
      'Keep your middle and ring fingers tucked right behind the 2nd fret wire and arch your knuckles so the open 3rd string (G) rings clearly without buzzing.',
  },
  {
    id: 'am',
    shortName: 'Am',
    fullName: 'A Minor',
    difficulty: 'First Week',
    frets: [null, 0, 2, 2, 1, 0],
    fingers: ['', '', '2', '3', '1', ''],
    summary:
      'Shares the exact finger geometry of E Major shifted over by one string set, making it ideal for practicing clean string transitions.',
    fingerSteps: [
      {
        finger: '1 (Index)',
        placement: '2nd string (B), 1st fret',
        role: 'Minor 3rd (C)',
      },
      {
        finger: '2 (Middle)',
        placement: '4th string (D), 2nd fret',
        role: 'Root octave (A)',
      },
      {
        finger: '3 (Ring)',
        placement: '3rd string (G), 2nd fret',
        role: 'Perfect 5th (E)',
      },
    ],
    openMutedNote:
      'Mute the 6th string (Low E); strum from the open 5th string (A) down.',
    techniqueTip:
      'Lightly rest the tip of your thumb over the top edge of the neck—or aim your pick downward starting from the 5th string—to keep the 6th string silent.',
  },
  {
    id: 'c',
    shortName: 'C',
    fullName: 'C Major',
    difficulty: 'Core Open',
    frets: [null, 3, 2, 0, 1, 0],
    fingers: ['', '3', '2', '', '1', ''],
    summary:
      'A foundational three-fret diagonal stretch. Mastering C Major builds finger independence and clean fingertip arching.',
    fingerSteps: [
      {
        finger: '1 (Index)',
        placement: '2nd string (B), 1st fret',
        role: 'Root octave (C)',
      },
      {
        finger: '2 (Middle)',
        placement: '4th string (D), 2nd fret',
        role: 'Major 3rd (E)',
      },
      {
        finger: '3 (Ring)',
        placement: '5th string (A), 3rd fret',
        role: 'Root bass (C)',
      },
    ],
    openMutedNote:
      'Mute the 6th string (Low E); strings 3 (G) and 1 (High E) ring open.',
    techniqueTip:
      'If your 1st string (High E) sounds muted, rotate your wrist slightly forward so your index finger meets the 2nd string straight on its fingertip pad.',
  },
  {
    id: 'g',
    shortName: 'G',
    fullName: 'G Major',
    difficulty: 'Core Open',
    frets: [3, 2, 0, 0, 0, 3],
    fingers: ['2', '1', '', '', '', '3'],
    summary:
      'Spanning all six strings from Low G to High G, this classic three-finger voicing anchors countless folk and acoustic songs.',
    fingerSteps: [
      {
        finger: '1 (Index)',
        placement: '5th string (A), 2nd fret',
        role: 'Major 3rd (B)',
      },
      {
        finger: '2 (Middle)',
        placement: '6th string (E), 3rd fret',
        role: 'Root bass (G)',
      },
      {
        finger: '3 (Ring)',
        placement: '1st string (E), 3rd fret',
        role: 'Root treble (G)',
      },
    ],
    openMutedNote:
      'All 6 strings sound; strings 4 (D), 3 (G), and 2 (B) remain open.',
    techniqueTip:
      'Place your middle finger on the 6th string first so your hand naturally reaches down to the 1st string without collapsing the middle open strings.',
  },
  {
    id: 'd',
    shortName: 'D',
    fullName: 'D Major',
    difficulty: 'Core Open',
    frets: [null, null, 0, 2, 3, 2],
    fingers: ['', '', '', '1', '3', '2'],
    summary:
      'A compact triangular shape on the top four strings that trains precise right-hand strumming control.',
    fingerSteps: [
      {
        finger: '1 (Index)',
        placement: '3rd string (G), 2nd fret',
        role: 'Perfect 5th (A)',
      },
      {
        finger: '2 (Middle)',
        placement: '1st string (E), 2nd fret',
        role: 'Major 3rd (F♯)',
      },
      {
        finger: '3 (Ring)',
        placement: '2nd string (B), 3rd fret',
        role: 'Root octave (D)',
      },
    ],
    openMutedNote:
      'Mute both 6th and 5th strings; strum from the open 4th string (D).',
    techniqueTip:
      'Watch out for your ring finger (3) leaning back and damping the 1st string—keep that fingertip vertical so the F♯ on the top string rings bright.',
  },
  {
    id: 'e',
    shortName: 'E',
    fullName: 'E Major',
    difficulty: 'First Week',
    frets: [0, 2, 2, 1, 0, 0],
    fingers: ['', '2', '3', '1', '', ''],
    summary:
      'Bright, full six-string major triad built by adding the index finger on the 3rd string to your E Minor shape.',
    fingerSteps: [
      {
        finger: '1 (Index)',
        placement: '3rd string (G), 1st fret',
        role: 'Major 3rd (G♯)',
      },
      {
        finger: '2 (Middle)',
        placement: '5th string (A), 2nd fret',
        role: 'Perfect 5th (B)',
      },
      {
        finger: '3 (Ring)',
        placement: '4th string (D), 2nd fret',
        role: 'Root octave (E)',
      },
    ],
    openMutedNote: 'All 6 strings sound; strings 6, 2, and 1 are open.',
    techniqueTip:
      'Practice switching between Em and E by lifting and lowering only your index finger while fingers 2 and 3 stay anchored.',
  },
  {
    id: 'a',
    shortName: 'A',
    fullName: 'A Major',
    difficulty: 'Core Open',
    frets: [null, 0, 2, 2, 2, 0],
    fingers: ['', '', '1', '2', '3', ''],
    summary:
      'Three fingers stacked neatly inside the 2nd fret. Teaches compact finger alignment without crowding adjacent fret wires.',
    fingerSteps: [
      {
        finger: '1 (Index)',
        placement: '4th string (D), 2nd fret',
        role: 'Perfect 5th (E)',
      },
      {
        finger: '2 (Middle)',
        placement: '3rd string (G), 2nd fret',
        role: 'Root octave (A)',
      },
      {
        finger: '3 (Ring)',
        placement: '2nd string (B), 2nd fret',
        role: 'Major 3rd (C♯)',
      },
    ],
    openMutedNote:
      'Mute the 6th string (Low E); strings 5 (A) and 1 (High E) ring open.',
    techniqueTip:
      'Slightly angle your fingers diagonally so all three fingertips fit comfortably inside the 2nd fret without touching the open 1st string.',
  },
  {
    id: 'f-easy',
    shortName: 'F',
    fullName: 'F Major (4-String)',
    difficulty: 'Bridge Shape',
    frets: [null, null, 3, 2, 1, 1],
    fingers: ['', '', '3', '2', '1', '1'],
    barres: [{ fret: 1, fromString: 4, toString: 5, finger: '1' }],
    summary:
      'The ideal stepping stone toward full barre chords. Uses a small two-string index barre on the top two strings.',
    fingerSteps: [
      {
        finger: '1 (Index Barre)',
        placement: '2nd & 1st strings (B & E), 1st fret',
        role: '5th (C) & Root (F)',
      },
      {
        finger: '2 (Middle)',
        placement: '3rd string (G), 2nd fret',
        role: 'Major 3rd (A)',
      },
      {
        finger: '3 (Ring)',
        placement: '4th string (D), 3rd fret',
        role: 'Root bass (F)',
      },
    ],
    openMutedNote:
      'Mute the 6th and 5th strings; strum the top 4 strings only.',
    techniqueTip:
      'Roll your index finger slightly onto its bony thumb-side edge to press strings 1 and 2 cleanly with less grip force.',
  },
];

const STANDARD_MIDI = TUNING_PRESETS[0].midi;

function buildLessonConfig(
  lesson: BeginnerChordLesson,
  dotLabelMode: DotLabelMode
): ChordDiagramConfig {
  return {
    title: lesson.shortName,
    subtitle: lesson.fullName,
    syncTitleWithDetected: false,
    strings: lesson.frets.map((fret, idx) => ({
      fret,
      muted: fret === null,
      finger: lesson.fingers[idx] || '',
    })),
    barres: (lesson.barres || []).map((b, idx) => ({
      id: `lesson-barre-${lesson.id}-${idx}`,
      ...b,
    })),
    baseFret: 1,
    fretCount: 4,
    tuningId: 'standard',
    customTuningMidi: STANDARD_MIDI,
    handedness: 'right',
    orientation: 'vertical',
    dotLabelMode,
    showTuningLabels: true,
    showChordTitle: true,
    showIntervalsFooter: false,
    theme: 'classic',
    accentColor: '#0284C7',
  };
}

function buildEmptyPracticeConfig(lesson: BeginnerChordLesson): ChordDiagramConfig {
  return {
    title: `Form ${lesson.shortName}`,
    subtitle: 'Practice Exercise',
    syncTitleWithDetected: false,
    strings: Array.from({ length: 6 }, () => ({
      fret: 0,
      muted: false,
      finger: '',
    })),
    barres: [],
    baseFret: 1,
    fretCount: 4,
    tuningId: 'standard',
    customTuningMidi: STANDARD_MIDI,
    handedness: 'right',
    orientation: 'vertical',
    dotLabelMode: 'note',
    showTuningLabels: true,
    showChordTitle: true,
    showIntervalsFooter: false,
    theme: 'classic',
    accentColor: '#0284C7',
  };
}

interface CheckFeedback {
  status: 'exact' | 'harmonic' | 'mismatch';
  headline: string;
  summary: string;
  stringChecks: {
    stringNumber: number;
    openName: string;
    expectedLabel: string;
    actualLabel: string;
    isMatch: boolean;
    note: string;
  }[];
}

interface LearnChordsViewProps {
  tone: GuitarTone;
  onLoadInStudio: (config: ChordDiagramConfig) => void;
}

export const LearnChordsView: React.FC<LearnChordsViewProps> = ({
  tone,
  onLoadInStudio,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [mode, setMode] = useState<'guide' | 'practice'>('guide');
  const [guideDotMode, setGuideDotMode] = useState<DotLabelMode>('finger');
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [activeStringIndex, setActiveStringIndex] = useState<number | null>(
    null
  );

  const lesson = BEGINNER_LESSONS[selectedIdx];

  const [practiceConfig, setPracticeConfig] = useState<ChordDiagramConfig>(() =>
    buildEmptyPracticeConfig(BEGINNER_LESSONS[0])
  );
  const [feedback, setFeedback] = useState<CheckFeedback | null>(null);
  const [hintText, setHintText] = useState<string | null>(null);

  const referenceConfig = useMemo(
    () => buildLessonConfig(lesson, guideDotMode),
    [lesson, guideDotMode]
  );

  const referenceDetected = useMemo(
    () => detectChord(referenceConfig.strings, STANDARD_MIDI),
    [referenceConfig]
  );

  const practiceDetected = useMemo(
    () => detectChord(practiceConfig.strings, STANDARD_MIDI),
    [practiceConfig]
  );

  const selectLesson = (idx: number) => {
    setSelectedIdx(idx);
    setPracticeConfig(buildEmptyPracticeConfig(BEGINNER_LESSONS[idx]));
    setFeedback(null);
    setHintText(null);
  };

  const handlePracticeCellClick = (stringIndex: number, absFret: number) => {
    setFeedback(null);
    setHintText(null);
    setPracticeConfig((prev) => {
      const nextStrings = prev.strings.map((s) => ({ ...s }));
      const curr = nextStrings[stringIndex];
      if (!curr.muted && curr.fret === absFret) {
        nextStrings[stringIndex] = { fret: 0, muted: false, finger: '' };
      } else {
        nextStrings[stringIndex] = { fret: absFret, muted: false, finger: '' };
        guitarAudio.pluckMidi(STANDARD_MIDI[stringIndex] + absFret, tone);
      }
      return { ...prev, strings: nextStrings };
    });
  };

  const handlePracticeToggleOpenMute = (stringIndex: number) => {
    setFeedback(null);
    setHintText(null);
    setPracticeConfig((prev) => {
      const nextStrings = prev.strings.map((s) => ({ ...s }));
      const curr = nextStrings[stringIndex];
      if (curr.muted || curr.fret === null) {
        nextStrings[stringIndex] = { fret: 0, muted: false, finger: '' };
        guitarAudio.pluckMidi(STANDARD_MIDI[stringIndex], tone);
      } else {
        nextStrings[stringIndex] = { fret: null, muted: true, finger: '' };
      }
      return { ...prev, strings: nextStrings };
    });
  };

  const formatFretValue = (fret: number | null, muted: boolean): string => {
    if (muted || fret === null) return 'Muted (×)';
    if (fret === 0) return 'Open (0)';
    return `Fret ${fret}`;
  };

  const evaluateAttempt = () => {
    const refFrets = lesson.frets;
    const userStrings = practiceConfig.strings;

    let exactCount = 0;
    const stringChecks = refFrets.map((expectedFret, idx) => {
      const st = userStrings[idx];
      const expectedMuted = expectedFret === null;
      const actualMuted = st.muted || st.fret === null;
      const isMatch =
        (expectedMuted && actualMuted) ||
        (!expectedMuted && !actualMuted && st.fret === expectedFret);

      if (isMatch) exactCount++;

      let note = 'Matches reference';
      if (!isMatch) {
        if (expectedMuted && !actualMuted) {
          note = 'Mute this string by clicking its top marker to set ×';
        } else if (!expectedMuted && actualMuted) {
          note =
            expectedFret === 0
              ? 'Should ring open (0), not muted'
              : `Place a finger on fret ${expectedFret}`;
        } else if (expectedFret === 0) {
          note = 'Remove fretted dot so string rings open (0)';
        } else {
          note = `Move to fret ${expectedFret}`;
        }
      }

      return {
        stringNumber: 6 - idx,
        openName: ['E', 'A', 'D', 'G', 'B', 'E'][idx],
        expectedLabel: formatFretValue(expectedFret, expectedMuted),
        actualLabel: formatFretValue(st.fret, actualMuted),
        isMatch,
        note,
      };
    });

    if (exactCount === 6) {
      setFeedback({
        status: 'exact',
        headline: `Exact Match — ${lesson.fullName} formed cleanly`,
        summary:
          'Every fretted note, open string, and muted string matches the reference voicing.',
        stringChecks,
      });
      setCompletedIds((prev) =>
        prev.includes(lesson.id) ? prev : [...prev, lesson.id]
      );
      guitarAudio.playChord(
        referenceConfig.strings,
        STANDARD_MIDI,
        'down',
        tone,
        setActiveStringIndex
      );
      return;
    }

    const cleanDetectedShort = practiceDetected.shortName
      .replace(/♯/g, '#')
      .replace(/♭/g, 'b');
    const targetShort = lesson.shortName
      .replace(/♯/g, '#')
      .replace(/♭/g, 'b');
    if (cleanDetectedShort === targetShort) {
      setFeedback({
        status: 'harmonic',
        headline: `Valid ${lesson.fullName} Voicing (${6 - exactCount} string difference)`,
        summary: `Your fretboard forms a valid ${lesson.fullName} chord, though it differs slightly from the target beginner shape below.`,
        stringChecks,
      });
      setCompletedIds((prev) =>
        prev.includes(lesson.id) ? prev : [...prev, lesson.id]
      );
      return;
    }

    setFeedback({
      status: 'mismatch',
      headline: `${exactCount} of 6 strings match (${practiceDetected.shortName === '—' ? 'Empty' : `currently ${practiceDetected.shortName}`})`,
      summary:
        'Review the string-by-string comparison below to adjust fretted notes and open/muted markers.',
      stringChecks,
    });
  };

  const applyOneHint = () => {
    setFeedback(null);
    for (let i = 0; i < 6; i++) {
      const expected = lesson.frets[i];
      const curr = practiceConfig.strings[i];
      const matches =
        (expected === null && (curr.muted || curr.fret === null)) ||
        (expected !== null && !curr.muted && curr.fret === expected);
      if (!matches) {
        setPracticeConfig((prev) => {
          const next = prev.strings.map((s) => ({ ...s }));
          next[i] = {
            fret: expected,
            muted: expected === null,
            finger: '',
          };
          return { ...prev, strings: next };
        });
        setHintText(
          `Hint applied to String ${6 - i} (${['E', 'A', 'D', 'G', 'B', 'E'][i]}): set to ${formatFretValue(expected, expected === null)}.`
        );
        return;
      }
    }
    setHintText(
      'All 6 strings already match the reference shape—click Check My Chord.'
    );
  };

  const revealAnswer = () => {
    setPracticeConfig((prev) => ({
      ...prev,
      strings: lesson.frets.map((f, idx) => ({
        fret: f,
        muted: f === null,
        finger: lesson.fingers[idx] || '',
      })),
      barres: (lesson.barres || []).map((b, idx) => ({
        id: `hint-barre-${idx}`,
        ...b,
      })),
      dotLabelMode: 'finger',
    }));
    setHintText(
      'Reference shape revealed. Reset exercise to try again from memory.'
    );
    setFeedback(null);
  };

  const resetPractice = () => {
    setPracticeConfig(buildEmptyPracticeConfig(lesson));
    setFeedback(null);
    setHintText(null);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8">
      {/* Module Header */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-sky-700 dark:text-sky-400">
            Guided Curriculum &amp; Fretboard Exercises
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Learn Beginner Guitar Chords
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Explore finger placement, audition each string for clarity, and switch to Practice &amp; Check to form each chord from memory against the reference shape.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Curriculum Progress
            </p>
            <p className="font-mono text-base font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {completedIds.length} / {BEGINNER_LESSONS.length} Completed
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setMode('guide')}
              className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                mode === 'guide'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Guided Lesson
            </button>
            <button
              type="button"
              onClick={() => setMode('practice')}
              className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                mode === 'practice'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Practice &amp; Check
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Curriculum Selector */}
      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
        {BEGINNER_LESSONS.map((item, idx) => {
          const active = idx === selectedIdx;
          const isDone = completedIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectLesson(idx)}
              className={`flex flex-col items-start rounded-lg border px-3 py-2.5 text-left transition-colors ${
                active
                  ? 'border-sky-600 bg-sky-50/70 dark:border-sky-500 dark:bg-sky-950/60'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-1">
                <span className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                  {item.shortName}
                </span>
                {isDone && (
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                    aria-label="Completed"
                  />
                )}
              </div>
              <span className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400 w-full">
                {item.difficulty}
              </span>
            </button>
          );
        })}
      </div>

      {/* Two-Zone Sandbox Stage */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Stage: Interactive Diagram & Audio */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                {mode === 'guide'
                  ? `${lesson.fullName} Reference`
                  : `Exercise: Form ${lesson.fullName}`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'guide'
                  ? 'Click any string label below to audition individual notes'
                  : 'Click frets to place fingers · click top O/× to mute or open'}
              </p>
            </div>

            {mode === 'guide' && (
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                {(['finger', 'note', 'interval'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setGuideDotMode(m)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                      guideDotMode === m
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {m === 'finger'
                      ? 'Fingers'
                      : m === 'note'
                        ? 'Notes'
                        : 'Intervals'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            {mode === 'guide' ? (
              <FretboardSvg
                config={referenceConfig}
                detected={referenceDetected}
                fingerTool="auto"
                activeStringIndex={activeStringIndex}
                onCellClick={() => {}}
                onToggleOpenMute={() => {}}
                onCreateBarre={() => {}}
                onRemoveBarre={() => {}}
                onPluckString={(sIdx) => {
                  const st = referenceConfig.strings[sIdx];
                  if (!st.muted && st.fret !== null) {
                    setActiveStringIndex(sIdx);
                    guitarAudio.pluckMidi(STANDARD_MIDI[sIdx] + st.fret, tone);
                    window.setTimeout(() => setActiveStringIndex(null), 350);
                  }
                }}
              />
            ) : (
              <FretboardSvg
                config={practiceConfig}
                detected={practiceDetected}
                fingerTool="auto"
                activeStringIndex={activeStringIndex}
                onCellClick={handlePracticeCellClick}
                onToggleOpenMute={handlePracticeToggleOpenMute}
                onCreateBarre={() => {}}
                onRemoveBarre={() => {}}
                onPluckString={(sIdx) => {
                  const st = practiceConfig.strings[sIdx];
                  if (!st.muted && st.fret !== null) {
                    setActiveStringIndex(sIdx);
                    guitarAudio.pluckMidi(STANDARD_MIDI[sIdx] + st.fret, tone);
                    window.setTimeout(() => setActiveStringIndex(null), 350);
                  }
                }}
              />
            )}
          </div>

          {/* Audio Transport Controls */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 border-t border-slate-100 pt-5 dark:border-slate-800">
            {mode === 'guide' ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    guitarAudio.playChord(
                      referenceConfig.strings,
                      STANDARD_MIDI,
                      'down',
                      tone,
                      setActiveStringIndex
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 whitespace-nowrap"
                >
                  <Play className="h-4 w-4" />
                  Strum Chord
                </button>
                <button
                  type="button"
                  onClick={() =>
                    guitarAudio.playChord(
                      referenceConfig.strings,
                      STANDARD_MIDI,
                      'arp',
                      tone,
                      setActiveStringIndex
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
                >
                  <Volume2 className="h-4 w-4" />
                  Arpeggiate Notes
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={evaluateAttempt}
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 whitespace-nowrap"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Check My Chord
                </button>
                <button
                  type="button"
                  onClick={() =>
                    guitarAudio.playChord(
                      practiceConfig.strings,
                      STANDARD_MIDI,
                      'down',
                      tone,
                      setActiveStringIndex
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
                >
                  <Play className="h-4 w-4" />
                  Strum Attempt
                </button>
                <button
                  type="button"
                  onClick={() =>
                    guitarAudio.playChord(
                      referenceConfig.strings,
                      STANDARD_MIDI,
                      'down',
                      tone,
                      setActiveStringIndex
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
                >
                  <Volume2 className="h-4 w-4" />
                  Hear Target
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Deck: Finger Placement Guide OR Exercise Checker */}
        <div className="lg:col-span-7 space-y-6">
          {mode === 'guide' ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {lesson.difficulty}
                    <span aria-hidden="true"> · </span>
                    Fret Pattern:{' '}
                    <span className="font-mono tabular-nums">
                      {lesson.frets.map((f) => (f === null ? 'x' : f)).join(' ')}
                    </span>
                  </span>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    How to Form {lesson.fullName}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('practice')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 whitespace-nowrap"
                  >
                    Practice This Chord
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onLoadInStudio(buildLessonConfig(lesson, 'finger'))
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
                  >
                    Open in Studio
                  </button>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {lesson.summary}
              </p>

              {/* Step-by-Step Finger Placement Table */}
              <div>
                <h4 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Step-by-Step Finger Placement
                </h4>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        <th className="py-2 pr-4 font-medium">Finger</th>
                        <th className="px-4 py-2 font-medium">
                          String &amp; Fret
                        </th>
                        <th className="pl-4 py-2 font-medium">Harmonic Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {lesson.fingerSteps.map((step) => (
                        <tr key={step.finger}>
                          <td className="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                            {step.finger}
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {step.placement}
                          </td>
                          <td className="pl-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                            {step.role}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Open/Muted & Technique Advice */}
              <div className="grid grid-cols-1 gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2 dark:border-slate-800">
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Open &amp; Muted Strings
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {lesson.openMutedNote}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Clarity &amp; Posture Tip
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {lesson.techniqueTip}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Target Exercise
                    <span aria-hidden="true"> · </span>
                    Live Detection:{' '}
                    <span className="font-mono text-slate-700 dark:text-slate-200">
                      {practiceDetected.shortName}
                    </span>
                  </span>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    Build {lesson.fullName} ({lesson.shortName})
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={applyOneHint}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    Hint (1 String)
                  </button>
                  <button
                    type="button"
                    onClick={revealAnswer}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Reveal Shape
                  </button>
                  <button
                    type="button"
                    onClick={resetPractice}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  Instructions:
                </span>{' '}
                {lesson.openMutedNote} Click fret intersections on the left to place notes, and click the{' '}
                <span className="font-mono font-semibold">O</span> /{' '}
                <span className="font-mono font-semibold">×</span> markers above the nut to mute or open strings.
              </div>

              {hintText && (
                <div className="flex items-start gap-2.5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-200">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-700 dark:text-sky-400" />
                  <span>{hintText}</span>
                </div>
              )}

              {feedback && (
                <div
                  className={`rounded-xl border p-4 space-y-4 ${
                    feedback.status === 'exact'
                      ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/40'
                      : feedback.status === 'harmonic'
                        ? 'border-sky-200 bg-sky-50/70 dark:border-sky-800 dark:bg-sky-950/40'
                        : 'border-amber-200 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/40'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {feedback.status === 'mismatch' ? (
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" />
                      ) : (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                      )}
                      <div>
                        <h4 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                          {feedback.headline}
                        </h4>
                        <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300">
                          {feedback.summary}
                        </p>
                      </div>
                    </div>

                    {feedback.status !== 'mismatch' && (
                      <button
                        type="button"
                        onClick={() =>
                          selectLesson((selectedIdx + 1) % BEGINNER_LESSONS.length)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 whitespace-nowrap"
                      >
                        Next Chord
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Per-String Comparison Table */}
                  <div className="overflow-x-auto rounded-lg border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-900">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                          <th className="px-3 py-2 font-medium">String</th>
                          <th className="px-3 py-2 font-medium">Your Input</th>
                          <th className="px-3 py-2 font-medium">Reference</th>
                          <th className="px-3 py-2 font-medium">Check</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {feedback.stringChecks.map((row) => (
                          <tr key={row.stringNumber}>
                            <td className="px-3 py-2 font-mono font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                              {row.stringNumber} ({row.openName})
                            </td>
                            <td className="px-3 py-2 font-mono tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              {row.actualLabel}
                            </td>
                            <td className="px-3 py-2 font-mono tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              {row.expectedLabel}
                            </td>
                            <td className="px-3 py-2">
                              {row.isMatch ? (
                                <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Correct
                                </span>
                              ) : (
                                <span className="font-medium text-amber-800 dark:text-amber-300">
                                  {row.note}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {!feedback && (
                <div className="border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  Tip: Try building the shape without looking at the reference first, then click{' '}
                  <strong className="font-medium text-slate-700 dark:text-slate-200">
                    Check My Chord
                  </strong>{' '}
                  to verify every string.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
