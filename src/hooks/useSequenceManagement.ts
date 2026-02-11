/**
 * useSequenceManagement Hook
 * Manages sequence state including draft/edit modes, scale selection, and chord operations
 */

import { useState, useCallback, useMemo } from 'react';
import type { Chord } from '../music/chordParser';
import { parseChord } from '../music/chordParser';
import { getPitchClassFromNote } from '../music/notes';
import type { ScaleType } from '../types/catalog';

interface SequenceState {
  chord: Chord | null;
  beats: number;
  s1?: { scale: string; root: string };
  s2?: { scale: string; root: string };
}

interface UseSequenceManagementOptions {
  draft: SequenceState | null;
  savedSequence: SequenceState[];
  accidentalPreference: 'sharps' | 'flats';
  catalog?: { scaleTypes: ScaleType[] } | null;
  onSelectChord: (chord: Chord) => void;
  onSaveDraft: () => void;
  onUpdateSequence: (updater: (state: { savedSequence: SequenceState[] }) => { savedSequence: SequenceState[] }) => void;
  onUpdateDraft: (updater: (state: { draft: SequenceState | null }) => { draft: SequenceState | null }) => void;
}

interface UseSequenceManagementReturn {
  editingIndex: number | null;
  selectedBassNote: string | null;
  availableBassNotes: string[];
  canSaveDraft: boolean;
  setEditingIndex: (index: number | null) => void;
  setSelectedBassNote: (note: string | null) => void;
  handleSelectScale: (scaleName: string, root: string) => void;
  handleSelectScale2: (scaleName: string, root: string) => void;
  applyBassNote: (chord: Chord) => Chord;
}

export function useSequenceManagement(options: UseSequenceManagementOptions): UseSequenceManagementReturn {
  const {
    draft,
    savedSequence,
    accidentalPreference,
    catalog,
    onUpdateSequence,
    onUpdateDraft,
  } = options;

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedBassNote, setSelectedBassNote] = useState<string | null>(null);

  /**
   * Apply bass note to chord if selected (creates slash chord)
   */
  const applyBassNote = useCallback(
    (chord: Chord): Chord => {
      if (selectedBassNote && selectedBassNote !== chord.root) {
        const slashChordSymbol = `${chord.displayName}/${selectedBassNote}`;
        const slashChord = parseChord(slashChordSymbol);
        if (slashChord) {
          return slashChord;
        }
      }
      return chord;
    },
    [selectedBassNote]
  );

  /**
   * Select scale for s1 slot
   */
  const handleSelectScale = useCallback(
    (scaleName: string, root: string) => {
      if (editingIndex !== null) {
        // Update editing card's s1
        onUpdateSequence((state) => ({
          savedSequence: state.savedSequence.map((item, i) =>
            i === editingIndex ? { ...item, s1: { scale: scaleName, root } } : item
          ),
        }));
      } else {
        // Update draft's s1
        onUpdateDraft((state) => ({
          draft: state.draft
            ? { ...state.draft, s1: { scale: scaleName, root } }
            : null,
        }));
      }
    },
    [editingIndex, onUpdateSequence, onUpdateDraft]
  );

  /**
   * Select scale for s2 slot
   */
  const handleSelectScale2 = useCallback(
    (scaleName: string, root: string) => {
      if (editingIndex !== null) {
        // Update editing card's s2
        onUpdateSequence((state) => ({
          savedSequence: state.savedSequence.map((item, i) =>
            i === editingIndex ? { ...item, s2: { scale: scaleName, root } } : item
          ),
        }));
      } else {
        // Update draft's s2
        onUpdateDraft((state) => ({
          draft: state.draft
            ? { ...state.draft, s2: { scale: scaleName, root } }
            : null,
        }));
      }
    },
    [editingIndex, onUpdateSequence, onUpdateDraft]
  );

  /**
   * Calculate available bass notes from selected scales
   */
  const availableBassNotes = useMemo(() => {
    const noteNames = accidentalPreference === 'sharps'
      ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
      : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

    // If no scales selected, show all notes
    const currentState = editingIndex !== null ? savedSequence[editingIndex] : draft;
    if (!currentState?.s1 && !currentState?.s2) {
      return noteNames;
    }

    if (!catalog) return [];

    const getScaleNotes = (root: string, scaleName: string): Set<number> => {
      const scaleType = catalog.scaleTypes.find(st => st.name === scaleName);
      if (!scaleType) return new Set();

      const rootPitchClass = getPitchClassFromNote(root);
      const pitchClasses = new Set<number>();

      for (const interval of scaleType.intervals) {
        pitchClasses.add((rootPitchClass + interval) % 12);
      }

      return pitchClasses;
    };

    // Collect pitch classes from selected scales
    const combinedPitchClasses = new Set<number>();

    if (currentState.s1) {
      const s1Notes = getScaleNotes(currentState.s1.root, currentState.s1.scale);
      s1Notes.forEach(pc => combinedPitchClasses.add(pc));
    }

    if (currentState.s2) {
      const s2Notes = getScaleNotes(currentState.s2.root, currentState.s2.scale);
      s2Notes.forEach(pc => combinedPitchClasses.add(pc));
    }

    // Filter note names to only those in selected scales
    return noteNames.filter(noteName => {
      const pc = getPitchClassFromNote(noteName);
      return combinedPitchClasses.has(pc);
    });
  }, [accidentalPreference, draft, savedSequence, editingIndex, catalog]);

  /**
   * Check if draft can be saved
   */
  const canSaveDraft = !!draft?.chord;

  return {
    editingIndex,
    selectedBassNote,
    availableBassNotes,
    canSaveDraft,
    setEditingIndex,
    setSelectedBassNote,
    handleSelectScale,
    handleSelectScale2,
    applyBassNote,
  };
}
