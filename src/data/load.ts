import catalog from "../../data/catalog.json";
import ci from "../../data/ci-snapshots.json";
import { parseDataset } from "../domain/catalog";

const files = import.meta.glob<string>("../../data/runbooks/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});
const runbooks = Object.fromEntries(
  Object.entries(files).map(([path, content]) => [
    path.split("/").pop() ?? path,
    content,
  ]),
);

export function loadDataset() {
  return parseDataset(catalog, ci, runbooks);
}
