import type { Chord } from './chordParser';
import { parseChord } from './chordParser';
import { calculateScaleNotes } from './notes';
import { calculateTriads, getTriadAbbreviation } from './triads';
import { getPitchClassFromNote } from './notes';
import { useCatalogStore } from '../store/catalogStore';

export interface ChordState {
  chord: Chord | null;
  s1?: {scale: string; root: string};
  s2?: {scale: string; root: string};
  saved?: boolean;
  beats?: number; // Duration in beats (1-6, default 4)
}

export interface ChordSequence {
  states: ChordState[];
}

/**
 * Get chords for a given scale using the catalog
 */
function getChordsForScale(scaleName: string, root: string): Chord[] {
  const catalogState = useCatalogStore.getState();
  const { catalog } = catalogState;

  if (!catalog) {
    return [];
  }

  // Find scale type by name
  const scaleType = catalog.scaleTypes.find(st =>
    st.name.toLowerCase() === scaleName.toLowerCase()
  );

  if (!scaleType) {
    return [];
  }

  const rootPitchClass = getPitchClassFromNote(root);
  const scaleNotes = calculateScaleNotes(rootPitchClass, scaleType.intervals, true);
  const triads = calculateTriads(scaleNotes, scaleType.intervals);

  const chords: Chord[] = [];
  for (const triad of triads) {
    const chordSymbol = getTriadAbbreviation(triad.root, triad.quality);
    try {
      const chord = parseChord(chordSymbol);
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
 * Get possible next chords for a given state.
 * Filters by the current scale (s1).
 */
export function getPossibleNextChords(state: ChordState): Chord[] {
  // Use s1 scale to filter chords
  if (state.s1) {
    return getChordsForScale(state.s1.scale, state.s1.root);
  }

  // Fallback to C Major if no scale is set
  return getChordsForScale('Major', 'C');
}

/**
 * Create a new chord state
 */
export function createChordState(chordSymbol: string | null, saved: boolean = false, s1?: {scale: string; root: string}): ChordState {
  const chord = chordSymbol ? parseChord(chordSymbol) : null;
  if (chordSymbol && !chord) {
    throw new Error(`Invalid chord symbol: ${chordSymbol}`);
  }
  return {
    chord,
    s1,
    s2: undefined,
    saved,
    beats: 4,
  };
}

/**
 * Create an empty chord state (no chord selected)
 */
export function createEmptyChordState(): ChordState {
  return {
    chord: null,
    s1: undefined,
    s2: undefined,
    saved: false,
    beats: 4,
  };
}

/**
 * Convert chord pitch classes to note names
 */
export function chordToNotes(chord: Chord | null): string[] {
  if (!chord) return [];

  // Check if pitchClasses is valid (might be empty after deserialization)
  if (!chord.pitchClasses || !(chord.pitchClasses instanceof Set) || chord.pitchClasses.size === 0) {
    // Reconstruct chord from displayName
    const reconstructed = parseChord(chord.displayName);
    if (!reconstructed) return [];
    chord = reconstructed;
  }

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
