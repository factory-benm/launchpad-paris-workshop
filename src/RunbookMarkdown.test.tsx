import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RunbookMarkdown } from "./RunbookMarkdown";

it("renders real Markdown headings and lists", () => {
  const html = renderToStaticMarkup(
    <RunbookMarkdown
      content={"# Runbook\n\n- Check the data\n- Run the tests"}
    />,
  );
  expect(html).toContain("<h1>Runbook</h1>");
  expect(html).toContain("<li>Run the tests</li>");
});

it("omits raw HTML, external images, and unsafe links", () => {
  const html = renderToStaticMarkup(
    <RunbookMarkdown
      content={
        '<script>alert("bad")</script>\n\n![tracker](https://example.com/pixel)\n\n[unsafe](javascript:alert)\n\n[external](https://example.com)'
      }
    />,
  );
  expect(html).not.toContain("<script");
  expect(html).not.toContain("<img");
  expect(html).not.toContain("javascript:");
  expect(html).not.toContain("href=");
  expect(html).toContain("Image omitted: tracker");
});

it("allows local portal routes", () => {
  const html = renderToStaticMarkup(
    <RunbookMarkdown content="[Catalog](#/)" />,
  );
  expect(html).toContain('href="#/"');
});
