/**
 * Triad Utilities
 * Calculate and analyze triads built on each scale degree
 */

export type TriadQuality = 'major' | 'minor' | 'diminished' | 'augmented' | 'sus2' | 'sus4';

export interface Triad {
  degree: number; // 0-based index (0 = tonic)
  root: string; // Note name (e.g., 'C', 'D#')
  quality: TriadQuality;
  notes: string[]; // Three notes of the triad
  romanNumeral: string; // e.g., 'I', 'ii', 'iii°'
  extensions?: string[]; // Available extensions (e.g., ['alt5', '7'])
}

/**
 * Triad quality configuration
 */
interface TriadQualityConfig {
  suffix: string;
  nameSuffix: string;
  romanFormatter: (base: string) => string;
}

const TRIAD_QUALITY_CONFIG: Record<TriadQuality, TriadQualityConfig> = {
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
const INTERVAL_PATTERN_TO_QUALITY: Record<string, TriadQuality> = {
  '4,3': 'major',      // Major third + minor third
  '3,4': 'minor',      // Minor third + major third
  '3,3': 'diminished', // Minor third + minor third
  '4,4': 'augmented',  // Major third + major third
  '2,5': 'sus2',       // Major second + perfect fourth
  '5,2': 'sus4',       // Perfect fourth + major second
};

const BASE_ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

/**
 * Determines triad quality based on intervals between the three notes
 * @param intervals - Array of 2 intervals: [root to third, third to fifth]
 */
function determineTriadQuality(intervals: [number, number]): TriadQuality {
  const key = intervals.join(',');
  return INTERVAL_PATTERN_TO_QUALITY[key] || 'major';
}

/**
 * Gets the roman numeral notation for a triad
 */
function getRomanNumeral(degree: number, quality: TriadQuality): string {
  const baseNumeral = BASE_ROMAN_NUMERALS[degree] || '?';
  const config = TRIAD_QUALITY_CONFIG[quality];
  return config.romanFormatter(baseNumeral);
}

/**
 * Gets the full name of a triad
 */
export function getTriadName(root: string, quality: TriadQuality): string {
  const config = TRIAD_QUALITY_CONFIG[quality];
  return `${root}${config.nameSuffix}`;
}

/**
 * Gets the abbreviated name of a triad
 */
export function getTriadAbbreviation(root: string, quality: TriadQuality): string {
  const config = TRIAD_QUALITY_CONFIG[quality];
  return `${root}${config.suffix}`;
}

/**
 * Calculates available extensions for a triad based on scale intervals
 * @param rootInterval - The interval of the triad root in the scale
 * @param fifthInterval - The actual fifth interval of the triad (7 for perfect, 6 for dim, 8 for aug)
 * @param scaleIntervals - All intervals in the scale
 */
function calculateExtensions(
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
 * Calculates all triads in a scale
 * @param scaleNotes - Array of note names in the scale
 * @param scaleIntervals - Array of intervals (semitones from root)
 */
export function calculateTriads(scaleNotes: string[], scaleIntervals: number[]): Triad[] {
  const triads: Triad[] = [];

  for (let i = 0; i < scaleNotes.length; i++) {
    // Build a triad: root (degree i), third (degree i+2), fifth (degree i+4)
    const rootNote = scaleNotes[i];
    const thirdNote = scaleNotes[(i + 2) % scaleNotes.length];
    const fifthNote = scaleNotes[(i + 4) % scaleNotes.length];

    // Calculate intervals between notes
    const rootInterval = scaleIntervals[i];
    const thirdInterval = scaleIntervals[(i + 2) % scaleNotes.length];
    const fifthInterval = scaleIntervals[(i + 4) % scaleNotes.length];

    // Calculate semitones between triad notes
    let rootToThird = (thirdInterval - rootInterval + 12) % 12;
    let thirdToFifth = (fifthInterval - thirdInterval + 12) % 12;

    // Handle octave wrapping for scales with more than 7 notes
    if (i + 2 >= scaleNotes.length) {
      rootToThird = (thirdInterval + 12 - rootInterval) % 12;
    }
    if (i + 4 >= scaleNotes.length) {
      const adjustedFifthInterval = i + 2 >= scaleNotes.length
        ? fifthInterval + 12
        : fifthInterval;
      thirdToFifth = (adjustedFifthInterval - thirdInterval + 12) % 12;
    }

    const quality = determineTriadQuality([rootToThird, thirdToFifth]);
    const romanNumeral = getRomanNumeral(i, quality);

    // Calculate the actual fifth interval (7 for perfect, 6 for dim, 8 for aug)
    const actualFifthInterval = rootToThird + thirdToFifth;

    // Calculate available extensions
    const extensions = calculateExtensions(rootInterval, actualFifthInterval, scaleIntervals);

    triads.push({
      degree: i,
      root: rootNote,
      quality,
      notes: [rootNote, thirdNote, fifthNote],
      romanNumeral,
      extensions: extensions.length > 0 ? extensions : undefined,
    });
  }

  return triads;
}
