/**
 * Catalog Store
 * Global state management for the scale catalog using Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Catalog, CatalogIndexes } from '../types/catalog';

type CatalogStatus = 'idle' | 'loading' | 'ready' | 'error';

interface CatalogState {
  status: CatalogStatus;
  catalog: Catalog | null;
  indexes: CatalogIndexes | null;
  error: string | null;
  selectedRoot: number;

  // Actions
  setCatalogLoading: () => void;
  setCatalogReady: (catalog: Catalog, indexes: CatalogIndexes) => void;
  setCatalogError: (error: string) => void;
  setSelectedRoot: (root: number) => void;
}

export const useCatalogStore = create<CatalogState>()(
  devtools(
    (set) => ({
      // Initial state
      status: 'idle',
      catalog: null,
      indexes: null,
      error: null,
      selectedRoot: 0, // Default to C

      // Actions
      setCatalogLoading: () =>
        set({ status: 'loading', error: null }, false, 'catalog/setLoading'),

      setCatalogReady: (catalog, indexes) =>
        set(
          { status: 'ready', catalog, indexes, error: null },
          false,
          'catalog/setReady'
        ),

      setCatalogError: (error) =>
        set(
          { status: 'error', catalog: null, indexes: null, error },
          false,
          'catalog/setError'
        ),

      setSelectedRoot: (root) =>
        set({ selectedRoot: root }, false, 'catalog/setSelectedRoot'),
    }),
    { name: 'CatalogStore' }
  )
);
