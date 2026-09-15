import { expect, test as base, type Page } from "@playwright/test";
import catalog from "../data/catalog.json" with { type: "json" };
import ciSnapshots from "../data/ci-snapshots.json" with { type: "json" };

// Install the guard before the first navigation in every isolated test context.
// Block unexpected requests instead of contacting an external host to test it.
const test = base.extend<{ browserHealth: void }>({
  browserHealth: [
    async ({ context, page }, use) => {
      const unexpectedRequests: string[] = [];
      const pageErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      await context.route("**/*", async (route) => {
        const url = route.request().url();
        if (new URL(url).origin === "http://127.0.0.1:4174") {
          await route.continue();
        } else {
          unexpectedRequests.push(url);
          await route.abort("blockedbyclient");
        }
      });
      await context.routeWebSocket("**/*", (socket) => {
        unexpectedRequests.push(socket.url());
        socket.close();
      });

      await use();

      expect
        .soft(unexpectedRequests, "No non-preview requests or sockets")
        .toEqual([]);
      expect.soft(pageErrors, "No uncaught browser errors").toEqual([]);
    },
    { auto: true },
  ],
});

function catalogRow(page: Page, serviceId: string) {
  return page.locator("tbody tr").filter({
    has: page.locator(`a.service-link[href="#/services/${serviceId}"]`),
  });
}

function detailHeading(page: Page, name: string) {
  // Markdown runbooks also contain an h1 with the service name.
  return page.locator(".service-detail-title").getByRole("heading", {
    name,
    exact: true,
    level: 1,
  });
}

