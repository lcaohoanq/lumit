# lumit

`lumit` is a modular CLI for creating starter projects quickly. The MVP supports React + Vite projects and automates dependency install, Git initialization, initial commit, and optional GitHub repo creation through GitHub CLI.

## Requirements

- Node.js 20+
- npm
- Git, if you want Git initialization
- GitHub CLI, if you want `--github`

## Setup

```bash
npm install
npm run build
npm link
```

After linking, the `lumit` command is available globally on your machine.

## Usage

Interactive mode:

```bash
lumit create
```

Create a React + Vite TypeScript app:

```bash
lumit create my-app --template react-vite-ts
```

Create without Git:

```bash
lumit create my-app --template react-vite-ts --no-git
```

Create without installing dependencies:

```bash
lumit create my-app --template react-vite-ts --no-install
```

Create a private GitHub repo and push:

```bash
lumit create my-app --template react-vite-ts --github --private
```

Use pnpm:

```bash
lumit create my-app --template react-vite-ts --package-manager pnpm
```

## Templates

| Template | Description |
| --- | --- |
| `react-vite` | React + Vite |
| `react-vite-ts` | React + Vite + TypeScript |

## Flags

| Flag | Description |
| --- | --- |
| `--template <id>` | Select a starter template |
| `--package-manager <npm\|pnpm\|yarn\|bun>` | Select package manager |
| `--no-install` | Skip dependency installation |
| `--no-git` | Skip Git initialization and initial commit |
| `--github` | Create a GitHub repo with GitHub CLI |
| `--private` | Create private GitHub repo |
| `--public` | Create public GitHub repo |

## What `lumit create my-app --template react-vite-ts` runs

With npm, the CLI runs the equivalent of:

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
git init
git add .
git commit -m "Initial commit"
```

With `--github --private`, it also runs the equivalent of:

```bash
gh repo create my-app --source=. --remote=origin --private --push
```

## Development

```bash
npm run typecheck
npm run build
npm run dev -- create my-app --template react-vite-ts
```

## Release to npm with GitHub Releases

This repository includes GitHub Actions for CI and npm publishing:

- `.github/workflows/ci.yml` runs on pull requests and pushes to `main` or `master`.
- `.github/workflows/release.yml` publishes to npm when a GitHub Release is published.

Before the first release:

1. Create an npm automation token.
2. Add it to the GitHub repository secrets as `NPM_TOKEN`.
3. Make sure the package scope in `package.json` belongs to your npm account or organization.

This package is published under the scoped npm name `@luucaohoang/lumit`, while the installed CLI command remains `lumit`:

```json
{
  "name": "@luucaohoang/lumit",
  "bin": {
    "lumit": "./dist/index.js"
  }
}
```

If your npm account uses a different scope, update the `name` field before publishing.

Release flow:

```bash
npm ci
npm run typecheck
npm run build
npm version patch
git push --follow-tags
```

Then create and publish a GitHub Release from the new tag. The release workflow will run:

```bash
npm ci
npm run typecheck
npm run build
npm publish --provenance
```

Users can install the published CLI with:

```bash
npm install -g @luucaohoang/lumit
lumit create my-app --template react-vite-ts
```

## Extending Templates

Add new template modules under `src/templates/` and export them through `src/templates/index.ts`. Each template provides package-manager-specific create commands and a dev script name, so future ecosystems such as Next.js, Vue, Svelte, Express, NestJS, Laravel, Tailwind presets, and custom presets can be added without changing the CLI orchestration.
