/**
 * Scale Relatives Utilities
 * Find scales that differ by one interval being altered by a semitone
 */

import type { ScaleType } from '../types/catalog';

export interface RelativeScale {
  scale: ScaleType;
  modifiedDegree: number; // Which scale degree was modified (1-based for display)
  modification: 'up' | 'down'; // Half step up or down
  originalInterval: number; // Original interval value
  newInterval: number; // New interval value
  modifications?: Array<{ // For second-degree relatives
    degree: number;
    originalInterval: number;
    newInterval: number;
    modification: 'up' | 'down';
  }>;
}

/**
 * Creates interval key for comparison
 */
function intervalsToKey(intervals: number[]): string {
  return intervals.join(',');
}

/**
 * Finds all relative scales by modifying one interval at a time
 */
export function findRelativeScales(
  currentScale: ScaleType,
  allScales: ScaleType[]
): RelativeScale[] {
  const relatives: RelativeScale[] = [];
  const intervals = currentScale.intervals;

  // Try modifying each interval (skip the root at index 0)
  for (let i = 1; i < intervals.length; i++) {
    const originalInterval = intervals[i];

    // Try moving up a half step
    if (originalInterval < 11) { // Max interval is 11 semitones
      const modifiedIntervals = [...intervals];
      modifiedIntervals[i] = originalInterval + 1;

      // Make sure intervals are still in ascending order and unique
      const isValid = modifiedIntervals[i] > modifiedIntervals[i - 1] &&
                     (i === intervals.length - 1 || modifiedIntervals[i] < modifiedIntervals[i + 1]);

      if (isValid) {
        const newKey = intervalsToKey(modifiedIntervals);

        // Find matching scale in catalog
        const matchingScale = allScales.find(
          (scale) => intervalsToKey(scale.intervals) === newKey && scale.id !== currentScale.id
        );

        if (matchingScale) {
          relatives.push({
            scale: matchingScale,
            modifiedDegree: i + 1, // 1-based for display
            modification: 'up',
            originalInterval,
            newInterval: originalInterval + 1,
          });
        }
      }
    }

    // Try moving down a half step
    if (originalInterval > 1) { // Min interval is 1 semitone
      const modifiedIntervals = [...intervals];
      modifiedIntervals[i] = originalInterval - 1;

      // Make sure intervals are still in ascending order and unique
      const isValid = modifiedIntervals[i] > modifiedIntervals[i - 1] &&
                     (i === intervals.length - 1 || modifiedIntervals[i] < modifiedIntervals[i + 1]);

      if (isValid) {
        const newKey = intervalsToKey(modifiedIntervals);

        // Find matching scale in catalog
        const matchingScale = allScales.find(
          (scale) => intervalsToKey(scale.intervals) === newKey && scale.id !== currentScale.id
        );

        if (matchingScale) {
          relatives.push({
            scale: matchingScale,
            modifiedDegree: i + 1, // 1-based for display
            modification: 'down',
            originalInterval,
            newInterval: originalInterval - 1,
          });
        }
      }
    }
  }

  return relatives;
}

/**
 * Gets modification description with note names
 */
export function getModificationDescription(
  degree: number,
  originalInterval: number,
  newInterval: number,
  modification: 'up' | 'down',
  originalNote: string,
  newNote: string
): string {
  const direction = modification === 'up' ? '→' : '→';
  return `${originalNote} ${direction} ${newNote}`;
}

/**
 * Finds all differences between two scales
 */
function findAllDifferences(
  originalIntervals: number[],
  newIntervals: number[]
): Array<{
  degree: number;
  originalInterval: number;
  newInterval: number;
  modification: 'up' | 'down';
}> {
  const differences = [];
  const minLength = Math.min(originalIntervals.length, newIntervals.length);

  for (let i = 1; i < minLength; i++) { // Skip root at index 0
    if (originalIntervals[i] !== newIntervals[i]) {
      differences.push({
        degree: i + 1,
        originalInterval: originalIntervals[i],
        newInterval: newIntervals[i],
        modification: newIntervals[i] > originalIntervals[i] ? 'up' : 'down',
      });
    }
  }

  return differences;
}

/**
 * Finds second-degree relatives (scales that differ by two alterations)
 * Gets Relatives I, then finds their Relatives I, excluding duplicates and originals
 */
export function findSecondDegreeRelatives(
  currentScale: ScaleType,
  allScales: ScaleType[]
): RelativeScale[] {
  const firstDegreeRelatives = findRelativeScales(currentScale, allScales);
  const secondDegreeMap = new Map<string, RelativeScale>();

  // Get the interval keys we want to exclude (original + first degree)
  const excludeKeys = new Set<string>();
  excludeKeys.add(intervalsToKey(currentScale.intervals));
  firstDegreeRelatives.forEach(rel => {
    excludeKeys.add(intervalsToKey(rel.scale.intervals));
  });

  // For each first-degree relative, find its relatives
  for (const firstRelative of firstDegreeRelatives) {
    const secondDegreeFromThis = findRelativeScales(firstRelative.scale, allScales);

    for (const secondRelative of secondDegreeFromThis) {
      const key = intervalsToKey(secondRelative.scale.intervals);

      // Skip if it's the original scale or a first-degree relative or already added
      if (!excludeKeys.has(key) && !secondDegreeMap.has(key)) {
        // Calculate all modifications from the ORIGINAL scale
        const modifications = findAllDifferences(
          currentScale.intervals,
          secondRelative.scale.intervals
        );

        // Only include if there are exactly 2 modifications
        if (modifications.length === 2) {
          const relativeWithMods: RelativeScale = {
            ...secondRelative,
            modifications,
          };
          secondDegreeMap.set(key, relativeWithMods);
        }
      }
    }
  }

  return Array.from(secondDegreeMap.values());
}
