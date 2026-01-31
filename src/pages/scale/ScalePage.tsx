/**
 * Scale Page
 * Individual scale detail page with two-column layout
 */

import { useParams } from 'react-router-dom';
import { useCatalogStore } from '../../store/catalogStore.ts';
import { usePreferencesStore } from '../../store/preferencesStore.ts';
import { useCatalogInit } from '../../hooks/useCatalogInit.ts';
import RouteGuard from '../../components/RouteGuard.tsx';
import NotFoundPage from '../errors/NotFoundPage.tsx';
import ScaleCard from '../../components/ScaleCard.tsx';
import { patterns, type ScalePattern } from '../../services/scalePatterns.ts';
import './ScalePage.css';

function ScalePage() {
  useCatalogInit();
  const { scaleId } = useParams<{ scaleId: string }>();
  const { catalog, selectedRoot } = useCatalogStore();
  const { playbackPattern, setPlaybackPattern } = usePreferencesStore();

  // Find the scale by ID
  const scale = catalog?.scaleTypes.find((s) => s.id === scaleId);

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
              <div className="pattern-selector">
                {Object.values(patterns).map((pattern) => (
                  <label key={pattern.id} className="pattern-option">
                    <input
                      type="radio"
                      name="pattern"
                      value={pattern.id}
                      checked={playbackPattern === pattern.id}
                      onChange={() => setPlaybackPattern(pattern.id as ScalePattern)}
                    />
                    <span className="pattern-name">{pattern.name}</span>
                  </label>
                ))}
              </div>

              <ScaleCard scale={scale} rootNote={selectedRoot} showMoreLink={false} />
            </div>

            <div className="scale-page-right">
              <div className="additional-info-placeholder">
                <h3>Additional Information</h3>
                <p>This section will contain:</p>
                <ul>
                  <li>Chord progressions</li>
                  <li>Common usage patterns</li>
                  <li>Related scales</li>
                  <li>Musical examples</li>
                  <li>Practice exercises</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </RouteGuard>
  );
}

export default ScalePage;
