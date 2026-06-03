# Lumit Roadmap

## Resume Rules

- Treat this file as the resumable source of implementation progress.
- Update it whenever the codebase changes.
- Do not rely on prior chat memory to understand current status.

## Progress Tracker

| Phase | Status | Notes |
| --- | --- | --- |
| Baseline docs | Completed | Introduction, roadmap, and hallucination docs created. |
| Workspace setup | Completed | Root converted to Bun workspaces. |
| Core extraction | Completed | Shared core package added under `packages/core`. |
| CLI refactor | Completed | CLI package added under `packages/cli` and calls core. |
| Doctor command | Completed | `lumit doctor` added in CLI package. |
| Desktop app | Completed | Electron + React package added under `packages/desktop`. |
| CI/release/readme | Completed | Workspace scripts, workflows, README, and package checks updated. |
| Electron local repair | Completed | Added `bun run repair:electron`; desktop dev script calls the repair file directly from the workspace. |
| Electron launcher | Completed | Added launcher that removes `ELECTRON_RUN_AS_NODE` before opening desktop app. |
| Local core dependency | Completed | CLI and desktop use `file:../core` locally; release rewrites CLI to the published core version. |

## Current Target

The monorepo refactor and desktop MVP described in `tasks.md` have been implemented. Next work should focus on hardening tests and optional desktop packaging.

## Current Package Manager

- Bun is the workspace package manager.
- `bun.lock` is the source lockfile.
- Release still publishes packages to the npm registry.

## Verification Checklist

- `bun install`
- `bun run typecheck`
- `bun run build`
- `bun run pack:core`
- `bun run pack:cli`
- `lumit --help`
- `lumit create --help`
- `lumit doctor`
- `lumit create my-app --template react-vite-ts --no-install --no-git`
- Desktop package builds and starts with secure IPC.

## Verified In This Change

- `bun install`
- `bun run typecheck`
- `bun run build`
- `bun run pack:core`
- `bun run pack:cli`
- `node packages/cli/dist/index.js --help`
- `node packages/cli/dist/index.js create --help`
- `node packages/cli/dist/index.js doctor`
- `node packages/cli/dist/index.js create lumit-smoke-react --template react-vite --no-install --no-git`
- `bun pm scan`
