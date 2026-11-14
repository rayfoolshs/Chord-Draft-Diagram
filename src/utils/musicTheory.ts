import {
  ChordDiagramConfig,
  DetectedChord,
  FingerLabel,
  StringState,
  StringTheoryInfo,
  TuningPreset,
} from '../types/chord';

export const NOTE_NAMES_SHARP = [
  'C',
  'C♯',
  'D',
  'D♯',
  'E',
  'F',
  'F♯',
  'G',
  'G♯',
  'A',
  'A♯',
  'B',
] as const;

export const NOTE_NAMES_FLAT = [
  'C',
  'D♭',
  'D',
  'E♭',
  'E',
  'F',
  'G♭',
  'G',
  'A♭',
  'A',
  'B♭',
  'B',
] as const;

export const NOTE_NAMES_ASCII_SHARP = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

export const TUNING_PRESETS: TuningPreset[] = [
  {
    id: 'standard',
    name: 'Standard (E A D G B E)',
    shortLabel: 'E A D G B E',
    midi: [40, 45, 50, 55, 59, 64],
  },
  {
    id: 'drop-d',
    name: 'Drop D (D A D G B E)',
    shortLabel: 'D A D G B E',
    midi: [38, 45, 50, 55, 59, 64],
  },
  {
    id: 'eb-standard',
    name: 'Half-Step Down (E♭ A♭ D♭ G♭ B♭ E♭)',
    shortLabel: 'E♭ A♭ D♭ G♭ B♭ E♭',
    midi: [39, 44, 49, 54, 58, 63],
  },
  {
    id: 'dadgad',
    name: 'DADGAD (D A D G A D)',
    shortLabel: 'D A D G A D',
    midi: [38, 45, 50, 55, 57, 62],
  },
  {
    id: 'open-g',
    name: 'Open G (D G D G B D)',
    shortLabel: 'D G D G B D',
    midi: [38, 43, 50, 55, 59, 62],
  },
  {
    id: 'open-d',
    name: 'Open D (D A D F♯ A D)',
    shortLabel: 'D A D F♯ A D',
    midi: [38, 45, 50, 54, 57, 62],
  },
];

// Flat-key pitch classes: F(5), Bb(10), Eb(3), Ab(8), Db(1), Gb(6)
const FLAT_PREF_ROOTS = new Set([1, 3, 5, 6, 8, 10]);

export function getNoteName(pc: number, preferFlats = false): string {
  const normalized = ((pc % 12) + 12) % 12;
  return preferFlats ? NOTE_NAMES_FLAT[normalized] : NOTE_NAMES_SHARP[normalized];
}

