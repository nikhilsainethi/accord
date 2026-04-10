import assert from "node:assert/strict";
import test from "node:test";

import { parseScopeRequest, RiskLevel } from "../src/index.js";

test("parseScopeRequest accepts a valid payload", () => {
  const result = parseScopeRequest({
    id: "sr_01",
    spec_version: "0.1",
    requester: {
      actor_type: "agent",
      id: "agent.local.coder",
      name: "Local Coding Agent"
    },
    context_categories: ["project_preferences"],
    purpose: "prepare file edit",
    requested_ttl_seconds: 1800,
    created_at: "2026-04-09T14:32:05Z",
    sensitivity_hint: RiskLevel.Medium
  });

  assert.equal(result.spec_version, "0.1");
});

test("parseScopeRequest rejects an invalid requester actor type", () => {
  assert.throws(
    () =>
      parseScopeRequest({
        id: "sr_01",
        spec_version: "0.1",
        requester: {
          actor_type: "system",
          id: "system.local",
          name: "System"
        },
        context_categories: ["project_preferences"],
        purpose: "prepare file edit",
        requested_ttl_seconds: 1800,
        created_at: "2026-04-09T14:32:05Z",
        sensitivity_hint: RiskLevel.Medium
      }),
    /requester/i
  );
});
