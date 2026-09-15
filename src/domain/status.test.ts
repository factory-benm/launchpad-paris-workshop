import { expect, it } from "vitest";
import type { Snapshot } from "./catalog";
import { presentStatus } from "./status";

const cases: { state: Snapshot["state"]; label: string; tone: string }[] = [
  { state: "passed", label: "Passing", tone: "success" },
  { state: "failed", label: "Failing", tone: "danger" },
  { state: "running", label: "In progress", tone: "pending" },
  { state: "never", label: "Not configured", tone: "neutral" },
];

it.each(cases)("maps $state to $label", ({ state, label, tone }) => {
  expect(presentStatus(state)).toEqual({ label, tone });
});
