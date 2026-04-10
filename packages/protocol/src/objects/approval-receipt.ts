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
  decisionOutcomeSchema,
  type DecisionOutcome
} from "../shared/enums.js";

export interface ApprovalReceiptConditions {
  single_use?: boolean;
  target_lock?: string;
  notes?: string;
}

export interface ApprovalReceipt {
  id: string;
  spec_version: "0.1";
  action_proposal_id: string;
  decision: DecisionOutcome;
  decider: DeciderActor;
  decided_at: string;
  reason?: string;
  valid_until?: string;
  conditions?: ApprovalReceiptConditions;
  metadata?: Record<string, unknown>;
}

const approvalReceiptConditionsSchema: z.ZodType<ApprovalReceiptConditions> = z
  .object({
    single_use: z.boolean().optional(),
    target_lock: nonEmptyStringSchema.optional(),
    notes: nonEmptyStringSchema.optional()
  })
  .strict();

export const approvalReceiptSchema: z.ZodType<ApprovalReceipt> = z
  .object({
    id: idSchema,
    spec_version: specVersionSchema,
    action_proposal_id: idSchema,
    decision: decisionOutcomeSchema,
    decider: deciderActorSchema,
    decided_at: isoUtcTimestampSchema,
    reason: nonEmptyStringSchema.optional(),
    valid_until: isoUtcTimestampSchema.optional(),
    conditions: approvalReceiptConditionsSchema.optional(),
    metadata: metadataSchema.optional()
  })
  .strict();

export function parseApprovalReceipt(input: unknown): ApprovalReceipt {
  return approvalReceiptSchema.parse(input);
}

export function isApprovalReceipt(input: unknown): input is ApprovalReceipt {
  return approvalReceiptSchema.safeParse(input).success;
}
