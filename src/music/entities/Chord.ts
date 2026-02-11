/**
 * Chord Entity Class
 * Encapsulates chord logic including root notes, qualities, intervals, and slash chords
 */

import { Note } from './Note';

/**
 * Chord quality definition with intervals and display formatting
 */
interface ChordQualityDefinition {
  intervals: number[];
  displaySuffix: string;
  aliases?: string[];
}

/**
 * Result type for parsing multiple chords
 */
export interface ParseChordsResult {
  chords: Chord[];
  errors: string[];
  allPitchClasses: Set<number>;
}

export class Chord {
  /**
   * Chord quality definitions
   * Each quality maps to intervals from root (in semitones)
   */
  private static readonly CHORD_QUALITIES: Record<string, ChordQualityDefinition> = {
    // Triads
    '': { intervals: [0, 4, 7], displaySuffix: '', aliases: ['maj', 'major'] }, // Major
    'm': { intervals: [0, 3, 7], displaySuffix: 'm', aliases: ['min', 'minor', '-', 'mi'] }, // Minor
    'dim': { intervals: [0, 3, 6], displaySuffix: 'dim', aliases: ['diminished', '°', 'o'] }, // Diminished
    'aug': { intervals: [0, 4, 8], displaySuffix: 'aug', aliases: ['augmented', '+'] }, // Augmented
    'sus2': { intervals: [0, 2, 7], displaySuffix: 'sus2' }, // Suspended 2nd
    'sus4': { intervals: [0, 5, 7], displaySuffix: 'sus4' }, // Suspended 4th

    // 7th chords
    'maj7': { intervals: [0, 4, 7, 11], displaySuffix: 'maj7', aliases: ['Δ'] }, // Major 7th
    'm7': { intervals: [0, 3, 7, 10], displaySuffix: 'm7' }, // Minor 7th
    'dim7': { intervals: [0, 3, 6, 9], displaySuffix: 'dim7' }, // Diminished 7th
    '7': { intervals: [0, 4, 7, 10], displaySuffix: '7', aliases: ['dominant', 'dom'] }, // Dominant 7th
    'mmaj7': { intervals: [0, 3, 7, 11], displaySuffix: 'mmaj7' }, // Minor major 7th
    'm7b5': { intervals: [0, 3, 6, 10], displaySuffix: 'ø7', aliases: ['ø'] }, // Half-diminished
    'aug7': { intervals: [0, 4, 8, 10], displaySuffix: 'aug7' }, // Augmented 7th
    '7sus4': { intervals: [0, 5, 7, 10], displaySuffix: '7sus4' }, // Dominant 7 sus4

    // 6th chords
    '6': { intervals: [0, 4, 7, 9], displaySuffix: '6' }, // Major 6th
    'm6': { intervals: [0, 3, 7, 9], displaySuffix: 'm6' }, // Minor 6th
  };

  /**
   * Alias lookup cache (built on first access)
   */
  private static qualityAliasCache: Record<string, string> | null = null;

  constructor(
    public readonly root: Note,
    public readonly quality: string,
    public readonly intervals: number[],
    public readonly displaySuffix: string,
    public readonly bass?: Note
  ) {}

  /**
   * Build alias lookup map for chord qualities
   */
  private static getQualityAliases(): Record<string, string> {
    if (this.qualityAliasCache) {
      return this.qualityAliasCache;
    }

    const aliases: Record<string, string> = {};

    for (const [qualityKey, qualityDef] of Object.entries(this.CHORD_QUALITIES)) {
      // Add displaySuffix as alias
      const displaySuffix = qualityDef.displaySuffix.toLowerCase();
      if (displaySuffix && displaySuffix !== qualityKey) {
        aliases[displaySuffix] = qualityKey;
      }

      // Add explicit aliases
      if (qualityDef.aliases) {
        for (const alias of qualityDef.aliases) {
          aliases[alias.toLowerCase()] = qualityKey;
        }
      }
    }

    this.qualityAliasCache = aliases;
    return aliases;
  }

