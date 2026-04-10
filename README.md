# Accord

Accord is an open protocol, SDK, and reference implementation for scoped context disclosure and human approval of high-impact AI actions in personal AI systems.

This repository is intentionally bootstrapped as a minimal TypeScript-first monorepo. It establishes workspace structure, docs entrypoints, and placeholder packages without implementing application logic yet.

## Repository Layout

```text
packages/
  protocol/
  server/
  policy-engine/
  sdk/
  console/
examples/
  coding-agent/
  research-publisher/
docs/
  index.md
  *.pdf
tooling/
```

## Workspace Packages

- `@accord/protocol`
- `@accord/server`
- `@accord/policy-engine`
- `@accord/sdk`
- `@accord/console`

## Examples

- `@accord/example-coding-agent`
- `@accord/example-research-publisher`

## Docs

Start with [docs/index.md](docs/index.md).

## Bootstrap Commands

```bash
pnpm install
pnpm typecheck
pnpm build
```

## Status

This bootstrap provides repository structure only. Protocol definitions, server behavior, policy evaluation, SDK APIs, console UX, and example logic are intentionally deferred.
