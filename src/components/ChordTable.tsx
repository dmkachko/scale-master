import { useMemo } from 'react';
import { Save } from 'lucide-react';
import { parseChord, type Chord } from '../music/chordParser';
import { NOTE_NAMES_SHARP, NOTE_NAMES_FLAT } from '../music/notes';
import { chordFitsInAllScales } from '../music/chordScaleChecker';
import type { ScaleType } from '../types/catalog';
import styles from './ChordTable.module.css';

interface ChordTableProps {
  selectedChord?: Chord | null;
  onSelectChord: (chord: Chord) => void;
  onAddChord?: (chord: Chord) => void;
  onSaveDraft?: () => void;
  canSaveDraft?: boolean;
  accidentalPreference: 'sharps' | 'flats';
  selectedScales?: Array<{ scale: string; root: string }>;
  scaleTypes?: ScaleType[];
}

// Chord quality groups
const CHORD_GROUPS = {
  'Triads': ['', 'm', 'dim', 'aug', 'sus2', 'sus4'],
  'Seventh Chords': ['maj7', 'm7', '7', 'dim7', 'm7b5', 'mmaj7', 'aug7', '7sus4'],
  'Sixth Chords': ['6', 'm6'],
};

const QUALITY_LABELS: Record<string, string> = {
  '': 'Major',
  'm': 'Minor',
  'dim': 'Diminished',
  'aug': 'Augmented',
  'sus2': 'Sus2',
  'sus4': 'Sus4',
  'maj7': 'Major 7th',
  'm7': 'Minor 7th',
  '7': 'Dominant 7th',
  'dim7': 'Diminished 7th',
  'm7b5': 'Half Diminished',
  'mmaj7': 'Minor Major 7th',
  'aug7': 'Augmented 7th',
  '7sus4': '7sus4',
  '6': 'Major 6th',
  'm6': 'Minor 6th',
};

export default function ChordTable({
  selectedChord,
  onSelectChord,
  onAddChord,
  onSaveDraft,
  canSaveDraft = false,
  accidentalPreference,
  selectedScales = [],
  scaleTypes = [],
}: ChordTableProps) {
  const noteNames = accidentalPreference === 'sharps' ? NOTE_NAMES_SHARP : NOTE_NAMES_FLAT;

  // Generate chords for each quality and root
  const generateChord = (root: string, quality: string): Chord | null => {
    const chordSymbol = `${root}${quality}`;
    return parseChord(chordSymbol);
  };

  // Check if a chord should be shown based on scale filter
  // Chord must fit in ALL selected scales (AND logic)
  const shouldShowChord = (chord: Chord | null): boolean => {
    if (!chord) return false;
    if (selectedScales.length === 0) return true;
    return chordFitsInAllScales(chord, selectedScales, scaleTypes);
  };

  // Generate all chords grouped by root note
  const chordsByRoot = useMemo(() => {
    const result: Record<string, Chord[]> = {};

    noteNames.forEach((root) => {
      const chords: Chord[] = [];

      // Generate all chord qualities for this root
      Object.values(CHORD_GROUPS).flat().forEach((quality) => {
        const chord = generateChord(root, quality);
        if (chord && shouldShowChord(chord)) {
          chords.push(chord);
        }
      });

      // Only include root if it has chords
      if (chords.length > 0) {
        result[root] = chords;
      }
    });

    return result;
  }, [noteNames, selectedScales, scaleTypes]);

  return (
    <div className={styles.chordTableWrapper}>
      {Object.entries(chordsByRoot).map(([root, chords]) => (
        <div key={root} className={styles.rootGroup}>
          <div className={styles.chordPills}>
            {chords.map((chord) => {
              // Compare base chord (without bass) to handle slash chords
              const selectedBaseChord = selectedChord?.displayName.split('/')[0];
              const isSelected = selectedBaseChord === chord.displayName;

              return (
                <div key={chord.displayName} className={styles.chordPillContainer}>
                  <button
                    onClick={() => onSelectChord(chord)}
                    onDoubleClick={() => onAddChord?.(chord)}
                    className={`${styles.chordPill} ${isSelected ? styles.selectedPill : ''}`}
                    title={`${chord.displayName}${onAddChord ? ' (double-click to add)' : ''}`}
                  >
                    {chord.displayName}
                  </button>
                  {isSelected && onSaveDraft && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSaveDraft();
                      }}
                      className={styles.saveLink}
                      disabled={!canSaveDraft}
                      title={canSaveDraft ? 'Save to sequence' : 'Select a chord to save'}
                    >
                      <Save size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {Object.keys(chordsByRoot).length === 0 && (
        <div className={styles.noChords}>
          No chords match the selected scales
        </div>
      )}
    </div>
  );
}
