import { reactViteTemplates } from "./react-vite.js";
export const templates = [...reactViteTemplates];
export function getTemplate(id) {
    return templates.find((template) => template.id === id);
}
//# sourceMappingURL=index.js.map