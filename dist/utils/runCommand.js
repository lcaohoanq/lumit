import { execa } from "execa";
export async function runCommand(file, args, options = {}) {
    await execa(file, args, {
        cwd: options.cwd,
        stdio: options.stdio ?? "inherit",
        preferLocal: false
    });
}
export async function commandExists(file) {
    try {
        const args = process.platform === "win32" ? ["/d", "/s", "/c", `where ${file}`] : ["-lc", `command -v ${file}`];
        await execa(process.platform === "win32" ? "cmd" : "sh", args, { stdio: "ignore" });
        return true;
    }
    catch {
        return false;
    }
}
export function formatCommand(file, args) {
    return [file, ...args].join(" ");
}
//# sourceMappingURL=runCommand.js.map