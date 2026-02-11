/**
 * useAvailableBassNotes Hook
 * Calculates available bass notes based on selected scales
 * Feature-specific, not reusable
 */

import { useMemo } from 'react';
import type { ChordState } from '../../music/chordProgression';
import type { Catalog } from '../../types/catalog';
import { getPitchClassFromNote } from '../../music/notes';

interface UseAvailableBassNotesOptions {
  draft: ChordState | null;
  catalog: Catalog | null;
  accidentalPreference: 'sharps' | 'flats';
}

/**
 * Calculate available bass notes from selected scales
 * Returns all 12 notes if no scales selected, or intersection of scale notes if scales are selected
 */
export function useAvailableBassNotes(options: UseAvailableBassNotesOptions): string[] {
  const { draft, catalog, accidentalPreference } = options;

  return useMemo(() => {
    const noteNames = accidentalPreference === 'sharps'
      ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
      : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

    // If no scales selected, show all notes
    if (!draft?.s1 && !draft?.s2) {
      return noteNames;
    }

    if (!catalog) return [];

    const getScaleNotes = (root: string, scaleName: string): Set<number> => {
      const scaleType = catalog.scaleTypes.find(st => st.name === scaleName);
      if (!scaleType) return new Set();

      const rootPitchClass = getPitchClassFromNote(root);
      if (rootPitchClass === -1) return new Set();

      const pitchClasses = new Set<number>();
      for (const interval of scaleType.intervals) {
        pitchClasses.add((rootPitchClass + interval) % 12);
      }
      return pitchClasses;
    };

    // Get pitch classes from both scales
    const s1Notes = draft.s1 ? getScaleNotes(draft.s1.root, draft.s1.scale) : null;
    const s2Notes = draft.s2 ? getScaleNotes(draft.s2.root, draft.s2.scale) : null;

    // If both scales selected, get intersection; otherwise use the selected scale
    let availablePitchClasses: Set<number>;
    if (s1Notes && s2Notes) {
      // Intersection of both scales
      availablePitchClasses = new Set([...s1Notes].filter(pc => s2Notes.has(pc)));
    } else if (s1Notes) {
      availablePitchClasses = s1Notes;
    } else if (s2Notes) {
      availablePitchClasses = s2Notes;
    } else {
      return noteNames; // Fallback to all notes
    }

    // Convert pitch classes to note names
    return Array.from(availablePitchClasses)
      .sort((a, b) => a - b)
      .map(pc => noteNames[pc]);
  }, [draft?.s1, draft?.s2, catalog, accidentalPreference]);
}
