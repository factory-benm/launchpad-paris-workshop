import { z } from "zod";

const identifier = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const text = z.string().trim().min(1);
const serviceSchema = z.object({
  id: identifier,
  name: text,
  description: text,
  owner: text.nullable(),
  type: z.enum(["api", "worker", "library", "website"]),
  tags: z.array(text),
  runbook: z
    .string()
    .regex(/^[a-z0-9-]+\.md$/)
    .nullable(),
});
const snapshotSchema = z.object({
  serviceId: identifier,
  state: z.enum(["passed", "failed", "running", "never"]),
  workflow: text.nullable(),
  ref: text.nullable(),
  summary: text,
});
const catalogSchema = z.object({
  schemaVersion: z.literal(1),
  name: text,
  description: text,
  services: z.array(serviceSchema).min(1),
});
const snapshotsSchema = z.object({
  schemaVersion: z.literal(1),
  asOf: z.iso.datetime(),
  snapshots: z.array(snapshotSchema),
});

export type Service = z.infer<typeof serviceSchema>;
export type Snapshot = z.infer<typeof snapshotSchema>;
export type Catalog = z.infer<typeof catalogSchema>;
export type SnapshotFile = z.infer<typeof snapshotsSchema>;
export type Dataset = {
  catalog: Catalog;
  ci: SnapshotFile;
  runbooks: Record<string, string>;
};

export function parseDataset(
  catalogInput: unknown,
  ciInput: unknown,
  runbooks: Record<string, string>,
): Dataset {
  const catalog = catalogSchema.parse(catalogInput);
  const ci = snapshotsSchema.parse(ciInput);
  const ids = new Set<string>();
  for (const service of catalog.services) {
    if (ids.has(service.id))
      throw new Error(`Duplicate service: ${service.id}`);
    ids.add(service.id);
    if (service.runbook && !runbooks[service.runbook]?.trim()) {
      throw new Error(`Missing or empty runbook: ${service.runbook}`);
    }
  }
  const snapshots = new Set<string>();
  for (const snapshot of ci.snapshots) {
    if (!ids.has(snapshot.serviceId))
      throw new Error(`Unknown service in CI: ${snapshot.serviceId}`);
    if (snapshots.has(snapshot.serviceId))
      throw new Error(`Duplicate CI snapshot: ${snapshot.serviceId}`);
    snapshots.add(snapshot.serviceId);
    if (
      snapshot.state === "never" &&
      (snapshot.workflow !== null || snapshot.ref !== null)
    ) {
      throw new Error(
        `Unconfigured CI must have null workflow and ref: ${snapshot.serviceId}`,
      );
    }
    if (snapshot.state !== "never" && (!snapshot.workflow || !snapshot.ref)) {
      throw new Error(
        `Configured CI needs a workflow and ref: ${snapshot.serviceId}`,
      );
    }
  }
  for (const id of ids) {
    if (!snapshots.has(id)) throw new Error(`Missing CI snapshot: ${id}`);
  }
  return { catalog, ci, runbooks };
}

export function getSnapshot(dataset: Dataset, serviceId: string): Snapshot {
  const snapshot = dataset.ci.snapshots.find(
    (item) => item.serviceId === serviceId,
  );
  if (!snapshot) throw new Error(`Missing CI snapshot: ${serviceId}`);
  return snapshot;
}

export function filterServices(
  services: Service[],
  filters: { query: string; owner: string; type: string },
): Service[] {
  const query = filters.query.trim().toLowerCase();
  return services.filter((service) => {
    const searchable = [
      service.id,
      service.name,
      service.description,
      service.owner ?? "",
      ...service.tags,
    ]
      .join(" ")
      .toLowerCase();
    return (
      searchable.includes(query) &&
      (filters.owner === "all" ||
        (filters.owner === "unassigned"
          ? service.owner === null
          : service.owner === filters.owner)) &&
      (filters.type === "all" || service.type === filters.type)
    );
  });
}
