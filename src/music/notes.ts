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
