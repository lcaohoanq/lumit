import path from "node:path";
import { ExecaError } from "execa";
import { getInstallCommand } from "./packageManagers.js";
import { runCommand, commandExists } from "./runCommand.js";
import { getTemplate } from "./templates.js";
import type { CreateProjectCallbacks, CreateProjectOptions, CreateProjectResult } from "./types.js";
import { ensureTargetDirectory, ensureTargetFolderAvailable, validateProjectName } from "./validation.js";

export async function createProject(
  options: CreateProjectOptions,
  callbacks: CreateProjectCallbacks = {}
): Promise<CreateProjectResult> {
  const validation = validateProjectName(options.projectName);
  if (validation !== undefined) {
    throw new Error(validation);
  }

  const template = getTemplate(options.template);
  if (!template) {
    throw new Error(`Unknown template "${options.template}".`);
  }

  await ensureTargetDirectory(options.targetDirectory);
  const projectDir = path.resolve(options.targetDirectory, options.projectName);
  await ensureTargetFolderAvailable(projectDir);
  await ensureBinary(options.packageManager);

  await runStep(callbacks, "create", "Creating project", async () => {
    const command = template.commands[options.packageManager](options.projectName);
    await runCommand(command.file, command.args, {
      cwd: options.targetDirectory,
      onLog: callbacks.onLog,
      logSource: "command"
    });
  });

  if (options.install) {
    await runStep(callbacks, "install", "Installing dependencies", async () => {
      const command = getInstallCommand(options.packageManager);
      await runCommand(command.file, command.args, {
        cwd: projectDir,
        onLog: callbacks.onLog,
        logSource: "command"
      });
    });
  }

  if (options.git) {
    await runStep(callbacks, "git", "Initializing git", async () => {
      await initGit(projectDir, callbacks);
    });
  }

  let githubUrl: string | undefined;
  if (options.github) {
    if (!options.git) {
      throw new Error("GitHub repo creation requires git. Run without --no-git or initialize git manually first.");
    }

    await runStep(callbacks, "github", options.push ? "Creating GitHub repo and pushing code" : "Creating GitHub repo", async () => {
      githubUrl = await createGitHubRepo({
        projectName: options.projectName,
        projectDir,
        visibility: options.visibility,
        push: options.push
      }, callbacks);
    });
  }

  return {
    projectName: options.projectName,
    projectDir,
    templateName: template.name,
    packageManager: options.packageManager,
    install: options.install ? "done" : "skipped",
    git: options.git ? "initialized" : "skipped",
    github: !options.github ? "skipped" : options.push ? "pushed" : "created",
    visibility: options.github ? options.visibility : undefined,
    devCommand: template.devCommand,
    githubUrl
  };
}

async function runStep(
  callbacks: CreateProjectCallbacks,
  id: string,
  label: string,
  action: () => Promise<void>
): Promise<void> {
  callbacks.onStep?.({ id, label, status: "started" });

  try {
    await action();
    callbacks.onStep?.({ id, label, status: "succeeded" });
  } catch (error) {
    callbacks.onStep?.({
      id,
      label,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
    throw error;
  }
}

async function initGit(projectDir: string, callbacks: CreateProjectCallbacks): Promise<void> {
  await ensureBinary("git");
  await runCommand("git", ["init"], { cwd: projectDir, onLog: callbacks.onLog, logSource: "git" });
  await runCommand("git", ["add", "."], { cwd: projectDir, onLog: callbacks.onLog, logSource: "git" });

  try {
    await runCommand("git", ["commit", "-m", "Initial commit"], {
      cwd: projectDir,
      onLog: callbacks.onLog,
      logSource: "git"
    });
  } catch (error) {
    if (error instanceof ExecaError) {
      throw new Error(
        "Git commit failed. Check your Git user.name and user.email config, then try again.\n" +
          "Run: git config --global user.name \"Your Name\" && git config --global user.email \"you@example.com\""
      );
    }

    throw error;
  }
}

async function createGitHubRepo(
  options: {
    projectName: string;
    projectDir: string;
    visibility: "public" | "private";
    push: boolean;
  },
  callbacks: CreateProjectCallbacks
): Promise<string | undefined> {
  await ensureBinary("gh");
  await ensureGitHubAuthenticated();

  const args = [
    "repo",
    "create",
    options.projectName,
    "--source=.",
    "--remote=origin",
    options.visibility === "private" ? "--private" : "--public"
  ];

  if (options.push) {
    args.push("--push");
  }

  const result = await runCommand("gh", args, {
    cwd: options.projectDir,
    onLog: callbacks.onLog,
    logSource: "github"
  });

  return result.output.match(/https:\/\/github\.com\/[^\s]+/)?.[0];
}

async function ensureBinary(name: string): Promise<void> {
  if (!(await commandExists(name))) {
    throw new Error(`${name} is not installed or is not available in PATH.`);
  }
}

async function ensureGitHubAuthenticated(): Promise<void> {
  try {
    await runCommand("gh", ["auth", "status"], { logSource: "github" });
  } catch {
    throw new Error("GitHub CLI is not authenticated. Run `gh auth login`, then try again.");
  }
}
