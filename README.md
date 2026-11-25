# Studyloom

README prose word count: 1065 (excluding setup code and URLs)

An explainable study planner with a student-controlled observation and adaptation loop, built for an Intelligent Interactive Systems project.

## Status

Implemented: editable tasks, explained ranking, time-limited plans, priority overrides, exclusion/completion, undo, timer, optional page-visibility observation, accept/reject adaptation, forget controls, JSON export and progress review with preview/apply/undo, and optional local plan saving.

JSON plan import validates exported files, previews their tasks and settings, and requires confirmation before replacing the current plan. Import supports Undo and does not import observations or automatically overwrite browser storage.

Example tasks are fictional. The interrupted-session example injects labelled simulated observations into the same inference function used by the live timer. No trained model, external AI service, camera or microphone is used. Weights and thresholds are unvalidated design assumptions. Page departures do not establish distraction; elapsed time does not establish progress. No participant study or learning-benefit evaluation has been conducted.

## Run and test

Requires Node.js 18 or later and npm. The website itself has no external runtime dependencies or API keys.

```sh
npm start
```

Open http://127.0.0.1:5173. Keep the terminal running; Ctrl+C stops it.

To install the locked test dependencies and run all checks:

```sh
npm ci
npm test
```

Or run each suite separately:

```sh
npm run test:engine
npm run test:interface
npm run test:storage
```

Current result: **63 passing tests** (17 engine, 38 interface, 5 storage, 3 import-validation tests).
The jsdom development dependency tests the real HTML and application event handlers in a simulated DOM. It does not verify CSS layout, native modal focus trapping, real keyboard input, browser background timing or actual tab visibility. See [verification instructions](docs/website-checks.md) for browser checks and test limitations.

## Technology and memory

HTML/CSS provide the interface; JavaScript modules implement rules and controls. The browser Page Visibility API and monotonic timer supply optional observations. Node.js serves local files and runs tests. jsdom is used only during testing.

Current tasks, observations and undo live in tab memory. Save plan explicitly writes only tasks/settings to this browser’s local storage. Reload clears the session; Restore loads the saved copy and supports Undo. Later edits require another Save. Delete saved plan removes that copy, leaving current tasks intact. Forget observations is separate. Relative deadlines restore as entered and need checking on later days. Storage failures are reported without losing the current plan. Exports are separate files. Progress review uses the current time budget and never deducts time or marks completion automatically.

## Development record

- [Initial prototype](https://github.com/sxk1420/studyloom/commit/2f501f5): task ranking, explanations and reversible user controls. Lecture 2 motivated optional observation and uncertain adaptation rather than relying on task sorting alone. Review fixes made preference modes meaningfully different and corrected stale adaptation feedback.
- [Readability refinement](https://github.com/sxk1420/studyloom/commit/45379cf): larger controls/text, named dialogs and preserved timer-task selection.
- [Review logic](https://github.com/sxk1420/studyloom/commit/e8f8d14): validated remaining-work estimates and non-mutating previews, covered by engine tests.
- [Review interface](https://github.com/sxk1420/studyloom/commit/29a7cf1): explicit preview/apply/cancel, completion and undo. Thirteen temporary simulated-DOM checks passed at this stage.
- Reproducible verification: moved interface checks into the repository with isolated state, controlled time, labelled synthetic visibility and a dependency lockfile. All 35 tests passed. Earlier temporary checks are superseded by this rerunnable suite.

- Optional local saving: added explicit save/restore/delete, saved-versus-current status, validation of stored data and cross-tab status updates. No observations, timer data or inferred decisions persist. All 49 tests passed, including simulated reloads, corrupt data and quota failure. Real-browser checks remain pending.

- [Plan import](https://github.com/sxk1420/studyloom/commit/5f9f0d6): added validated JSON import with preview, explicit confirmation and Undo. Exported observations and calculated recommendations are ignored; the plan is recalculated from validated inputs. All 52 automated tests passed. The developer reported that the manual import workflow worked; this is a developer check, not an independent user study.

- Review corrections (24 November, working revision): external AI feedback identified lost review access after Undo during a live block and inconsistent deadline wording. Five new checks failed before repair; all 58 pass afterwards, including a sixth guard against reviewing a replacement task with a reused ID. The correction reconnects the timer only to the original task restored by Undo. Saving is collapsible, feedback appears near actions, secondary text is enlarged, and unused time is explained. The source changes and verification notes provide the development evidence; this stage is not yet committed.

- Manual maximum block (24 November, working revision): replaced the fixed 15/25-minute menu with a 5–240-minute whole-number input. Actual allocation remains bounded by each task estimate and available time. Saved plans and imports preserve custom limits. Adaptation proposes 15 minutes only when that would shorten the current maximum. Tests now cover every whole-number budget/maximum pair, invalid values, Undo, saving/restoring and import; all 63 pass.

- Dashboard redesign (25 November, working revision): rebuilt the CSS with indigo, lavender, peach and mint sections; brought the planner forward, added section navigation, restyled time summaries and dialogs, and moved optional saving below the timer. All 63 interaction tests pass. The UI is awaiting visual browser verification; the report screenshots still show the previous design.

## AI assistance

Claude supplied review feedback; Codex checked it against the current files. Missing-report-content and 12px-label claims did not apply to the latest version. The confirmed bugs were reproduced and corrected with regression tests. No extra planned feature was invented to satisfy a suggested marking criterion.

OpenAI Codex helped interpret the brief and supplied lectures, propose interactions, implement code, write tests and draft documentation, the report and diagram layouts. Checks verified planning arithmetic, validation, observation thresholds, feedback, focus restoration and review transitions. The developer exercised the planning, adaptation, review and import workflows and supplied screenshots on 23 November. That evidence covers the earlier version; native keyboard, responsive-layout and screen-reader checks remain incomplete. No user feedback or evaluation results have been invented.

## Supporting documentation

- [System architecture and boundaries](docs/system-diagram.md)
- [Three illustrated interaction examples](docs/interaction-walkthrough.md)
- [Verification evidence and manual checks](docs/website-checks.md)
- [Lecture concept mapping](docs/lecture-mapping.md)

## Project files

- `src/engine.mjs`: planning, inference, timing and review logic.
- `src/app.mjs`: application state and interaction handlers.
- `src/storage.mjs`: versioned saved-plan validation and field selection.
- `tests/`: engine and simulated-interface tests.
- `docs/website-checks.md`: verification evidence and manual checks.
- `docs/lecture-mapping.md`: design notes tied to supplied slide pages.
- `src/import.mjs`: validation and extraction of tasks/settings from exported plans.

Public repository: https://github.com/sxk1420/studyloom

Base commit: aa1e18281c88b90bddfba5af4241600f919b6341. The working revision described above passed 63 automated checks on 24 November 2026 and is awaiting a commit. Before submission, identify the final committed revision in the report and confirm it is pushed. Historical 35/49/52-test milestones above describe earlier versions, not the current count. Comprehensive browser/accessibility verification remains incomplete; the latest environment blocked the browser launch. Hosting is not configured or required to run locally. Lecture PDFs are not redistributed.
