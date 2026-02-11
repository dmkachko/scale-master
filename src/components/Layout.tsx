/**
 * Layout Component
 * Main layout with navigation and content area
 */

import { ReactNode, useState } from 'react';
import { usePreferencesStore } from '../store/preferencesStore';
import { audioEngine } from '../services/audioEngine';
import NavigationBar from './layout/NavigationBar';
import SettingsPanel from './layout/SettingsPanel';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  // State selectors (only re-render when these specific values change)
  const accidentalPreference = usePreferencesStore(state => state.accidentalPreference);
  const timeSignature = usePreferencesStore(state => state.timeSignature);
  const tempo = usePreferencesStore(state => state.tempo);
  const chordSelectionPlaybackCount = usePreferencesStore(state => state.chordSelectionPlaybackCount);
  const synthSettings = usePreferencesStore(state => state.synthSettings);
  const velocitySettings = usePreferencesStore(state => state.velocitySettings);

  // Actions (stable references, won't cause re-renders)
  const setAccidentalPreference = usePreferencesStore(state => state.setAccidentalPreference);
  const setTimeSignature = usePreferencesStore(state => state.setTimeSignature);
  const setTempo = usePreferencesStore(state => state.setTempo);
  const setChordSelectionPlaybackCount = usePreferencesStore(state => state.setChordSelectionPlaybackCount);
  const setSynthVolume = usePreferencesStore(state => state.setSynthVolume);
  const setVelocity = usePreferencesStore(state => state.setVelocity);

  const navItems = [
    { path: '/', label: 'Scale Catalog' },
    { path: '/scale-finder', label: 'Scale Finder' },
    { path: '/chord-search', label: 'Chord Search' },
    { path: '/sequence-builder', label: 'Sequence Builder' },
  ];

  const handleSynthVolumeChange = (type: 'pads' | 'melody' | 'bass', volume: number) => {
    setSynthVolume(type, volume);
    audioEngine.updateSynthVolume(type, volume);
  };

  return (
    <div className="layout">
      <NavigationBar
        navItems={navItems}
        onSettingsClick={() => setSettingsOpen(!settingsOpen)}
      />

      {settingsOpen && (
        <div className="settings-dropdown">
          <SettingsPanel
            isOpen={settingsOpen}
            accidentalPreference={accidentalPreference}
            timeSignature={timeSignature}
            tempo={tempo}
            chordSelectionPlaybackCount={chordSelectionPlaybackCount}
            synthSettings={synthSettings}
            velocitySettings={velocitySettings}
            onAccidentalPreferenceChange={setAccidentalPreference}
            onTimeSignatureChange={setTimeSignature}
            onTempoChange={setTempo}
            onChordPlaybackCountChange={setChordSelectionPlaybackCount}
            onSynthVolumeChange={handleSynthVolumeChange}
            onVelocityChange={setVelocity}
          />
        </div>
      )}

      {settingsOpen && (
        <div className="settings-overlay" onClick={() => setSettingsOpen(false)} />
      )}
      <main className="main-content">{children}</main>
    </div>
  );
}

export default Layout;
