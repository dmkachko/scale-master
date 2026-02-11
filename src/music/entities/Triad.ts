/**
 * Triad Entity Class
 * Encapsulates triad logic including quality determination, roman numerals, and extensions
 */

import { Note } from './Note';

export type TriadQuality = 'major' | 'minor' | 'diminished' | 'augmented' | 'sus2' | 'sus4';

/**
 * Triad quality configuration
 */
interface TriadQualityConfig {
  suffix: string;
  nameSuffix: string;
  romanFormatter: (base: string) => string;
}

export class Triad {
  /**
   * Triad quality configurations for formatting
   */
  private static readonly QUALITY_CONFIG: Record<TriadQuality, TriadQualityConfig> = {
    major: {
      suffix: '',
      nameSuffix: ' major',
      romanFormatter: (base) => base,
    },
    minor: {
      suffix: 'm',
      nameSuffix: ' minor',
      romanFormatter: (base) => base.toLowerCase(),
    },
    diminished: {
      suffix: '°',
      nameSuffix: ' diminished',
      romanFormatter: (base) => base.toLowerCase() + '°',
    },
    augmented: {
      suffix: '+',
      nameSuffix: ' augmented',
      romanFormatter: (base) => base + '+',
    },
    sus2: {
      suffix: 'sus2',
      nameSuffix: ' sus2',
      romanFormatter: (base) => base + 'sus2',
    },
    sus4: {
      suffix: 'sus4',
      nameSuffix: ' sus4',
      romanFormatter: (base) => base + 'sus4',
    },
  };

  /**
   * Interval pattern to triad quality mapping
   * Key format: "rootToThird,thirdToFifth"
   */
  private static readonly INTERVAL_PATTERN_TO_QUALITY: Record<string, TriadQuality> = {
    '4,3': 'major',      // Major third + minor third
    '3,4': 'minor',      // Minor third + major third
    '3,3': 'diminished', // Minor third + minor third
    '4,4': 'augmented',  // Major third + major third
    '2,5': 'sus2',       // Major second + perfect fourth
    '5,2': 'sus4',       // Perfect fourth + major second
  };

  private static readonly BASE_ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

  constructor(
    public readonly degree: number,      // 0-based index (0 = tonic)
    public readonly root: Note,          // Root note
    public readonly quality: TriadQuality,
    public readonly notes: Note[],       // Three notes of the triad
    public readonly romanNumeral: string,
    public readonly extensions?: string[] // Available extensions
  ) {}

  /**
   * Determines triad quality based on intervals between the three notes
   * @param intervals - [root to third, third to fifth]
   */
  static determineQuality(intervals: [number, number]): TriadQuality {
    const key = intervals.join(',');
    return this.INTERVAL_PATTERN_TO_QUALITY[key] || 'major';
  }

  /**
   * Calculate roman numeral for a degree and quality
   */
  private static calculateRomanNumeral(degree: number, quality: TriadQuality): string {
    const baseNumeral = this.BASE_ROMAN_NUMERALS[degree] || '?';
    const config = this.QUALITY_CONFIG[quality];
    return config.romanFormatter(baseNumeral);
  }

  /**
   * Calculate available extensions for a triad
   */
  private static calculateExtensions(
    rootInterval: number,
    fifthInterval: number,
    scaleIntervals: number[]
  ): string[] {
    const extensions: string[] = [];

    // Get all intervals available from this root note
    const availableIntervals = scaleIntervals.map(interval => (interval - rootInterval + 12) % 12);

    const hasNaturalFifth = fifthInterval === 7;
    const hasDimFifth = fifthInterval === 6;
    const hasAugFifth = fifthInterval === 8;
    const scaleHasAugFifth = availableIntervals.includes(8);
    const scaleHasSixth = availableIntervals.includes(9);
    const scaleHasMinorSeventh = availableIntervals.includes(10);
    const scaleHasMajorSeventh = availableIntervals.includes(11);

    // Rule 1: If chord has b5, check if scale has #5, add "alt5"
    if (hasDimFifth && scaleHasAugFifth) {
      extensions.push('alt5');
    }

    // Rule 2: If chord has natural 5 and scale has #5, add "#5"
    if (hasNaturalFifth && scaleHasAugFifth) {
      extensions.push('#5');
    }

    // Rule 3: If scale has 6 and chord doesn't have #5, add "6"
    if (scaleHasSixth && !hasAugFifth) {
      extensions.push('6');
    }

    // Rule 4: Add 7 or maj7 if available
    if (scaleHasMajorSeventh) {
      extensions.push('maj7');
    } else if (scaleHasMinorSeventh) {
      extensions.push('7');
    }

    return extensions;
  }

