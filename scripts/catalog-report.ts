import { fileURLToPath } from "node:url";
import { runReport } from "./report-io";

try {
  const root = fileURLToPath(new URL("../", import.meta.url));
  process.stdout.write(await runReport(root, process.argv.slice(2)));
} catch (error) {
  process.stderr.write(
    `Catalog report failed: ${error instanceof Error ? error.message : "Unknown error"}\n`,
  );
  process.exitCode = 1;
}
