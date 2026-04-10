# Accord Protocol Package Design

**Goal:** Implement `packages/protocol` as a small, inspectable TypeScript package for the Accord v0.1 runtime objects, with explicit types, shared enums, strict validation, and package-local tests.

**Scope:** This design only covers `@accord/protocol`. It does not add server logic, policy engine behavior, storage, transport, or execution logic.

## Source Of Truth

The package should mirror the current `Accord Protocol Spec V0.pdf` as closely as possible.

The spec defines seven primary runtime objects:
- `ScopeRequest`
- `GrantedScope`
- `ContextManifest`
- `ActionProposal`
- `ApprovalReceipt`
- `RevocationEvent`
- `AuditRecord`

The spec also defines shared conventions that belong in the package:
- `spec_version` is always `"0.1"`
- timestamps are ISO 8601 UTC strings
- actor roles are `user`, `application`, `agent`, `system`
- risk levels are `low`, `medium`, `high`, `critical`
- approval decisions are `approved`, `denied`, `expired`, `revoked`, `pending`
- enforcement modes are `allow`, `require_approval`, `deny`

## Package Layout

```text
packages/protocol/
├── package.json
├── tsconfig.json
├── tsconfig.test.json
├── src/
│   ├── shared/
│   │   ├── enums.ts
│   │   └── primitives.ts
│   ├── objects/
│   │   ├── scope-request.ts
│   │   ├── granted-scope.ts
│   │   ├── context-manifest.ts
│   │   ├── action-proposal.ts
│   │   ├── approval-receipt.ts
│   │   ├── revocation-event.ts
│   │   └── audit-record.ts
│   └── index.ts
└── test/
    ├── scope-request.test.ts
    ├── granted-scope.test.ts
    ├── context-manifest.test.ts
    ├── action-proposal.test.ts
    ├── approval-receipt.test.ts
    ├── revocation-event.test.ts
    └── audit-record.test.ts
```

This layout is intentionally organized by protocol object rather than by technical concern. Each object gets one obvious home for its type, schema, and parse helpers.

## Dependency Strategy

Use the smallest practical dependency set:
- runtime dependency: `zod`
- development dependency: `@types/node`

Do not add a separate test framework. Use the built-in Node test runner via `node:test` and `node:assert/strict`.

## Type And Enum Strategy

Keep the public shapes explicit and boring.

Shared enums should be exported as string-valued constants plus matching types and schemas. That avoids TypeScript numeric enum oddities while keeping the runtime values obvious.

Examples:
- `ActorType`
- `RequesterActorType`
- `DeciderActorType`
- `RiskLevel`
- `DecisionOutcome`
- `EnforcementMode`
- `GrantedScopeStatus`
- `ActionProposalStatus`
- `RevocationType`
- `AuditObjectType`

Each object module should export:
- the object type
- the validation schema
- a throwing parser
- a boolean type guard

Example shape:

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

export const scopeRequestSchema = z.object({ ... }).strict();

export function parseScopeRequest(input: unknown): ScopeRequest {
  return scopeRequestSchema.parse(input);
}

