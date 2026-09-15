import type { Snapshot } from "./catalog";

export type StatusPresentation = {
  label: string;
  tone: "success" | "danger" | "pending" | "neutral";
};

const presentation: Record<Snapshot["state"], StatusPresentation> = {
  passed: { label: "Passing", tone: "success" },
  failed: { label: "Failing", tone: "danger" },
  running: { label: "In progress", tone: "pending" },
  never: { label: "Not configured", tone: "neutral" },
};

export function presentStatus(state: Snapshot["state"]): StatusPresentation {
  return presentation[state];
}
