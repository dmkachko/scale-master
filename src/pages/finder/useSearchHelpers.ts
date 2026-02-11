/**
 * useSearchHelpers Hook
 * Provides helper functions and data for search UI
 * Feature-specific, not reusable
 */

import { useMemo } from 'react';
import type { SearchMode } from './useScaleSearch';

interface Example {
  label: string;
  description: string;
}

interface UseSearchHelpersReturn {
  getPlaceholder: () => string;
  getExamples: () => Example[];
  getSearchModeLabel: () => string;
}

export function useSearchHelpers(searchMode: SearchMode): UseSearchHelpersReturn {
  const getPlaceholder = useMemo(() => () => {
    if (searchMode === 'notes') return 'e.g., C E G or C# Eb G';
    if (searchMode === 'chords') return 'e.g., C Am F G or Cmaj7 Dm7';
    if (searchMode === 'chord-types') return 'e.g., major minor dim or maj min aug';
    return '';
  }, [searchMode]);

  const getExamples = useMemo(() => (): Example[] => {
    if (searchMode === 'notes') {
      return [
        { label: 'C E G', description: 'Three notes' },
        { label: 'C# D# F#', description: 'With sharps' },
        { label: 'C, Eb, G', description: 'With commas' },
        { label: 'A B C D E F G', description: 'All white keys' },
      ];
    }
    if (searchMode === 'chords') {
      return [
        { label: 'C F G', description: 'Major triads' },
        { label: 'Am Dm Em', description: 'Minor triads' },
        { label: 'Cmaj7 Dm7 G7', description: 'Jazz progression' },
        { label: 'C Am F G7', description: 'Mixed qualities' },
      ];
    }
    if (searchMode === 'chord-types') {
      return [
        { label: 'major minor', description: 'Major & minor scales' },
        { label: 'maj min dim', description: 'Diatonic scales' },
        { label: 'maj min aug', description: 'Harmonic minor' },
        { label: 'maj min dim aug', description: 'Melodic minor' },
      ];
    }
    return [];
  }, [searchMode]);

  const getSearchModeLabel = useMemo(() => () => {
    if (searchMode === 'notes') return 'Searching for notes:';
    if (searchMode === 'chords') return 'Searching for chords:';
    if (searchMode === 'chord-types') return 'Searching for chord types:';
    return '';
  }, [searchMode]);

  return {
    getPlaceholder,
    getExamples,
    getSearchModeLabel,
  };
}
