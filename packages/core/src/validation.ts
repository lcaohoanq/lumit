import fs from "fs-extra";

const projectNamePattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export function validateProjectName(projectName: string): string | undefined {
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

export async function ensureTargetFolderAvailable(projectDir: string): Promise<void> {
  if (await fs.pathExists(projectDir)) {
    throw new Error(`Project folder already exists: ${projectDir}`);
  }
}

export async function ensureTargetDirectory(targetDirectory: string): Promise<void> {
  if (!targetDirectory.trim()) {
    throw new Error("Target directory is required.");
  }

  const stat = await fs.stat(targetDirectory).catch(() => undefined);
  if (!stat?.isDirectory()) {
    throw new Error(`Target directory does not exist: ${targetDirectory}`);
  }
}
