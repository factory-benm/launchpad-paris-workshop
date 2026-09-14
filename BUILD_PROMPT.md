# Build Launchpad: a local-first developer portal workshop

Use this prompt to reproduce the project and its workshop checkpoints. Build the application, not just a mockup. Work autonomously; preserve existing user work. Record concrete unresolved choices and access blockers privately in `.presenter/questions-for-tomorrow.md` rather than asking questions while the host is away.

## Goal and boundaries

Create **Launchpad**, a small developer portal for a 50-minute Factory workshop. Attendees start with a working catalog, improve repository instructions and checks, add an Attention view and matching CLI, then repair a disclosed status-label defect. End with a local, read-only scheduled reporting example.

The core workshop must work without Slack, GitHub API access, a database, API keys, or a remote runtime. GitHub is the distribution and versioning mechanism, not an application backend. Publication means public GitHub source, not public web hosting. Do not deploy to Vercel or another hosting service.

Use Vite, React, TypeScript, npm, and Node 22 LTS. Pin the actual installed Node 22 patch version and record it in the setup documentation. Use system fonts; no external fonts, telemetry, analytics, remote images, or runtime network calls. Bind the development server to `127.0.0.1:5173`, with strict port handling.

Keep the interface readable on a projector: clear service names, meaningful text labels, visible filter state, accessible controls, keyboard navigation, and responsive layouts. Do not communicate status by color alone.

## Data contract

The UI is read-only. Store shared data in versioned JSON and runbooks in repository Markdown. People on the same commit see the same data. There is no live sync: changes arrive through file edits, commits, `git pull`, and reloads.

Prominently label the application and CI displays:

> Repository snapshot · sample data

These services are fictional examples, not deployed or monitored applications. A CI snapshot is not a live integration.

Create `data/catalog.json`:

```json
{
  "schemaVersion": 1,
  "name": "Launchpad sample catalog",
  "description": "Fictional services for the workshop.",
  "services": []
}
```

Every service has exactly these contract fields:

- `id`: stable unique string.
- `name`: readable string.
- `description`: plain-text string.
- `owner`: string or `null`.
- `type`: `api`, `worker`, `library`, or `website`.
- `tags`: array of strings.
- `runbook`: filename inside `data/runbooks/`, such as `api-gateway.md`, or `null`. Reject path separators and traversal.

Create `data/ci-snapshots.json`:

```json
{
  "schemaVersion": 1,
  "asOf": "2026-09-01T09:00:00Z",
  "snapshots": []
}
```

Each snapshot has `serviceId`, `state` (`passed`, `failed`, `running`, or `never`), `workflow` (string or `null`), `ref` (string or `null`), and `summary` (string). Include one snapshot per service. Use `null` workflow and ref for `never`. Choose plausible, explicitly simulated workflow names, refs, and summaries for the others.

Create exactly these eight services and preserve their owner, CI state, and runbook presence:

| ID | Owner | State | Runbook |
|---|---|---|---|
| `api-gateway` | Platform | `passed` | Present |
| `model-gateway` | AI Platform | `failed` | Present |
| `inference-api` | AI Platform | `passed` | Present |
| `prompt-registry` | AI Platform | `passed` | Present |
| `eval-runner` | AI Platform | `running` | Present |
| `billing-worker` | Commerce | `failed` | `null` |
| `event-worker` | `null` | `passed` | Present |
| `docs-site` | Developer Experience | `never` | Present |

Use sensible descriptions, types, and tags. Write short fictional runbooks for the seven services with runbooks. Do not embed credentials, actual internal infrastructure, or commands claiming to operate deployed services.

Validate schema versions, field types, enum values, unique IDs, snapshot references, and runbook references. Render Markdown without raw HTML execution; reject unsafe link schemes and paths that escape the runbook directory. Do not use `dangerouslySetInnerHTML` for runbook content. Treat missing runbooks and missing owners as explicit states, not crashes.

## Working starter

Implement a service catalog, case-insensitive search, owner and type filters, service detail pages, safe Markdown runbooks, and an in-app JSON Source view. The Source view must show the actual repository fixture data so attendees can compare the raw CI state with its display label.

Include one intentional, publicly disclosed prototype defect: `docs-site` has raw state `never`, but its badge displays **Passing**. Do not introduce other deliberate defects. Place an exercise disclaimer in public workshop documentation; do not pretend to discover an unknown production incident.

## Four Git checkpoints

Keep checkpoint contents faithful to this table. Build branches from the appropriate parent; do not put future features into earlier checkpoints.

| Tag | Branch | Content |
|---|---|---|
| `workshop-starter` | `main` | Working catalog and Source view; disclosed badge bug; `dev`, `typecheck`, and `build` scripts. No Attention, report CLI, `AGENTS.md`, tests, or `check` script. Validate typecheck and build before recording this checkpoint. |
| `workshop-ready` | `reference/readiness` | Based on starter. Add accurate `AGENTS.md`, unit tests, `npm test`, and `npm run check`. Keep product behavior and the badge bug unchanged. |
| `workshop-feature` | `reference/attention` | Based on ready. Add Attention and the report CLI with a shared deterministic evaluator and parity tests. Keep the badge bug unchanged. |
| `workshop-complete` | `reference/complete` | Based on feature. Add a regression test for `never`, fix its label to **Not configured**, and add browser smoke tests via `npm run test:e2e`. |

Set `main`, and the remote default branch if authorized, to the starter commit. A local checkout may remain on `reference/complete` for inspection, but make that state clear in the handoff. Each branch README must list only commands available on that branch. Public `WORKSHOP.md` must contain attendee copy/paste prompts, the defect disclosure, and safe recovery instructions.

