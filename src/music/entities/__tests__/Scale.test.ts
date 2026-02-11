import { Scale } from '../Scale';
import { Note } from '../Note';
import { Chord } from '../Chord';

describe('Scale Entity', () => {
  describe('fromType', () => {
    it('should create scale from type and root string', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'C');
      expect(scale.id).toBe('major');
      expect(scale.name).toBe('Major');
      expect(scale.family).toBe('Diatonic');
      expect(scale.root.name).toBe('C');
      expect(scale.root.pitchClass).toBe(0);
    });

    it('should create scale from type and Note object', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const root = Note.fromString('G');
      const scale = Scale.fromType(scaleType, root);
      expect(scale.root.name).toBe('G');
      expect(scale.root.pitchClass).toBe(7);
    });

    it('should handle optional properties', () => {
      const scaleType = {
        id: 'minor',
        name: 'Natural Minor',
        family: 'Diatonic',
        intervals: [0, 2, 3, 5, 7, 8, 10],
        alternativeNames: ['Aeolian'],
        modeOf: { id: 'major', step: 6 },
      };

      const scale = Scale.fromType(scaleType, 'A');
      expect(scale.alternativeNames).toContain('Aeolian');
      expect(scale.modeOf?.id).toBe('major');
      expect(scale.modeOf?.step).toBe(6);
    });
  });

  describe('getNotes', () => {
    it('should return notes in C major scale', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'C');
      const notes = scale.getNotes();

      expect(notes).toHaveLength(7);
      expect(notes[0].name).toBe('C');
      expect(notes[0].octave).toBe(4);
      expect(notes[1].name).toBe('D');
      expect(notes[2].name).toBe('E');
      expect(notes[3].name).toBe('F');
      expect(notes[4].name).toBe('G');
      expect(notes[5].name).toBe('A');
      expect(notes[6].name).toBe('B');
    });

    it('should handle octave wrapping', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'G');
      const notes = scale.getNotes(true, 4);

      expect(notes[0].name).toBe('G');
      expect(notes[0].octave).toBe(4);
      expect(notes[6].name).toBe('F#');
      expect(notes[6].octave).toBe(5); // Wrapped to next octave
    });

    it('should use sharps by default', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'G');
      const notes = scale.getNotes();

      expect(notes[6].name).toBe('F#');
    });

    it('should use flats when specified', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'F');
      const notes = scale.getNotes(false);

      expect(notes[3].name).toBe('Bb');
    });

    it('should respect baseOctave parameter', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'C');
      const notes = scale.getNotes(true, 5);

      expect(notes[0].octave).toBe(5);
    });

    it('should handle pentatonic scale', () => {
      const scaleType = {
        id: 'pentatonic-major',
        name: 'Major Pentatonic',
        family: 'Pentatonic',
        intervals: [0, 2, 4, 7, 9],
      };

      const scale = Scale.fromType(scaleType, 'C');
      const notes = scale.getNotes();

      expect(notes).toHaveLength(5);
      expect(notes.map(n => n.name)).toEqual(['C', 'D', 'E', 'G', 'A']);
    });
  });

  describe('getPitchClasses', () => {
    it('should return pitch classes for C major', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'C');
      const pcs = scale.getPitchClasses();

      expect(pcs.size).toBe(7);
      expect(pcs.has(0)).toBe(true);  // C
      expect(pcs.has(2)).toBe(true);  // D
      expect(pcs.has(4)).toBe(true);  // E
      expect(pcs.has(5)).toBe(true);  // F
      expect(pcs.has(7)).toBe(true);  // G
      expect(pcs.has(9)).toBe(true);  // A
      expect(pcs.has(11)).toBe(true); // B
    });

    it('should return correct pitch classes for G major', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'G');
      const pcs = scale.getPitchClasses();

      expect(pcs.has(7)).toBe(true);  // G
      expect(pcs.has(9)).toBe(true);  // A
      expect(pcs.has(11)).toBe(true); // B
      expect(pcs.has(0)).toBe(true);  // C
      expect(pcs.has(2)).toBe(true);  // D
      expect(pcs.has(4)).toBe(true);  // E
      expect(pcs.has(6)).toBe(true);  // F#
    });
  });

  describe('getTriads', () => {
    it('should calculate triads for C major scale', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'C');
      const triads = scale.getTriads();

      expect(triads).toHaveLength(7);
      expect(triads[0].root.name).toBe('C');
      expect(triads[0].quality).toBe('major');
      expect(triads[1].root.name).toBe('D');
      expect(triads[1].quality).toBe('minor');
      expect(triads[6].root.name).toBe('B');
      expect(triads[6].quality).toBe('diminished');
    });

    it('should calculate triads for A minor scale', () => {
      const scaleType = {
        id: 'minor',
        name: 'Natural Minor',
        family: 'Diatonic',
        intervals: [0, 2, 3, 5, 7, 8, 10],
      };

      const scale = Scale.fromType(scaleType, 'A');
      const triads = scale.getTriads();

      expect(triads).toHaveLength(7);
      expect(triads[0].root.name).toBe('A');
      expect(triads[0].quality).toBe('minor');
    });
  });

  describe('containsChord', () => {
    const majorScaleType = {
      id: 'major',
      name: 'Major',
      family: 'Diatonic',
      intervals: [0, 2, 4, 5, 7, 9, 11],
    };

    it('should return true for chord in scale', () => {
      const scale = Scale.fromType(majorScaleType, 'C');
      const chord = Chord.fromSymbol('C')!;

      expect(scale.containsChord(chord)).toBe(true);
    });

    it('should return true for diatonic chord', () => {
      const scale = Scale.fromType(majorScaleType, 'C');
      const chord = Chord.fromSymbol('Dm')!;

      expect(scale.containsChord(chord)).toBe(true);
    });

    it('should return false for non-diatonic chord', () => {
      const scale = Scale.fromType(majorScaleType, 'C');
      const chord = Chord.fromSymbol('D')!; // D major (has F#)

      expect(scale.containsChord(chord)).toBe(false);
    });

    it('should check 7th chords', () => {
      const scale = Scale.fromType(majorScaleType, 'C');
      const cmaj7 = Chord.fromSymbol('Cmaj7')!;
      const c7 = Chord.fromSymbol('C7')!;

      expect(scale.containsChord(cmaj7)).toBe(true);
      expect(scale.containsChord(c7)).toBe(false); // Has Bb
    });

    it('should check slash chords', () => {
      const scale = Scale.fromType(majorScaleType, 'C');
      const chord = Chord.fromSymbol('C/E')!;

      expect(scale.containsChord(chord)).toBe(true);
    });
  });

  describe('containsPitchClasses', () => {
    const majorScaleType = {
      id: 'major',
      name: 'Major',
      family: 'Diatonic',
      intervals: [0, 2, 4, 5, 7, 9, 11],
    };

    it('should return true for subset of pitch classes', () => {
      const scale = Scale.fromType(majorScaleType, 'C');
      const pitchClasses = new Set([0, 4, 7]); // C, E, G

      expect(scale.containsPitchClasses(pitchClasses)).toBe(true);
    });

    it('should return false for pitch classes outside scale', () => {
      const scale = Scale.fromType(majorScaleType, 'C');
      const pitchClasses = new Set([0, 1, 4]); // C, C#, E

      expect(scale.containsPitchClasses(pitchClasses)).toBe(false);
    });

    it('should accept array of pitch classes', () => {
      const scale = Scale.fromType(majorScaleType, 'C');
      const pitchClasses = [0, 2, 4]; // C, D, E

      expect(scale.containsPitchClasses(pitchClasses)).toBe(true);
    });

    it('should return true for empty set', () => {
      const scale = Scale.fromType(majorScaleType, 'C');
      const pitchClasses = new Set<number>();

      expect(scale.containsPitchClasses(pitchClasses)).toBe(true);
    });
  });

  describe('getCharacteristics', () => {
    it('should identify C major characteristics', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'C');
      const chars = scale.getCharacteristics();

      expect(chars.noteCount).toBe(7);
      expect(chars.hasAllNaturalNotes).toBe(true);
      expect(chars.hasChromaticNotes).toBe(false);
      expect(chars.containsPerfectFifth).toBe(true);
      expect(chars.containsMajorThird).toBe(true);
      expect(chars.containsMinorThird).toBe(false);
    });

    it('should identify A minor characteristics', () => {
      const scaleType = {
        id: 'minor',
        name: 'Natural Minor',
        family: 'Diatonic',
        intervals: [0, 2, 3, 5, 7, 8, 10],
      };

      const scale = Scale.fromType(scaleType, 'A');
      const chars = scale.getCharacteristics();

      expect(chars.hasAllNaturalNotes).toBe(true);
      expect(chars.containsPerfectFifth).toBe(true);
      expect(chars.containsMajorThird).toBe(false);
      expect(chars.containsMinorThird).toBe(true);
    });

    it('should identify chromatic notes in G major', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'G');
      const chars = scale.getCharacteristics();

      expect(chars.hasAllNaturalNotes).toBe(false);
      expect(chars.hasChromaticNotes).toBe(true); // Has F#
    });

    it('should identify pentatonic characteristics', () => {
      const scaleType = {
        id: 'pentatonic-major',
        name: 'Major Pentatonic',
        family: 'Pentatonic',
        intervals: [0, 2, 4, 7, 9],
      };

      const scale = Scale.fromType(scaleType, 'C');
      const chars = scale.getCharacteristics();

      expect(chars.noteCount).toBe(5);
      expect(chars.containsPerfectFifth).toBe(true);
      expect(chars.containsMajorThird).toBe(true);
    });

    it('should handle diminished scale', () => {
      const scaleType = {
        id: 'diminished',
        name: 'Diminished',
        family: 'Symmetrical',
        intervals: [0, 2, 3, 5, 6, 8, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'C');
      const chars = scale.getCharacteristics();

      expect(chars.noteCount).toBe(8);
      expect(chars.containsMinorThird).toBe(true);
    });
  });

  describe('transpose', () => {
    it('should transpose C major to D major', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const cMajor = Scale.fromType(scaleType, 'C');
      const dMajor = cMajor.transpose(2);

      expect(dMajor.root.name).toBe('D');
      expect(dMajor.root.pitchClass).toBe(2);
      expect(dMajor.intervals).toEqual(cMajor.intervals);
      expect(dMajor.name).toBe('Major');
    });

    it('should transpose up by octave', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'C');
      const transposed = scale.transpose(12);

      expect(transposed.root.name).toBe('C');
      expect(transposed.root.pitchClass).toBe(0);
    });

    it('should transpose down', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const dMajor = Scale.fromType(scaleType, 'D');
      const cMajor = dMajor.transpose(-2);

      expect(cMajor.root.name).toBe('C');
    });

    it('should use sharps by default', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'C');
      const transposed = scale.transpose(1);

      expect(transposed.root.name).toBe('C#');
    });

    it('should use flats when specified', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'C');
      const transposed = scale.transpose(1, false);

      expect(transposed.root.name).toBe('Db');
    });
  });

  describe('Display Methods', () => {
    it('should get display name', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'C');
      expect(scale.getDisplayName()).toBe('C Major');
    });

    it('should handle accidentals in display name', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'F#');
      expect(scale.getDisplayName()).toBe('F# Major');
    });

    it('should convert to string', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'G');
      expect(scale.toString()).toBe('G Major');
    });

    it('should get notes as strings', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'C');
      const noteNames = scale.getNotesAsStrings();

      expect(noteNames).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    });
  });

  describe('Utility Methods', () => {
    it('should calculate extra notes count', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'C');
      const pitchClasses = new Set([0, 4, 7]); // C, E, G (3 notes)

      expect(scale.getExtraNotesCount(pitchClasses)).toBe(4); // 7 - 3 = 4
    });
  });

  describe('Mode Methods', () => {
    it('should identify mode', () => {
      const scaleType = {
        id: 'dorian',
        name: 'Dorian',
        family: 'Diatonic',
        intervals: [0, 2, 3, 5, 7, 9, 10],
        modeOf: { id: 'major', step: 2 },
      };

      const scale = Scale.fromType(scaleType, 'D');

      expect(scale.isMode()).toBe(true);
      expect(scale.getParentScaleId()).toBe('major');
      expect(scale.getModeStep()).toBe(2);
    });

    it('should identify non-mode', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
      };

      const scale = Scale.fromType(scaleType, 'C');

      expect(scale.isMode()).toBe(false);
      expect(scale.getParentScaleId()).toBeNull();
      expect(scale.getModeStep()).toBeNull();
    });

    it('should handle explicit null modeOf', () => {
      const scaleType = {
        id: 'major',
        name: 'Major',
        family: 'Diatonic',
        intervals: [0, 2, 4, 5, 7, 9, 11],
        modeOf: null,
      };

      const scale = Scale.fromType(scaleType, 'C');

      expect(scale.isMode()).toBe(false);
    });
  });
});
