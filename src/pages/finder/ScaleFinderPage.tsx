/**
 * Scale Finder Page
 * Find scales that contain given notes or chords (US-07)
 */

import { useCatalogStore } from '../../store/catalogStore.ts';
import { usePreferencesStore } from '../../store/preferencesStore.ts';
import { useCatalogInit } from '../../hooks/useCatalogInit.ts';
import { useScaleSearch } from './useScaleSearch';
import { useScaleFilters } from './useScaleFilters';
import { useSearchHelpers } from './useSearchHelpers';
import SearchModeSelector from './components/SearchModeSelector';
import SearchInputSection from './components/SearchInputSection';
import FilterSection from './components/FilterSection';
import ResultsSection from './components/ResultsSection';
import './ScaleFinderPage.css';

function ScaleFinderPage() {
  useCatalogInit();

  // Store selectors
  const catalog = useCatalogStore(state => state.catalog);
  const accidentalPreference = usePreferencesStore(state => state.accidentalPreference);

  // Search logic hook
  const {
    searchMode,
    input,
    matches,
    parseErrors,
    parsedItems,
    handleModeChange,
    handleInputChange,
    handleClear,
  } = useScaleSearch({ catalog, accidentalPreference });

  // Filter logic hook
  const {
    selectedRoots,
    selectedFamilies,
    filteredMatches,
    availableFamilies,
    toggleRoot,
    toggleAllRoots,
    toggleFamily,
    toggleAllFamilies,
  } = useScaleFilters({ catalog, matches });

  // Helper functions hook
  const { getPlaceholder, getExamples, getSearchModeLabel } = useSearchHelpers(searchMode);

  const noteNames = accidentalPreference === 'sharps'
    ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  return (
    <div className="scale-finder-page">
      <div className="finder-header">
        <h1>Scale Finder</h1>
        <p className="finder-description">
          Find scales by notes or chords
        </p>
      </div>

      <SearchModeSelector
        searchMode={searchMode}
        onModeChange={handleModeChange}
      />

      <SearchInputSection
        searchMode={searchMode}
        input={input}
        onInputChange={handleInputChange}
        onClear={handleClear}
        placeholder={getPlaceholder()}
        examples={getExamples()}
        parseErrors={parseErrors}
        parsedItems={parsedItems}
        searchModeLabel={getSearchModeLabel()}
      />

      {matches.length > 0 && (
        <FilterSection
          matchCount={matches.length}
          filteredCount={filteredMatches.length}
          noteNames={noteNames}
          selectedRoots={selectedRoots}
          onToggleRoot={toggleRoot}
          onToggleAllRoots={toggleAllRoots}
          availableFamilies={availableFamilies}
          selectedFamilies={selectedFamilies}
          onToggleFamily={toggleFamily}
          onToggleAllFamilies={toggleAllFamilies}
        />
      )}

      <ResultsSection
        searchMode={searchMode}
        input={input}
        parsedItems={parsedItems}
        parseErrors={parseErrors}
        matches={matches}
        filteredMatches={filteredMatches}
      />
    </div>
  );
}

export default ScaleFinderPage;