  /**
   * Build a triad from a specific scale degree
   * @param scaleNotes - Array of note names or Note objects in the scale
   * @param scaleIntervals - Array of intervals (semitones from root)
   * @param degree - Scale degree (0-based)
   */
  static fromDegree(
    scaleNotes: (string | Note)[],
    scaleIntervals: number[],
    degree: number
  ): Triad {
    // Convert strings to Notes if needed
    const notes = scaleNotes.map(n => typeof n === 'string' ? Note.fromString(n) : n);

    // Build a triad: root (degree i), third (degree i+2), fifth (degree i+4)
    const rootNote = notes[degree];
    const thirdNote = notes[(degree + 2) % notes.length];
    const fifthNote = notes[(degree + 4) % notes.length];

    // Calculate intervals between notes
    const rootInterval = scaleIntervals[degree];
    const thirdInterval = scaleIntervals[(degree + 2) % notes.length];
    const fifthInterval = scaleIntervals[(degree + 4) % notes.length];

    // Calculate semitones between triad notes
    let rootToThird = (thirdInterval - rootInterval + 12) % 12;
    let thirdToFifth = (fifthInterval - thirdInterval + 12) % 12;

    // Handle octave wrapping for scales with more than 7 notes
    if (degree + 2 >= notes.length) {
      rootToThird = (thirdInterval + 12 - rootInterval) % 12;
    }
    if (degree + 4 >= notes.length) {
      const adjustedFifthInterval = degree + 2 >= notes.length
        ? fifthInterval + 12
        : fifthInterval;
      thirdToFifth = (adjustedFifthInterval - thirdInterval + 12) % 12;
    }

    const quality = this.determineQuality([rootToThird, thirdToFifth]);
    const romanNumeral = this.calculateRomanNumeral(degree, quality);

    // Calculate the actual fifth interval (7 for perfect, 6 for dim, 8 for aug)
    const actualFifthInterval = rootToThird + thirdToFifth;

    // Calculate available extensions
    const extensions = this.calculateExtensions(rootInterval, actualFifthInterval, scaleIntervals);

    return new Triad(
      degree,
      rootNote,
      quality,
      [rootNote, thirdNote, fifthNote],
      romanNumeral,
      extensions.length > 0 ? extensions : undefined
    );
  }

  /**
   * Calculate all triads in a scale
   * @param scaleNotes - Array of note names or Note objects in the scale
   * @param scaleIntervals - Array of intervals (semitones from root)
   */
  static calculateAll(
    scaleNotes: (string | Note)[],
    scaleIntervals: number[]
  ): Triad[] {
    const triads: Triad[] = [];

    for (let i = 0; i < scaleNotes.length; i++) {
      triads.push(this.fromDegree(scaleNotes, scaleIntervals, i));
    }

    return triads;
  }

  /**
   * Get the full name of the triad (e.g., "C major", "Dm minor")
   */
  getName(): string {
    const config = Triad.QUALITY_CONFIG[this.quality];
    return `${this.root.name}${config.nameSuffix}`;
  }

  /**
   * Get the abbreviated name (e.g., "C", "Dm", "F°")
   */
  getAbbreviation(): string {
    const config = Triad.QUALITY_CONFIG[this.quality];
    return `${this.root.name}${config.suffix}`;
  }

  /**
   * Get the roman numeral representation
   */
  getRomanNumeral(): string {
    return this.romanNumeral;
  }

  /**
   * Check if triad has a specific extension
   */
  hasExtension(extension: string): boolean {
    return this.extensions?.includes(extension) ?? false;
  }

  /**
   * Get all pitch classes in this triad
   */
  getPitchClasses(): Set<number> {
    return new Set(this.notes.map(note => note.pitchClass));
  }

  /**
   * Convert to chord symbol notation
   */
  toString(): string {
    return this.getAbbreviation();
  }

  /**
   * Get notes as strings (for backward compatibility)
   */
  getNotesAsStrings(): string[] {
    return this.notes.map(note => note.name);
  }
}
