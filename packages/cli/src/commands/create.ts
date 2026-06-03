import process from "node:process";
import { confirm, input, select } from "@inquirer/prompts";
import {
  createProject,
  getRunCommand,
  getTemplate,
  isPackageManager,
  packageManagers,
  templates,
  validateProjectName,
  type CreateProjectOptions,
  type CreateProjectResult,
  type PackageManager,
  type ProjectStepEvent,
  type TemplateId,
  type Visibility
} from "@luucaohoang/lumit-core";
import { logger, startSpinner } from "../utils/logger.js";

export interface CliCreateOptions {
  template?: string;
  packageManager?: string;
  install: boolean;
  git: boolean;
  github?: boolean;
  private?: boolean;
  public?: boolean;
}

export async function createCommand(projectNameArg: string | undefined, options: CliCreateOptions): Promise<void> {
  try {
    const resolved = await resolveCreateOptions(projectNameArg, options);
    const spinners = new Map<string, ReturnType<typeof startSpinner>>();
    const useSpinner = process.stderr.isTTY;

    const result = await createProject(resolved, {
      onStep: (event) => renderStep(event, spinners, useSpinner)
    });

    printSummary(result);
  } catch (error) {
    printError(error);
    process.exitCode = 1;
  }
}

async function resolveCreateOptions(
  projectNameArg: string | undefined,
  options: CliCreateOptions
): Promise<CreateProjectOptions> {
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
    targetDirectory: process.cwd(),
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

async function resolveTemplate(templateId: string | undefined): Promise<TemplateId> {
  if (templateId !== undefined) {
    if (!getTemplate(templateId)) {
      throw new Error(`Unknown template "${templateId}". Available templates: ${templates.map((item) => item.id).join(", ")}.`);
    }

    return templateId as TemplateId;
  }

  return select({
    message: "Choose a template:",
    choices: templates.map((template) => ({
      name: template.name,
      value: template.id,
      description: template.id
    }))
  });
}

async function resolvePackageManager(packageManagerOption: string | undefined, interactive: boolean): Promise<PackageManager> {
  if (packageManagerOption !== undefined) {
    if (!isPackageManager(packageManagerOption)) {
      throw new Error(`Unsupported package manager "${packageManagerOption}". Use one of: ${packageManagers.join(", ")}.`);
    }

    return packageManagerOption;
  }

  if (!interactive) {
    return "bun";
  }

  return select({
    message: "Choose a package manager:",
    choices: packageManagers.map((packageManager) => ({
      name: packageManager,
      value: packageManager
    })),
    default: "bun"
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

async function resolveVisibility(options: CliCreateOptions, github: boolean): Promise<Visibility> {
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

function renderStep(event: ProjectStepEvent, spinners: Map<string, ReturnType<typeof startSpinner>>, useSpinner: boolean): void {
  if (!useSpinner) {
    if (event.status === "started") {
      logger.plain(`- ${event.label}`);
    } else if (event.status === "succeeded") {
      logger.plain(`[ok] ${event.label}`);
    } else {
      logger.plain(`[failed] ${event.label}`);
    }
    return;
  }

  if (event.status === "started") {
    spinners.set(event.id, startSpinner(event.label));
    return;
  }

  const spinner = spinners.get(event.id);
  if (!spinner) {
    return;
  }

  if (event.status === "succeeded") {
    spinner.succeed(event.label);
  } else {
    spinner.fail(event.label);
  }

  spinners.delete(event.id);
}

function printSummary(summary: CreateProjectResult): void {
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

function formatGitHubSummary(summary: CreateProjectResult): string {
  if (summary.github === "skipped") {
    return "skipped";
  }

  const visibility = summary.visibility ? ` ${summary.visibility}` : "";
  return summary.github === "pushed" ? `pushed to${visibility} repo` : `created${visibility} repo`;
}

function printError(error: unknown): void {
  logger.plain();

  if (error instanceof Error) {
    logger.error(error.message);
    return;
  }

  logger.error("An unknown error occurred.");
}
