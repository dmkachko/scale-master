/**
 * Chord Search Page
 * Find common chords across multiple selected scales
 */

import { useState } from 'react';
import { useCatalogStore } from '../../store/catalogStore.ts';
import { usePreferencesStore } from '../../store/preferencesStore.ts';
import { useCatalogInit } from '../../hooks/useCatalogInit.ts';
import { NOTE_NAMES_SHARP, NOTE_NAMES_FLAT } from '../../music/notes.ts';
import {
  findCommonChords,
  getCommonChordsStats,
  type SelectedScale,
  type CommonChord,
} from '../../music/commonChords.ts';
import type { ScaleType } from '../../types/catalog.ts';
import './ChordSearchPage.css';

function ChordSearchPage() {
  useCatalogInit();

  const { catalog } = useCatalogStore();
  const { accidentalPreference } = usePreferencesStore();
  const noteNames = accidentalPreference === 'sharps' ? NOTE_NAMES_SHARP : NOTE_NAMES_FLAT;

  const [selectedRoot, setSelectedRoot] = useState<number>(0);
  const [selectedScaleTypeId, setSelectedScaleTypeId] = useState<string>('');
  const [scales, setScales] = useState<SelectedScale[]>([]);
  const [commonChords, setCommonChords] = useState<CommonChord[]>([]);

  const handleAddScale = () => {
    if (!catalog || !selectedScaleTypeId) return;

    const scaleType = catalog.scaleTypes.find(s => s.id === selectedScaleTypeId);
    if (!scaleType) return;

    // Create unique ID for this scale selection
    const id = `${selectedRoot}-${selectedScaleTypeId}-${Date.now()}`;

    const newScale: SelectedScale = {
      id,
      root: selectedRoot,
      rootName: noteNames[selectedRoot],
      scaleType,
    };

    const newScales = [...scales, newScale];
    setScales(newScales);

    // Recalculate common chords
    const chords = findCommonChords(newScales, accidentalPreference === 'sharps');
    setCommonChords(chords);
  };

  const handleRemoveScale = (id: string) => {
    const newScales = scales.filter(s => s.id !== id);
    setScales(newScales);

    // Recalculate common chords
    const chords = findCommonChords(newScales, accidentalPreference === 'sharps');
    setCommonChords(chords);
  };

  const handleClearAll = () => {
    setScales([]);
    setCommonChords([]);
  };

  const stats = getCommonChordsStats(commonChords, scales.length);

  return (
    <div className="chord-search-page">
      <div className="chord-search-header">
        <h1>Chord Search</h1>
        <p className="page-description">
          Build a list of scales and find chords that are common to them
        </p>
      </div>

      {/* Scale Selection */}
      <div className="scale-selection-section">
        <h2>Add Scales</h2>
        <div className="scale-selection-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="root-select">Root Note</label>
              <select
                id="root-select"
                value={selectedRoot}
                onChange={(e) => setSelectedRoot(Number(e.target.value))}
                className="scale-select"
              >
                {noteNames.map((note, index) => (
                  <option key={index} value={index}>
                    {note}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="scale-select">Scale Type</label>
              <select
                id="scale-select"
                value={selectedScaleTypeId}
                onChange={(e) => setSelectedScaleTypeId(e.target.value)}
                className="scale-select"
              >
                <option value="">Select a scale...</option>
                {catalog?.scaleTypes.map((scale) => (
                  <option key={scale.id} value={scale.id}>
                    {scale.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleAddScale}
              disabled={!selectedScaleTypeId}
              className="add-button"
            >
              Add Scale
            </button>
          </div>
        </div>

        {/* Selected Scales List */}
        {scales.length > 0 && (
          <div className="selected-scales-section">
            <div className="selected-scales-header">
              <h3>Selected Scales ({scales.length})</h3>
              <button
                type="button"
                onClick={handleClearAll}
                className="clear-all-button"
              >
                Clear All
              </button>
            </div>
            <div className="selected-scales-list">
              {scales.map((scale) => (
                <div key={scale.id} className="scale-item">
                  <div className="scale-item-content">
                    <span className="scale-item-name">
                      {scale.rootName} {scale.scaleType.name}
                    </span>
                    <span className="scale-item-family">{scale.scaleType.family}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveScale(scale.id)}
                    className="remove-button"
                    aria-label="Remove scale"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Common Chords Results */}
      {scales.length > 0 && (
        <div className="common-chords-section">
          <div className="common-chords-header">
            <h2>Common Chords</h2>
            {commonChords.length > 0 && (
              <div className="chords-stats">
                <span className="stat">
                  <strong>{stats.total}</strong> total
                </span>
                {scales.length > 1 && (
                  <>
                    <span className="stat stat-universal">
                      <strong>{stats.universal}</strong> universal
                    </span>
                    <span className="stat stat-shared">
                      <strong>{stats.shared}</strong> shared
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {commonChords.length === 0 ? (
            <div className="no-chords">
              <p>No common chords found across the selected scales</p>
            </div>
          ) : (
            <div className="chords-grid">
              {commonChords.map((chord, index) => (
                <div
                  key={index}
                  className={`chord-card ${
                    chord.count === scales.length
                      ? 'universal'
                      : chord.count >= 2
                      ? 'shared'
                      : 'unique'
                  }`}
                >
                  <div className="chord-card-header">
                    <h3 className="chord-symbol">{chord.symbol}</h3>
                    {scales.length > 1 && (
                      <span className="chord-count">
                        {chord.count}/{scales.length}
                      </span>
                    )}
                  </div>
                  <div className="chord-card-body">
                    <div className="chord-scales">
                      {chord.scaleNames.map((name, i) => (
                        <span key={i} className="scale-tag">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {scales.length === 0 && (
        <div className="empty-state">
          <p>Add scales above to find common chords</p>
        </div>
      )}
    </div>
  );
}

export default ChordSearchPage;
