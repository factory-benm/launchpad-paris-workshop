![Factory](docs/assets/factory-lockup-black.svg)

# Build with Droid

Bring autonomy to software engineering.

---

## 01 / Get access and set up

Scan for workshop access:

<a href="https://docs.google.com/forms/d/e/1FAIpQLSfhqtCTPcGDv0DFaCGrcI9Cg2DBnnbb4VyZOtTp9pr8yrmCMA/viewform"><img src="docs/assets/workshop-access-qr.svg" alt="QR code: request Factory workshop access" width="100"></a>

- [ ] 1\. Submit the form with the email you will use for Factory. Check your inbox
  and spam folder for the invitation. Open it, create an account or sign in, and
  accept workshop access. Use that same email throughout. If no invitation
  arrives, ask the presenter; submitting the form alone does not confirm access.

- [ ] 2\. Open Terminal (macOS/Linux). Windows: use WSL and its Linux terminal
  for this sheet. Have Git, Node `22.22.3`, and npm `10.9.8` installed.
  Check with `git --version`, `node --version`, and `npm --version`.
  Ask for help before continuing if a tool is missing.

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

- [ ] 5\. Start Droid from this folder:

```sh
droid
```

Follow the browser sign-in prompt using your invited email, then return to
Terminal. If asked to choose an organization, select the workshop organization.
If Terminal cannot find `droid`, reopen Terminal and return to this folder.

## 02 / Build along

- [ ] 6\. Inside Droid, type this and press Enter (not in the shell):

```text
/readiness-report
```

No fork required: cloning sets the `origin` remote this command needs.

- [ ] 7\. Open a second terminal tab, navigate to the same `launchpad-workshop`
  folder, and run `npm run dev`. Leave it running.
  Open http://127.0.0.1:5173. You should see eight sample services.

- [ ] 8\. Follow the presenter using the full prompts in [WORKSHOP.md](WORKSHOP.md):
  §2: paste the improvement prompt without the leading `/readiness-fix`,
  as a normal message. This avoids looking up another participant's latest
  report on the shared repo. Run `npm run check` after Droid adds it.
  §3: press `Shift+Tab` to enter Spec mode for Attention and the report CLI;
  review the plan before approving. §4: fix the disclosed Docs Site badge.
  §5: run the report below in a shell tab, once the command exists:

```sh
npm run catalog:report -- --output .workshop-output/catalog-report.json --markdown .workshop-output/catalog-report.md
```

Expected: 8 services, 4 needing attention, 5 reasons. Keep changes local.
If you fall behind, ask for a separate catch-up checkout; do not delete your work.

## 03 / Droid keyboard shortcuts

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

Workshop default: start at Low; use Medium for implementation and checks.
High is not needed. Organization policy can limit the available levels.
Keep the task scoped: no pushes, merges, or deployments.
