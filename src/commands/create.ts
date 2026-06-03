import path from "node:path";
import { confirm, input, select } from "@inquirer/prompts";
import { ExecaError } from "execa";
import fs from "fs-extra";
import { createGitHubRepo } from "../git/github.js";
import { initGit } from "../git/git.js";
import { getTemplate, templates } from "../templates/index.js";
import type { CreateOptions, CreateSummary, ResolvedCreateOptions, Visibility } from "../types/index.js";
import { getInstallCommand, getRunCommand, isPackageManager, packageManagers } from "../utils/detectPackageManager.js";
import { logger, startSpinner } from "../utils/logger.js";
import { commandExists, formatCommand, runCommand } from "../utils/runCommand.js";

const projectNamePattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export async function createCommand(projectNameArg: string | undefined, options: CreateOptions): Promise<void> {
  try {
    const resolved = await resolveCreateOptions(projectNameArg, options);
    const projectDir = path.resolve(process.cwd(), resolved.projectName);

    await validateProjectDirectory(projectDir);
    await ensurePackageManagerAvailable(resolved.packageManager);

    const createCommandConfig = resolved.template.commands[resolved.packageManager](resolved.projectName);
    await runStep("Creating project", async () => {
      await runCommand(createCommandConfig.file, createCommandConfig.args, { stdio: "pipe" });
    });

    if (resolved.install) {
      const installCommand = getInstallCommand(resolved.packageManager);
      await runStep("Installing dependencies", async () => {
        await runCommand(installCommand.file, installCommand.args, { cwd: projectDir, stdio: "pipe" });
      });
    }

    if (resolved.git) {
      await runStep("Initializing git", async () => {
        await initGit(projectDir);
      });
    }

    if (resolved.github) {
      if (!resolved.git) {
        throw new Error("GitHub repo creation requires git. Run without --no-git or initialize git manually first.");
      }

      await runStep(resolved.push ? "Creating GitHub repo and pushing code" : "Creating GitHub repo", async () => {
        await createGitHubRepo({
          projectName: resolved.projectName,
          projectDir,
          visibility: resolved.visibility,
          push: resolved.push
        });
      });
    }

    printSummary({
      projectName: resolved.projectName,
      templateName: resolved.template.name,
      packageManager: resolved.packageManager,
      install: resolved.install ? "done" : "skipped",
      git: resolved.git ? "initialized" : "skipped",
      github: !resolved.github ? "skipped" : resolved.push ? "pushed" : "created",
      visibility: resolved.github ? resolved.visibility : undefined,
      devCommand: resolved.template.devCommand
    });
  } catch (error) {
    printError(error);
    process.exitCode = 1;
  }
}

async function resolveCreateOptions(
  projectNameArg: string | undefined,
  options: CreateOptions
): Promise<ResolvedCreateOptions> {
  const interactive = projectNameArg === undefined || options.template === undefined;
  const projectName = await resolveProjectName(projectNameArg);
  const template = await resolveTemplate(options.template);
  const packageManager = await resolvePackageManager(options.packageManager, interactive);

  const install = await resolveInstall(options.install, interactive);
  const git = await resolveGit(options.git, interactive);
  const github = options.github ?? (interactive ? await confirm({ message: "Create a GitHub repository?", default: false }) : false);
  const visibility = await resolveVisibility(options, github);
  const push = github ? await resolvePush(options.github, interactive) : false;

  return {
    projectName,
    template,
    packageManager,
    install,
    git,
    github,
    visibility,
    push
  };
}

async function resolveProjectName(projectNameArg: string | undefined): Promise<string> {
  const projectName =
    projectNameArg ??
    (await input({
      message: "Project name:",
      validate: (value) => validateProjectName(value) || true
    }));

  const validation = validateProjectName(projectName);
  if (validation !== undefined) {
    throw new Error(validation);
  }

  return projectName;
}

async function resolveTemplate(templateId: string | undefined) {
  if (templateId !== undefined) {
    const template = getTemplate(templateId);
    if (!template) {
      throw new Error(`Unknown template "${templateId}". Available templates: ${templates.map((item) => item.id).join(", ")}.`);
    }

    return template;
  }

  const selectedTemplateId = await select({
    message: "Choose a template:",
    choices: templates.map((template) => ({
      name: template.name,
      value: template.id,
      description: template.id
    }))
  });

  return getTemplate(selectedTemplateId)!;
}

