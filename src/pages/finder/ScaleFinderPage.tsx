/**
 * Scale Finder Page
 * Find scales that contain given notes (US-07)
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCatalogStore } from '../../store/catalogStore.ts';
import { usePreferencesStore } from '../../store/preferencesStore.ts';
import { useCatalogInit } from '../../hooks/useCatalogInit.ts';
import { parseNotes } from '../../music/notes.ts';
import { findScalesContaining, type ScaleMatch } from '../../music/scaleFinder.ts';
import './ScaleFinderPage.css';

function ScaleFinderPage() {
  useCatalogInit();

  const { catalog } = useCatalogStore();
  const { accidentalPreference } = usePreferencesStore();
  const [input, setInput] = useState('');
  const [matches, setMatches] = useState<ScaleMatch[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parsedNotes, setParsedNotes] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Parse and search as user types
    if (!catalog) return;

    const { notes, pitchClasses, errors } = parseNotes(value);
    setParsedNotes(notes);
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
  };

  const handleClear = () => {
    setInput('');
    setMatches([]);
    setParseErrors([]);
    setParsedNotes([]);
  };

  return (
    <div className="scale-finder-page">
      <div className="finder-header">
        <h1>Scale Finder</h1>
        <p className="finder-description">
          Enter notes to find which scales contain them
        </p>
      </div>

      <div className="finder-input-section">
        <div className="input-group">
          <input
            type="text"
            className="note-input"
            placeholder="e.g., C E G or C# Eb G"
            value={input}
            onChange={handleInputChange}
            autoFocus
            aria-label="Enter notes"
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
          <p>Separate notes with spaces or commas. Examples:</p>
          <ul>
            <li><code>C E G</code></li>
            <li><code>C# D# F#</code></li>
            <li><code>C, Eb, G</code></li>
            <li><code>A B C D E F G</code></li>
          </ul>
        </div>

        {parseErrors.length > 0 && (
          <div className="parse-errors">
            {parseErrors.map((error, i) => (
              <div key={i} className="error-message">⚠️ {error}</div>
            ))}
          </div>
        )}

        {parsedNotes.length > 0 && (
          <div className="parsed-notes">
            <strong>Searching for:</strong>{' '}
            {parsedNotes.map((note, i) => (
              <span key={i} className="note-badge">
                {note}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="finder-results-section">
        {input.trim() === '' && matches.length === 0 && (
          <div className="empty-state">
            <p>Enter notes above to search for scales</p>
          </div>
        )}

        {input.trim() !== '' && parsedNotes.length > 0 && matches.length === 0 && (
          <div className="no-results">
            <p>No scales found containing all of these notes</p>
          </div>
        )}

        {matches.length > 0 && (
          <>
            <div className="results-header">
              <h2>Found {matches.length} scale{matches.length === 1 ? '' : 's'}</h2>
              <p className="results-info">
                Sorted by fewest extra notes
              </p>
            </div>

            <div className="results-list">
              {matches.map((match, index) => (
                <Link
                  key={`${match.scaleType.id}-${match.root}`}
                  to={`/scale/${match.scaleType.id}?root=${match.root}`}
                  className="result-card"
                >
                  <div className="result-header">
                    <h3 className="result-title">
                      {match.rootNoteName} {match.scaleType.name}
                    </h3>
                    {match.extraNotesCount === 0 && (
                      <span className="perfect-match-badge">Perfect match</span>
                    )}
                    {match.extraNotesCount > 0 && (
                      <span className="extra-notes-badge">
                        +{match.extraNotesCount} note{match.extraNotesCount === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>

                  <div className="result-notes">
                    {match.scaleNotes.map((note, i) => {
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

                  <div className="result-meta">
                    <span className="scale-family">{match.scaleType.family}</span>
                    <span className="scale-size">
                      {match.scaleNotes.length} notes
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ScaleFinderPage;
