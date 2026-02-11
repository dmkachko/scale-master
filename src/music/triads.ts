/**
 * Triad Utilities - Facade over Triad entity for backward compatibility
 * @deprecated Use Triad entity from './entities/Triad' directly for new code
 */

import { Triad as TriadEntity, type TriadQuality } from './entities/Triad';
import { Note } from './entities/Note';

export type { TriadQuality };

/**
 * Legacy Triad interface for backward compatibility
 * @deprecated Use Triad entity directly
 */
export interface Triad {
  degree: number;
  root: string;
  quality: TriadQuality;
  notes: string[];
  romanNumeral: string;
  extensions?: string[];
}

/**
 * Convert Triad entity to legacy Triad interface
 */
function convertToLegacyTriad(triadEntity: TriadEntity): Triad {
  return {
    degree: triadEntity.degree,
    root: triadEntity.root.name,
    quality: triadEntity.quality,
    notes: triadEntity.getNotesAsStrings(),
    romanNumeral: triadEntity.romanNumeral,
    extensions: triadEntity.extensions,
  };
}

/**
 * Gets the full name of a triad
 */
export function getTriadName(root: string, quality: TriadQuality): string {
  const rootNote = Note.fromString(root);
  const triadEntity = new TriadEntity(0, rootNote, quality, [], '');
  return triadEntity.getName();
}

/**
 * Gets the abbreviated name of a triad
 */
export function getTriadAbbreviation(root: string, quality: TriadQuality): string {
  const rootNote = Note.fromString(root);
  const triadEntity = new TriadEntity(0, rootNote, quality, [], '');
  return triadEntity.getAbbreviation();
}

/**
 * Calculates all triads in a scale
 * @param scaleNotes - Array of note names in the scale
 * @param scaleIntervals - Array of intervals (semitones from root)
 */
export function calculateTriads(scaleNotes: string[], scaleIntervals: number[]): Triad[] {
  const triadEntities = TriadEntity.calculateAll(scaleNotes, scaleIntervals);
  return triadEntities.map(convertToLegacyTriad);
}
