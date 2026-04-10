import assert from "node:assert/strict";
import test from "node:test";

import {
  actionProposalSchema,
  ActionProposalStatus,
  isActionProposal,
  parseActionProposal,
  RiskLevel
} from "../src/index.js";

function createActionProposalPayload() {
  return {
    id: "ap_01",
    spec_version: "0.1" as const,
    requester: {
      actor_type: "agent" as const,
      id: "agent.local.coder",
      name: "Local Coding Agent"
    },
    action_type: "git.commit",
    target: {
      type: "repository",
      ref: "repo://local/accord"
    },
    summary: "Create a commit with the staged changes",
    risk_level: RiskLevel.Medium,
    context_manifest_id: "cm_01",
    created_at: "2026-04-09T14:35:00Z",
    status: ActionProposalStatus.Pending
  };
}

function expectActionProposalInvalid(
  payload: unknown,
  issuePathOrCode: string
) {
  const result = actionProposalSchema.safeParse(payload);

  assert.equal(result.success, false);
  assert.equal(isActionProposal(payload), false);
  assert.match(JSON.stringify(result.error.issues), new RegExp(issuePathOrCode));
}

test("parseActionProposal accepts a valid payload", () => {
  const payload = createActionProposalPayload();
  const result = parseActionProposal(payload);

  assert.equal(result.status, ActionProposalStatus.Pending);
  assert.equal(isActionProposal(payload), true);
});

test("parseActionProposal rejects invalid risk levels", () => {
  expectActionProposalInvalid(
    {
      ...createActionProposalPayload(),
      risk_level: "urgent"
    },
    "risk_level"
  );
});

test("parseActionProposal rejects non-pending statuses", () => {
  expectActionProposalInvalid(
    {
      ...createActionProposalPayload(),
      status: "approved"
    },
    "status"
  );
});

test("parseActionProposal rejects impossible UTC timestamps", () => {
  expectActionProposalInvalid(
    {
      ...createActionProposalPayload(),
      expires_at: "2026-02-30T14:35:00Z"
    },
    "expires_at"
  );
});

test("parseActionProposal rejects whitespace-only summaries", () => {
  expectActionProposalInvalid(
    {
      ...createActionProposalPayload(),
      summary: "   "
    },
    "summary"
  );
});

test("parseActionProposal rejects malformed targets", () => {
  expectActionProposalInvalid(
    {
      ...createActionProposalPayload(),
      target: {
        type: "repository",
        ref: "repo://local/accord",
        extra: true
      }
    },
    "unrecognized_keys"
  );
});

test("parseActionProposal rejects unknown top-level fields", () => {
  expectActionProposalInvalid(
    {
      ...createActionProposalPayload(),
      unexpected: true
    },
    "unrecognized_keys"
  );
});
