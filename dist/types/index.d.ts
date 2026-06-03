export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";
export type TemplateId = "react-vite" | "react-vite-ts";
export type Visibility = "public" | "private";
export interface TemplateCommand {
    file: string;
    args: string[];
}
export interface ProjectTemplate {
    id: TemplateId;
    name: string;
    framework: string;
    commands: Record<PackageManager, (projectName: string) => TemplateCommand>;
    devCommand: string;
}
export interface CreateOptions {
    template?: string;
    packageManager?: string;
    install: boolean;
    git: boolean;
    github?: boolean;
    private?: boolean;
    public?: boolean;
}
export interface ResolvedCreateOptions {
    projectName: string;
    template: ProjectTemplate;
    packageManager: PackageManager;
    install: boolean;
    git: boolean;
    github: boolean;
    visibility: Visibility;
    push: boolean;
}
export interface CreateSummary {
    projectName: string;
    templateName: string;
    packageManager: PackageManager;
    install: "done" | "skipped";
    git: "initialized" | "skipped";
    github: "skipped" | "created" | "pushed";
    visibility?: Visibility;
    devCommand: string;
}
