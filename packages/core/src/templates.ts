import type { ProjectTemplate, TemplateId } from "./types.js";

const reactVite: ProjectTemplate = {
  id: "react-vite",
  name: "React + Vite",
  framework: "react",
  commands: {
    npm: (projectName) => ({
      file: "npm",
      args: ["create", "vite@latest", projectName, "--", "--template", "react"]
    }),
    pnpm: (projectName) => ({
      file: "pnpm",
      args: ["create", "vite", projectName, "--template", "react"]
    }),
    yarn: (projectName) => ({
      file: "yarn",
      args: ["create", "vite", projectName, "--template", "react"]
    }),
    bun: (projectName) => ({
      file: "bun",
      args: ["create", "vite", projectName, "--template", "react"]
    })
  },
  devCommand: "dev"
};

const reactViteTs: ProjectTemplate = {
  id: "react-vite-ts",
  name: "React + Vite + TypeScript",
  framework: "react",
  commands: {
    npm: (projectName) => ({
      file: "npm",
      args: ["create", "vite@latest", projectName, "--", "--template", "react-ts"]
    }),
    pnpm: (projectName) => ({
      file: "pnpm",
      args: ["create", "vite", projectName, "--template", "react-ts"]
    }),
    yarn: (projectName) => ({
      file: "yarn",
      args: ["create", "vite", projectName, "--template", "react-ts"]
    }),
    bun: (projectName) => ({
      file: "bun",
      args: ["create", "vite", projectName, "--template", "react-ts"]
    })
  },
  devCommand: "dev"
};

export const templates: ProjectTemplate[] = [reactVite, reactViteTs];

export function getTemplate(id: string): ProjectTemplate | undefined {
  return templates.find((template) => template.id === id);
}

export function isTemplateId(value: string): value is TemplateId {
  return templates.some((template) => template.id === value);
}
