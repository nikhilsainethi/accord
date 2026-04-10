import assert from "node:assert/strict";
import test from "node:test";

import {
  isScopeRequest,
  parseScopeRequest,
  RiskLevel,
  scopeRequestSchema
} from "../src/index.js";

function createScopeRequestPayload() {
  return {
    id: "sr_01",
    spec_version: "0.1" as const,
    requester: {
      actor_type: "agent" as const,
      id: "agent.local.coder",
      name: "Local Coding Agent"
    },
    context_categories: ["project_preferences"],
    purpose: "prepare file edit",
    requested_ttl_seconds: 1800,
    created_at: "2026-04-09T14:32:05Z",
    sensitivity_hint: RiskLevel.Medium
  };
}

function expectScopeRequestInvalid(
  payload: unknown,
  issuePath: string
) {
  const result = scopeRequestSchema.safeParse(payload);

  assert.equal(result.success, false);
  assert.equal(isScopeRequest(payload), false);
  assert.match(JSON.stringify(result.error.issues), new RegExp(issuePath));
}

test("parseScopeRequest accepts a valid payload", () => {
  const payload = createScopeRequestPayload();
  const result = parseScopeRequest(payload);

  assert.equal(result.spec_version, "0.1");
  assert.equal(isScopeRequest(payload), true);
});

test("parseScopeRequest rejects an invalid spec version", () => {
  expectScopeRequestInvalid(
    {
      ...createScopeRequestPayload(),
      spec_version: "0.2"
    },
    "spec_version"
  );
});

test("parseScopeRequest rejects impossible UTC timestamps", () => {
  expectScopeRequestInvalid(
    {
      ...createScopeRequestPayload(),
      created_at: "2026-02-30T14:32:05Z"
    },
    "created_at"
  );
});

test("parseScopeRequest rejects whitespace-only strings without coercion", () => {
  expectScopeRequestInvalid(
    {
      ...createScopeRequestPayload(),
      purpose: "   "
    },
    "purpose"
  );
});

test("parseScopeRequest rejects invalid requester actor type", () => {
  expectScopeRequestInvalid(
    {
      ...createScopeRequestPayload(),
      requester: {
        actor_type: "system",
        id: "system.local",
        name: "System"
      }
    },
    "requester"
  );
});

test("parseScopeRequest rejects unknown top-level fields", () => {
  expectScopeRequestInvalid(
    {
      ...createScopeRequestPayload(),
      unexpected: true
    },
    "unrecognized_keys"
  );
});

test("parseScopeRequest rejects non-JSON metadata values", () => {
  expectScopeRequestInvalid(
    {
      ...createScopeRequestPayload(),
      metadata: {
        captured_at: new Date("2026-04-09T14:32:05Z")
      }
    },
    "metadata"
  );
});

test("parseScopeRequest rejects non-finite metadata numbers", () => {
  expectScopeRequestInvalid(
    {
      ...createScopeRequestPayload(),
      metadata: {
        score: Number.POSITIVE_INFINITY
      }
    },
    "metadata"
  );
});
