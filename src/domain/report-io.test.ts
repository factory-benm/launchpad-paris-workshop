import { afterEach, expect, it } from "vitest";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { runReport, parseArguments } from "../../scripts/report-io";
import { evaluateAttention } from "./attention";
import { parseDataset } from "./catalog";
import catalog from "../../data/catalog.json";
import ci from "../../data/ci-snapshots.json";

const roots: string[] = [];
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "launchpad-test-"));
  roots.push(root);
  await mkdir(join(root, "data/runbooks"), { recursive: true });
  const runbooks: Record<string, string> = {};
  for (const service of catalog.services) {
    if (service.runbook) {
      runbooks[service.runbook] = `# ${service.name}\n\nExample runbook.`;
      await writeFile(
        join(root, "data/runbooks", service.runbook),
        runbooks[service.runbook] ?? "",
      );
    }
  }
  await writeFile(join(root, "data/catalog.json"), JSON.stringify(catalog));
  await writeFile(join(root, "data/ci-snapshots.json"), JSON.stringify(ci));
  return { root, dataset: parseDataset(catalog, ci, runbooks) };
}
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

it("emits exactly the shared evaluator report without writing by default", async () => {
  const { root, dataset } = await fixture();
  const first = await runReport(root, []);
  expect(JSON.parse(first)).toEqual(evaluateAttention(dataset));
  expect(await runReport(root, [])).toBe(first);
  expect(await readdir(root)).toEqual(["data"]);
});

it("writes deterministic JSON and Markdown without mutating input", async () => {
  const { root } = await fixture();
  const before = await readFile(join(root, "data/catalog.json"), "utf8");
  const args = [
    "--output",
    ".workshop-output/report.json",
    "--markdown",
    ".workshop-output/report.md",
  ];
  const output = await runReport(root, args);
  expect(
    await readFile(join(root, ".workshop-output/report.json"), "utf8"),
  ).toBe(output);
  const markdown = await readFile(
    join(root, ".workshop-output/report.md"),
    "utf8",
  );
  expect(markdown).toContain("Reasons: 5");
  await runReport(root, args);
  expect(await readFile(join(root, ".workshop-output/report.md"), "utf8")).toBe(
    markdown,
  );
  expect(await readFile(join(root, "data/catalog.json"), "utf8")).toBe(before);
});

it.each([
  ["--bogus"],
  ["--output"],
  ["--output", "../outside.json"],
  ["--output", "data/catalog.json"],
  ["--output", ".workshop-output/report.md"],
  ["--markdown", ".workshop-output/report.json"],
  [
    "--output",
    ".workshop-output/a.json",
    "--output",
    ".workshop-output/b.json",
  ],
  ["--output", ".workshop-output/nested/report.json"],
])("rejects invalid arguments %j", (...args) => {
  expect(() => parseArguments(args, "/tmp/launchpad")).toThrow();
});

it("does not create output files when data is invalid", async () => {
  const { root } = await fixture();
  await writeFile(join(root, "data/catalog.json"), '{"schemaVersion": 2}');
  await expect(
    runReport(root, ["--output", ".workshop-output/report.json"]),
  ).rejects.toThrow();
  expect(await readdir(root)).toEqual(["data"]);
});

it("refuses a symlinked output directory", async () => {
  const { root } = await fixture();
  await mkdir(join(root, "elsewhere"));
  await symlink(join(root, "elsewhere"), join(root, ".workshop-output"));
  await expect(
    runReport(root, ["--output", ".workshop-output/report.json"]),
  ).rejects.toThrow("non-ordinary");
  expect(await readdir(join(root, "elsewhere"))).toEqual([]);
});

it("refuses a symlinked output file", async () => {
  const { root } = await fixture();
  await mkdir(join(root, ".workshop-output"));
  const target = join(root, "data/catalog.json");
  const before = await readFile(target, "utf8");
  await symlink(target, join(root, ".workshop-output/report.json"));
  await expect(
    runReport(root, ["--output", ".workshop-output/report.json"]),
  ).rejects.toThrow("non-ordinary");
  expect(await readFile(target, "utf8")).toBe(before);
});

it("exits zero with findings and nonzero for invalid CLI arguments", () => {
  const script = fileURLToPath(
    new URL("../../scripts/catalog-report.ts", import.meta.url),
  );
  const cwd = fileURLToPath(new URL("../../", import.meta.url));
  const success = spawnSync(process.execPath, ["--import", "tsx", script], {
    cwd,
    encoding: "utf8",
  });
  expect(success.status).toBe(0);
  expect(JSON.parse(success.stdout).attentionServiceCount).toBe(4);
  const failure = spawnSync(
    process.execPath,
    ["--import", "tsx", script, "--unknown"],
    { cwd, encoding: "utf8" },
  );
  expect(failure.status).toBe(1);
  expect(failure.stderr).toContain("Catalog report failed");
});
