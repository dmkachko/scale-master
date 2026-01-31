/**
 * Audio Playback Hook
 * Integration layer between UI and audio engine
 * Uses global audio store for state, commands audio engine
 */

import { useCallback, useEffect } from 'react';
import { audioEngine } from '../services/audioEngine';
import { useAudioStore } from '../store/audioStore';
import type { ScalePattern } from '../services/scalePatterns';

interface UseAudioPlaybackParams {
  scaleId: string;
}

interface UseAudioPlaybackReturn {
  isPlaying: boolean;
  isActiveScale: boolean;
  currentNoteIndex: number | null;
  playNote: (note: string, octave?: number) => Promise<void>;
  togglePlayback: (notes: string[], timeSignature: '4/4' | '3/4', tempo: number, pattern: ScalePattern, octave?: number) => Promise<void>;
}

export function useAudioPlayback({ scaleId }: UseAudioPlaybackParams): UseAudioPlaybackReturn {
  const isPlaying = useAudioStore((state) => state.isPlaying);
  const activeScaleId = useAudioStore((state) => state.activeScaleId);
  const currentNoteIndex = useAudioStore((state) => state.currentNoteIndex);

  const isActiveScale = activeScaleId === scaleId;

  const playNote = useCallback(async (note: string, octave: number = 4) => {
    try {
      await audioEngine.playNote(note, octave);
    } catch (error) {
      console.error('Failed to play note:', error);
    }
  }, []);

  const togglePlayback = useCallback(async (
    notes: string[],
    timeSignature: '4/4' | '3/4',
    tempo: number,
    pattern: ScalePattern,
    octave: number = 4
  ) => {
    try {
      // If this scale is playing, stop it
      if (isActiveScale && isPlaying) {
        audioEngine.stop();
      } else {
        // Stop any other playing scale and start this one
        audioEngine.stop();
        await audioEngine.startSequence(scaleId, notes, timeSignature, tempo, pattern, octave);
      }
    } catch (error) {
      console.error('Failed to toggle playback:', error);
      audioEngine.stop();
    }
  }, [scaleId, isActiveScale, isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Only stop if this scale is the active one
      if (isActiveScale && isPlaying) {
        audioEngine.stop();
      }
    };
  }, [isActiveScale, isPlaying]);

  return {
    isPlaying: isActiveScale && isPlaying,
    isActiveScale,
    currentNoteIndex: isActiveScale ? currentNoteIndex : null,
    playNote,
    togglePlayback,
  };
}
