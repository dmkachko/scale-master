/**
 * SearchInputSection Component
 * Search input with examples, errors, and parsed items display
 */

import { getSupportedChordTypes } from '../../../music/chordParser';
import { getSupportedChordTypesList } from '../../../music/chordTypeFinder';
import type { SearchMode } from '../useScaleSearch';

interface SearchInputSectionProps {
  searchMode: SearchMode;
  input: string;
  onInputChange: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  examples: Array<{ label: string; description: string }>;
  parseErrors: string[];
  parsedItems: string[];
  searchModeLabel: string;
}

export default function SearchInputSection({
  searchMode,
  input,
  onInputChange,
  onClear,
  placeholder,
  examples,
  parseErrors,
  parsedItems,
  searchModeLabel,
}: SearchInputSectionProps) {
  return (
    <div className="finder-input-section">
      <div className="input-group">
        <input
          type="text"
          className="note-input"
          placeholder={placeholder}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          autoFocus
          aria-label="Enter search query"
        />
        {input && (
          <button
            type="button"
            className="clear-button"
            onClick={onClear}
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
          {examples.map((example, i) => (
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
          <strong>{searchModeLabel}</strong>{' '}
          {parsedItems.map((item, i) => (
            <span key={i} className="note-badge">
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
