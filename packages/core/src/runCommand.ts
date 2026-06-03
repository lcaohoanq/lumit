import { execa } from "execa";
import type { ProjectLogEvent } from "./types.js";

export interface RunCommandOptions {
  cwd?: string;
  onLog?: (event: ProjectLogEvent) => void;
  logSource?: ProjectLogEvent["source"];
}

export interface RunCommandResult {
  output: string;
}

export async function runCommand(file: string, args: string[], options: RunCommandOptions = {}): Promise<RunCommandResult> {
  const output: string[] = [];
  const subprocess = execa(file, args, {
    cwd: options.cwd,
    stdout: "pipe",
    stderr: "pipe",
    preferLocal: false
  });

  const collect = (chunk: Buffer | string): void => {
    const message = chunk.toString();
    output.push(message);
    options.onLog?.({
      source: options.logSource ?? "command",
      message
    });
  };

  subprocess.stdout?.on("data", collect);
  subprocess.stderr?.on("data", collect);

  await subprocess;

  return {
    output: output.join("")
  };
}

export async function commandExists(file: string): Promise<boolean> {
  try {
    if (process.platform === "win32") {
      await execa("where", [file], { stdio: "ignore" });
    } else {
      await execa("sh", ["-lc", `command -v ${file}`], { stdio: "ignore" });
    }

    return true;
  } catch {
    return false;
  }
}

export async function commandVersion(file: string, args: string[] = ["--version"]): Promise<string | undefined> {
  try {
    const result = await execa(file, args, { stdout: "pipe", stderr: "pipe" });
    return result.stdout.trim() || result.stderr.trim() || undefined;
  } catch {
    return undefined;
  }
}
