import { useEffect, useRef, useState } from 'react';
import type { Chord } from '../../music/chordParser';
import { getPossibleNextChords, chordToNotes } from '../../music/chordProgression';
import { audioEngine } from '../../services/audioEngine';
import { useSequenceBuilderStore } from '../../store/sequenceBuilderStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import { useCatalogStore } from '../../store/catalogStore';
import ScaleTable from '../../components/ScaleTable';
import styles from './SequenceBuilderPage.module.css';

export default function SequenceBuilderPage() {
  const {
    savedSequence,
    draft,
    selectChord,
    saveDraft,
    moveToPrevious,
    clearSequence,
  } = useSequenceBuilderStore();

  const { tempo, accidentalPreference } = usePreferencesStore();
  const { catalog } = useCatalogStore();

  const [activeTab, setActiveTab] = useState<'chord' | 'scale' | 'scale2'>('chord');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get possible next chords based on draft
  const possibleChords = getPossibleNextChords(draft!);

  const handlePlayChord = async (chord: Chord | null) => {
    if (!chord) return;
    const notes = chordToNotes(chord);
    if (notes.length > 0) {
      await audioEngine.playChord(notes, 4, '2n');
    }
  };

  const handlePlaySequence = async () => {
    // Calculate delay based on tempo
    // For half note (2n) = 2 beats
    // Beat duration = 60000ms / BPM
    const beatDuration = 60000 / tempo;
    const halfNoteDuration = beatDuration * 2;

    // Play all saved chords
    for (const state of savedSequence) {
      if (state.chord) {
        const notes = chordToNotes(state.chord);
        if (notes.length > 0) {
          await audioEngine.playChord(notes, 4, '2n');
          await new Promise(resolve => setTimeout(resolve, halfNoteDuration));
        }
      }
    }

    // Play draft chord if it exists
    if (draft && draft.chord) {
      const notes = chordToNotes(draft.chord);
      if (notes.length > 0) {
        await audioEngine.playChord(notes, 4, '2n');
      }
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

                  return (
                    <div
                      key={index}
                      className={`${styles.stateCard} ${
                        isDraft ? styles.currentCard : ''
                      } ${isSaved ? styles.savedCard : ''}`}
                    >
                      <div className={styles.stateNumber}>{index + 1}</div>
                      <div className={styles.stateContent}>
                        <div
                          className={`${styles.chordDisplay} ${!state.chord ? styles.emptyChord : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayChord(state.chord);
                          }}
                        >
                          {state.chord ? state.chord.displayName : '—'}
                        </div>
                        <div className={styles.modePlaceholders}>
                          <div className={styles.modePlaceholder}>
                            S1: {state.s1 ? (
                              <span>{state.s1.root} {state.s1.scale}</span>
                            ) : (
                              <span className={styles.placeholderText}>—</span>
                            )}
                          </div>
                          <div className={styles.modePlaceholder}>
                            S2: {state.s2 ? (
                              <span>{state.s2.root} {state.s2.scale}</span>
                            ) : (
                              <span className={styles.placeholderText}>—</span>
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
            <div className={styles.chordGrid}>
              {possibleChords.map((chord, index) => (
                <div key={index} className={styles.chordOption}>
                  <button
                    onClick={() => handlePlayChord(chord)}
                    className="btn btn-link"
                  >
                    {chord.displayName}
                  </button>
                  <div className={styles.chordActions}>
                    <button
                      onClick={() => {
                        selectChord(chord);
                        saveDraft();
                      }}
                      className="btn btn-link"
                      title="Add this chord and save"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => selectChord(chord)}
                      className="btn btn-ghost"
                      title="Replace draft chord without saving"
                    >
                      Replace
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'scale' && catalog && (
            <ScaleTable
              catalog={catalog}
              selectedScale={draft?.s1}
              onSelectScale={handleSelectScale}
              accidentalPreference={accidentalPreference}
            />
          )}

          {activeTab === 'scale2' && catalog && (
            <ScaleTable
              catalog={catalog}
              selectedScale={draft?.s2}
              onSelectScale={handleSelectScale2}
              accidentalPreference={accidentalPreference}
            />
          )}
        </div>
      </div>
    </div>
  );
}
