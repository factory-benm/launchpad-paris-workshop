![Factory](docs/assets/factory-lockup-black.svg)

# Build with Droid

Bring autonomy to software engineering.

This is the only page you need open during the workshop. Every prompt you
paste into Droid is on this page. Full-length versions live in
[WORKSHOP.md](WORKSHOP.md) if you want more detail afterwards.

---

## 01 / Before the session (15 minutes, do this today)

Scan for workshop access:

<a href="https://docs.google.com/forms/d/e/1FAIpQLSfhqtCTPcGDv0DFaCGrcI9Cg2DBnnbb4VyZOtTp9pr8yrmCMA/viewform"><img src="docs/assets/workshop-access-qr.svg" alt="QR code: request Factory workshop access" width="100"></a>

- [ ] 1\. Submit the form with the email you will use for Factory. Check your inbox
  and spam folder for the invitation. Open it, create an account or sign in, and
  accept workshop access. Use that same email throughout. If no invitation
  arrives, ask the presenter; submitting the form alone does not confirm access.

- [ ] 2\. Open Terminal (macOS/Linux). Windows: install WSL **before the session**
  (it needs a restart) and use its Ubuntu terminal for everything below.
  Have Git, Node `22.22.3`, and npm `10.9.8` installed.
  Check with `git --version`, `node --version`, and `npm --version`.
  Missing something? Use the [README appendix](README.md#appendix-install-prerequisites).

- [ ] 3\. Install Droid. Paste this into Terminal and press Enter:

```sh
curl -fsSL https://app.factory.ai/cli | sh
```

- [ ] 4\. Download the starter. Run these lines in Terminal:

Scan to open the workshop repository:

<a href="https://github.com/factory-benm/launchpad-paris-workshop"><img src="docs/assets/workshop-repository-qr.svg" alt="QR code: open the workshop repository" width="110"></a>

```sh
git clone --branch workshop-starter https://github.com/factory-benm/launchpad-paris-workshop.git launchpad-workshop
cd launchpad-workshop
git switch -c my-workshop
npm ci
npm run typecheck
npm run build
```

If `launchpad-workshop` already exists, choose a new folder name in both commands.
If you use nvm, run `nvm install && nvm use` after `cd`, before `npm ci`.

- [ ] 5\. Start the app. Run `npm run dev` in this folder and leave it running.
  Open http://127.0.0.1:5173. You should see eight sample services.
  **Done when:** the catalog page loads and you can click into Docs Site.

- [ ] 6\. Open a **second** Terminal tab, `cd launchpad-workshop`, and start Droid:

```sh
droid
```

Follow the browser sign-in prompt using your invited email, then return to
Terminal. If asked to choose an organization, select the workshop organization.
If Terminal cannot find `droid`, reopen Terminal and return to this folder.

- [ ] 7\. Set autonomy to **Medium**: press `Ctrl+L` until the indicator shows
  Medium. This lets Droid edit files and run builds without asking each time.
  It still cannot push or deploy.

- [ ] 8\. Inside Droid, type this and press Enter (not in the shell):

```text
/readiness-report
```

This takes several minutes, so start it now rather than during the session.
No fork is required: cloning sets the `origin` remote this command needs.
**Done when:** Droid prints a readiness level and a list of action items.
Note: every participant's clone shares one `origin`, so reports for this repo
are pooled in Factory. At the starter commit they are all near-identical.

You are ready. Keep both Terminal tabs and the browser tab open.

## 02 / Build along (during the session)

Rules for every step: read what Droid proposes before approving. If Droid asks
you a question, answer it or reply `use your best judgment`. After each step,
run `git diff --stat` in a shell tab to see what changed. If you fall behind,
keep going in your own time or ask for a catch-up checkout; never delete your work.

- [ ] 9\. **Read the readiness report.** Look at the action items from step 8.
  Find the ones about project instructions (AGENTS.md) and testing. Those are
  the two we fix next.

- [ ] 10\. **Add project instructions.** Paste into Droid:

```text
Inspect this repository and create a concise root-level AGENTS.md for future coding agents. Derive instructions from the existing code, README, package scripts, and conventions. Include: project purpose and architecture; setup, build, typecheck, and dev commands; code and naming conventions; validation required before finishing changes; files or generated artifacts agents should not edit; repository-specific safety rules (no pushes, do not edit data/ fixtures, do not fix the disclosed Docs Site badge yet). Keep it practical and avoid generic advice. Do not invent commands or conventions. After writing it, run every documented command that is safe to run and report the results.
```

**Done when:** `AGENTS.md` exists at the repo root and Droid reports that
`npm run typecheck` and `npm run build` pass. Open the file and read it: is
anything wrong or made up?

- [ ] 11\. **Fix one readiness gap.** Paste into Droid:

```text
/readiness-fix Testing only. Add Vitest, unit tests for schema validation and catalog filtering in src/domain, an npm test script, and an npm run check script that runs typecheck, tests, and build. Do not change application behavior, the data/ fixtures, or the Docs Site badge. Do not add features. Run npm run check when done.
```

This pulls the shared readiness report for the repository, then works on the
testing findings. Then run in a shell tab:

```sh
npm run check
```

**Done when:** `npm run check` passes and you can name the test files it added.

- [ ] 12\. **Build a feature in Spec mode.** Press `Shift+Tab` in Droid so the
  indicator shows **Spec**. Spec mode plans without editing. Paste:

```text
Add an Attention page to Launchpad using only the existing validated dataset. List each service that needs attention with its reasons. Rules in priority order: ci_failed (raw CI state failed, high), ci_not_configured (raw CI state never, medium), owner_missing (owner is null, medium), runbook_missing (runbook is null, medium). A service can have several reasons. Passed and running are not failures. Sort services by their highest-priority reason, then by id. Show the count of services separately from the count of reasons, link each row to the service page, include an empty state, and show the dataset asOf timestamp, not the current time. Put the rule evaluator in src/domain with unit tests. Do not change the existing CI badge presentation function or any data. Expected result on this dataset: 4 services, 5 reasons, in order billing-worker, model-gateway, docs-site, event-worker. Run npm run check when done.
```

Read the plan. If it looks right, approve it and Droid switches back to
Normal mode to build. Reload http://127.0.0.1:5173 and open Attention.

**Done when:** Attention shows **4 services, 5 reasons** in this order:
Billing Worker, Model Gateway, Docs Site, Event Worker.
Billing Worker has two reasons; that is why the counts differ.

- [ ] 13\. **Fix the disclosed bug.** Docs Site has raw state `never` in
  `data/ci-snapshots.json` (see the Source view in the app) but its badge says
  Passing. Paste into Droid, in Normal mode:

```text
Docs Site has state "never" in data/ci-snapshots.json but shows Passing in the catalog and service page. Reproduce it and add a failing regression test first. Then fix the label to "Not configured" and cover all four supported states (passed, failed, running, never). Do not change the source data or the Attention rules. Docs Site should still appear in Attention after the fix because its workflow is still unconfigured. Run npm run check and show the diff plus the failing-then-passing test evidence.
```

**Done when:** the badge reads **Not configured**, `npm run check` passes,
and Docs Site is still on the Attention page.

## 03 / Watch the presenter (no action needed)

These use the presenter's own setup and are not follow-along steps:

- The `catalog:report` CLI that shares the Attention rules and writes a
  deterministic JSON and Markdown report.
- A Factory scheduled automation that runs that CLI and summarizes the result.
- Starting a Droid session from Slack. This needs the presenter's Slack
  workspace connected to Factory.

If you want to try them yourself later, the prompts are in
[WORKSHOP.md](WORKSHOP.md) §5–§7 and the finished code is on the
`workshop-complete` tag.

## 04 / Droid keyboard shortcuts

Use these inside Droid's chat input, not your normal shell. On Mac, `Ctrl`
means Control, not Command. Check the mode and autonomy indicators after switching.

| Action | Keys / command |
| --- | --- |
| Switch Normal ↔ Spec mode | `Shift+Tab` |
| Cycle autonomy: Off → Low → Medium → High → Off | `Ctrl+L` |
| Change model | `Ctrl+N`, or type `/model` |
| Cycle the model's reasoning effort | `Tab` (separate from autonomy) |
| Add a new line without sending | `Shift+Enter`; run `/terminal-setup` if needed |
| Interrupt Droid | `Ctrl+C` once; twice quickly exits |
| Show detailed tool output | `Ctrl+O` |
| Show all keyboard shortcuts | `?` with an empty input, or `Ctrl+/` |
| Close a menu or shortcuts pane | `Esc` |
| Run a shell command inside Droid | `!` on an empty input; `Esc` returns to chat |

Spec mode plans without editing. Approve the proposed plan to start
implementation in Normal mode. `Shift+Tab` also lets you switch back manually.
Switching modes does not change your autonomy level.

| Autonomy | What runs without asking first |
| --- | --- |
| Off | Built-in read tools and allowlisted commands. Other actions ask. |
| Low | File edits plus low-risk commands and tools. |
| Medium | Low plus reversible workspace changes, including installs, builds, and local commits. |
| High | High-risk actions, potentially including pushes and deployments, subject to safety controls. |

Workshop default: **Medium**. High is not needed. Organization policy can
limit the available levels. Keep the task scoped: no pushes, merges, or deployments.

## 05 / If you get stuck

| Problem | What to do |
| --- | --- |
| No invitation email | Check spam; ask the presenter. Pair with a neighbour meanwhile. |
| `droid` not found after install | Close and reopen Terminal, `cd launchpad-workshop`, retry. |
| Port 5173 in use | Stop the other `npm run dev`, or run `npm run dev -- --port 5174`. |
| Droid asks a question you cannot answer | Reply `use your best judgment and stay within the task`. |
| Droid did something you did not want | `git diff` to inspect, `git checkout -- <file>` for a single file you did not edit yourself. Do not reset the whole tree. |
| `/readiness-fix` says no report found | Run `/readiness-report` first (step 8) and wait for it to finish. |
| Way behind | Clone the catch-up checkpoint into a **new** folder (see [WORKSHOP.md](WORKSHOP.md#safe-catch-up)). Never delete your own folder. |
