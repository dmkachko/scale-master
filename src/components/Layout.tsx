/**
 * Layout Component
 * Main layout with navigation and content area
 */

import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePreferencesStore } from '../store/preferencesStore';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { accidentalPreference, setAccidentalPreference } = usePreferencesStore();

  const navItems = [
    { path: '/', label: 'Scale Catalog' },
    { path: '/scale-finder', label: 'Scale Finder' },
    { path: '/scale-details', label: 'Scale Details' },
  ];

  return (
    <div className="layout">
      <nav className="nav">
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            <h1 className="nav-title">Scale Master</h1>
          </Link>
          <div className="nav-menu">
            <ul className="nav-links">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="settings-dropdown">
              <button
                className="settings-button"
                onClick={() => setSettingsOpen(!settingsOpen)}
                aria-label="Settings"
              >
                Settings
              </button>
              {settingsOpen && (
                <div className="settings-menu">
                  <div className="settings-section">
                    <h3>Accidental Preference</h3>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="accidentalPreference"
                          value="sharps"
                          checked={accidentalPreference === 'sharps'}
                          onChange={() => setAccidentalPreference('sharps')}
                        />
                        <span>Sharps (#)</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="accidentalPreference"
                          value="flats"
                          checked={accidentalPreference === 'flats'}
                          onChange={() => setAccidentalPreference('flats')}
                        />
                        <span>Flats (♭)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      {settingsOpen && (
        <div className="settings-overlay" onClick={() => setSettingsOpen(false)} />
      )}
      <main className="main-content">{children}</main>
    </div>
  );
}

export default Layout;
