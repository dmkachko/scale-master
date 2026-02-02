/**
 * Scale Finder - Find scales containing a given set of notes
 */

import type { ScaleType } from '../types/catalog';
import { getPitchClassFromNote } from './notes';

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

  const noteNames = preferSharps
    ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  // Check each scale type with each possible root
  for (const scaleType of scaleTypes) {
    for (let root = 0; root < 12; root++) {
      // Calculate pitch classes for this scale
      const scalePitchClasses = new Set<number>();
      const scaleNotes: string[] = [];

      for (const interval of scaleType.intervals) {
        const pitchClass = (root + interval) % 12;
        scalePitchClasses.add(pitchClass);
        scaleNotes.push(noteNames[pitchClass]);
      }

      // Check if all input pitch classes are contained in this scale
      let isMatch = true;
      for (const inputPC of inputPitchClasses) {
        if (!scalePitchClasses.has(inputPC)) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        // Calculate extra notes count
        const extraNotesCount = scalePitchClasses.size - inputPitchClasses.size;

        // Get matched note names
        const matchedNotes = scaleNotes.filter((note) => {
          const pc = getPitchClassFromNote(note);
          return inputPitchClasses.has(pc);
        });

        matches.push({
          scaleType,
          root,
          rootNoteName: noteNames[root],
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
