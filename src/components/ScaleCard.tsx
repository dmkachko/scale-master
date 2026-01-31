/**
 * Scale Card Component
 * Displays a scale with its intervals, notes, and degrees
 */

import { calculateScaleNotes } from '../music/notes';
import { analyzeScaleCharacteristics } from '../music/characteristics';
import { intervalsToRomanNumerals } from '../music/degrees';
import { usePreferencesStore } from '../store/preferencesStore';
import type { ScaleType } from '../types/catalog';
import './ScaleCard.css';

interface ScaleCardProps {
  scale: ScaleType;
  rootNote: number;
}

function ScaleCard({ scale, rootNote }: ScaleCardProps) {
  const accidentalPreference = usePreferencesStore((state) => state.accidentalPreference);
  const preferSharps = accidentalPreference === 'sharps';

  const notes = calculateScaleNotes(rootNote, scale.intervals, preferSharps);
  const characteristics = analyzeScaleCharacteristics(scale.intervals);
  const romanNumerals = intervalsToRomanNumerals(scale.intervals);

  return (
    <div className="scale-card">
      <h3>{scale.name}</h3>

      <div className="tags">
        {scale.family && <span className="tag family-tag">{scale.family}</span>}
        {characteristics.map((char) => (
          <span key={char} className="tag char-tag">
            {char}
          </span>
        ))}
      </div>

      <div className="note-grid">
        <div className="note-row intervals-row">
          {scale.intervals.map((interval, idx) => (
            <div key={idx} className="note-cell interval-cell">
              {interval}
            </div>
          ))}
        </div>

        <div className="note-row notes-row">
          {notes.map((note, idx) => (
            <div key={idx} className="note-cell note-name-cell">
              {note}
            </div>
          ))}
        </div>

        <div className="note-row degrees-row">
          {romanNumerals.map((numeral, idx) => (
            <div key={idx} className="note-cell degree-cell">
              {numeral}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ScaleCard;
