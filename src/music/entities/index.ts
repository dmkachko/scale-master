/**
 * Entity Layer - Barrel Exports
 *
 * This file provides a centralized export point for all music theory entities.
 * Entities encapsulate business logic and domain rules for notes, chords, triads, and scales.
 */

export { Note } from './Note';
export { Chord, type ParseChordsResult } from './Chord';
export { Triad, type TriadQuality } from './Triad';
export { Scale, type ModeOf, type ScaleCharacteristics } from './Scale';
