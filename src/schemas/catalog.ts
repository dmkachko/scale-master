/**
 * Zod schemas for catalog validation
 */

import { z } from 'zod';

/**
 * Schema for modal relationship
 */
export const ModeOfSchema = z.object({
  id: z.string(),
  step: z.number().int().min(1),
});

/**
 * Schema for a scale type
 * Validates id, name, family, intervals, and modal relationships
 */
export const ScaleTypeSchema = z.object({
  id: z.string().min(1, 'Scale type id is required'),
  name: z.string().min(1, 'Scale type name is required'),
  family: z.string().min(1, 'Scale type family is required'),
  intervals: z
    .array(z.number().int().min(0).max(11))
    .min(1, 'Scale type must have at least one interval')
    .refine((intervals) => intervals.includes(0), {
      message: 'Intervals must include 0 (root)',
    }),
  steps: z.array(z.number().int().min(1).max(11)).optional(),
  alternativeNames: z.array(z.string()).optional(),
  modeOf: ModeOfSchema.nullable().optional(),
  inversions: z.record(z.string(), z.string()).optional(),
});

/**
 * Schema for the entire catalog
 */
export const CatalogSchema = z.object({
  scaleTypes: z
    .array(ScaleTypeSchema)
    .min(1, 'Catalog must contain at least one scale type'),
});

/**
 * Infer TypeScript types from Zod schemas
 */
export type ScaleType = z.infer<typeof ScaleTypeSchema>;
export type Catalog = z.infer<typeof CatalogSchema>;