export function getMidiNoteName(midi: number, preferFlats = false): string {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${getNoteName(pc, preferFlats)}${octave}`;
}

export function getIntervalLabel(semitonesFromRoot: number): string {
  const s = ((semitonesFromRoot % 12) + 12) % 12;
  switch (s) {
    case 0:
      return 'R';
    case 1:
      return '♭2';
    case 2:
      return '2';
    case 3:
      return '♭3';
    case 4:
      return '3';
    case 5:
      return '4';
    case 6:
      return '♭5';
    case 7:
      return '5';
    case 8:
      return '♯5';
    case 9:
      return '6';
    case 10:
      return '♭7';
    case 11:
      return '7';
    default:
      return '';
  }
}

interface ChordTemplate {
  suffix: string;
  qualityName: string;
  intervals: number[]; // pitch classes relative to root
  required: number[]; // intervals that define character
  formula: string;
  description: string;
  priority: number; // tie-breaker preference
}

const CHORD_TEMPLATES: ChordTemplate[] = [
  {
    suffix: '',
    qualityName: 'Major',
    intervals: [0, 4, 7],
    required: [0, 4],
    formula: '1 · 3 · 5',
    description: 'Major triad built from a root, major third, and perfect fifth.',
    priority: 100,
  },
  {
    suffix: 'm',
    qualityName: 'Minor',
    intervals: [0, 3, 7],
    required: [0, 3],
    formula: '1 · ♭3 · 5',
    description: 'Minor triad with a lowered third creating a darker, reflective quality.',
    priority: 99,
  },
  {
    suffix: '5',
    qualityName: 'Power Chord',
    intervals: [0, 7],
    required: [0, 7],
    formula: '1 · 5',
    description: 'Open fifth dyad with no third—neither major nor minor.',
    priority: 82,
  },
  {
    suffix: '7',
    qualityName: 'Dominant 7th',
    intervals: [0, 4, 7, 10],
    required: [0, 4, 10],
    formula: '1 · 3 · 5 · ♭7',
    description: 'Major triad plus a minor seventh; creates strong harmonic tension resolving to the tonic.',
    priority: 96,
  },
  {
    suffix: 'maj7',
    qualityName: 'Major 7th',
    intervals: [0, 4, 7, 11],
    required: [0, 4, 11],
    formula: '1 · 3 · 5 · 7',
    description: 'Major triad crowned with a major seventh for warm, lyrical resonance.',
    priority: 95,
  },
  {
    suffix: 'm7',
    qualityName: 'Minor 7th',
    intervals: [0, 3, 7, 10],
    required: [0, 3, 10],
    formula: '1 · ♭3 · 5 · ♭7',
    description: 'Minor triad with a minor seventh—foundational to jazz, soul, and folk progressions.',
    priority: 95,
  },
  {
    suffix: 'mMaj7',
    qualityName: 'Minor Major 7th',
    intervals: [0, 3, 7, 11],
    required: [0, 3, 11],
    formula: '1 · ♭3 · 5 · 7',
    description: 'Minor triad combined with a natural major seventh for dramatic cinematic tension.',
    priority: 84,
  },
  {
    suffix: 'sus4',
    qualityName: 'Suspended 4th',
    intervals: [0, 5, 7],
    required: [0, 5, 7],
    formula: '1 · 4 · 5',
    description: 'Replaces the third with a perfect fourth, delaying resolution back to major or minor.',
    priority: 90,
  },
  {
    suffix: 'sus2',
    qualityName: 'Suspended 2nd',
    intervals: [0, 2, 7],
    required: [0, 2, 7],
    formula: '1 · 2 · 5',
    description: 'Replaces the third with a major second for an open, airy timbre.',
    priority: 89,
  },
  {
    suffix: '7sus4',
    qualityName: '7th Suspended 4th',
    intervals: [0, 5, 7, 10],
    required: [0, 5, 10],
    formula: '1 · 4 · 5 · ♭7',
    description: 'Dominant seventh chord with the third suspended up to the fourth.',
    priority: 88,
  },
  {
    suffix: 'add9',
    qualityName: 'Added 9th',
    intervals: [0, 2, 4, 7],
    required: [0, 2, 4],
    formula: '1 · 3 · 5 · 9',
    description: 'Major triad enriched with the 9th (major 2nd) without a 7th.',
    priority: 91,
  },
  {
    suffix: 'm(add9)',
    qualityName: 'Minor Added 9th',
    intervals: [0, 2, 3, 7],
    required: [0, 2, 3],
    formula: '1 · ♭3 · 5 · 9',
    description: 'Minor triad enriched with an added 9th for poignant acoustic color.',
    priority: 87,
  },
  {
    suffix: '6',
    qualityName: 'Major 6th',
    intervals: [0, 4, 7, 9],
    required: [0, 4, 9],
    formula: '1 · 3 · 5 · 6',
    description: 'Major triad with an added major sixth above the root.',
    priority: 86,
  },
  {
    suffix: 'm6',
    qualityName: 'Minor 6th',
    intervals: [0, 3, 7, 9],
    required: [0, 3, 9],
    formula: '1 · ♭3 · 5 · 6',
    description: 'Minor triad with a major sixth; frequently functions as a tonic minor color chord.',
    priority: 85,
  },
  {
    suffix: '6/9',
    qualityName: '6/9 Chord',
    intervals: [0, 2, 4, 7, 9],
    required: [0, 2, 4, 9],
    formula: '1 · 3 · 5 · 6 · 9',
    description: 'Pentatonic-derived major chord combining the 6th and 9th.',
    priority: 84,
  },
  {
    suffix: '9',
    qualityName: 'Dominant 9th',
    intervals: [0, 2, 4, 7, 10],
    required: [0, 2, 4, 10],
    formula: '1 · 3 · 5 · ♭7 · 9',
    description: 'Dominant seventh chord extended by a major ninth.',
    priority: 90,
  },
  {
    suffix: 'maj9',
    qualityName: 'Major 9th',
    intervals: [0, 2, 4, 7, 11],
    required: [0, 2, 4, 11],
    formula: '1 · 3 · 5 · 7 · 9',
    description: 'Major seventh chord extended with a sparkling major ninth.',
    priority: 88,
  },
  {
    suffix: 'm9',
    qualityName: 'Minor 9th',
    intervals: [0, 2, 3, 7, 10],
    required: [0, 2, 3, 10],
    formula: '1 · ♭3 · 5 · ♭7 · 9',
    description: 'Minor seventh chord extended with a natural ninth.',
    priority: 88,
  },
  {
    suffix: 'dim',
    qualityName: 'Diminished',
    intervals: [0, 3, 6],
    required: [0, 3, 6],
    formula: '1 · ♭3 · ♭5',
    description: 'Stacked minor thirds forming a tense, symmetrical diminished triad.',
    priority: 87,
  },
  {
    suffix: 'dim7',
    qualityName: 'Diminished 7th',
    intervals: [0, 3, 6, 9],
    required: [0, 3, 6, 9],
    formula: '1 · ♭3 · ♭5 · 𝄫7',
    description: 'Fully symmetrical chord built exclusively of minor third intervals.',
    priority: 88,
  },
  {
    suffix: 'm7♭5',
    qualityName: 'Half-Diminished 7th',
    intervals: [0, 3, 6, 10],
    required: [0, 3, 6, 10],
    formula: '1 · ♭3 · ♭5 · ♭7',
    description: 'Diminished triad with a minor seventh; common ii°7 chord in minor keys.',
    priority: 89,
  },
  {
    suffix: 'aug',
    qualityName: 'Augmented',
    intervals: [0, 4, 8],
    required: [0, 4, 8],
    formula: '1 · 3 · ♯5',
    description: 'Symmetrical triad of two major thirds with a raised fifth.',
    priority: 86,
  },
  {
    suffix: '7♯9',
    qualityName: '7th Sharp 9',
    intervals: [0, 3, 4, 7, 10],
    required: [0, 3, 4, 10],
    formula: '1 · 3 · 5 · ♭7 · ♯9',
    description: 'Altered dominant seventh featuring both the major 3rd and sharp 9th.',
    priority: 85,
  },
  {
    suffix: '7♭9',
    qualityName: '7th Flat 9',
    intervals: [0, 1, 4, 7, 10],
    required: [0, 1, 4, 10],
    formula: '1 · 3 · 5 · ♭7 · ♭9',
    description: 'Altered dominant seventh that resolves strongly into minor tonics.',
    priority: 84,
  },
  {
    suffix: '11',
    qualityName: 'Dominant 11th',
    intervals: [0, 4, 5, 7, 10],
    required: [0, 5, 7, 10],
    formula: '1 · (3) · 5 · ♭7 · 11',
    description: 'Dominant chord extended to the 11th; often omits the 3rd to avoid clashes.',
    priority: 80,
  },
  {
    suffix: '13',
    qualityName: 'Dominant 13th',
    intervals: [0, 4, 7, 9, 10],
    required: [0, 4, 9, 10],
    formula: '1 · 3 · 5 · ♭7 · 13',
    description: 'Rich jazz-blues dominant voicing incorporating the 13th (6th) and ♭7th.',
    priority: 86,
  },
];

interface CandidateMatch {
  rootPc: number;
  template: ChordTemplate;
  score: number;
  isSlash: boolean;
  bassPc: number;
}

export function detectChord(
  strings: StringState[],
  tuningMidi: number[]
): DetectedChord {
  const soundingStrings: { stringIndex: number; midi: number; pc: number }[] = [];

  for (let i = 0; i < 6; i++) {
    const st = strings[i];
    if (!st.muted && st.fret !== null) {
      const midi = tuningMidi[i] + st.fret;
      soundingStrings.push({
        stringIndex: i,
        midi,
        pc: ((midi % 12) + 12) % 12,
      });
    }
  }

  if (soundingStrings.length === 0) {
    return {
      name: 'No Notes Selected',
      shortName: '—',
      rootName: '—',
      qualityName: 'Empty Fretboard',
      bassName: '—',
      isSlash: false,
      formula: 'Click frets or nut markers',
      description: 'Click any fret position to place a finger, or click above the nut to toggle open and muted strings.',
      alternatives: [],
      stringNotes: buildStringTheoryInfo(strings, tuningMidi, null, false),
      pitchClasses: [],
    };
  }

  // Sort by pitch to accurately identify lowest sounding bass note
  const sortedByPitch = [...soundingStrings].sort((a, b) => a.midi - b.midi);
  const bassPc = sortedByPitch[0].pc;
  const uniquePcs = Array.from(new Set(soundingStrings.map((s) => s.pc)));

  if (uniquePcs.length === 1) {
    const note = getNoteName(uniquePcs[0], FLAT_PREF_ROOTS.has(uniquePcs[0]));
    return {
      name: `${note} Unison / Octave`,
      shortName: note,
      rootName: note,
      qualityName: 'Single Pitch Class',
      bassName: note,
      isSlash: false,
      formula: '1',
      description: `All sounding strings produce ${note}. Add a third or fifth to form a chord.`,
      alternatives: [],
      stringNotes: buildStringTheoryInfo(strings, tuningMidi, uniquePcs[0], FLAT_PREF_ROOTS.has(uniquePcs[0])),
      pitchClasses: uniquePcs,
    };
  }

  if (uniquePcs.length === 2) {
    // Check power chord or interval dyad
    const [a, b] = [bassPc, uniquePcs.find((p) => p !== bassPc)!];
    const interval = ((b - a) + 12) % 12;
    const preferFlats = FLAT_PREF_ROOTS.has(a);
    const rootName = getNoteName(a, preferFlats);

    if (interval === 7) {
      return {
        name: `${rootName}5 Power Chord`,
        shortName: `${rootName}5`,
        rootName,
        qualityName: 'Power Chord',
        bassName: rootName,
        isSlash: false,
        formula: '1 · 5',
        description: 'Open fifth dyad with no third—neither major nor minor.',
        alternatives: [],
        stringNotes: buildStringTheoryInfo(strings, tuningMidi, a, preferFlats),
        pitchClasses: uniquePcs,
      };
    }

    if (interval === 5) {
      const invertedRoot = b;
      const invFlats = FLAT_PREF_ROOTS.has(invertedRoot);
      const invName = getNoteName(invertedRoot, invFlats);
      return {
        name: `${invName}5 / ${rootName}`,
        shortName: `${invName}5/${rootName}`,
        rootName: invName,
        qualityName: 'Inverted Fifth',
        bassName: rootName,
        isSlash: true,
        formula: '5 in bass · 1',
        description: `Two-note fourth dyad functioning as an inverted ${invName}5 power chord.`,
        alternatives: [{ name: `${rootName} (no 3rd, +4)`, shortName: `${rootName}(4)` }],
        stringNotes: buildStringTheoryInfo(strings, tuningMidi, invertedRoot, invFlats),
        pitchClasses: uniquePcs,
      };
    }

    const intervalNames: Record<number, string> = {
      1: 'Minor 2nd Dyad',
      2: 'Major 2nd Dyad',
      3: 'Minor 3rd Dyad',
      4: 'Major 3rd Dyad',
      6: 'Tritone Dyad',
      8: 'Minor 6th Dyad',
      9: 'Major 6th Dyad',
      10: 'Minor 7th Dyad',
      11: 'Major 7th Dyad',
    };
    const qName = intervalNames[interval] || 'Dyad';
    const suffix = interval === 3 ? 'm (no 5)' : interval === 4 ? ' (no 5)' : '';
    return {
      name: `${rootName}${suffix ? ` ${qName}` : ` ${qName}`}`,
      shortName: `${rootName}${interval === 3 ? 'm(no5)' : interval === 4 ? '(no5)' : ''}`,
      rootName,
      qualityName: qName,
      bassName: rootName,
      isSlash: false,
      formula: `1 · ${getIntervalLabel(interval)}`,
      description: `Two-note interval (${qName.toLowerCase()}). Add another pitch class to define a full triad.`,
      alternatives: [],
      stringNotes: buildStringTheoryInfo(strings, tuningMidi, a, preferFlats),
      pitchClasses: uniquePcs,
    };
  }

  const candidates: CandidateMatch[] = [];

  for (const rootPc of uniquePcs) {
    const relSet = new Set(uniquePcs.map((pc) => ((pc - rootPc) + 12) % 12));

    for (const template of CHORD_TEMPLATES) {
      // Every required interval must be present
      const hasAllRequired = template.required.every((req) => relSet.has(req));
      if (!hasAllRequired) continue;

      // Every sounding note must belong to template.intervals
      const templateSet = new Set(template.intervals);
      let extraNotes = 0;
      for (const rel of relSet) {
        if (!templateSet.has(rel)) {
          extraNotes++;
        }
      }
      if (extraNotes > 0) continue;

      // Exact coverage score
      const missingCount = template.intervals.length - relSet.size;
      const isSlash = rootPc !== bassPc;

      let score = template.priority;
      score += relSet.size * 14;
      score -= missingCount * 10;
      if (!isSlash) score += 24; // Strong preference for root in bass

      // Bonus if 5th is present
      if (template.intervals.includes(7) && relSet.has(7)) {
        score += 5;
      }

      candidates.push({
        rootPc,
        template,
        score,
        isSlash,
        bassPc,
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  if (candidates.length === 0) {
    // Fallback custom cluster label anchored on bass note
    const preferFlats = FLAT_PREF_ROOTS.has(bassPc);
    const rootName = getNoteName(bassPc, preferFlats);
    const intervals = uniquePcs
      .map((pc) => ((pc - bassPc) + 12) % 12)
      .sort((a, b) => a - b)
      .map((i) => getIntervalLabel(i));

    return {
      name: `${rootName} Custom Voicing`,
      shortName: `${rootName} (${intervals.join(',')})`,
      rootName,
      qualityName: 'Custom Pitch Set',
      bassName: rootName,
      isSlash: false,
      formula: intervals.join(' · '),
      description: 'Non-standard or polychord voicing analyzed relative to its lowest sounding bass note.',
      alternatives: [],
      stringNotes: buildStringTheoryInfo(strings, tuningMidi, bassPc, preferFlats),
      pitchClasses: uniquePcs,
    };
  }

  const best = candidates[0];
  const preferFlats = FLAT_PREF_ROOTS.has(best.rootPc);
  const rootName = getNoteName(best.rootPc, preferFlats);
  const bassName = getNoteName(best.bassPc, preferFlats);
  const shortBase = `${rootName}${best.template.suffix}`;
  const shortName = best.isSlash ? `${shortBase}/${bassName}` : shortBase;
  const fullName = best.isSlash
    ? `${rootName} ${best.template.qualityName} / ${bassName}`
    : `${rootName} ${best.template.qualityName}`;

  const seenAlts = new Set<string>([shortName]);
  const alternatives: { name: string; shortName: string }[] = [];

  for (let i = 1; i < candidates.length && alternatives.length < 3; i++) {
    const c = candidates[i];
    const cFlats = FLAT_PREF_ROOTS.has(c.rootPc);
    const cRoot = getNoteName(c.rootPc, cFlats);
    const cBass = getNoteName(c.bassPc, cFlats);
    const cShort = c.isSlash ? `${cRoot}${c.template.suffix}/${cBass}` : `${cRoot}${c.template.suffix}`;
    if (!seenAlts.has(cShort)) {
      seenAlts.add(cShort);
      alternatives.push({
        name: c.isSlash ? `${cRoot} ${c.template.qualityName} / ${cBass}` : `${cRoot} ${c.template.qualityName}`,
        shortName: cShort,
      });
    }
  }

  return {
    name: fullName,
    shortName,
    rootName,
    qualityName: best.template.qualityName,
    bassName,
    isSlash: best.isSlash,
    formula: best.template.formula,
    description: best.template.description,
    alternatives,
    stringNotes: buildStringTheoryInfo(strings, tuningMidi, best.rootPc, preferFlats),
    pitchClasses: uniquePcs,
  };
}

function buildStringTheoryInfo(
  strings: StringState[],
  tuningMidi: number[],
  rootPc: number | null,
  preferFlats: boolean
): StringTheoryInfo[] {
  return strings.map((st, idx) => {
    const openMidi = tuningMidi[idx];
    const openNoteName = getNoteName(openMidi, preferFlats);
    if (st.muted || st.fret === null) {
      return {
        stringIndex: idx,
        openMidi,
        openNoteName,
        midi: null,
        noteName: '×',
        noteWithOctave: 'Muted',
        interval: '—',
        isRoot: false,
        muted: true,
        fret: null,
      };
    }

    const midi = openMidi + st.fret;
    const pc = ((midi % 12) + 12) % 12;
    const noteName = getNoteName(pc, preferFlats);
    const noteWithOctave = getMidiNoteName(midi, preferFlats);
    const interval = rootPc !== null ? getIntervalLabel(pc - rootPc) : '—';

    return {
      stringIndex: idx,
      openMidi,
      openNoteName,
      midi,
      noteName,
      noteWithOctave,
      interval,
      isRoot: rootPc !== null && pc === rootPc,
      muted: false,
      fret: st.fret,
    };
  });
}

export function transposeDiagram(
  config: ChordDiagramConfig,
  semitones: number
): ChordDiagramConfig {
  // Check bounds so all fretted notes stay within 0..20
  const fretted = config.strings.filter((s) => !s.muted && s.fret !== null);
  if (fretted.length === 0) return config;

  // Determine min and max fret after shift
  let canShift = true;
  for (const s of config.strings) {
    if (!s.muted && s.fret !== null) {
      const next = s.fret + semitones;
      if (next < 0 || next > 19) {
        canShift = false;
        break;
      }
    }
  }
  if (!canShift) return config;

  // If shifting open strings up by +1, open string becomes fret 1 (with finger '1' or blank)
  const nextStrings: StringState[] = config.strings.map((s) => {
    if (s.muted || s.fret === null) return { ...s };
    const nextFret = s.fret + semitones;
    return {
      ...s,
      fret: nextFret,
      finger: nextFret === 0 ? '' : s.finger,
    };
  });

  const nextBarres = config.barres
    .map((b) => ({
      ...b,
      fret: b.fret + semitones,
    }))
    .filter((b) => b.fret >= 1 && b.fret <= 19);

  // Compute ideal baseFret so all fretted notes fit in fretCount
  const positiveFrets = nextStrings
    .filter((s) => !s.muted && s.fret !== null && s.fret > 0)
    .map((s) => s.fret as number);

  let nextBaseFret = 1;
  if (positiveFrets.length > 0) {
    const minF = Math.min(...positiveFrets);
    const maxF = Math.max(...positiveFrets);
    const hasOpen = nextStrings.some((s) => !s.muted && s.fret === 0);
    if (!hasOpen && maxF > config.fretCount) {
      nextBaseFret = Math.max(1, minF);
    } else if (hasOpen) {
      nextBaseFret = 1;
    } else if (maxF - config.baseFret + 1 > config.fretCount || minF < config.baseFret) {
      nextBaseFret = Math.max(1, minF);
    } else {
      nextBaseFret = config.baseFret;
    }
  }

  return {
    ...config,
    strings: nextStrings,
    barres: nextBarres,
    baseFret: nextBaseFret,
  };
}

export function autoAssignFingers(strings: StringState[]): StringState[] {
  // Simple heuristic: assign fingers 1..4 from lowest fret & lowest string upwards
  const fretted = strings
    .map((s, idx) => ({ idx, fret: s.fret, muted: s.muted }))
    .filter((item) => !item.muted && item.fret !== null && item.fret > 0)
    .sort((a, b) => (a.fret! !== b.fret! ? a.fret! - b.fret! : a.idx - b.idx));

  const next = strings.map((s) => ({ ...s, finger: '' as FingerLabel }));
  const labels: FingerLabel[] = ['1', '2', '3', '4'];
  fretted.forEach((item, order) => {
    if (order < labels.length) {
      next[item.idx].finger = labels[order];
    } else {
      next[item.idx].finger = '4';
    }
  });
  return next;
}
