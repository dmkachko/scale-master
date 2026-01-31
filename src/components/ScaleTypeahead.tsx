/**
 * Scale Typeahead Component
 * Autocomplete search for scales by name
 */

import { useState, useRef, useEffect } from 'react';
import type { ScaleType } from '../types/catalog';
import './ScaleTypeahead.css';

interface ScaleTypeaheadProps {
  scales: ScaleType[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (scaleId: string) => void;
}

function ScaleTypeahead({ scales, value, onChange, onSelect }: ScaleTypeaheadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter scales based on search query
  const filteredScales = value
    ? scales.filter((scale) => {
        const query = value.toLowerCase();
        const matchesName = scale.name.toLowerCase().includes(query);
        const matchesAlternative = scale.alternativeNames?.some((alt) =>
          alt.toLowerCase().includes(query)
        );
        return matchesName || matchesAlternative;
      })
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
    setFocusedIndex(-1);
  };

  const handleSelectScale = (scale: ScaleType) => {
    onSelect(scale.id);
    setIsOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && filteredScales.length > 0 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, filteredScales.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && filteredScales[focusedIndex]) {
          handleSelectScale(filteredScales[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className="scale-typeahead" ref={containerRef}>
      <div className="typeahead-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="typeahead-input"
          placeholder="Search scales..."
          value={value}
          onChange={handleInputChange}
          onFocus={() => value && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search scales"
          aria-autocomplete="list"
          aria-controls="scale-typeahead-list"
          aria-expanded={isOpen}
        />
        {value && (
          <button
            type="button"
            className="typeahead-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && filteredScales.length > 0 && (
        <ul
          id="scale-typeahead-list"
          className="typeahead-dropdown"
          role="listbox"
        >
          {filteredScales.map((scale, index) => (
            <li
              key={scale.id}
              className={`typeahead-item${index === focusedIndex ? ' focused' : ''}`}
              onClick={() => handleSelectScale(scale)}
              onMouseEnter={() => setFocusedIndex(index)}
              role="option"
              aria-selected={index === focusedIndex}
            >
              <div className="typeahead-item-name">{scale.name}</div>
              {scale.alternativeNames && scale.alternativeNames.length > 0 && (
                <div className="typeahead-item-alt">
                  {scale.alternativeNames.slice(0, 2).join(', ')}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {isOpen && value && filteredScales.length === 0 && (
        <div className="typeahead-dropdown typeahead-empty">
          No scales found
        </div>
      )}
    </div>
  );
}

export default ScaleTypeahead;
