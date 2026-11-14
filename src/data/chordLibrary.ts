import { ChordVoicingPreset, FingerLabel } from '../types/chord';

export interface RootOption {
  pc: number;
  label: string;
  searchAliases: string[];
}

export const ROOT_OPTIONS: RootOption[] = [
  { pc: 0, label: 'C', searchAliases: ['c'] },
  { pc: 1, label: 'C♯ / D♭', searchAliases: ['c#', 'db', 'c♯', 'd♭'] },
  { pc: 2, label: 'D', searchAliases: ['d'] },
  { pc: 3, label: 'E♭', searchAliases: ['eb', 'd#', 'e♭', 'd♯'] },
  { pc: 4, label: 'E', searchAliases: ['e'] },
  { pc: 5, label: 'F', searchAliases: ['f'] },
  { pc: 6, label: 'F♯ / G♭', searchAliases: ['f#', 'gb', 'f♯', 'g♭'] },
  { pc: 7, label: 'G', searchAliases: ['g'] },
  { pc: 8, label: 'A♭', searchAliases: ['ab', 'g#', 'a♭', 'g♯'] },
  { pc: 9, label: 'A', searchAliases: ['a'] },
  { pc: 10, label: 'B♭', searchAliases: ['bb', 'a#', 'b♭', 'a♯'] },
  { pc: 11, label: 'B', searchAliases: ['b'] },
];

export interface QualityOption {
  id: string;
  label: string;
  suffix: string;
}

export const QUALITY_OPTIONS: QualityOption[] = [
  { id: 'major', label: 'Major', suffix: '' },
  { id: 'minor', label: 'Minor', suffix: 'm' },
  { id: '7', label: 'Dominant 7th', suffix: '7' },
  { id: 'maj7', label: 'Major 7th', suffix: 'maj7' },
  { id: 'm7', label: 'Minor 7th', suffix: 'm7' },
  { id: 'sus4', label: 'Sus4', suffix: 'sus4' },
  { id: 'sus2', label: 'Sus2', suffix: 'sus2' },
  { id: 'add9', label: 'Add9', suffix: 'add9' },
  { id: '6', label: 'Major 6th', suffix: '6' },
  { id: 'm6', label: 'Minor 6th', suffix: 'm6' },
  { id: '9', label: 'Dominant 9th', suffix: '9' },
  { id: 'dim', label: 'Diminished', suffix: 'dim' },
  { id: 'dim7', label: 'Dim 7th', suffix: 'dim7' },
  { id: 'm7b5', label: 'm7♭5', suffix: 'm7♭5' },
  { id: 'aug', label: 'Augmented', suffix: 'aug' },
  { id: '5', label: 'Power (5)', suffix: '5' },
];

