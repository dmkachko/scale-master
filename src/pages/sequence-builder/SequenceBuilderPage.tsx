import { useEffect, useRef, useState } from 'react';
import type { Chord } from '../../music/chordParser';
import { chordToNotes } from '../../music/chordProgression';
import { audioEngine } from '../../services/audioEngine';
import { useSequenceBuilderStore } from '../../store/sequenceBuilderStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useCatalogStore } from '../../store/catalogStore';
import { useCatalogInit } from '../../hooks/useCatalogInit';
import ScaleTable from '../../components/ScaleTable';
import ChordTable from '../../components/ChordTable';
import styles from './SequenceBuilderPage.module.css';

export default function SequenceBuilderPage() {
  useCatalogInit();

  const {
    savedSequence,
    draft,
    selectChord,
    saveDraft,
    moveToPrevious,
    clearSequence,
  } = useSequenceBuilderStore();

  const { tempo, accidentalPreference, chordSelectionPlaybackCount } = usePreferencesStore();
  const { catalog } = useCatalogStore();

  const [activeTab, setActiveTab] = useState<'chord' | 'scale' | 'scale2'>('chord');
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const playbackCancelRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  // Get bass note for a chord (currently root, can be changed for inversions)
  const getBassNote = (chord: Chord): string => {
    // Currently using root note as bass
    // Future: could use chord.bass if inversions are implemented
    return `${chord.root}2`; // Two octaves below (chord is at octave 4)
  };

  const handlePlayChord = async (chord: Chord | null) => {
    if (!chord) return;
    const notes = chordToNotes(chord);
    if (notes.length > 0) {
      const bassNote = getBassNote(chord);
      const chordNotes = notes.map(note => `${note}4`);
      await audioEngine.playChord([bassNote, ...chordNotes], undefined, '2n');
    }
  };

  const handlePlaySequence = async () => {
    try {
      // Calculate delay based on tempo
      // For half note (2n) = 2 beats
      // Beat duration = 60000ms / BPM
      const beatDuration = 60000 / tempo;
      const halfNoteDuration = beatDuration * 2;

      // Play all saved chords
      for (let i = 0; i < savedSequence.length; i++) {
        setPlayingIndex(i); // Highlight current chord
        const state = savedSequence[i];

        if (state.chord) {
          const notes = chordToNotes(state.chord);
          if (notes.length > 0) {
            const bassNote = getBassNote(state.chord);
            const chordNotes = notes.map(note => `${note}4`);
            await audioEngine.playChord([bassNote, ...chordNotes], undefined, '2n');
            await new Promise(resolve => setTimeout(resolve, halfNoteDuration));
          }
        }
      }

      // Play draft chord if it exists
      if (draft && draft.chord) {
        setPlayingIndex(savedSequence.length); // Highlight draft
        const notes = chordToNotes(draft.chord);
        if (notes.length > 0) {
          const bassNote = getBassNote(draft.chord);
          const chordNotes = notes.map(note => `${note}4`);
          await audioEngine.playChord([bassNote, ...chordNotes], undefined, '2n');
          await new Promise(resolve => setTimeout(resolve, halfNoteDuration));
        }
      }

      setPlayingIndex(null); // Clear highlight when done
    } catch (error) {
      console.error('Error playing sequence:', error);
      setPlayingIndex(null); // Clear highlight on error
    }
  };

  const handleSelectScale = (scaleName: string, root: string) => {
    // Update draft's s1 field with the selected scale
    useSequenceBuilderStore.setState((state) => ({
      draft: state.draft
        ? { ...state.draft, s1: { scale: scaleName, root } }
        : null,
    }));
  };

  const handleSelectScale2 = (scaleName: string, root: string) => {
    // Update draft's s2 field with the selected scale
    useSequenceBuilderStore.setState((state) => ({
      draft: state.draft
        ? { ...state.draft, s2: { scale: scaleName, root } }
        : null,
    }));
  };

  const playChordWithPrevious = async (chord: Chord, cancelToken: { cancelled: boolean }) => {
    // Play previous chords + current chord
    const beatDuration = 60000 / tempo;
    const halfNoteDuration = beatDuration * 2;

    // Get previous chords to play
    const previousChords = savedSequence.slice(-chordSelectionPlaybackCount);

    // Play previous chords
    for (const state of previousChords) {
      if (cancelToken.cancelled) return; // Stop if cancelled

      if (state.chord) {
        const notes = chordToNotes(state.chord);
        if (notes.length > 0) {
          const bassNote = getBassNote(state.chord);
          const chordNotes = notes.map(note => `${note}4`);
          await audioEngine.playChord([bassNote, ...chordNotes], undefined, '2n');
          await new Promise(resolve => setTimeout(resolve, halfNoteDuration));
        }
      }
    }

    if (cancelToken.cancelled) return; // Stop if cancelled

    // Play the newly selected chord
    const notes = chordToNotes(chord);
    if (notes.length > 0) {
      const bassNote = getBassNote(chord);
      const chordNotes = notes.map(note => `${note}4`);
      await audioEngine.playChord([bassNote, ...chordNotes], undefined, '2n');
    }
  };

  const handleSelectChord = (chord: Chord) => {
    // Cancel any ongoing playback
    playbackCancelRef.current.cancelled = true;

    // Create new cancel token for this playback
    const cancelToken = { cancelled: false };
    playbackCancelRef.current = cancelToken;

    // Update selection immediately (don't wait for playback)
    selectChord(chord);

    // Start playback async (non-blocking)
    playChordWithPrevious(chord, cancelToken);
  };

  const handleAddChord = (chord: Chord) => {
    // Cancel any ongoing playback
    playbackCancelRef.current.cancelled = true;

    // Create new cancel token for this playback
    const cancelToken = { cancelled: false };
    playbackCancelRef.current = cancelToken;

    // Update selection immediately
    selectChord(chord);

    // Start playback async (non-blocking)
    playChordWithPrevious(chord, cancelToken);

    // Only save if at least one scale is selected
    if (draft?.s1 || draft?.s2) {
      saveDraft();
    }
  };

  // Check if draft can be saved (has chord and at least one scale)
  const canSaveDraft = draft?.chord && (draft?.s1 || draft?.s2);

  const handleClearDraftChord = () => {
    useSequenceBuilderStore.setState((state) => ({
      draft: state.draft
        ? { ...state.draft, chord: null }
        : null,
    }));
  };

  const handleClearS1 = () => {
    useSequenceBuilderStore.setState((state) => ({
      draft: state.draft
        ? { ...state.draft, s1: undefined }
        : null,
    }));
  };

  const handleClearS2 = () => {
    useSequenceBuilderStore.setState((state) => ({
      draft: state.draft
        ? { ...state.draft, s2: undefined }
        : null,
    }));
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
                  onClick={handlePlaySequence}
                  className="btn btn-primary btn-sm"
                >
                  Play
                </button>
              )}
              <button
                onClick={clearSequence}
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

                  return (
                    <div
                      key={index}
                      className={`${styles.stateCard} ${
                        isDraft ? styles.currentCard : ''
                      } ${isSaved ? styles.savedCard : ''} ${
                        isPlaying ? styles.playingCard : ''
                      }`}
                    >
                      <div className={styles.stateNumber}>{index + 1}</div>
                      <div className={styles.stateContent}>
                        <div className={styles.chordRow}>
                          <div
                            className={`${styles.chordDisplay} ${!state.chord ? styles.emptyChord : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayChord(state.chord);
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
                      {isDraft && (
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
                                  ? 'Select at least one scale to save'
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selector with Tabs */}
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
              selectedChord={draft?.chord}
              onSelectChord={handleSelectChord}
              onAddChord={handleAddChord}
              onSaveDraft={saveDraft}
              canSaveDraft={canSaveDraft}
              accidentalPreference={accidentalPreference}
              selectedScales={[draft?.s1, draft?.s2].filter((s): s is { scale: string; root: string } => s != null)}
              scaleTypes={catalog?.scaleTypes}
            />
          )}

          {activeTab === 'scale' && catalog && (
            <ScaleTable
              catalog={catalog}
              selectedScale={draft?.s1}
              onSelectScale={handleSelectScale}
              accidentalPreference={accidentalPreference}
              selectedChord={draft?.chord}
            />
          )}

          {activeTab === 'scale2' && catalog && (
            <ScaleTable
              catalog={catalog}
              selectedScale={draft?.s2}
              onSelectScale={handleSelectScale2}
              accidentalPreference={accidentalPreference}
              selectedChord={draft?.chord}
            />
          )}
        </div>
      </div>
    </div>
  );
}
