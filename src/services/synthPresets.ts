/**
 * Synth Presets
 * Tone.js synth configurations for different timbres
 */

import * as Tone from 'tone';

export type SynthType = 'pads' | 'melody' | 'bass';

export interface SynthConfig {
  oscillator: {
    type: Tone.ToneOscillatorType;
  };
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
}

/**
 * Synth presets for different musical roles
 */
export const synthPresets: Record<SynthType, SynthConfig> = {
  // Pads - Soft, sustained, atmospheric
  pads: {
    oscillator: {
      type: 'sine',
    },
    envelope: {
      attack: 0.5,
      decay: 0.3,
      sustain: 0.8,
      release: 2.0,
    },
  },

  // Melody - Clear, articulate, musical
  melody: {
    oscillator: {
      type: 'triangle',
    },
    envelope: {
      attack: 0.02,
      decay: 0.1,
      sustain: 0.3,
      release: 0.5,
    },
  },

  // Bass - Deep, punchy, powerful
  bass: {
    oscillator: {
      type: 'sawtooth',
    },
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.4,
      release: 0.3,
    },
  },
};

/**
 * Create a synth with the given preset
 */
export function createSynth(type: SynthType, volumeDb: number): Tone.PolySynth {
  const preset = synthPresets[type];
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: preset.oscillator,
    envelope: preset.envelope,
    volume: volumeDb,
  }).toDestination();

  return synth;
}

/**
 * Convert volume percentage (0-100) to decibels
 */
export function volumeToDb(volumePercent: number): number {
  if (volumePercent === 0) return -Infinity;
  // Convert 0-100 to -40 to 0 dB range
  return (volumePercent / 100) * 40 - 40;
}
