/**
 * Scale Catalog Page
 * Displays all available scales with a root selector
 */

import { useState, useEffect, useRef } from 'react';
import { useCatalogStore } from '../store/catalogStore';
import { usePreferencesStore } from '../store/preferencesStore';
import { useCatalogInit } from '../hooks/useCatalogInit';
import { NOTE_NAMES_SHARP, NOTE_NAMES_FLAT } from '../music/notes';
import ScaleCard from '../components/ScaleCard';
import './ScaleCatalogPage.css';

function ScaleCatalogPage() {
  useCatalogInit();

  const { status, catalog, error, selectedRoot, setSelectedRoot } = useCatalogStore();
  const accidentalPreference = usePreferencesStore((state) => state.accidentalPreference);
  const noteNames = accidentalPreference === 'sharps' ? NOTE_NAMES_SHARP : NOTE_NAMES_FLAT;

  const [highlightedScaleId, setHighlightedScaleId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNavigate = (scaleId: string) => {
    setHighlightedScaleId(scaleId);

    // Scroll to the element
    setTimeout(() => {
      const element = document.getElementById(scaleId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    // Clear any existing timeout
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    // Auto-clear highlight after 2 seconds
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedScaleId(null);
    }, 2000);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterQuery(e.target.value);
    setHighlightedScaleId(null);
  };

  const handleClearFilter = () => {
    setFilterQuery('');
    setHighlightedScaleId(null);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  // Render loading state
  if (status === 'loading') {
    return (
      <div className="page-container">
        <div className="catalog-status">
          <p>Loading scale catalog...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (status === 'error') {
    return (
      <div className="page-container">
        <div className="error-banner">
          <h2>Error Loading Catalog</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Render ready state
  if (status === 'ready' && catalog) {
    // Filter scales based on search query
    const filteredScales = filterQuery
      ? catalog.scaleTypes.filter((scale) => {
          const query = filterQuery.toLowerCase();
          const matchesName = scale.name.toLowerCase().includes(query);
          const matchesAlternative = scale.alternativeNames?.some((alt) =>
            alt.toLowerCase().includes(query)
          );
          return matchesName || matchesAlternative;
        })
      : catalog.scaleTypes;

    return (
      <div className="page-container">
        <div className="controls-bar">
          <div className="root-selector">
            <label htmlFor="root-select">Root Note:</label>
            <select
              id="root-select"
              value={selectedRoot}
              onChange={(e) => setSelectedRoot(Number(e.target.value))}
            >
              {noteNames.map((noteName, pitchClass) => (
                <option key={pitchClass} value={pitchClass}>
                  {noteName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-input-wrapper">
            <input
              type="text"
              className="filter-input"
              placeholder="Filter scales by name..."
              value={filterQuery}
              onChange={handleFilterChange}
              aria-label="Filter scales"
            />
            {filterQuery && (
              <button
                type="button"
                className="filter-clear"
                onClick={handleClearFilter}
                aria-label="Clear filter"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {filterQuery && (
          <div className="filter-results-info">
            Showing {filteredScales.length} of {catalog.scaleTypes.length} scales
          </div>
        )}

        <div className="scale-grid">
          {filteredScales.map((scale) => (
            <ScaleCard
              key={scale.id}
              scale={scale}
              rootNote={selectedRoot}
              highlighted={highlightedScaleId === scale.id}
              onNavigate={handleNavigate}
            />
          ))}
        </div>
      </div>
    );
  }

  // Idle state (should not be reached)
  return null;
}

export default ScaleCatalogPage;
