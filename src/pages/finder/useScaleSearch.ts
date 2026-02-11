/**
 * useScaleSearch Hook
 * Handles search logic for Scale Finder
 * Feature-specific, not reusable
 */

import { useState, useCallback } from 'react';
import type { Catalog } from '../../types/catalog';
import { parseNotes } from '../../music/notes';
import { parseChords } from '../../music/chordParser';
import { parseChordTypes, findScalesByChordTypes, getTriadQualityDisplayName } from '../../music/chordTypeFinder';
import { findScalesContaining, type ScaleMatch } from '../../music/scaleFinder';
import type { ChordTypeMatch } from '../../music/chordTypeFinder';

export type SearchMode = 'notes' | 'chords' | 'chord-types';
export type SearchResult = ScaleMatch | ChordTypeMatch;

interface UseScaleSearchOptions {
  catalog: Catalog | null;
  accidentalPreference: 'sharps' | 'flats';
}

interface UseScaleSearchReturn {
  searchMode: SearchMode;
  input: string;
  matches: SearchResult[];
  parseErrors: string[];
  parsedItems: string[];
  handleModeChange: (mode: SearchMode) => void;
  handleInputChange: (value: string) => void;
  handleClear: () => void;
}

export function useScaleSearch(options: UseScaleSearchOptions): UseScaleSearchReturn {
  const { catalog, accidentalPreference } = options;

  const [searchMode, setSearchMode] = useState<SearchMode>('notes');
  const [input, setInput] = useState('');
  const [matches, setMatches] = useState<SearchResult[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parsedItems, setParsedItems] = useState<string[]>([]);

  const handleModeChange = useCallback((mode: SearchMode) => {
    setSearchMode(mode);
    setInput('');
    setMatches([]);
    setParseErrors([]);
    setParsedItems([]);
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);

    if (!catalog) return;

    if (searchMode === 'notes') {
      const { notes, pitchClasses, errors } = parseNotes(value);
      setParsedItems(notes);
      setParseErrors(errors);

      if (pitchClasses.size > 0) {
        const results = findScalesContaining(
          pitchClasses,
          catalog.scaleTypes,
          accidentalPreference === 'sharps'
        );
        setMatches(results);
      } else {
        setMatches([]);
      }
    } else if (searchMode === 'chords') {
      const { chords, errors, allPitchClasses } = parseChords(value);
      setParsedItems(chords.map(c => c.displayName));
      setParseErrors(errors);

      if (allPitchClasses.size > 0) {
        const results = findScalesContaining(
          allPitchClasses,
          catalog.scaleTypes,
          accidentalPreference === 'sharps'
        );
        setMatches(results);
      } else {
        setMatches([]);
      }
    } else if (searchMode === 'chord-types') {
      const { types, errors } = parseChordTypes(value);
      setParsedItems(Array.from(types).map(t => getTriadQualityDisplayName(t)));
      setParseErrors(errors);

      if (types.size > 0) {
        const results = findScalesByChordTypes(
          types,
          catalog.scaleTypes,
          accidentalPreference === 'sharps'
        );
        setMatches(results);
      } else {
        setMatches([]);
      }
    }
  }, [catalog, searchMode, accidentalPreference]);

  const handleClear = useCallback(() => {
    setInput('');
    setMatches([]);
    setParseErrors([]);
    setParsedItems([]);
  }, []);

  return {
    searchMode,
    input,
    matches,
    parseErrors,
    parsedItems,
    handleModeChange,
    handleInputChange,
    handleClear,
  };
}
