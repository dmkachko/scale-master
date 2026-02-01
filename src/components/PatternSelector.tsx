/**
 * Pattern Selector Component
 * Radio button selector for scale playback patterns
 */

import { patterns, type ScalePattern } from '../services/scalePatterns.ts';
import './PatternSelector.css';

interface PatternSelectorProps {
  value: ScalePattern;
  onChange: (pattern: ScalePattern) => void;
}

function PatternSelector({ value, onChange }: PatternSelectorProps) {
  return (
    <div className="pattern-selector">
      <div className="selector-label">Pattern:</div>
      {Object.values(patterns).map((pattern) => (
        <label key={pattern.id} className="pattern-option">
          <input
            type="radio"
            name="pattern"
            value={pattern.id}
            checked={value === pattern.id}
            onChange={() => onChange(pattern.id as ScalePattern)}
          />
          <span className="pattern-name">{pattern.name}</span>
        </label>
      ))}
    </div>
  );
}

export default PatternSelector;