// Curated open-position voicings keyed by `${pc}:${qualityId}`
const OPEN_VOICINGS: Record<string, ChordVoicingPreset[]> = {
  '0:major': [
    {
      id: 'c-maj-open',
      label: 'Open C',
      level: 'Open',
      baseFret: 1,
      frets: [null, 3, 2, 0, 1, 0],
      fingers: ['', '3', '2', '', '1', ''],
    },
    {
      id: 'c-maj-easy',
      label: 'Easy 3-String C',
      level: 'Easy',
      baseFret: 1,
      frets: [null, null, null, 0, 1, 0],
      fingers: ['', '', '', '', '1', ''],
    },
  ],
  '0:minor': [
    {
      id: 'c-min-open-4',
      label: 'Compact Cm (4-str)',
      level: 'Easy',
      baseFret: 1,
      frets: [null, null, 1, 0, 1, 3],
      fingers: ['', '', '1', '', '2', '4'],
    },
  ],
  '0:7': [
    {
      id: 'c-7-open',
      label: 'Open C7',
      level: 'Open',
      baseFret: 1,
      frets: [null, 3, 2, 3, 1, 0],
      fingers: ['', '3', '2', '4', '1', ''],
    },
  ],
  '0:maj7': [
    {
      id: 'c-maj7-open',
      label: 'Open Cmaj7',
      level: 'Open',
      baseFret: 1,
      frets: [null, 3, 2, 0, 0, 0],
      fingers: ['', '3', '2', '', '', ''],
    },
  ],
  '0:add9': [
    {
      id: 'c-add9-open',
      label: 'Open Cadd9',
      level: 'Open',
      baseFret: 1,
      frets: [null, 3, 2, 0, 3, 0],
      fingers: ['', '2', '1', '', '3', ''],
    },
  ],
  '0:sus4': [
    {
      id: 'c-sus4-open',
      label: 'Open Csus4',
      level: 'Open',
      baseFret: 1,
      frets: [null, 3, 3, 0, 1, 1],
      fingers: ['', '3', '4', '', '1', '1'],
      barres: [{ fret: 1, fromString: 4, toString: 5, finger: '1' }],
    },
  ],
  '2:major': [
    {
      id: 'd-maj-open',
      label: 'Open D',
      level: 'Open',
      baseFret: 1,
      frets: [null, null, 0, 2, 3, 2],
      fingers: ['', '', '', '1', '3', '2'],
    },
  ],
  '2:minor': [
    {
      id: 'd-min-open',
      label: 'Open Dm',
      level: 'Open',
      baseFret: 1,
      frets: [null, null, 0, 2, 3, 1],
      fingers: ['', '', '', '2', '3', '1'],
    },
  ],
  '2:7': [
    {
      id: 'd-7-open',
      label: 'Open D7',
      level: 'Open',
      baseFret: 1,
      frets: [null, null, 0, 2, 1, 2],
      fingers: ['', '', '', '2', '1', '3'],
    },
  ],
  '2:maj7': [
    {
      id: 'd-maj7-open',
      label: 'Open Dmaj7',
      level: 'Open',
      baseFret: 1,
      frets: [null, null, 0, 2, 2, 2],
      fingers: ['', '', '', '1', '1', '1'],
      barres: [{ fret: 2, fromString: 3, toString: 5, finger: '1' }],
    },
  ],
  '2:m7': [
    {
      id: 'd-m7-open',
      label: 'Open Dm7',
      level: 'Open',
      baseFret: 1,
      frets: [null, null, 0, 2, 1, 1],
      fingers: ['', '', '', '2', '1', '1'],
      barres: [{ fret: 1, fromString: 4, toString: 5, finger: '1' }],
    },
  ],
  '2:sus4': [
    {
      id: 'd-sus4-open',
      label: 'Open Dsus4',
      level: 'Open',
      baseFret: 1,
      frets: [null, null, 0, 2, 3, 3],
      fingers: ['', '', '', '1', '2', '3'],
    },
  ],
  '2:sus2': [
    {
      id: 'd-sus2-open',
      label: 'Open Dsus2',
      level: 'Open',
      baseFret: 1,
      frets: [null, null, 0, 2, 3, 0],
      fingers: ['', '', '', '1', '3', ''],
    },
  ],
  '2:add9': [
    {
      id: 'd-add9-open',
      label: 'Open Dadd9',
      level: 'Open',
      baseFret: 1,
      frets: [null, null, 0, 2, 3, 0],
      fingers: ['', '', '', '1', '3', ''],
    },
  ],
  '2:6': [
    {
      id: 'd-6-open',
      label: 'Open D6',
      level: 'Open',
      baseFret: 1,
      frets: [null, null, 0, 2, 0, 2],
      fingers: ['', '', '', '1', '', '2'],
    },
  ],
  '2:m6': [
    {
      id: 'd-m6-open',
      label: 'Open Dm6',
      level: 'Open',
      baseFret: 1,
      frets: [null, null, 0, 2, 0, 1],
      fingers: ['', '', '', '2', '', '1'],
    },
  ],
  '4:major': [
    {
      id: 'e-maj-open',
      label: 'Open E',
      level: 'Open',
      baseFret: 1,
      frets: [0, 2, 2, 1, 0, 0],
      fingers: ['', '2', '3', '1', '', ''],
    },
  ],
  '4:minor': [
    {
      id: 'e-min-open',
      label: 'Open Em',
      level: 'Open',
      baseFret: 1,
      frets: [0, 2, 2, 0, 0, 0],
      fingers: ['', '2', '3', '', '', ''],
    },
    {
      id: 'e-min-easy',
      label: 'Easy 4-String Em',
      level: 'Easy',
      baseFret: 1,
      frets: [null, null, 2, 0, 0, 0],
      fingers: ['', '', '2', '', '', ''],
    },
  ],
  '4:7': [
    {
      id: 'e-7-open',
      label: 'Open E7',
      level: 'Open',
      baseFret: 1,
      frets: [0, 2, 0, 1, 0, 0],
      fingers: ['', '2', '', '1', '', ''],
    },
  ],
  '4:maj7': [
    {
      id: 'e-maj7-open',
      label: 'Open Emaj7',
      level: 'Open',
      baseFret: 1,
      frets: [0, 2, 1, 1, 0, 0],
      fingers: ['', '3', '1', '2', '', ''],
    },
  ],
  '4:m7': [
    {
      id: 'e-m7-open',
      label: 'Open Em7',
      level: 'Open',
      baseFret: 1,
      frets: [0, 2, 0, 0, 0, 0],
      fingers: ['', '2', '', '', '', ''],
    },
  ],
  '4:sus4': [
    {
      id: 'e-sus4-open',
      label: 'Open Esus4',
      level: 'Open',
      baseFret: 1,
      frets: [0, 2, 2, 2, 0, 0],
      fingers: ['', '2', '3', '4', '', ''],
    },
  ],
  '4:6': [
    {
      id: 'e-6-open',
      label: 'Open E6',
      level: 'Open',
      baseFret: 1,
      frets: [0, 2, 2, 1, 2, 0],
      fingers: ['', '2', '3', '1', '4', ''],
    },
  ],
  '4:m6': [
    {
      id: 'e-m6-open',
      label: 'Open Em6',
      level: 'Open',
      baseFret: 1,
      frets: [0, 2, 2, 0, 2, 0],
      fingers: ['', '1', '2', '', '3', ''],
    },
  ],
  '5:major': [
    {
      id: 'f-maj-easy',
      label: 'Mini F (4-String)',
      level: 'Easy',
      baseFret: 1,
      frets: [null, null, 3, 2, 1, 1],
      fingers: ['', '', '3', '2', '1', '1'],
      barres: [{ fret: 1, fromString: 4, toString: 5, finger: '1' }],
    },
  ],
  '5:maj7': [
    {
      id: 'f-maj7-open',
      label: 'Open Fmaj7',
      level: 'Open',
      baseFret: 1,
      frets: [null, null, 3, 2, 1, 0],
      fingers: ['', '', '3', '2', '1', ''],
    },
  ],
  '7:major': [
    {
      id: 'g-maj-open',
      label: 'Open G (4-Finger)',
      level: 'Open',
      baseFret: 1,
      frets: [3, 2, 0, 0, 3, 3],
      fingers: ['2', '1', '', '', '3', '4'],
    },
    {
      id: 'g-maj-3finger',
      label: 'Open G (Classic)',
      level: 'Open',
      baseFret: 1,
      frets: [3, 2, 0, 0, 0, 3],
      fingers: ['2', '1', '', '', '', '3'],
    },
    {
      id: 'g-maj-easy',
      label: 'Easy 4-String G',
      level: 'Easy',
      baseFret: 1,
      frets: [null, null, 0, 0, 0, 3],
      fingers: ['', '', '', '', '', '3'],
    },
  ],
  '7:7': [
    {
      id: 'g-7-open',
      label: 'Open G7',
      level: 'Open',
      baseFret: 1,
      frets: [3, 2, 0, 0, 0, 1],
      fingers: ['3', '2', '', '', '', '1'],
    },
  ],
  '7:maj7': [
    {
      id: 'g-maj7-open',
      label: 'Open Gmaj7',
      level: 'Open',
      baseFret: 1,
      frets: [3, 2, 0, 0, 0, 2],
      fingers: ['3', '1', '', '', '', '2'],
    },
  ],
  '7:6': [
    {
      id: 'g-6-open',
      label: 'Open G6',
      level: 'Open',
      baseFret: 1,
      frets: [3, 2, 0, 0, 0, 0],
      fingers: ['2', '1', '', '', '', ''],
    },
  ],
  '7:sus4': [
    {
      id: 'g-sus4-open',
      label: 'Open Gsus4',
      level: 'Open',
      baseFret: 1,
      frets: [3, 3, 0, 0, 1, 3],
      fingers: ['2', '3', '', '', '1', '4'],
    },
  ],
  '9:major': [
    {
      id: 'a-maj-open',
      label: 'Open A',
      level: 'Open',
      baseFret: 1,
      frets: [null, 0, 2, 2, 2, 0],
      fingers: ['', '', '1', '2', '3', ''],
    },
  ],
  '9:minor': [
    {
      id: 'a-min-open',
      label: 'Open Am',
      level: 'Open',
      baseFret: 1,
      frets: [null, 0, 2, 2, 1, 0],
      fingers: ['', '', '2', '3', '1', ''],
    },
  ],
  '9:7': [
    {
      id: 'a-7-open',
      label: 'Open A7',
      level: 'Open',
      baseFret: 1,
      frets: [null, 0, 2, 0, 2, 0],
      fingers: ['', '', '1', '', '2', ''],
    },
  ],
  '9:maj7': [
    {
      id: 'a-maj7-open',
      label: 'Open Amaj7',
      level: 'Open',
      baseFret: 1,
      frets: [null, 0, 2, 1, 2, 0],
      fingers: ['', '', '2', '1', '3', ''],
    },
  ],
  '9:m7': [
    {
      id: 'a-m7-open',
      label: 'Open Am7',
      level: 'Open',
      baseFret: 1,
      frets: [null, 0, 2, 0, 1, 0],
      fingers: ['', '', '2', '', '1', ''],
    },
  ],
  '9:sus4': [
    {
      id: 'a-sus4-open',
      label: 'Open Asus4',
      level: 'Open',
      baseFret: 1,
      frets: [null, 0, 2, 2, 3, 0],
      fingers: ['', '', '1', '2', '3', ''],
    },
  ],
  '9:sus2': [
    {
      id: 'a-sus2-open',
      label: 'Open Asus2',
      level: 'Open',
      baseFret: 1,
      frets: [null, 0, 2, 2, 0, 0],
      fingers: ['', '', '1', '2', '', ''],
    },
  ],
  '9:add9': [
    {
      id: 'a-add9-open',
      label: 'Open Aadd9',
      level: 'Open',
      baseFret: 1,
      frets: [null, 0, 2, 4, 2, 0],
      fingers: ['', '', '1', '4', '2', ''],
    },
  ],
  '9:6': [
    {
      id: 'a-6-open',
      label: 'Open A6',
      level: 'Open',
      baseFret: 1,
      frets: [null, 0, 2, 2, 2, 2],
      fingers: ['', '', '1', '1', '1', '1'],
      barres: [{ fret: 2, fromString: 2, toString: 5, finger: '1' }],
    },
  ],
  '9:m6': [
    {
      id: 'a-m6-open',
      label: 'Open Am6',
      level: 'Open',
      baseFret: 1,
      frets: [null, 0, 2, 2, 1, 2],
      fingers: ['', '', '2', '3', '1', '4'],
    },
  ],
  '11:7': [
    {
      id: 'b-7-open',
      label: 'Open B7',
      level: 'Open',
      baseFret: 1,
      frets: [null, 2, 1, 2, 0, 2],
      fingers: ['', '2', '1', '3', '', '4'],
    },
  ],
};

