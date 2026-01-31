#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper functions
function intervalsToSteps(intervals) {
  const steps = [];
  for (let i = 0; i < intervals.length - 1; i++) {
    steps.push(intervals[i + 1] - intervals[i]);
  }
  steps.push(12 - intervals[intervals.length - 1]);
  return steps;
}

function stepsToIntervals(steps) {
  const intervals = [0];
  let current = 0;
  for (let i = 0; i < steps.length - 1; i++) {
    current += steps[i];
    intervals.push(current);
  }
  return intervals;
}

function rotateSteps(steps, rotation) {
  const rotated = [...steps];
  for (let i = 0; i < rotation; i++) {
    rotated.push(rotated.shift());
  }
  return rotated;
}

function addHarmonicMinorModes() {
  const catalogPath = path.join(__dirname, '../public/catalog/scales.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  console.log('Adding Harmonic Minor modes...\n');

  // Find harmonic minor in the catalog
  const harmonicMinor = catalog.scaleTypes.find(s => s.id === 'harmonic-minor');

  if (!harmonicMinor) {
    console.error('Error: Harmonic Minor not found in catalog');
    return;
  }

  // Ensure harmonic minor has steps
  if (!harmonicMinor.steps) {
    harmonicMinor.steps = intervalsToSteps(harmonicMinor.intervals);
  }

  console.log(`Base scale: ${harmonicMinor.name}`);
  console.log(`Intervals: [${harmonicMinor.intervals.join(', ')}]`);
  console.log(`Steps: [${harmonicMinor.steps.join(', ')}]\n`);

  // Define the 6 new modes (mode 1 is harmonic minor itself)
  const newModes = [
    {
      rotation: 1,
      name: 'Locrian Natural 6',
      alternativeNames: ['Locrian #6', 'Locrian 13'],
      family: 'harmonic-minor-modes'
    },
    {
      rotation: 2,
      name: 'Ionian Augmented',
      alternativeNames: ['Ionian #5'],
      family: 'harmonic-minor-modes'
    },
    {
      rotation: 3,
      name: 'Dorian #4',
      alternativeNames: ['Ukrainian Dorian', 'Romanian Minor', 'Altered Dorian'],
      family: 'harmonic-minor-modes'
    },
    {
      rotation: 4,
      name: 'Phrygian Dominant',
      alternativeNames: ['Spanish Phrygian', 'Freygish', 'Hijaz', 'Altered Phrygian'],
      family: 'harmonic-minor-modes'
    },
    {
      rotation: 5,
      name: 'Lydian #2',
      alternativeNames: ['Lydian #9'],
      family: 'harmonic-minor-modes'
    },
    {
      rotation: 6,
      name: 'Super Locrian bb7',
      alternativeNames: ['Ultralocrian', 'Altered Diminished'],
      family: 'harmonic-minor-modes'
    }
  ];

  // Check which modes already exist
  const newScales = [];
  for (const modeInfo of newModes) {
    const rotatedSteps = rotateSteps(harmonicMinor.steps, modeInfo.rotation);
    const intervals = stepsToIntervals(rotatedSteps);

    // Check if this scale already exists
    const existing = catalog.scaleTypes.find(s =>
      s.intervals.length === intervals.length &&
      s.intervals.every((val, idx) => val === intervals[idx])
    );

    if (existing) {
      console.log(`✓ Mode ${modeInfo.rotation + 1} already exists as: ${existing.name}`);
      continue;
    }

    // Generate ID
    const id = modeInfo.name.toLowerCase()
      .replace(/[()]/g, '')
      .replace(/\s+/g, '-')
      .replace(/#/g, 'sharp')
      .replace(/♮/g, 'natural')
      .replace(/♭/g, 'flat')
      .replace(/bb/g, 'double-flat');

    const newScale = {
      id,
      name: modeInfo.name,
      family: modeInfo.family,
      intervals,
      steps: rotatedSteps,
      alternativeNames: modeInfo.alternativeNames,
      modeOf: {
        id: 'harmonic-minor',
        step: modeInfo.rotation + 1
      },
      inversions: {}
    };

    newScales.push(newScale);
    console.log(`+ Adding: ${modeInfo.name} (mode ${modeInfo.rotation + 1})`);
    console.log(`  Intervals: [${intervals.join(', ')}]`);
    console.log(`  Steps: [${rotatedSteps.join(', ')}]`);
  }

  // Add new scales to catalog
  catalog.scaleTypes.push(...newScales);

  // Now update harmonic minor with inversions
  harmonicMinor.inversions = {};
  harmonicMinor.modeOf = null;

  for (const modeInfo of newModes) {
    const rotatedSteps = rotateSteps(harmonicMinor.steps, modeInfo.rotation);
    const intervals = stepsToIntervals(rotatedSteps);

    const modeScale = catalog.scaleTypes.find(s =>
      s.intervals.length === intervals.length &&
      s.intervals.every((val, idx) => val === intervals[idx])
    );

    if (modeScale) {
      harmonicMinor.inversions[modeInfo.rotation + 1] = modeScale.id;
    }
  }

  // Calculate inversions for each new mode
  for (const scale of newScales) {
    for (let rotation = 1; rotation < scale.steps.length; rotation++) {
      const rotatedSteps = rotateSteps(scale.steps, rotation);
      const rotatedIntervals = stepsToIntervals(rotatedSteps);

      const foundScale = catalog.scaleTypes.find(s =>
        s.intervals.length === rotatedIntervals.length &&
        s.intervals.every((val, idx) => val === rotatedIntervals[idx])
      );

      if (foundScale && foundScale.id !== scale.id) {
        scale.inversions[rotation + 1] = foundScale.id;
      }
    }
  }

  // Write updated catalog
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

  console.log(`\n✓ Added ${newScales.length} new scales`);
  console.log(`✓ Updated Harmonic Minor with ${Object.keys(harmonicMinor.inversions).length} inversions`);
  console.log(`✓ Total scales in catalog: ${catalog.scaleTypes.length}`);
  console.log(`✓ Updated: ${catalogPath}`);
}

try {
  addHarmonicMinorModes();
} catch (error) {
  console.error('Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
