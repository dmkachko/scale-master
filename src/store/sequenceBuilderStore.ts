/**
 * Sequence Builder Store
 * Global state for chord sequence builder
 * Refactored with Immer for clean updates
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ChordState } from '../music/chordProgression';
import type { Chord } from '../music/chordParser';
import { createChordState, createEmptyChordState } from '../music/chordProgression';

interface SequenceBuilderState {
  savedSequence: ChordState[];  // Only saved cells
  draft: ChordState | null;      // Current draft cell
  selectedChord: Chord | null;
}

interface SequenceBuilderActions {
  // Chord actions
  selectChord: (chord: Chord) => void;
  clearDraftChord: () => void;

  // Scale actions (draft)
  setDraftScale: (slot: 's1' | 's2', scale: string, root: string) => void;
  clearDraftScale: (slot: 's1' | 's2') => void;

  // Saved sequence actions
  updateSavedChord: (index: number, chord: Chord) => void;
  updateSavedScale: (index: number, slot: 's1' | 's2', scale: string, root: string) => void;
  clearSavedScale: (index: number, slot: 's1' | 's2') => void;
  deleteSavedChord: (index: number) => void;

  // Beat management
  updateBeats: (index: number, beats: number) => void;
  updateDraftBeats: (beats: number) => void;

  // Sequence operations
  saveDraft: () => void;
  moveToPrevious: () => void;
  clearSequence: () => void;

  // Legacy actions (for backward compatibility)
  setSelectedChord: (chord: Chord | null) => void;
  addNewCell: () => void;
}

type SequenceBuilderStore = SequenceBuilderState & SequenceBuilderActions;

export const useSequenceBuilderStore = create<SequenceBuilderStore>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial state
        savedSequence: [],
        draft: createEmptyChordState(), // Always start with a draft
        selectedChord: null,

        // === CHORD ACTIONS ===

        selectChord: (chord) =>
          set((state) => {
            if (state.draft) {
              state.draft.chord = chord;
              state.selectedChord = chord;
            }
          }, false, 'selectChord'),

        clearDraftChord: () =>
          set((state) => {
            if (state.draft) {
              state.draft.chord = null;
              state.selectedChord = null;
            }
          }, false, 'clearDraftChord'),

        // === SCALE ACTIONS (DRAFT) ===

        setDraftScale: (slot, scale, root) =>
          set((state) => {
            if (state.draft) {
              state.draft[slot] = { scale, root };
            }
          }, false, `setDraftScale/${slot}`),

        clearDraftScale: (slot) =>
          set((state) => {
            if (state.draft) {
              state.draft[slot] = undefined;
            }
          }, false, `clearDraftScale/${slot}`),

        // === SAVED SEQUENCE ACTIONS ===

        updateSavedChord: (index, chord) =>
          set((state) => {
            if (state.savedSequence[index]) {
              state.savedSequence[index].chord = chord;
            }
          }, false, 'updateSavedChord'),

        updateSavedScale: (index, slot, scale, root) =>
          set((state) => {
            if (state.savedSequence[index]) {
              state.savedSequence[index][slot] = { scale, root };
            }
          }, false, `updateSavedScale/${slot}`),

        clearSavedScale: (index, slot) =>
          set((state) => {
            if (state.savedSequence[index]) {
              state.savedSequence[index][slot] = undefined;
            }
          }, false, `clearSavedScale/${slot}`),

        deleteSavedChord: (index) =>
          set((state) => {
            state.savedSequence.splice(index, 1);
          }, false, 'deleteSavedChord'),

        // === BEAT MANAGEMENT ===

        updateBeats: (index, beats) =>
          set((state) => {
            if (state.savedSequence[index]) {
              state.savedSequence[index].beats = beats;
            }
          }, false, 'updateBeats'),

        updateDraftBeats: (beats) =>
          set((state) => {
            if (state.draft) {
              state.draft.beats = beats;
            }
          }, false, 'updateDraftBeats'),

        // === SEQUENCE OPERATIONS ===

        saveDraft: () =>
          set((state) => {
            if (state.draft && state.draft.chord) {
              state.savedSequence.push({ ...state.draft, saved: true });
              state.draft = {
                chord: null,
                beats: state.draft.beats || 4,
                s1: state.draft.s1,
                s2: state.draft.s2,
                saved: false,
              };
              state.selectedChord = null;
            }
          }, false, 'saveDraft'),

        moveToPrevious: () =>
          set((state) => {
            if (state.savedSequence.length > 0) {
              const lastSaved = state.savedSequence.pop()!;
              state.draft = { ...lastSaved, saved: false };
              state.selectedChord = null;
            }
          }, false, 'moveToPrevious'),

        clearSequence: () =>
          set((state) => {
            state.savedSequence = [];
            state.draft = createEmptyChordState();
            state.selectedChord = null;
          }, false, 'clearSequence'),

        // === LEGACY ACTIONS (for backward compatibility) ===

        setSelectedChord: (chord) =>
          set((state) => {
            state.selectedChord = chord;
          }, false, 'setSelectedChord'),

        addNewCell: () =>
          set((state) => {
            if (state.draft === null) {
              state.draft = createEmptyChordState();
              state.selectedChord = null;
            }
          }, false, 'addNewCell'),
      })),
      {
        name: 'sequence-builder-storage-v3', // Changed key for new version
        storage: {
          getItem: (name) => {
            const str = sessionStorage.getItem(name);
            return str ? JSON.parse(str) : null;
          },
          setItem: (name, value) => {
            sessionStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: (name) => {
            sessionStorage.removeItem(name);
          },
        },
      }
    ),
    { name: 'SequenceBuilderStore' }
  )
);
