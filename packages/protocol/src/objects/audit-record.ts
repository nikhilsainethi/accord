import { z } from "zod";

import type { AuditActor } from "../shared/primitives.js";
import {
  auditActorSchema,
  idSchema,
  isoUtcTimestampSchema,
  type JsonObject,
  metadataSchema,
  nonEmptyStringSchema,
  specVersionSchema
} from "../shared/primitives.js";
import {
  auditObjectTypeSchema,
  type AuditObjectType
} from "../shared/enums.js";

export interface AuditRecord {
  id: string;
  spec_version: "0.1";
  event_type: string;
  object_type: AuditObjectType;
  object_id: string;
  recorded_at: string;
  actor?: AuditActor;
  summary?: string;
  metadata?: JsonObject;
}

export const auditRecordSchema: z.ZodType<AuditRecord> = z
  .object({
    id: idSchema,
    spec_version: specVersionSchema,
    event_type: nonEmptyStringSchema,
    object_type: auditObjectTypeSchema,
    object_id: idSchema,
    recorded_at: isoUtcTimestampSchema,
    actor: auditActorSchema.optional(),
    summary: nonEmptyStringSchema.optional(),
    metadata: metadataSchema.optional()
  })
  .strict();

export function parseAuditRecord(input: unknown): AuditRecord {
  return auditRecordSchema.parse(input);
}

export function isAuditRecord(input: unknown): input is AuditRecord {
  return auditRecordSchema.safeParse(input).success;
}
