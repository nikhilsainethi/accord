import assert from "node:assert/strict";
import test from "node:test";

import {
  isRevocationEvent,
  parseRevocationEvent,
  RevocationType,
  revocationEventSchema
} from "../src/index.js";

function createRevocationEventPayload() {
  return {
    id: "re_01",
    spec_version: "0.1" as const,
    revocation_type: RevocationType.Scope,
    target_id: "gs_01",
    revoked_by: {
      actor_type: "user" as const,
      id: "user.local",
      name: "Local User"
    },
    revoked_at: "2026-04-09T16:18:42Z",
    reason: "Scope no longer needed"
  };
}

function expectRevocationEventInvalid(
  payload: unknown,
  issuePathOrCode: string
) {
  const result = revocationEventSchema.safeParse(payload);

  assert.equal(result.success, false);
  assert.equal(isRevocationEvent(payload), false);
  assert.match(JSON.stringify(result.error.issues), new RegExp(issuePathOrCode));
}

test("parseRevocationEvent accepts a valid payload", () => {
  const payload = createRevocationEventPayload();
  const result = parseRevocationEvent(payload);

  assert.equal(result.revocation_type, RevocationType.Scope);
  assert.equal(isRevocationEvent(payload), true);
});

test("parseRevocationEvent rejects invalid revocation_type values", () => {
  expectRevocationEventInvalid(
    {
      ...createRevocationEventPayload(),
      revocation_type: "grant"
    },
    "revocation_type"
  );
});

test("parseRevocationEvent rejects invalid revoked_by actor types", () => {
  expectRevocationEventInvalid(
    {
      ...createRevocationEventPayload(),
      revoked_by: {
        actor_type: "application",
        id: "app.local.console",
        name: "Local Console"
      }
    },
    "revoked_by"
  );
});

test("parseRevocationEvent rejects impossible revoked_at timestamps", () => {
  expectRevocationEventInvalid(
    {
      ...createRevocationEventPayload(),
      revoked_at: "2026-02-30T16:18:42Z"
    },
    "revoked_at"
  );
});

test("parseRevocationEvent rejects unknown top-level fields", () => {
  expectRevocationEventInvalid(
    {
      ...createRevocationEventPayload(),
      unexpected: true
    },
    "unrecognized_keys"
  );
});
