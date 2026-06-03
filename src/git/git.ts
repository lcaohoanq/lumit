import { ExecaError } from "execa";
import { commandExists, runCommand } from "../utils/runCommand.js";

export async function ensureGitAvailable(): Promise<void> {
  if (!(await commandExists("git"))) {
    throw new Error("Git is not installed or is not available in PATH.");
  }
}

export async function initGit(projectDir: string): Promise<void> {
  await ensureGitAvailable();
  await runCommand("git", ["init"], { cwd: projectDir, stdio: "ignore" });
  await runCommand("git", ["add", "."], { cwd: projectDir, stdio: "ignore" });

  try {
    await runCommand("git", ["commit", "-m", "Initial commit"], {
      cwd: projectDir,
      stdio: "ignore"
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
