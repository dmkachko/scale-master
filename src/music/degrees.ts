/**
 * Scale Degree Utilities
 * Converts intervals to roman numeral notation
 */

/**
 * Converts an interval (0-11) to roman numeral notation
 */
export function intervalToRomanNumeral(interval: number): string {
  const romanNumerals: Record<number, string> = {
    0: 'I',
    1: 'bII',
    2: 'II',
    3: 'bIII',
    4: 'III',
    5: 'IV',
    6: '#IV', // or bV, using #IV as more common
    7: 'V',
    8: '#V',  // or bVI, using #V
    9: 'VI',
    10: 'bVII',
    11: 'VII',
  };

  return romanNumerals[interval] || '?';
}

/**
 * Converts an array of intervals to roman numeral notation
 */
export function intervalsToRomanNumerals(intervals: number[]): string[] {
  return intervals.map((interval: number) => intervalToRomanNumeral(interval));
}
