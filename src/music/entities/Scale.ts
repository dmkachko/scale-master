/**
 * Scale Entity Class
 * Encapsulates scale logic including note generation, triad calculation, and chord matching
 */

import { Note } from './Note';
import { Triad } from './Triad';
import { Chord } from './Chord';

export interface ModeOf {
  id: string;
  step: number;
}

export interface ScaleCharacteristics {
  noteCount: number;
  hasAllNaturalNotes: boolean;
  hasChromaticNotes: boolean;
  containsPerfectFifth: boolean;
  containsMajorThird: boolean;
  containsMinorThird: boolean;
}

export class Scale {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly family: string,
    public readonly intervals: number[],
    public readonly root: Note,
    public readonly steps?: number[],
    public readonly alternativeNames?: string[],
    public readonly modeOf?: ModeOf | null,
    public readonly inversions?: Record<string, string>
  ) {}

  /**
   * Create a Scale from a ScaleType and root note
   */
  static fromType(
    scaleType: {
      id: string;
      name: string;
      family: string;
      intervals: number[];
      steps?: number[];
      alternativeNames?: string[];
      modeOf?: ModeOf | null;
      inversions?: Record<string, string>;
    },
    root: Note | string
  ): Scale {
    const rootNote = typeof root === 'string' ? Note.fromString(root) : root;
    return new Scale(
      scaleType.id,
      scaleType.name,
      scaleType.family,
      scaleType.intervals,
      rootNote,
      scaleType.steps,
      scaleType.alternativeNames,
      scaleType.modeOf,
      scaleType.inversions
    );
  }

  /**
   * Get all notes in the scale
   */
  getNotes(preferSharps = true, baseOctave = 4): Note[] {
    const notes: Note[] = [];
    let currentOctave = baseOctave;
    let prevPitchClass = this.root.pitchClass;

    for (const interval of this.intervals) {
      const pitchClass = (this.root.pitchClass + interval) % 12;

      // Handle octave wrapping
      if (interval > 0 && pitchClass < prevPitchClass) {
        currentOctave++;
      }

      notes.push(Note.fromPitchClass(pitchClass, preferSharps, currentOctave));
      prevPitchClass = pitchClass;
    }

    return notes;
  }

  /**
   * Get all pitch classes in the scale
   */
  getPitchClasses(): Set<number> {
    const pitchClasses = new Set<number>();
    for (const interval of this.intervals) {
      pitchClasses.add((this.root.pitchClass + interval) % 12);
    }
    return pitchClasses;
  }

  /**
   * Calculate all triads in the scale
   */
  getTriads(): Triad[] {
    const notes = this.getNotes();
    return Triad.calculateAll(notes, this.intervals);
  }

  /**
   * Check if the scale contains a specific chord
   */
  containsChord(chord: Chord): boolean {
    const scalePitchClasses = this.getPitchClasses();
    const chordPitchClasses = chord.getPitchClasses();

    for (const pc of chordPitchClasses) {
      if (!scalePitchClasses.has(pc)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if the scale contains all given pitch classes
   */
  containsPitchClasses(pitchClasses: Set<number> | number[]): boolean {
    const scalePitchClasses = this.getPitchClasses();
    const inputPCs = Array.isArray(pitchClasses) ? pitchClasses : Array.from(pitchClasses);

    for (const pc of inputPCs) {
      if (!scalePitchClasses.has(pc)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get characteristics of the scale
   */
  getCharacteristics(): ScaleCharacteristics {
    const pitchClasses = this.getPitchClasses();
    const naturalNotes = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B

    // Check if scale has all natural notes
    const hasAllNaturalNotes = naturalNotes.every(pc => pitchClasses.has(pc));

    // Check if scale has chromatic notes (accidentals)
    const chromaticNotes = [1, 3, 6, 8, 10]; // C#/Db, D#/Eb, F#/Gb, G#/Ab, A#/Bb
    const hasChromaticNotes = chromaticNotes.some(pc => pitchClasses.has(pc));

    // Check for specific intervals from root
    const containsPerfectFifth = this.intervals.includes(7);
    const containsMajorThird = this.intervals.includes(4);
    const containsMinorThird = this.intervals.includes(3);

    return {
      noteCount: this.intervals.length,
      hasAllNaturalNotes,
      hasChromaticNotes,
      containsPerfectFifth,
      containsMajorThird,
      containsMinorThird,
    };
  }

  /**
   * Transpose the scale to a new root
   */
  transpose(semitones: number, preferSharps = true): Scale {
    const newRoot = this.root.transpose(semitones, preferSharps);
    return new Scale(
      this.id,
      this.name,
      this.family,
      this.intervals,
      newRoot,
      this.steps,
      this.alternativeNames,
      this.modeOf,
      this.inversions
    );
  }

  /**
   * Get the scale's display name with root (e.g., "C Major")
   */
  getDisplayName(): string {
    return `${this.root.name} ${this.name}`;
  }

  /**
   * Get number of extra notes compared to a set of pitch classes
   */
  getExtraNotesCount(pitchClasses: Set<number>): number {
    const scalePCs = this.getPitchClasses();
    return scalePCs.size - pitchClasses.size;
  }

  /**
   * Check if this scale is a mode of another scale
   */
  isMode(): boolean {
    return this.modeOf !== null && this.modeOf !== undefined;
  }

  /**
   * Get the parent scale ID if this is a mode
   */
  getParentScaleId(): string | null {
    return this.modeOf?.id ?? null;
  }

  /**
   * Get the mode step (1-based) if this is a mode
   */
  getModeStep(): number | null {
    return this.modeOf?.step ?? null;
  }

  /**
   * String representation
   */
  toString(): string {
    return this.getDisplayName();
  }

  /**
   * Get scale notes as strings (for backward compatibility)
   */
  getNotesAsStrings(preferSharps = true): string[] {
    return this.getNotes(preferSharps).map(note => note.name);
  }
}
