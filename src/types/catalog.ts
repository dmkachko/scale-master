/**
 * Type definitions for the scale catalog
 */

// Export types from Zod schemas
export type { ScaleType, Catalog } from '../schemas/catalog';
import type { ScaleType, Catalog } from '../schemas/catalog';

export interface CatalogIndexes {
  catalog: Catalog;
  scaleTypeById: Map<string, ScaleType>;
  scaleTypeByIntervalKey: Map<string, ScaleType>;
}
