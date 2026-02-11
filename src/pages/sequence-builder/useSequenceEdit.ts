/**
 * useSequenceEdit Hook
 * Manages edit mode state and operations for SequenceBuilderPage
 * Feature-specific, not reusable
 */

import { useState, useCallback } from 'react';
import type { ChordState } from '../../music/chordProgression';

interface UseSequenceEditOptions {
  savedSequence: ChordState[];
  deleteSavedChord: (index: number) => void;
}

interface UseSequenceEditReturn {
  editingIndex: number | null;
  selectedBassNote: string | null;
  setSelectedBassNote: (note: string | null) => void;
  handleEditCard: (index: number) => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
  handleDeleteCard: () => void;
  isEditing: boolean;
}

export function useSequenceEdit(options: UseSequenceEditOptions): UseSequenceEditReturn {
  const { savedSequence, deleteSavedChord } = options;

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedBassNote, setSelectedBassNote] = useState<string | null>(null);

  /**
   * Enter edit mode for a specific card
   */
  const handleEditCard = useCallback((index: number) => {
    const card = savedSequence[index];
    if (!card) return;

    // Enter edit mode
    setEditingIndex(index);

    // Load the card's bass note if it has one
    if (card.chord?.bass) {
      setSelectedBassNote(card.chord.bass);
    } else {
      setSelectedBassNote(null);
    }
  }, [savedSequence]);

  /**
   * Save edit and exit edit mode
   */
  const handleSaveEdit = useCallback(() => {
    // Just exit edit mode - changes are already applied
    setEditingIndex(null);
    setSelectedBassNote(null);
  }, []);

  /**
   * Cancel edit and exit edit mode
   */
  const handleCancelEdit = useCallback(() => {
    // Exit edit mode without changes
    setEditingIndex(null);
    setSelectedBassNote(null);
  }, []);

  /**
   * Delete the currently edited card
   */
  const handleDeleteCard = useCallback(() => {
    if (editingIndex === null) return;

    deleteSavedChord(editingIndex);

    // Exit edit mode
    setEditingIndex(null);
    setSelectedBassNote(null);
  }, [editingIndex, deleteSavedChord]);

  return {
    editingIndex,
    selectedBassNote,
    setSelectedBassNote,
    handleEditCard,
    handleSaveEdit,
    handleCancelEdit,
    handleDeleteCard,
    isEditing: editingIndex !== null,
  };
}
