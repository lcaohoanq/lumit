import type { PackageManager } from "../types/index.js";
export declare const packageManagers: PackageManager[];
export declare function isPackageManager(value: string): value is PackageManager;
export declare function getInstallCommand(packageManager: PackageManager): {
    file: string;
    args: string[];
};
export declare function getRunCommand(packageManager: PackageManager, script: string): string;
