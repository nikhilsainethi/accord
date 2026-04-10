# Accord Protocol v0.1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement `packages/protocol` with explicit TypeScript types, shared enums, strict validation schemas, and package-local tests for all seven Accord v0.1 runtime objects.

**Architecture:** Keep the package organized by protocol object, with a thin shared layer for common enums and primitive schemas. Use `zod` for runtime validation, explicit exported types for inspectability, and the built-in Node test runner for clear fail-closed validation tests without adding a broader testing framework.

**Tech Stack:** TypeScript, Zod, Node `node:test`, Node `assert/strict`, pnpm workspace

---

### Task 1: Add Protocol Package Tooling

**Files:**
- Modify: `packages/protocol/package.json`
- Create: `packages/protocol/tsconfig.test.json`

**Step 1: Add the package-local dependencies and scripts**

Update `packages/protocol/package.json` so it contains:

```json
{
  "dependencies": {
    "zod": "^3.25.0"
  },
  "devDependencies": {
    "@types/node": "^24.0.0"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test:build": "tsc -p tsconfig.test.json",
    "test": "pnpm run test:build && node --test dist-test/test/*.test.js"
  }
}
```

**Step 2: Add a dedicated test TypeScript config**

Create `packages/protocol/tsconfig.test.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "dist-test",
    "types": ["node"],
    "declaration": false,
    "declarationMap": false,
    "sourceMap": false
  },
  "include": ["src/**/*.ts", "test/**/*.ts"]
}
```

**Step 3: Install dependencies**

Run: `pnpm install`

Expected: `zod` and `@types/node` are added without changing unrelated packages.

### Task 2: Create Shared Enums And Primitive Schemas

**Files:**
- Create: `packages/protocol/src/shared/enums.ts`
- Create: `packages/protocol/src/shared/primitives.ts`
- Modify: `packages/protocol/src/index.ts`
- Test: `packages/protocol/test/scope-request.test.ts`

**Step 1: Write the first failing test**

Create `packages/protocol/test/scope-request.test.ts` with a test that imports `parseScopeRequest` and `RiskLevel`, feeds a valid payload, and expects a typed result. Also add an invalid payload test that expects a failure on `requester.actor_type`.

Representative test shape:

```ts
import test from "node:test";
import assert from "node:assert/strict";
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
```

**Step 2: Run the test to verify it fails**

Run:
- `pnpm --filter @accord/protocol exec tsc -p tsconfig.test.json`
- `pnpm --filter @accord/protocol exec node --test dist-test/test/scope-request.test.js`

Expected: fail because `parseScopeRequest` and `RiskLevel` do not exist yet.

**Step 3: Implement shared enums**

Create `packages/protocol/src/shared/enums.ts` with exported string-valued constants and matching schemas/types for:
- actor types
- requester actor types
- decider actor types
- risk levels
- decision outcomes
- enforcement modes
- granted scope status
- action proposal status
- revocation type
- audit object type

**Step 4: Implement shared primitives**

Create `packages/protocol/src/shared/primitives.ts` with strict reusable schemas:
- `specVersionSchema`
- `nonEmptyStringSchema`
- `idSchema`
- `isoUtcTimestampSchema`
- `metadataSchema`
- `nonEmptyStringListSchema`
- actor object schemas for requester, decider, audit actor, and grantee

**Step 5: Export the shared public pieces**

Update `packages/protocol/src/index.ts` to export the shared enums only.

**Step 6: Re-run the same test**

Run:
- `pnpm --filter @accord/protocol exec tsc -p tsconfig.test.json`
- `pnpm --filter @accord/protocol exec node --test dist-test/test/scope-request.test.js`

Expected: still fail, now specifically because `parseScopeRequest` is still missing. This confirms the test is now targeting the object implementation rather than missing setup.

### Task 3: Implement ScopeRequest And GrantedScope

