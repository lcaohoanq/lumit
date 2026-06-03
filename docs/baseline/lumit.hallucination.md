# Lumit Hallucination And Decision Log

This file records requirements that could not be decided purely from codebase facts. When a decision is made, keep the original options and record the final decision.

## Closed Decisions

### Decision 1: Baseline Docs Folder

Options:

- `docs/baseline/`
- `.agents/docs/`
- `.codex/docs/`

Decision: use `docs/baseline/`.

Reason: the requested folder path was blank, and this is a visible repository docs location.

### Decision 2: Docs Prefix

Options:

- `lumit`
- `monorepo`
- `project`

Decision: use `lumit`.

Reason: Lumit is the product, package, and binary name.

### Decision 3: Topic

Options:

- `monorepo-core-desktop-refactor`
- `desktop-app`
- `core-extraction`

Decision: use `monorepo-core-desktop-refactor`.

Reason: this is the broad task described by `tasks.md`.

### Decision 4: `forge doctor` vs `lumit doctor`

Options:

- Add `forge doctor` exactly as written in `tasks.md`.
- Add `lumit doctor` to match the current product binary.

Decision: add `lumit doctor`.

Reason: the published CLI binary is `lumit`; adding `forge` would introduce a second brand and break the stated goal of preserving the existing CLI command.

### Decision 5: Workspace Package Manager

Options:

- npm workspaces
- pnpm workspaces
- yarn workspaces

Decision: use npm workspaces.

Reason: the repo already uses npm and has `package-lock.json`.

### Decision 6: Core Package Publish Policy

Options:

- Keep core private inside the monorepo.
- Publish core as `@luucaohoang/lumit-core`.

Initial decision: keep core private for MVP and bundle it with the CLI package.

Reason: the immediate public package is the CLI. External core reuse can be revisited after the API stabilizes.

Updated decision: publish core as `@luucaohoang/lumit-core`.

Reason: npm pack verification showed the private workspace core was not bundled into the CLI tarball. Publishing core is required so the installed CLI can resolve `@luucaohoang/lumit-core` at runtime.

Implementation note: local workspace development uses `file:../core` for CLI and desktop dependencies. The release workflow rewrites the CLI dependency to the published core version before `npm publish`.

### Decision 7: Desktop Packaging

Options:

- Dev-only Electron app for now.
- Add distributable builds with Electron Builder.
- Add distributable builds with Electron Forge.

Decision: dev-only desktop app for this phase.

Reason: the MVP needs a working shared-core desktop surface before installer packaging decisions.

### Decision 8: Workspace Package Manager Migration

Options:

- Keep npm workspaces.
- Switch local workspace development and CI to Bun.

Decision: switch local workspace development and CI to Bun.

Reason: requested migration from npm to Bun while keeping the published packages on the npm registry.

## Open Risks

No open risks currently.
