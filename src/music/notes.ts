/**
 * Music Theory - Note Utilities
 * Facade over Note entity for backward compatibility
 * @deprecated Use Note entity from './entities/Note' directly for new code
 */

import { Note } from './entities/Note';

// Note names using sharps - re-export from Note entity
export const NOTE_NAMES_SHARP = Note.NOTE_NAMES_SHARP;

// Note names using flats - re-export from Note entity
export const NOTE_NAMES_FLAT = Note.NOTE_NAMES_FLAT;

/**
 * Gets the note name for a pitch class
 */
export function getNoteName(pitchClass: number, preferSharps = true): string {
  return Note.getNoteName(pitchClass, preferSharps);
}

/**
 * Calculates the notes in a scale given a root and intervals
 */
export function calculateScaleNotes(root: number, intervals: number[], preferSharps = true): string[] {
  return intervals.map((interval: number) => {
    const pitchClass = (root + interval) % 12;
    return Note.getNoteName(pitchClass, preferSharps);
  });
}

/**
 * Gets pitch class (0-11) from note name
 */
export function getPitchClassFromNote(note: string): number {
  return Note.NOTE_TO_PITCH_CLASS[note] ?? 0;
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
  const result = Note.parseNotes(input);
  return {
    notes: result.notes.map(note => note.name),
    pitchClasses: new Set(result.notes.map(note => note.pitchClass)),
    errors: result.errors,
  };
}