**Files:**
- Create: `packages/protocol/src/objects/scope-request.ts`
- Create: `packages/protocol/src/objects/granted-scope.ts`
- Modify: `packages/protocol/src/index.ts`
- Test: `packages/protocol/test/scope-request.test.ts`
- Test: `packages/protocol/test/granted-scope.test.ts`

**Step 1: Write the failing GrantedScope tests**

Create `packages/protocol/test/granted-scope.test.ts` with:
- one valid payload test
- one invalid `status` test
- one invalid `constraints.max_uses` test
- one invalid `grantee.actor_type` test

**Step 2: Run the two tests to verify they fail**

Run:
- `pnpm --filter @accord/protocol exec tsc -p tsconfig.test.json`
- `pnpm --filter @accord/protocol exec node --test dist-test/test/scope-request.test.js dist-test/test/granted-scope.test.js`

Expected: both fail because the new object exports do not exist yet.

**Step 3: Implement `scope-request.ts`**

Create:

```ts
export interface ScopeRequest {
  id: string;
  spec_version: "0.1";
  requester: RequesterActor;
  context_categories: string[];
  purpose: string;
  requested_ttl_seconds: number;
  created_at: string;
  sensitivity_hint?: RiskLevel;
  justification?: string;
  metadata?: Record<string, unknown>;
}
```

Implement `scopeRequestSchema` as a strict object that enforces:
- non-empty IDs and purpose
- requester actor type of `application | agent`
- non-empty `context_categories`
- positive integer `requested_ttl_seconds`
- UTC ISO timestamp `created_at`
- optional shared risk enum for `sensitivity_hint`

Export:
- `ScopeRequest`
- `scopeRequestSchema`
- `parseScopeRequest`
- `isScopeRequest`

**Step 4: Implement `granted-scope.ts`**

Create:

```ts
export interface GrantedScope {
  id: string;
  spec_version: "0.1";
  scope_request_id: string;
  grantee: RequesterActor;
  granted_categories: string[];
  purpose: string;
  enforcement_mode: EnforcementMode;
  issued_at: string;
  expires_at: string;
  status: GrantedScopeStatus;
  constraints?: {
    max_uses?: number;
    allowed_targets?: string[];
    notes?: string;
  };
  metadata?: Record<string, unknown>;
}
```

Implement `grantedScopeSchema` as a strict object that enforces:
- requester-style actor for `grantee`
- non-empty granted categories
- strict `constraints` object when present
- `enforcement_mode` as `allow | require_approval`
- `status` as `active | expired | revoked`

Export:
- `GrantedScope`
- `grantedScopeSchema`
- `parseGrantedScope`
- `isGrantedScope`

**Step 5: Update root exports**

Update `packages/protocol/src/index.ts` to export the two object modules.

**Step 6: Run the tests to verify they pass**

Run:
- `pnpm --filter @accord/protocol exec tsc -p tsconfig.test.json`
- `pnpm --filter @accord/protocol exec node --test dist-test/test/scope-request.test.js dist-test/test/granted-scope.test.js`

Expected: both test files pass.

**Step 7: Commit**

```bash
git add packages/protocol/package.json packages/protocol/tsconfig.test.json packages/protocol/src/shared packages/protocol/src/objects/scope-request.ts packages/protocol/src/objects/granted-scope.ts packages/protocol/src/index.ts packages/protocol/test/scope-request.test.ts packages/protocol/test/granted-scope.test.ts
git commit -m "feat: add initial accord protocol request and scope schemas"
```

### Task 4: Implement ContextManifest

**Files:**
- Create: `packages/protocol/src/objects/context-manifest.ts`
- Modify: `packages/protocol/src/index.ts`
- Test: `packages/protocol/test/context-manifest.test.ts`

**Step 1: Write the failing tests**

Create `packages/protocol/test/context-manifest.test.ts` with:
- one valid payload test
- one invalid empty `used_entries` test
- one invalid missing `used_entries[0].summary` test
- one invalid provenance `origin_type` test

**Step 2: Run the test to verify it fails**

