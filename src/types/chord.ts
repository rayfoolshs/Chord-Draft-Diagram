export type FingerLabel = '' | '1' | '2' | '3' | '4' | 'T';

export interface StringState {
  /** Absolute fret number: 0 = open, >= 1 = fretted, null when muted */
  fret: number | null;
  muted: boolean;
  finger: FingerLabel;
}

export interface BarreDef {
  id: string;
  fret: number;
  /** String index 0 (6th/low E) to 5 (1st/high E) */
  fromString: number;
  toString: number;
  finger: FingerLabel;
}

export type DotLabelMode = 'finger' | 'note' | 'interval' | 'none';
export type DiagramOrientation = 'vertical' | 'horizontal';
export type DiagramThemeId = 'classic' | 'parchment' | 'slate' | 'cobalt';
export type GuitarTone =
  | 'acoustic_guitar_nylon'
  | 'acoustic_guitar_steel'
  | 'electric_guitar_jazz'
  | 'electric_guitar_clean'
  | 'electric_guitar_muted'
  | 'overdriven_guitar'
  | 'distortion_guitar'
  | 'guitar_harmonics';
export type FingerTool = 'auto' | '1' | '2' | '3' | '4' | 'T' | 'barre' | 'erase';

export interface TuningPreset {
  id: string;
  name: string;
  shortLabel: string;
  midi: number[];
}

export interface ChordDiagramConfig {
  title: string;
  subtitle: string;
  syncTitleWithDetected: boolean;
  /** Length 6: index 0 = lowest string (6th), index 5 = highest string (1st) */
  strings: StringState[];
  barres: BarreDef[];
  baseFret: number;
  fretCount: number;
  tuningId: string;
  customTuningMidi: number[];
  handedness: 'right' | 'left';
  orientation: DiagramOrientation;
  dotLabelMode: DotLabelMode;
  showTuningLabels: boolean;
  showChordTitle: boolean;
  showIntervalsFooter: boolean;
  theme: DiagramThemeId;
  accentColor: string;
}

export interface StringTheoryInfo {
  stringIndex: number;
  openMidi: number;
  openNoteName: string;
  midi: number | null;
  noteName: string;
  noteWithOctave: string;
  interval: string;
  isRoot: boolean;
  muted: boolean;
  fret: number | null;
}

export interface DetectedChord {
  name: string;
  shortName: string;
  rootName: string;
  qualityName: string;
  bassName: string;
  isSlash: boolean;
  formula: string;
  description: string;
  alternatives: { name: string; shortName: string }[];
  stringNotes: StringTheoryInfo[];
  pitchClasses: number[];
}

export interface ChordVoicingPreset {
  id: string;
  label: string;
  level: 'Open' | 'Barre' | 'Movable' | 'Easy';
  baseFret: number;
  frets: (number | null)[]; // null = muted, 0 = open, >= 1 = absolute fret
  fingers: FingerLabel[];
  barres?: Omit<BarreDef, 'id'>[];
}

export interface SavedChordSlot {
  id: string;
  config: ChordDiagramConfig;
  detectedShortName: string;
}
