/**
 * useTriadPlayback Hook
 * Handles triad playback with proper octave handling and extension notes
 */

import { useState, useMemo } from 'react';
import { audioEngine } from '../services/audioEngine';
import { addOctavesToNotes, getPitchClassFromNote } from '../music/notes';
import type { Triad } from '../music/triads';

type PlaybackMode = 'chord' | 'arpeggio';

interface UseTriadPlaybackOptions {
  scaleNotes: string[];
  scaleIntervals: number[];
}

interface UseTriadPlaybackReturn {
  playingTriad: number | null;
  playbackMode: PlaybackMode;
  setPlaybackMode: (mode: PlaybackMode) => void;
  playTriad: (triad: Triad, index: number, extensionLabel?: string) => Promise<void>;
  getTriadNotesWithOctaves: (triad: Triad) => string[];
}

/**
 * Extension interval mapping
 */
const EXTENSION_INTERVAL_MAP: Record<string, number> = {
  'alt5': 8,  // Alternative 5th (augmented 5th)
  'b5': 6,    // Flat 5th
  '#5': 8,    // Sharp 5th (same as aug 5th)
  '6': 9,     // Major 6th
  '7': 10,    // Minor 7th
  'maj7': 11  // Major 7th
};

export function useTriadPlayback(options: UseTriadPlaybackOptions): UseTriadPlaybackReturn {
  const { scaleNotes, scaleIntervals } = options;
  const [playingTriad, setPlayingTriad] = useState<number | null>(null);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('chord');

  /**
   * Calculate notes with proper octaves for the scale
   */
  const noteToOctaveMap = useMemo(() => {
    const scaleNotesWithOctaves = addOctavesToNotes(scaleNotes, 4);
    const map = new Map<string, string>();
    scaleNotes.forEach((note, idx) => {
      map.set(note, scaleNotesWithOctaves[idx]);
    });
    return map;
  }, [scaleNotes]);

  /**
   * Map triad notes to notes with proper octaves from the scale
   */
  const getTriadNotesWithOctaves = (triad: Triad): string[] => {
    const notesWithOctaves = triad.notes.map(note => noteToOctaveMap.get(note) || `${note}4`);

    // Parse root note to get its MIDI pitch
    const rootMatch = notesWithOctaves[0].match(/^([A-G][#b]?)(\d+)$/);
    if (!rootMatch) return notesWithOctaves;

    const [, rootNoteName, rootOctaveStr] = rootMatch;
    const rootOctave = parseInt(rootOctaveStr);
    const rootPitchClass = getPitchClassFromNote(rootNoteName);
    const rootMidiPitch = rootOctave * 12 + rootPitchClass;

    // Ensure all notes are at or above the root's pitch
    return notesWithOctaves.map((noteWithOctave, idx) => {
      if (idx === 0) return noteWithOctave; // Root stays as is

      const match = noteWithOctave.match(/^([A-G][#b]?)(\d+)$/);
      if (!match) return noteWithOctave;

      const [, noteName, octaveStr] = match;
      const octave = parseInt(octaveStr);
      const pitchClass = getPitchClassFromNote(noteName);
      const midiPitch = octave * 12 + pitchClass;

      // If this note's pitch is less than root's pitch, bump it up an octave
      if (midiPitch < rootMidiPitch) {
        return `${noteName}${octave + 1}`;
      }

      return noteWithOctave;
    });
  };

  /**
   * Calculate extension note from extension label
   */
  const getExtensionNote = (triad: Triad, extensionLabel: string): string => {
    const rootNoteName = triad.root;
    const rootWithOctave = noteToOctaveMap.get(rootNoteName) || `${rootNoteName}4`;

    // Parse root to get octave
    const match = rootWithOctave.match(/^([A-G][#b]?)(\d+)$/);
    if (!match) return rootWithOctave;

    const [, , octaveStr] = match;
    const octave = parseInt(octaveStr);
    const rootPitchClass = getPitchClassFromNote(rootNoteName);

    const interval = EXTENSION_INTERVAL_MAP[extensionLabel];
    if (interval === undefined) return rootWithOctave;

    // Find which scale note has the target interval from the triad root
    const triadRootIndex = scaleNotes.indexOf(rootNoteName);
    if (triadRootIndex === -1) return rootWithOctave;

    const triadRootInterval = scaleIntervals[triadRootIndex];

    // Search for the scale note that is 'interval' semitones above the triad root
    let extensionNoteName: string | null = null;
    for (let i = 0; i < scaleNotes.length; i++) {
      const scaleNoteInterval = scaleIntervals[i];
      const intervalFromTriadRoot = (scaleNoteInterval - triadRootInterval + 12) % 12;

      if (intervalFromTriadRoot === interval) {
        extensionNoteName = scaleNotes[i];
        break;
      }
    }

    // Fallback to chromatic note names if not found in scale
    if (!extensionNoteName) {
      const targetPitchClass = (rootPitchClass + interval) % 12;
      const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      extensionNoteName = noteNames[targetPitchClass];
    }

    // Calculate the correct octave
    const extensionPitchClass = getPitchClassFromNote(extensionNoteName);
    const rootMidiPitch = octave * 12 + rootPitchClass;

    // Extension should be 'interval' semitones above root
    let extensionOctave = octave;
    let extensionMidiPitch = extensionOctave * 12 + extensionPitchClass;

    // If the extension pitch is below root, move to next octave
    while (extensionMidiPitch < rootMidiPitch) {
      extensionOctave++;
      extensionMidiPitch = extensionOctave * 12 + extensionPitchClass;
    }

    return `${extensionNoteName}${extensionOctave}`;
  };

  /**
   * Play a triad with optional extension
   */
  const playTriad = async (triad: Triad, index: number, extensionLabel?: string) => {
    setPlayingTriad(index);
    try {
      let notesWithOctaves = getTriadNotesWithOctaves(triad);

      // Add extension note if provided
      if (extensionLabel) {
        const extensionNote = getExtensionNote(triad, extensionLabel);
        notesWithOctaves = [...notesWithOctaves, extensionNote];
      }

      // Play based on mode
      if (playbackMode === 'arpeggio') {
        await audioEngine.playArpeggio(notesWithOctaves);
      } else {
        await audioEngine.playChord(notesWithOctaves);
      }
    } catch (error) {
      console.error('Error playing triad:', error);
    } finally {
      setPlayingTriad(null);
    }
  };

  return {
    playingTriad,
    playbackMode,
    setPlaybackMode,
    playTriad,
    getTriadNotesWithOctaves,
  };
}
