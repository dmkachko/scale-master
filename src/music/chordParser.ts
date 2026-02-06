/**
 * Chord Parser - Parse chord symbols into pitch class sets
 */

import { getPitchClassFromNote } from './notes';

export interface Chord {
  root: string;
  rootPitchClass: number;
  quality: string;
  pitchClasses: Set<number>;
  displayName: string;
  bass?: string; // Optional bass note for slash chords (e.g., "E" in "C/E")
  bassPitchClass?: number;
}

export interface ParseChordsResult {
  chords: Chord[];
  errors: string[];
  allPitchClasses: Set<number>;
}

/**
 * Chord quality definitions
 * Each quality maps to intervals from root (in semitones)
 */
const CHORD_QUALITIES: Record<string, { intervals: number[]; displaySuffix: string }> = {
  // Triads
  '': { intervals: [0, 4, 7], displaySuffix: '' }, // Major
  'm': { intervals: [0, 3, 7], displaySuffix: 'm' }, // Minor
  'dim': { intervals: [0, 3, 6], displaySuffix: 'dim' }, // Diminished
  'aug': { intervals: [0, 4, 8], displaySuffix: 'aug' }, // Augmented
  'sus2': { intervals: [0, 2, 7], displaySuffix: 'sus2' }, // Suspended 2nd
  'sus4': { intervals: [0, 5, 7], displaySuffix: 'sus4' }, // Suspended 4th

  // 7th chords
  'maj7': { intervals: [0, 4, 7, 11], displaySuffix: 'maj7' }, // Major 7th
  'm7': { intervals: [0, 3, 7, 10], displaySuffix: 'm7' }, // Minor 7th
  'dim7': { intervals: [0, 3, 6, 9], displaySuffix: 'dim7' }, // Diminished 7th
  '7': { intervals: [0, 4, 7, 10], displaySuffix: '7' }, // Dominant 7th
  'mmaj7': { intervals: [0, 3, 7, 11], displaySuffix: 'mmaj7' }, // Minor major 7th
  'm7b5': { intervals: [0, 3, 6, 10], displaySuffix: 'ø7' }, // Half-diminished
  'aug7': { intervals: [0, 4, 8, 10], displaySuffix: 'aug7' }, // Augmented 7th
  '7sus4': { intervals: [0, 5, 7, 10], displaySuffix: '7sus4' }, // Dominant 7 sus4

  // 6th chords
  '6': { intervals: [0, 4, 7, 9], displaySuffix: '6' }, // Major 6th
  'm6': { intervals: [0, 3, 7, 9], displaySuffix: 'm6' }, // Minor 6th
};

/**
 * Parse a single chord symbol
 * @param chordSymbol - e.g., "C", "Am", "F#maj7", "Bbdim7", "C/E" (slash chord)
 * @returns Chord object or null if invalid
 */