interface MovableTemplate {
  id: string;
  label: string;
  level: 'Barre' | 'Movable';
  rootString: 6 | 5 | 4; // 6th (E2=4), 5th (A2=9), 4th (D3=2)
  // Relative offsets from anchor fret `anchor` (null = muted)
  relFrets: (number | null)[];
  fingers: FingerLabel[];
  barre?: { relFret: number; fromString: number; toString: number; finger: FingerLabel };
}

const MOVABLE_TEMPLATES: Record<string, MovableTemplate[]> = {
  major: [
    {
      id: 'e-shape',
      label: 'E-Shape Barre',
      level: 'Barre',
      rootString: 6,
      relFrets: [0, 2, 2, 1, 0, 0],
      fingers: ['1', '3', '4', '2', '1', '1'],
      barre: { relFret: 0, fromString: 0, toString: 5, finger: '1' },
    },
    {
      id: 'a-shape',
      label: 'A-Shape Barre',
      level: 'Barre',
      rootString: 5,
      relFrets: [null, 0, 2, 2, 2, 0],
      fingers: ['', '1', '3', '3', '3', '1'],
      barre: { relFret: 0, fromString: 1, toString: 5, finger: '1' },
    },
  ],
  minor: [
    {
      id: 'em-shape',
      label: 'Em-Shape Barre',
      level: 'Barre',
      rootString: 6,
      relFrets: [0, 2, 2, 0, 0, 0],
      fingers: ['1', '3', '4', '1', '1', '1'],
      barre: { relFret: 0, fromString: 0, toString: 5, finger: '1' },
    },
    {
      id: 'am-shape',
      label: 'Am-Shape Barre',
      level: 'Barre',
      rootString: 5,
      relFrets: [null, 0, 2, 2, 1, 0],
      fingers: ['', '1', '3', '4', '2', '1'],
      barre: { relFret: 0, fromString: 1, toString: 5, finger: '1' },
    },
  ],
  '7': [
    {
      id: 'e7-shape',
      label: 'E7-Shape Barre',
      level: 'Barre',
      rootString: 6,
      relFrets: [0, 2, 0, 1, 0, 0],
      fingers: ['1', '3', '1', '2', '1', '1'],
      barre: { relFret: 0, fromString: 0, toString: 5, finger: '1' },
    },
    {
      id: 'a7-shape',
      label: 'A7-Shape Barre',
      level: 'Barre',
      rootString: 5,
      relFrets: [null, 0, 2, 0, 2, 0],
      fingers: ['', '1', '3', '1', '4', '1'],
      barre: { relFret: 0, fromString: 1, toString: 5, finger: '1' },
    },
  ],
  maj7: [
    {
      id: 'emaj7-shell',
      label: '6th-Root Maj7',
      level: 'Movable',
      rootString: 6,
      relFrets: [0, null, 1, 1, 0, null],
      fingers: ['1', '', '3', '4', '2', ''],
    },
    {
      id: 'amaj7-shape',
      label: 'A-Shape Maj7 Barre',
      level: 'Barre',
      rootString: 5,
      relFrets: [null, 0, 2, 1, 2, 0],
      fingers: ['', '1', '3', '2', '4', '1'],
      barre: { relFret: 0, fromString: 1, toString: 5, finger: '1' },
    },
  ],
  m7: [
    {
      id: 'em7-shape',
      label: 'Em7-Shape Barre',
      level: 'Barre',
      rootString: 6,
      relFrets: [0, 2, 0, 0, 0, 0],
      fingers: ['1', '3', '1', '1', '1', '1'],
      barre: { relFret: 0, fromString: 0, toString: 5, finger: '1' },
    },
    {
      id: 'am7-shape',
      label: 'Am7-Shape Barre',
      level: 'Barre',
      rootString: 5,
      relFrets: [null, 0, 2, 0, 1, 0],
      fingers: ['', '1', '3', '1', '2', '1'],
      barre: { relFret: 0, fromString: 1, toString: 5, finger: '1' },
    },
  ],
  sus4: [
    {
      id: 'esus4-shape',
      label: 'E-Shape Sus4 Barre',
      level: 'Barre',
      rootString: 6,
      relFrets: [0, 2, 2, 2, 0, 0],
      fingers: ['1', '2', '3', '4', '1', '1'],
      barre: { relFret: 0, fromString: 0, toString: 5, finger: '1' },
    },
    {
      id: 'asus4-shape',
      label: 'A-Shape Sus4 Barre',
      level: 'Barre',
      rootString: 5,
      relFrets: [null, 0, 2, 2, 3, 0],
      fingers: ['', '1', '2', '3', '4', '1'],
      barre: { relFret: 0, fromString: 1, toString: 5, finger: '1' },
    },
  ],
  sus2: [
    {
      id: 'asus2-shape',
      label: 'A-Shape Sus2 Barre',
      level: 'Barre',
      rootString: 5,
      relFrets: [null, 0, 2, 2, 0, 0],
      fingers: ['', '1', '3', '4', '1', '1'],
      barre: { relFret: 0, fromString: 1, toString: 5, finger: '1' },
    },
    {
      id: 'dsus2-shape',
      label: '4th-Root Sus2',
      level: 'Movable',
      rootString: 4,
      relFrets: [null, null, 0, 2, 3, 0],
      fingers: ['', '', '1', '3', '4', '1'],
    },
  ],
  add9: [
    {
      id: 'e-add9-shape',
      label: '6th-Root Add9',
      level: 'Movable',
      rootString: 6,
      relFrets: [0, 2, 4, 1, 0, null],
      fingers: ['1', '2', '4', '1', '1', ''],
      barre: { relFret: 0, fromString: 0, toString: 4, finger: '1' },
    },
    {
      id: 'a-add9-shape',
      label: '5th-Root Add9',
      level: 'Movable',
      rootString: 5,
      relFrets: [null, 0, 2, 4, 2, null],
      fingers: ['', '1', '2', '4', '3', ''],
    },
  ],
  '6': [
    {
      id: 'e6-shape',
      label: '6th-Root Major 6',
      level: 'Movable',
      rootString: 6,
      relFrets: [0, null, -1, 1, 0, null],
      fingers: ['2', '', '1', '4', '3', ''],
    },
    {
      id: 'a6-shape',
      label: '5th-Root Major 6',
      level: 'Movable',
      rootString: 5,
      relFrets: [null, 0, 2, 2, 2, 2],
      fingers: ['', '1', '3', '3', '3', '3'],
      barre: { relFret: 2, fromString: 2, toString: 5, finger: '3' },
    },
  ],
  m6: [
    {
      id: 'em6-shape',
      label: '6th-Root Minor 6',
      level: 'Movable',
      rootString: 6,
      relFrets: [0, null, -1, 0, 0, null],
      fingers: ['2', '', '1', '3', '4', ''],
    },
    {
      id: 'am6-shape',
      label: '5th-Root Minor 6',
      level: 'Movable',
      rootString: 5,
      relFrets: [null, 0, 2, 2, 1, 2],
      fingers: ['', '1', '2', '3', '1', '4'],
    },
  ],
  '9': [
    {
      id: 'c9-shape',
      label: '5th-Root Dom9',
      level: 'Movable',
      rootString: 5,
      relFrets: [null, 0, -1, 0, 0, 0],
      fingers: ['', '2', '1', '3', '3', '3'],
      barre: { relFret: 0, fromString: 3, toString: 5, finger: '3' },
    },
    {
      id: 'e9-shape',
      label: '6th-Root Dom9',
      level: 'Movable',
      rootString: 6,
      relFrets: [0, 2, 0, 1, 0, 2],
      fingers: ['1', '3', '1', '2', '1', '4'],
      barre: { relFret: 0, fromString: 0, toString: 4, finger: '1' },
    },
  ],
  dim: [
    {
      id: 'dim-5th',
      label: '5th-Root Dim Triad',
      level: 'Movable',
      rootString: 5,
      relFrets: [null, 0, 1, 2, 1, null],
      fingers: ['', '1', '2', '4', '3', ''],
    },
    {
      id: 'dim-6th',
      label: '6th-Root Dim Triad',
      level: 'Movable',
      rootString: 6,
      relFrets: [0, 1, 2, 0, null, null],
      fingers: ['1', '2', '4', '1', '', ''],
    },
  ],
  dim7: [
    {
      id: 'dim7-5th',
      label: '5th-Root Dim7',
      level: 'Movable',
      rootString: 5,
      relFrets: [null, 0, 1, -1, 1, null],
      fingers: ['', '2', '3', '1', '4', ''],
    },
    {
      id: 'dim7-6th',
      label: '6th-Root Dim7',
      level: 'Movable',
      rootString: 6,
      relFrets: [0, null, -1, 0, -1, null],
      fingers: ['2', '', '1', '3', '1', ''],
    },
  ],
  m7b5: [
    {
      id: 'm7b5-5th',
      label: '5th-Root m7♭5',
      level: 'Movable',
      rootString: 5,
      relFrets: [null, 0, 1, 0, 1, null],
      fingers: ['', '1', '3', '2', '4', ''],
    },
    {
      id: 'm7b5-6th',
      label: '6th-Root m7♭5',
      level: 'Movable',
      rootString: 6,
      relFrets: [0, null, 0, 0, -1, null],
      fingers: ['2', '', '3', '4', '1', ''],
    },
  ],
  aug: [
    {
      id: 'aug-5th',
      label: '5th-Root Aug',
      level: 'Movable',
      rootString: 5,
      relFrets: [null, 0, -1, -2, -2, null],
      fingers: ['', '4', '3', '1', '2', ''],
    },
    {
      id: 'aug-6th',
      label: '6th-Root Aug',
      level: 'Movable',
      rootString: 6,
      relFrets: [0, null, -1, -2, -2, null],
      fingers: ['4', '', '3', '1', '2', ''],
    },
  ],
  '5': [
    {
      id: 'p5-6th',
      label: '6th-Root Power Chord',
      level: 'Movable',
      rootString: 6,
      relFrets: [0, 2, 2, null, null, null],
      fingers: ['1', '3', '4', '', '', ''],
    },
    {
      id: 'p5-5th',
      label: '5th-Root Power Chord',
      level: 'Movable',
      rootString: 5,
      relFrets: [null, 0, 2, 2, null, null],
      fingers: ['', '1', '3', '4', '', ''],
    },
  ],
};

