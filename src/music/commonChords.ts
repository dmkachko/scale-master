/**
 * Common Chords Finder
 * Find chords that are common across multiple scales
 */

import type { ScaleType } from '../types/catalog';
import { calculateScaleNotes } from './notes';
import { calculateTriads, type Triad, getTriadAbbreviation } from './triads';

export interface SelectedScale {
  id: string; // Unique identifier for UI
  root: number; // 0-11
  rootName: string;
  scaleType: ScaleType;
}

export interface CommonChord {
  root: string; // Note name
  rootPitchClass: number; // 0-11
  quality: string; // Triad quality
  symbol: string; // e.g., "C", "Dm", "F#°"
  count: number; // How many scales contain this chord
  scaleNames: string[]; // Names of scales that contain this chord
}

/**
 * Get a normalized chord identifier (pitch class + quality)
 * This allows us to match enharmonic equivalents (e.g., C# = Db)
 */
function getChordKey(rootPitchClass: number, quality: string): string {
  return `${rootPitchClass}-${quality}`;
}

/**
 * Convert note name to pitch class (0-11)
 */
function noteToPitchClass(note: string): number {
  const noteMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
  };
  return noteMap[note] ?? 0;
}

/**
 * Find chords that are common across multiple scales
 * @param scales - Array of selected scales
 * @param preferSharps - Whether to spell notes with sharps or flats
 * @returns Array of common chords sorted by frequency
 */
export function findCommonChords(
  scales: SelectedScale[],
  preferSharps: boolean = true
): CommonChord[] {
  if (scales.length === 0) {
    return [];
  }

  // Map to track chords: key -> { root, rootPitchClass, quality, symbol, scaleNames }
  const chordMap = new Map<string, {
    root: string;
    rootPitchClass: number;
    quality: string;
    symbol: string;
    scaleNames: Set<string>;
  }>();

  // For each scale, calculate its triads and add to map
  for (const scale of scales) {
    const scaleNotes = calculateScaleNotes(scale.root, scale.scaleType.intervals, preferSharps);
    const triads = calculateTriads(scaleNotes, scale.scaleType.intervals);
    const scaleName = `${scale.rootName} ${scale.scaleType.name}`;

    for (const triad of triads) {
      const rootPitchClass = (scale.root + scale.scaleType.intervals[triad.degree]) % 12;
      const chordKey = getChordKey(rootPitchClass, triad.quality);
      const symbol = getTriadAbbreviation(triad.root, triad.quality);

      if (chordMap.has(chordKey)) {
        // Add this scale to the chord's scale list
        chordMap.get(chordKey)!.scaleNames.add(scaleName);
      } else {
        // New chord, add to map
        chordMap.set(chordKey, {
          root: triad.root,
          rootPitchClass,
          quality: triad.quality,
          symbol,
          scaleNames: new Set([scaleName]),
        });
      }
    }
  }

  // Convert map to array and filter for common chords (present in multiple scales)
  const commonChords: CommonChord[] = [];

  for (const [, chord] of chordMap) {
    // Only include chords that appear in at least 2 scales (or all scales if only 1)
    const count = chord.scaleNames.size;
    if (scales.length === 1 || count >= 2) {
      commonChords.push({
        root: chord.root,
        rootPitchClass: chord.rootPitchClass,
        quality: chord.quality,
        symbol: chord.symbol,
        count,
        scaleNames: Array.from(chord.scaleNames).sort(),
      });
    }
  }

  // Sort by count (descending), then by pitch class
  commonChords.sort((a, b) => {
    if (a.count !== b.count) {
      return b.count - a.count; // More common first
    }
    return a.rootPitchClass - b.rootPitchClass; // Then by pitch class
  });

  return commonChords;
}

/**
 * Get statistics about common chords
 */
export function getCommonChordsStats(chords: CommonChord[], totalScales: number) {
  const universal = chords.filter(c => c.count === totalScales).length;
  const shared = chords.filter(c => c.count >= 2 && c.count < totalScales).length;
  const unique = chords.filter(c => c.count === 1).length;

  return {
    total: chords.length,
    universal, // Present in all scales
    shared,    // Present in 2+ scales but not all
    unique,    // Present in only 1 scale
  };
}
