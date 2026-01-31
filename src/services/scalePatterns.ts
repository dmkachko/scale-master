/**
 * Scale Playback Patterns
 * Patterns defined as step numbers:
 * - 1-7: scale degrees (notes from the scale)
 * - 8: octave higher tonic
 * - 0: pause/silence
 */

export type ScalePattern = 'ascending' | 'descending' | 'alternating' | 'ladder';

export interface PatternDescriptor {
  id: ScalePattern;
  name: string;
  steps: number[];
}

/**
 * Pattern definitions using step numbers
 */
export const patterns: Record<ScalePattern, PatternDescriptor> = {
  ascending: {
    id: 'ascending',
    name: 'Ascending',
    steps: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  descending: {
    id: 'descending',
    name: 'Descending',
    steps: [8, 7, 6, 5, 4, 3, 2, 1],
  },
  alternating: {
    id: 'alternating',
    name: 'Alternating',
    steps: [1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1],
  },
  ladder: {
    id: 'ladder',
    name: 'Ladder',
    steps: [1, 2, 3, 2, 3, 4, 5, 4, 5, 6, 7, 6, 7, 8, 7, 6, 7, 6 ,5, 4, 5, 4, 3, 2, 3, 2, 1],
  },
};

/**
 * Convert step-based pattern to note sequence
 * @param notes - Array of scale notes (root to leading tone)
 * @param pattern - Pattern to apply
 * @returns Array of note names with octave information
 */
export function generateNoteSequence(notes: string[], pattern: ScalePattern): Array<{ note: string; octaveOffset: number }> {
  const descriptor = patterns[pattern];

  return descriptor.steps.map((step) => {
    if (step === 0) {
      // Pause/silence
      return { note: '', octaveOffset: 0 };
    } else if (step === 8) {
      // Octave higher tonic
      return { note: notes[0], octaveOffset: 1 };
    } else {
      // Regular scale degree (1-7)
      return { note: notes[step - 1], octaveOffset: 0 };
    }
  });
}