function getAnchorFret(rootPc: number, rootString: 6 | 5 | 4, minAnchor = 1): number {
  // Open string pitch classes: 6th = E(4), 5th = A(9), 4th = D(2)
  const openPc = rootString === 6 ? 4 : rootString === 5 ? 9 : 2;
  let fret = ((rootPc - openPc) + 12) % 12;
  if (fret < minAnchor) fret += 12;
  return fret;
}

export function getVoicingsForChord(
  rootPc: number,
  qualityId: string
): ChordVoicingPreset[] {
  const results: ChordVoicingPreset[] = [];
  const openList = OPEN_VOICINGS[`${rootPc}:${qualityId}`] || [];
  results.push(...openList);

  const movableList = MOVABLE_TEMPLATES[qualityId] || [];
  for (const tpl of movableList) {
    const minRel = Math.min(
      ...tpl.relFrets.filter((f): f is number => f !== null)
    );
    // Ensure lowest fretted note lands at least on fret 1
    const minRequiredAnchor = minRel < 0 ? 1 - minRel : 1;
    const anchor = getAnchorFret(rootPc, tpl.rootString, minRequiredAnchor);

    // Avoid duplicating exact open E/A/D chord if anchor===0 (already forced >= minRequiredAnchor)
    const frets = tpl.relFrets.map((r) => (r === null ? null : anchor + r));
    const nonMuted = frets.filter((f): f is number => f !== null && f > 0);
    const minFret = nonMuted.length > 0 ? Math.min(...nonMuted) : 1;
    const maxFret = nonMuted.length > 0 ? Math.max(...nonMuted) : 1;
    const baseFret = maxFret <= 4 ? 1 : minFret;

    results.push({
      id: `${rootPc}-${qualityId}-${tpl.id}-${anchor}`,
      label: `${tpl.label} (Fr ${anchor})`,
      level: tpl.level,
      baseFret,
      frets,
      fingers: tpl.fingers,
      barres: tpl.barre
        ? [
            {
              fret: anchor + tpl.barre.relFret,
              fromString: tpl.barre.fromString,
              toString: tpl.barre.toString,
              finger: tpl.barre.finger,
            },
          ]
        : undefined,
    });
  }

  return results;
}

