/**
 * Scale Playback Patterns
 * Patterns defined as step numbers:
 * - 1-N: scale degrees (notes from the scale, where N is the number of notes)
 * - N+1: octave higher tonic
 * - 0: pause/silence
 */

export type ScalePattern = 'ascending' | 'descending' | 'alternating' | 'ladder';

export interface PatternDescriptor {
  id: ScalePattern;
  name: string;
}

/**
 * Pattern definitions (names only - steps are generated dynamically)
 */
export const patterns: Record<ScalePattern, PatternDescriptor> = {
  ascending: {
    id: 'ascending',
    name: 'Asc',
  },
  descending: {
    id: 'descending',
    name: 'Desc',
  },
  alternating: {
    id: 'alternating',
    name: 'Alt',
  },
  ladder: {
    id: 'ladder',
    name: 'Ladder',
  },
};

/**
 * Generate pattern steps based on scale length
 * @param scaleLength - Number of notes in the scale
 * @param pattern - Pattern type
 * @returns Array of step numbers
 */
function generatePatternSteps(scaleLength: number, pattern: ScalePattern): number[] {
  const octave = scaleLength + 1;

  switch (pattern) {
    case 'ascending': {
      // 1, 2, 3, ..., N, N+1
      return Array.from({ length: scaleLength + 1 }, (_, i) => i + 1);
    }

    case 'descending': {
      // N+1, N, ..., 3, 2, 1
      return Array.from({ length: scaleLength + 1 }, (_, i) => octave - i);
    }

    case 'alternating': {
      // 1, 2, 3, ..., N, N+1, N, ..., 3, 2, 1
      const ascending = Array.from({ length: scaleLength + 1 }, (_, i) => i + 1);
      const descending = Array.from({ length: scaleLength }, (_, i) => scaleLength - i);
      return [...ascending, ...descending];
    }

    case 'ladder': {
      // 1, 2, 1, 2, 3, 2, 3, 4, 3, 4, 5, ..., N, N+1, N, N-1, N, N-1, N-2, ..., 2, 1
      const steps: number[] = [];

      // Ascending ladder: each note and the next, then back
      for (let i = 1; i < octave; i++) {
        steps.push(i, i + 1);
      }

      // Descending ladder: each note and the previous, going down
      for (let i = scaleLength; i > 1; i--) {
        steps.push(i, i - 1);
      }
      steps.push(1);

      return steps;
    }
  }
}

/**
 * Convert step-based pattern to note sequence
 * @param notes - Array of scale notes (root to last degree)
 * @param pattern - Pattern to apply
 * @param rootPitchClass - Optional root pitch class (0-11) for calculating octave wrapping
 * @returns Array of note names with octave information
 */
export function generateNoteSequence(
  notes: string[],
  pattern: ScalePattern,
  rootPitchClass?: number
): Array<{ note: string; octaveOffset: number }> {
  const scaleLength = notes.length;
  const steps = generatePatternSteps(scaleLength, pattern);
  const octave = scaleLength + 1;

  // Calculate octave offsets for each note based on pitch class
  const noteOctaveOffsets: number[] = [];
  if (rootPitchClass !== undefined) {
    let currentOctaveOffset = 0;
    let prevPitchClass = rootPitchClass;

    for (let i = 0; i < notes.length; i++) {
      const pitchClass = getPitchClassFromNote(notes[i]);

      // If pitch class decreased (wrapped around), increment octave
      if (i > 0 && pitchClass < prevPitchClass) {
        currentOctaveOffset++;
      }

      noteOctaveOffsets.push(currentOctaveOffset);
      prevPitchClass = pitchClass;
    }
  } else {
    // No pitch class info, assume all notes are in the same octave
    noteOctaveOffsets.fill(0, 0, notes.length);
  }

  return steps.map((step) => {
    if (step === 0) {
      // Pause/silence
      return { note: '', octaveOffset: 0 };
    } else if (step === octave) {
      // Octave higher tonic
      return { note: notes[0], octaveOffset: noteOctaveOffsets[0] + 1 };
    } else {
      // Regular scale degree (1-N)
      const noteIndex = step - 1;
      return {
        note: notes[noteIndex],
        octaveOffset: noteOctaveOffsets[noteIndex]
      };
    }
  });
}

import { getPitchClassFromNote } from '../music/notes';
