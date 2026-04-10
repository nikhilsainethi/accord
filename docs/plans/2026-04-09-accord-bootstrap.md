# Accord Bootstrap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bootstrap a minimal TypeScript-first `pnpm` monorepo for Accord with docs-first structure and placeholder workspaces only.

**Architecture:** Use a private root workspace package, a shared TypeScript base configuration, and one minimal manifest/config/source triplet per package and example. Keep the repo intentionally thin so later protocol and SDK work can layer onto a stable layout instead of undoing framework choices made too early.

**Tech Stack:** TypeScript, `pnpm` workspaces, Node.js

---

### Task 1: Create Root Workspace Files

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`

**Step 1:** Create a private root workspace package with minimal `build` and `typecheck` scripts.

**Step 2:** Add a workspace definition for `packages/*` and `examples/*`.

**Step 3:** Add a shared strict TypeScript base config for Node-style packages.

**Step 4:** Ignore generated files only: `node_modules`, `dist`, `.DS_Store`, `*.tsbuildinfo`.

**Step 5:** Verify the files render correctly and contain no unrelated tooling.

### Task 2: Create Documentation Entry Points

**Files:**
- Create: `README.md`
- Create: `docs/index.md`
- Create: `AGENTS.md`

**Step 1:** Add a short root README with project summary, repo layout, and bootstrap commands.

**Step 2:** Add a docs index that points to the existing source PDFs and the new workspace layout.

**Step 3:** Add repo-specific Codex guidance in `AGENTS.md`.

**Step 4:** Verify the docs match the actual file tree.

### Task 3: Create Placeholder Workspace Packages

**Files:**
- Create: `packages/protocol/package.json`
- Create: `packages/protocol/tsconfig.json`
- Create: `packages/protocol/src/index.ts`
- Create: `packages/server/package.json`
- Create: `packages/server/tsconfig.json`
- Create: `packages/server/src/index.ts`
- Create: `packages/policy-engine/package.json`
- Create: `packages/policy-engine/tsconfig.json`
- Create: `packages/policy-engine/src/index.ts`
- Create: `packages/sdk/package.json`
- Create: `packages/sdk/tsconfig.json`
- Create: `packages/sdk/src/index.ts`
- Create: `packages/console/package.json`
- Create: `packages/console/tsconfig.json`
- Create: `packages/console/src/index.ts`

**Step 1:** Add one minimal manifest per package with `build` and `typecheck` scripts.

**Step 2:** Add one per-package TypeScript config extending the shared base config.

**Step 3:** Add empty placeholder exports in `src/index.ts`.

**Step 4:** Verify package names and folder names stay aligned.

### Task 4: Create Placeholder Example Workspaces

**Files:**
- Create: `examples/coding-agent/package.json`
- Create: `examples/coding-agent/tsconfig.json`
- Create: `examples/coding-agent/src/index.ts`
- Create: `examples/research-publisher/package.json`
- Create: `examples/research-publisher/tsconfig.json`
- Create: `examples/research-publisher/src/index.ts`

**Step 1:** Add each example as a private workspace package.

**Step 2:** Add minimal TypeScript configs and empty entrypoints.

**Step 3:** Verify the example names remain descriptive and boring.

### Task 5: Verify and Publish

**Files:**
- Modify: repository metadata created by git initialization

**Step 1:** Verify the generated tree with `find`.

**Step 2:** Install dependencies with `pnpm install`.

**Step 3:** Run `pnpm typecheck`.

**Step 4:** Initialize git on `main`, add the requested origin, and commit the bootstrap.

**Step 5:** Push `main` to `https://github.com/nikhilsainethi/accord.git`.
