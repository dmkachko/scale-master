/**
 * BassNoteSelector Component
 * Allows selection of bass note for slash chords
 */

import clsx from 'clsx';
import styles from '../SequenceBuilderPage.module.css';

interface BassNoteSelectorProps {
  selectedBassNote: string | null;
  availableBassNotes: string[];
  onBassNoteChange: (note: string | null) => void;
}

export default function BassNoteSelector({
  selectedBassNote,
  availableBassNotes,
  onBassNoteChange,
}: BassNoteSelectorProps) {
  return (
    <div className={styles.bassSelector}>
      <h3 className={styles.bassSelectorTitle}>Bass Note</h3>
      <div className={styles.bassNotes}>
        <button
          onClick={() => onBassNoteChange(null)}
          className={clsx(styles.bassNote, selectedBassNote === null && styles.selectedBassNote)}
          title="Use chord root as bass"
        >
          Root
        </button>
        {availableBassNotes.map((note) => (
          <button
            key={note}
            onClick={() => onBassNoteChange(note)}
            className={clsx(styles.bassNote, selectedBassNote === note && styles.selectedBassNote)}
          >
            {note}
          </button>
        ))}
      </div>
    </div>
  );
}
