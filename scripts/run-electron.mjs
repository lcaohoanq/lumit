import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve, join } from "node:path";

const require = createRequire(import.meta.url);
const electronPackagePath = require.resolve("electron/package.json");
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