test("catalog search, combined filters, and empty-state reset", async ({
  page,
}) => {
  await page.goto("/#/");
  await expect(
    page.getByRole("heading", { name: "Service catalog", exact: true }),
  ).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(8);
  await expect(
    page.getByText("Showing 8 of 8 services", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("footer")).toContainText(
    "Repository snapshot · sample data",
  );
  await expect(page.locator("footer")).toContainText(
    "Snapshot: 2026-09-01 09:00:00 UTC · Not live CI",
  );

  const search = page.getByRole("textbox", { name: "Search services" });
  const owner = page.getByRole("combobox", { name: "Filter by owner" });
  const type = page.getByRole("combobox", { name: "Filter by type" });
  await search.fill("gateway");
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await expect(catalogRow(page, "api-gateway")).toBeVisible();
  await expect(catalogRow(page, "model-gateway")).toBeVisible();
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(page.locator("tbody tr")).toHaveCount(8);

  await owner.selectOption({ label: "AI Platform" });
  await type.selectOption("api");
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await expect(catalogRow(page, "model-gateway")).toBeVisible();
  await expect(catalogRow(page, "inference-api")).toBeVisible();
  await search.fill("no-such-service");
  await expect(
    page.getByRole("heading", { name: "No services match these filters." }),
  ).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(0);
  await expect(
    page.getByText("Showing 0 of 8 services", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(search).toHaveValue("");
  await expect(owner).toHaveValue("all");
  await expect(type).toHaveValue("all");
  await expect(page.locator("tbody tr")).toHaveCount(8);

  await owner.selectOption("unassigned");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(
    catalogRow(page, "event-worker").getByRole("cell").nth(1),
  ).toHaveText("Unassigned");
});

test("service and runbook links render Markdown and survive direct-link reload", async ({
  page,
}) => {
  await page.goto("/#/");
  await page
    .getByRole("link", { name: "Read Model Gateway runbook", exact: true })
    .click();
  await expect(page).toHaveURL(/#\/services\/model-gateway$/);
  await expect(detailHeading(page, "Model Gateway")).toBeVisible();
  const runbook = page.getByRole("article");
  await expect(
    runbook.getByRole("heading", {
      name: "Investigation sequence",
      exact: true,
    }),
  ).toBeVisible();
  await expect(runbook.locator("ol > li")).toHaveText([
    "Identify which adapter changed.",
    "Compare its output with the documented response schema.",
    "Add the rejected response to the contract-test fixtures.",
    "Verify both the success and provider-error paths.",
  ]);

  await page.reload();
  await expect(detailHeading(page, "Model Gateway")).toBeVisible();
  await expect(runbook).toContainText(
    "It is a teaching example, not an active provider outage.",
  );
  await page.getByRole("link", { name: "All services", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(8);
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Runbooks", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Runbooks", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".runbook-list > a")).toHaveCount(8);
  await page
    .locator('.runbook-list a[href="#/services/model-gateway"]')
    .click();
  await expect(detailHeading(page, "Model Gateway")).toBeVisible();
});

test("missing runbook and owner are explicit on service details", async ({
  page,
}) => {
  await page.goto("/#/runbooks");
  const billing = page.locator(
    '.runbook-list a[href="#/services/billing-worker"]',
  );
  await expect(billing).toContainText("Missing runbook");
  await billing.click();
  await expect(detailHeading(page, "Billing Worker")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "This service needs a runbook.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("article")).toContainText("No file registered");

  await page.goto("/#/services/event-worker");
  await expect(detailHeading(page, "Event Worker")).toBeVisible();
  await expect(
    page.locator(".detail-metadata").getByText("Unassigned", { exact: true }),
  ).toBeVisible();
});

test("source navigation shows the actual committed JSON and reloads directly", async ({
  page,
}) => {
  await page.goto("/#/services/model-gateway");
  await page.getByRole("link", { name: "Inspect JSON", exact: true }).click();
  await expect(page).toHaveURL(/#\/source$/);
  const tabs = page.getByRole("group", { name: "Data file" });
  const catalogTab = tabs.getByRole("button", {
    name: "catalog.json",
    exact: true,
  });
  const ciTab = tabs.getByRole("button", {
    name: "ci-snapshots.json",
    exact: true,
  });
  const source = page.locator("pre.code-view > code");
  await expect(catalogTab).toHaveAttribute("aria-pressed", "true");
  await expect(source).toHaveText(JSON.stringify(catalog, null, 2));
  await ciTab.click();
  await expect(ciTab).toHaveAttribute("aria-pressed", "true");
  await expect(catalogTab).toHaveAttribute("aria-pressed", "false");
  await expect(source).toHaveText(JSON.stringify(ciSnapshots, null, 2));
  await catalogTab.click();
  await expect(source).toHaveText(JSON.stringify(catalog, null, 2));
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Repository data", exact: true }),
  ).toBeVisible();
  await expect(source).toHaveText(JSON.stringify(catalog, null, 2));
});

// These assert the complete checkpoint, including the deliberate never-state fix.
for (const { id, name, raw, label } of [
  { id: "api-gateway", name: "API Gateway", raw: "passed", label: "Passing" },
  {
    id: "model-gateway",
    name: "Model Gateway",
    raw: "failed",
    label: "Failing",
  },
  {
    id: "eval-runner",
    name: "Eval Runner",
    raw: "running",
    label: "In progress",
  },
  { id: "docs-site", name: "Docs Site", raw: "never", label: "Not configured" },
]) {
  test(`${raw} displays ${label} in catalog and detail`, async ({ page }) => {
    await page.goto("/#/");
    const row = catalogRow(page, id);
    await expect(row.getByRole("cell").nth(3).locator(".badge")).toHaveText(
      label,
    );
    await row.locator("a.service-link").click();
    await expect(detailHeading(page, name)).toBeVisible();
    await expect(page.locator(".detail-metadata .badge")).toHaveText(label);
    await expect(
      page
        .getByRole("complementary", { name: "Service evidence" })
        .locator("dd code"),
    ).toHaveText(raw);
    if (raw === "never") {
      await expect(page.locator(".markdown strong")).toHaveText(
        "Not configured",
      );
      await expect(page.locator(".detail-metadata .badge")).not.toHaveText(
        "Passing",
      );
    }
  });
}

test("Attention has stable counts, ordered reasons, and linked service details", async ({
  page,
}) => {
  await page.goto("/#/");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: /^Attention/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Attention", exact: true, level: 1 }),
  ).toBeVisible();
  await expect(page.getByTestId("attention-count")).toHaveText("04");
  await expect(page.getByTestId("reason-count")).toHaveText("05");
  const findings = page.getByTestId("attention-finding");
  const expected = [
    {
      id: "billing-worker",
      name: "Billing Worker",
      reasons: ["ci_failed", "runbook_missing"],
    },
    { id: "model-gateway", name: "Model Gateway", reasons: ["ci_failed"] },
    { id: "docs-site", name: "Docs Site", reasons: ["ci_not_configured"] },
    { id: "event-worker", name: "Event Worker", reasons: ["owner_missing"] },
  ];
  await expect(findings).toHaveCount(4);
  for (const [index, finding] of expected.entries()) {
    await expect(findings.nth(index)).toHaveAttribute(
      "data-service-id",
      finding.id,
    );
    const reasons = findings.nth(index).locator("[data-reason-code]");
    await expect(reasons).toHaveCount(finding.reasons.length);
    for (const [reasonIndex, code] of finding.reasons.entries()) {
      await expect(reasons.nth(reasonIndex)).toHaveAttribute(
        "data-reason-code",
        code,
      );
    }
    await findings
      .nth(index)
      .getByRole("link", { name: finding.name, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`#/services/${finding.id}$`));
    await expect(detailHeading(page, finding.name)).toBeVisible();
    if (finding.id === "docs-site") {
      await expect(page.locator(".detail-metadata .badge")).toHaveText(
        "Not configured",
      );
    }
    await page
      .getByRole("navigation")
      .getByRole("link", { name: /^Attention/ })
      .click();
    await expect(findings).toHaveCount(4);
  }
  await page.reload();
  await expect(page.getByTestId("attention-count")).toHaveText("04");
  await expect(page.getByTestId("reason-count")).toHaveText("05");
  await expect(findings.nth(2)).toHaveAttribute("data-service-id", "docs-site");
  await expect(findings.nth(2).locator("[data-reason-code]")).toHaveAttribute(
    "data-reason-code",
    "ci_not_configured",
  );
});

for (const route of ["/unknown", "/services/no-such-service"]) {
  test(`unknown route ${route} offers an explicit return to catalog`, async ({
    page,
  }) => {
    await page.goto(`/#${route}`);
    await expect(
      page.getByRole("heading", {
        name: "That page isn't in the catalog.",
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.locator("tbody tr")).toHaveCount(0);
    await page
      .getByRole("link", { name: "Back to service catalog", exact: true })
      .click();
    await expect(page).toHaveURL(/#\/$/);
    await expect(page.locator("tbody tr")).toHaveCount(8);
  });
}

test("390px mobile pages keep horizontal scrolling inside the catalog table", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/",
    "/attention",
    "/services/model-gateway",
    "/runbooks",
    "/source",
  ]) {
    await page.goto(`/#${route}`);
    await expect(
      page.getByRole("main").getByRole("heading", { level: 1 }).first(),
    ).toBeVisible();
    await expect
      .poll(
        () =>
          page.evaluate(
            () =>
              Math.max(
                document.documentElement.scrollWidth,
                document.body.scrollWidth,
              ) - document.documentElement.clientWidth,
          ),
        { message: `${route} must not overflow the document horizontally` },
      )
      .toBeLessThanOrEqual(1);
    if (route === "/") {
      const table = page.locator(".table-scroll");
      await expect(table).toBeVisible();
      expect(
        await table.evaluate(
          (element) => element.scrollWidth > element.clientWidth,
        ),
      ).toBe(true);
      await table.evaluate((element) => {
        element.scrollLeft = element.scrollWidth;
      });
      expect(
        await table.evaluate((element) => element.scrollLeft),
      ).toBeGreaterThan(0);
    }
  }
});

test("keyboard skip link focuses main content without changing the route", async ({
  page,
}) => {
  await page.goto("/#/");
  await expect(
    page.getByRole("heading", { name: "Service catalog", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content", exact: true });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await expect(page).toHaveURL(/#\/$/);
});
