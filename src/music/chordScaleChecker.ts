/**
 * Chord-Scale Relationship Checker
 * Unified logic for checking if chords fit in scales
 */

import type { Chord } from './chordParser';
import type { ScaleType } from '../types/catalog';
import { getPitchClassFromNote } from './notes';

/**
 * Calculate pitch classes for a scale given root and intervals
 */
export function getScalePitchClasses(
  scaleRoot: string | number,
  scaleIntervals: number[]
): Set<number> {
  const scaleRootPC = typeof scaleRoot === 'string'
    ? getPitchClassFromNote(scaleRoot)
    : scaleRoot;

  const scalePitchClasses = new Set<number>();
  for (const interval of scaleIntervals) {
    const pitchClass = (scaleRootPC + interval) % 12;
    scalePitchClasses.add(pitchClass);
  }

  return scalePitchClasses;
}

/**
 * Check if a chord's pitch classes are all contained in a scale
 * @param chord - The chord to check (or just pitch classes)
 * @param scaleRoot - Root note of the scale (e.g., "C", "D#") or pitch class number
 * @param scaleIntervals - Intervals of the scale type
 * @returns true if all chord notes are in the scale
 */
export function chordFitsInScale(
  chord: Chord | Set<number>,
  scaleRoot: string | number,
  scaleIntervals: number[]
): boolean {
  const scalePitchClasses = getScalePitchClasses(scaleRoot, scaleIntervals);
  const chordPitchClasses = chord instanceof Set ? chord : chord.pitchClasses;

  // Check if all chord pitch classes are in the scale
  for (const chordPC of chordPitchClasses) {
    if (!scalePitchClasses.has(chordPC)) {
      return false;
    }
  }

  return true;
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
