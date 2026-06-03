import { type Options } from "execa";
export interface RunCommandOptions {
    cwd?: string;
    stdio?: Options["stdio"];
}
export declare function runCommand(file: string, args: string[], options?: RunCommandOptions): Promise<void>;
export declare function commandExists(file: string): Promise<boolean>;
export declare function formatCommand(file: string, args: string[]): string;
