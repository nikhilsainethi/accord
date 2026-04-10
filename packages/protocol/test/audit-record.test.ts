import assert from "node:assert/strict";
import test from "node:test";

import {
  AuditObjectType,
  auditRecordSchema,
  isAuditRecord,
  parseAuditRecord
} from "../src/index.js";

function createAuditRecordPayload() {
  return {
    id: "audit_01",
    spec_version: "0.1" as const,
    event_type: "approval_recorded",
    object_type: AuditObjectType.ApprovalReceipt,
    object_id: "ar_01",
    recorded_at: "2026-04-09T16:31:05Z",
    actor: {
      actor_type: "agent" as const,
      id: "agent.local.coder",
      name: "Local Coding Agent"
    },
    summary: "Approval receipt recorded in the local audit log"
  };
}

function expectAuditRecordInvalid(payload: unknown, issuePathOrCode: string) {
  const result = auditRecordSchema.safeParse(payload);

  assert.equal(result.success, false);
  assert.equal(isAuditRecord(payload), false);
  assert.match(JSON.stringify(result.error.issues), new RegExp(issuePathOrCode));
}

test("parseAuditRecord accepts a valid payload", () => {
  const payload = createAuditRecordPayload();
  const result = parseAuditRecord(payload);

  assert.equal(result.object_type, AuditObjectType.ApprovalReceipt);
  assert.equal(isAuditRecord(payload), true);
});

test("parseAuditRecord rejects invalid object_type values", () => {
  expectAuditRecordInvalid(
    {
      ...createAuditRecordPayload(),
      object_type: "AuditRecord"
    },
    "object_type"
  );
});

test("parseAuditRecord rejects invalid actor actor_type values", () => {
  expectAuditRecordInvalid(
    {
      ...createAuditRecordPayload(),
      actor: {
        actor_type: "operator",
        id: "ops.local",
        name: "Operations"
      }
    },
    "actor"
  );
});

test("parseAuditRecord rejects missing recorded_at", () => {
  const payload = createAuditRecordPayload();

  expectAuditRecordInvalid(
    {
      id: payload.id,
      spec_version: payload.spec_version,
      event_type: payload.event_type,
      object_type: payload.object_type,
      object_id: payload.object_id
    },
    "recorded_at"
  );
});

test("parseAuditRecord rejects unknown top-level fields", () => {
  expectAuditRecordInvalid(
    {
      ...createAuditRecordPayload(),
      unexpected: true
    },
    "unrecognized_keys"
  );
});
