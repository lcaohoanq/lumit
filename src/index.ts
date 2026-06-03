#!/usr/bin/env node
import { Command } from "commander";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCommand } from "./commands/create.js";
import type { CreateOptions } from "./types/index.js";

const program = new Command();
const packageJsonPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../package.json");
const packageJson = fs.readJsonSync(packageJsonPath) as { version?: string };
const version = packageJson.version ?? "0.0.0";

program
  .name("lumit")
  .description("Create starter projects quickly with install, git, and optional GitHub setup.")
  .version(version)
  .addHelpText(
    "after",
    `

Examples:
  $ lumit create my-app --template react-vite-ts
  $ lumit create my-app --template react-vite --package-manager pnpm
  $ lumit create my-app --template react-vite-ts --github --private
  $ lumit create

Install:
  $ npm install -g @luucaohoang/lumit

Run "lumit create --help" for create options.
`
  );

program
  .command("create")
  .description("Create a new starter project")
  .argument("[projectName]", "project folder name")
  .option("-t, --template <id>", "template id, e.g. react-vite-ts")
  .option("--package-manager <name>", "package manager: npm, pnpm, yarn, or bun")
  .option("--no-install", "skip dependency installation")
  .option("--no-git", "skip git init and initial commit")
  .option("--github", "create a GitHub repository with GitHub CLI")
  .option("--private", "create a private GitHub repository")
  .option("--public", "create a public GitHub repository")
  .addHelpText(
    "after",
    `

Templates:
  react-vite      React + Vite
  react-vite-ts   React + Vite + TypeScript

Copy-paste examples:
  $ lumit create my-app --template react-vite-ts
  $ lumit create my-app --template react-vite-ts --no-install
  $ lumit create my-app --template react-vite-ts --no-git
  $ lumit create my-app --template react-vite-ts --package-manager pnpm
  $ lumit create my-app --template react-vite-ts --github --private
  $ lumit create my-app --template react-vite-ts --github --public

Interactive mode:
  $ lumit create

Next step after creation:
  $ cd my-app
  $ npm run dev
`
  )
  .action(async (projectName: string | undefined, options: CreateOptions) => {
    await createCommand(projectName, options);
  });

program.parseAsync(process.argv);
