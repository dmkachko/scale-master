/**
 * Relatives Section Component
 * Displays scales that can be produced by altering one step by a semitone
 */

import { Link } from 'react-router-dom';
import { findRelativeScales, findSecondDegreeRelatives, getModificationDescription } from '../../music/relatives.ts';
import { calculateScaleNotes } from '../../music/notes.ts';
import type { ScaleType } from '../../types/catalog.ts';
import './RelativesSection.css';

interface RelativesSectionProps {
  currentScale: ScaleType;
  allScales: ScaleType[];
  rootNote: number;
  preferSharps: boolean;
}

function RelativesSection({ currentScale, allScales, rootNote, preferSharps }: RelativesSectionProps) {
  const firstDegreeRelatives = findRelativeScales(currentScale, allScales);
  const secondDegreeRelatives = findSecondDegreeRelatives(currentScale, allScales);
  const currentScaleNotes = calculateScaleNotes(rootNote, currentScale.intervals, preferSharps);

  const renderRelativesList = (relatives: typeof firstDegreeRelatives, title: string, description: string, isSecondDegree: boolean = false) => {
    if (relatives.length === 0) {
      return (
        <div className="relatives-subsection">
          <h4>{title}</h4>
          <p className="relatives-description">{description}</p>
          <p className="no-relatives">No relative scales found in the catalog.</p>
        </div>
      );
    }

    return (
      <div className="relatives-subsection">
        <h4>{title}</h4>
        <p className="relatives-description">{description}</p>

        <div className="relatives-list">
          {relatives.map((relative, index) => {
            const relativeScaleNotes = calculateScaleNotes(rootNote, relative.scale.intervals, preferSharps);

            // Build a map of which notes were modified and how
            const modifiedNotesMap = new Map<number, { direction: 'up' | 'down'; originalNote: string }>();

            if (isSecondDegree && relative.modifications) {
              // For second-degree relatives, mark all modified notes
              relative.modifications.forEach((mod) => {
                const degreeIndex = mod.degree - 1;
                modifiedNotesMap.set(degreeIndex, {
                  direction: mod.modification,
                  originalNote: currentScaleNotes[degreeIndex],
                });
              });
            } else {
              // For first-degree relatives, mark the single modified note
              const modifiedDegreeIndex = relative.modifiedDegree - 1;
              modifiedNotesMap.set(modifiedDegreeIndex, {
                direction: relative.modification,
                originalNote: currentScaleNotes[modifiedDegreeIndex],
              });
            }

            // Get parent scale info if this is a mode
            const parentScale = relative.scale.modeOf
              ? allScales.find((s) => s.id === relative.scale.modeOf?.id)
              : null;

            // Calculate parent scale root note
            const parentRootNote = parentScale && relative.scale.modeOf
              ? (rootNote - parentScale.intervals[relative.scale.modeOf.step - 1] + 12) % 12
              : null;

            const parentRootNoteName = parentRootNote !== null
              ? calculateScaleNotes(parentRootNote, [0], preferSharps)[0]
              : null;

            return (
              <Link
                key={`${relative.scale.id}-${index}`}
                to={`/scale/${relative.scale.id}`}
                className="relative-card"
              >
                <div className="relative-header">
                  <div className="relative-name">{relative.scale.name}</div>
                  <div className="relative-family">{relative.scale.family}</div>
                </div>

                <div className="relative-intervals">
                  {relativeScaleNotes.map((note, idx) => {
                    const modification = modifiedNotesMap.get(idx);
                    const colorClass = modification
                      ? modification.direction === 'up'
                        ? 'note-up'
                        : 'note-down'
                      : '';
                    const tooltip = modification ? `${modification.originalNote} → ${note}` : '';

                    return (
                      <span
                        key={idx}
                        className={`interval-badge ${colorClass}`}
                        title={tooltip}
                      >
                        {note}
                      </span>
                    );
                  })}
                </div>

                {parentScale && parentRootNoteName && (
                  <div className="relative-mode-info">
                    Mode of {parentRootNoteName} {parentScale.name}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relatives-section">
      <h3>Related Scales</h3>

      {renderRelativesList(
        firstDegreeRelatives,
        'Relatives I',
        'Scales that differ by one note being altered by a semitone'
      )}

      {renderRelativesList(
        secondDegreeRelatives,
        'Relatives II',
        'Scales that differ by two notes being altered by semitones',
        true
      )}
    </div>
  );
}

export default RelativesSection;
