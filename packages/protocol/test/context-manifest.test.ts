import assert from "node:assert/strict";
import test from "node:test";

import { parseContextManifest } from "../src/index.js";

test("parseContextManifest accepts a valid payload", () => {
  const result = parseContextManifest({
    id: "cm_01",
    spec_version: "0.1",
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
  });

  assert.equal(result.used_entries[0].entry_id, "pref_12");
});

test("parseContextManifest rejects an empty used_entries list", () => {
  assert.throws(
    () =>
      parseContextManifest({
        id: "cm_01",
        spec_version: "0.1",
        granted_scope_id: "gs_01",
        used_categories: ["project_preferences"],
        used_entries: [],
        generated_at: "2026-04-09T14:34:10Z"
      }),
    /used_entries/i
  );
});

test("parseContextManifest rejects a used entry missing summary", () => {
  assert.throws(
    () =>
      parseContextManifest({
        id: "cm_01",
        spec_version: "0.1",
        granted_scope_id: "gs_01",
        used_categories: ["project_preferences"],
        used_entries: [
          {
            entry_id: "pref_12",
            category: "project_preferences",
            source: "local_vault"
          }
        ],
        generated_at: "2026-04-09T14:34:10Z"
      }),
    /summary/i
  );
});

test("parseContextManifest rejects an invalid provenance origin type", () => {
  assert.throws(
    () =>
      parseContextManifest({
        id: "cm_01",
        spec_version: "0.1",
        granted_scope_id: "gs_01",
        used_categories: ["project_preferences"],
        used_entries: [
          {
            entry_id: "pref_12",
            category: "project_preferences",
            source: "local_vault",
            summary: "Prefer small commits"
          }
        ],
        generated_at: "2026-04-09T14:34:10Z",
        provenance: [
          {
            entry_id: "pref_12",
            origin_type: "generated",
            origin_ref: "vault://pref_12"
          }
        ]
      }),
    /origin_type/i
  );
});
