import { useEffect, useRef, useState, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import type { Chord } from '../../music/chordParser';
import { parseChord } from '../../music/chordParser';
import { chordToNotes } from '../../music/chordProgression';
import { audioEngine } from '../../services/audioEngine';
import { useSequenceBuilderStore } from '../../store/sequenceBuilderStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useCatalogStore } from '../../store/catalogStore';
import { useCatalogInit } from '../../hooks/useCatalogInit';
import { getPitchClassFromNote } from '../../music/notes';
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
  const [selectedBassNote, setSelectedBassNote] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const playbackCancelRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  // Get bass note for a chord (uses slash chord bass if specified, otherwise root)
  const getBassNote = (chord: Chord): string => {
    // Use slash chord bass note if specified, otherwise use root
    const bassNote = chord.bass || chord.root;
    return `${bassNote}2`; // Two octaves below (chord is at octave 4)
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

    // Get previous chords to play (slice(-0) returns all, so handle 0 specially)
    const previousChords = chordSelectionPlaybackCount > 0
      ? savedSequence.slice(-chordSelectionPlaybackCount)
      : [];

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

    // Cancel any ongoing playback
    playbackCancelRef.current.cancelled = true;

    // Create new cancel token for this playback
    const cancelToken = { cancelled: false };
    playbackCancelRef.current = cancelToken;

    // Update selection immediately (don't wait for playback)
    selectChord(finalChord);

    // Start playback async (non-blocking)
    playChordWithPrevious(finalChord, cancelToken);
  };

  const handleAddChord = (chord: Chord) => {
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

    // Cancel any ongoing playback
    playbackCancelRef.current.cancelled = true;

    // Create new cancel token for this playback
    const cancelToken = { cancelled: false };
    playbackCancelRef.current = cancelToken;

    // Update selection immediately
    selectChord(finalChord);

    // Start playback async (non-blocking)
    playChordWithPrevious(finalChord, cancelToken);

    // Save the chord
    saveDraft();
  };

  // Check if draft can be saved (has chord)
  const canSaveDraft = !!draft?.chord;

  // Calculate available bass notes from selected scales
  const availableBassNotes = useMemo(() => {
    const noteNames = accidentalPreference === 'sharps'
      ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
      : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

    // If no scales selected, show all notes
    if (!draft?.s1 && !draft?.s2) {
      return noteNames;
    }

    if (!catalog) return [];

    const getScaleNotes = (root: string, scaleName: string): Set<number> => {
      const scaleType = catalog.scaleTypes.find(st => st.name === scaleName);
      if (!scaleType) return new Set();

      const rootPitchClass = getPitchClassFromNote(root);
      if (rootPitchClass === -1) return new Set();

      const pitchClasses = new Set<number>();
      for (const interval of scaleType.intervals) {
        pitchClasses.add((rootPitchClass + interval) % 12);
      }
      return pitchClasses;
    };

    // Get pitch classes from both scales
    const s1Notes = draft.s1 ? getScaleNotes(draft.s1.root, draft.s1.scale) : null;
    const s2Notes = draft.s2 ? getScaleNotes(draft.s2.root, draft.s2.scale) : null;

    // If both scales selected, get intersection; otherwise use the selected scale
    let availablePitchClasses: Set<number>;
    if (s1Notes && s2Notes) {
      // Intersection of both scales
      availablePitchClasses = new Set([...s1Notes].filter(pc => s2Notes.has(pc)));
    } else if (s1Notes) {
      availablePitchClasses = s1Notes;
    } else if (s2Notes) {
      availablePitchClasses = s2Notes;
    } else {
      return noteNames; // Fallback to all notes
    }

    // Convert pitch classes to note names
    return Array.from(availablePitchClasses)
      .sort((a, b) => a - b)
      .map(pc => noteNames[pc]);
  }, [draft?.s1, draft?.s2, catalog, accidentalPreference]);

  const handleClearDraftChord = () => {
    setSelectedBassNote(null);
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

  const handleBassNoteChange = (bassNote: string | null) => {
    setSelectedBassNote(bassNote);

    // If there's a chord in draft, update it with the new bass note
    if (draft?.chord) {
      const baseChord = draft.chord;
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

      // Cancel any ongoing playback
      playbackCancelRef.current.cancelled = true;

      // Create new cancel token for this playback
      const cancelToken = { cancelled: false };
      playbackCancelRef.current = cancelToken;

      // Update selection
      selectChord(newChord);

      // Play the chord with new bass
      playChordWithPrevious(newChord, cancelToken);
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
                  onClick={handlePlaySequence}
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