Run:
- `pnpm --filter @accord/protocol exec tsc -p tsconfig.test.json`
- `pnpm --filter @accord/protocol exec node --test dist-test/test/context-manifest.test.js`

Expected: fail because `parseContextManifest` does not exist yet.

**Step 3: Implement `context-manifest.ts`**

Define explicit interfaces for:
- `ContextManifest`
- `ContextManifestUsedEntry`
- `ContextManifestProvenanceEntry`

Implement a strict schema with:
- non-empty `used_categories`
- non-empty `used_entries`
- strict nested `used_entries` objects
- optional strict `provenance` objects with `origin_type` limited to `memory | preference | rule | manual_input | system`

Export:
- `ContextManifest`
- `contextManifestSchema`
- `parseContextManifest`
- `isContextManifest`

**Step 4: Update root exports and re-run the test**

Run:
- `pnpm --filter @accord/protocol exec tsc -p tsconfig.test.json`
- `pnpm --filter @accord/protocol exec node --test dist-test/test/context-manifest.test.js`

Expected: the test file passes.

**Step 5: Commit**

```bash
git add packages/protocol/src/objects/context-manifest.ts packages/protocol/src/index.ts packages/protocol/test/context-manifest.test.ts
git commit -m "feat: add context manifest schema"
```

### Task 5: Implement ActionProposal And ApprovalReceipt

**Files:**
- Create: `packages/protocol/src/objects/action-proposal.ts`
- Create: `packages/protocol/src/objects/approval-receipt.ts`
- Modify: `packages/protocol/src/index.ts`
- Test: `packages/protocol/test/action-proposal.test.ts`
- Test: `packages/protocol/test/approval-receipt.test.ts`

**Step 1: Write the failing tests**

Create `packages/protocol/test/action-proposal.test.ts` with:
- one valid payload test matching the spec example
- one invalid `risk_level` test
- one invalid `status` test using any value other than `pending`
- one invalid missing `target.ref` test

Create `packages/protocol/test/approval-receipt.test.ts` with:
- one valid payload test matching the spec example
- one invalid `decision` test
- one invalid `decider.actor_type` test
- one invalid `conditions.single_use` type test

**Step 2: Run the tests to verify they fail**

Run:
- `pnpm --filter @accord/protocol exec tsc -p tsconfig.test.json`
- `pnpm --filter @accord/protocol exec node --test dist-test/test/action-proposal.test.js dist-test/test/approval-receipt.test.js`

Expected: fail because the new object exports do not exist yet.

**Step 3: Implement `action-proposal.ts`**

Define explicit interfaces for:
- `ActionProposal`
- `ActionProposalTarget`

Implement a strict schema that enforces:
- requester actor type of `application | agent`
- non-empty `action_type`, `summary`, `target.type`, `target.ref`
- shared risk enum for `risk_level`
- literal `pending` for `status`
- optional strict `policy_hint` using the full enforcement mode enum, including `deny`

Export:
- `ActionProposal`
- `actionProposalSchema`
- `parseActionProposal`
- `isActionProposal`

**Step 4: Implement `approval-receipt.ts`**

Define explicit interfaces for:
- `ApprovalReceipt`
- `ApprovalReceiptConditions`

Implement a strict schema that enforces:
- decision outcome enum
- decider actor type of `user | system`
- strict optional `conditions`
- UTC timestamps for `decided_at` and optional `valid_until`

Export:
- `ApprovalReceipt`
- `approvalReceiptSchema`
- `parseApprovalReceipt`
- `isApprovalReceipt`

**Step 5: Update root exports and re-run the tests**

Run:
- `pnpm --filter @accord/protocol exec tsc -p tsconfig.test.json`
- `pnpm --filter @accord/protocol exec node --test dist-test/test/action-proposal.test.js dist-test/test/approval-receipt.test.js`

Expected: both test files pass.

**Step 6: Commit**

