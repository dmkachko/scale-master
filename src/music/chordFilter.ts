/**
 * Chord Filter - Filter chords based on whether they fit in selected scales
 *
 * This module re-exports the unified chord-scale checking logic
 * for backwards compatibility and semantic clarity in filtering contexts.
 */

export {
  chordFitsInScale,
  chordFitsInAnyScale,
  chordFitsInAllScales,
  getScalePitchClasses,
} from './chordScaleChecker';
