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
