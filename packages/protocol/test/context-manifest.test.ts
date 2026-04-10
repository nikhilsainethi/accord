import assert from "node:assert/strict";
import test from "node:test";

import {
  contextManifestSchema,
  isContextManifest,
  parseContextManifest
} from "../src/index.js";

function createContextManifestPayload() {
  return {
    id: "cm_01",
    spec_version: "0.1" as const,
    granted_scope_id: "gs_01",
    used_categories: ["project_preferences", "git_rules"],
    used_entries: [
      {
        entry_id: "pref_12",
        category: "project_preferences",
        source: "local_vault",
        summary: "Prefer small commits"
      }
    ],
    generated_at: "2026-04-09T14:34:10Z"
  };
}

function expectContextManifestInvalid(
  payload: unknown,
  issuePathOrCode: string
) {
  const result = contextManifestSchema.safeParse(payload);

  assert.equal(result.success, false);
  assert.equal(isContextManifest(payload), false);
  assert.match(JSON.stringify(result.error.issues), new RegExp(issuePathOrCode));
}

test("parseContextManifest accepts a valid payload", () => {
  const payload = createContextManifestPayload();
  const result = parseContextManifest(payload);

  assert.equal(result.used_entries[0].entry_id, "pref_12");
  assert.equal(isContextManifest(payload), true);
});

test("parseContextManifest rejects impossible UTC timestamps", () => {
  expectContextManifestInvalid(
    {
      ...createContextManifestPayload(),
      generated_at: "2026-02-30T14:34:10Z"
    },
    "generated_at"
  );
});

test("parseContextManifest rejects an empty used_entries list", () => {
  expectContextManifestInvalid(
    {
      ...createContextManifestPayload(),
      used_entries: []
    },
    "used_entries"
  );
});

test("parseContextManifest rejects whitespace-only entry summaries", () => {
  expectContextManifestInvalid(
    {
      ...createContextManifestPayload(),
      used_entries: [
        {
          entry_id: "pref_12",
          category: "project_preferences",
          source: "local_vault",
          summary: "   "
        }
      ]
    },
    "summary"
  );
});

test("parseContextManifest rejects an invalid provenance origin type", () => {
  expectContextManifestInvalid(
    {
      ...createContextManifestPayload(),
      provenance: [
        {
          entry_id: "pref_12",
          origin_type: "generated",
          origin_ref: "vault://pref_12"
        }
      ]
    },
    "origin_type"
  );
});

test("parseContextManifest rejects unknown top-level fields", () => {
  expectContextManifestInvalid(
    {
      ...createContextManifestPayload(),
      unexpected: true
    },
    "unrecognized_keys"
  );
});
