# Launchpad project instructions

## Run and validate

- Use Node 22.22.3 (`.nvmrc`) and npm 10.9.8.
- Install the committed dependency versions with `npm ci`.
- Run the app with `npm run dev` at http://127.0.0.1:5173.
- `npm test` runs unit tests once. `npm run typecheck` checks TypeScript.
- `npm run check` runs typecheck, unit tests, and a production build.
- Run checks after code changes. Report failures and skipped checks accurately.
- `npm run catalog:report` prints the deterministic local report. Optional
  `--output .workshop-output/report.json --markdown .workshop-output/report.md`
  flags write ignored report files. Never write reports over source files.
- Share Attention rules between the UI and CLI in `src/domain/attention.ts`.

## Boundaries

- This is a local, read-only portal over fictional repository data.
- JSON lives in `data/`; runbooks are Markdown in `data/runbooks/`.
- Keep `schemaVersion: 1` and the fixed sample `asOf`. Do not use today's date.
- No application network calls, API keys, databases, remote fonts, or telemetry.
- Render Markdown without raw HTML, remote images, or unsafe links.
- Keep domain logic separate from React. Validate input rather than casting it.
- No localStorage persistence or background dataset updates.
- Do not change fixtures to make tests pass.

## Workshop scope

`main` / `workshop-starter` is a runnable prototype. Later reference checkpoints
add validation, Attention, and the status fix. Do not prebuild future exercises
unless the task explicitly asks for them.

The starter's `never` => Passing badge is a publicly disclosed exercise.
Preserve it during readiness and Attention changes. Fix it only in the
status-fix exercise, with a failing-then-passing regression test.

## Git and privacy

- Keep `.presenter/`, `.workshop-output/`, secrets, dependencies, and generated
  test artifacts out of Git. Never force-add ignored presenter files.
- Review diffs and validation before commits. Never override Git identity.
- No push, merge, deployment, or external message without explicit authorization.
- Preserve local work. Catch up in another checkout instead of resetting it.
