import { constants } from "node:fs";
import { lstat, mkdir, open, readFile, readdir } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { parseDataset } from "../src/domain/catalog";
import { evaluateAttention, reportMarkdown } from "../src/domain/attention";

export function parseArguments(
  args: string[],
  root: string,
): { output?: string; markdown?: string } {
  const options: { output?: string; markdown?: string } = {};
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];
    if (
      (flag !== "--output" && flag !== "--markdown") ||
      !value ||
      value.startsWith("--")
    ) {
      throw new Error(
        "Usage: catalog:report [--output .workshop-output/name.json] [--markdown .workshop-output/name.md]",
      );
    }
    const key = flag === "--output" ? "output" : "markdown";
    if (options[key]) throw new Error(`Duplicate argument: ${flag}`);
    const path = resolve(root, value);
    const extension = key === "output" ? /\.json$/ : /\.md$/;
    if (
      dirname(path) !== resolve(root, ".workshop-output") ||
      !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(basename(path)) ||
      !extension.test(path)
    ) {
      throw new Error(
        `${flag} must be a direct .workshop-output/ file with the correct extension.`,
      );
    }
    options[key] = path;
  }
  return options;
}

async function assertOrdinaryPath(path: string, directory: boolean) {
  try {
    const stat = await lstat(path);
    if (
      stat.isSymbolicLink() ||
      (directory ? !stat.isDirectory() : !stat.isFile())
    ) {
      throw new Error(`Refusing non-ordinary output path: ${path}`);
    }
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT")
      return;
    throw error;
  }
}

export async function runReport(root: string, args: string[]) {
  const options = parseArguments(args, root);
  const dataRoot = join(root, "data");
  const names = await readdir(join(dataRoot, "runbooks"));
  const [catalog, ci, entries] = await Promise.all([
    readFile(join(dataRoot, "catalog.json"), "utf8"),
    readFile(join(dataRoot, "ci-snapshots.json"), "utf8"),
    Promise.all(
      names
        .filter((name) => /^[a-z0-9-]+\.md$/.test(name))
        .map(async (name) => [
          name,
          await readFile(join(dataRoot, "runbooks", name), "utf8"),
        ]),
    ),
  ]);
  const dataset = parseDataset(
    JSON.parse(catalog),
    JSON.parse(ci),
    Object.fromEntries(entries),
  );
  const report = evaluateAttention(dataset);
  const json = `${JSON.stringify(report, null, 2)}\n`;
  const targets = [
    ...(options.output ? [{ path: options.output, content: json }] : []),
    ...(options.markdown
      ? [{ path: options.markdown, content: reportMarkdown(report) }]
      : []),
  ];
  if (targets.length) {
    const outputDirectory = join(root, ".workshop-output");
    await assertOrdinaryPath(outputDirectory, true);
    for (const target of targets) await assertOrdinaryPath(target.path, false);
    await mkdir(outputDirectory, { recursive: true });
    for (const target of targets) {
      const file = await open(
        target.path,
        constants.O_WRONLY |
          constants.O_CREAT |
          constants.O_TRUNC |
          constants.O_NOFOLLOW,
        0o600,
      );
      try {
        await file.writeFile(target.content, "utf8");
      } finally {
        await file.close();
      }
    }
  }
  return json;
}
