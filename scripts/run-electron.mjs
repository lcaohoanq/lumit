import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const electronPackagePath = resolvePackage("electron/package.json");
const electronDir = dirname(electronPackagePath);
const electronPathFile = join(electronDir, "path.txt");

if (!existsSync(electronPathFile)) {
  throw new Error("Electron path.txt is missing. Run `bun run repair:electron` first.");
}

const electronExecutable = join(electronDir, "dist", readFileSync(electronPathFile, "utf8").trim());
const appEntry = process.argv[2];

if (!appEntry) {
  throw new Error("Missing Electron app entry path.");
}

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronExecutable, [resolve(process.cwd(), appEntry)], {
  cwd: process.cwd(),
  env,
  stdio: "inherit"
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

function resolvePackage(specifier) {
  const requirePaths = [
    join(process.cwd(), "package.json"),
    resolve(scriptDir, "../packages/desktop/package.json"),
    resolve(scriptDir, "../package.json")
  ];

  for (const requirePath of requirePaths) {
    if (!existsSync(requirePath)) {
      continue;
    }

    const require = createRequire(requirePath);
    try {
      return require.resolve(specifier);
    } catch (error) {
      if (error?.code !== "MODULE_NOT_FOUND") {
        throw error;
      }
    }
  }

  throw new Error(`Cannot resolve ${specifier}. Run this script from the desktop package or install dependencies first.`);
}
