import type { PackageManager } from "../types/index.js";

export const packageManagers: PackageManager[] = ["npm", "pnpm", "yarn", "bun"];

export function isPackageManager(value: string): value is PackageManager {
  return packageManagers.includes(value as PackageManager);
}

export function getInstallCommand(packageManager: PackageManager): { file: string; args: string[] } {
  if (packageManager === "yarn") {
    return { file: "yarn", args: [] };
  }

  if (packageManager === "bun") {
    return { file: "bun", args: ["install"] };
  }

  return { file: packageManager, args: ["install"] };
}

export function getRunCommand(packageManager: PackageManager, script: string): string {
  if (packageManager === "npm") {
    return `npm run ${script}`;
  }

  if (packageManager === "bun") {
    return `bun run ${script}`;
  }

  return `${packageManager} ${script}`;
}