`npm run check` means typecheck, unit tests, and production build. It does not imply browser coverage. Install the browser separately during host preparation with `npx playwright install chromium`; browser installation is not an audience prerequisite.

Do not guarantee a readiness score or fabricate readiness results. `/readiness-report` requires a configured Git origin. Document the actual result if run. Use scoped `/readiness-fix` instructions: improve repository instructions and checks, preserve the known badge bug, and do not prebuild Attention or the CLI.

## Attention and CLI

Implement one shared evaluator consumed by the UI and CLI. Rules v1:

| Rule | Priority | Condition |
|---|---|---|
| `ci_failed` | high | Raw state is `failed` |
| `ci_not_configured` | medium | Raw state is `never` |
| `owner_missing` | medium | Owner is `null`; blank strings are invalid data |
| `runbook_missing` | medium | Runbook is `null`; blank strings are invalid data |

Order reasons as listed above. Produce one row per affected service, including all reasons. Sort rows by the index of their highest-priority rule in this table, then service ID using a stable deterministic comparison. `passed` and `running` do not trigger failing-CI findings.

The exact fixture result is **4 services and 5 reasons**:

1. `billing-worker`: `ci_failed`, `runbook_missing`.
2. `model-gateway`: `ci_failed`.
3. `docs-site`: `ci_not_configured`.
4. `event-worker`: `owner_missing`.

Distinguish affected-service counts from reason counts in the dashboard. Show the fixed fixture `asOf`; do not refresh the date, use the current time, introduce randomness, or infer findings with an LLM.

Support:

```sh
npm run catalog:report -- --output .workshop-output/catalog-report.json --markdown .workshop-output/catalog-report.md
```

Generate deterministic JSON and Markdown from the same input and evaluator as the UI. Exit zero when findings exist, nonzero on invalid data or arguments. Write only the requested report files; do not change source data or make network requests. Keep generated reports ignored. Cover ordering, multi-reason aggregation, passed/running exclusions, invalid inputs, deterministic output, and UI/CLI parity with tests.

The final badge fix changes presentation only. `docs-site` must remain in Attention because it still has no configured workflow.

## Live workshop: exactly 50 minutes

| Time | Segment |
|---|---|
| 0–4 | Working starter and data honesty |
| 4–9 | Agent readiness |
| 9–18 | Bounded repository instructions and test improvements |
| 18–29 | Attention and CLI build-along |
| 29–39 | Optional host Slack defect fix; direct Factory session fallback |
| 39–46 | Scheduled local read-only report automation |
| 46–50 | Recap and Q&A |

Keep Slack outside the app. The optional host exercise starts a Factory session through an already configured channel, requests a reviewed diff with a failing-then-passing regression test, and never merges or pushes without separate authorization. A public PR is optional and allowed only in an already configured dedicated repository and branch. The same task must work directly in Factory without Slack.

For automation, target a prepared `workshop-complete` working directory with installed dependencies and the tested CLI. Run only the report command above, with ignored local outputs, no source writes, no network, and no publication. Create any prep schedule paused. Do not activate organization bots. A local schedule requires an awake, available laptop; a remote Droid Computer is optional and must already be configured. Use Run now only if supported and authorized. Otherwise run the actual one-shot command and explicitly say scheduler execution is unverified. Never invent execution history. Slack replies require explicit host authorization for the exact channel or thread.

## Presenter assets and public/private boundary

Create public `BUILD_PROMPT.md`, `README.md`, `WORKSHOP.md`, and an MIT license with the correct copyright holder. Keep all presenter material in ignored `.presenter/`:

- `README.md`: artifact map, inferred brief, evidence and review notes.
- `demo-guide.md`: timing, actions, expected results, checkpoints and recovery.
- `talk_track.md`: concise spoken narrative.
- `setup.md`: preparation, commands by checkpoint, optional integrations, evidence.
- `workshop-tips.md`: pacing, troubleshooting, and safety guardrails.
- `questions-for-tomorrow.md`: only concrete deferred choices or actual blockers.

Before Git staging, ignore `/.presenter/`, `/.workshop-output/`, existing `/.playwright-mcp/`, secrets and `.env` files, dependencies, build output, and generated test artifacts. Do not overwrite existing ignore rules or user changes. Never expose presenter files or secrets in any public branch, tag, or history.

## Publication and verification

If authorized and authenticated, create a public repository, suggested name `launchpad-paris-workshop`, under the authenticated personal account unless an owner is specified. Use normal configured Git identity; never override author or committer identity. If identity or access is missing, stop publication and record the concrete blocker privately. Local build work can still finish.

Review status and diffs, use explicit path staging rather than broad staging, and scan all publishable branches and reachable history for secrets and presenter material before pushing. Review the staged diff and status before every commit; follow the established commit-message style and include:

```text
Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
```

Use safe multiline commit-message quoting. Do not bypass hooks or rewrite published history. After an authorized push, verify public visibility, the starter default branch, all four checkpoint branches, correct documentation, and absence of private files in the public refs/history.

Never discard attendee or host work with reset, clean, or stash deletion. Recover in a separate fresh clone directory, selecting the needed checkpoint with `--branch`, then create a new local exercise branch. Switch an existing working tree only after checking that it is clean.

Report the actual Node/npm versions, repository URL and publication status, current branch and checkpoint refs, files created, commands run and their results, tests not run, and any optional integration or scheduler verification gaps. Do not call unrun checks passing.

The final handoff must say what the demo is not: **not production uptime, not live CI, not a measured agent success benchmark.**
