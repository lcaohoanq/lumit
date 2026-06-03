import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type {
  CreateProjectOptions,
  CreateProjectResult,
  EnvironmentReport,
  PackageManager,
  TemplateId,
  Visibility
} from "@luucaohoang/lumit-core";
import "./styles.css";

const defaultOptions = {
  projectName: "",
  targetDirectory: "",
  template: "react-vite-ts" as TemplateId,
  packageManager: "npm" as PackageManager,
  install: true,
  git: true,
  github: false,
  visibility: "private" as Visibility,
  push: true
};

function App(): React.ReactElement {
  const [form, setForm] = useState(defaultOptions);
  const [logs, setLogs] = useState<string[]>([]);
  const [environment, setEnvironment] = useState<EnvironmentReport | undefined>();
  const [result, setResult] = useState<CreateProjectResult | undefined>();
  const [busy, setBusy] = useState(false);
  const canCreate = useMemo(() => form.projectName.trim() && form.targetDirectory.trim() && !busy, [form, busy]);

  useEffect(() => {
    return window.lumit.onProjectEvent((event) => {
      if (event.type === "step") {
        setLogs((current) => [...current, `[${event.payload.status}] ${event.payload.label}`]);
      } else {
        const message = event.payload.message.trim();
        if (message) {
          setLogs((current) => [...current, message]);
        }
      }
    });
  }, []);

  async function selectFolder(): Promise<void> {
    const selected = await window.lumit.selectFolder();
    if (selected) {
      setForm((current) => ({ ...current, targetDirectory: selected }));
    }
  }

  async function checkEnvironment(): Promise<void> {
    setEnvironment(await window.lumit.checkEnvironment());
  }

  async function create(): Promise<void> {
    setBusy(true);
    setLogs([]);
    setResult(undefined);

    try {
      const created = await window.lumit.createProject(form satisfies CreateProjectOptions);
      setResult(created);
    } catch (error) {
      setLogs((current) => [...current, error instanceof Error ? error.message : "Project creation failed."]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app">
      <section className="toolbar">
        <div>
          <h1>Lumit</h1>
          <p>Create starter projects with shared core logic.</p>
        </div>
        <button type="button" onClick={checkEnvironment}>Check Environment</button>
      </section>

      <section className="layout">
        <form className="panel" onSubmit={(event) => { event.preventDefault(); void create(); }}>
          <label>
            Project name
            <input value={form.projectName} onChange={(event) => setForm({ ...form, projectName: event.target.value })} />
          </label>

          <label>
            Location
            <div className="folder-row">
              <input value={form.targetDirectory} onChange={(event) => setForm({ ...form, targetDirectory: event.target.value })} />
              <button type="button" onClick={selectFolder}>Browse</button>
            </div>
          </label>

          <label>
            Template
            <select value={form.template} onChange={(event) => setForm({ ...form, template: event.target.value as TemplateId })}>
              <option value="react-vite-ts">React + Vite + TypeScript</option>
              <option value="react-vite">React + Vite</option>
            </select>
          </label>

          <label>
            Package manager
            <select
              value={form.packageManager}
              onChange={(event) => setForm({ ...form, packageManager: event.target.value as PackageManager })}
            >
              <option value="npm">npm</option>
              <option value="pnpm">pnpm</option>
              <option value="yarn">yarn</option>
              <option value="bun">bun</option>
            </select>
          </label>

          <div className="checks">
            <label><input type="checkbox" checked={form.install} onChange={(event) => setForm({ ...form, install: event.target.checked })} /> Install dependencies</label>
            <label><input type="checkbox" checked={form.git} onChange={(event) => setForm({ ...form, git: event.target.checked })} /> Initialize Git</label>
            <label><input type="checkbox" checked={form.github} onChange={(event) => setForm({ ...form, github: event.target.checked })} /> Create GitHub repo</label>
            <label><input type="checkbox" checked={form.push} onChange={(event) => setForm({ ...form, push: event.target.checked })} /> Push immediately</label>
          </div>

          <label>
            GitHub visibility
            <select
              value={form.visibility}
              disabled={!form.github}
              onChange={(event) => setForm({ ...form, visibility: event.target.value as Visibility })}
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </label>

          <button type="submit" disabled={!canCreate}>{busy ? "Creating..." : "Create Project"}</button>
        </form>

        <section className="panel">
          <h2>Environment</h2>
          {environment ? <EnvironmentView report={environment} /> : <p>No environment check yet.</p>}

          <h2>Logs</h2>
          <pre className="logs">{logs.join("\n") || "Logs will appear here."}</pre>

          {result ? (
            <div className="result">
              <h2>Project created</h2>
              <p>{result.projectDir}</p>
              <div className="actions">
                <button type="button" onClick={() => void window.lumit.openFolder(result.projectDir)}>Open Folder</button>
                <button type="button" onClick={() => void window.lumit.openVSCode(result.projectDir)}>Open VS Code</button>
                {result.githubUrl ? <button type="button" onClick={() => void window.lumit.openUrl(result.githubUrl!)}>Open GitHub</button> : null}
              </div>
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}

function EnvironmentView({ report }: { report: EnvironmentReport }): React.ReactElement {
  const checks = [report.node, ...Object.values(report.packageManagers), report.git, report.githubCli, report.githubAuth];

  return (
    <ul className="env-list">
      {checks.map((check) => (
        <li key={check.name}>
          <span className={check.available ? "ok" : "missing"}>{check.available ? "OK" : "Missing"}</span>
          <strong>{check.name}</strong>
          <span>{check.version ?? check.detail ?? ""}</span>
        </li>
      ))}
    </ul>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
