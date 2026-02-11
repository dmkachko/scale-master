/**
 * Chord-Scale Relationship Checker
 * Refactored to use Chord and Scale entities
 */

import type { Chord } from './chordParser';
import type { ScaleType } from '../types/catalog';
import { Scale } from './entities/Scale';
import { Note } from './entities/Note';

/**
 * Calculate pitch classes for a scale given root and intervals
 */
export function getScalePitchClasses(
  scaleRoot: string | number,
  scaleIntervals: number[]
): Set<number> {
  const rootNote = typeof scaleRoot === 'string'
    ? Note.fromString(scaleRoot)
    : Note.fromPitchClass(scaleRoot);

  const scale = new Scale('temp', 'temp', 'temp', scaleIntervals, rootNote);
  return scale.getPitchClasses();
}

/**
 * Check if a chord's pitch classes are all contained in a scale
 * @param chord - The chord to check (or just pitch classes)
 * @param scaleRoot - Root note of the scale (e.g., "C", "D#") or pitch class number
 * @param scaleIntervals - Intervals of the scale type
 * @returns true if all chord notes are in the scale
 */
export function chordFitsInScale(
  chord: Chord | Set<number> | null | undefined,
  scaleRoot: string | number,
  scaleIntervals: number[]
): boolean {
  if (!chord) return true; // No chord to check, consider it fits

  const rootNote = typeof scaleRoot === 'string'
    ? Note.fromString(scaleRoot)
    : Note.fromPitchClass(scaleRoot);

  const scale = new Scale('temp', 'temp', 'temp', scaleIntervals, rootNote);
  const chordPitchClasses = chord instanceof Set ? chord : chord.pitchClasses;

  if (!chordPitchClasses) return true; // No pitch classes to check
  if (!(chordPitchClasses instanceof Set) && !Array.isArray(chordPitchClasses)) {
    return true; // Invalid format, don't filter
  }

  // Use scale's containsPitchClasses method
  return scale.containsPitchClasses(chordPitchClasses);
}

/**
 * Check if a chord fits in any of the given scales
 * @param chord - The chord to check
 * @param scales - Array of scale selections
 * @param scaleTypes - Available scale types from catalog
 * @returns true if the chord fits in at least one of the scales
 */
export function chordFitsInAnyScale(
  chord: Chord | Set<number>,
  scales: Array<{ scale: string; root: string | number }>,
  scaleTypes: ScaleType[]
): boolean {
  if (scales.length === 0) {
    return true; // No filter applied, show all chords
  }

  for (const selectedScale of scales) {
    // Find the scale type definition
    const scaleType = scaleTypes.find(
      st => st.name === selectedScale.scale
    );

    if (!scaleType) {
      continue;
    }

    // Check if chord fits in this scale
    if (chordFitsInScale(chord, selectedScale.root, scaleType.intervals)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a chord fits in all of the given scales
 * @param chord - The chord to check
 * @param scales - Array of scale selections
 * @param scaleTypes - Available scale types from catalog
 * @returns true if the chord fits in all scales
 */
export function chordFitsInAllScales(
  chord: Chord | Set<number>,
  scales: Array<{ scale: string; root: string | number }>,
  scaleTypes: ScaleType[]
): boolean {
  if (scales.length === 0) {
    return true; // No filter applied
  }

  for (const selectedScale of scales) {
    // Find the scale type definition
    const scaleType = scaleTypes.find(
      st => st.name === selectedScale.scale
    );

    if (!scaleType) {
      return false; // Unknown scale type means it doesn't fit
    }

    // Check if chord fits in this scale
    if (!chordFitsInScale(chord, selectedScale.root, scaleType.intervals)) {
      return false; // Doesn't fit in this scale
    }
  }

  return true; // Fits in all scales
}
