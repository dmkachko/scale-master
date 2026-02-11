/**
 * SettingsPanel Component
 * Settings dropdown panel with all preferences
 */

interface SynthSettings {
  pads: { volume: number };
  melody: { volume: number };
  bass: { volume: number };
}

interface VelocitySettings {
  normal: number;
  accented: number;
}

interface SettingsPanelProps {
  isOpen: boolean;
  accidentalPreference: 'sharps' | 'flats';
  timeSignature: '4/4' | '3/4';
  tempo: number;
  chordSelectionPlaybackCount: number;
  synthSettings: SynthSettings;
  velocitySettings: VelocitySettings;
  onAccidentalPreferenceChange: (pref: 'sharps' | 'flats') => void;
  onTimeSignatureChange: (sig: '4/4' | '3/4') => void;
  onTempoChange: (tempo: number) => void;
  onChordPlaybackCountChange: (count: number) => void;
  onSynthVolumeChange: (type: 'pads' | 'melody' | 'bass', volume: number) => void;
  onVelocityChange: (type: 'normal' | 'accented', value: number) => void;
}

export default function SettingsPanel({
  isOpen,
  accidentalPreference,
  timeSignature,
  tempo,
  chordSelectionPlaybackCount,
  synthSettings,
  velocitySettings,
  onAccidentalPreferenceChange,
  onTimeSignatureChange,
  onTempoChange,
  onChordPlaybackCountChange,
  onSynthVolumeChange,
  onVelocityChange,
}: SettingsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="settings-menu">
      {/* Accidental Preference */}
      <div className="settings-section">
        <h3>Accidental Preference</h3>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="accidentalPreference"
              value="sharps"
              checked={accidentalPreference === 'sharps'}
              onChange={() => onAccidentalPreferenceChange('sharps')}
            />
            <span>Sharps (#)</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="accidentalPreference"
              value="flats"
              checked={accidentalPreference === 'flats'}
              onChange={() => onAccidentalPreferenceChange('flats')}
            />
            <span>Flats (♭)</span>
          </label>
        </div>
      </div>

      {/* Time Signature */}
      <div className="settings-section">
        <h3>Time Signature</h3>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="timeSignature"
              value="4/4"
              checked={timeSignature === '4/4'}
              onChange={() => onTimeSignatureChange('4/4')}
            />
            <span>4/4 (Common Time)</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="timeSignature"
              value="3/4"
              checked={timeSignature === '3/4'}
              onChange={() => onTimeSignatureChange('3/4')}
            />
            <span>3/4 (Waltz)</span>
          </label>
        </div>
      </div>

      {/* Tempo */}
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
              onChange={(e) => onTempoChange(Number(e.target.value))}
              className="tempo-slider"
            />
          </label>
        </div>
      </div>

      {/* Chord Selection Playback */}
      <div className="settings-section">
        <h3>Chord Selection Playback</h3>
        <div className="slider-group">
          <label className="slider-label">
            <span>
              {chordSelectionPlaybackCount === 0
                ? 'Current chord only'
                : chordSelectionPlaybackCount === 1
                ? 'Previous + current'
                : `Previous ${chordSelectionPlaybackCount} + current`}
            </span>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={chordSelectionPlaybackCount}
              onChange={(e) => onChordPlaybackCountChange(Number(e.target.value))}
              className="tempo-slider"
            />
          </label>
        </div>
      </div>

      {/* Synth Volumes */}
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
              onChange={(e) => onSynthVolumeChange('pads', Number(e.target.value))}
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
              onChange={(e) => onSynthVolumeChange('melody', Number(e.target.value))}
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
              onChange={(e) => onSynthVolumeChange('bass', Number(e.target.value))}
              className="tempo-slider"
            />
          </label>
        </div>
      </div>

      {/* Note Velocities */}
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
              onChange={(e) => onVelocityChange('normal', Number(e.target.value) / 100)}
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
              onChange={(e) => onVelocityChange('accented', Number(e.target.value) / 100)}
              className="tempo-slider"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
