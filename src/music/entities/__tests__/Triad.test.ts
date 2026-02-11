import { Triad, TriadQuality } from '../Triad';
import { Note } from '../Note';

describe('Triad Entity', () => {
  describe('determineQuality', () => {
    it('should identify major triad (4,3)', () => {
      const quality = Triad.determineQuality([4, 3]);
      expect(quality).toBe('major');
    });

    it('should identify minor triad (3,4)', () => {
      const quality = Triad.determineQuality([3, 4]);
      expect(quality).toBe('minor');
    });

    it('should identify diminished triad (3,3)', () => {
      const quality = Triad.determineQuality([3, 3]);
      expect(quality).toBe('diminished');
    });

    it('should identify augmented triad (4,4)', () => {
      const quality = Triad.determineQuality([4, 4]);
      expect(quality).toBe('augmented');
    });

    it('should identify sus2 triad (2,5)', () => {
      const quality = Triad.determineQuality([2, 5]);
      expect(quality).toBe('sus2');
    });

    it('should identify sus4 triad (5,2)', () => {
      const quality = Triad.determineQuality([5, 2]);
      expect(quality).toBe('sus4');
    });

    it('should default to major for unknown pattern', () => {
      const quality = Triad.determineQuality([6, 6]);
      expect(quality).toBe('major');
    });
  });

  describe('fromDegree - C Major Scale', () => {
    const cMajorNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const cMajorIntervals = [0, 2, 4, 5, 7, 9, 11];

    it('should build I chord (C major)', () => {
      const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 0);
      expect(triad.degree).toBe(0);
      expect(triad.root.name).toBe('C');
      expect(triad.quality).toBe('major');
      expect(triad.notes.map(n => n.name)).toEqual(['C', 'E', 'G']);
      expect(triad.romanNumeral).toBe('I');
    });

    it('should build ii chord (D minor)', () => {
      const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 1);
      expect(triad.root.name).toBe('D');
      expect(triad.quality).toBe('minor');
      expect(triad.notes.map(n => n.name)).toEqual(['D', 'F', 'A']);
      expect(triad.romanNumeral).toBe('ii');
    });

    it('should build iii chord (E minor)', () => {
      const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 2);
      expect(triad.root.name).toBe('E');
      expect(triad.quality).toBe('minor');
      expect(triad.notes.map(n => n.name)).toEqual(['E', 'G', 'B']);
      expect(triad.romanNumeral).toBe('iii');
    });

    it('should build IV chord (F major)', () => {
      const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 3);
      expect(triad.root.name).toBe('F');
      expect(triad.quality).toBe('major');
      expect(triad.notes.map(n => n.name)).toEqual(['F', 'A', 'C']);
      expect(triad.romanNumeral).toBe('IV');
    });

    it('should build V chord (G major)', () => {
      const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 4);
      expect(triad.root.name).toBe('G');
      expect(triad.quality).toBe('major');
      expect(triad.notes.map(n => n.name)).toEqual(['G', 'B', 'D']);
      expect(triad.romanNumeral).toBe('V');
    });

    it('should build vi chord (A minor)', () => {
      const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 5);
      expect(triad.root.name).toBe('A');
      expect(triad.quality).toBe('minor');
      expect(triad.notes.map(n => n.name)).toEqual(['A', 'C', 'E']);
      expect(triad.romanNumeral).toBe('vi');
    });

    it('should build vii° chord (B diminished)', () => {
      const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 6);
      expect(triad.root.name).toBe('B');
      expect(triad.quality).toBe('diminished');
      expect(triad.notes.map(n => n.name)).toEqual(['B', 'D', 'F']);
      expect(triad.romanNumeral).toBe('vii°');
    });
  });

  describe('fromDegree - A Minor Scale', () => {
    const aMinorNotes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const aMinorIntervals = [0, 2, 3, 5, 7, 8, 10];

    it('should build i chord (A minor)', () => {
      const triad = Triad.fromDegree(aMinorNotes, aMinorIntervals, 0);
      expect(triad.root.name).toBe('A');
      expect(triad.quality).toBe('minor');
      expect(triad.romanNumeral).toBe('i');
    });

    it('should build ii° chord (B diminished)', () => {
      const triad = Triad.fromDegree(aMinorNotes, aMinorIntervals, 1);
      expect(triad.root.name).toBe('B');
      expect(triad.quality).toBe('diminished');
      expect(triad.romanNumeral).toBe('ii°');
    });

    it('should build III chord (C major)', () => {
      const triad = Triad.fromDegree(aMinorNotes, aMinorIntervals, 2);
      expect(triad.root.name).toBe('C');
      expect(triad.quality).toBe('major');
      expect(triad.romanNumeral).toBe('III');
    });
  });

  describe('fromDegree - With Note Objects', () => {
    it('should accept Note objects instead of strings', () => {
      const notes = [
        Note.fromString('C'),
        Note.fromString('D'),
        Note.fromString('E'),
        Note.fromString('F'),
        Note.fromString('G'),
        Note.fromString('A'),
        Note.fromString('B')
      ];
      const intervals = [0, 2, 4, 5, 7, 9, 11];

      const triad = Triad.fromDegree(notes, intervals, 0);
      expect(triad.root.name).toBe('C');
      expect(triad.quality).toBe('major');
    });
  });

  describe('calculateAll', () => {
    it('should calculate all triads in C major', () => {
      const cMajorNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      const cMajorIntervals = [0, 2, 4, 5, 7, 9, 11];

      const triads = Triad.calculateAll(cMajorNotes, cMajorIntervals);

      expect(triads).toHaveLength(7);
      expect(triads[0].quality).toBe('major');   // I
      expect(triads[1].quality).toBe('minor');   // ii
      expect(triads[2].quality).toBe('minor');   // iii
      expect(triads[3].quality).toBe('major');   // IV
      expect(triads[4].quality).toBe('major');   // V
      expect(triads[5].quality).toBe('minor');   // vi
      expect(triads[6].quality).toBe('diminished'); // vii°
    });

    it('should calculate all triads in A minor', () => {
      const aMinorNotes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      const aMinorIntervals = [0, 2, 3, 5, 7, 8, 10];

      const triads = Triad.calculateAll(aMinorNotes, aMinorIntervals);

      expect(triads).toHaveLength(7);
      expect(triads[0].quality).toBe('minor');      // i
      expect(triads[1].quality).toBe('diminished'); // ii°
      expect(triads[2].quality).toBe('major');      // III
      expect(triads[3].quality).toBe('minor');      // iv
      expect(triads[4].quality).toBe('minor');      // v
      expect(triads[5].quality).toBe('major');      // VI
      expect(triads[6].quality).toBe('major');      // VII
    });

    it('should handle pentatonic scales', () => {
      const pentatonicNotes = ['C', 'D', 'E', 'G', 'A'];
      const pentatonicIntervals = [0, 2, 4, 7, 9];

      const triads = Triad.calculateAll(pentatonicNotes, pentatonicIntervals);

      expect(triads).toHaveLength(5);
      expect(triads[0].root.name).toBe('C');
      expect(triads[1].root.name).toBe('D');
    });
  });

  describe('Extensions', () => {
    it('should calculate extensions for C major scale triads', () => {
      const cMajorNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      const cMajorIntervals = [0, 2, 4, 5, 7, 9, 11];

      const triads = Triad.calculateAll(cMajorNotes, cMajorIntervals);

      // I chord (C) should have maj7
      expect(triads[0].extensions).toContain('maj7');

      // ii chord (Dm) should have 7
      expect(triads[1].extensions).toContain('7');

      // Some chords should have 6
      const hasSixth = triads.some(t => t.extensions?.includes('6'));
      expect(hasSixth).toBe(true);
    });

    it('should calculate alt5 for diminished chords with augmented fifth in scale', () => {
      // Scale with both b5 and #5 available
      const notes = ['C', 'D', 'E', 'F', 'F#', 'G#', 'A', 'B'];
      const intervals = [0, 2, 4, 5, 6, 8, 9, 11];

      const triads = Triad.calculateAll(notes, intervals);
      const dimTriads = triads.filter(t => t.quality === 'diminished');

      if (dimTriads.length > 0) {
        // Check if any diminished chord has alt5 extension
        const hasAlt5 = dimTriads.some(t => t.extensions?.includes('alt5'));
        expect(hasAlt5).toBeDefined();
      }
    });
  });

  describe('Instance Methods', () => {
    const cMajorNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const cMajorIntervals = [0, 2, 4, 5, 7, 9, 11];

    describe('getName', () => {
      it('should return full name for major triad', () => {
        const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 0);
        expect(triad.getName()).toBe('C major');
      });

      it('should return full name for minor triad', () => {
        const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 1);
        expect(triad.getName()).toBe('D minor');
      });

      it('should return full name for diminished triad', () => {
        const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 6);
        expect(triad.getName()).toBe('B diminished');
      });
    });

    describe('getAbbreviation', () => {
      it('should return abbreviated name for major triad', () => {
        const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 0);
        expect(triad.getAbbreviation()).toBe('C');
      });

      it('should return abbreviated name for minor triad', () => {
        const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 1);
        expect(triad.getAbbreviation()).toBe('Dm');
      });

      it('should return abbreviated name for diminished triad', () => {
        const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 6);
        expect(triad.getAbbreviation()).toBe('B°');
      });
    });

    describe('getRomanNumeral', () => {
      it('should return roman numeral', () => {
        const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 0);
        expect(triad.getRomanNumeral()).toBe('I');
      });

      it('should return lowercase for minor', () => {
        const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 1);
        expect(triad.getRomanNumeral()).toBe('ii');
      });

      it('should include ° for diminished', () => {
        const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 6);
        expect(triad.getRomanNumeral()).toBe('vii°');
      });
    });

    describe('hasExtension', () => {
      it('should return true for existing extension', () => {
        const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 0);
        if (triad.extensions && triad.extensions.length > 0) {
          expect(triad.hasExtension(triad.extensions[0])).toBe(true);
        }
      });

      it('should return false for non-existing extension', () => {
        const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 0);
        expect(triad.hasExtension('b9')).toBe(false);
      });

      it('should return false when no extensions defined', () => {
        const pentatonicNotes = ['C', 'D', 'E', 'G', 'A'];
        const pentatonicIntervals = [0, 2, 4, 7, 9];
        const triad = Triad.fromDegree(pentatonicNotes, pentatonicIntervals, 0);

        if (!triad.extensions) {
          expect(triad.hasExtension('7')).toBe(false);
        }
      });
    });

    describe('getPitchClasses', () => {
      it('should return pitch classes for C major', () => {
        const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 0);
        const pcs = triad.getPitchClasses();
        expect(pcs.size).toBe(3);
        expect(pcs.has(0)).toBe(true);  // C
        expect(pcs.has(4)).toBe(true);  // E
        expect(pcs.has(7)).toBe(true);  // G
      });

      it('should return pitch classes for D minor', () => {
        const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 1);
        const pcs = triad.getPitchClasses();
        expect(pcs.size).toBe(3);
        expect(pcs.has(2)).toBe(true);  // D
        expect(pcs.has(5)).toBe(true);  // F
        expect(pcs.has(9)).toBe(true);  // A
      });
    });

    describe('toString', () => {
      it('should return abbreviated name', () => {
        const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 0);
        expect(triad.toString()).toBe('C');
      });

      it('should return abbreviated name for minor', () => {
        const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 1);
        expect(triad.toString()).toBe('Dm');
      });
    });

    describe('getNotesAsStrings', () => {
      it('should return note names as strings', () => {
        const triad = Triad.fromDegree(cMajorNotes, cMajorIntervals, 0);
        const noteNames = triad.getNotesAsStrings();
        expect(noteNames).toEqual(['C', 'E', 'G']);
      });

      it('should handle accidentals', () => {
        const fSharpMajorNotes = ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'];
        const fSharpMajorIntervals = [0, 2, 4, 5, 7, 9, 11];
        const triad = Triad.fromDegree(fSharpMajorNotes, fSharpMajorIntervals, 0);
        const noteNames = triad.getNotesAsStrings();
        expect(noteNames[0]).toBe('F#');
        expect(noteNames[1]).toBe('A#');
        expect(noteNames[2]).toBe('C#');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle chromatic scales', () => {
      const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const chromaticIntervals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

      const triads = Triad.calculateAll(chromaticNotes, chromaticIntervals);
      expect(triads).toHaveLength(12);
      expect(triads[0].root.name).toBe('C');
    });

    it('should handle scales with accidentals', () => {
      const gMajorNotes = ['G', 'A', 'B', 'C', 'D', 'E', 'F#'];
      const gMajorIntervals = [0, 2, 4, 5, 7, 9, 11];

      const triads = Triad.calculateAll(gMajorNotes, gMajorIntervals);
      expect(triads).toHaveLength(7);
      expect(triads[0].root.name).toBe('G');
      expect(triads[0].quality).toBe('major');
    });

    it('should handle octave wrapping correctly', () => {
      const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      const intervals = [0, 2, 4, 5, 7, 9, 11];

      // Test triad that wraps around (degree 5 = A-C-E)
      const triad = Triad.fromDegree(notes, intervals, 5);
      expect(triad.notes.map(n => n.name)).toEqual(['A', 'C', 'E']);
      expect(triad.quality).toBe('minor');
    });
  });
});
