/**
 * Chord Type Finder - Find scales by the types of chords they contain
 */

import type { ScaleType } from '../types/catalog';
import { calculateScaleNotes } from './notes';
import { calculateTriads, type TriadQuality } from './triads';

export interface ChordTypeMatch {
  scaleType: ScaleType;
  root: number; // pitch class 0-11
  rootNoteName: string;
  scaleNotes: string[];
  triadsFound: { [key in TriadQuality]?: number }; // count of each triad type
  matchedTypes: Set<TriadQuality>;
}

// Mapping from input strings to TriadQuality
const CHORD_TYPE_ALIASES: Record<string, TriadQuality> = {
  'major': 'major',
  'maj': 'major',
  'M': 'major',
  'minor': 'minor',
  'min': 'minor',
  'm': 'minor',
  'diminished': 'diminished',
  'dim': 'diminished',
  'augmented': 'augmented',
  'aug': 'augmented',
  'sus2': 'sus2',
  'sus4': 'sus4',
};

/**
 * Parse chord type input string
 * @param input - e.g., "major minor dim" or "maj, min, aug"
 * @returns Set of TriadQuality values and any errors
 */
export function parseChordTypes(input: string): {
  types: Set<TriadQuality>;
  errors: string[];
} {
  const types = new Set<TriadQuality>();
  const errors: string[] = [];

  if (!input || input.trim() === '') {
    return { types: new Set(), errors: [] };
  }

  // Split by comma or whitespace
  const tokens = input
    .toLowerCase()
    .split(/[\s,]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);

  for (const token of tokens) {
    const quality = CHORD_TYPE_ALIASES[token];

    if (quality) {
      types.add(quality);
    } else {
      errors.push(`Unknown chord type: "${token}"`);
    }
  }

  return { types, errors };
}

/**
 * Find scales that contain the specified chord types
 * @param requestedTypes - Set of TriadQuality values to search for
 * @param scaleTypes - Array of all scale types from catalog
 * @param preferSharps - Whether to spell notes with sharps or flats
 * @returns Array of matching scales with triad information
 */
export function findScalesByChordTypes(
  requestedTypes: Set<TriadQuality>,
  scaleTypes: ScaleType[],
  preferSharps: boolean = true
): ChordTypeMatch[] {
  const matches: ChordTypeMatch[] = [];

  // Empty input returns no matches
  if (requestedTypes.size === 0) {
    return [];
  }

  const noteNames = preferSharps
    ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  // Check each scale type with each possible root
  for (const scaleType of scaleTypes) {
    for (let root = 0; root < 12; root++) {
      // Calculate scale notes for this root
      const scaleNotes = calculateScaleNotes(root, scaleType.intervals, preferSharps);

      // Calculate triads in this scale
      const triads = calculateTriads(scaleNotes, scaleType.intervals);

      // Count each triad type found in the scale
      const triadsFound: { [key in TriadQuality]?: number } = {};
      const foundTypes = new Set<TriadQuality>();

      for (const triad of triads) {
        triadsFound[triad.quality] = (triadsFound[triad.quality] || 0) + 1;
        foundTypes.add(triad.quality);
      }

      // Check if this scale has all requested chord types
      let hasAllTypes = true;
      for (const requestedType of requestedTypes) {
        if (!foundTypes.has(requestedType)) {
          hasAllTypes = false;
          break;
        }
      }

      if (hasAllTypes) {
        matches.push({
          scaleType,
          root,
          rootNoteName: noteNames[root],
          scaleNotes,
          triadsFound,
          matchedTypes: foundTypes,
        });
      }
    }
  }

  // Sort by number of different triad types (more variety first), then by scale name
  matches.sort((a, b) => {
    const aTypeCount = Object.keys(a.triadsFound).length;
    const bTypeCount = Object.keys(b.triadsFound).length;

    if (aTypeCount !== bTypeCount) {
      return bTypeCount - aTypeCount; // More types first
    }

    return a.scaleType.name.localeCompare(b.scaleType.name);
  });

  return matches;
}

/**
 * Get display name for a triad quality
 */
export function getTriadQualityDisplayName(quality: TriadQuality): string {
  const displayNames: Record<TriadQuality, string> = {
    'major': 'Major',
    'minor': 'Minor',
    'diminished': 'Diminished',
    'augmented': 'Augmented',
    'sus2': 'Sus2',
    'sus4': 'Sus4',
  };

  return displayNames[quality] || quality;
}

/**
 * Get supported chord types for UI help
 */
export function getSupportedChordTypesList(): string[] {
  return [
    'major (or maj, M)',
    'minor (or min, m)',
    'diminished (or dim)',
    'augmented (or aug)',
    'sus2',
    'sus4',
  ];
}
