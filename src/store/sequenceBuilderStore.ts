/**
 * Sequence Builder Store
 * Global state for chord sequence builder
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { ChordState } from '../music/chordProgression';
import type { Chord } from '../music/chordParser';
import { createChordState, createEmptyChordState } from '../music/chordProgression';

interface SequenceBuilderState {
  savedSequence: ChordState[];  // Only saved cells
  draft: ChordState | null;      // Current draft cell
  selectedChord: Chord | null;

  // Actions
  setSelectedChord: (chord: Chord | null) => void;
  addNewCell: () => void;
  selectChord: (chord: Chord) => void;
  saveDraft: () => void;
  moveToPrevious: () => void;
  clearSequence: () => void;
}

export const useSequenceBuilderStore = create<SequenceBuilderState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        savedSequence: [],
        draft: createEmptyChordState(), // Always start with a draft
        selectedChord: null,

        // Actions
        setSelectedChord: (chord) =>
          set({ selectedChord: chord }, false, 'sequenceBuilder/setSelectedChord'),

        addNewCell: () =>
          set(
            (state) => {
              // Only add if there's no draft
              if (state.draft === null) {
                return {
                  draft: createEmptyChordState(),
                  selectedChord: null,
                };
              }
              return state;
            },
            false,
            'sequenceBuilder/addNewCell'
          ),

        selectChord: (chord) =>
          set(
            (state) => {
              // Update draft with selected chord
              if (state.draft !== null) {
                return {
                  draft: createChordState(chord.displayName, false),
                  selectedChord: chord,
                };
              }
              return { selectedChord: chord };
            },
            false,
            'sequenceBuilder/selectChord'
          ),

        saveDraft: () =>
          set(
            (state) => {
              if (state.draft !== null && state.draft.chord !== null) {
                // Move draft to saved sequence
                const savedDraft = { ...state.draft, saved: true };
                return {
                  savedSequence: [...state.savedSequence, savedDraft],
                  draft: createEmptyChordState(), // Create new empty draft
                  selectedChord: null,
                };
              }
              return state;
            },
            false,
            'sequenceBuilder/saveDraft'
          ),

        moveToPrevious: () =>
          set(
            (state) => {
              // Delete draft and move last saved cell to draft
              if (state.savedSequence.length > 0) {
                const newSavedSequence = [...state.savedSequence];
                const lastSaved = newSavedSequence.pop()!;

                // Make it a draft (unsaved)
                const newDraft = { ...lastSaved, saved: false };

                return {
                  savedSequence: newSavedSequence,
                  draft: newDraft,
                  selectedChord: null,
                };
              }
              return state;
            },
            false,
            'sequenceBuilder/moveToPrevious'
          ),

        clearSequence: () =>
          set(
            {
              savedSequence: [],
              draft: createEmptyChordState(), // Create new draft on clear
              selectedChord: null,
            },
            false,
            'sequenceBuilder/clearSequence'
          ),
      }),
      {
        name: 'sequence-builder-storage-v2', // Changed key to reset old data
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
    )
  )
);
