/**
 * Scale Finder Page
 * Find scales that contain given notes (US-07)
 * Placeholder for future implementation
 */

import { useCatalogInit } from '../hooks/useCatalogInit';
import './PlaceholderPage.css';

function ScaleFinderPage() {
  useCatalogInit();

  return (
    <div className="placeholder-page">
      <div className="placeholder-content">
        <h2>Scale Finder</h2>
        <p className="placeholder-description">
          Enter notes to find which scales contain them.
        </p>
        <div className="placeholder-features">
          <h3>Coming Soon:</h3>
          <ul>
            <li>Input notes by typing (e.g., "C E G")</li>
            <li>Visual note picker</li>
            <li>Find all scales containing input notes</li>
            <li>Sort by fewest extra notes</li>
            <li>Click to view scale details</li>
          </ul>
        </div>
        <p className="placeholder-note">
          <strong>User Story:</strong> US-07, US-08, US-09
        </p>
      </div>
    </div>
  );
}

export default ScaleFinderPage;
