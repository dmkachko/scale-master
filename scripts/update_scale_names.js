#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map of interval patterns to scale information
const scaleNames = {
  '0-2-4-6-8-9-11': {
    name: 'Lydian Augmented',
    alternativeNames: ['Lydian #5'],
    family: 'melodic-minor-modes'
  },
  '0-2-4-6-7-9-10': {
    name: 'Lydian Dominant',
    alternativeNames: ['Acoustic Scale', 'Overtone Scale', 'Bartók Scale', 'Lydian b7', 'Mixolydian #4'],
    family: 'melodic-minor-modes'
  },
  '0-2-4-5-7-8-10': {
    name: 'Aeolian Dominant',
    alternativeNames: ['Mixolydian b6', 'Hindu Scale', 'Melodic Major', 'Mixolydian b13'],
    family: 'melodic-minor-modes'
  },
  '0-2-3-5-6-8-10': {
    name: 'Locrian Natural 2',
    alternativeNames: ['Locrian ♮2', 'Half-Diminished'],
    family: 'melodic-minor-modes'
  },
  '0-2-3-5-6-8-9-11': {
    name: 'Octatonic (Whole-Half)',
    alternativeNames: ['Diminished Scale', 'Whole-Half Diminished'],
    family: 'symmetrical'
  },
  '0-1-3-5-7-9-11': {
    name: 'Neapolitan Major',
    alternativeNames: [],
    family: 'other'
  },
  '0-1-3-5-7-9-10': {
    name: 'Phrygian Natural 6',
    alternativeNames: ['Phrygian ♮6', 'Dorian b2'],
    family: 'other'
  },
  '0-1-3-5-6-8-9-11': {
    name: 'Half-Diminished Bebop',
    alternativeNames: ['Bebop Half-Diminished'],
    family: 'bebop'
  },
  '0-1-3-4-6-8-10': {
    name: 'Superlocrian',
    alternativeNames: ['Altered Scale', 'Diminished Whole Tone', 'Super Locrian', 'Locrian b4'],
    family: 'melodic-minor-modes'
  },
  '0-1-3-4-6-8-9-11': {
    name: 'Van der Horst Octatonic',
    alternativeNames: ['Messiaen Mode 6 Rotation 3', 'Kaptyllic'],
    family: 'symmetrical'
  },
  '0-1-3-4-6-7-9-11': {
    name: 'Tcherepnin Octatonic Mode I',
    alternativeNames: [],
    family: 'symmetrical'
  }
};

function updateScaleNames() {
  const catalogPath = path.join(__dirname, '../public/catalog/scales.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  console.log('Updating scale names...\n');

  let updatedCount = 0;

  for (const scale of catalog.scaleTypes) {
    const intervalKey = scale.intervals.join('-');

    if (scaleNames[intervalKey]) {
      const info = scaleNames[intervalKey];

      console.log(`Updating: ${scale.name}`);
      console.log(`  → New name: ${info.name}`);

      // Update the scale
      scale.name = info.name;
      scale.family = info.family;

      // Generate new ID based on the name
      scale.id = info.name.toLowerCase()
        .replace(/[()]/g, '')
        .replace(/\s+/g, '-')
        .replace(/#/g, 'sharp')
        .replace(/♮/g, 'natural')
        .replace(/♭/g, 'flat')
        .replace(/b(\d)/g, 'flat$1');

      // Add alternative names if they exist
      if (info.alternativeNames.length > 0) {
        scale.alternativeNames = info.alternativeNames;
        console.log(`  → Alternative names: ${info.alternativeNames.join(', ')}`);
      }

      console.log(`  → Family: ${info.family}`);
      console.log(`  → ID: ${scale.id}\n`);

      updatedCount++;
    }
  }

  // Write updated catalog
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

  console.log(`✓ Updated ${updatedCount} scales`);
  console.log(`✓ Updated: ${catalogPath}`);
}

try {
  updateScaleNames();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
