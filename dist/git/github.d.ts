import type { Visibility } from "../types/index.js";
export declare function ensureGitHubCliAvailable(): Promise<void>;
export declare function ensureGitHubCliAuthenticated(): Promise<void>;
export declare function createGitHubRepo(options: {
    projectName: string;
    projectDir: string;
    visibility: Visibility;
    push: boolean;
}): Promise<void>;
