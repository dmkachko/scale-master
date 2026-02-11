/**
 * useSequencePlayback Hook
 * Encapsulates all playback functionality for SequenceBuilderPage
 * Feature-specific, not reusable
 */

import { useState, useRef, useCallback } from 'react';
import type { Chord } from '../../music/chordParser';
import type { ChordState } from '../../music/chordProgression';
import { chordToNotes } from '../../music/chordProgression';
import { audioEngine } from '../../services/audioEngine';

interface UseSequencePlaybackOptions {
  tempo: number;
  chordSelectionPlaybackCount: number;
}

interface UseSequencePlaybackReturn {
  playingIndex: number | null;
  handlePlayChord: (chord: Chord | null, beats?: number) => Promise<void>;
  handlePlaySequence: (savedSequence: ChordState[], draft: ChordState | null) => Promise<void>;
  playChordWithPrevious: (chord: Chord, savedSequence: ChordState[], currentBeats?: number) => Promise<void>;
  cancelPlayback: () => void;
}

/**
 * Get bass note for a chord (uses slash chord bass if specified, otherwise root)
 */
function getBassNote(chord: Chord): string {
  const bassNote = chord.bass || chord.root;
  return `${bassNote}2`; // Two octaves below (chord is at octave 4)
}

export function useSequencePlayback(options: UseSequencePlaybackOptions): UseSequencePlaybackReturn {
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
  const handlePlayChord = useCallback(
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
  const handlePlaySequence = useCallback(
    async (savedSequence: ChordState[], draft: ChordState | null) => {
      try {
        const beatDuration = 60000 / tempo;

        // Play all saved chords
        for (let i = 0; i < savedSequence.length; i++) {
          setPlayingIndex(i);
          const state = savedSequence[i];

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
          setPlayingIndex(savedSequence.length);
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
  const playChordWithPrevious = useCallback(
    async (chord: Chord, savedSequence: ChordState[], currentBeats: number = 4) => {
      // Cancel any ongoing playback
      playbackCancelRef.current.cancelled = true;

      // Create new cancel token for this playback
      const cancelToken = { cancelled: false };
      playbackCancelRef.current = cancelToken;

      const beatDuration = 60000 / tempo;

      // Get previous chords to play based on preference
      const previousChords = chordSelectionPlaybackCount > 0
        ? savedSequence.slice(-chordSelectionPlaybackCount)
        : [];

      // Play previous chords for context
      for (const state of previousChords) {
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
    handlePlayChord,
    handlePlaySequence,
    playChordWithPrevious,
    cancelPlayback,
  };
}
