/**
 * useScaleGrouping Hook
 * Manages scale grouping by family and chord-based filtering
 */

import { useMemo } from 'react';
import type { Catalog, ScaleType } from '../types/catalog';
import type { Chord } from '../music/chordParser';
import { chordFitsInScale } from '../music/chordScaleChecker';

export const FAMILY_LABELS: Record<string, string> = {
  'diatonic': 'Diatonic',
  'minor': 'Minor',
  'pentatonic': 'Pentatonic',
  'blues': 'Blues',
  'symmetrical': 'Symmetrical',
  'melodic-minor-modes': 'Melodic Minor Modes',
  'harmonic-minor-modes': 'Harmonic Minor Modes',
  'bebop': 'Bebop',
  'other': 'Other',
};

const FAMILY_ORDER = [
  'diatonic',
  'minor',
  'pentatonic',
  'blues',
  'symmetrical',
  'melodic-minor-modes',
  'harmonic-minor-modes',
  'bebop',
  'other',
];

interface UseScaleGroupingOptions {
  catalog: Catalog;
  selectedChord?: Chord | null;
}

interface UseScaleGroupingReturn {
  scalesByFamily: Map<string, ScaleType[]>;
  sortedFamilies: string[];
  shouldShowScale: (scaleTypeName: string, root: string) => boolean;
}

export function useScaleGrouping(options: UseScaleGroupingOptions): UseScaleGroupingReturn {
  const { catalog, selectedChord } = options;

  /**
   * Check if a scale should be shown based on chord filter
   */
  const shouldShowScale = (scaleTypeName: string, root: string): boolean => {
    if (!selectedChord) return true;
    if (!selectedChord.pitchClasses) return true;

    const scaleType = catalog.scaleTypes.find(st => st.name === scaleTypeName);
    if (!scaleType) return false;

    return chordFitsInScale(selectedChord, root, scaleType.intervals);
  };

  /**
   * Group scales by family
   */
  const scalesByFamily = useMemo(() => {
    const grouped = new Map<string, ScaleType[]>();

    catalog.scaleTypes.forEach((scaleType) => {
      const family = scaleType.family || 'other';
      if (!grouped.has(family)) {
        grouped.set(family, []);
      }
      grouped.get(family)!.push(scaleType);
    });

    return grouped;
  }, [catalog.scaleTypes]);

  /**
   * Sort families by predefined order
   */
  const sortedFamilies = useMemo(() => {
    return Array.from(scalesByFamily.keys()).sort((a, b) => {
      const aIndex = FAMILY_ORDER.indexOf(a);
      const bIndex = FAMILY_ORDER.indexOf(b);

      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });
  }, [scalesByFamily]);

  return {
    scalesByFamily,
    sortedFamilies,
    shouldShowScale,
  };
}
