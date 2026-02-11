/**
 * Chord Parser - Facade over Chord entity for backward compatibility
 * @deprecated Use Chord entity from './entities/Chord' directly for new code
 */

import { Chord as ChordEntity } from './entities/Chord';
import type { ParseChordsResult as EntityParseChordsResult } from './entities/Chord';

/**
 * Legacy Chord interface for backward compatibility
 * @deprecated Use Chord entity directly
 */
export interface Chord {
  root: string;
  rootPitchClass: number;
  quality: string;
  pitchClasses: Set<number>;
  displayName: string;
  bass?: string;
  bassPitchClass?: number;
}

export interface ParseChordsResult {
  chords: Chord[];
  errors: string[];
  allPitchClasses: Set<number>;
}

/**
 * Convert Chord entity to legacy Chord interface
 */
function convertToLegacyChord(chordEntity: ChordEntity): Chord {
  return {
    root: chordEntity.root.name,
    rootPitchClass: chordEntity.root.pitchClass,
    quality: chordEntity.quality,
    pitchClasses: chordEntity.getPitchClasses(),
    displayName: chordEntity.getDisplayName(),
    bass: chordEntity.bass?.name,
    bassPitchClass: chordEntity.bass?.pitchClass,
  };
}

/**
 * Parse a single chord symbol
 * @param chordSymbol - e.g., "C", "Am", "F#maj7", "Bbdim7", "C/E" (slash chord)
 * @returns Chord object or null if invalid
 */
export function parseChord(chordSymbol: string): Chord | null {
  const chordEntity = ChordEntity.fromSymbol(chordSymbol);
  return chordEntity ? convertToLegacyChord(chordEntity) : null;
}

/**
 * Parse multiple chord symbols from input string
 * @param input - e.g., "C Am F G" or "C, Am, F, G"
 * @returns Object with parsed chords, errors, and combined pitch classes
 */
export function parseChords(input: string): ParseChordsResult {
  const result: EntityParseChordsResult = ChordEntity.parseMultiple(input);

  return {
    chords: result.chords.map(convertToLegacyChord),
    errors: result.errors,
    allPitchClasses: result.allPitchClasses,
  };
}

/**
 * Get a helpful list of supported chord types
 */
export function getSupportedChordTypes(): string[] {
  return ChordEntity.getSupportedTypes();
}
