import { Chord } from '../Chord';
import { Note } from '../Note';

describe('Chord Entity', () => {
  describe('fromSymbol - Major Triads', () => {
    it('should parse C major', () => {
      const chord = Chord.fromSymbol('C');
      expect(chord).not.toBeNull();
      expect(chord!.root.name).toBe('C');
      expect(chord!.root.pitchClass).toBe(0);
      expect(chord!.quality).toBe('major');
      expect(chord!.intervals).toEqual([0, 4, 7]);
    });

    it('should parse F# major', () => {
      const chord = Chord.fromSymbol('F#');
      expect(chord).not.toBeNull();
      expect(chord!.root.name).toBe('F#');
      expect(chord!.root.pitchClass).toBe(6);
    });

    it('should parse Bb major', () => {
      const chord = Chord.fromSymbol('Bb');
      expect(chord).not.toBeNull();
      expect(chord!.root.name).toBe('Bb');
      expect(chord!.root.pitchClass).toBe(10);
    });

    it('should handle unicode sharp symbol', () => {
      const chord = Chord.fromSymbol('C♯');
      expect(chord).not.toBeNull();
      expect(chord!.root.name).toBe('C#');
    });

    it('should handle unicode flat symbol', () => {
      const chord = Chord.fromSymbol('D♭');
      expect(chord).not.toBeNull();
      expect(chord!.root.name).toBe('Db');
    });
  });

  describe('fromSymbol - Minor Triads', () => {
    it('should parse Am', () => {
      const chord = Chord.fromSymbol('Am');
      expect(chord).not.toBeNull();
      expect(chord!.root.name).toBe('A');
      expect(chord!.quality).toBe('m');
      expect(chord!.intervals).toEqual([0, 3, 7]);
    });

    it('should parse Dm with alias "min"', () => {
      const chord = Chord.fromSymbol('Dmin');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('m');
    });

    it('should parse Em with alias "minor"', () => {
      const chord = Chord.fromSymbol('Eminor');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('m');
    });

    it('should parse Fm with alias "-"', () => {
      const chord = Chord.fromSymbol('F-');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('m');
    });

    it('should parse Gm with alias "mi"', () => {
      const chord = Chord.fromSymbol('Gmi');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('m');
    });
  });

  describe('fromSymbol - Diminished and Augmented', () => {
    it('should parse Cdim', () => {
      const chord = Chord.fromSymbol('Cdim');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('dim');
      expect(chord!.intervals).toEqual([0, 3, 6]);
    });

    it('should parse Ddim with alias "diminished"', () => {
      const chord = Chord.fromSymbol('Ddiminished');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('dim');
    });

    it('should parse Edim with alias "°"', () => {
      const chord = Chord.fromSymbol('E°');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('dim');
    });

    it('should parse Faug', () => {
      const chord = Chord.fromSymbol('Faug');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('aug');
      expect(chord!.intervals).toEqual([0, 4, 8]);
    });

    it('should parse Gaug with alias "augmented"', () => {
      const chord = Chord.fromSymbol('Gaugmented');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('aug');
    });

    it('should parse Aaug with alias "+"', () => {
      const chord = Chord.fromSymbol('A+');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('aug');
    });
  });

  describe('fromSymbol - Suspended Chords', () => {
    it('should parse Csus2', () => {
      const chord = Chord.fromSymbol('Csus2');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('sus2');
      expect(chord!.intervals).toEqual([0, 2, 7]);
    });

    it('should parse Dsus4', () => {
      const chord = Chord.fromSymbol('Dsus4');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('sus4');
      expect(chord!.intervals).toEqual([0, 5, 7]);
    });
  });

  describe('fromSymbol - 7th Chords', () => {
    it('should parse Cmaj7', () => {
      const chord = Chord.fromSymbol('Cmaj7');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('maj7');
      expect(chord!.intervals).toEqual([0, 4, 7, 11]);
    });

    it('should parse Dmaj7 with alias "Δ"', () => {
      const chord = Chord.fromSymbol('DΔ');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('maj7');
    });

    it('should parse Am7', () => {
      const chord = Chord.fromSymbol('Am7');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('m7');
      expect(chord!.intervals).toEqual([0, 3, 7, 10]);
    });

    it('should parse Bdim7', () => {
      const chord = Chord.fromSymbol('Bdim7');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('dim7');
      expect(chord!.intervals).toEqual([0, 3, 6, 9]);
    });

    it('should parse C7 (dominant 7th)', () => {
      const chord = Chord.fromSymbol('C7');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('7');
      expect(chord!.intervals).toEqual([0, 4, 7, 10]);
    });

    it('should parse D7 with alias "dominant"', () => {
      const chord = Chord.fromSymbol('Ddominant');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('7');
    });

    it('should parse E7 with alias "dom"', () => {
      const chord = Chord.fromSymbol('Edom');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('7');
    });

    it('should parse Cmmaj7 (minor major 7th)', () => {
      const chord = Chord.fromSymbol('Cmmaj7');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('mmaj7');
      expect(chord!.intervals).toEqual([0, 3, 7, 11]);
    });

    it('should parse Dm7b5 (half-diminished)', () => {
      const chord = Chord.fromSymbol('Dm7b5');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('m7b5');
      expect(chord!.intervals).toEqual([0, 3, 6, 10]);
      expect(chord!.displaySuffix).toBe('ø7');
    });

    it('should parse Em7b5 with alias "ø"', () => {
      const chord = Chord.fromSymbol('Eø');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('m7b5');
    });

    it('should parse Faug7', () => {
      const chord = Chord.fromSymbol('Faug7');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('aug7');
      expect(chord!.intervals).toEqual([0, 4, 8, 10]);
    });

    it('should parse G7sus4', () => {
      const chord = Chord.fromSymbol('G7sus4');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('7sus4');
      expect(chord!.intervals).toEqual([0, 5, 7, 10]);
    });
  });

  describe('fromSymbol - 6th Chords', () => {
    it('should parse C6', () => {
      const chord = Chord.fromSymbol('C6');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('6');
      expect(chord!.intervals).toEqual([0, 4, 7, 9]);
    });

    it('should parse Dm6', () => {
      const chord = Chord.fromSymbol('Dm6');
      expect(chord).not.toBeNull();
      expect(chord!.quality).toBe('m6');
      expect(chord!.intervals).toEqual([0, 3, 7, 9]);
    });
  });

  describe('fromSymbol - Slash Chords', () => {
    it('should parse C/E (major chord with bass)', () => {
      const chord = Chord.fromSymbol('C/E');
      expect(chord).not.toBeNull();
      expect(chord!.root.name).toBe('C');
      expect(chord!.bass).toBeDefined();
      expect(chord!.bass!.name).toBe('E');
      expect(chord!.bass!.pitchClass).toBe(4);
    });

    it('should parse Am/C', () => {
      const chord = Chord.fromSymbol('Am/C');
      expect(chord).not.toBeNull();
      expect(chord!.root.name).toBe('A');
      expect(chord!.quality).toBe('m');
      expect(chord!.bass!.name).toBe('C');
    });

    it('should parse Dm7/G', () => {
      const chord = Chord.fromSymbol('Dm7/G');
      expect(chord).not.toBeNull();
      expect(chord!.root.name).toBe('D');
      expect(chord!.quality).toBe('m7');
      expect(chord!.bass!.name).toBe('G');
    });

    it('should parse F#m/C#', () => {
      const chord = Chord.fromSymbol('F#m/C#');
      expect(chord).not.toBeNull();
      expect(chord!.root.name).toBe('F#');
      expect(chord!.bass!.name).toBe('C#');
    });

    it('should handle unicode accidentals in slash chords', () => {
      const chord = Chord.fromSymbol('C♯m/E♯');
      expect(chord).not.toBeNull();
      expect(chord!.root.name).toBe('C#');
      // E# doesn't exist in standard mapping, should fail
    });
  });

  describe('fromSymbol - Error Cases', () => {
    it('should return null for empty string', () => {
      expect(Chord.fromSymbol('')).toBeNull();
    });

    it('should return null for whitespace', () => {
      expect(Chord.fromSymbol('   ')).toBeNull();
    });

    it('should return null for invalid note', () => {
      expect(Chord.fromSymbol('H')).toBeNull();
    });

    it('should return null for invalid quality', () => {
      expect(Chord.fromSymbol('Cxyz')).toBeNull();
    });

    it('should return null for invalid slash chord bass', () => {
      expect(Chord.fromSymbol('C/H')).toBeNull();
    });

    it('should handle lowercase input', () => {
      const chord = Chord.fromSymbol('cm7');
      expect(chord).not.toBeNull();
      expect(chord!.root.name).toBe('C');
      expect(chord!.quality).toBe('m7');
    });
  });

  describe('parseMultiple', () => {
    it('should parse space-separated chords', () => {
      const result = Chord.parseMultiple('C Am F G');
      expect(result.chords).toHaveLength(4);
      expect(result.chords[0].root.name).toBe('C');
      expect(result.chords[1].root.name).toBe('A');
      expect(result.chords[2].root.name).toBe('F');
      expect(result.chords[3].root.name).toBe('G');
      expect(result.errors).toHaveLength(0);
    });

    it('should parse comma-separated chords', () => {
      const result = Chord.parseMultiple('C, Am, F, G');
      expect(result.chords).toHaveLength(4);
      expect(result.errors).toHaveLength(0);
    });

    it('should parse mixed separators', () => {
      const result = Chord.parseMultiple('C, Am F G7');
      expect(result.chords).toHaveLength(4);
      expect(result.errors).toHaveLength(0);
    });

    it('should parse complex chord progression', () => {
      const result = Chord.parseMultiple('Cmaj7 Dm7 G7 Cmaj7');
      expect(result.chords).toHaveLength(4);
      expect(result.chords[0].quality).toBe('maj7');
      expect(result.chords[1].quality).toBe('m7');
      expect(result.chords[2].quality).toBe('7');
      expect(result.errors).toHaveLength(0);
    });

    it('should parse slash chords', () => {
      const result = Chord.parseMultiple('C/E Dm/F G/B');
      expect(result.chords).toHaveLength(3);
      expect(result.chords[0].bass!.name).toBe('E');
      expect(result.chords[1].bass!.name).toBe('F');
      expect(result.chords[2].bass!.name).toBe('B');
      expect(result.errors).toHaveLength(0);
    });

    it('should collect errors for invalid chords', () => {
      const result = Chord.parseMultiple('C X Am Y G');
      expect(result.chords).toHaveLength(3); // C, Am, G
      expect(result.errors).toHaveLength(2); // X, Y
      expect(result.errors[0]).toContain('X');
      expect(result.errors[1]).toContain('Y');
    });

    it('should handle empty input', () => {
      const result = Chord.parseMultiple('');
      expect(result.chords).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
      expect(result.allPitchClasses.size).toBe(0);
    });

    it('should combine all pitch classes', () => {
      const result = Chord.parseMultiple('C Am');
      // C: 0, 4, 7
      // Am: 9, 0, 4
      // Combined: 0, 4, 7, 9
      expect(result.allPitchClasses.size).toBe(4);
      expect(result.allPitchClasses.has(0)).toBe(true);
      expect(result.allPitchClasses.has(4)).toBe(true);
      expect(result.allPitchClasses.has(7)).toBe(true);
      expect(result.allPitchClasses.has(9)).toBe(true);
    });
  });

  describe('getPitchClasses', () => {
    it('should return pitch classes for C major', () => {
      const chord = Chord.fromSymbol('C')!;
      const pcs = chord.getPitchClasses();
      expect(pcs.size).toBe(3);
      expect(pcs.has(0)).toBe(true); // C
      expect(pcs.has(4)).toBe(true); // E
      expect(pcs.has(7)).toBe(true); // G
    });

    it('should return pitch classes for Am7', () => {
      const chord = Chord.fromSymbol('Am7')!;
      const pcs = chord.getPitchClasses();
      expect(pcs.size).toBe(4);
      expect(pcs.has(9)).toBe(true); // A
      expect(pcs.has(0)).toBe(true); // C
      expect(pcs.has(4)).toBe(true); // E
      expect(pcs.has(7)).toBe(true); // G
    });

    it('should include bass note in pitch classes', () => {
      const chord = Chord.fromSymbol('C/E')!;
      const pcs = chord.getPitchClasses();
      expect(pcs.size).toBe(3); // E already in chord
      expect(pcs.has(0)).toBe(true); // C
      expect(pcs.has(4)).toBe(true); // E
      expect(pcs.has(7)).toBe(true); // G
    });

    it('should add bass note when not in chord', () => {
      const chord = Chord.fromSymbol('C/D')!;
      const pcs = chord.getPitchClasses();
      expect(pcs.size).toBe(4); // D not in C major
      expect(pcs.has(0)).toBe(true); // C
      expect(pcs.has(2)).toBe(true); // D (bass)
      expect(pcs.has(4)).toBe(true); // E
      expect(pcs.has(7)).toBe(true); // G
    });
  });

  describe('toNotes', () => {
    it('should convert C major to Note objects', () => {
      const chord = Chord.fromSymbol('C')!;
      const notes = chord.toNotes();
      expect(notes).toHaveLength(3);
      expect(notes[0].name).toBe('C');
      expect(notes[0].octave).toBe(4);
      expect(notes[1].name).toBe('E');
      expect(notes[1].octave).toBe(4);
      expect(notes[2].name).toBe('G');
      expect(notes[2].octave).toBe(4);
    });

    it('should handle octave wrapping', () => {
      const chord = Chord.fromSymbol('A')!;
      const notes = chord.toNotes(true, 4);
      expect(notes[0].name).toBe('A');
      expect(notes[0].octave).toBe(4);
      expect(notes[1].name).toBe('C#');
      expect(notes[1].octave).toBe(5); // Wrapped to next octave
      expect(notes[2].name).toBe('E');
      expect(notes[2].octave).toBe(5);
    });

    it('should use sharps by default', () => {
      const chord = Chord.fromSymbol('C#')!;
      const notes = chord.toNotes();
      expect(notes[0].name).toBe('C#');
      expect(notes[1].name).toBe('F');
      expect(notes[2].name).toBe('G#');
    });

    it('should use flats when specified', () => {
      const chord = Chord.fromSymbol('Db')!;
      const notes = chord.toNotes(false);
      expect(notes[0].name).toBe('Db');
      expect(notes[1].name).toBe('F');
      expect(notes[2].name).toBe('Ab');
    });

    it('should handle 7th chords', () => {
      const chord = Chord.fromSymbol('Cmaj7')!;
      const notes = chord.toNotes();
      expect(notes).toHaveLength(4);
      expect(notes[3].name).toBe('B');
    });

    it('should respect base octave parameter', () => {
      const chord = Chord.fromSymbol('C')!;
      const notes = chord.toNotes(true, 5);
      expect(notes[0].octave).toBe(5);
      expect(notes[1].octave).toBe(5);
      expect(notes[2].octave).toBe(5);
    });
  });

  describe('withBass', () => {
    it('should create slash chord from string', () => {
      const chord = Chord.fromSymbol('C')!;
      const slashChord = chord.withBass('E');
      expect(slashChord.bass).toBeDefined();
      expect(slashChord.bass!.name).toBe('E');
      expect(slashChord.root.name).toBe('C');
    });

    it('should create slash chord from Note', () => {
      const chord = Chord.fromSymbol('Am')!;
      const bassNote = Note.fromString('C');
      const slashChord = chord.withBass(bassNote);
      expect(slashChord.bass).toBeDefined();
      expect(slashChord.bass!.name).toBe('C');
    });

    it('should replace existing bass', () => {
      const chord = Chord.fromSymbol('C/E')!;
      const newChord = chord.withBass('G');
      expect(newChord.bass!.name).toBe('G');
    });

    it('should not mutate original chord', () => {
      const chord = Chord.fromSymbol('C')!;
      const slashChord = chord.withBass('E');
      expect(chord.bass).toBeUndefined();
      expect(slashChord.bass).toBeDefined();
    });
  });

  describe('getDisplayName and toString', () => {
    it('should display major chord correctly', () => {
      const chord = Chord.fromSymbol('C')!;
      expect(chord.getDisplayName()).toBe('C');
      expect(chord.toString()).toBe('C');
    });

    it('should display minor chord correctly', () => {
      const chord = Chord.fromSymbol('Am')!;
      expect(chord.getDisplayName()).toBe('Am');
    });

    it('should display 7th chord correctly', () => {
      const chord = Chord.fromSymbol('Cmaj7')!;
      expect(chord.getDisplayName()).toBe('Cmaj7');
    });

    it('should display half-diminished with special symbol', () => {
      const chord = Chord.fromSymbol('Dm7b5')!;
      expect(chord.getDisplayName()).toBe('Dø7');
    });

    it('should display slash chord correctly', () => {
      const chord = Chord.fromSymbol('C/E')!;
      expect(chord.getDisplayName()).toBe('C/E');
    });

    it('should display complex slash chord correctly', () => {
      const chord = Chord.fromSymbol('Dm7/G')!;
      expect(chord.getDisplayName()).toBe('Dm7/G');
    });
  });

  describe('getSupportedTypes', () => {
    it('should return list of supported chord types', () => {
      const types = Chord.getSupportedTypes();
      expect(types).toBeInstanceOf(Array);
      expect(types.length).toBeGreaterThan(0);
      expect(types[0]).toContain('Major triads');
    });
  });
});
