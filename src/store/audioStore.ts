/**
 * Audio Playback Store
 * Global state for audio playback
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AudioState {
  isPlaying: boolean;
  currentNoteIndex: number | null;
  currentNoteStep: number | null; // Which scale degree (0-7) is playing
  activeScaleId: string | null;

  // Actions
  setPlaying: (isPlaying: boolean, scaleId?: string) => void;
  setCurrentNoteIndex: (index: number | null) => void;
  setCurrentNote: (index: number | null, step: number | null) => void;
  stopAll: () => void;
}

export const useAudioStore = create<AudioState>()(
  devtools(
    (set) => ({
      // Initial state
      isPlaying: false,
      currentNoteIndex: null,
      currentNoteStep: null,
      activeScaleId: null,

      // Actions
      setPlaying: (isPlaying, scaleId) =>
        set(
          { isPlaying, activeScaleId: isPlaying ? scaleId || null : null },
          false,
          'audio/setPlaying'
        ),

      setCurrentNoteIndex: (index) =>
        set(
          { currentNoteIndex: index },
          false,
          'audio/setCurrentNoteIndex'
        ),

      setCurrentNote: (index, step) =>
        set(
          { currentNoteIndex: index, currentNoteStep: step },
          false,
          'audio/setCurrentNote'
        ),

      stopAll: () =>
        set(
          { isPlaying: false, currentNoteIndex: null, currentNoteStep: null, activeScaleId: null },
          false,
          'audio/stopAll'
        ),
    }),
    { name: 'AudioStore' }
  )
);
