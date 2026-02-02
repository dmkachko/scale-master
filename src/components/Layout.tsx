/**
 * Layout Component
 * Main layout with navigation and content area
 */

import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePreferencesStore } from '../store/preferencesStore';
import { audioEngine } from '../services/audioEngine';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    accidentalPreference,
    setAccidentalPreference,
    timeSignature,
    setTimeSignature,
    tempo,
    setTempo,
    activeSynthType,
    setActiveSynthType,
    synthSettings,
    setSynthVolume,
    velocitySettings,
    setVelocity,
  } = usePreferencesStore();

  const navItems = [
    { path: '/', label: 'Scale Catalog' },
    { path: '/scale-finder', label: 'Scale Finder' },
    { path: '/chord-search', label: 'Chord Search' },
  ];

  const handleSynthVolumeChange = (type: 'pads' | 'melody' | 'bass', volume: number) => {
    setSynthVolume(type, volume);
    audioEngine.updateSynthVolume(type, volume);
  };

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

                  <div className="settings-section">
                    <h3>Time Signature</h3>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="timeSignature"
                          value="4/4"
                          checked={timeSignature === '4/4'}
                          onChange={() => setTimeSignature('4/4')}
                        />
                        <span>4/4 (Common Time)</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="timeSignature"
                          value="3/4"
                          checked={timeSignature === '3/4'}
                          onChange={() => setTimeSignature('3/4')}
                        />
                        <span>3/4 (Waltz)</span>
                      </label>
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3>Tempo</h3>
                    <div className="slider-group">
                      <label className="slider-label">
                        <span>{tempo} BPM</span>
                        <input
                          type="range"
                          min="60"
                          max="240"
                          step="10"
                          value={tempo}
                          onChange={(e) => setTempo(Number(e.target.value))}
                          className="tempo-slider"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3>Synth Type</h3>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="synthType"
                          value="pads"
                          checked={activeSynthType === 'pads'}
                          onChange={() => setActiveSynthType('pads')}
                        />
                        <span>Pads (Soft)</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="synthType"
                          value="melody"
                          checked={activeSynthType === 'melody'}
                          onChange={() => setActiveSynthType('melody')}
                        />
                        <span>Melody (Clear)</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="synthType"
                          value="bass"
                          checked={activeSynthType === 'bass'}
                          onChange={() => setActiveSynthType('bass')}
                        />
                        <span>Bass (Deep)</span>
                      </label>
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3>Synth Volumes</h3>
                    <div className="slider-group">
                      <label className="slider-label">
                        <span>Pads: {synthSettings.pads.volume}%</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={synthSettings.pads.volume}
                          onChange={(e) => handleSynthVolumeChange('pads', Number(e.target.value))}
                          className="tempo-slider"
                        />
                      </label>
                      <label className="slider-label">
                        <span>Melody: {synthSettings.melody.volume}%</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={synthSettings.melody.volume}
                          onChange={(e) => handleSynthVolumeChange('melody', Number(e.target.value))}
                          className="tempo-slider"
                        />
                      </label>
                      <label className="slider-label">
                        <span>Bass: {synthSettings.bass.volume}%</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={synthSettings.bass.volume}
                          onChange={(e) => handleSynthVolumeChange('bass', Number(e.target.value))}
                          className="tempo-slider"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="settings-section">
                    <h3>Note Velocities</h3>
                    <div className="slider-group">
                      <label className="slider-label">
                        <span>Normal: {Math.round(velocitySettings.normal * 100)}%</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={velocitySettings.normal * 100}
                          onChange={(e) => setVelocity('normal', Number(e.target.value) / 100)}
                          className="tempo-slider"
                        />
                      </label>
                      <label className="slider-label">
                        <span>Accented: {Math.round(velocitySettings.accented * 100)}%</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={velocitySettings.accented * 100}
                          onChange={(e) => setVelocity('accented', Number(e.target.value) / 100)}
                          className="tempo-slider"
                        />
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
