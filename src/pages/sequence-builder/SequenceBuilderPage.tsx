import { useEffect, useRef } from 'react';
import type { Chord } from '../../music/chordParser';
import { getPossibleNextChords, chordToNotes } from '../../music/chordProgression';
import { audioEngine } from '../../services/audioEngine';
import { useSequenceBuilderStore } from '../../store/sequenceBuilderStore';
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
                            Mode1: <span className={styles.placeholderText}>—</span>
                          </div>
                          <div className={styles.modePlaceholder}>
                            Mode2: <span className={styles.placeholderText}>—</span>
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
                              className="btn btn-primary btn-sm"
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
                              className="btn btn-secondary btn-sm"
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

        {/* Chord Selector */}
        {(
          <div className={styles.selectorSection}>
            <div className={styles.sectionHeader}>
              <h2>Select Chord</h2>
            </div>

            <div className={styles.chordGrid}>
              {possibleChords.map((chord, index) => (
                <div key={index} className={styles.chordOption}>
                  <button
                    onClick={() => handlePlayChord(chord)}
                    className={styles.chordButton}
                  >
                    {chord.displayName}
                  </button>
                  <div className={styles.chordActions}>
                    <button
                      onClick={() => {
                        selectChord(chord);
                        saveDraft();
                      }}
                      className="btn btn-primary btn-sm"
                      title="Add this chord and save"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => selectChord(chord)}
                      className="btn btn-secondary btn-sm"
                      title="Replace draft chord without saving"
                    >
                      Replace
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
