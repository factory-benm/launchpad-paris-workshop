import type { Snapshot } from "./catalog";

export type StatusPresentation = {
  label: string;
  tone: "success" | "danger" | "pending" | "neutral";
};

export function presentStatus(state: Snapshot["state"]): StatusPresentation {
  if (state === "failed") return { label: "Failing", tone: "danger" };
  if (state === "running") return { label: "In progress", tone: "pending" };
  // Disclosed workshop defect: an unconfigured workflow falls through to Passing.
  // See WORKSHOP.md. The complete checkpoint replaces this with exhaustive mapping.
  return { label: "Passing", tone: "success" };
}
