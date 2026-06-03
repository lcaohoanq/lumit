export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export type TemplateId = "react-vite" | "react-vite-ts";

export type Visibility = "public" | "private";

export type StepStatus = "started" | "succeeded" | "failed";

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

export interface CreateProjectOptions {
  projectName: string;
  targetDirectory: string;
  template: TemplateId;
  packageManager: PackageManager;
  install: boolean;
  git: boolean;
  github: boolean;
  visibility: Visibility;
  push: boolean;
}

export interface ProjectStepEvent {
  id: string;
  label: string;
  status: StepStatus;
  error?: string;
}

export interface ProjectLogEvent {
  source: "core" | "command" | "git" | "github";
  message: string;
}

export interface CreateProjectCallbacks {
  onStep?: (event: ProjectStepEvent) => void;
  onLog?: (event: ProjectLogEvent) => void;
}

export interface CreateProjectResult {
  projectName: string;
  projectDir: string;
  templateName: string;
  packageManager: PackageManager;
  install: "done" | "skipped";
  git: "initialized" | "skipped";
  github: "skipped" | "created" | "pushed";
  visibility?: Visibility;
  devCommand: string;
  githubUrl?: string;
}

export interface EnvironmentCheck {
  name: string;
  available: boolean;
  version?: string;
  detail?: string;
}

export interface EnvironmentReport {
  node: EnvironmentCheck;
  packageManagers: Record<PackageManager, EnvironmentCheck>;
  git: EnvironmentCheck;
  githubCli: EnvironmentCheck;
  githubAuth: EnvironmentCheck;
}
