import { useMemo } from 'react';
import type { Catalog } from '../types/catalog';
import type { Chord } from '../music/chordParser';
import { NOTE_NAMES_SHARP, NOTE_NAMES_FLAT } from '../music/notes';
import { chordFitsInScale } from '../music/chordScaleChecker';
import styles from './ScaleTable.module.css';

interface ScaleTableProps {
  catalog: Catalog;
  selectedScale?: { scale: string; root: string };
  onSelectScale: (scaleName: string, root: string) => void;
  accidentalPreference: 'sharps' | 'flats';
  selectedChord?: Chord | null;
}

const FAMILY_LABELS: Record<string, string> = {
  'diatonic': 'Diatonic',
  'minor': 'Minor',
  'pentatonic': 'Pentatonic',
  'blues': 'Blues',
  'symmetrical': 'Symmetrical',
  'melodic-minor-modes': 'Melodic Minor Modes',
  'harmonic-minor-modes': 'Harmonic Minor Modes',
  'bebop': 'Bebop',
  'other': 'Other',
};

export default function ScaleTable({
  catalog,
  selectedScale,
  onSelectScale,
  accidentalPreference,
  selectedChord,
}: ScaleTableProps) {
  const noteNames = accidentalPreference === 'sharps' ? NOTE_NAMES_SHARP : NOTE_NAMES_FLAT;

  // Check if a scale should be shown based on chord filter
  const shouldShowScale = (scaleTypeName: string, root: string): boolean => {
    if (!selectedChord) return true;
    if (!selectedChord.pitchClasses) return true; // Safety check
    const scaleType = catalog.scaleTypes.find(st => st.name === scaleTypeName);
    if (!scaleType) return false;
    return chordFitsInScale(selectedChord, root, scaleType.intervals);
  };

  // Group scales by family
  const scalesByFamily = useMemo(() => {
    const grouped = new Map<string, typeof catalog.scaleTypes>();

    catalog.scaleTypes.forEach((scaleType) => {
      const family = scaleType.family || 'other';
      if (!grouped.has(family)) {
        grouped.set(family, []);
      }
      grouped.get(family)!.push(scaleType);
    });

    return grouped;
  }, [catalog.scaleTypes]);

  // Sort families by a predefined order
  const familyOrder = [
    'diatonic',
    'minor',
    'pentatonic',
    'blues',
    'symmetrical',
    'melodic-minor-modes',
    'harmonic-minor-modes',
    'bebop',
    'other',
  ];

  const sortedFamilies = Array.from(scalesByFamily.keys()).sort((a, b) => {
    const aIndex = familyOrder.indexOf(a);
    const bIndex = familyOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <div className={styles.scaleTableWrapper}>
      {sortedFamilies.map((family) => {
        const scales = scalesByFamily.get(family)!;
        return (
          <div key={family} className={styles.familySection}>
            <h3 className={styles.familyHeader}>{FAMILY_LABELS[family] || family}</h3>
            <table className={styles.scaleTable}>
              <tbody>
                {scales.map((scaleType) => (
                  <tr key={scaleType.id}>
                    <td className={styles.scaleTypeCell}>{scaleType.name}</td>
                    {noteNames.map((root) => {
                      const isSelected =
                        selectedScale?.scale === scaleType.name &&
                        selectedScale?.root === root;
                      const fitsChord = shouldShowScale(scaleType.name, root);
                      return (
                        <td key={root} className={styles.scaleCell}>
                          <button
                            onClick={() => fitsChord && onSelectScale(scaleType.name, root)}
                            className={`${styles.scaleCellButton} ${isSelected ? styles.selectedScaleCell : ''} ${!fitsChord ? styles.disabledScaleCell : ''}`}
                            disabled={!fitsChord}
                            title={
                              fitsChord
                                ? `${root} ${scaleType.name}`
                                : `${root} ${scaleType.name} (chord not in scale)`
                            }
                          >
                            {root}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
