#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateCombinations(target) {
  const results = [];

  function backtrack(current, sum, lastWasOne) {
    if (sum === target) {
      results.push([...current]);
      return;
    }

    if (sum > target) {
      return;
    }

    // Try adding a 2
    current.push(2);
    backtrack(current, sum + 2, false);
    current.pop();

    // Try adding a 1 only if the last element wasn't a 1
    if (!lastWasOne) {
      current.push(1);
      backtrack(current, sum + 1, true);
      current.pop();
    }
  }

  backtrack([], 0, false);
  return results;
}

// Generate all valid combinations
const combinations = generateCombinations(12);

// Prepare output data
const output = {
  metadata: {
    target_sum: 12,
    rules: [
      "No two or more 1's in a row",
      "Total sum equals exactly 12"
    ],
    total_combinations: combinations.length,
    generated_at: new Date().toISOString()
  },
  combinations: combinations
};

// Write to JSON file
const outputPath = path.join(__dirname, 'combinations_result.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`Generated ${combinations.length} valid combinations`);
console.log(`Results written to: ${outputPath}`);
console.log(`\nFirst 5 combinations:`);
combinations.slice(0, 5).forEach((combo, idx) => {
  console.log(`${idx + 1}. [${combo.join(', ')}] = ${combo.reduce((a, b) => a + b, 0)}`);
});
