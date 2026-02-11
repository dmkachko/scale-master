/**
 * FilterSection Component
 * Filters for root notes and scale families
 */

interface FilterSectionProps {
  matchCount: number;
  filteredCount: number;
  noteNames: string[];
  selectedRoots: Set<number>;
  onToggleRoot: (root: number) => void;
  onToggleAllRoots: () => void;
  availableFamilies: string[];
  selectedFamilies: Set<string>;
  onToggleFamily: (family: string) => void;
  onToggleAllFamilies: () => void;
}

export default function FilterSection({
  matchCount,
  filteredCount,
  noteNames,
  selectedRoots,
  onToggleRoot,
  onToggleAllRoots,
  availableFamilies,
  selectedFamilies,
  onToggleFamily,
  onToggleAllFamilies,
}: FilterSectionProps) {
  return (
    <div className="finder-filters-section">
      <div className="filters-header">
        <h3>Filters</h3>
        <span className="filter-count">
          Showing {filteredCount} of {matchCount} result{matchCount === 1 ? '' : 's'}
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
              onClick={onToggleAllRoots}
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
                  onChange={() => onToggleRoot(index)}
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
              onClick={onToggleAllFamilies}
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
                  onChange={() => onToggleFamily(family)}
                />
                <span className="scale-family">{family}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
