import { execa, type Options } from "execa";

export interface RunCommandOptions {
  cwd?: string;
  stdio?: Options["stdio"];
}

export async function runCommand(
  file: string,
  args: string[],
  options: RunCommandOptions = {}
): Promise<void> {
  await execa(file, args, {
    cwd: options.cwd,
    stdio: options.stdio ?? "inherit",
    preferLocal: false
  });
}

export async function commandExists(file: string): Promise<boolean> {
  try {
    const args = process.platform === "win32" ? ["/d", "/s", "/c", `where ${file}`] : ["-lc", `command -v ${file}`];
    await execa(process.platform === "win32" ? "cmd" : "sh", args, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function formatCommand(file: string, args: string[]): string {
  return [file, ...args].join(" ");
}