export function searchChordQuery(query: string): {
  rootPc: number;
  qualityId: string;
} | null {
  const clean = query.trim().toLowerCase().replace(/\s+/g, '');
  if (!clean) return null;

  // Match root first (2 chars like c#, bb, db, f# then 1 char)
  const sortedRoots = [...ROOT_OPTIONS].sort((a, b) => {
    const aMax = Math.max(...a.searchAliases.map((s) => s.length));
    const bMax = Math.max(...b.searchAliases.map((s) => s.length));
    return bMax - aMax;
  });

  let matchedRoot: number | null = null;
  let remainder = '';

  for (const r of sortedRoots) {
    for (const alias of r.searchAliases) {
      if (clean.startsWith(alias)) {
        matchedRoot = r.pc;
        remainder = clean.slice(alias.length);
        break;
      }
    }
    if (matchedRoot !== null) break;
  }

  if (matchedRoot === null) return null;

  const qualityAliases: Record<string, string> = {
    '': 'major',
    maj: 'major',
    major: 'major',
    m: 'minor',
    min: 'minor',
    minor: 'minor',
    '-': 'minor',
    '7': '7',
    dom7: '7',
    maj7: 'maj7',
    m7: 'm7',
    min7: 'm7',
    '-7': 'm7',
    sus4: 'sus4',
    sus: 'sus4',
    sus2: 'sus2',
    add9: 'add9',
    '6': '6',
    m6: 'm6',
    min6: 'm6',
    '9': '9',
    dim: 'dim',
    o: 'dim',
    dim7: 'dim7',
    o7: 'dim7',
    m7b5: 'm7b5',
    'm7♭5': 'm7b5',
    aug: 'aug',
    '+': 'aug',
    '5': '5',
  };

  const qId = qualityAliases[remainder];
  if (!qId) return { rootPc: matchedRoot, qualityId: 'major' };
  return { rootPc: matchedRoot, qualityId: qId };
}

