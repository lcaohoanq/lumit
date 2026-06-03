Refactor my existing published npm CLI project into a monorepo with shared core logic and a desktop app.

Current state:

* I already have a working CLI published to npm.
* The CLI is in a GitHub repository.
* The CLI creates starter projects, initializes git, commits, optionally creates GitHub repo and pushes.

Goal:

* Keep the existing CLI working.
* Extract all project creation logic into a reusable `core` package.
* Make the CLI call the core package.
* Add an Electron + React + TypeScript desktop app that calls the same core package.
* Desktop app should provide a click-based UI for users who do not like CLI.

Target monorepo:

packages/
core/
cli/
desktop/

Core must export:

createProject(options, callbacks)
checkEnvironment()

Core responsibilities:

* validate project name
* check target folder
* create React Vite / React Vite TS project
* install dependencies
* init git
* commit
* create GitHub repo using gh
* push
* stream logs and steps through callbacks
* support npm/pnpm/yarn/bun

CLI responsibilities:

* parse terminal options
* interactive prompts if needed
* call core
* keep old command behavior
* add `lumit doctor`

Desktop responsibilities:

* Electron + React + TypeScript
* form with project name, location, template, package manager, install, git, github, visibility, push
* folder picker
* realtime logs
* environment checker
* result screen with open folder / open VS Code / open GitHub
* secure IPC with contextBridge
* no nodeIntegration in renderer

Important:

* Do not duplicate core logic in desktop.
* Do not break the existing npm CLI command.
* Do not overwrite existing folders.
* Do not build shell commands by string concatenation.
* Validate all user input.
* Keep everything cross-platform.

Please inspect the current repository first, then perform the refactor and implementation. Update README and scripts. Provide final report with run commands and test checklist.
