import { downloadArtifact } from "@electron/get";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const electronPackagePath = resolvePackage("electron/package.json");
const electronDir = dirname(electronPackagePath);
const electronPackage = JSON.parse(readFileSync(electronPackagePath, "utf8"));
const platformPath = getPlatformPath();

if (isInstalled()) {
  process.exit(0);
}

const platform = process.env.ELECTRON_INSTALL_PLATFORM || process.env.npm_config_platform || process.platform;
const arch = process.env.ELECTRON_INSTALL_ARCH || process.env.npm_config_arch || process.arch;
const zipPath = await downloadArtifact({
  version: electronPackage.version,
  artifactName: "electron",
  platform,
  arch,
  force: process.env.force_no_cache === "true"
});

const distDir = join(electronDir, "dist");
rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

extractArchive(zipPath, distDir);

writeFileSync(join(electronDir, "path.txt"), platformPath);

if (!isInstalled()) {
  throw new Error("Electron binary repair completed but the executable is still missing.");
}

function isInstalled() {
  try {
    const version = readFileSync(join(electronDir, "dist", "version"), "utf8").replace(/^v/, "").trim();
    const pathText = readFileSync(join(electronDir, "path.txt"), "utf8").trim();
    return version === electronPackage.version && pathText === platformPath && existsSync(join(electronDir, "dist", platformPath));
  } catch {
    return false;
  }
}

function getPlatformPath() {
  switch (process.platform) {
    case "darwin":
      return "Electron.app/Contents/MacOS/Electron";
    case "freebsd":
    case "openbsd":
    case "linux":
      return "electron";
    case "win32":
      return "electron.exe";
    default:
      throw new Error(`Electron builds are not available on platform: ${process.platform}`);
  }
}

function extractArchive(zipPath, distDir) {
  const tar = process.platform === "win32"
    ? join(process.env.SystemRoot ?? "C:\\Windows", "System32", "tar.exe")
    : "tar";

  const result = spawnSync(tar, ["-xf", zipPath, "-C", distDir], {
    stdio: "inherit",
    shell: false
  });

  if (result.status !== 0) {
    throw new Error(`Unable to extract Electron binary with ${tar}.`);
  }
}

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
