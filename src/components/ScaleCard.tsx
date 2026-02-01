/**
 * Scale Card Component
 * Displays a scale with its intervals, notes, degrees, and modal relationships
 */

import { Link } from 'react-router-dom';
import { calculateScaleNotes, addOctavesToNotes } from '../music/notes';
import { analyzeScaleCharacteristics } from '../music/characteristics';
import { usePreferencesStore } from '../store/preferencesStore';
import { useCatalogStore } from '../store/catalogStore';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import type { ScaleType } from '../types/catalog';
import type { ScalePattern } from '../services/scalePatterns';
import './ScaleCard.css';

interface ScaleCardProps {
  scale: ScaleType;
  rootNote: number;
  highlighted?: boolean;
  onNavigate?: (scaleId: string) => void;
  showMoreLink?: boolean;
  pattern?: ScalePattern; // Optional pattern override (defaults to store preference)
}

function ScaleCard({ scale, rootNote, highlighted = false, onNavigate, showMoreLink = true, pattern }: ScaleCardProps) {
  const accidentalPreference = usePreferencesStore((state) => state.accidentalPreference);
  const timeSignature = usePreferencesStore((state) => state.timeSignature);
  const tempo = usePreferencesStore((state) => state.tempo);
  const storePattern = usePreferencesStore((state) => state.playbackPattern);
  const preferSharps = accidentalPreference === 'sharps';
  const catalog = useCatalogStore((state) => state.catalog);

  // Use provided pattern or fall back to store preference
  const activePattern = pattern || storePattern;

  const { isPlaying, currentNoteStep, playNote, togglePlayback } = useAudioPlayback({
    scaleId: scale.id,
  });

  const notes = calculateScaleNotes(rootNote, scale.intervals, preferSharps);
  const notesWithOctaves = addOctavesToNotes(notes, 4); // Calculate proper octaves
  const characteristics = analyzeScaleCharacteristics(scale.intervals);

  const handlePlayNote = async (noteWithOctave: string) => {
    if (!isPlaying) {
      // Extract note name and octave
      const match = noteWithOctave.match(/^([A-G][#b]?)(\d+)$/);
      if (match) {
        const [, note, octave] = match;
        await playNote(note, parseInt(octave));
      }
    }
  };

  const handlePlayAll = async () => {
    await togglePlayback(notes, timeSignature, tempo, activePattern);
  };

  // Get parent scale name if this is a mode
  const parentScale = scale.modeOf
    ? catalog?.scaleTypes.find((s) => s.id === scale.modeOf?.id)
    : null;

  // Calculate parent scale root note
  const parentRootNote = parentScale && scale.modeOf
    ? (rootNote - parentScale.intervals[scale.modeOf.step - 1] + 12) % 12
    : null;

  const parentRootNoteName = parentRootNote !== null
    ? calculateScaleNotes(parentRootNote, [0], preferSharps)[0]
    : null;

  // Get mode names from inversions
  const modeNames = scale.inversions
    ? Object.entries(scale.inversions).map(([step, scaleId]) => {
        const modeScale = catalog?.scaleTypes.find((s) => s.id === scaleId);
        return { step: parseInt(step), name: modeScale?.name || scaleId, id: scaleId };
      })
    : [];

  // Mode navigation is handled by Link components now

  return (
    <div
      id={scale.id}
      className={`scale-card${highlighted ? ' highlighted' : ''}`}
    >
      <div className="scale-card-header">
        <h3>{scale.name}</h3>
        {showMoreLink && (
          <Link to={`/scale/${scale.id}`} className="more-link">
            More →
          </Link>
        )}
      </div>

      {scale.alternativeNames && scale.alternativeNames.length > 0 && (
        <div className="alternative-names">
          Also known as: {scale.alternativeNames.join(', ')}
        </div>
      )}

      <div className="tags">
        {scale.family && <span className="tag family-tag">{scale.family}</span>}
        {characteristics.map((char) => (
          <span key={char} className="tag char-tag">
            {char}
          </span>
        ))}
      </div>

      <div className="scale-card-controls">
        <button
          onClick={handlePlayAll}
          className={`play-all-button ${isPlaying ? 'playing' : ''}`}
          aria-label={isPlaying ? 'Stop playback' : 'Play all scale steps'}
        >
          {isPlaying ? (
            <>
              <span className="play-icon">⏹</span> Stop
            </>
          ) : (
            <>
              <span className="play-icon">▶</span> Play All
            </>
          )}
        </button>
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
          {notes.map((note, idx) => {
            // Highlight the note that's currently being played
            const isCurrentNote = currentNoteStep === idx;

            return (
              <button
                key={idx}
                onClick={() => handlePlayNote(notesWithOctaves[idx])}
                className={`note-cell note-name-cell ${isCurrentNote ? 'playing' : ''}`}
                aria-label={`Play ${note}`}
                disabled={isPlaying}
              >
                <span className="note-name">{note}</span>
              </button>
            );
          })}
        </div>

        {scale.steps && (
          <div className="note-row steps-row">
            {scale.steps.map((step, idx) => (
              <div key={idx} className="note-cell step-cell">
                {step === 1 ? 'H' : step === 2 ? 'W' : step === 3 ? 'W½' : step}
              </div>
            ))}
          </div>
        )}
      </div>

      {parentScale && scale.modeOf && parentRootNoteName && (
        <div className="scale-info-section mode-of">
          <div className="info-label">Mode of:</div>
          <div className="info-value">
            <Link to={`/scale/${scale.modeOf.id}`} className="mode-link">
              <strong>{parentRootNoteName} {parentScale.name}</strong>
            </Link>{' '}
            (starting from step {scale.modeOf.step})
          </div>
        </div>
      )}

      {modeNames.length > 0 && (
        <div className="scale-info-section inversions">
          <div className="info-label">Modes of this scale:</div>
          <div className="modes-list">
            {modeNames.map(({ step, name, id }) => (
              <Link
                key={step}
                to={`/scale/${id}`}
                className="mode-item"
        
              >
                <span className="mode-step">{step}</span>
                <span className="mode-name">{name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ScaleCard;
