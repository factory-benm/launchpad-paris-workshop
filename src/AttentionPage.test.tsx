import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { loadDataset } from "./data/load";
import { evaluateAttention } from "./domain/attention";
import { AttentionPage } from "./AttentionPage";

it("renders the shared evaluator's counts and every ordered reason", () => {
  const dataset = loadDataset();
  const report = evaluateAttention(dataset);
  const html = renderToStaticMarkup(<AttentionPage dataset={dataset} />);
  expect(html).toContain('data-testid="attention-count">04<');
  expect(html).toContain('data-testid="reason-count">05<');
  expect(
    [...html.matchAll(/data-service-id="([^"]+)"/g)].map((match) => match[1]),
  ).toEqual(report.findings.map((finding) => finding.serviceId));
  expect(
    [...html.matchAll(/data-reason-code="([^"]+)"/g)].map((match) => match[1]),
  ).toEqual(
    report.findings.flatMap((finding) =>
      finding.reasons.map((reason) => reason.code),
    ),
  );
});
