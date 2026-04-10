import { z } from "zod";

import type { DeciderActor } from "../shared/primitives.js";
import {
  deciderActorSchema,
  idSchema,
  isoUtcTimestampSchema,
  metadataSchema,
  nonEmptyStringSchema,
  specVersionSchema
} from "../shared/primitives.js";
import {
  revocationTypeSchema,
  type RevocationType
} from "../shared/enums.js";

export interface RevocationEvent {
  id: string;
  spec_version: "0.1";
  revocation_type: RevocationType;
  target_id: string;
  revoked_by: DeciderActor;
  revoked_at: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export const revocationEventSchema: z.ZodType<RevocationEvent> = z
  .object({
    id: idSchema,
    spec_version: specVersionSchema,
    revocation_type: revocationTypeSchema,
    target_id: idSchema,
    revoked_by: deciderActorSchema,
    revoked_at: isoUtcTimestampSchema,
    reason: nonEmptyStringSchema.optional(),
    metadata: metadataSchema.optional()
  })
  .strict();

export function parseRevocationEvent(input: unknown): RevocationEvent {
  return revocationEventSchema.parse(input);
}

export function isRevocationEvent(input: unknown): input is RevocationEvent {
  return revocationEventSchema.safeParse(input).success;
}
