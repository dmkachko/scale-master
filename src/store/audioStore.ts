/**
 * Audio Playback Store
 * Global state for audio playback
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AudioState {
  isPlaying: boolean;
  currentNoteIndex: number | null;
  activeScaleId: string | null;

  // Actions
  setPlaying: (isPlaying: boolean, scaleId?: string) => void;
  setCurrentNoteIndex: (index: number | null) => void;
  stopAll: () => void;
}

export const useAudioStore = create<AudioState>()(
  devtools(
    (set) => ({
      // Initial state
      isPlaying: false,
      currentNoteIndex: null,
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

      stopAll: () =>
        set(
          { isPlaying: false, currentNoteIndex: null, activeScaleId: null },
          false,
          'audio/stopAll'
        ),
    }),
    { name: 'AudioStore' }
  )
);
