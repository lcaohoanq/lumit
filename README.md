# lumit

`lumit` is a CLI for creating starter projects quickly. It creates the project, installs dependencies, initializes Git, creates the first commit, and can optionally create and push a GitHub repository with GitHub CLI.

The MVP supports React + Vite templates.

## Install

```bash
npm install -g @luucaohoang/lumit
```

Check that it works:

```bash
lumit --help
```

## Quick Start

Create a React + Vite + TypeScript app:

```bash
lumit create my-app --template react-vite-ts
```

Then run it:

```bash
cd my-app
npm run dev
```

## Copy-Paste Commands

Create with interactive prompts:

```bash
lumit create
```

Create React + Vite + TypeScript:

```bash
lumit create my-app --template react-vite-ts
```

Create React + Vite JavaScript:

```bash
lumit create my-app --template react-vite
```

Use pnpm:

```bash
lumit create my-app --template react-vite-ts --package-manager pnpm
```

Use yarn:

```bash
lumit create my-app --template react-vite-ts --package-manager yarn
```

Use bun:

```bash
lumit create my-app --template react-vite-ts --package-manager bun
```

Skip dependency installation:

```bash
lumit create my-app --template react-vite-ts --no-install
```

Skip Git initialization:

```bash
lumit create my-app --template react-vite-ts --no-git
```

Create a private GitHub repo and push:

```bash
lumit create my-app --template react-vite-ts --github --private
```

Create a public GitHub repo and push:

```bash
lumit create my-app --template react-vite-ts --github --public
```

## What It Runs

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

## Templates

| Template | Description |
| --- | --- |
| `react-vite` | React + Vite |
| `react-vite-ts` | React + Vite + TypeScript |

## Options

| Option | Description |
| --- | --- |
| `--template <id>` | Select a template: `react-vite` or `react-vite-ts` |
| `--package-manager <name>` | Select `npm`, `pnpm`, `yarn`, or `bun` |
| `--no-install` | Skip dependency installation |
| `--no-git` | Skip `git init`, `git add .`, and initial commit |
| `--github` | Create a GitHub repository with GitHub CLI |
| `--private` | Create a private GitHub repository |
| `--public` | Create a public GitHub repository |

## Interactive Mode

If you do not pass enough options, `lumit` asks what to do:

```bash
lumit create
```

It can ask for:

- Project name
- Template
- Package manager
- Whether to install dependencies
- Whether to initialize Git
- Whether to create a GitHub repository
- Public or private repository
- Whether to push immediately

## Requirements

- Node.js 20+
- npm, pnpm, yarn, or bun
- Git, unless you use `--no-git`
- GitHub CLI, only if you use `--github`

For GitHub repo creation, install and login with GitHub CLI:

```bash
gh auth login
```

## Local Development

Install dependencies:

```bash
npm install
```

Run typecheck:

```bash
npm run typecheck
```

Build:

```bash
npm run build
```

Link locally:

```bash
npm link
```

Run the local CLI:

```bash
lumit create my-app --template react-vite-ts
```

Run from source without linking:

```bash
npm run dev -- create my-app --template react-vite-ts
```

## Release to npm

The package is published as:

```bash
@luucaohoang/lumit
```

The installed command is still:

```bash
lumit
```

Before the first release, add an npm automation token to GitHub:

```text
GitHub repository
Settings
Secrets and variables
Actions
New repository secret
Name: NPM_TOKEN
```

Release flow:

```bash
npm ci
npm run typecheck
npm run build
npm version patch
git push --follow-tags
```

Then create a GitHub Release from the new tag and publish it. The GitHub Actions release workflow will publish to npm.

## Troubleshooting

PowerShell blocks `lumit.ps1` on Windows:

```bash
lumit.cmd --help
```

Git commit fails because user identity is missing:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

GitHub CLI is not logged in:

```bash
gh auth login
```

Package manager is missing:

```bash
npm --version
pnpm --version
yarn --version
bun --version
```

## Extending Templates

Add new template modules under `src/templates/` and export them through `src/templates/index.ts`.

Each template defines:

- Template id
- Display name
- Framework
- Create command per package manager
- Dev command

This keeps future support for Next.js, Vue, Svelte, Express, NestJS, Laravel, Tailwind, ESLint, Prettier, React Router, Zustand, Axios, shadcn/ui, and custom presets separate from the create command orchestration.
