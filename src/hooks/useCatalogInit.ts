/**
 * Catalog Initialization Hook
 * Loads the catalog on mount and updates the store
 */

import { useEffect } from 'react';
import { useCatalogStore } from '../store/catalogStore';
import { loadCatalog, buildCatalogIndexes } from '../catalog/loader';

export function useCatalogInit() {
  const { status, setCatalogLoading, setCatalogReady, setCatalogError } = useCatalogStore();

  useEffect(() => {
    // Only load if not already loaded or loading
    if (status !== 'idle') return;

    const initializeCatalog = async () => {
      setCatalogLoading();

      try {
        const catalog = await loadCatalog();
        const indexes = buildCatalogIndexes(catalog);
        setCatalogReady(catalog, indexes);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error loading catalog';
        setCatalogError(errorMessage);
      }
    };

    initializeCatalog();
  }, [status, setCatalogLoading, setCatalogReady, setCatalogError]);

  return { status };
}
