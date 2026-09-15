import { describe, expect, it } from "vitest";
import catalog from "../../data/catalog.json";
import ci from "../../data/ci-snapshots.json";
import { filterServices, parseDataset } from "./catalog";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const runbookDirectory = fileURLToPath(
  new URL("../../data/runbooks/", import.meta.url),
);
const runbooks = Object.fromEntries(
  readdirSync(runbookDirectory).map((name) => [
    name,
    readFileSync(`${runbookDirectory}/${name}`, "utf8"),
  ]),
);
const dataset = parseDataset(catalog, ci, runbooks);
function first<T>(items: T[]): T {
  const item = items[0];
  if (!item) throw new Error("Expected a test fixture item");
  return item;
}

describe("committed catalog", () => {
  it("loads eight services and seven real runbook files", () => {
    expect(dataset.catalog.services).toHaveLength(8);
    expect(Object.keys(dataset.runbooks)).toHaveLength(7);
    expect(dataset.ci.asOf).toBe("2026-09-01T09:00:00Z");
  });
  it("keeps missing ownership and runbooks explicit", () => {
    expect(
      dataset.catalog.services.find((item) => item.id === "billing-worker")
        ?.runbook,
    ).toBeNull();
    expect(
      dataset.catalog.services.find((item) => item.id === "event-worker")
        ?.owner,
    ).toBeNull();
  });
  it("rejects unsupported schema versions", () => {
    expect(() =>
      parseDataset({ ...catalog, schemaVersion: 2 }, ci, runbooks),
    ).toThrow();
    expect(() =>
      parseDataset(catalog, { ...ci, schemaVersion: 2 }, runbooks),
    ).toThrow();
  });
  it("rejects duplicate services", () => {
    expect(() =>
      parseDataset(
        {
          ...catalog,
          services: [...catalog.services, first(catalog.services)],
        },
        ci,
        runbooks,
      ),
    ).toThrow("Duplicate service");
  });
  it("rejects duplicate and unknown CI references", () => {
    expect(() =>
      parseDataset(
        catalog,
        { ...ci, snapshots: [...ci.snapshots, first(ci.snapshots)] },
        runbooks,
      ),
    ).toThrow("Duplicate CI");
    const invalid = structuredClone(ci);
    first(invalid.snapshots).serviceId = "unknown-service";
    expect(() => parseDataset(catalog, invalid, runbooks)).toThrow(
      "Unknown service",
    );
  });
  it("rejects a missing CI record instead of assuming success", () => {
    expect(() =>
      parseDataset(
        catalog,
        { ...ci, snapshots: ci.snapshots.slice(1) },
        runbooks,
      ),
    ).toThrow("Missing CI");
  });
  it.each(["success", "unknown", ""])(
    "rejects unsupported state %j",
    (state) => {
      const invalid = structuredClone(ci);
      first(invalid.snapshots).state = state;
      expect(() => parseDataset(catalog, invalid, runbooks)).toThrow();
    },
  );
  it("rejects invalid timestamps", () => {
    expect(() =>
      parseDataset(catalog, { ...ci, asOf: "yesterday" }, runbooks),
    ).toThrow();
  });
  it("rejects runbook traversal", () => {
    const invalid = structuredClone(catalog);
    first(invalid.services).runbook = "../private.md";
    expect(() => parseDataset(invalid, ci, runbooks)).toThrow();
  });
  it("rejects a referenced runbook that is missing or empty", () => {
    expect(() => parseDataset(catalog, ci, {})).toThrow(
      "Missing or empty runbook",
    );
    expect(() =>
      parseDataset(catalog, ci, { ...runbooks, "api-gateway.md": " " }),
    ).toThrow("Missing or empty runbook");
  });
  it("requires null, not blank strings, for absent metadata", () => {
    const invalid = structuredClone(catalog);
    first(invalid.services).owner = "   ";
    expect(() => parseDataset(invalid, ci, runbooks)).toThrow();
  });
  it("rejects a never state with a configured workflow", () => {
    const invalid = structuredClone(ci);
    first(invalid.snapshots).state = "never";
    expect(() => parseDataset(catalog, invalid, runbooks)).toThrow(
      "Unconfigured CI",
    );
  });
  it("requires workflow evidence for configured CI", () => {
    const invalid = structuredClone(ci);
    first(invalid.snapshots).workflow = null;
    expect(() => parseDataset(catalog, invalid, runbooks)).toThrow(
      "Configured CI",
    );
  });
});

describe("catalog search", () => {
  const filters = { query: "", owner: "all", type: "all" };
  it("returns every service for an empty query", () => {
    expect(filterServices(dataset.catalog.services, filters)).toHaveLength(8);
  });
  it("searches case-insensitively and trims whitespace", () => {
    expect(
      filterServices(dataset.catalog.services, {
        ...filters,
        query: "  GATEWAY  ",
      }).map((item) => item.id),
    ).toEqual(["api-gateway", "model-gateway"]);
  });
  it("searches tags and descriptions", () => {
    expect(
      filterServices(dataset.catalog.services, {
        ...filters,
        query: "quotas",
      }).map((item) => item.id),
    ).toEqual(["api-gateway"]);
    expect(
      filterServices(dataset.catalog.services, {
        ...filters,
        query: "onboarding",
      }).map((item) => item.id),
    ).toEqual(["docs-site"]);
  });
  it("combines owner, type, and query", () => {
    expect(
      filterServices(dataset.catalog.services, {
        owner: "team:AI Platform",
        type: "api",
        query: "model",
      }).map((item) => item.id),
    ).toEqual(["model-gateway", "inference-api"]);
  });
  it("filters explicitly unassigned services", () => {
    expect(
      filterServices(dataset.catalog.services, {
        ...filters,
        owner: "unassigned",
      }).map((item) => item.id),
    ).toEqual(["event-worker"]);
  });
  it("distinguishes owner names from filter controls", () => {
    const services = [
      { ...first(dataset.catalog.services), id: "owned-all", owner: "all" },
      {
        ...first(dataset.catalog.services),
        id: "owned-unassigned",
        owner: "unassigned",
      },
      {
        ...first(dataset.catalog.services),
        id: "actually-unassigned",
        owner: null,
      },
    ];
    expect(
      filterServices(services, { ...filters, owner: "team:all" }).map(
        (item) => item.id,
      ),
    ).toEqual(["owned-all"]);
    expect(
      filterServices(services, { ...filters, owner: "team:unassigned" }).map(
        (item) => item.id,
      ),
    ).toEqual(["owned-unassigned"]);
    expect(
      filterServices(services, { ...filters, owner: "unassigned" }).map(
        (item) => item.id,
      ),
    ).toEqual(["actually-unassigned"]);
  });
  it("returns an empty list without mutating source data", () => {
    const before = JSON.stringify(dataset.catalog.services);
    expect(
      filterServices(dataset.catalog.services, {
        ...filters,
        query: "nonexistentservice",
      }),
    ).toEqual([]);
    expect(JSON.stringify(dataset.catalog.services)).toBe(before);
  });
});
