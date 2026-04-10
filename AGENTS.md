# AGENTS.md

## Repo Intent

Accord is a docs-first, TypeScript-first monorepo for an open protocol, SDK, and reference implementation around scoped context disclosure and human approval of high-impact AI actions in personal AI systems.

## Working Rules

- Preserve the docs-first structure. If you change repo shape, update `README.md` and `docs/index.md`.
- Keep bootstrap work boring and minimal. Add only files that have a clear immediate purpose.
- Do not implement application logic unless the task explicitly asks for it.
- Prefer local-first assumptions. Do not introduce cloud infrastructure, hosted services, or deployment tooling unless requested.
- Do not add frameworks, databases, background workers, or frontend stacks by default.
- Keep package names aligned to folder names under `packages/` and `examples/`.
- Use `pnpm` for workspace management.
- Use the shared `tsconfig.base.json` and keep per-package configs small.
- Put reusable libraries in `packages/` and runnable demos or sample integrations in `examples/`.
- Leave `tooling/` empty until shared tooling is justified by at least two concrete use cases.

## Expected Bootstrap Shape

- Root workspace files live at the repository root.
- Core v1 packages live under `packages/`.
- Examples live under `examples/`.
- Planning and source documents live under `docs/`.

## When Editing

- Prefer small, reviewable changes.
- Keep naming clear and literal.
- Avoid speculative abstractions.
- If you add a package or example, include `package.json`, `tsconfig.json`, and `src/index.ts`.
- If you add behavior later, add verification that matches the change instead of assuming the scaffold still works.
