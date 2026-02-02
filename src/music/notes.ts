/**
 * Music Theory - Note Utilities
 * Handles note naming, pitch class conversion, and note spelling
 */

// Note names using sharps
export const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Note names using flats
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Gets the note name for a pitch class
 */
export function getNoteName(pitchClass: number, preferSharps = true): string {
  const noteNames = preferSharps ? NOTE_NAMES_SHARP : NOTE_NAMES_FLAT;
  return noteNames[pitchClass];
}

/**
 * Calculates the notes in a scale given a root and intervals
 */
export function calculateScaleNotes(root: number, intervals: number[], preferSharps = true): string[] {
  return intervals.map((interval: number) => {
    const pitchClass = (root + interval) % 12;
    return getNoteName(pitchClass, preferSharps);
  });
}

/**
 * Gets pitch class (0-11) from note name
 */
export function getPitchClassFromNote(note: string): number {
  const noteMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1,
    'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4,
    'F': 5, 'F#': 6, 'Gb': 6,
    'G': 7, 'G#': 8, 'Ab': 8,
    'A': 9, 'A#': 10, 'Bb': 10,
    'B': 11
  };
  return noteMap[note] ?? 0;
}

/**
 * Adds proper octave numbers to note names, accounting for chromatic wrapping
 * @param notes - Array of note names without octaves (e.g., ["A", "B", "C", "D"])
 * @param baseOctave - Starting octave number (default: 4)
 * @returns Array of notes with octaves (e.g., ["A4", "B4", "C5", "D5"])
 */
export function addOctavesToNotes(notes: string[], baseOctave: number = 4): string[] {
  if (notes.length === 0) return [];

  const rootPitchClass = getPitchClassFromNote(notes[0]);
  let currentOctave = baseOctave;
  let prevPitchClass = rootPitchClass;

  return notes.map((note, i) => {
    const pitchClass = getPitchClassFromNote(note);

    // If pitch class decreased (wrapped around chromatically), increment octave
    if (i > 0 && pitchClass < prevPitchClass) {
      currentOctave++;
    }

    prevPitchClass = pitchClass;
    return `${note}${currentOctave}`;
  });
}

/**
 * Result of parsing note input
 */
export interface ParseNotesResult {
  notes: string[];
  pitchClasses: Set<number>;
  errors: string[];
}

/**
 * Parse note input string into array of note names and pitch classes
 * Supports formats: "C E G", "C, E, G", "C# Eb G", "C#,Eb,G"
 * @param input - User input string with note names
 * @returns Object with parsed notes, pitch classes (deduplicated), and any errors
 */
export function parseNotes(input: string): ParseNotesResult {
  const errors: string[] = [];
  const notes: string[] = [];
  const pitchClasses = new Set<number>();

  if (!input || input.trim() === '') {
    return { notes: [], pitchClasses: new Set(), errors: [] };
  }

  // Split by comma or whitespace
  const tokens = input
    .split(/[\s,]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);

  for (const token of tokens) {
    // Match note pattern: A-G, optional accidental (#, b, ♯, ♭), optional octave (ignored)
    const match = token.match(/^([A-G])([#b♯♭])?(\d+)?$/i);

    if (!match) {
      errors.push(`Invalid note: "${token}"`);
      continue;
    }

    const [, letter, accidental] = match;

    // Normalize accidental symbols
    let normalizedAccidental = '';
    if (accidental === '#' || accidental === '♯') {
      normalizedAccidental = '#';
    } else if (accidental === 'b' || accidental === '♭') {
      normalizedAccidental = 'b';
    }

    const noteName = letter.toUpperCase() + normalizedAccidental;
    const pitchClass = getPitchClassFromNote(noteName);

    if (pitchClass === -1 || pitchClass === undefined) {
      errors.push(`Invalid note: "${token}"`);
      continue;
    }

    // Only add if not already present (deduplicate enharmonics)
    if (!pitchClasses.has(pitchClass)) {
      notes.push(noteName);
      pitchClasses.add(pitchClass);
    }
  }

  return { notes, pitchClasses, errors };
}
