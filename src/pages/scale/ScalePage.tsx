/**
 * Scale Page
 * Individual scale detail page with two-column layout
 */

import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useCatalogStore } from '../../store/catalogStore.ts';
import { usePreferencesStore } from '../../store/preferencesStore.ts';
import { useCatalogInit } from '../../hooks/useCatalogInit.ts';
import RouteGuard from '../../components/RouteGuard.tsx';
import NotFoundPage from '../errors/NotFoundPage.tsx';
import ScaleCard from '../../components/ScaleCard.tsx';
import PatternSelector from '../../components/PatternSelector.tsx';
import TriadsSection from './TriadsSection.tsx';
import RelativesSection from './RelativesSection.tsx';
import { calculateScaleNotes, NOTE_NAMES_SHARP, NOTE_NAMES_FLAT } from '../../music/notes.ts';
import './ScalePage.css';

function ScalePage() {
  useCatalogInit();
  const { scaleId } = useParams<{ scaleId: string }>();
  const [searchParams] = useSearchParams();
  const { catalog, selectedRoot, setSelectedRoot } = useCatalogStore();
  const { playbackPattern, setPlaybackPattern, accidentalPreference } = usePreferencesStore();
  const noteNames = accidentalPreference === 'sharps' ? NOTE_NAMES_SHARP : NOTE_NAMES_FLAT;

  // Handle root query parameter from Scale Finder
  useEffect(() => {
    const rootParam = searchParams.get('root');
    if (rootParam !== null) {
      const rootValue = parseInt(rootParam, 10);
      if (!isNaN(rootValue) && rootValue >= 0 && rootValue <= 11) {
        setSelectedRoot(rootValue);
      }
    }
  }, [searchParams, setSelectedRoot]);

  // Find the scale by ID
  const scale = catalog?.scaleTypes.find((s) => s.id === scaleId);

  // Calculate scale notes for triads
  const scaleNotes = scale ? calculateScaleNotes(selectedRoot, scale.intervals, accidentalPreference === 'sharps') : [];

  return (
    <RouteGuard
      condition={!!scale}
      loading={!catalog}
      fallback={<NotFoundPage />}
    >
      {scale && (
        <div className="scale-page">
          <div className="scale-page-content">
            <div className="scale-page-left">
              <div className="scale-controls">
                <PatternSelector
                  value={playbackPattern}
                  onChange={setPlaybackPattern}
                />

                <div className="root-selector">
                  <label htmlFor="root-select" className="selector-label">Root:</label>
                  <select
                    id="root-select"
                    value={selectedRoot}
                    onChange={(e) => setSelectedRoot(Number(e.target.value))}
                    className="root-select"
                  >
                    {noteNames.map((note, index) => (
                      <option key={index} value={index}>
                        {note}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <ScaleCard scale={scale} rootNote={selectedRoot} showMoreLink={false} />
            </div>

            <div className="scale-page-right">
              <TriadsSection
                scaleNotes={scaleNotes}
                scaleIntervals={scale.intervals}
                scaleFamily={scale.family}
              />
              <RelativesSection
                currentScale={scale}
                allScales={catalog?.scaleTypes || []}
                rootNote={selectedRoot}
                preferSharps={accidentalPreference === 'sharps'}
              />
            </div>
          </div>
        </div>
      )}
    </RouteGuard>
  );
}

export default ScalePage;
