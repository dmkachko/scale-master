#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Convert intervals to steps pattern
function intervalsToSteps(intervals) {
  const steps = [];
  for (let i = 0; i < intervals.length - 1; i++) {
    steps.push(intervals[i + 1] - intervals[i]);
  }
  // Add the step from last note back to octave
  steps.push(12 - intervals[intervals.length - 1]);
  return steps;
}

// Convert steps back to intervals
function stepsToIntervals(steps) {
  const intervals = [0];
  let current = 0;
  for (let i = 0; i < steps.length - 1; i++) {
    current += steps[i];
    intervals.push(current);
  }
  return intervals;
}

// Rotate steps pattern (mode rotation)
function rotateSteps(steps, rotation) {
  const rotated = [...steps];
  for (let i = 0; i < rotation; i++) {
    rotated.push(rotated.shift());
  }
  return rotated;
}

// Compare two interval arrays
function intervalsEqual(intervals1, intervals2) {
  if (intervals1.length !== intervals2.length) return false;
  return intervals1.every((val, idx) => val === intervals2[idx]);
}

function addModalRelationships() {
  const catalogPath = path.join(__dirname, '../public/catalog/scales.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  console.log('Analyzing modal relationships...\n');

  // First, ensure all scales have steps
  for (const scale of catalog.scaleTypes) {
    if (!scale.steps) {
      scale.steps = intervalsToSteps(scale.intervals);
    }
  }

  // Initialize fields
  for (const scale of catalog.scaleTypes) {
    scale.modeOf = null;
    scale.inversions = {};
  }

  // Find modal relationships
  for (let i = 0; i < catalog.scaleTypes.length; i++) {
    const scaleA = catalog.scaleTypes[i];

    // Try rotating this scale to find modes
    for (let rotation = 1; rotation < scaleA.steps.length; rotation++) {
      const rotatedSteps = rotateSteps(scaleA.steps, rotation);
      const rotatedIntervals = stepsToIntervals(rotatedSteps);

      // Find if this rotation matches another scale
      for (let j = 0; j < catalog.scaleTypes.length; j++) {
        if (i === j) continue; // Skip self

        const scaleB = catalog.scaleTypes[j];

        if (intervalsEqual(rotatedIntervals, scaleB.intervals)) {
          // ScaleB is a mode of ScaleA
          // Only set modeOf if it's not already set (to avoid overwriting)
          if (!scaleB.modeOf) {
            scaleB.modeOf = {
              id: scaleA.id,
              step: rotation + 1 // 1-based indexing
            };
          }

          // Add to ScaleA's inversions
          scaleA.inversions[rotation + 1] = scaleB.id;

          console.log(`✓ ${scaleB.name} is mode ${rotation + 1} of ${scaleA.name}`);
        }
      }
    }
  }

  // Summary
  console.log('\n--- Summary ---\n');

  const scalesWithModes = catalog.scaleTypes.filter(s => Object.keys(s.inversions).length > 0);
  const scalesAsModes = catalog.scaleTypes.filter(s => s.modeOf !== null);
  const independentScales = catalog.scaleTypes.filter(s => !s.modeOf && Object.keys(s.inversions).length === 0);

  console.log(`Scales with modes (parent scales): ${scalesWithModes.length}`);
  scalesWithModes.forEach(scale => {
    const modeCount = Object.keys(scale.inversions).length;
    console.log(`  - ${scale.name}: ${modeCount} mode(s)`);
  });

  console.log(`\nScales that are modes of others: ${scalesAsModes.length}`);
  scalesAsModes.forEach(scale => {
    if (scale.modeOf) {
      const parent = catalog.scaleTypes.find(s => s.id === scale.modeOf.id);
      console.log(`  - ${scale.name} (mode ${scale.modeOf.step} of ${parent?.name || scale.modeOf.id})`);
    }
  });

  console.log(`\nIndependent scales (no modal relationships): ${independentScales.length}`);
  independentScales.forEach(scale => {
    console.log(`  - ${scale.name}`);
  });

  // Write updated catalog
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

  console.log(`\n✓ Updated catalog with modal relationships`);
  console.log(`✓ File: ${catalogPath}`);
}

try {
  addModalRelationships();
} catch (error) {
  console.error('Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
