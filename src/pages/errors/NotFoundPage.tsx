/**
 * Not Found Page (404)
 * Displayed when user navigates to a non-existent route
 */

import { Link, useLocation } from 'react-router-dom';
import './NotFoundPage.css';

function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>

        <p className="not-found-message">
          The page <code>{location.pathname}</code> does not exist.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="button-primary">
            Go to Catalog
          </Link>
          <Link to="/scale-finder" className="button-secondary">
            Scale Finder
          </Link>
        </div>

        <div className="not-found-help">
          <h3>Looking for something?</h3>
          <ul>
            <li>
              <Link to="/">Scale Catalog</Link> - Browse all available scales
            </li>
            <li>
              <Link to="/scale-finder">Scale Finder</Link> - Find scales by notes
            </li>
            <li>
              <Link to="/scale-details">Scale Details</Link> - Explore scale relationships
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
