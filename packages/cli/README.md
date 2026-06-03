# Lumit CLI

Create starter projects quickly with install, Git, and optional GitHub setup.

## Install

```bash
npm install -g @luucaohoang/lumit
```

## Usage

```bash
lumit create my-app --template react-vite-ts
```

```bash
lumit doctor
```

## Examples

```bash
lumit create
lumit create my-app --template react-vite
lumit create my-app --template react-vite-ts --package-manager pnpm
lumit create my-app --template react-vite-ts --no-install
lumit create my-app --template react-vite-ts --no-git
lumit create my-app --template react-vite-ts --github --private
```

## Templates

| Template | Description |
| --- | --- |
| `react-vite` | React + Vite |
| `react-vite-ts` | React + Vite + TypeScript |
