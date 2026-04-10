# Accord Repo Bootstrap Design

**Goal:** Create the smallest clean TypeScript-first monorepo bootstrap for Accord, with docs-first structure and placeholder packages/examples only.

**Constraints:**
- TypeScript-first monorepo
- Local-first
- `pnpm` workspace
- No application logic yet
- Minimum viable scaffold only
- Clear, boring naming
- No unrelated frameworks or cloud infrastructure

## Current State

The repository folder contains:
- `docs/` with source planning PDFs
- empty `packages/`
- empty `examples/`
- empty `tooling/`
- empty `.codex/`

There is no existing git repository metadata in this folder.

## Recommended Approach

Use a minimal workspace bootstrap with:
- one private root workspace package
- one shared TypeScript base config
- placeholder package and example manifests
- empty `src/index.ts` entrypoints
- a root `README.md`
- a `docs/index.md` landing page
- an `AGENTS.md` file with repo-specific guidance for future Codex tasks

This keeps the repo immediately navigable without committing to runtime, framework, or deployment choices.

## Structure

```text
.
├── .gitignore
├── AGENTS.md
├── README.md
├── docs/
│   ├── index.md
│   └── plans/
├── examples/
│   ├── coding-agent/
│   └── research-publisher/
├── package.json
├── packages/
│   ├── console/
│   ├── policy-engine/
│   ├── protocol/
│   ├── sdk/
│   └── server/
├── pnpm-workspace.yaml
├── tooling/
└── tsconfig.base.json
```

Each package and example gets:
- `package.json`
- `tsconfig.json`
- `src/index.ts`

## Design Choices

### Workspace

Use `pnpm` workspaces and keep the root package private. This gives a predictable monorepo layout without adding task runners or release tooling prematurely.

### TypeScript

Use a single `tsconfig.base.json` with strict defaults and per-package `tsconfig.json` files that only define local paths and output directories. This keeps configuration obvious and avoids premature project references or build orchestration.

### Packages

Use the requested folders directly:
- `packages/protocol`
- `packages/server`
- `packages/policy-engine`
- `packages/sdk`
- `packages/console`

Keep package names aligned to the folder names with the `@accord/` scope.

### Examples

Create the requested example folders as private workspace packages:
- `examples/coding-agent`
- `examples/research-publisher`

These stay dependency-free placeholders for now.

### Documentation

Keep docs-first structure by adding:
- `README.md` for quick orientation
- `docs/index.md` as the docs landing page
- `docs/plans/` for implementation planning artifacts

### Agent Guidance

Add `AGENTS.md` to capture guardrails for future Codex work:
- preserve docs-first workflow
- do not add frameworks or cloud infrastructure unless requested
- do not implement application logic during bootstrap tasks
- prefer minimal files and boring names

## Deliberately Not Included

- CI workflows
- linting or formatting setup
- release automation
- frontend frameworks
- Docker or cloud infrastructure
- databases or external services
- package interdependencies beyond workspace structure

## Verification Plan

After scaffolding:
- verify the file tree exists
- install workspace dependencies
- run TypeScript typechecking across all workspaces
- initialize git with `main`
- add the requested GitHub remote
- commit and push the bootstrap
