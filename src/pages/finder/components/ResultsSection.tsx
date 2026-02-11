/**
 * ResultsSection Component
 * Displays search results with match details
 */

import { Link } from 'react-router-dom';
import { getTriadQualityDisplayName } from '../../../music/chordTypeFinder';
import type { SearchMode, SearchResult } from '../useScaleSearch';

interface ResultsSectionProps {
  searchMode: SearchMode;
  input: string;
  parsedItems: string[];
  parseErrors: string[];
  matches: SearchResult[];
  filteredMatches: SearchResult[];
}

export default function ResultsSection({
  searchMode,
  input,
  parsedItems,
  parseErrors,
  matches,
  filteredMatches,
}: ResultsSectionProps) {
  // Empty state - no input
  if (input.trim() === '' && filteredMatches.length === 0) {
    return (
      <div className="finder-results-section">
        <div className="empty-state">
          <p>
            {searchMode === 'notes' && 'Enter notes above to search for scales'}
            {searchMode === 'chords' && 'Enter chords above to search for scales'}
            {searchMode === 'chord-types' && 'Enter chord types above to search for scales'}
          </p>
        </div>
      </div>
    );
  }

  // No results
  if (input.trim() !== '' && parsedItems.length > 0 && filteredMatches.length === 0 && parseErrors.length === 0) {
    return (
      <div className="finder-results-section">
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
      </div>
    );
  }

  // Results
  if (filteredMatches.length === 0) {
    return <div className="finder-results-section" />;
  }

  return (
    <div className="finder-results-section">
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
    </div>
  );
}