const QUALITY_INTERVAL_SPECS: Record<
  string,
  { intervals: number[]; required: number[] }
> = {
  major: { intervals: [0, 4, 7], required: [0, 4, 7] },
  minor: { intervals: [0, 3, 7], required: [0, 3, 7] },
  '7': { intervals: [0, 4, 7, 10], required: [0, 4, 10] },
  maj7: { intervals: [0, 4, 7, 11], required: [0, 4, 11] },
  m7: { intervals: [0, 3, 7, 10], required: [0, 3, 10] },
  sus4: { intervals: [0, 5, 7], required: [0, 5, 7] },
  sus2: { intervals: [0, 2, 7], required: [0, 2, 7] },
  add9: { intervals: [0, 2, 4, 7], required: [0, 2, 4] },
  '6': { intervals: [0, 4, 7, 9], required: [0, 4, 9] },
  m6: { intervals: [0, 3, 7, 9], required: [0, 3, 9] },
  '9': { intervals: [0, 2, 4, 7, 10], required: [0, 2, 4, 10] },
  dim: { intervals: [0, 3, 6], required: [0, 3, 6] },
  dim7: { intervals: [0, 3, 6, 9], required: [0, 3, 6, 9] },
  m7b5: { intervals: [0, 3, 6, 10], required: [0, 3, 6, 10] },
  aug: { intervals: [0, 4, 8], required: [0, 4, 8] },
  '5': { intervals: [0, 7], required: [0, 7] },
};

