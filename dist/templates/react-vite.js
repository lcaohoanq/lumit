const reactVite = {
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
const reactViteTs = {
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
export const reactViteTemplates = [reactVite, reactViteTs];
//# sourceMappingURL=react-vite.js.map