/**
 * useChordGrouping Hook
 * Manages chord generation, grouping by root, and scale-based filtering
 */

import { useMemo } from 'react';
import { parseChord, type Chord } from '../music/chordParser';
import { chordFitsInAllScales } from '../music/chordScaleChecker';
import type { ScaleType } from '../types/catalog';

// Chord quality groups
export const CHORD_GROUPS = {
  'Triads': ['', 'm', 'dim', 'aug', 'sus2', 'sus4'],
  'Seventh Chords': ['maj7', 'm7', '7', 'dim7', 'm7b5', 'mmaj7', 'aug7', '7sus4'],
  'Sixth Chords': ['6', 'm6'],
} as const;

export const QUALITY_LABELS: Record<string, string> = {
  '': 'Major',
  'm': 'Minor',
  'dim': 'Diminished',
  'aug': 'Augmented',
  'sus2': 'Sus2',
  'sus4': 'Sus4',
  'maj7': 'Major 7th',
  'm7': 'Minor 7th',
  '7': 'Dominant 7th',
  'dim7': 'Diminished 7th',
  'm7b5': 'Half Diminished',
  'mmaj7': 'Minor Major 7th',
  'aug7': 'Augmented 7th',
  '7sus4': '7sus4',
  '6': 'Major 6th',
  'm6': 'Minor 6th',
};

interface UseChordGroupingOptions {
  noteNames: readonly string[];
  selectedScales?: Array<{ scale: string; root: string }>;
  scaleTypes?: ScaleType[];
}

interface UseChordGroupingReturn {
  chordsByRoot: Record<string, Chord[]>;
  generateChord: (root: string, quality: string) => Chord | null;
  shouldShowChord: (chord: Chord | null) => boolean;
}

/**
 * Generate a chord from root and quality
 */
function generateChord(root: string, quality: string): Chord | null {
  const chordSymbol = `${root}${quality}`;
  return parseChord(chordSymbol);
}

export function useChordGrouping(options: UseChordGroupingOptions): UseChordGroupingReturn {
  const { noteNames, selectedScales = [], scaleTypes = [] } = options;

  /**
   * Check if a chord should be shown based on scale filter
   * Chord must fit in ALL selected scales (AND logic)
   */
  const shouldShowChord = (chord: Chord | null): boolean => {
    if (!chord) return false;
    if (selectedScales.length === 0) return true;
    return chordFitsInAllScales(chord, selectedScales, scaleTypes);
  };

  /**
   * Generate all chords grouped by root note
   */
  const chordsByRoot = useMemo(() => {
    const result: Record<string, Chord[]> = {};

    noteNames.forEach((root) => {
      const chords: Chord[] = [];

      // Generate all chord qualities for this root
      Object.values(CHORD_GROUPS).flat().forEach((quality) => {
        const chord = generateChord(root, quality);
        if (chord && shouldShowChord(chord)) {
          chords.push(chord);
        }
      });

      // Only include root if it has chords
      if (chords.length > 0) {
        result[root] = chords;
      }
    });

    return result;
  }, [noteNames, selectedScales, scaleTypes]);

  return {
    chordsByRoot,
    generateChord,
    shouldShowChord,
  };
}