export function isScopeRequest(input: unknown): input is ScopeRequest {
  return scopeRequestSchema.safeParse(input).success;
}
```

## Shared Primitives

`src/shared/primitives.ts` should hold small, reusable schema pieces only:
- `specVersionSchema` as `z.literal("0.1")`
- `idSchema` as a non-empty string
- `nonEmptyStringSchema`
- `isoUtcTimestampSchema`
- `metadataSchema`
- `stringListSchema` for non-empty lists of non-empty strings
- common actor schemas

Every object schema should be `.strict()` so unexpected fields fail validation rather than being silently discarded.

There should be no coercion in v0.1:
- no auto-converting numbers from strings
- no defaulting missing fields
- no best-effort timestamp parsing
- no mutation or normalization inside parse helpers

## Object Shapes From The Spec

### ScopeRequest

Required fields:
- `id`
- `spec_version`
- `requester`
- `context_categories`
- `purpose`
- `requested_ttl_seconds`
- `created_at`

Optional fields:
- `sensitivity_hint`
- `justification`
- `metadata`

Notes:
- `requester.actor_type` is limited to `application | agent`
- `sensitivity_hint` should reuse the shared risk enum
- `context_categories` should be non-empty
- `requested_ttl_seconds` should be a positive integer

### GrantedScope

Required fields:
- `id`
- `spec_version`
- `scope_request_id`
- `grantee`
- `granted_categories`
- `purpose`
- `enforcement_mode`
- `issued_at`
- `expires_at`
- `status`

Optional fields:
- `constraints`
- `metadata`

Notes:
- `grantee.actor_type` is limited to `application | agent`
- `status` is `active | expired | revoked`
- `constraints.max_uses` should be a positive integer if present
- `constraints.allowed_targets` should be a non-empty string list if present

### ContextManifest

Required fields:
- `id`
- `spec_version`
- `granted_scope_id`
- `used_categories`
- `used_entries`
- `generated_at`

Optional fields:
- `provenance`
- `notes`
- `metadata`

Notes:
- `used_entries` items require `entry_id`, `category`, `source`, `summary`
- `provenance` items require `entry_id`, `origin_type`, `origin_ref`
- `origin_type` is `memory | preference | rule | manual_input | system`

### ActionProposal

Required fields:
- `id`
- `spec_version`
- `requester`
- `action_type`
- `target`
- `summary`
- `risk_level`
- `context_manifest_id`
- `created_at`
- `status`

Optional fields:
- `execution_payload`
- `human_readable_diff`
- `reason`
- `policy_hint`
- `expires_at`
- `metadata`

Notes:
- `requester.actor_type` is limited to `application | agent`
- `risk_level` reuses the shared risk enum
- `policy_hint` reuses the enforcement mode enum
- `status` is the literal `pending` in v0.1

### ApprovalReceipt

Required fields:
- `id`
- `spec_version`
- `action_proposal_id`
- `decision`
- `decider`
- `decided_at`

Optional fields:
- `reason`
- `valid_until`
- `conditions`
- `metadata`

Notes:
- `decision` reuses the shared decision outcome enum
- `decider.actor_type` is limited to `user | system`
- `conditions.single_use` is boolean
- `conditions.target_lock` and `conditions.notes` are optional strings

### RevocationEvent

Required fields:
- `id`
- `spec_version`
- `revocation_type`
- `target_id`
- `revoked_by`
- `revoked_at`

Optional fields:
- `reason`
- `metadata`

Notes:
- `revocation_type` is `scope | approval`
- `revoked_by.actor_type` is limited to `user | system`

### AuditRecord

Required fields:
- `id`
- `spec_version`
- `event_type`
- `object_type`
- `object_id`
- `recorded_at`

Optional fields:
- `actor`
- `summary`
- `metadata`

Notes:
- `actor.actor_type` may be `user | application | agent | system`
- the spec lists `object_type` values as `ScopeRequest | GrantedScope | ContextManifest | ActionProposal | ApprovalReceipt | RevocationEvent`
- notably, the spec does not include `AuditRecord` itself as a valid `object_type`, so the implementation should preserve that as written

## Testing Strategy

Use package-local tests under `packages/protocol/test/`.

Each protocol object gets:
- one valid payload acceptance test
- invalid payload tests for missing required fields
- invalid payload tests for wrong enum values
- invalid payload tests for wrong primitive types
- invalid payload tests for malformed nested objects
- clear assertions on the failing path and high-level message

Tests should prefer checking `safeParse` results and `parse` error details over full snapshots.

Failure behavior should stay fail-closed:
- parse helpers throw
- type guards return `false`
- schemas reject unknown keys
- malformed payloads never coerce into valid objects

## Public API

The package root should provide a flat export surface from `src/index.ts`.

Consumers should be able to write imports like:

```ts
import {
  type ScopeRequest,
  type ApprovalReceipt,
  RiskLevel,
  GrantedScopeStatus,
  scopeRequestSchema,
  parseActionProposal,
  isAuditRecord,
} from "@accord/protocol";
```

The root export should include:
- all public types
- all shared enums
- all object schemas
- all parse helpers
- all type guards

It should not expose internal schema fragments from `shared/primitives.ts`.

## Out Of Scope

This package should not include:
- policy evaluation logic
- approval decision logic
- server or storage code
- transport formats beyond the direct runtime objects
- signing, synchronization, or multi-user delegation features deferred by the spec

## Verification Plan

Implementation should be considered complete only after:
- `@accord/protocol` builds
- package-local typechecking passes
- package-local tests pass
- malformed payload tests fail on the expected field paths
- root workspace typechecking and build still pass
