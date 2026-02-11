/**
 * ChordCard Component
 * Displays a chord card in the sequence with controls for editing, playback, and beat management
 */

import { Pencil, Check, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Chord } from '../../../music/chordParser';
import styles from '../SequenceBuilderPage.module.css';

interface SequenceState {
  chord: Chord | null;
  beats: number;
  s1?: { scale: string; root: string };
  s2?: { scale: string; root: string };
  saved?: boolean;
}

interface ChordCardProps {
  state: SequenceState;
  index: number;
  isDraft: boolean;
  isPlaying: boolean;
  isEditing: boolean;
  isDisabled: boolean;
  canSaveDraft: boolean;
  onPlayChord: (chord: Chord | null, beats: number) => void;
  onEditCard?: () => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  onDeleteCard?: () => void;
  onSaveDraft?: () => void;
  onMoveToPrevious?: () => void;
  onClearChord?: () => void;
  onClearS1?: () => void;
  onClearS2?: () => void;
  onIncreaseBeats: () => void;
  onDecreaseBeats: () => void;
}

export default function ChordCard({
  state,
  index,
  isDraft,
  isPlaying,
  isEditing,
  isDisabled,
  canSaveDraft,
  onPlayChord,
  onEditCard,
  onSaveEdit,
  onCancelEdit,
  onDeleteCard,
  onSaveDraft,
  onMoveToPrevious,
  onClearChord,
  onClearS1,
  onClearS2,
  onIncreaseBeats,
  onDecreaseBeats,
}: ChordCardProps) {
  const isSaved = state.saved;
  const beats = state.beats || 4;

  return (
    <div
      className={`${styles.stateCard} ${
        isDraft ? styles.currentCard : ''
      } ${isSaved ? styles.savedCard : ''} ${
        isPlaying ? styles.playingCard : ''
      } ${isEditing ? styles.editingCard : ''} ${
        isDisabled ? styles.disabledCard : ''
      }`}
    >
      {/* Card Number and Edit Button */}
      <div className={styles.stateNumber}>
        {index + 1}
        {isSaved && !isEditing && onEditCard && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditCard();
            }}
            className={styles.editButton}
            title="Edit this card"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      {/* Card Content */}
      <div className={styles.stateContent}>
        {/* Chord Display */}
        <div className={styles.chordRow}>
          <div
            className={`${styles.chordDisplay} ${!state.chord ? styles.emptyChord : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onPlayChord(state.chord, beats);
            }}
          >
            {state.chord ? state.chord.displayName : '—'}
          </div>
          {isDraft && state.chord && onClearChord && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearChord();
              }}
              className={styles.clearChordButton}
              title="Clear chord selection"
            >
              ×
            </button>
          )}
        </div>

        {/* Scale Placeholders */}
        <div className={styles.modePlaceholders}>
          <div className={styles.modePlaceholder}>
            <span className={styles.scaleLabel}>
              S1: {state.s1 ? (
                <span>{state.s1.root} {state.s1.scale}</span>
              ) : (
                <span className={styles.placeholderText}>—</span>
              )}
            </span>
            {isDraft && state.s1 && onClearS1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClearS1();
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
            {isDraft && state.s2 && onClearS2 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClearS2();
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

      {/* Draft Controls */}
      {isDraft && !isDisabled && (
        <div className={styles.cellControls}>
          {state.chord && onSaveDraft && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSaveDraft();
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
          {onMoveToPrevious && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveToPrevious();
              }}
              className="btn btn-link btn-sm"
            >
              &lt;
            </button>
          )}
        </div>
      )}

      {/* Edit Mode Controls */}
      {isEditing && (
        <div className={styles.cellControls}>
          {onSaveEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSaveEdit();
              }}
              className="btn btn-primary btn-sm"
              title="Save changes"
            >
              <Check size={16} />
            </button>
          )}
          {onCancelEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancelEdit();
              }}
              className="btn btn-secondary btn-sm"
              title="Cancel editing"
            >
              <X size={16} />
            </button>
          )}
          {onDeleteCard && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCard();
              }}
              className="btn btn-secondary btn-sm"
              title="Delete this card"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}

      {/* Beat Indicators */}
      <div className={styles.beatIndicators}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDecreaseBeats();
          }}
          className={styles.beatChevron}
          disabled={isDisabled || beats <= 1}
          title="Decrease beats"
        >
          <ChevronLeft size={14} />
        </button>
        <div className={styles.beats}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`${styles.beat} ${
                i < beats ? styles.activeBeat : styles.inactiveBeat
              }`}
            />
          ))}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onIncreaseBeats();
          }}
          className={styles.beatChevron}
          disabled={isDisabled || beats >= 6}
          title="Increase beats"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