```bash
git add packages/protocol/src/objects/action-proposal.ts packages/protocol/src/objects/approval-receipt.ts packages/protocol/src/index.ts packages/protocol/test/action-proposal.test.ts packages/protocol/test/approval-receipt.test.ts
git commit -m "feat: add action proposal and approval receipt schemas"
```

### Task 6: Implement RevocationEvent And AuditRecord

**Files:**
- Create: `packages/protocol/src/objects/revocation-event.ts`
- Create: `packages/protocol/src/objects/audit-record.ts`
- Modify: `packages/protocol/src/index.ts`
- Test: `packages/protocol/test/revocation-event.test.ts`
- Test: `packages/protocol/test/audit-record.test.ts`

**Step 1: Write the failing tests**

Create `packages/protocol/test/revocation-event.test.ts` with:
- one valid payload test
- one invalid `revocation_type` test
- one invalid `revoked_by.actor_type` test

Create `packages/protocol/test/audit-record.test.ts` with:
- one valid payload test
- one invalid `object_type` test using `AuditRecord`
- one invalid `actor.actor_type` test
- one invalid missing `recorded_at` test

**Step 2: Run the tests to verify they fail**

Run:
- `pnpm --filter @accord/protocol exec tsc -p tsconfig.test.json`
- `pnpm --filter @accord/protocol exec node --test dist-test/test/revocation-event.test.js dist-test/test/audit-record.test.js`

Expected: fail because the new object exports do not exist yet.

**Step 3: Implement `revocation-event.ts`**

Define explicit interfaces for:
- `RevocationEvent`
- `RevocationActor`

Implement a strict schema that enforces:
- `revocation_type` as `scope | approval`
- revoker actor type of `user | system`
- UTC timestamp `revoked_at`

Export:
- `RevocationEvent`
- `revocationEventSchema`
- `parseRevocationEvent`
- `isRevocationEvent`

**Step 4: Implement `audit-record.ts`**

Define explicit interfaces for:
- `AuditRecord`
- `AuditRecordActor`

Implement a strict schema that enforces:
- non-empty `event_type`
- `object_type` limited to the six values listed in the spec
- optional `actor` with the full actor role set

Export:
- `AuditRecord`
- `auditRecordSchema`
- `parseAuditRecord`
- `isAuditRecord`

**Step 5: Update root exports and re-run the tests**

Run:
- `pnpm --filter @accord/protocol exec tsc -p tsconfig.test.json`
- `pnpm --filter @accord/protocol exec node --test dist-test/test/revocation-event.test.js dist-test/test/audit-record.test.js`

Expected: both test files pass.

**Step 6: Commit**

```bash
git add packages/protocol/src/objects/revocation-event.ts packages/protocol/src/objects/audit-record.ts packages/protocol/src/index.ts packages/protocol/test/revocation-event.test.ts packages/protocol/test/audit-record.test.ts
git commit -m "feat: add revocation and audit schemas"
```

### Task 7: Verify Full Package Exports And Workspace Health

**Files:**
- Modify: `packages/protocol/src/index.ts`
- Test: `packages/protocol/test/*.test.ts`

**Step 1: Review root exports**

Ensure `packages/protocol/src/index.ts` exports:
- all shared enums
- all seven object types
- all seven schemas
- all seven `parseX` helpers
- all seven `isX` guards

Do not export internal schema fragments from `shared/primitives.ts`.

**Step 2: Run full package verification**

Run:
- `pnpm --filter @accord/protocol run typecheck`
- `pnpm --filter @accord/protocol run build`
- `pnpm --filter @accord/protocol run test`

Expected:
- typecheck passes
- build passes
- all seven object test files pass

**Step 3: Run workspace verification**

Run:
- `pnpm typecheck`
- `pnpm build`

Expected:
- the protocol package integrates cleanly with the workspace
- no unrelated package regressions appear

**Step 4: Commit**

```bash
git add packages/protocol
git commit -m "feat: implement accord protocol v0.1 schemas"
```
