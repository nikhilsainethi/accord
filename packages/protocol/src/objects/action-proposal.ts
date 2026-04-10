import { z } from "zod";

import type { RequesterActor } from "../shared/primitives.js";
import {
  idSchema,
  isoUtcTimestampSchema,
  type JsonObject,
  metadataSchema,
  nonEmptyStringSchema,
  requesterActorSchema,
  specVersionSchema
} from "../shared/primitives.js";
import {
  actionProposalStatusSchema,
  type ActionProposalStatus,
  enforcementModeSchema,
  type EnforcementMode,
  type RiskLevel,
  riskLevelSchema
} from "../shared/enums.js";

export interface ActionProposalTarget {
  type: string;
  ref: string;
}

export interface ActionProposal {
  id: string;
  spec_version: "0.1";
  requester: RequesterActor;
  action_type: string;
  target: ActionProposalTarget;
  summary: string;
  risk_level: RiskLevel;
  context_manifest_id: string;
  created_at: string;
  status: ActionProposalStatus;
  execution_payload?: JsonObject;
  human_readable_diff?: string;
  reason?: string;
  policy_hint?: EnforcementMode;
  expires_at?: string;
  metadata?: JsonObject;
}

const actionProposalTargetSchema: z.ZodType<ActionProposalTarget> = z
  .object({
    type: nonEmptyStringSchema,
    ref: nonEmptyStringSchema
  })
  .strict();

export const actionProposalSchema: z.ZodType<ActionProposal> = z
  .object({
    id: idSchema,
    spec_version: specVersionSchema,
    requester: requesterActorSchema,
    action_type: nonEmptyStringSchema,
    target: actionProposalTargetSchema,
    summary: nonEmptyStringSchema,
    risk_level: riskLevelSchema,
    context_manifest_id: idSchema,
    created_at: isoUtcTimestampSchema,
    status: actionProposalStatusSchema,
    execution_payload: metadataSchema.optional(),
    human_readable_diff: nonEmptyStringSchema.optional(),
    reason: nonEmptyStringSchema.optional(),
    policy_hint: enforcementModeSchema.optional(),
    expires_at: isoUtcTimestampSchema.optional(),
    metadata: metadataSchema.optional()
  })
  .strict();

export function parseActionProposal(input: unknown): ActionProposal {
  return actionProposalSchema.parse(input);
}

export function isActionProposal(input: unknown): input is ActionProposal {
  return actionProposalSchema.safeParse(input).success;
}
