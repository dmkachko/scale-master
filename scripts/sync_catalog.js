#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Convert combination of 1s and 2s to interval pattern
function combinationToIntervals(combination) {
  const intervals = [0];
  let current = 0;

  for (const step of combination) {
    current += step;
    if (current < 12) { // Don't add the octave
      intervals.push(current);
    }
  }

  return intervals;
}

// Compare two interval arrays for equality
function intervalsEqual(intervals1, intervals2) {
  if (intervals1.length !== intervals2.length) return false;
  return intervals1.every((val, idx) => val === intervals2[idx]);
}

// Generate a unique ID from intervals
function generateId(intervals) {
  return `scale-${intervals.join('-')}`;
}

// Main function
function syncCatalog() {
  // Read combinations file
  const combinationsPath = path.join(__dirname, 'combinations_result.json');
  const combinationsData = JSON.parse(fs.readFileSync(combinationsPath, 'utf8'));

  // Read scales catalog
  const catalogPath = path.join(__dirname, '../public/catalog/scales.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  console.log(`Loaded ${combinationsData.combinations.length} combinations`);
  console.log(`Loaded ${catalog.scaleTypes.length} existing scales\n`);

  // Convert combinations to intervals
  const generatedScales = combinationsData.combinations.map(combo => ({
    combination: combo,
    intervals: combinationToIntervals(combo)
  }));

  // Find missing scales
  const missingScales = [];

  for (const generated of generatedScales) {
    const exists = catalog.scaleTypes.some(scale =>
      intervalsEqual(scale.intervals, generated.intervals)
    );

    if (!exists) {
      missingScales.push(generated);
    }
  }

  console.log(`Found ${missingScales.length} scales not in catalog:`);

  if (missingScales.length === 0) {
    console.log('✓ All scales are already in the catalog!');
    return;
  }

  // Add missing scales to catalog
  let addedCount = 0;
  for (const missing of missingScales) {
    const newScale = {
      id: generateId(missing.intervals),
      name: `Unknown Scale ${addedCount + 1}`,
      family: 'unknown',
      intervals: missing.intervals,
      steps: missing.combination
    };

    catalog.scaleTypes.push(newScale);
    addedCount++;

    console.log(`  + Added: ${newScale.name}`);
    console.log(`    Steps: [${missing.combination.join(', ')}]`);
    console.log(`    Intervals: [${missing.intervals.join(', ')}]`);
  }

  // Write updated catalog
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

  console.log(`\n✓ Added ${addedCount} new scales to catalog`);
  console.log(`✓ Total scales in catalog: ${catalog.scaleTypes.length}`);
  console.log(`✓ Updated: ${catalogPath}`);
}

// Run the sync
try {
  syncCatalog();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
