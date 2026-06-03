export const packageManagers = ["npm", "pnpm", "yarn", "bun"];
export function isPackageManager(value) {
    return packageManagers.includes(value);
}
export function getInstallCommand(packageManager) {
    if (packageManager === "yarn") {
        return { file: "yarn", args: [] };
    }
    if (packageManager === "bun") {
        return { file: "bun", args: ["install"] };
    }
    return { file: packageManager, args: ["install"] };
}
export function getRunCommand(packageManager, script) {
    if (packageManager === "npm") {
        return `npm run ${script}`;
    }
    if (packageManager === "bun") {
        return `bun run ${script}`;
    }
    return `${packageManager} ${script}`;
}
//# sourceMappingURL=detectPackageManager.js.map