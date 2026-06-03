#!/usr/bin/env node
import { Command } from "commander";
import { createCommand } from "./commands/create.js";
const program = new Command();
program
    .name("lumit")
    .description("Create starter projects quickly with batteries-included setup.")
    .version("0.1.0");
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
    .action(async (projectName, options) => {
    await createCommand(projectName, options);
});
program.parseAsync(process.argv);
//# sourceMappingURL=index.js.map