/**
 * Discovers playable alternative fingerings and voicings for a root + quality
 * across the fretboard (respecting the active guitar tuning).
 */
export function findChordVariations(
  rootPc: number,
  qualityId: string,
  tuningMidi: number[],
  existingPresets: ChordVoicingPreset[] = [],
  limit = 8
): ChordVoicingPreset[] {
  const spec = QUALITY_INTERVAL_SPECS[qualityId] || QUALITY_INTERVAL_SPECS.major;
  const allowedPcs = new Set(spec.intervals.map((i) => (rootPc + i) % 12));
  const requiredPcs = spec.required.map((i) => (rootPc + i) % 12);

  const seenKeys = new Set<string>(
    existingPresets.map((p) => p.frets.map((f) => (f === null ? 'x' : f)).join(','))
  );

  // Contiguous string ranges to explore (full 6-str, 5-str A-root, 4-str shells, top-3 triads)
  const stringRanges: { start: number; end: number; tag: string }[] = [
    { start: 0, end: 5, tag: 'Full 6-String' },
    { start: 1, end: 5, tag: '5-String Voicing' },
    { start: 2, end: 5, tag: '4-String Top' },
    { start: 1, end: 4, tag: '4-String Mid' },
    { start: 3, end: 5, tag: 'Upper Triad' },
    { start: 2, end: 4, tag: 'Mid Triad' },
  ];

  interface ScoredCandidate {
    preset: ChordVoicingPreset;
    score: number;
    region: number; // 0: open/low (1-4), 1: mid (5-8), 2: upper (9-12)
  }

  const candidates: ScoredCandidate[] = [];

  for (const range of stringRanges) {
    for (let winStart = 1; winStart <= 11; winStart++) {
      const frets: (number | null)[] = [null, null, null, null, null, null];
      const stringOptions: number[][] = [];
      let validRange = true;

      for (let s = range.start; s <= range.end; s++) {
        const opts: number[] = [];
        const openPc = ((tuningMidi[s] % 12) + 12) % 12;
        if (winStart === 1 && allowedPcs.has(openPc)) {
          opts.push(0);
        }
        for (let f = winStart; f <= winStart + 3; f++) {
          const pc = ((tuningMidi[s] + f) % 12 + 12) % 12;
          if (allowedPcs.has(pc)) {
            opts.push(f);
          }
        }
        if (opts.length === 0) {
          validRange = false;
          break;
        }
        // Prefer root on lowest string of the range, otherwise lowest fret
        if (s === range.start) {
          opts.sort((a, b) => {
            const aRoot = ((tuningMidi[s] + a) % 12 + 12) % 12 === rootPc ? 0 : 1;
            const bRoot = ((tuningMidi[s] + b) % 12 + 12) % 12 === rootPc ? 0 : 1;
            return aRoot !== bRoot ? aRoot - bRoot : a - b;
          });
        }
        stringOptions.push(opts);
      }

      if (!validRange) continue;

      // Pick best single voicing inside this window by choosing greedy pitch-class diversity
      const pickedPcs = new Set<number>();
      for (let idx = 0; idx < stringOptions.length; idx++) {
        const s = range.start + idx;
        const opts = stringOptions[idx];
        // Choose option that adds an uncovered required pitch class first, or covered chord tone
        let bestFret = opts[0];
        let bestOptScore = -999;
        for (const f of opts) {
          const pc = ((tuningMidi[s] + f) % 12 + 12) % 12;
          let sc = 0;
          if (idx === 0 && pc === rootPc) sc += 30;
          if (requiredPcs.includes(pc) && !pickedPcs.has(pc)) sc += 25;
          else if (!pickedPcs.has(pc)) sc += 12;
          if (f === 0) sc += 4;
          // Prefer compact span relative to winStart
          sc -= (f === 0 ? 0 : f - winStart) * 1.5;
          if (sc > bestOptScore) {
            bestOptScore = sc;
            bestFret = f;
          }
        }
        frets[s] = bestFret;
        pickedPcs.add(((tuningMidi[s] + bestFret) % 12 + 12) % 12);
      }

      // Must contain all required pitch classes
      const hasAllReq = requiredPcs.every((req) => pickedPcs.has(req));
      if (!hasAllReq) continue;

      const key = frets.map((f) => (f === null ? 'x' : f)).join(',');
      if (seenKeys.has(key)) continue;

      const posFrets = frets.filter((f): f is number => f !== null && f > 0);
      const minPos = posFrets.length > 0 ? Math.min(...posFrets) : 0;
      const maxPos = posFrets.length > 0 ? Math.max(...posFrets) : 0;
      const span = posFrets.length > 0 ? maxPos - minPos : 0;
      if (span > 3) continue;

      // Check playability: max 4 distinct fingers unless a valid index barre at minPos covers extra notes
      const hasOpenInsideBarre = frets.some(
        (f, s) => s >= range.start && s <= range.end && f === 0
      );
      const atMinPos = frets.filter((f) => f === minPos).length;
      const aboveMinPos = posFrets.filter((f) => f > minPos).length;

      let barres: ChordVoicingPreset['barres'] = undefined;
      if (posFrets.length > 4) {
        if (!hasOpenInsideBarre && atMinPos >= 2 && aboveMinPos <= 3 && minPos > 0) {
          const barreStrings = frets
            .map((f, s) => (f === minPos ? s : -1))
            .filter((s) => s >= 0);
          barres = [
            {
              fret: minPos,
              fromString: Math.min(...barreStrings),
              toString: Math.max(...barreStrings),
              finger: '1',
            },
          ];
        } else {
          continue; // Unplayable without barre
        }
      }

      // Assign fingers cleanly
      const fingers: FingerLabel[] = ['', '', '', '', '', ''];
      if (barres && barres.length > 0) {
        const barreFret = barres[0].fret;
        let nextF = 2;
        const order = frets
          .map((f, s) => ({ f, s }))
          .filter((item) => item.f !== null && item.f > 0)
          .sort((a, b) => (a.f! !== b.f! ? a.f! - b.f! : a.s - b.s));
        for (const item of order) {
          if (item.f === barreFret) {
            fingers[item.s] = '1';
          } else {
            fingers[item.s] = String(Math.min(4, nextF++)) as FingerLabel;
          }
        }
      } else {
        let nextF = 1;
        const order = frets
          .map((f, s) => ({ f, s }))
          .filter((item) => item.f !== null && item.f > 0)
          .sort((a, b) => (a.f! !== b.f! ? a.f! - b.f! : a.s - b.s));
        for (const item of order) {
          fingers[item.s] = String(Math.min(4, nextF++)) as FingerLabel;
        }
      }

      const bassFret = frets[range.start]!;
      const bassPc = ((tuningMidi[range.start] + bassFret) % 12 + 12) % 12;
      const isRootBass = bassPc === rootPc;

      let score = 0;
      if (isRootBass) score += 35;
      score += (range.end - range.start + 1) * 4;
      score -= span * 4;
      if (winStart === 1 && hasOpenInsideBarre) score += 10;
      if (barres) score -= 3;

      const baseFret = maxPos <= 4 ? 1 : minPos;
      const region = minPos <= 4 ? 0 : minPos <= 8 ? 1 : 2;
      const level: ChordVoicingPreset['level'] = barres
        ? 'Barre'
        : hasOpenInsideBarre
          ? 'Open'
          : range.end - range.start <= 3
            ? 'Easy'
            : 'Movable';

      seenKeys.add(key);
      candidates.push({
        score,
        region,
        preset: {
          id: `var-${rootPc}-${qualityId}-${range.start}-${range.end}-${winStart}-${key}`,
          label: `${range.tag}${isRootBass ? '' : ' (Inv)'} · Fr ${minPos || 'Open'}`,
          level,
          baseFret,
          frets,
          fingers,
          barres,
        },
      });
    }
  }

  // Pick top diverse variations across neck regions
  candidates.sort((a, b) => b.score - a.score);
  const picked: ChordVoicingPreset[] = [];
  for (const region of [0, 1, 2]) {
    const regionItems = candidates.filter((c) => c.region === region);
    for (let i = 0; i < Math.min(3, regionItems.length); i++) {
      if (picked.length < limit) {
        picked.push(regionItems[i].preset);
      }
    }
  }
  for (const c of candidates) {
    if (picked.length >= limit) break;
    if (!picked.some((p) => p.id === c.preset.id)) {
      picked.push(c.preset);
    }
  }

  return picked;
}
