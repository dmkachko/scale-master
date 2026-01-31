/**
 * Preferences Store
 * User preferences for note spelling and other settings
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { ScalePattern } from '../services/scalePatterns';

type AccidentalPreference = 'sharps' | 'flats';
type TimeSignature = '4/4' | '3/4';
type SynthType = 'pads' | 'melody' | 'bass';

interface SynthSettings {
  volume: number; // 0-100
}

interface VelocitySettings {
  normal: number; // 0-1
  accented: number; // 0-1
}

interface PreferencesState {
  accidentalPreference: AccidentalPreference;
  timeSignature: TimeSignature;
  tempo: number; // BPM
  playbackPattern: ScalePattern;

  // Synth settings
  activeSynthType: SynthType;
  synthSettings: {
    pads: SynthSettings;
    melody: SynthSettings;
    bass: SynthSettings;
  };
  velocitySettings: VelocitySettings;

  // Actions
  setAccidentalPreference: (preference: AccidentalPreference) => void;
  toggleAccidentalPreference: () => void;
  setTimeSignature: (signature: TimeSignature) => void;
  setTempo: (tempo: number) => void;
  setPlaybackPattern: (pattern: ScalePattern) => void;
  setActiveSynthType: (type: SynthType) => void;
  setSynthVolume: (type: SynthType, volume: number) => void;
  setVelocity: (type: 'normal' | 'accented', velocity: number) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        accidentalPreference: 'sharps',
        timeSignature: '4/4',
        tempo: 120,
        playbackPattern: 'alternating',
        activeSynthType: 'melody',
        synthSettings: {
          pads: { volume: 60 },
          melody: { volume: 80 },
          bass: { volume: 70 },
        },
        velocitySettings: {
          normal: 0.5,
          accented: 1.0,
        },

        // Actions
        setAccidentalPreference: (preference) =>
          set(
            { accidentalPreference: preference },
            false,
            'preferences/setAccidentalPreference'
          ),

        toggleAccidentalPreference: () =>
          set(
            (state) => ({
              accidentalPreference: state.accidentalPreference === 'sharps' ? 'flats' : 'sharps',
            }),
            false,
            'preferences/toggleAccidentalPreference'
          ),

        setTimeSignature: (signature) =>
          set(
            { timeSignature: signature },
            false,
            'preferences/setTimeSignature'
          ),

        setTempo: (tempo) =>
          set(
            { tempo },
            false,
            'preferences/setTempo'
          ),

        setPlaybackPattern: (pattern) =>
          set(
            { playbackPattern: pattern },
            false,
            'preferences/setPlaybackPattern'
          ),

        setActiveSynthType: (type) =>
          set(
            { activeSynthType: type },
            false,
            'preferences/setActiveSynthType'
          ),

        setSynthVolume: (type, volume) =>
          set(
            (state) => ({
              synthSettings: {
                ...state.synthSettings,
                [type]: { ...state.synthSettings[type], volume },
              },
            }),
            false,
            'preferences/setSynthVolume'
          ),

        setVelocity: (type, velocity) =>
          set(
            (state) => ({
              velocitySettings: {
                ...state.velocitySettings,
                [type]: velocity,
              },
            }),
            false,
            'preferences/setVelocity'
          ),
      }),
      {
        name: 'scale-master-preferences',
      }
    ),
    { name: 'PreferencesStore' }
  )
);
