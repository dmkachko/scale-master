import { useEffect, useRef, useState } from 'react';
import { Trash2, Pencil, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
              {savedSequence.length > 0 && (
                <button
                  onClick={() => handlePlaySequence(savedSequence, draft)}
                  className="btn btn-primary btn-sm"
                >
                  Play
                </button>
              )}
              {savedSequence.length > 0 && (
                <button
                  onClick={() => {
                    moveToPrevious();
                    setSelectedBassNote(null);
                  }}
                  className="btn btn-secondary btn-sm"
                  title="Delete last saved chord"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => {
                  clearSequence();
                  setSelectedBassNote(null);
                }}
                className="btn btn-secondary btn-sm"
              >
                Clear
              </button>
            </div>
          </div>

          <div className={styles.sequenceScroll} ref={scrollContainerRef}>
            {(
              <div className={styles.statesList}>
                {allCells.map((state, index) => {
                  const isDraft = index === allCells.length - 1; // Last cell is always draft
                  const isSaved = state.saved;
                  const isPlaying = playingIndex === index;
                  const isEditing = editingIndex === index;
                  const isDisabled = isDraft && editingIndex !== null;

                  return (
                    <div
                      key={index}
                      className={`${styles.stateCard} ${
                        isDraft ? styles.currentCard : ''
                      } ${isSaved ? styles.savedCard : ''} ${
                        isPlaying ? styles.playingCard : ''
                      } ${isEditing ? styles.editingCard : ''} ${
                        isDisabled ? styles.disabledCard : ''
                      }`}
                    >
                      <div className={styles.stateNumber}>
                        {index + 1}
                        {isSaved && !isEditing && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCard(index);
                            }}
                            className={styles.editButton}
                            title="Edit this card"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                      </div>
                      <div className={styles.stateContent}>
                        <div className={styles.chordRow}>
                          <div
                            className={`${styles.chordDisplay} ${!state.chord ? styles.emptyChord : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayChord(state.chord, state.beats || 4);
                            }}
                          >
                            {state.chord ? state.chord.displayName : '—'}
                          </div>
                          {isDraft && state.chord && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClearDraftChord();
                              }}
                              className={styles.clearChordButton}
                              title="Clear chord selection"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        <div className={styles.modePlaceholders}>
                          <div className={styles.modePlaceholder}>
                            <span className={styles.scaleLabel}>
                              S1: {state.s1 ? (
                                <span>{state.s1.root} {state.s1.scale}</span>
                              ) : (
                                <span className={styles.placeholderText}>—</span>
                              )}
                            </span>
                            {isDraft && state.s1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClearS1();
                                }}
                                className={styles.clearScaleButton}
                                title="Clear scale 1"
                              >
                                ×
                              </button>
                            )}
                          </div>
                          <div className={styles.modePlaceholder}>
                            <span className={styles.scaleLabel}>
                              S2: {state.s2 ? (
                                <span>{state.s2.root} {state.s2.scale}</span>
                              ) : (
                                <span className={styles.placeholderText}>—</span>
                              )}
                            </span>
                            {isDraft && state.s2 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClearS2();
                                }}
                                className={styles.clearScaleButton}
                                title="Clear scale 2"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {isDraft && !isDisabled && (
                        <div className={styles.cellControls}>
                          {state.chord && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                saveDraft();
                              }}
                              className="btn btn-link btn-sm"
                              disabled={!canSaveDraft}
                              title={
                                !canSaveDraft
                                  ? 'Select a chord to save'
                                  : 'Save this chord to the sequence'
                              }
                            >
                              Save
                            </button>
                          )}
                          {savedSequence.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveToPrevious();
                              }}
                              className="btn btn-link btn-sm"
                            >
                              &lt;
                            </button>
                          )}
                        </div>
                      )}
                      {isEditing && (
                        <div className={styles.cellControls}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit();
                            }}
                            className="btn btn-primary btn-sm"
                            title="Save changes"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
                            }}
                            className="btn btn-secondary btn-sm"
                            title="Cancel editing"
                          >
                            <X size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCard();
                            }}
                            className="btn btn-secondary btn-sm"
                            title="Delete this card"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}

                      {/* Beat Indicators */}
                      <div className={styles.beatIndicators}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDecreaseBeats(index);
                          }}
                          className={styles.beatChevron}
                          disabled={isDisabled || (state.beats || 4) <= 1}
                          title="Decrease beats"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <div className={styles.beats}>
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div
                              key={i}
                              className={`${styles.beat} ${
                                i < (state.beats || 4) ? styles.activeBeat : styles.inactiveBeat
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleIncreaseBeats(index);
                          }}
                          className={styles.beatChevron}
                          disabled={isDisabled || (state.beats || 4) >= 6}
                          title="Increase beats"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selector with Tabs and Bass Selector */}
        <div className={styles.selectorRow}>
          <div className={styles.selectorSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${activeTab === 'chord' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('chord')}
                >
                  Select Chord
                </button>
                <button
                  className={`${styles.tab} ${activeTab === 'scale' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('scale')}
                >
                  Select Scale
                </button>
                <button
                  className={`${styles.tab} ${activeTab === 'scale2' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('scale2')}
                >
                  Select Scale 2
                </button>
              </div>
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
            <div className={styles.bassSelector}>
              <h3 className={styles.bassSelectorTitle}>Bass Note</h3>
              <div className={styles.bassNotes}>
                <button
                  onClick={() => handleBassNoteChange(null)}
                  className={`${styles.bassNote} ${selectedBassNote === null ? styles.selectedBassNote : ''}`}
                  title="Use chord root as bass"
                >
                  Root
                </button>
                {availableBassNotes.map((note) => (
                  <button
                    key={note}
                    onClick={() => handleBassNoteChange(note)}
                    className={`${styles.bassNote} ${selectedBassNote === note ? styles.selectedBassNote : ''}`}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