  /**
   * Parse a single chord symbol
   * @param chordSymbol - e.g., "C", "Am", "F#maj7", "Bbdim7", "C/E" (slash chord)
   * @returns Chord object or null if invalid
   */
  static fromSymbol(chordSymbol: string): Chord | null {
    const trimmed = chordSymbol.trim();
    if (!trimmed) return null;

    // Check for slash chord notation (e.g., "C/E", "Dm7/G")
    let bassNote: Note | undefined;
    let chordPart = trimmed;

    const slashMatch = trimmed.match(/^(.+)\/([A-G][#b♯♭]?)$/i);
    if (slashMatch) {
      chordPart = slashMatch[1].trim();
      try {
        bassNote = Note.fromString(slashMatch[2]);
      } catch {
        return null;
      }
    }

    // Match chord pattern: root note + optional quality
    const match = chordPart.match(/^([A-G])([#b♯♭]?)(.*)$/i);
    if (!match) return null;

    const [, letter, accidental, qualityStr] = match;

    // Parse root note
    let rootNote: Note;
    try {
      rootNote = Note.fromString(letter + accidental);
    } catch {
      return null;
    }

    // Normalize quality string (lowercase for matching, handle aliases)
    let quality = qualityStr.toLowerCase().trim();
    const aliases = this.getQualityAliases();
    quality = aliases[quality] ?? quality;

    // Look up chord quality
    const chordQuality = this.CHORD_QUALITIES[quality];
    if (!chordQuality) {
      return null;
    }

    return new Chord(
      rootNote,
      quality || 'major',
      chordQuality.intervals,
      chordQuality.displaySuffix,
      bassNote
    );
  }

  /**
   * Parse multiple chord symbols from input string
   * @param input - e.g., "C Am F G" or "C, Am, F, G"
   * @returns Object with parsed chords, errors, and combined pitch classes
   */
  static parseMultiple(input: string): ParseChordsResult {
    const errors: string[] = [];
    const chords: Chord[] = [];
    const allPitchClasses = new Set<number>();

    if (!input || input.trim() === '') {
      return { chords: [], errors: [], allPitchClasses: new Set() };
    }

    // Split by comma or whitespace
    const tokens = input
      .split(/[\s,]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    for (const token of tokens) {
      const chord = this.fromSymbol(token);

      if (!chord) {
        errors.push(`Invalid chord: "${token}"`);
        continue;
      }

      chords.push(chord);

      // Add all pitch classes from this chord to the combined set
      for (const pc of chord.getPitchClasses()) {
        allPitchClasses.add(pc);
      }
    }

    return { chords, errors, allPitchClasses };
  }

  /**
   * Get all pitch classes in this chord (including bass note)
   */
  getPitchClasses(): Set<number> {
    const pitchClasses = new Set<number>();

    // Add chord tones
    for (const interval of this.intervals) {
      pitchClasses.add((this.root.pitchClass + interval) % 12);
    }

    // Add bass note if present and not already in chord
    if (this.bass) {
      pitchClasses.add(this.bass.pitchClass);
    }

    return pitchClasses;
  }

  /**
   * Convert chord to Note objects
   * @param preferSharps - Use sharp or flat note names
   * @param baseOctave - Starting octave for notes
   */
  toNotes(preferSharps = true, baseOctave = 4): Note[] {
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
   * Create a new chord with a different bass note (slash chord)
   */
  withBass(bassNote: string | Note): Chord {
    const bass = typeof bassNote === 'string' ? Note.fromString(bassNote) : bassNote;
    return new Chord(this.root, this.quality, this.intervals, this.displaySuffix, bass);
  }

  /**
   * Get the display name of the chord
   */
  getDisplayName(): string {
    const basePart = this.root.name + this.displaySuffix;
    return this.bass ? `${basePart}/${this.bass.name}` : basePart;
  }

  /**
   * String representation
   */
  toString(): string {
    return this.getDisplayName();
  }

  /**
   * Get helpful list of supported chord types
   */
  static getSupportedTypes(): string[] {
    return [
      'Major triads: C, D, E, etc.',
      'Minor triads: Cm, Dm, Em, etc.',
      'Diminished: Cdim, Ddim, etc.',
      'Augmented: Caug, Daug, etc.',
      'Suspended: Csus2, Dsus4, etc.',
      'Major 7th: Cmaj7, Dmaj7, etc.',
      'Minor 7th: Cm7, Dm7, etc.',
      'Dominant 7th: C7, D7, etc.',
      'Diminished 7th: Cdim7, Ddim7, etc.',
      'Half-diminished: Cm7b5, Dm7b5, etc.',
      'Major 6th: C6, D6, etc.',
      'Minor 6th: Cm6, Dm6, etc.',
      'Minor major 7th: Cmmaj7, Dmmaj7, etc.',
    ];
  }
}
