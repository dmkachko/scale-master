/**
 * Scale Page
 * Individual scale detail page with two-column layout
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCatalogStore } from '../store/catalogStore';
import { useCatalogInit } from '../hooks/useCatalogInit';
import ScaleCard from '../components/ScaleCard';
import './ScalePage.css';

function ScalePage() {
  useCatalogInit();
  const { scaleId } = useParams<{ scaleId: string }>();
  const navigate = useNavigate();
  const { status, catalog, error, selectedRoot } = useCatalogStore();

  // Find the scale by ID
  const scale = catalog?.scaleTypes.find((s) => s.id === scaleId);

  // Render loading state
  if (status === 'loading') {
    return (
      <div className="scale-page">
        <div className="scale-page-status">
          <p>Loading scale catalog...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (status === 'error') {
    return (
      <div className="scale-page">
        <div className="error-banner">
          <h2>Error Loading Catalog</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Scale not found
  if (!scale) {
    return (
      <div className="scale-page">
        <nav className="scale-page-nav">
          <Link to="/" className="back-link">
            ← Back to Catalog
          </Link>
        </nav>
        <div className="error-banner">
          <h2>Scale Not Found</h2>
          <p>The scale "{scaleId}" does not exist in the catalog.</p>
          <button onClick={() => navigate('/')}>Return to Catalog</button>
        </div>
      </div>
    );
  }

  return (
    <div className="scale-page">
      <nav className="scale-page-nav">
        <Link to="/" className="back-link">
          ← Back to Catalog
        </Link>
      </nav>

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
  );
}

export default ScalePage;
