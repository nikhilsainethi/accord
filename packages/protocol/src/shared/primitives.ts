import { z } from "zod";

import {
  actorTypeSchema,
  deciderActorTypeSchema,
  requesterActorTypeSchema
} from "./enums.js";

export const specVersionSchema = z.literal("0.1");

export const nonEmptyStringSchema = z.string().min(1);

export const idSchema = nonEmptyStringSchema;

export const isoUtcTimestampSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
    "Expected ISO-8601 UTC timestamp"
  );

export const metadataSchema = z.record(z.string(), z.unknown());

export const nonEmptyStringListSchema = z.array(nonEmptyStringSchema).min(1);

export const requesterActorSchema = z
  .object({
    actor_type: requesterActorTypeSchema,
    id: idSchema,
    name: nonEmptyStringSchema
  })
  .strict();

export const granteeActorSchema = requesterActorSchema;

export type RequesterActor = z.infer<typeof requesterActorSchema>;
export type GranteeActor = z.infer<typeof granteeActorSchema>;

export const deciderActorSchema = z
  .object({
    actor_type: deciderActorTypeSchema,
    id: idSchema,
    name: nonEmptyStringSchema
  })
  .strict();

export type DeciderActor = z.infer<typeof deciderActorSchema>;

export const auditActorSchema = z
  .object({
    actor_type: actorTypeSchema,
    id: idSchema,
    name: nonEmptyStringSchema
  })
  .strict();

export type AuditActor = z.infer<typeof auditActorSchema>;
