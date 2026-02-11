import { useEffect, useRef, useState } from 'react';
import type { Chord } from '../../music/chordParser';
import { parseChord } from '../../music/chordParser';
import { useSequenceBuilderStore } from '../../store/sequenceBuilderStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useCatalogStore } from '../../store/catalogStore';
import { useCatalogInit } from '../../hooks/useCatalogInit';
import { useSequencePlayback } from './useSequencePlayback';
import { useSequenceEdit } from './useSequenceEdit';
import { useAvailableBassNotes } from './useAvailableBassNotes';
import ScaleTable from '../../components/ScaleTable';
import ChordTable from '../../components/ChordTable';
import TabSelector from './components/TabSelector';
import BassNoteSelector from './components/BassNoteSelector';
import SequenceControls from './components/SequenceControls';
import ChordCard from './components/ChordCard';
import styles from './SequenceBuilderPage.module.css';

export default function SequenceBuilderPage() {
  useCatalogInit();

  // SequenceBuilder state selectors
  const savedSequence = useSequenceBuilderStore(state => state.savedSequence);
  const draft = useSequenceBuilderStore(state => state.draft);

  // SequenceBuilder actions
  const selectChord = useSequenceBuilderStore(state => state.selectChord);
  const saveDraft = useSequenceBuilderStore(state => state.saveDraft);
  const moveToPrevious = useSequenceBuilderStore(state => state.moveToPrevious);
  const clearSequence = useSequenceBuilderStore(state => state.clearSequence);
  const setDraftScale = useSequenceBuilderStore(state => state.setDraftScale);
  const clearDraftScale = useSequenceBuilderStore(state => state.clearDraftScale);
  const clearDraftChord = useSequenceBuilderStore(state => state.clearDraftChord);
  const updateSavedChord = useSequenceBuilderStore(state => state.updateSavedChord);
  const updateSavedScale = useSequenceBuilderStore(state => state.updateSavedScale);
  const deleteSavedChord = useSequenceBuilderStore(state => state.deleteSavedChord);
  const updateBeats = useSequenceBuilderStore(state => state.updateBeats);
  const updateDraftBeats = useSequenceBuilderStore(state => state.updateDraftBeats);

  // Preferences selectors
  const tempo = usePreferencesStore(state => state.tempo);
  const accidentalPreference = usePreferencesStore(state => state.accidentalPreference);
  const chordSelectionPlaybackCount = usePreferencesStore(state => state.chordSelectionPlaybackCount);

  // Catalog selector
  const catalog = useCatalogStore(state => state.catalog);

  // Playback hook
  const { playingIndex, handlePlayChord, handlePlaySequence, playChordWithPrevious } = useSequencePlayback({
    tempo,
    chordSelectionPlaybackCount,
  });

  // Edit mode hook
  const {
    editingIndex,
    selectedBassNote,
    setSelectedBassNote,
    handleEditCard,
    handleSaveEdit,
    handleCancelEdit,
    handleDeleteCard,
  } = useSequenceEdit({
    savedSequence,
    deleteSavedChord,
  });

  // Bass notes calculation hook
  const availableBassNotes = useAvailableBassNotes({
    draft,
    catalog,
    accidentalPreference,
  });

  const [activeTab, setActiveTab] = useState<'chord' | 'scale' | 'scale2'>('chord');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSelectScale = (scaleName: string, root: string) => {
    if (editingIndex !== null) {
      updateSavedScale(editingIndex, 's1', scaleName, root);
    } else {
      setDraftScale('s1', scaleName, root);
    }
  };

  const handleSelectScale2 = (scaleName: string, root: string) => {
    if (editingIndex !== null) {
      updateSavedScale(editingIndex, 's2', scaleName, root);
    } else {
      setDraftScale('s2', scaleName, root);
    }
  };

  const handleSelectChord = (chord: Chord) => {
    // Apply bass note if selected
    let finalChord = chord;
    if (selectedBassNote && selectedBassNote !== chord.root) {
      // Create slash chord
      const slashChordSymbol = `${chord.displayName}/${selectedBassNote}`;
      const slashChord = parseChord(slashChordSymbol);
      if (slashChord) {
        finalChord = slashChord;
      }
    }

    // Update the appropriate target (editing card or draft)
    if (editingIndex !== null) {
      updateSavedChord(editingIndex, finalChord);
    } else {
      selectChord(finalChord);
    }

    // Get beats for playback
    const currentBeats = editingIndex !== null
      ? (savedSequence[editingIndex]?.beats || 4)
      : (draft?.beats || 4);

    // Start playback async (non-blocking)
    playChordWithPrevious(finalChord, savedSequence, currentBeats);
  };

  const handleAddChord = (chord: Chord) => {
    // Don't allow adding chords while editing
    if (editingIndex !== null) {
      handleSelectChord(chord);
      return;
    }

    // Apply bass note if selected
    let finalChord = chord;
    if (selectedBassNote && selectedBassNote !== chord.root) {
      // Create slash chord
      const slashChordSymbol = `${chord.displayName}/${selectedBassNote}`;
      const slashChord = parseChord(slashChordSymbol);
      if (slashChord) {
        finalChord = slashChord;
      }
    }

    // Update selection immediately
    selectChord(finalChord);

    // Get beats for playback
    const currentBeats = draft?.beats || 4;

    // Start playback async (non-blocking)
    playChordWithPrevious(finalChord, savedSequence, currentBeats);

    // Save the chord
    saveDraft();
  };

  // Check if draft can be saved (has chord)
  const canSaveDraft = !!draft?.chord;

  const handleClearDraftChord = () => {
    setSelectedBassNote(null);
    clearDraftChord();
  };

  const handleClearS1 = () => {
    clearDraftScale('s1');
  };

  const handleClearS2 = () => {
    clearDraftScale('s2');
  };

  const handleBassNoteChange = (bassNote: string | null) => {
    setSelectedBassNote(bassNote);

    // Determine which chord to update (draft or editing)
    const targetChord = editingIndex !== null ? savedSequence[editingIndex]?.chord : draft?.chord;

    if (targetChord) {
      const baseChord = targetChord;
      // Remove any existing bass to get the base chord symbol
      const baseChordSymbol = baseChord.displayName.split('/')[0];

      let newChord: Chord;
      if (bassNote && bassNote !== baseChord.root) {
        // Create slash chord
        const slashChordSymbol = `${baseChordSymbol}/${bassNote}`;
        const parsed = parseChord(slashChordSymbol);
        newChord = parsed || baseChord;
      } else {
        // Use base chord without slash
        const parsed = parseChord(baseChordSymbol);
        newChord = parsed || baseChord;
      }

      // Update the appropriate target
      if (editingIndex !== null) {
        updateSavedChord(editingIndex, newChord);
      } else {
        selectChord(newChord);
      }

      // Get beats for playback
      const currentBeats = editingIndex !== null
        ? (savedSequence[editingIndex]?.beats || 4)
        : (draft?.beats || 4);

      // Play the chord with new bass
      playChordWithPrevious(newChord, savedSequence, currentBeats);
    }
  };

  const handleIncreaseBeats = (index: number) => {
    const isDraft = index === savedSequence.length;
    const maxBeats = 6;

    if (isDraft) {
      const currentBeats = draft?.beats || 4;
      updateDraftBeats(Math.min(currentBeats + 1, maxBeats));
    } else {
      const currentBeats = savedSequence[index]?.beats || 4;
      updateBeats(index, Math.min(currentBeats + 1, maxBeats));
    }
  };

  const handleDecreaseBeats = (index: number) => {
    const isDraft = index === savedSequence.length;
    const minBeats = 1;

    if (isDraft) {
      const currentBeats = draft?.beats || 4;
      updateDraftBeats(Math.max(currentBeats - 1, minBeats));
    } else {
      const currentBeats = savedSequence[index]?.beats || 4;
      updateBeats(index, Math.max(currentBeats - 1, minBeats));
    }
  };

  // Combine saved sequence and draft for display
  const allCells = [...savedSequence, draft!];

  // Auto-scroll to the right when sequence grows
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [savedSequence.length]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Chord Sequence Builder</h1>
        <p>Build a chord progression with intelligent recommendations</p>
      </div>

      <div className={styles.content}>
        {/* Current Sequence Display */}
        <div className={styles.sequenceSection}>
          <div className={styles.sectionHeader}>
            <h2>Current Sequence</h2>
            <div className={styles.controls}>
              <SequenceControls
                hasSequence={savedSequence.length > 0}
                onPlay={() => handlePlaySequence(savedSequence, draft)}
                onDeleteLast={() => {
                  moveToPrevious();
                  setSelectedBassNote(null);
                }}
                onClear={() => {
                  clearSequence();
                  setSelectedBassNote(null);
                }}
              />
            </div>
          </div>

          <div className={styles.sequenceScroll} ref={scrollContainerRef}>
            <div className={styles.statesList}>
              {allCells.map((state, index) => {
                const isDraft = index === allCells.length - 1;
                const isPlaying = playingIndex === index;
                const isEditing = editingIndex === index;
                const isDisabled = isDraft && editingIndex !== null;

                return (
                  <ChordCard
                    key={index}
                    state={state}
                    index={index}
                    isDraft={isDraft}
                    isPlaying={isPlaying}
                    isEditing={isEditing}
                    isDisabled={isDisabled}
                    canSaveDraft={canSaveDraft}
                    onPlayChord={handlePlayChord}
                    onEditCard={() => handleEditCard(index)}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                    onDeleteCard={handleDeleteCard}
                    onSaveDraft={saveDraft}
                    onMoveToPrevious={savedSequence.length > 0 ? moveToPrevious : undefined}
                    onClearChord={handleClearDraftChord}
                    onClearS1={handleClearS1}
                    onClearS2={handleClearS2}
                    onIncreaseBeats={() => handleIncreaseBeats(index)}
                    onDecreaseBeats={() => handleDecreaseBeats(index)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Selector with Tabs and Bass Selector */}
        <div className={styles.selectorRow}>
          <div className={styles.selectorSection}>
            <div className={styles.sectionHeader}>
              <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {activeTab === 'chord' && (
              <ChordTable
                selectedChord={editingIndex !== null ? savedSequence[editingIndex]?.chord : draft?.chord}
                onSelectChord={handleSelectChord}
                onAddChord={handleAddChord}
                onSaveDraft={editingIndex !== null ? handleSaveEdit : saveDraft}
                canSaveDraft={editingIndex !== null ? true : canSaveDraft}
                accidentalPreference={accidentalPreference}
                selectedScales={
                  editingIndex !== null
                    ? [savedSequence[editingIndex]?.s1, savedSequence[editingIndex]?.s2].filter((s): s is { scale: string; root: string } => s != null)
                    : [draft?.s1, draft?.s2].filter((s): s is { scale: string; root: string } => s != null)
                }
                scaleTypes={catalog?.scaleTypes}
              />
            )}

            {activeTab === 'scale' && catalog && (
              <ScaleTable
                catalog={catalog}
                selectedScale={editingIndex !== null ? savedSequence[editingIndex]?.s1 : draft?.s1}
                onSelectScale={handleSelectScale}
                accidentalPreference={accidentalPreference}
                selectedChord={editingIndex !== null ? savedSequence[editingIndex]?.chord : draft?.chord}
              />
            )}

            {activeTab === 'scale2' && catalog && (
              <ScaleTable
                catalog={catalog}
                selectedScale={editingIndex !== null ? savedSequence[editingIndex]?.s2 : draft?.s2}
                onSelectScale={handleSelectScale2}
                accidentalPreference={accidentalPreference}
                selectedChord={editingIndex !== null ? savedSequence[editingIndex]?.chord : draft?.chord}
              />
            )}
          </div>

          {/* Bass Note Selector */}
          {activeTab === 'chord' && (
            <BassNoteSelector
              selectedBassNote={selectedBassNote}
              availableBassNotes={availableBassNotes}
              onBassNoteChange={handleBassNoteChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