async function resolvePackageManager(packageManagerOption: string | undefined, interactive: boolean) {
  if (packageManagerOption !== undefined) {
    if (!isPackageManager(packageManagerOption)) {
      throw new Error(`Unsupported package manager "${packageManagerOption}". Use one of: ${packageManagers.join(", ")}.`);
    }

    return packageManagerOption;
  }

  if (!interactive) {
    return "npm";
  }

  return select({
    message: "Choose a package manager:",
    choices: packageManagers.map((packageManager) => ({
      name: packageManager,
      value: packageManager
    })),
    default: "npm"
  });
}

async function resolveInstall(installOption: boolean, interactive: boolean): Promise<boolean> {
  if (!installOption || !interactive) {
    return installOption;
  }

  return confirm({
    message: "Install dependencies?",
    default: true
  });
}

async function resolveGit(gitOption: boolean, interactive: boolean): Promise<boolean> {
  if (!gitOption || !interactive) {
    return gitOption;
  }

  return confirm({
    message: "Initialize git and create an initial commit?",
    default: true
  });
}

async function resolveVisibility(options: CreateOptions, github: boolean): Promise<Visibility> {
  if (!github) {
    return "public";
  }

  if (options.private && options.public) {
    throw new Error("Use only one visibility flag: --private or --public.");
  }

  if (options.private) {
    return "private";
  }

  if (options.public) {
    return "public";
  }

  return select({
    message: "Repository visibility:",
    choices: [
      { name: "Private", value: "private" },
      { name: "Public", value: "public" }
    ],
    default: "private"
  });
}

async function resolvePush(githubFlag: boolean | undefined, interactive: boolean): Promise<boolean> {
  if (githubFlag && !interactive) {
    return true;
  }

  return confirm({
    message: "Push code to GitHub now?",
    default: true
  });
}

function validateProjectName(projectName: string): string | undefined {
  if (!projectName.trim()) {
    return "Project name is required.";
  }

  if (projectName.startsWith(".")) {
    return "Project name cannot start with a dot.";
  }

  if (projectName.includes("/") || projectName.includes("\\") || projectName.includes("..")) {
    return "Project name must be a simple folder name, not a path.";
  }

  if (!projectNamePattern.test(projectName)) {
    return "Project name can only contain letters, numbers, dots, underscores, and hyphens.";
  }

  return undefined;
}

async function validateProjectDirectory(projectDir: string): Promise<void> {
  if (await fs.pathExists(projectDir)) {
    throw new Error(`Project folder already exists: ${projectDir}`);
  }
}

async function ensurePackageManagerAvailable(packageManager: string): Promise<void> {
  if (!(await commandExists(packageManager))) {
    throw new Error(`${packageManager} is not installed or is not available in PATH.`);
  }
}

async function runStep(message: string, action: () => Promise<void>): Promise<void> {
  const spinner = startSpinner(message);

  try {
    await action();
    spinner.succeed(message);
  } catch (error) {
    spinner.fail(message);
    throw error;
  }
}

function printSummary(summary: CreateSummary): void {
  const devCommand = getRunCommand(summary.packageManager, summary.devCommand);

  logger.plain();
  logger.success("Project created successfully!");
  logger.plain();
  logger.plain(`Name: ${summary.projectName}`);
  logger.plain(`Template: ${summary.templateName}`);
  logger.plain(`Package manager: ${summary.packageManager}`);
  logger.plain(`Install: ${summary.install}`);
  logger.plain(`Git: ${summary.git}`);
  logger.plain(`GitHub: ${formatGitHubSummary(summary)}`);
  logger.plain();
  logger.plain("Next steps:");
  logger.plain(`cd ${summary.projectName}`);
  logger.plain(devCommand);
}

function formatGitHubSummary(summary: CreateSummary): string {
  if (summary.github === "skipped") {
    return "skipped";
  }

  const visibility = summary.visibility ? ` ${summary.visibility}` : "";
  return summary.github === "pushed" ? `pushed to${visibility} repo` : `created${visibility} repo`;
}

function printError(error: unknown): void {
  logger.plain();

  if (error instanceof ExecaError) {
    logger.error(`Command failed: ${formatCommand(error.command ?? "unknown", [])}`);
    if (error.shortMessage) {
      logger.error(error.shortMessage);
    }
    return;
  }

  if (error instanceof Error) {
    logger.error(error.message);
    return;
  }

  logger.error("An unknown error occurred.");
}
