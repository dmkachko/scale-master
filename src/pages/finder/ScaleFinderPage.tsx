/**
 * Scale Finder Page
 * Find scales that contain given notes or chords (US-07)
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCatalogStore } from '../../store/catalogStore.ts';
import { usePreferencesStore } from '../../store/preferencesStore.ts';
import { useCatalogInit } from '../../hooks/useCatalogInit.ts';
import { parseNotes } from '../../music/notes.ts';
import { parseChords, getSupportedChordTypes } from '../../music/chordParser.ts';
import {
  parseChordTypes,
  findScalesByChordTypes,
  getTriadQualityDisplayName,
  getSupportedChordTypesList,
  type ChordTypeMatch,
} from '../../music/chordTypeFinder.ts';
import { findScalesContaining, type ScaleMatch } from '../../music/scaleFinder.ts';
import './ScaleFinderPage.css';

type SearchMode = 'notes' | 'chords' | 'chord-types';
type SearchResult = ScaleMatch | ChordTypeMatch;

function ScaleFinderPage() {
  useCatalogInit();

  const { catalog } = useCatalogStore();
  const { accidentalPreference } = usePreferencesStore();
  const [searchMode, setSearchMode] = useState<SearchMode>('notes');
  const [input, setInput] = useState('');
  const [matches, setMatches] = useState<SearchResult[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parsedItems, setParsedItems] = useState<string[]>([]);

  // Filter state
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
  }, [catalog]);

  const handleModeChange = (mode: SearchMode) => {
    setSearchMode(mode);
    setInput('');
    setMatches([]);
    setParseErrors([]);
    setParsedItems([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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
  };

  const handleClear = () => {
    setInput('');
    setMatches([]);
    setParseErrors([]);
    setParsedItems([]);
  };

  const toggleRoot = (root: number) => {
    const newRoots = new Set(selectedRoots);
    if (newRoots.has(root)) {
      newRoots.delete(root);
    } else {
      newRoots.add(root);
    }
    setSelectedRoots(newRoots);
  };

  const toggleAllRoots = () => {
    if (selectedRoots.size === 12) {
      setSelectedRoots(new Set());
    } else {
      setSelectedRoots(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]));
    }
  };

  const toggleFamily = (family: string) => {
    const newFamilies = new Set(selectedFamilies);
    if (newFamilies.has(family)) {
      newFamilies.delete(family);
    } else {
      newFamilies.add(family);
    }
    setSelectedFamilies(newFamilies);
  };

  const toggleAllFamilies = () => {
    if (!catalog) return;
    const allFamilies = new Set(catalog.scaleTypes.map(s => s.family));
    if (selectedFamilies.size === allFamilies.size) {
      setSelectedFamilies(new Set());
    } else {
      setSelectedFamilies(allFamilies);
    }
  };

  // Apply filters to matches
  const filteredMatches = matches.filter(match => {
    const rootMatch = selectedRoots.has(match.root);
    const familyMatch = selectedFamilies.has(match.scaleType.family);
    return rootMatch && familyMatch;
  });

  const getPlaceholder = () => {
    if (searchMode === 'notes') return 'e.g., C E G or C# Eb G';
    if (searchMode === 'chords') return 'e.g., C Am F G or Cmaj7 Dm7';
    if (searchMode === 'chord-types') return 'e.g., major minor dim or maj min aug';
    return '';
  };

  const getExamples = () => {
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
  };

  const getSearchModeLabel = () => {
    if (searchMode === 'notes') return 'Searching for notes:';
    if (searchMode === 'chords') return 'Searching for chords:';
    if (searchMode === 'chord-types') return 'Searching for chord types:';
    return '';
  };

  const noteNames = accidentalPreference === 'sharps'
    ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  const availableFamilies = catalog
    ? Array.from(new Set(catalog.scaleTypes.map(s => s.family))).sort()
    : [];

  return (
    <div className="scale-finder-page">
      <div className="finder-header">
        <h1>Scale Finder</h1>
        <p className="finder-description">
          Find scales by notes or chords
        </p>
      </div>

      {/* Search Mode Selector */}
      <div className="search-mode-selector">
        <label className={`mode-option ${searchMode === 'notes' ? 'active' : ''}`}>
          <input
            type="radio"
            name="search-mode"
            value="notes"
            checked={searchMode === 'notes'}
            onChange={() => handleModeChange('notes')}
          />
          <span>Notes</span>
        </label>
        <label className={`mode-option ${searchMode === 'chords' ? 'active' : ''}`}>
          <input
            type="radio"
            name="search-mode"
            value="chords"
            checked={searchMode === 'chords'}
            onChange={() => handleModeChange('chords')}
          />
          <span>Chords</span>
        </label>
        <label className={`mode-option ${searchMode === 'chord-types' ? 'active' : ''}`}>
          <input
            type="radio"
            name="search-mode"
            value="chord-types"
            checked={searchMode === 'chord-types'}
            onChange={() => handleModeChange('chord-types')}
          />
          <span>Chord Types</span>
        </label>
      </div>

      <div className="finder-input-section">
        <div className="input-group">
          <input
            type="text"
            className="note-input"
            placeholder={getPlaceholder()}
            value={input}
            onChange={handleInputChange}
            autoFocus
            aria-label="Enter search query"
          />
          {input && (
            <button
              type="button"
              className="clear-button"
              onClick={handleClear}
              aria-label="Clear input"
            >
              ×
            </button>
          )}
        </div>

        <div className="input-help">
          <p>
            {searchMode === 'notes' && 'Separate notes with spaces or commas. Examples:'}
            {searchMode === 'chords' && 'Enter chord symbols separated by spaces or commas. Examples:'}
            {searchMode === 'chord-types' && 'Enter chord qualities separated by spaces or commas. Examples:'}
          </p>
          <ul>
            {getExamples().map((example, i) => (
              <li key={i}>
                <code>{example.label}</code>
                <span className="example-description">{example.description}</span>
              </li>
            ))}
          </ul>
          {searchMode === 'chords' && (
            <details className="supported-chords-details">
              <summary>Supported chord types</summary>
              <ul className="supported-chords-list">
                {getSupportedChordTypes().map((type, i) => (
                  <li key={i}>{type}</li>
                ))}
              </ul>
            </details>
          )}
          {searchMode === 'chord-types' && (
            <details className="supported-chords-details">
              <summary>Supported chord types</summary>
              <ul className="supported-chords-list">
                {getSupportedChordTypesList().map((type, i) => (
                  <li key={i}>{type}</li>
                ))}
              </ul>
            </details>
          )}
        </div>

        {parseErrors.length > 0 && (
          <div className="parse-errors">
            {parseErrors.map((error, i) => (
              <div key={i} className="error-message">⚠️ {error}</div>
            ))}
          </div>
        )}

        {parsedItems.length > 0 && (
          <div className="parsed-notes">
            <strong>{getSearchModeLabel()}</strong>{' '}
            {parsedItems.map((item, i) => (
              <span key={i} className="note-badge">
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Filters Section */}
      {matches.length > 0 && (
        <div className="finder-filters-section">
          <div className="filters-header">
            <h3>Filters</h3>
            <span className="filter-count">
              Showing {filteredMatches.length} of {matches.length} result{matches.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="filters-grid">
            {/* Root Note Filter */}
            <div className="filter-group">
              <div className="filter-group-header">
                <label className="filter-label">Root Notes</label>
                <button
                  type="button"
                  className="toggle-all-button"
                  onClick={toggleAllRoots}
                >
                  {selectedRoots.size === 12 ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="filter-options">
                {noteNames.map((note, index) => (
                  <label key={index} className="filter-option">
                    <input
                      type="checkbox"
                      checked={selectedRoots.has(index)}
                      onChange={() => toggleRoot(index)}
                    />
                    <span>{note}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Scale Family Filter */}
            <div className="filter-group">
              <div className="filter-group-header">
                <label className="filter-label">Scale Families</label>
                <button
                  type="button"
                  className="toggle-all-button"
                  onClick={toggleAllFamilies}
                >
                  {selectedFamilies.size === availableFamilies.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="filter-options">
                {availableFamilies.map((family) => (
                  <label key={family} className="filter-option">
                    <input
                      type="checkbox"
                      checked={selectedFamilies.has(family)}
                      onChange={() => toggleFamily(family)}
                    />
                    <span className="scale-family">{family}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="finder-results-section">
        {input.trim() === '' && filteredMatches.length === 0 && (
          <div className="empty-state">
            <p>
              {searchMode === 'notes' && 'Enter notes above to search for scales'}
              {searchMode === 'chords' && 'Enter chords above to search for scales'}
              {searchMode === 'chord-types' && 'Enter chord types above to search for scales'}
            </p>
          </div>
        )}

        {input.trim() !== '' && parsedItems.length > 0 && filteredMatches.length === 0 && parseErrors.length === 0 && (
          <div className="no-results">
            <p>
              {matches.length === 0 ? (
                <>
                  {searchMode === 'notes' && 'No scales found containing all of these notes'}
                  {searchMode === 'chords' && 'No scales found containing all of these chords'}
                  {searchMode === 'chord-types' && 'No scales found with all of these chord types'}
                </>
              ) : (
                'No scales match the selected filters'
              )}
            </p>
          </div>
        )}

        {filteredMatches.length > 0 && (
          <>
            <div className="results-header">
              <h2>Results</h2>
              <p className="results-info">
                {searchMode === 'chord-types'
                  ? 'Sorted by triad variety (more types first)'
                  : 'Sorted by fewest extra notes'}
              </p>
            </div>

            <div className="results-list">
              {filteredMatches.map((match) => {
                // Type guard to check if this is a ChordTypeMatch
                const isChordTypeMatch = 'triadsFound' in match;

                return (
                  <Link
                    key={`${match.scaleType.id}-${match.root}`}
                    to={`/scale/${match.scaleType.id}?root=${match.root}`}
                    className="result-card"
                  >
                    <div className="result-header">
                      <h3 className="result-title">
                        {match.rootNoteName} {match.scaleType.name}
                      </h3>
                      {!isChordTypeMatch && 'extraNotesCount' in match && (
                        <>
                          {match.extraNotesCount === 0 && (
                            <span className="perfect-match-badge">Perfect match</span>
                          )}
                          {match.extraNotesCount > 0 && (
                            <span className="extra-notes-badge">
                              +{match.extraNotesCount} note{match.extraNotesCount === 1 ? '' : 's'}
                            </span>
                          )}
                        </>
                      )}
                      {isChordTypeMatch && (
                        <span className="triad-variety-badge">
                          {Object.keys(match.triadsFound).length} triad type{Object.keys(match.triadsFound).length === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>

                    {isChordTypeMatch ? (
                      <div className="triad-types-display">
                        {Object.entries(match.triadsFound)
                          .sort((a, b) => (b[1] as number) - (a[1] as number))
                          .map(([quality, count]) => (
                            <span
                              key={quality}
                              className={`triad-type-chip ${parsedItems.some(item =>
                                item.toLowerCase() === getTriadQualityDisplayName(quality as any).toLowerCase()
                              ) ? 'matched' : ''}`}
                            >
                              {getTriadQualityDisplayName(quality as any)} ×{count}
                            </span>
                          ))}
                      </div>
                    ) : (
                      <div className="result-notes">
                        {'matchedNotes' in match && match.scaleNotes.map((note, i) => {
                          const isMatched = match.matchedNotes.includes(note);
                          return (
                            <span
                              key={i}
                              className={`note-chip ${isMatched ? 'matched' : 'extra'}`}
                            >
                              {note}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="result-meta">
                      <span className="scale-family">{match.scaleType.family}</span>
                      <span className="scale-size">
                        {match.scaleNotes.length} notes
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ScaleFinderPage;
