import { expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import catalog from "../../data/catalog.json";
import ci from "../../data/ci-snapshots.json";
import { parseDataset } from "./catalog";
import { evaluateAttention, reportMarkdown } from "./attention";

const path = fileURLToPath(new URL("../../data/runbooks/", import.meta.url));
const runbooks = Object.fromEntries(
  readdirSync(path).map((name) => [
    name,
    readFileSync(`${path}/${name}`, "utf8"),
  ]),
);
const dataset = parseDataset(catalog, ci, runbooks);

it("finds four services with five ordered reasons", () => {
  const report = evaluateAttention(dataset);
  expect(report.serviceCount).toBe(8);
  expect(report.attentionServiceCount).toBe(4);
  expect(report.reasonCount).toBe(5);
  expect(
    report.findings.map((finding) => [
      finding.serviceId,
      finding.reasons.map((reason) => reason.code),
    ]),
  ).toEqual([
    ["billing-worker", ["ci_failed", "runbook_missing"]],
    ["model-gateway", ["ci_failed"]],
    ["docs-site", ["ci_not_configured"]],
    ["event-worker", ["owner_missing"]],
  ]);
});

it("does not treat passed or running CI as failing", () => {
  const report = evaluateAttention(dataset);
  expect(
    report.findings.find((finding) => finding.serviceId === "eval-runner"),
  ).toBeUndefined();
  expect(
    report.findings
      .find((finding) => finding.serviceId === "event-worker")
      ?.reasons.map((reason) => reason.code),
  ).toEqual(["owner_missing"]);
});

it("returns an explicit empty report when every rule passes", () => {
  const clean = structuredClone(dataset);
  clean.catalog.services = clean.catalog.services.map((service) => ({
    ...service,
    owner: "Platform",
    runbook: "api-gateway.md",
  }));
  clean.ci.snapshots = clean.ci.snapshots.map((snapshot) => ({
    ...snapshot,
    state: "passed",
    workflow: "Test",
    ref: "sample-reference",
  }));
  expect(evaluateAttention(clean).findings).toEqual([]);
  expect(evaluateAttention(clean).reasonCount).toBe(0);
  expect(reportMarkdown(evaluateAttention(clean))).toContain(
    "No attention findings",
  );
});

it("uses rule order before alphabetical order for equal severity", () => {
  const changed = structuredClone(dataset);
  const report = evaluateAttention(changed);
  expect(report.findings.map((item) => item.serviceId)).toEqual([
    "billing-worker",
    "model-gateway",
    "docs-site",
    "event-worker",
  ]);
});

it("ignores input ordering and never mutates the dataset", () => {
  const before = JSON.stringify(dataset);
  const reversed = structuredClone(dataset);
  reversed.catalog.services.reverse();
  reversed.ci.snapshots.reverse();
  expect(evaluateAttention(reversed)).toEqual(evaluateAttention(dataset));
  expect(JSON.stringify(dataset)).toBe(before);
});

it("uses the fixed dataset timestamp and deterministic Markdown", () => {
  const report = evaluateAttention(dataset);
  expect(report.datasetAsOf).toBe("2026-09-01T09:00:00Z");
  expect(evaluateAttention(dataset)).toEqual(report);
  expect(reportMarkdown(report)).toBe(
    reportMarkdown(evaluateAttention(dataset)),
  );
  expect(reportMarkdown(report)).toContain("Services needing attention: 4");
  expect(reportMarkdown(report)).toContain("Reasons: 5");
});
