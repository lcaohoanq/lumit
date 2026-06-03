# Lumit

Lumit is a starter project generator for developers. It creates React + Vite projects, installs dependencies, initializes Git, creates the first commit, and can optionally create and push a GitHub repository with GitHub CLI.

This repository is now a monorepo with a shared core package, a published CLI, and an Electron desktop app.

## Packages

```text
packages/
  core/      Shared project creation logic
  cli/       Published npm CLI package
  desktop/   Electron + React desktop app
```

## Install CLI

```bash
npm install -g @luucaohoang/lumit
```

Check the command:

```bash
lumit --help
```

## CLI Quick Start

Create a React + Vite + TypeScript app:

```bash
lumit create my-app --template react-vite-ts
```

Run it:

```bash
cd my-app
npm run dev
```

## Copy-Paste CLI Commands

Interactive mode:

```bash
lumit create
```

React + Vite + TypeScript:

```bash
lumit create my-app --template react-vite-ts
```

React + Vite JavaScript:

```bash
lumit create my-app --template react-vite
```

Use pnpm:

```bash
lumit create my-app --template react-vite-ts --package-manager pnpm
```

Skip dependency installation:

```bash
lumit create my-app --template react-vite-ts --no-install
```

Skip Git:

```bash
lumit create my-app --template react-vite-ts --no-git
```

Create a private GitHub repo and push:

```bash
lumit create my-app --template react-vite-ts --github --private
```

Check local tooling:

```bash
lumit doctor
```

## What `create` Runs

This command:

```bash
lumit create my-app --template react-vite-ts
```

Runs the equivalent of:

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
git init
git add .
git commit -m "Initial commit"
```

With GitHub enabled:

```bash
lumit create my-app --template react-vite-ts --github --private
```

It also runs:

```bash
gh repo create my-app --source=. --remote=origin --private --push
```

## Local Development

Install all workspaces:

```bash
npm install
```

Typecheck:

```bash
npm run typecheck
```

Build all packages:

```bash
npm run build
```

Run CLI from source:

```bash
npm run dev:cli -- create my-app --template react-vite-ts
```

Run desktop app:

```bash
npm run dev:desktop
```

Pack the CLI package:

```bash
npm run pack:cli
```

## Desktop App

The desktop app is an Electron + React + TypeScript MVP. It uses the same core package as the CLI.

It includes:

- Project creation form
- Folder picker
- Template/package-manager selection
- Install/Git/GitHub options
- Realtime logs
- Environment checker
- Result actions for opening folder, VS Code, and GitHub URL when available

Renderer security:

- `nodeIntegration: false`
- `contextIsolation: true`
- IPC API exposed through `contextBridge`

## Core API

`packages/core` exports:

```ts
createProject(options, callbacks)
checkEnvironment()
```

The core package owns validation, target folder checks, template commands, dependency install, Git, GitHub CLI, push, and progress callbacks.

## Baseline Docs

Baseline docs live in:

```text
docs/baseline/
```

They are the source of truth for resuming work without relying on prior conversation memory:

- `lumit.introduction.md`
- `lumit.roadmap.md`
- `lumit.hallucination.md`

Update them whenever the codebase changes.

## Release

The core package is published first:

```bash
@luucaohoang/lumit-core
```

The CLI is published from `packages/cli` as:

```bash
@luucaohoang/lumit
```

The installed command remains:

```bash
lumit
```

Release flow:

```bash
npm ci
npm run typecheck
npm run build
npm version patch --workspace packages/core
npm version patch --workspace packages/cli
git push --follow-tags
```

Create a GitHub Release from the new tag. The release workflow publishes the CLI package to npm.

## Troubleshooting

PowerShell blocks `lumit.ps1` on Windows:

```bash
lumit.cmd --help
```

Git identity is missing:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

GitHub CLI is not logged in:

```bash
gh auth login
```
