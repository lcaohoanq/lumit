# Lumit Introduction

## Topic

`monorepo-core-desktop-refactor`

## Product Target

Lumit is a developer tool for creating starter projects quickly. The existing product is a published npm CLI that creates Vite React projects, installs dependencies, initializes Git, creates the first commit, and can optionally create and push a GitHub repository through GitHub CLI.

The next target is to keep the CLI working while extracting all reusable project creation behavior into a shared core package and adding an Electron desktop app for users who prefer a click-based UI.

## Current Codebase Status

- Repository: `lcaohoanq/lumit`
- Published CLI package: `@luucaohoang/lumit`
- CLI binary: `lumit`
- Current monorepo package version: `0.1.3`
- Package manager: npm
- Runtime target: Node.js 20+
- Supported templates:
  - `react-vite`
  - `react-vite-ts`

## Implemented Architecture

The repository is an npm workspace monorepo:

```text
packages/
  core/
  cli/
  desktop/
```

`packages/core` owns project creation logic. It is published as `@luucaohoang/lumit-core` so the npm-installed CLI can resolve the shared logic at runtime.

It exports:

```ts
createProject(options, callbacks)
checkEnvironment()
```

`packages/cli` owns terminal UX and keeps the existing `lumit` command behavior. It is published as `@luucaohoang/lumit`.

`packages/desktop` owns Electron + React UI and calls the same core package through secure IPC.

## Implementation Direction

- Keep command execution argument-based, not shell-string based.
- Keep core reusable by reporting progress through callbacks instead of terminal-specific spinners.
- Keep the desktop renderer isolated from Node APIs.
- Keep release behavior centered on the CLI package.
- Keep baseline docs synchronized whenever the codebase changes.
