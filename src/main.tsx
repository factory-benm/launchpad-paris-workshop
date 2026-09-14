import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { loadDataset } from "./data/load";
import "./styles.css";

function Root() {
  try {
    return <App dataset={loadDataset()} />;
  } catch (error) {
    return (
      <main className="data-error">
        <span className="eyebrow">DATA VALIDATION</span>
        <h1>The catalog couldn't load.</h1>
        <p>
          Check the committed JSON and runbook files, fix the error, then
          reload.
        </p>
        <pre>
          {error instanceof Error ? error.message : "Unknown data error"}
        </pre>
      </main>
    );
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing application root");
createRoot(root).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
