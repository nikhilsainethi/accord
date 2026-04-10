import { z } from "zod";

import {
  idSchema,
  isoUtcTimestampSchema,
  type JsonObject,
  metadataSchema,
  nonEmptyStringListSchema,
  nonEmptyStringSchema,
  specVersionSchema
} from "../shared/primitives.js";

const contextManifestOriginTypeSchema = z.enum([
  "memory",
  "preference",
  "rule",
  "manual_input",
  "system"
]);

export interface ContextManifestUsedEntry {
  entry_id: string;
  category: string;
  source: string;
  summary: string;
}

export interface ContextManifestProvenanceEntry {
  entry_id: string;
  origin_type: z.infer<typeof contextManifestOriginTypeSchema>;
  origin_ref: string;
}

export interface ContextManifest {
  id: string;
  spec_version: "0.1";
  granted_scope_id: string;
  used_categories: string[];
  used_entries: ContextManifestUsedEntry[];
  generated_at: string;
  provenance?: ContextManifestProvenanceEntry[];
  notes?: string;
  metadata?: JsonObject;
}

const contextManifestUsedEntrySchema: z.ZodType<ContextManifestUsedEntry> = z
  .object({
    entry_id: idSchema,
    category: nonEmptyStringSchema,
    source: nonEmptyStringSchema,
    summary: nonEmptyStringSchema
  })
  .strict();

const contextManifestProvenanceEntrySchema: z.ZodType<ContextManifestProvenanceEntry> =
  z
    .object({
      entry_id: idSchema,
      origin_type: contextManifestOriginTypeSchema,
      origin_ref: nonEmptyStringSchema
    })
    .strict();

export const contextManifestSchema: z.ZodType<ContextManifest> = z
  .object({
    id: idSchema,
    spec_version: specVersionSchema,
    granted_scope_id: idSchema,
    used_categories: nonEmptyStringListSchema,
    used_entries: z.array(contextManifestUsedEntrySchema).min(1),
    generated_at: isoUtcTimestampSchema,
    provenance: z.array(contextManifestProvenanceEntrySchema).optional(),
    notes: nonEmptyStringSchema.optional(),
    metadata: metadataSchema.optional()
  })
  .strict();

export function parseContextManifest(input: unknown): ContextManifest {
  return contextManifestSchema.parse(input);
}

export function isContextManifest(input: unknown): input is ContextManifest {
  return contextManifestSchema.safeParse(input).success;
}
