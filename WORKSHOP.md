# Build-along: from prototype to repeatable engineering

The 50-minute workshop starts from `workshop-starter`. Keep your changes on your
own local branch. Public reference checkpoints are there to inspect or catch up,
not to imply your live run produced identical code.

## Before the session

1. Clone this repository and use the `workshop-starter` tag.
2. Create your own branch from that tag while the working tree is clean.
3. Use Node 22.22.3 and npm 10.9.8.
4. Run `npm ci`, `npm run typecheck`, `npm run build`, and `npm run dev`.
5. Confirm http://127.0.0.1:5173 loads eight services.
6. Confirm you can start a Factory session in this repo. A Git `origin` remote
   is needed for `/readiness-report`.

The catalog data is fictional. It lives entirely in committed JSON and Markdown.
No application credentials are required. Every participant at the same commit
sees the same data.

## 1. Inspect the foundation

In a Factory session, run:

```text
/readiness-report
```

Inspect the evidence and choose a small improvement, not a score to chase.
The command's evaluation can take longer than the live slot. An actual saved
report is a useful fallback when clearly labeled as a rehearsal result.

## 2. Improve instructions and validation

```text
/readiness-fix focus only on project instructions and local validation.
Create a concise AGENTS.md with commands you verify. Add Vitest unit tests for
schema validation and catalog filtering. Add npm test and npm run check;
check must run type checking, unit tests, and a production build.
Preserve application behavior, the committed dataset, and the disclosed
Docs Site badge defect. Do not implement Attention or catalog:report yet.
Do not modify remote settings, add services, or push changes. Run the checks.
```

If `/readiness-fix` is not available, give those instructions as a normal task,
using the actual readiness findings as context.

Verify the commands, inspect the diff, and record which gaps changed. Adding
`AGENTS.md` alone is not proof that an agent can work reliably.

## 3. Build the Attention view

Use Spec mode with this task, then approve a small plan:

```text
Add an Attention page to Launchpad and a deterministic catalog-report CLI.
Use the existing validated, committed dataset. No APIs, database, or new data.

One service row can contain multiple reasons. Rules in priority order:
1. ci_failed: raw CI state failed, high severity.
2. ci_not_configured: raw CI state never, medium severity.
3. owner_missing: owner is null, medium severity.
4. runbook_missing: runbook is null, medium severity.
Passed and running are not failing. Missing snapshot records are validation
errors, not implicit passes. Sort services by their highest-priority reason,
then by service id. Order reasons by the same rule priority.

Share the evaluator between the UI and CLI. Show distinct service count
separately from reason count. Include service links and an empty state.
Do not change the existing CI badge presentation function in this exercise.

Provide:
npm run catalog:report -- --output .workshop-output/catalog-report.json
  --markdown .workshop-output/catalog-report.md

The command uses only local data, writes only requested reports under
.workshop-output/, and produces deterministic output. Use the dataset's asOf,
not the wall clock. Exit 0 when an audit completes even if it finds issues;
exit nonzero for invalid input or data. Never modify source data.

Add tests. Expected results: 8 total services, 4 needing attention, 5 reasons.
Order: billing-worker (ci_failed, runbook_missing), model-gateway (ci_failed),
docs-site (ci_not_configured), event-worker (owner_missing).
Run checks and show that CLI and UI use the same rules. Do not push or merge.
```

Run the CLI on one line:

```sh
npm run catalog:report -- --output .workshop-output/catalog-report.json --markdown .workshop-output/catalog-report.md
```

These are two failures and three medium-priority gaps, not five failing systems.
The snapshot date stays fixed at `2026-09-01T09:00:00Z`.

## 4. Fix the disclosed status bug

Use this directly in Factory or, if the presenter has configured it, through
a dedicated Slack thread:

```text
Docs Site has state "never" in data/ci-snapshots.json but shows Passing in
the catalog and service page. Reproduce it and add a failing regression test.
Fix the label to Not configured. Cover all four supported states.
Do not change the source data or Attention rules. Docs Site should remain
in Attention after the label fix, because its workflow is still unconfigured.
Run checks and show the diff plus failing-then-passing test evidence.
Do not push, merge, or deploy.
```

The fixture and the starter disclose this defect in advance. Don't present it
as an unexpected production incident.

## 5. Make the audit repeatable

The existing `catalog:report` command is the repeatable unit. A Factory scheduled
automation can run it in this repository and summarize the output.

```text
In the configured local Launchpad checkout, run the existing catalog:report
command and write JSON and Markdown under .workshop-output/.
Summarize service count, attention service count, reason count, and each finding.
Mention the dataset timestamp and that these are sample repository snapshots.
Do not change code or data, install packages, access external systems, commit,
push, or send messages. If the command is missing or fails, report that failure.
```

A local schedule needs its computer awake and available. Run the command manually
when scheduling is not configured, and distinguish a manual run from a scheduler
run. Do not invent run history.

## Safe catch-up

Do not reset, clean, or discard your work to catch up. Clone into a different
folder using the clone URL of this repository:

```sh
git clone --branch workshop-ready REPOSITORY_URL launchpad-ready-copy
cd launchpad-ready-copy
git switch -c my-workshop
npm ci
npm run dev -- --port 5174
```

`REPOSITORY_URL` is a placeholder for this repo's clone URL. Replace it before
running the command. Choose another unused directory if that one already exists.
Use `workshop-feature` or `workshop-complete` for later reference stages.
The clone initially checks out a tag; creating a branch keeps your edits separate.

## What this demonstrates

A working product over transparent local data, verified project instructions,
a bounded feature with shared rules, a regression fix, and repeatable execution.
It does not demonstrate real service uptime, live GitHub CI, or a measured
increase in autonomous success rate.

Factory references: [Readiness](https://docs.factory.ai/agent-readiness/readiness-report),
[Slack](https://docs.factory.ai/software-factory/slack),
[Automations](https://docs.factory.ai/software-factory/automations).
