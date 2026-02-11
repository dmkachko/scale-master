/**
 * Scale Finder - Find scales containing a given set of notes
 * Refactored to use Scale entity
 */

import type { ScaleType } from '../types/catalog';
import { Scale } from './entities/Scale';
import { Note } from './entities/Note';

export interface ScaleMatch {
  scaleType: ScaleType;
  root: number; // pitch class 0-11
  rootNoteName: string;
  scaleNotes: string[];
  scalePitchClasses: Set<number>;
  extraNotesCount: number;
  matchedNotes: string[];
}

/**
 * Find all scales that contain the given pitch classes
 * @param inputPitchClasses - Set of pitch classes (0-11) to search for
 * @param scaleTypes - Array of all scale types from catalog
 * @param preferSharps - Whether to spell notes with sharps or flats
 * @returns Array of matching scales, sorted by fewest extra notes
 */
export function findScalesContaining(
  inputPitchClasses: Set<number>,
  scaleTypes: ScaleType[],
  preferSharps: boolean = true
): ScaleMatch[] {
  const matches: ScaleMatch[] = [];

  // Empty input returns no matches
  if (inputPitchClasses.size === 0) {
    return [];
  }

  // Check each scale type with each possible root
  for (const scaleType of scaleTypes) {
    for (let rootPitchClass = 0; rootPitchClass < 12; rootPitchClass++) {
      // Create Scale entity for this root
      const rootNote = Note.fromPitchClass(rootPitchClass, preferSharps);
      const scale = Scale.fromType(scaleType, rootNote);

      // Check if scale contains all input pitch classes
      if (scale.containsPitchClasses(inputPitchClasses)) {
        const scalePitchClasses = scale.getPitchClasses();
        const scaleNotes = scale.getNotesAsStrings(preferSharps);

        // Calculate extra notes count
        const extraNotesCount = scale.getExtraNotesCount(inputPitchClasses);

        // Get matched note names
        const matchedNotes = scaleNotes.filter((note) => {
          const noteEntity = Note.fromString(note);
          return inputPitchClasses.has(noteEntity.pitchClass);
        });

        matches.push({
          scaleType,
          root: rootPitchClass,
          rootNoteName: rootNote.name,
          scaleNotes,
          scalePitchClasses,
          extraNotesCount,
          matchedNotes,
        });
      }
    }
  }

  // Sort by extra notes count (fewer extra notes first), then by scale name
  matches.sort((a, b) => {
    if (a.extraNotesCount !== b.extraNotesCount) {
      return a.extraNotesCount - b.extraNotesCount;
    }
    // Secondary sort: by scale name
    return a.scaleType.name.localeCompare(b.scaleType.name);
  });

  return matches;
}
