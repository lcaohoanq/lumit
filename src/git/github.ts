import { execa } from "execa";
import type { Visibility } from "../types/index.js";
import { commandExists, runCommand } from "../utils/runCommand.js";

export async function ensureGitHubCliAvailable(): Promise<void> {
  if (!(await commandExists("gh"))) {
    throw new Error("GitHub CLI is not installed or is not available in PATH. Install it from https://cli.github.com/.");
  }
}

export async function ensureGitHubCliAuthenticated(): Promise<void> {
  try {
    await execa("gh", ["auth", "status"], { stdio: "ignore" });
  } catch {
    throw new Error("GitHub CLI is not authenticated. Run `gh auth login`, then try again.");
  }
}

export async function createGitHubRepo(options: {
  projectName: string;
  projectDir: string;
  visibility: Visibility;
  push: boolean;
}): Promise<void> {
  await ensureGitHubCliAvailable();
  await ensureGitHubCliAuthenticated();

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

  await runCommand("gh", args, {
    cwd: options.projectDir,
    stdio: "ignore"
  });
}
