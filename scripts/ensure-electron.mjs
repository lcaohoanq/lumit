import { downloadArtifact } from "@electron/get";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const electronPackagePath = require.resolve("electron/package.json");
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

const extract = spawnSync("tar", ["-xf", zipPath, "-C", distDir], {
  stdio: "inherit",
  shell: process.platform === "win32"
});

if (extract.status !== 0) {
  throw new Error("Unable to extract Electron binary. Make sure `tar` is available on PATH.");
}

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
