/**
 * Scale Catalog Page
 * Displays all available scales with a root selector
 */

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
    const selectedNoteName = noteNames[selectedRoot];

    return (
      <div className="page-container">
        <div className="catalog-status">
          <p className="status-ready">
            Catalog ready: {catalog.scaleTypes.length} scale types loaded
          </p>
        </div>

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

        <div className="scale-list">
          <h2>Available Scales - {selectedNoteName}</h2>
          <div className="scale-grid">
            {catalog.scaleTypes.map((scale) => (
              <ScaleCard key={scale.id} scale={scale} rootNote={selectedRoot} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Idle state (should not be reached)
  return null;
}

export default ScaleCatalogPage;
