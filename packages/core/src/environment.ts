import { execa } from "execa";
import { packageManagers } from "./packageManagers.js";
import { commandExists, commandVersion } from "./runCommand.js";
import type { EnvironmentCheck, EnvironmentReport, PackageManager } from "./types.js";

async function checkBinary(name: string, versionArgs: string[] = ["--version"]): Promise<EnvironmentCheck> {
  const available = await commandExists(name);
  if (!available) {
    return {
      name,
      available: false,
      detail: `${name} is not available in PATH.`
    };
  }

  return {
    name,
    available: true,
    version: await commandVersion(name, versionArgs)
  };
}

export async function checkEnvironment(): Promise<EnvironmentReport> {
  const packageManagerEntries = await Promise.all(
    packageManagers.map(async (packageManager) => [packageManager, await checkBinary(packageManager)] as const)
  );

  const githubCli = await checkBinary("gh");
  const githubAuth = await checkGitHubAuth(githubCli.available);

  return {
    node: {
      name: "node",
      available: true,
      version: process.version
    },
    packageManagers: Object.fromEntries(packageManagerEntries) as Record<PackageManager, EnvironmentCheck>,
    git: await checkBinary("git"),
    githubCli,
    githubAuth
  };
}

async function checkGitHubAuth(hasGitHubCli: boolean): Promise<EnvironmentCheck> {
  if (!hasGitHubCli) {
    return {
      name: "gh auth",
      available: false,
      detail: "GitHub CLI is not installed."
    };
  }

  try {
    await execa("gh", ["auth", "status"], { stdio: "ignore" });
    return {
      name: "gh auth",
      available: true,
      detail: "GitHub CLI is authenticated."
    };
  } catch {
    return {
      name: "gh auth",
      available: false,
      detail: "Run `gh auth login` to authenticate."
    };
  }
}
