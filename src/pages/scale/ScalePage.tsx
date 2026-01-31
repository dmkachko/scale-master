/**
 * Scale Page
 * Individual scale detail page with two-column layout
 */

import { useParams } from 'react-router-dom';
import { useCatalogStore } from '../../store/catalogStore.ts';
import { useCatalogInit } from '../../hooks/useCatalogInit.ts';
import RouteGuard from '../../components/RouteGuard.tsx';
import NotFoundPage from '../errors/NotFoundPage.tsx';
import ScaleCard from '../../components/ScaleCard.tsx';
import './ScalePage.css';

function ScalePage() {
  useCatalogInit();
  const { scaleId } = useParams<{ scaleId: string }>();
  const { catalog, selectedRoot } = useCatalogStore();

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
