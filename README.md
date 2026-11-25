# Studyloom

Approximate README prose word count: 769 (excluding setup code, inline code and URLs)

An explainable study planner with student-controlled observation, adaptation and progress review, built for an Intelligent Interactive Systems assignment.

## Status and implementation version

Implemented: editable tasks, explained ranking, time-budget planning, priority overrides, exclusion/completion, one-step Undo, an optional timer, opt-in page-visibility observation, accept/reject adaptation, progress review with preview/apply/cancel, explicit browser saving and validated JSON import/export.

The maximum block accepts **5–240 whole minutes**. Allocation also respects the task estimate and available time. Each task receives at most one block per plan, so unused time can remain. A 15-minute adaptation is offered only when it would shorten the current maximum.

The colourful dashboard separates tasks, planning and the timer. Example tasks are fictional. The interrupted-session example injects labelled simulated observations into the same inference function used by live blocks. No trained model, external AI service, camera or microphone is used. Rules and thresholds are design assumptions; page departures do not establish distraction, and elapsed time does not establish progress.

Website implementation: [`e8b1227a9c239258207392e7081106e52986dcad`](https://github.com/sxk1420/studyloom/commit/e8b1227a9c239258207392e7081106e52986dcad). Later evidence-only commits may update documentation without changing this implementation.

## Run and test

Requires Node.js 18 or later and npm. No API key or runtime package installation is needed to serve the website.

```sh
npm start
```

Open http://127.0.0.1:5173 and keep the terminal running. Ctrl+C stops it.

Install the locked test dependencies and run the suite:

```sh
npm ci
npm test
```

Individual suites:

```sh
npm run test:engine
npm run test:interface
npm run test:storage
node --test tests/import.test.mjs
```

**63 automated tests passed** in the latest developer terminal run on 25 November 2026: 17 engine, 38 simulated-DOM interface, 5 storage and 3 import-validation tests. The allocation check covers all 55,696 whole-number budget/maximum combinations from 5 to 240.

On 25 November 2026, the developer reported all 18 supplied browser checks passing, including task controls, custom limits, timer recovery, review, saving/import, observation, keyboard navigation and small-screen/zoom checks. The checks used VS Code’s embedded browser; its version was not reported. These are developer-reported results, not an independently observed test session or participant study. The test matrix and remaining limits are in [verification evidence](docs/website-checks.md).

## Technology and memory

HTML/CSS provide the interface. JavaScript modules implement planning and controls in the browser. The Page Visibility API and monotonic timer supply observations; the local Node server only serves files. jsdom is a test dependency.

Working tasks, latest observations and Undo live in tab memory. Save explicitly persists only tasks/settings in localStorage. Reload clears working state; Restore explicitly loads the saved copy. Edits do not autosave. Delete saved plan preserves the working tasks; Forget observations clears observations and undo history without deleting the saved plan. Relative deadlines need checking when restored on another day. Storage failures preserve the working plan.

Exports are separate files and can contain observations. Import validates, previews and confirms replacement inputs; it ignores exported observations and calculated plans. Progress review never deducts elapsed time or marks completion automatically.

## Development record

- [Initial prototype](https://github.com/sxk1420/studyloom/commit/2f501f5): explained task ranking and reversible controls. Lecture 2 informed optional observation and uncertain interpretation beyond task sorting.
- [Readability](https://github.com/sxk1420/studyloom/commit/45379cf): larger controls, named dialogs and preserved timer-task selection.
- [Review logic](https://github.com/sxk1420/studyloom/commit/e8f8d14) and [review interface](https://github.com/sxk1420/studyloom/commit/29a7cf1): explicit remaining-work estimates, non-mutating preview, apply/cancel and Undo.
- Reproducible tests and explicit saving added validation, simulated reload checks and failure handling. Historical suites grew from 35 to 49 tests.
- [Plan import](https://github.com/sxk1420/studyloom/commit/5f9f0d6): validated replacement with preview and Undo; 52 tests passed at that milestone.
- [Recovery fixes, custom limits and dashboard redesign](https://github.com/sxk1420/studyloom/commit/e8b1227a9c239258207392e7081106e52986dcad): corrected Undo losing the timed task's review and inconsistent deadline wording. Five new regressions failed before repair; the six added cases passed afterwards. Custom maximum validation, persistence/import and adaptation checks brought the suite to 63. The dashboard reorganised controls and feedback without changing ranking or the one-block policy.

## AI assistance and checking

OpenAI Codex assisted with interpreting the brief and lectures, interaction design, implementation, tests, documentation, diagrams and report drafting. Claude supplied review feedback. Confirmed bugs were reproduced before correction; proposed additions were checked against the actual brief rather than accepted automatically. Regression tests checked state transitions, validation and recovery. The developer supplied updated screenshots of the redesigned interface and reported the final 18 browser checks passing. No participant data or learning-benefit results are claimed.

## Evidence and project files

- [Architecture and boundaries](docs/system-diagram.md)
- [Three illustrated interactions](docs/interaction-walkthrough.md)
- [Test evidence and limitations](docs/website-checks.md)
- [Lecture mapping](docs/lecture-mapping.md)
- [Screenshot replacement checklist](docs/screenshot-checklist.md)

`src/engine.mjs` contains rules/timing/review; `src/app.mjs` contains interface handlers; `src/storage.mjs` and `src/import.mjs` validate saved/imported inputs. `tests/` contains the reproducible suite.

The ten repository screenshots were refreshed on 25 November 2026 to show the redesigned dashboard. They document three interaction walkthroughs: explainability and reversible priority control, uncertainty-aware adaptation, and reflective progress review. They demonstrate implemented interface behaviour, not independent participant evaluation. Screen-reader auditing, cross-browser coverage and independent user evaluation remain unverified. Public hosting is not configured. Lecture PDFs are not redistributed.

Public repository: https://github.com/sxk1420/studyloom
