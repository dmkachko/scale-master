/**
 * useScaleFilters Hook
 * Manages filter state for Scale Finder results
 * Feature-specific, not reusable
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Catalog } from '../../types/catalog';
import type { SearchResult } from './useScaleSearch';

interface UseScaleFiltersOptions {
  catalog: Catalog | null;
  matches: SearchResult[];
}

interface UseScaleFiltersReturn {
  selectedRoots: Set<number>;
  selectedFamilies: Set<string>;
  filteredMatches: SearchResult[];
  availableFamilies: string[];
  toggleRoot: (root: number) => void;
  toggleAllRoots: () => void;
  toggleFamily: (family: string) => void;
  toggleAllFamilies: () => void;
}

export function useScaleFilters(options: UseScaleFiltersOptions): UseScaleFiltersReturn {
  const { catalog, matches } = options;

  const [selectedRoots, setSelectedRoots] = useState<Set<number>>(
    new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  );
  const [selectedFamilies, setSelectedFamilies] = useState<Set<string>>(new Set());

  // Initialize families filter when catalog loads
  useEffect(() => {
    if (catalog && selectedFamilies.size === 0) {
      const families = new Set(catalog.scaleTypes.map(s => s.family));
      setSelectedFamilies(families);
    }
  }, [catalog, selectedFamilies.size]);

  const toggleRoot = useCallback((root: number) => {
    setSelectedRoots(prev => {
      const newRoots = new Set(prev);
      if (newRoots.has(root)) {
        newRoots.delete(root);
      } else {
        newRoots.add(root);
      }
      return newRoots;
    });
  }, []);

  const toggleAllRoots = useCallback(() => {
    setSelectedRoots(prev => {
      if (prev.size === 12) {
        return new Set();
      } else {
        return new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
      }
    });
  }, []);

  const toggleFamily = useCallback((family: string) => {
    setSelectedFamilies(prev => {
      const newFamilies = new Set(prev);
      if (newFamilies.has(family)) {
        newFamilies.delete(family);
      } else {
        newFamilies.add(family);
      }
      return newFamilies;
    });
  }, []);

  const toggleAllFamilies = useCallback(() => {
    if (!catalog) return;
    const allFamilies = new Set(catalog.scaleTypes.map(s => s.family));
    setSelectedFamilies(prev => {
      if (prev.size === allFamilies.size) {
        return new Set();
      } else {
        return allFamilies;
      }
    });
  }, [catalog]);

  // Apply filters to matches
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      const rootMatch = selectedRoots.has(match.root);
      const familyMatch = selectedFamilies.has(match.scaleType.family);
      return rootMatch && familyMatch;
    });
  }, [matches, selectedRoots, selectedFamilies]);

  const availableFamilies = useMemo(() => {
    return catalog
      ? Array.from(new Set(catalog.scaleTypes.map(s => s.family))).sort()
      : [];
  }, [catalog]);

  return {
    selectedRoots,
    selectedFamilies,
    filteredMatches,
    availableFamilies,
    toggleRoot,
    toggleAllRoots,
    toggleFamily,
    toggleAllFamilies,
  };
}
