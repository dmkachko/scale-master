/**
 * Scale Characteristics Analysis
 * Analyzes scale intervals to determine characteristics like major/minor, dim/aug, etc.
 */

/**
 * Analyzes the characteristics of a scale based on its intervals
 */
export function analyzeScaleCharacteristics(intervals: number[]): string[] {
  const characteristics: string[] = [];

  // Check for 3rd (major/minor)
  const hasMinor3rd = intervals.includes(3);
  const hasMajor3rd = intervals.includes(4);

  if (hasMinor3rd && hasMajor3rd) {
    // Both 3rds present - don't add a tag
  } else if (hasMinor3rd) {
    characteristics.push('minor');
  } else if (hasMajor3rd) {
    characteristics.push('major');
  }

  // Check for 5th (natural/diminished/augmented)
  const hasDim5th = intervals.includes(6);
  const hasNat5th = intervals.includes(7);
  const hasAug5th = intervals.includes(8);

  const fifthCount = (hasDim5th ? 1 : 0) + (hasNat5th ? 1 : 0) + (hasAug5th ? 1 : 0);

  if (fifthCount > 1) {
    characteristics.push('alt');
  } else if (hasDim5th) {
    characteristics.push('dim');
  } else if (hasAug5th) {
    characteristics.push('aug');
  } else if (hasNat5th) {
    characteristics.push('nat');
  }

  // Check for 7th/maj7/6 (highest note characteristics)
  const hasMinor7th = intervals.includes(10);
  const hasMajor7th = intervals.includes(11);
  const has6th = intervals.includes(9);

  // Prioritize 7ths over 6ths
  if (hasMinor7th && hasMajor7th) {
    // Both 7ths - don't add a tag
  } else if (hasMajor7th) {
    characteristics.push('maj7');
  } else if (hasMinor7th) {
    characteristics.push('7th');
  } else if (has6th && !hasMinor7th && !hasMajor7th) {
    // Only show 6 if no 7ths present
    characteristics.push('6');
  }

  return characteristics;
}
