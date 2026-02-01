/**
 * Catalog Loader Module
 * Loads and validates the scale catalog from the JSON file
 */

import { CatalogSchema } from '../schemas/catalog';
import type { ScaleType, Catalog, CatalogIndexes } from '../types/catalog';
import { ZodError } from 'zod';

/**
 * Loads the scale catalog from the JSON file
 */
export async function loadCatalog(): Promise<Catalog> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}catalog/scales.json`);

    if (!response.ok) {
      throw new Error(`Failed to load catalog: ${response.status} ${response.statusText}`);
    }

    const data: unknown = await response.json();

    // Validate using Zod schema
    const validatedCatalog = CatalogSchema.parse(data);

    return validatedCatalog;
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Catalog validation error:', error.issues);
      const errorMessages = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      throw new Error(`Catalog validation failed: ${errorMessages}`);
    }
    console.error('Catalog loading error:', error);
    throw error;
  }
}

/**
 * Builds indexes for efficient catalog lookup
 */
export function buildCatalogIndexes(catalog: Catalog): CatalogIndexes {
  const scaleTypeById = new Map<string, ScaleType>();
  const scaleTypeByIntervalKey = new Map<string, ScaleType>();

  for (const scaleType of catalog.scaleTypes) {
    // Index by ID
    scaleTypeById.set(scaleType.id, scaleType);

    // Index by interval key (for mode resolution)
    const intervalKey = scaleType.intervals.slice().sort((a, b) => a - b).join(',');
    scaleTypeByIntervalKey.set(intervalKey, scaleType);
  }

  return {
    catalog,
    scaleTypeById,
    scaleTypeByIntervalKey,
  };
}