export function parseChord(chordSymbol: string): Chord | null {
  const trimmed = chordSymbol.trim();
  if (!trimmed) return null;

  // Check for slash chord notation (e.g., "C/E", "Dm7/G")
  let bassNote: string | undefined;
  let bassPitchClass: number | undefined;
  let chordPart = trimmed;

  const slashMatch = trimmed.match(/^(.+)\/([A-G][#b♯♭]?)$/i);
  if (slashMatch) {
    chordPart = slashMatch[1].trim();
    const bassLetter = slashMatch[2][0].toUpperCase();
    const bassAccidental = slashMatch[2].slice(1);

    // Normalize bass accidental
    let normalizedBassAccidental = '';
    if (bassAccidental === '#' || bassAccidental === '♯') {
      normalizedBassAccidental = '#';
    } else if (bassAccidental === 'b' || bassAccidental === '♭') {
      normalizedBassAccidental = 'b';
    }

    bassNote = bassLetter + normalizedBassAccidental;
    bassPitchClass = getPitchClassFromNote(bassNote);

    if (bassPitchClass === -1 || bassPitchClass === undefined) {
      return null;
    }
  }

  // Match chord pattern: root note + optional quality
  // Root: A-G + optional accidental (#, b, ♯, ♭)
  // Quality: everything else (m, maj7, dim7, etc.)
  const match = chordPart.match(/^([A-G])([#b♯♭]?)(.*)$/i);

  if (!match) return null;

  const [, letter, accidental, qualityStr] = match;

  // Normalize accidental
  let normalizedAccidental = '';
  if (accidental === '#' || accidental === '♯') {
    normalizedAccidental = '#';
  } else if (accidental === 'b' || accidental === '♭') {
    normalizedAccidental = 'b';
  }

  const root = letter.toUpperCase() + normalizedAccidental;
  const rootPitchClass = getPitchClassFromNote(root);

  if (rootPitchClass === -1 || rootPitchClass === undefined) {
    return null;
  }

  // Normalize quality string (lowercase for matching, handle aliases)
  let quality = qualityStr.toLowerCase().trim();

  // Handle common aliases
  const qualityAliases: Record<string, string> = {
    'min': 'm',
    'minor': 'm',
    'maj': '', // major without 7 is just major triad
    'major': '',
    'diminished': 'dim',
    'augmented': 'aug',
    'dominant': '7',
    'dom': '7',
    '-': 'm',
    'mi': 'm',
    'Δ': 'maj7',
    'ø': 'm7b5',
    '°': 'dim',
    '+': 'aug',
  };

  quality = qualityAliases[quality] ?? quality;

  // Look up chord quality
  const chordQuality = CHORD_QUALITIES[quality];
  if (!chordQuality) {
    return null;
  }

  // Calculate pitch classes for this chord
  const pitchClasses = new Set<number>();
  for (const interval of chordQuality.intervals) {
    pitchClasses.add((rootPitchClass + interval) % 12);
  }

  // Add bass note to pitch classes if it's not already in the chord
  if (bassNote && bassPitchClass !== undefined) {
    pitchClasses.add(bassPitchClass);
  }

  const displayName = root + chordQuality.displaySuffix + (bassNote ? `/${bassNote}` : '');

  return {
    root,
    rootPitchClass,
    quality: quality || 'major',
    pitchClasses,
    displayName,
    bass: bassNote,
    bassPitchClass,
  };
}

/**
 * Parse multiple chord symbols from input string
 * @param input - e.g., "C Am F G" or "C, Am, F, G"
 * @returns Object with parsed chords, errors, and combined pitch classes
 */
export function parseChords(input: string): ParseChordsResult {
  const errors: string[] = [];
  const chords: Chord[] = [];
  const allPitchClasses = new Set<number>();

  if (!input || input.trim() === '') {
    return { chords: [], errors: [], allPitchClasses: new Set() };
  }

  // Split by comma or whitespace
  const tokens = input
    .split(/[\s,]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);

  for (const token of tokens) {
    const chord = parseChord(token);

    if (!chord) {
      errors.push(`Invalid chord: "${token}"`);
      continue;
    }

    chords.push(chord);

    // Add all pitch classes from this chord to the combined set
    for (const pc of chord.pitchClasses) {
      allPitchClasses.add(pc);
    }
  }

  return { chords, errors, allPitchClasses };
}

/**
 * Get a helpful list of supported chord types
 */
export function getSupportedChordTypes(): string[] {
  return [
    'Major triads: C, D, E, etc.',
    'Minor triads: Cm, Dm, Em, etc.',
    'Diminished: Cdim, Ddim, etc.',
    'Augmented: Caug, Daug, etc.',
    'Suspended: Csus2, Dsus4, etc.',
    'Major 7th: Cmaj7, Dmaj7, etc.',
    'Minor 7th: Cm7, Dm7, etc.',
    'Dominant 7th: C7, D7, etc.',
    'Diminished 7th: Cdim7, Ddim7, etc.',
    'Half-diminished: Cm7b5, Dm7b5, etc.',
    'Major 6th: C6, D6, etc.',
    'Minor 6th: Cm6, Dm6, etc.',
    'Minor major 7th: Cmmaj7, Dmmaj7, etc.',
  ];
}
