#!/usr/bin/env node
import { Command } from "commander";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCommand, type CliCreateOptions } from "./commands/create.js";
import { doctorCommand } from "./commands/doctor.js";

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
  $ lumit create my-app --template react-vite --package-manager bun
  $ lumit create my-app --template react-vite-ts --github --private
  $ lumit doctor
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
  $ lumit create my-app --template react-vite-ts --package-manager bun
  $ lumit create my-app --template react-vite-ts --github --private
  $ lumit create my-app --template react-vite-ts --github --public

Interactive mode:
  $ lumit create

Next step after creation:
  $ cd my-app
  $ bun run dev
`
  )
  .action(async (projectName: string | undefined, options: CliCreateOptions) => {
    await createCommand(projectName, options);
  });

program
  .command("doctor")
  .description("Check Node, package managers, Git, and GitHub CLI availability")
  .addHelpText(
    "after",
    `

Example:
  $ lumit doctor
`
  )
  .action(async () => {
    await doctorCommand();
  });

program.parseAsync(process.argv);
