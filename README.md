# Launchpad

A local-first developer portal for a Factory build-along in Paris.

Browse a service catalog, find owners, read runbooks, and inspect the JSON that
powers the app. The reference checkpoints add an Attention view and a repeatable
catalog audit.

**This is a working portal over fictional, committed data.** The listed services
are not deployed workloads. CI badges describe sample snapshots, not live
GitHub Actions runs or uptime.

## Run locally

Use Node **22.22.3** (`.nvmrc`) and npm **10.9.8**.

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5173**. The server binds to loopback only.
If port 5173 is occupied, stop the process you started there or explicitly choose
another port with `npm run dev -- --port 5174`.

No `.env`, account, API key, database, or external integration is needed by the
app. Initial dependency installation, GitHub access, and Factory sessions still
need their normal connectivity. After installation, the portal makes no external
network requests.

## Workshop checkpoints

The default `main` branch is the starting exercise, not the completed solution.
Reference branches and tags let you inspect the finished stages:

| Tag | Branch | What it contains |
| --- | --- | --- |
| `workshop-starter` | `main` | Working catalog, runbooks, source viewer, and one disclosed label defect. |
| `workshop-ready` | `reference/readiness` | Project instructions, unit tests, and a validation command. |
| `workshop-feature` | `reference/attention` | Attention view and deterministic catalog report. |
| `workshop-complete` | `reference/complete` | Status fix and browser smoke tests. |

Use [WORKSHOP.md](WORKSHOP.md) for the build-along prompts and safe catch-up steps.
Presenter notes are intentionally excluded from every public checkpoint.

## Commands at this checkpoint

```sh
npm run typecheck
npm run build
npm run preview
```

`preview` serves the production build on http://127.0.0.1:4173.

This is the **complete reference checkpoint**. It includes:

```sh
npm test
npm run check
```

`check` runs type checking, unit tests, and a production build. It is not a
browser test. The starter has no test/check scripts; this checkpoint does.

Open Attention in the sidebar. It evaluates four explicit rules over the
snapshot: failed CI, unconfigured CI, missing owner, and missing runbook.
The sample has **4 services needing attention and 5 reasons**. Billing Worker
has two reasons. Running CI is not failing CI.

Run the same evaluator without the browser:

```sh
npm run catalog:report
npm run catalog:report -- --output .workshop-output/catalog-report.json --markdown .workshop-output/catalog-report.md
```

Without flags, the command prints JSON. With flags, it also writes the requested
report files. Targets must be direct files in `.workshop-output/`, with `.json`
or `.md` extensions respectively; symlinked and hard-linked outputs are rejected. No source
files change. Reports contain the dataset timestamp, not the current time.
Exit 0 means the audit completed, even when it finds gaps. Invalid arguments
or data produce exit 1. The rules live in `src/domain/attention.ts`.

Run the browser smoke suite separately:

```sh
npx playwright install chromium
npm run test:e2e
```

Install the browser during preparation, not during the live build-along. The
suite builds the app and starts its own loopback preview at port **4174**.
Keep that port free. It tests desktop and mobile flows, status labels, local
data rendering, and absence of external requests. Reports go into ignored
`playwright-report/` and `test-results/` directories.

## Where the data lives

- `data/catalog.json`: service names, descriptions, owner, type, tags, and runbook.
- `data/ci-snapshots.json`: one sample CI state per service and a fixed snapshot time.
- `data/runbooks/*.md`: seven actual Markdown runbooks.
- `src/domain/catalog.ts`: shared schema validation and filtering.
- `src/domain/status.ts`: the small status presentation function.

To change a service, edit its JSON record, save, and reload the local page.
For a new runbook, create a Markdown file in `data/runbooks/` and set the service's
`runbook` field to its filename. Use `null` when a service has no runbook or owner.
Malformed data produces a readable validation error instead of silent defaults.

The UI is read-only. It does not save data in localStorage or send changes
somewhere else. Commit and push dataset edits to share them. Others pull and
reload. **The same unmodified commit means the same dataset, not live sync.**

Snapshot states are `passed`, `failed`, `running`, and `never`. A service with
no snapshot is invalid data. It is different from an explicit `never` snapshot.
All dates come from the files; the app does not age records using your clock.

## Known starter defect

In the starter, Docs Site has `state: "never"` but its badge says **Passing**.
This is a disclosed exercise, not a hidden demo trick. This complete checkpoint
fixes it to **Not configured**, using an exhaustive mapping and a regression
test. Docs Site still appears in Attention because its workflow is still absent.

The starter's modest readiness gaps include missing repository instructions,
unit tests, and a single validation command. This checkpoint adds those
foundations, the Attention feature, and the presentation fix. No particular
Agent Readiness score is claimed or guaranteed.

## Out of scope

No live CI integration, database, authentication, model calls, Slack SDK, cloud
deployment, infrastructure provisioning, or production monitoring. Optional
Slack delegation and scheduling happen in Factory, outside this application.

## License

MIT. See [LICENSE](LICENSE).
