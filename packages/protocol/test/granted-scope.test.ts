import assert from "node:assert/strict";
import test from "node:test";

import {
  EnforcementMode,
  GrantedScopeStatus,
  parseGrantedScope
} from "../src/index.js";

test("parseGrantedScope accepts a valid payload", () => {
  const result = parseGrantedScope({
    id: "gs_01",
    spec_version: "0.1",
    scope_request_id: "sr_01",
    grantee: {
      actor_type: "agent",
      id: "agent.local.coder",
      name: "Local Coding Agent"
    },
    granted_categories: ["project_preferences"],
    purpose: "prepare file edit",
    enforcement_mode: EnforcementMode.RequireApproval,
    issued_at: "2026-04-09T14:33:05Z",
    expires_at: "2026-04-09T15:33:05Z",
    status: GrantedScopeStatus.Active
  });

  assert.equal(result.status, GrantedScopeStatus.Active);
});

test("parseGrantedScope rejects an invalid status", () => {
  assert.throws(
    () =>
      parseGrantedScope({
        id: "gs_01",
        spec_version: "0.1",
        scope_request_id: "sr_01",
        grantee: {
          actor_type: "agent",
          id: "agent.local.coder",
          name: "Local Coding Agent"
        },
        granted_categories: ["project_preferences"],
        purpose: "prepare file edit",
        enforcement_mode: EnforcementMode.RequireApproval,
        issued_at: "2026-04-09T14:33:05Z",
        expires_at: "2026-04-09T15:33:05Z",
        status: "pending"
      }),
    /status/i
  );
});

test("parseGrantedScope rejects a non-positive max_uses constraint", () => {
  assert.throws(
    () =>
      parseGrantedScope({
        id: "gs_01",
        spec_version: "0.1",
        scope_request_id: "sr_01",
        grantee: {
          actor_type: "agent",
          id: "agent.local.coder",
          name: "Local Coding Agent"
        },
        granted_categories: ["project_preferences"],
        purpose: "prepare file edit",
        enforcement_mode: EnforcementMode.RequireApproval,
        issued_at: "2026-04-09T14:33:05Z",
        expires_at: "2026-04-09T15:33:05Z",
        status: GrantedScopeStatus.Active,
        constraints: {
          max_uses: 0
        }
      }),
    /max_uses/i
  );
});

test("parseGrantedScope rejects an invalid grantee actor type", () => {
  assert.throws(
    () =>
      parseGrantedScope({
        id: "gs_01",
        spec_version: "0.1",
        scope_request_id: "sr_01",
        grantee: {
          actor_type: "user",
          id: "user.local",
          name: "Local User"
        },
        granted_categories: ["project_preferences"],
        purpose: "prepare file edit",
        enforcement_mode: EnforcementMode.RequireApproval,
        issued_at: "2026-04-09T14:33:05Z",
        expires_at: "2026-04-09T15:33:05Z",
        status: GrantedScopeStatus.Active
      }),
    /grantee/i
  );
});
