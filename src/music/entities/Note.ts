/**
 * Note Entity Class
 * Encapsulates note logic including pitch class mapping, octave handling, and transposition
 */

export class Note {
  // Static note name mappings
  static readonly NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
  static readonly NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

  // Pitch class mapping
  static readonly NOTE_TO_PITCH_CLASS: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1,
    'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4,
    'F': 5, 'F#': 6, 'Gb': 6,
    'G': 7, 'G#': 8, 'Ab': 8,
    'A': 9, 'A#': 10, 'Bb': 10,
    'B': 11
  };

  constructor(
    public readonly name: string,
    public readonly pitchClass: number,
    public readonly octave?: number
  ) {
    // Validate pitch class
    if (pitchClass < 0 || pitchClass > 11) {
      throw new Error(`Invalid pitch class: ${pitchClass}. Must be 0-11.`);
    }
  }

  /**
   * Create a Note from a note name string (e.g., "C#", "Bb", "F#4")
   */
  static fromString(noteName: string): Note {
    // Match note pattern: A-G, optional accidental (#, b, ♯, ♭), optional octave
    const match = noteName.match(/^([A-G])([#b♯♭])?(\d+)?$/i);

    if (!match) {
      throw new Error(`Invalid note name: ${noteName}`);
    }

    const [, letter, accidental, octaveStr] = match;

    // Normalize accidental symbols
    let normalizedAccidental = '';
    if (accidental === '#' || accidental === '♯') {
      normalizedAccidental = '#';
    } else if (accidental === 'b' || accidental === '♭') {
      normalizedAccidental = 'b';
    }

    const noteNameNormalized = letter.toUpperCase() + normalizedAccidental;
    const pitchClass = Note.NOTE_TO_PITCH_CLASS[noteNameNormalized];

    if (pitchClass === undefined) {
      throw new Error(`Unknown note name: ${noteNameNormalized}`);
    }

    const octave = octaveStr ? parseInt(octaveStr, 10) : undefined;

    return new Note(noteNameNormalized, pitchClass, octave);
  }

  /**
   * Create a Note from a MIDI note number (middle C = 60)
   */
  static fromMidiNumber(midi: number, preferSharps = true): Note {
    const octave = Math.floor(midi / 12) - 1;
    const pitchClass = midi % 12;
    const name = Note.getNoteName(pitchClass, preferSharps);
    return new Note(name, pitchClass, octave);
  }

  /**
   * Create a Note from a pitch class (0-11)
   */
  static fromPitchClass(pitchClass: number, preferSharps = true, octave?: number): Note {
    const name = Note.getNoteName(pitchClass, preferSharps);
    return new Note(name, pitchClass, octave);
  }

  /**
   * Get note name for a pitch class
   */
  static getNoteName(pitchClass: number, preferSharps = true): string {
    const noteNames = preferSharps ? Note.NOTE_NAMES_SHARP : Note.NOTE_NAMES_FLAT;
    return noteNames[pitchClass];
  }

  /**
   * Parse multiple notes from a string (e.g., "C E G" or "C#, Eb, G")
   */
  static parseNotes(input: string): { notes: Note[]; errors: string[] } {
    const errors: string[] = [];
    const notes: Note[] = [];
    const seenPitchClasses = new Set<number>();

    if (!input || input.trim() === '') {
      return { notes: [], errors: [] };
    }

    // Split by comma or whitespace
    const tokens = input
      .split(/[\s,]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    for (const token of tokens) {
      try {
        const note = Note.fromString(token);

        // Deduplicate enharmonic equivalents
        if (!seenPitchClasses.has(note.pitchClass)) {
          notes.push(note);
          seenPitchClasses.add(note.pitchClass);
        }
      } catch (error) {
        errors.push(`Invalid note: "${token}"`);
      }
    }

    return { notes, errors };
  }

  /**
   * Convert to MIDI number (requires octave to be set)
   */
  toMidiNumber(defaultOctave?: number): number {
    const octave = this.octave ?? defaultOctave;
    if (octave === undefined) {
      throw new Error(`Cannot convert to MIDI number: octave not specified for ${this.name}`);
    }
    return (octave + 1) * 12 + this.pitchClass;
  }

  /**
   * Transpose by semitones
   */
  transpose(semitones: number, preferSharps = true): Note {
    const newPitchClass = (this.pitchClass + semitones + 12 * 100) % 12; // Add large multiple of 12 to handle negatives
    const newName = Note.getNoteName(newPitchClass, preferSharps);

    // Calculate octave change if octave is defined
    let newOctave: number | undefined = undefined;
    if (this.octave !== undefined) {
      const octaveChange = Math.floor((this.pitchClass + semitones) / 12);
      newOctave = this.octave + octaveChange;
    }

    return new Note(newName, newPitchClass, newOctave);
  }

  /**
   * Create a new Note with a specified octave
   */
  withOctave(octave: number): Note {
    return new Note(this.name, this.pitchClass, octave);
  }

  /**
   * Check if two notes are the same (ignoring octave)
   */
  equals(other: Note): boolean {
    return this.pitchClass === other.pitchClass;
  }

  /**
   * Check if two notes are exactly the same (including octave)
   */
  equalsExact(other: Note): boolean {
    return this.pitchClass === other.pitchClass && this.octave === other.octave;
  }

  /**
   * String representation
   */
  toString(): string {
    return this.octave !== undefined ? `${this.name}${this.octave}` : this.name;
  }

  /**
   * Convert to frequency in Hz (requires octave)
   */
  toFrequency(defaultOctave?: number): number {
    const midi = this.toMidiNumber(defaultOctave);
    // A4 (MIDI 69) = 440 Hz
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
}
