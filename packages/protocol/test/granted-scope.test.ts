import assert from "node:assert/strict";
import test from "node:test";

import {
  EnforcementMode,
  GrantedScopeStatus,
  grantedScopeSchema,
  isGrantedScope,
  parseGrantedScope
} from "../src/index.js";

function createGrantedScopePayload() {
  return {
    id: "gs_01",
    spec_version: "0.1" as const,
    scope_request_id: "sr_01",
    grantee: {
      actor_type: "agent" as const,
      id: "agent.local.coder",
      name: "Local Coding Agent"
    },
    granted_categories: ["project_preferences"],
    purpose: "prepare file edit",
    enforcement_mode: EnforcementMode.RequireApproval,
    issued_at: "2026-04-09T14:33:05Z",
    expires_at: "2026-04-09T15:33:05Z",
    status: GrantedScopeStatus.Active
  };
}

function expectGrantedScopeInvalid(
  payload: unknown,
  issuePathOrCode: string
) {
  const result = grantedScopeSchema.safeParse(payload);

  assert.equal(result.success, false);
  assert.equal(isGrantedScope(payload), false);
  assert.match(JSON.stringify(result.error.issues), new RegExp(issuePathOrCode));
}

test("parseGrantedScope accepts a valid payload", () => {
  const payload = createGrantedScopePayload();
  const result = parseGrantedScope(payload);

  assert.equal(result.status, GrantedScopeStatus.Active);
  assert.equal(isGrantedScope(payload), true);
});

test("parseGrantedScope rejects an invalid status", () => {
  expectGrantedScopeInvalid(
    {
      ...createGrantedScopePayload(),
      status: "pending"
    },
    "status"
  );
});

test("parseGrantedScope rejects deny enforcement mode", () => {
  expectGrantedScopeInvalid(
    {
      ...createGrantedScopePayload(),
      enforcement_mode: "deny"
    },
    "enforcement_mode"
  );
});

test("parseGrantedScope rejects expires_at values that do not follow issued_at", () => {
  expectGrantedScopeInvalid(
    {
      ...createGrantedScopePayload(),
      expires_at: "2026-04-09T14:33:05Z"
    },
    "expires_at"
  );
});

test("parseGrantedScope rejects impossible UTC timestamps", () => {
  expectGrantedScopeInvalid(
    {
      ...createGrantedScopePayload(),
      issued_at: "2026-02-30T14:33:05Z"
    },
    "issued_at"
  );
});

test("parseGrantedScope rejects whitespace-only constraint notes", () => {
  expectGrantedScopeInvalid(
    {
      ...createGrantedScopePayload(),
      constraints: {
        notes: "   "
      }
    },
    "notes"
  );
});

test("parseGrantedScope rejects invalid grantee actor types", () => {
  expectGrantedScopeInvalid(
    {
      ...createGrantedScopePayload(),
      grantee: {
        actor_type: "user",
        id: "user.local",
        name: "Local User"
      }
    },
    "grantee"
  );
});

test("parseGrantedScope rejects unknown top-level fields", () => {
  expectGrantedScopeInvalid(
    {
      ...createGrantedScopePayload(),
      unexpected: true
    },
    "unrecognized_keys"
  );
});
