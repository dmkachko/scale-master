# State Management

This directory contains the global state management using **Zustand**.

## Why Zustand?

Zustand is a lightweight, modern state management library that provides:

- **Simple API** - No boilerplate, just create a store
- **TypeScript Support** - Excellent type inference
- **Performance** - Minimal re-renders through selector-based subscriptions
- **DevTools** - Redux DevTools integration for debugging
- **Small Bundle Size** - ~1kb gzipped
- **No Providers** - Direct hook access without context wrappers

## Store Structure

### CatalogStore (`catalogStore.ts`)

Manages the global catalog state and selected root note.

**State:**
- `status: 'idle' | 'loading' | 'ready' | 'error'` - Catalog loading state
- `catalog: Catalog | null` - The loaded scale catalog
- `indexes: CatalogIndexes | null` - Pre-built indexes for fast lookups
- `error: string | null` - Error message if loading failed
- `selectedRoot: number` - Currently selected root note (0-11)

**Actions:**
- `setCatalogLoading()` - Mark catalog as loading
- `setCatalogReady(catalog, indexes)` - Set catalog data when loaded
- `setCatalogError(error)` - Set error state
- `setSelectedRoot(root)` - Update selected root note

### PreferencesStore (`preferencesStore.ts`)

Manages user preferences with localStorage persistence.

**State:**
- `accidentalPreference: 'sharps' | 'flats'` - Preferred accidental notation

**Actions:**
- `setAccidentalPreference(preference)` - Set sharp or flat preference
- `toggleAccidentalPreference()` - Toggle between sharps and flats

**Persistence:**
- Automatically persists to localStorage as `scale-master-preferences`
- Survives page reloads and browser restarts

## Usage

### Accessing State

```typescript
import { useCatalogStore } from '../store/catalogStore';

function MyComponent() {
  // Subscribe to specific state slices
  const catalog = useCatalogStore((state) => state.catalog);
  const selectedRoot = useCatalogStore((state) => state.selectedRoot);

  // Access actions
  const setSelectedRoot = useCatalogStore((state) => state.setSelectedRoot);

  return (
    <select value={selectedRoot} onChange={(e) => setSelectedRoot(Number(e.target.value))}>
      {/* ... */}
    </select>
  );
}
```

### Optimizing Re-renders

Use selector functions to subscribe only to needed state:

```typescript
// ❌ Bad - Component re-renders on ANY state change
const state = useCatalogStore();

// ✅ Good - Component re-renders only when catalog changes
const catalog = useCatalogStore((state) => state.catalog);
```

### Accessing Multiple Values

```typescript
// Subscribe to multiple values efficiently
const { catalog, selectedRoot, setSelectedRoot } = useCatalogStore((state) => ({
  catalog: state.catalog,
  selectedRoot: state.selectedRoot,
  setSelectedRoot: state.setSelectedRoot,
}));
```

## DevTools

The store is configured with Redux DevTools support. To use:

1. Install [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)
2. Open browser DevTools
3. Navigate to Redux tab
4. View state changes with action names

Each action is labeled (e.g., `catalog/setReady`) for easy debugging.

## Adding New Stores

To add a new store:

1. Create a new file: `src/store/myFeatureStore.ts`
2. Define the state interface
3. Create the store with `create()`
4. Export the hook

Example:

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MyFeatureState {
  value: string;
  setValue: (value: string) => void;
}

export const useMyFeatureStore = create<MyFeatureState>()(
  devtools(
    (set) => ({
      value: '',
      setValue: (value) => set({ value }, false, 'feature/setValue'),
    }),
    { name: 'MyFeatureStore' }
  )
);
```

## Best Practices

1. **Keep stores focused** - One store per feature/domain
2. **Use selectors** - Subscribe only to needed state
3. **Name actions clearly** - Use descriptive action names for DevTools
4. **Avoid derived state** - Compute derived values in components
5. **Keep actions simple** - Complex logic should be in separate modules

## Future Stores

As we implement more features, we'll add:

- `useScaleFinderStore` - For scale search functionality
- `useScaleDetailsStore` - For selected scale details
- `useTriadPairStore` - For triad pair matching

## Migration Notes

The catalog state was previously managed in the App component using `useState` and `useEffect`. It's now centralized in Zustand for:

- **Global access** - Any component can access catalog data
- **Persistence** - State survives route changes
- **Testability** - Easier to test state changes
- **Scalability** - Foundation for more complex state needs
