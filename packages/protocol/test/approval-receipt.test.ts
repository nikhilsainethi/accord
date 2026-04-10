import assert from "node:assert/strict";
import test from "node:test";

import {
  approvalReceiptSchema,
  DecisionOutcome,
  isApprovalReceipt,
  parseApprovalReceipt
} from "../src/index.js";

function createApprovalReceiptPayload() {
  return {
    id: "ar_01",
    spec_version: "0.1" as const,
    action_proposal_id: "ap_01",
    decision: DecisionOutcome.Approved,
    decider: {
      actor_type: "user" as const,
      id: "user.local",
      name: "Local User"
    },
    decided_at: "2026-04-09T14:36:21Z",
    conditions: {
      single_use: true,
      target_lock: "repo://local/accord"
    }
  };
}

function expectApprovalReceiptInvalid(
  payload: unknown,
  issuePathOrCode: string
) {
  const result = approvalReceiptSchema.safeParse(payload);

  assert.equal(result.success, false);
  assert.equal(isApprovalReceipt(payload), false);
  assert.match(JSON.stringify(result.error.issues), new RegExp(issuePathOrCode));
}

test("parseApprovalReceipt accepts a valid payload", () => {
  const payload = createApprovalReceiptPayload();
  const result = parseApprovalReceipt(payload);

  assert.equal(result.decision, DecisionOutcome.Approved);
  assert.equal(isApprovalReceipt(payload), true);
});

test("parseApprovalReceipt rejects invalid decisions", () => {
  expectApprovalReceiptInvalid(
    {
      ...createApprovalReceiptPayload(),
      decision: "deferred"
    },
    "decision"
  );
});

test("parseApprovalReceipt rejects invalid decider actor types", () => {
  expectApprovalReceiptInvalid(
    {
      ...createApprovalReceiptPayload(),
      decider: {
        actor_type: "agent",
        id: "agent.local.coder",
        name: "Local Coding Agent"
      }
    },
    "decider"
  );
});

test("parseApprovalReceipt rejects impossible UTC timestamps", () => {
  expectApprovalReceiptInvalid(
    {
      ...createApprovalReceiptPayload(),
      valid_until: "2026-02-30T14:36:21Z"
    },
    "valid_until"
  );
});

test("parseApprovalReceipt rejects whitespace-only condition values", () => {
  expectApprovalReceiptInvalid(
    {
      ...createApprovalReceiptPayload(),
      conditions: {
        target_lock: "   "
      }
    },
    "target_lock"
  );
});

test("parseApprovalReceipt rejects unknown condition fields", () => {
  expectApprovalReceiptInvalid(
    {
      ...createApprovalReceiptPayload(),
      conditions: {
        single_use: true,
        extra: true
      }
    },
    "unrecognized_keys"
  );
});
