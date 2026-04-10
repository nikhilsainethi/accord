import { z } from "zod";

import type { GranteeActor } from "../shared/primitives.js";
import {
  idSchema,
  granteeActorSchema,
  isoUtcTimestampSchema,
  metadataSchema,
  nonEmptyStringListSchema,
  nonEmptyStringSchema,
  specVersionSchema
} from "../shared/primitives.js";
import {
  type EnforcementMode,
  enforcementModeSchema,
  type GrantedScopeStatus,
  grantedScopeStatusSchema
} from "../shared/enums.js";

export interface GrantedScopeConstraints {
  max_uses?: number;
  allowed_targets?: string[];
  notes?: string;
}

export interface GrantedScope {
  id: string;
  spec_version: "0.1";
  scope_request_id: string;
  grantee: GranteeActor;
  granted_categories: string[];
  purpose: string;
  enforcement_mode: EnforcementMode;
  issued_at: string;
  expires_at: string;
  status: GrantedScopeStatus;
  constraints?: GrantedScopeConstraints;
  metadata?: Record<string, unknown>;
}

const grantedScopeConstraintsSchema: z.ZodType<GrantedScopeConstraints> = z
  .object({
    max_uses: z.number().int().positive().optional(),
    allowed_targets: nonEmptyStringListSchema.optional(),
    notes: nonEmptyStringSchema.optional()
  })
  .strict();

export const grantedScopeSchema: z.ZodType<GrantedScope> = z
  .object({
    id: idSchema,
    spec_version: specVersionSchema,
    scope_request_id: idSchema,
    grantee: granteeActorSchema,
    granted_categories: nonEmptyStringListSchema,
    purpose: nonEmptyStringSchema,
    enforcement_mode: enforcementModeSchema.extract([
      "allow",
      "require_approval"
    ]),
    issued_at: isoUtcTimestampSchema,
    expires_at: isoUtcTimestampSchema,
    status: grantedScopeStatusSchema,
    constraints: grantedScopeConstraintsSchema.optional(),
    metadata: metadataSchema.optional()
  })
  .strict();

export function parseGrantedScope(input: unknown): GrantedScope {
  return grantedScopeSchema.parse(input);
}

export function isGrantedScope(input: unknown): input is GrantedScope {
  return grantedScopeSchema.safeParse(input).success;
}
