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
import ScaleTypeahead from '../components/ScaleTypeahead';
import './ScaleCatalogPage.css';

function ScaleCatalogPage() {
  useCatalogInit();

  const { status, catalog, error, selectedRoot, setSelectedRoot } = useCatalogStore();
  const accidentalPreference = usePreferencesStore((state) => state.accidentalPreference);
  const noteNames = accidentalPreference === 'sharps' ? NOTE_NAMES_SHARP : NOTE_NAMES_FLAT;

  const [selectedScaleId, setSelectedScaleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNavigate = (scaleId: string) => {
    setSelectedScaleId(scaleId);
    setSearchQuery('');

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
      setSelectedScaleId(null);
    }, 2000);
  };

  const handleScaleSelect = (scaleId: string) => {
    setSelectedScaleId(scaleId);
    setSearchQuery('');

    // Scroll to the element
    setTimeout(() => {
      const element = document.getElementById(scaleId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (!value) {
      setSelectedScaleId(null);
    }
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
    // Filter scales based on selection
    const displayedScales = selectedScaleId
      ? catalog.scaleTypes.filter((scale) => scale.id === selectedScaleId)
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

          <ScaleTypeahead
            scales={catalog.scaleTypes}
            value={searchQuery}
            onChange={handleSearchChange}
            onSelect={handleScaleSelect}
          />
        </div>

        <div className="scale-grid">
          {displayedScales.map((scale) => (
            <ScaleCard
              key={scale.id}
              scale={scale}
              rootNote={selectedRoot}
              highlighted={selectedScaleId === scale.id}
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
