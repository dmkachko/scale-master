/**
 * SearchModeSelector Component
 * Radio buttons for selecting search mode (notes, chords, chord types)
 */

import clsx from 'clsx';
import type { SearchMode } from '../useScaleSearch';

interface SearchModeSelectorProps {
  searchMode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
}

export default function SearchModeSelector({
  searchMode,
  onModeChange,
}: SearchModeSelectorProps) {
  return (
    <div className="search-mode-selector">
      <label className={clsx('mode-option', searchMode === 'notes' && 'active')}>
        <input
          type="radio"
          name="search-mode"
          value="notes"
          checked={searchMode === 'notes'}
          onChange={() => onModeChange('notes')}
        />
        <span>Notes</span>
      </label>
      <label className={clsx('mode-option', searchMode === 'chords' && 'active')}>
        <input
          type="radio"
          name="search-mode"
          value="chords"
          checked={searchMode === 'chords'}
          onChange={() => onModeChange('chords')}
        />
        <span>Chords</span>
      </label>
      <label className={clsx('mode-option', searchMode === 'chord-types' && 'active')}>
        <input
          type="radio"
          name="search-mode"
          value="chord-types"
          checked={searchMode === 'chord-types'}
          onChange={() => onModeChange('chord-types')}
        />
        <span>Chord Types</span>
      </label>
    </div>
  );
}
