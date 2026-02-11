import { Note } from '../Note';

describe('Note Entity', () => {
  describe('Static Constants', () => {
    it('should have correct sharp note names', () => {
      expect(Note.NOTE_NAMES_SHARP).toEqual([
        'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
      ]);
    });

    it('should have correct flat note names', () => {
      expect(Note.NOTE_NAMES_FLAT).toEqual([
        'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
      ]);
    });

    it('should have correct pitch class mappings', () => {
      expect(Note.NOTE_TO_PITCH_CLASS['C']).toBe(0);
      expect(Note.NOTE_TO_PITCH_CLASS['C#']).toBe(1);
      expect(Note.NOTE_TO_PITCH_CLASS['Db']).toBe(1);
      expect(Note.NOTE_TO_PITCH_CLASS['G']).toBe(7);
      expect(Note.NOTE_TO_PITCH_CLASS['B']).toBe(11);
    });
  });

  describe('Constructor', () => {
    it('should create note without octave', () => {
      const note = new Note('C', 0);
      expect(note.name).toBe('C');
      expect(note.pitchClass).toBe(0);
      expect(note.octave).toBeUndefined();
    });

    it('should create note with octave', () => {
      const note = new Note('A', 9, 4);
      expect(note.name).toBe('A');
      expect(note.pitchClass).toBe(9);
      expect(note.octave).toBe(4);
    });

    it('should throw error for invalid pitch class', () => {
      expect(() => new Note('X', 12)).toThrow('Invalid pitch class: 12');
      expect(() => new Note('Y', -1)).toThrow('Invalid pitch class: -1');
    });
  });

  describe('fromString', () => {
    it('should parse natural notes', () => {
      const note = Note.fromString('C');
      expect(note.name).toBe('C');
      expect(note.pitchClass).toBe(0);
      expect(note.octave).toBeUndefined();
    });

    it('should parse sharp notes', () => {
      const note = Note.fromString('F#');
      expect(note.name).toBe('F#');
      expect(note.pitchClass).toBe(6);
    });

    it('should parse flat notes', () => {
      const note = Note.fromString('Bb');
      expect(note.name).toBe('Bb');
      expect(note.pitchClass).toBe(10);
    });

    it('should parse notes with unicode accidentals', () => {
      const sharp = Note.fromString('C♯');
      expect(sharp.name).toBe('C#');
      expect(sharp.pitchClass).toBe(1);

      const flat = Note.fromString('D♭');
      expect(flat.name).toBe('Db');
      expect(flat.pitchClass).toBe(1);
    });

    it('should parse notes with octave', () => {
      const note = Note.fromString('A4');
      expect(note.name).toBe('A');
      expect(note.pitchClass).toBe(9);
      expect(note.octave).toBe(4);
    });

    it('should parse notes with octave and accidental', () => {
      const note = Note.fromString('C#5');
      expect(note.name).toBe('C#');
      expect(note.pitchClass).toBe(1);
      expect(note.octave).toBe(5);
    });

    it('should handle lowercase input', () => {
      const note = Note.fromString('g#');
      expect(note.name).toBe('G#');
      expect(note.pitchClass).toBe(8);
    });

    it('should throw error for invalid note name', () => {
      expect(() => Note.fromString('H')).toThrow('Invalid note name');
      expect(() => Note.fromString('C##')).toThrow('Invalid note name');
      expect(() => Note.fromString('123')).toThrow('Invalid note name');
      expect(() => Note.fromString('')).toThrow('Invalid note name');
    });
  });

  describe('fromMidiNumber', () => {
    it('should create middle C from MIDI 60', () => {
      const note = Note.fromMidiNumber(60);
      expect(note.pitchClass).toBe(0);
      expect(note.octave).toBe(4);
      expect(note.name).toBe('C');
    });

    it('should create A4 from MIDI 69', () => {
      const note = Note.fromMidiNumber(69);
      expect(note.pitchClass).toBe(9);
      expect(note.octave).toBe(4);
      expect(note.name).toBe('A');
    });

    it('should use sharps by default', () => {
      const note = Note.fromMidiNumber(61);
      expect(note.name).toBe('C#');
    });

    it('should use flats when specified', () => {
      const note = Note.fromMidiNumber(61, false);
      expect(note.name).toBe('Db');
    });

    it('should handle octaves correctly', () => {
      const c3 = Note.fromMidiNumber(48);
      expect(c3.octave).toBe(3);

      const c5 = Note.fromMidiNumber(72);
      expect(c5.octave).toBe(5);
    });
  });

  describe('fromPitchClass', () => {
    it('should create note from pitch class', () => {
      const note = Note.fromPitchClass(7);
      expect(note.name).toBe('G');
      expect(note.pitchClass).toBe(7);
      expect(note.octave).toBeUndefined();
    });

    it('should create note with octave', () => {
      const note = Note.fromPitchClass(9, true, 4);
      expect(note.name).toBe('A');
      expect(note.octave).toBe(4);
    });

    it('should use sharps by default', () => {
      const note = Note.fromPitchClass(1);
      expect(note.name).toBe('C#');
    });

    it('should use flats when specified', () => {
      const note = Note.fromPitchClass(1, false);
      expect(note.name).toBe('Db');
    });
  });

  describe('getNoteName', () => {
    it('should return sharp names by default', () => {
      expect(Note.getNoteName(1)).toBe('C#');
      expect(Note.getNoteName(6)).toBe('F#');
      expect(Note.getNoteName(10)).toBe('A#');
    });

    it('should return flat names when specified', () => {
      expect(Note.getNoteName(1, false)).toBe('Db');
      expect(Note.getNoteName(6, false)).toBe('Gb');
      expect(Note.getNoteName(10, false)).toBe('Bb');
    });

    it('should return natural notes correctly', () => {
      expect(Note.getNoteName(0)).toBe('C');
      expect(Note.getNoteName(4)).toBe('E');
      expect(Note.getNoteName(11)).toBe('B');
    });
  });

  describe('parseNotes', () => {
    it('should parse space-separated notes', () => {
      const result = Note.parseNotes('C E G');
      expect(result.notes).toHaveLength(3);
      expect(result.notes[0].name).toBe('C');
      expect(result.notes[1].name).toBe('E');
      expect(result.notes[2].name).toBe('G');
      expect(result.errors).toHaveLength(0);
    });

    it('should parse comma-separated notes', () => {
      const result = Note.parseNotes('C, E, G');
      expect(result.notes).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
    });

    it('should parse mixed separators', () => {
      const result = Note.parseNotes('C, E G B');
      expect(result.notes).toHaveLength(4);
      expect(result.errors).toHaveLength(0);
    });

    it('should parse notes with accidentals', () => {
      const result = Note.parseNotes('C# Eb F# Ab');
      expect(result.notes).toHaveLength(4);
      expect(result.notes[0].name).toBe('C#');
      expect(result.notes[1].name).toBe('Eb');
      expect(result.errors).toHaveLength(0);
    });

    it('should deduplicate enharmonic equivalents', () => {
      const result = Note.parseNotes('C# Db');
      expect(result.notes).toHaveLength(1); // C# and Db are same pitch class
      expect(result.errors).toHaveLength(0);
    });

    it('should handle empty input', () => {
      const result = Note.parseNotes('');
      expect(result.notes).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should collect errors for invalid notes', () => {
      const result = Note.parseNotes('C X E Z G');
      expect(result.notes).toHaveLength(3); // C, E, G
      expect(result.errors).toHaveLength(2); // X, Z
      expect(result.errors[0]).toContain('X');
      expect(result.errors[1]).toContain('Z');
    });
  });

  describe('toMidiNumber', () => {
    it('should convert note with octave to MIDI', () => {
      const c4 = new Note('C', 0, 4);
      expect(c4.toMidiNumber()).toBe(60);
    });

    it('should convert A4 to MIDI 69', () => {
      const a4 = new Note('A', 9, 4);
      expect(a4.toMidiNumber()).toBe(69);
    });

    it('should use default octave when provided', () => {
      const c = new Note('C', 0);
      expect(c.toMidiNumber(4)).toBe(60);
    });

    it('should throw error when octave not specified', () => {
      const c = new Note('C', 0);
      expect(() => c.toMidiNumber()).toThrow('octave not specified');
    });
  });

  describe('transpose', () => {
    it('should transpose up by semitones', () => {
      const c = new Note('C', 0);
      const e = c.transpose(4);
      expect(e.pitchClass).toBe(4);
      expect(e.name).toBe('E');
    });

    it('should transpose down by semitones', () => {
      const e = new Note('E', 4);
      const c = e.transpose(-4);
      expect(c.pitchClass).toBe(0);
      expect(c.name).toBe('C');
    });

    it('should wrap around octave', () => {
      const b = new Note('B', 11);
      const c = b.transpose(1);
      expect(c.pitchClass).toBe(0);
      expect(c.name).toBe('C');
    });

    it('should handle large positive transpositions', () => {
      const c = new Note('C', 0);
      const c2 = c.transpose(24); // 2 octaves
      expect(c2.pitchClass).toBe(0);
    });

    it('should handle large negative transpositions', () => {
      const c = new Note('C', 0);
      const c2 = c.transpose(-24); // 2 octaves down
      expect(c2.pitchClass).toBe(0);
    });

    it('should use sharps by default', () => {
      const c = new Note('C', 0);
      const cSharp = c.transpose(1);
      expect(cSharp.name).toBe('C#');
    });

    it('should use flats when specified', () => {
      const c = new Note('C', 0);
      const db = c.transpose(1, false);
      expect(db.name).toBe('Db');
    });

    it('should adjust octave when note has octave', () => {
      const a4 = new Note('A', 9, 4);
      const c5 = a4.transpose(3);
      expect(c5.pitchClass).toBe(0);
      expect(c5.octave).toBe(5);
    });

    it('should handle downward octave changes', () => {
      const c4 = new Note('C', 0, 4);
      const a3 = c4.transpose(-3);
      expect(a3.pitchClass).toBe(9);
      expect(a3.octave).toBe(3);
    });
  });

  describe('withOctave', () => {
    it('should create new note with octave', () => {
      const c = new Note('C', 0);
      const c4 = c.withOctave(4);
      expect(c4.name).toBe('C');
      expect(c4.pitchClass).toBe(0);
      expect(c4.octave).toBe(4);
    });

    it('should replace existing octave', () => {
      const c4 = new Note('C', 0, 4);
      const c5 = c4.withOctave(5);
      expect(c5.octave).toBe(5);
    });

    it('should not mutate original note', () => {
      const c = new Note('C', 0);
      const c4 = c.withOctave(4);
      expect(c.octave).toBeUndefined();
    });
  });

  describe('equals', () => {
    it('should return true for same pitch class', () => {
      const c1 = new Note('C', 0);
      const c2 = new Note('C', 0);
      expect(c1.equals(c2)).toBe(true);
    });

    it('should return true for same pitch class with different octaves', () => {
      const c4 = new Note('C', 0, 4);
      const c5 = new Note('C', 0, 5);
      expect(c4.equals(c5)).toBe(true);
    });

    it('should return false for different pitch classes', () => {
      const c = new Note('C', 0);
      const d = new Note('D', 2);
      expect(c.equals(d)).toBe(false);
    });
  });

  describe('equalsExact', () => {
    it('should return true for identical notes', () => {
      const c4a = new Note('C', 0, 4);
      const c4b = new Note('C', 0, 4);
      expect(c4a.equalsExact(c4b)).toBe(true);
    });

    it('should return false for same pitch class, different octave', () => {
      const c4 = new Note('C', 0, 4);
      const c5 = new Note('C', 0, 5);
      expect(c4.equalsExact(c5)).toBe(false);
    });

    it('should return false when octaves undefined vs defined', () => {
      const c = new Note('C', 0);
      const c4 = new Note('C', 0, 4);
      expect(c.equalsExact(c4)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return note name without octave', () => {
      const c = new Note('C', 0);
      expect(c.toString()).toBe('C');
    });

    it('should return note name with octave', () => {
      const c4 = new Note('C', 0, 4);
      expect(c4.toString()).toBe('C4');
    });

    it('should include accidentals', () => {
      const cSharp4 = new Note('C#', 1, 4);
      expect(cSharp4.toString()).toBe('C#4');
    });
  });

  describe('toFrequency', () => {
    it('should convert A4 to 440 Hz', () => {
      const a4 = new Note('A', 9, 4);
      expect(a4.toFrequency()).toBeCloseTo(440, 2);
    });

    it('should convert middle C to ~261.63 Hz', () => {
      const c4 = new Note('C', 0, 4);
      expect(c4.toFrequency()).toBeCloseTo(261.63, 2);
    });

    it('should use default octave when provided', () => {
      const a = new Note('A', 9);
      expect(a.toFrequency(4)).toBeCloseTo(440, 2);
    });

    it('should throw error when octave not specified', () => {
      const c = new Note('C', 0);
      expect(() => c.toFrequency()).toThrow('octave not specified');
    });

    it('should calculate octave relationships correctly', () => {
      const a3 = new Note('A', 9, 3);
      const a4 = new Note('A', 9, 4);
      const a5 = new Note('A', 9, 5);

      expect(a4.toFrequency()).toBeCloseTo(a3.toFrequency() * 2, 2);
      expect(a5.toFrequency()).toBeCloseTo(a4.toFrequency() * 2, 2);
    });
  });
});
