import type { Chord } from './chordParser';
import { parseChord } from './chordParser';

export interface ChordState {
  chord: Chord | null;
  mode1?: string;
  mode2?: string;
  saved?: boolean;
}

export interface ChordSequence {
  states: ChordState[];
}

/**
 * Get possible next chords for a given state.
 * For now, returns all common chords without any rules.
 */
export function getPossibleNextChords(state: ChordState): Chord[] {
  // Common chord progression chords (no rules yet, just all possibilities)
  const commonChordSymbols = [
    'C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim',
    'C7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5',
    'D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim',
    'E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim',
  ];

  // Parse all chords
  const chords: Chord[] = [];
  for (const symbol of commonChordSymbols) {
    try {
      const chord = parseChord(symbol);
      if (chord) {
        chords.push(chord);
      }
    } catch {
      // Skip invalid chords
    }
  }

  return chords;
}

/**
 * Create a new chord state
 */
export function createChordState(chordSymbol: string | null, saved: boolean = false): ChordState {
  const chord = chordSymbol ? parseChord(chordSymbol) : null;
  if (chordSymbol && !chord) {
    throw new Error(`Invalid chord symbol: ${chordSymbol}`);
  }
  return {
    chord,
    mode1: undefined,
    mode2: undefined,
    saved,
  };
}

/**
 * Create an empty chord state (no chord selected)
 */
export function createEmptyChordState(): ChordState {
  return {
    chord: null,
    mode1: undefined,
    mode2: undefined,
    saved: false,
  };
}

/**
 * Convert chord pitch classes to note names
 */
export function chordToNotes(chord: Chord | null): string[] {
  if (!chord) return [];
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return Array.from(chord.pitchClasses).map(pc => noteNames[pc]);
}

/**
 * Add a chord to the sequence
 */
export function addChordToSequence(
  sequence: ChordSequence,
  chordSymbol: string
): ChordSequence {
  const newState = createChordState(chordSymbol);
  return {
    states: [...sequence.states, newState],
  };
}

/**
 * Remove the last chord from the sequence
 */
export function removeLastChord(sequence: ChordSequence): ChordSequence {
  return {
    states: sequence.states.slice(0, -1),
  };
}

/**
 * Create an empty sequence
 */
export function createEmptySequence(): ChordSequence {
  return {
    states: [],
  };
}
