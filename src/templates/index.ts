import type { ProjectTemplate } from "../types/index.js";
import { reactViteTemplates } from "./react-vite.js";

export const templates: ProjectTemplate[] = [...reactViteTemplates];

export function getTemplate(id: string): ProjectTemplate | undefined {
  return templates.find((template) => template.id === id);
}
