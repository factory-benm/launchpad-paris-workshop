# Build-along: from prototype to repeatable engineering

The 50-minute workshop starts from `workshop-starter`. Keep your changes on your
own local branch. Public reference checkpoints are there to inspect or catch up,
not to imply your live run produced identical code.

During the session, follow [PARTICIPANT_CHECKLIST.md](PARTICIPANT_CHECKLIST.md).
This file is the longer reference: the same prompts with more context, plus the
presenter-only steps (§5–§7) you can try on your own afterwards.

## Before the session

1. Clone this repository and use the `workshop-starter` tag.
2. Create your own branch from that tag while the working tree is clean.
3. Use Node 22.22.3 and npm 10.9.8.
4. Run `npm ci`, `npm run typecheck`, `npm run build`, and `npm run dev`.
5. Confirm http://127.0.0.1:5173 loads eight services.
6. Start Droid in the repo, set autonomy to Medium (`Ctrl+L`), and run
   `/readiness-report`. It takes several minutes; start it before the session.

The catalog data is fictional. It lives entirely in committed JSON and Markdown.
No application credentials are required. Every participant at the same commit
sees the same data.

## 1. Inspect the foundation

In a Factory session, run:

```text
/readiness-report
```

Inspect the evidence and choose a small improvement, not a score to chase.

The command needs a Git `origin` remote and stores the report against that
remote's URL. Every participant clone shares the same `origin`, so readiness
reports for this repository are pooled in the Factory dashboard and
`/readiness-fix` picks up the most recent one. At the starter commit all
reports are near-identical, so this is fine for the exercise. Do not fork
just to avoid it.

## 2. Add project instructions

```text
Inspect this repository and create a concise root-level AGENTS.md for future
coding agents. Derive instructions from the existing code, README, package
scripts, and conventions. Include: project purpose and architecture; setup,
build, typecheck, and dev commands; code and naming conventions; validation
required before finishing changes; files or generated artifacts agents should
not edit; repository-specific safety rules (no pushes, do not edit data/
fixtures, do not fix the disclosed Docs Site badge yet). Keep it practical
and avoid generic advice. Do not invent commands or conventions. After
writing it, run every documented command that is safe to run and report
the results.
```

Read the result. Adding `AGENTS.md` alone is not proof that an agent can work
reliably; the value is in commands that were actually verified and constraints
that match how the repository really works.

## 3. Fix one readiness gap: testing

```text
/readiness-fix Testing only. Add Vitest, unit tests for schema validation and
catalog filtering in src/domain, an npm test script, and an npm run check
script that runs typecheck, tests, and build. Do not change application
behavior, the data/ fixtures, or the Docs Site badge. Do not add features.
Run npm run check when done.
```

`/readiness-fix` fetches the latest stored report for the repository and works
through the failing criteria matching your instructions. If it reports no
stored report, run `/readiness-report` first and wait for it to finish. If the
command is unavailable, paste the text after `/readiness-fix` as a normal task.

Then run `npm run check` yourself in a shell and inspect the diff.

## 4. Build the Attention view

Use Spec mode (`Shift+Tab`) with this task, then approve a small plan:

```text
Add an Attention page to Launchpad using only the existing validated dataset.
List each service that needs attention with its reasons. Rules in priority
order: ci_failed (raw CI state failed, high), ci_not_configured (raw CI state
never, medium), owner_missing (owner is null, medium), runbook_missing
(runbook is null, medium). A service can have several reasons. Passed and
running are not failures. Sort services by their highest-priority reason,
then by id. Show the count of services separately from the count of reasons,
link each row to the service page, include an empty state, and show the
dataset asOf timestamp, not the current time. Put the rule evaluator in
src/domain with unit tests. Do not change the existing CI badge presentation
function or any data. Expected result on this dataset: 4 services, 5 reasons,
in order billing-worker, model-gateway, docs-site, event-worker.
Run npm run check when done.
```

These are two failures and three medium-priority gaps, not five failing systems.
The snapshot date stays fixed at `2026-09-01T09:00:00Z`.

## 5. Fix the disclosed status bug

```text
Docs Site has state "never" in data/ci-snapshots.json but shows Passing in
the catalog and service page. Reproduce it and add a failing regression test
first. Then fix the label to "Not configured" and cover all four supported
states (passed, failed, running, never). Do not change the source data or the
Attention rules. Docs Site should still appear in Attention after the fix
because its workflow is still unconfigured. Run npm run check and show the
diff plus the failing-then-passing test evidence.
```

The fixture and the starter disclose this defect in advance. Don't present it
as an unexpected production incident.

---

The remaining sections are presenter demonstrations. They need the presenter's
own setup (a prepared checkout, a Factory automation, or a connected Slack
workspace) and are not follow-along steps. Try them afterwards if you like.

## 6. Add the catalog-report CLI (presenter demo)

The Attention rules become more useful when a command produces the same answer
outside the browser. In Spec mode:

```text
Add a deterministic catalog-report CLI that reuses the Attention evaluator in
src/domain. Provide:
npm run catalog:report -- --output .workshop-output/catalog-report.json
  --markdown .workshop-output/catalog-report.md
The command uses only local data, writes only the requested reports under
.workshop-output/, and produces deterministic output. Use the dataset's asOf,
not the wall clock. Exit 0 when an audit completes even if it finds issues;
exit nonzero for invalid input or data. Never modify source data. Add a parity
test proving the CLI and the Attention page produce the same rows.
Run npm run check when done.
```

Run the CLI on one line:

```sh
npm run catalog:report -- --output .workshop-output/catalog-report.json --markdown .workshop-output/catalog-report.md
```

Expected: 8 services, 4 needing attention, 5 reasons. Run it twice and compare
the output; it should be identical.

## 7. Make the audit repeatable (presenter demo)

The `catalog:report` command is the repeatable unit. A Factory scheduled
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

The presenter may also start the §5 bug-fix task from a Slack thread instead of
the terminal. That requires the presenter's Slack workspace to be connected to
their Factory organization, so it is a demonstration, not a participant step.
The same task works identically when pasted directly into Droid.

## Safe catch-up

Do not reset, clean, or discard your work to catch up. Clone the checkpoint you
need into a **different** folder:

```sh
git clone --branch workshop-ready https://github.com/factory-benm/launchpad-paris-workshop.git launchpad-ready-copy
cd launchpad-ready-copy
git switch -c my-workshop
npm ci
npm run dev -- --port 5174
```

Pick the tag for where you want to resume:

| Tag | Resume from |
| --- | --- |
| `workshop-ready` | AGENTS.md and tests exist; start at §4 (Attention) |
| `workshop-feature` | Attention and CLI exist; start at §5 (bug fix) |
| `workshop-complete` | Everything done; inspect the finished result |

Choose another unused directory if that one already exists. The clone initially
checks out a tag; creating a branch keeps your edits separate. Your original
folder and its Droid session stay untouched.

## What this demonstrates

A working product over transparent local data, verified project instructions,
a bounded feature with shared rules, a regression fix, and repeatable execution.
It does not demonstrate real service uptime, live GitHub CI, or a measured
increase in autonomous success rate.

Factory references: [Readiness](https://docs.factory.ai/agent-readiness/readiness-report),
[Slack](https://docs.factory.ai/software-factory/slack),
[Automations](https://docs.factory.ai/software-factory/automations).
