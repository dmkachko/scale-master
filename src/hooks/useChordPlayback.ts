/**
 * useChordPlayback Hook
 * Handles chord playback orchestration including bass notes, tempo, and sequence playback
 */

import { useState, useRef, useCallback } from 'react';
import type { Chord } from '../music/chordParser';
import { chordToNotes } from '../music/chordProgression';
import { audioEngine } from '../services/audioEngine';

interface SequenceState {
  chord: Chord | null;
  beats: number;
  s1?: { scale: string; root: string };
  s2?: { scale: string; root: string };
}

interface UseChordPlaybackOptions {
  tempo: number;
  chordSelectionPlaybackCount: number;
}

interface UseChordPlaybackReturn {
  playingIndex: number | null;
  playChord: (chord: Chord | null, beats?: number) => Promise<void>;
  playSequence: (sequence: SequenceState[], draft: SequenceState | null) => Promise<void>;
  playChordWithContext: (
    chord: Chord,
    previousChords: SequenceState[],
    currentBeats?: number
  ) => Promise<void>;
  cancelPlayback: () => void;
}

/**
 * Get bass note for a chord (uses slash chord bass if specified, otherwise root)
 */
function getBassNote(chord: Chord): string {
  const bassNote = chord.bass || chord.root;
  return `${bassNote}2`; // Two octaves below (chord is at octave 4)
}

export function useChordPlayback(options: UseChordPlaybackOptions): UseChordPlaybackReturn {
  const { tempo, chordSelectionPlaybackCount } = options;
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const playbackCancelRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  /**
   * Cancel any ongoing playback
   */
  const cancelPlayback = useCallback(() => {
    playbackCancelRef.current.cancelled = true;
  }, []);

  /**
   * Play a single chord
   */
  const playChord = useCallback(
    async (chord: Chord | null, beats: number = 4) => {
      if (!chord) return;

      const notes = chordToNotes(chord);
      if (notes.length > 0) {
        const bassNote = getBassNote(chord);
        const chordNotes = notes.map(note => `${note}4`);
        const durationSeconds = (60 / tempo) * beats;
        await audioEngine.playChord([bassNote, ...chordNotes], undefined, `${durationSeconds}s`);
      }
    },
    [tempo]
  );

  /**
   * Play entire sequence including draft
   */
  const playSequence = useCallback(
    async (sequence: SequenceState[], draft: SequenceState | null) => {
      try {
        const beatDuration = 60000 / tempo;

        // Play all saved chords
        for (let i = 0; i < sequence.length; i++) {
          setPlayingIndex(i);
          const state = sequence[i];

          if (state.chord) {
            const notes = chordToNotes(state.chord);
            if (notes.length > 0) {
              const bassNote = getBassNote(state.chord);
              const chordNotes = notes.map(note => `${note}4`);
              const beats = state.beats || 4;
              const durationSeconds = (60 / tempo) * beats;

              await audioEngine.playChord([bassNote, ...chordNotes], undefined, `${durationSeconds}s`);
              await new Promise(resolve => setTimeout(resolve, beatDuration * beats));
            }
          }
        }

        // Play draft chord if it exists
        if (draft && draft.chord) {
          setPlayingIndex(sequence.length);
          const notes = chordToNotes(draft.chord);
          if (notes.length > 0) {
            const bassNote = getBassNote(draft.chord);
            const chordNotes = notes.map(note => `${note}4`);
            const beats = draft.beats || 4;
            const durationSeconds = (60 / tempo) * beats;

            await audioEngine.playChord([bassNote, ...chordNotes], undefined, `${durationSeconds}s`);
            await new Promise(resolve => setTimeout(resolve, beatDuration * beats));
          }
        }

        setPlayingIndex(null);
      } catch (error) {
        console.error('Error playing sequence:', error);
        setPlayingIndex(null);
      }
    },
    [tempo]
  );

  /**
   * Play chord with context of previous chords
   */
  const playChordWithContext = useCallback(
    async (chord: Chord, previousChords: SequenceState[], currentBeats: number = 4) => {
      const cancelToken = { cancelled: false };
      playbackCancelRef.current = cancelToken;

      const beatDuration = 60000 / tempo;

      // Get previous chords to play based on preference
      const contextChords = chordSelectionPlaybackCount > 0
        ? previousChords.slice(-chordSelectionPlaybackCount)
        : [];

      // Play previous chords for context
      for (const state of contextChords) {
        if (cancelToken.cancelled) return;

        if (state.chord) {
          const notes = chordToNotes(state.chord);
          if (notes.length > 0) {
            const bassNote = getBassNote(state.chord);
            const chordNotes = notes.map(note => `${note}4`);
            const beats = state.beats || 4;
            const durationSeconds = (60 / tempo) * beats;
            await audioEngine.playChord([bassNote, ...chordNotes], undefined, `${durationSeconds}s`);
            await new Promise(resolve => setTimeout(resolve, beatDuration * beats));
          }
        }
      }

      if (cancelToken.cancelled) return;

      // Play the newly selected chord
      const notes = chordToNotes(chord);
      if (notes.length > 0) {
        const bassNote = getBassNote(chord);
        const chordNotes = notes.map(note => `${note}4`);
        const durationSeconds = (60 / tempo) * currentBeats;
        await audioEngine.playChord([bassNote, ...chordNotes], undefined, `${durationSeconds}s`);
      }
    },
    [tempo, chordSelectionPlaybackCount]
  );

  return {
    playingIndex,
    playChord,
    playSequence,
    playChordWithContext,
    cancelPlayback,
  };
}
