import { z } from "zod";

import type { RequesterActor } from "../shared/primitives.js";
import {
  idSchema,
  isoUtcTimestampSchema,
  type JsonObject,
  metadataSchema,
  nonEmptyStringListSchema,
  nonEmptyStringSchema,
  requesterActorSchema,
  specVersionSchema
} from "../shared/primitives.js";
import {
  type RiskLevel,
  riskLevelSchema
} from "../shared/enums.js";

export interface ScopeRequest {
  id: string;
  spec_version: "0.1";
  requester: RequesterActor;
  context_categories: string[];
  purpose: string;
  requested_ttl_seconds: number;
  created_at: string;
  sensitivity_hint?: RiskLevel;
  justification?: string;
  metadata?: JsonObject;
}

export const scopeRequestSchema: z.ZodType<ScopeRequest> = z
  .object({
    id: idSchema,
    spec_version: specVersionSchema,
    requester: requesterActorSchema,
    context_categories: nonEmptyStringListSchema,
    purpose: nonEmptyStringSchema,
    requested_ttl_seconds: z.number().int().positive(),
    created_at: isoUtcTimestampSchema,
    sensitivity_hint: riskLevelSchema.optional(),
    justification: nonEmptyStringSchema.optional(),
    metadata: metadataSchema.optional()
  })
  .strict();

export function parseScopeRequest(input: unknown): ScopeRequest {
  return scopeRequestSchema.parse(input);
}

export function isScopeRequest(input: unknown): input is ScopeRequest {
  return scopeRequestSchema.safeParse(input).success;
}
