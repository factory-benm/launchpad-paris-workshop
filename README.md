# Launchpad

A local-first developer portal for a Factory build-along in Paris.

Browse a service catalog, find owners, read runbooks, and inspect the JSON that
powers the app. The reference checkpoints add an Attention view and a repeatable
catalog audit.

**This is a working portal over fictional, committed data.** The listed services
are not deployed workloads. CI badges describe sample snapshots, not live
GitHub Actions runs or uptime.

## Workshop setup

You need Git, Node **22.22.3**, npm **10.9.8**, and a Factory workshop
invitation. If any prerequisite is missing, use the
[installation appendix](#appendix-install-prerequisites) below.

### 1. Get workshop access

[Request workshop access](https://docs.google.com/forms/d/e/1FAIpQLSfhqtCTPcGDv0DFaCGrcI9Cg2DBnnbb4VyZOtTp9pr8yrmCMA/viewform)
with the email you will use for Factory. Accept the invitation before continuing.

### 2. Check your tools

Run these commands in Terminal:

```sh
git --version
node --version
npm --version
```

The Node and npm versions should be `v22.22.3` and `10.9.8`.

### 3. Install Droid

```sh
curl -fsSL https://app.factory.ai/cli | sh
```

### 4. Download and check the workshop starter

Copy and paste this entire block into Terminal:

```sh
git clone --branch workshop-starter https://github.com/factory-benm/launchpad-paris-workshop.git launchpad-workshop
cd launchpad-workshop
git switch -c my-workshop
npm ci
npm run typecheck
npm run build
```

If `launchpad-workshop` already exists, choose a different folder name in both
the `git clone` and `cd` commands.

### 5. Start Droid and run the readiness report

From the `launchpad-workshop` folder, start Droid:

```sh
droid
```

Complete the browser sign-in with the email invited to the workshop. Then type
this command **inside Droid**, not in the normal shell:

```text
/readiness-report
```

### 6. Run the app

Open a second terminal tab, return to the workshop folder, and run:

```sh
cd launchpad-workshop
npm run dev
```

Leave that command running and open **http://127.0.0.1:5173**. You should see
eight sample services. The server binds to loopback only.
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
The starter intentionally has no `test`, `check`, or `catalog:report` script yet.
Those are exercises, not commands to run before they exist.

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

Docs Site has `state: "never"` but its badge says **Passing**. This is a disclosed
exercise, not a hidden demo trick. The raw source and runbook tell the truth.
The complete checkpoint fixes it to **Not configured** with a regression test.

Other readiness gaps are deliberately modest: no repository `AGENTS.md`, no
unit test command, and no single validation command. The starter still must pass
type checking and a production build. No particular Agent Readiness score is
claimed or guaranteed.

## Out of scope

No live CI integration, database, authentication, model calls, Slack SDK, cloud
deployment, infrastructure provisioning, or production monitoring. Optional
Slack delegation and scheduling happen in Factory, outside this application.

## Appendix: install prerequisites

You only need this section if one of the checks in
[Workshop setup](#workshop-setup) failed. npm is installed with Node, then
updated below to the workshop's pinned version.

### macOS

Install Apple's command-line tools, which include Git:

```sh
xcode-select --install
```

Install `nvm` (Node Version Manager):

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Close and reopen Terminal, then install the required Node and npm versions:

```sh
nvm install 22.22.3
nvm use 22.22.3
npm install --global npm@10.9.8
```

### Linux (Ubuntu or Debian)

Install Git, curl, and the standard build tools:

```sh
sudo apt update
sudo apt install --yes git curl build-essential
```

Install `nvm`:

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Close and reopen the terminal, then install the required Node and npm versions:

```sh
nvm install 22.22.3
nvm use 22.22.3
npm install --global npm@10.9.8
```

### Windows

Use WSL with Ubuntu. In an Administrator PowerShell window, run:

```powershell
wsl --install -d Ubuntu
```

Restart Windows if prompted, open Ubuntu, then follow the
[Linux instructions](#linux-ubuntu-or-debian) above. Run all workshop commands
inside the Ubuntu terminal.

After installing prerequisites, repeat:

```sh
git --version
node --version
npm --version
```

## License

MIT. See [LICENSE](LICENSE).
