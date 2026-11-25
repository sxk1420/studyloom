# Studyloom

Approximate README prose word count: 870

An explainable, student-controlled study planner developed for Intelligent Interactive Systems Assignment 2 at the University of Birmingham.

Studyloom translates Assignment 1 research on explanations, uncertainty and appropriate reliance into a browser-based prototype. Its contribution is an inspectable, contestable and reversible interaction model rather than a novel scheduling algorithm.

## Implementation status

Implemented functionality includes:

- Editable tasks, estimates, deadlines and confidence ratings.
- Explainable ranking and time-budget allocation.
- Priority overrides, exclusion, completion and Undo.
- Custom maximum block durations of 5–240 whole minutes.
- Optional timer and opt-in page-visibility observation.
- Threshold-based adaptation, abstention, acceptance and rejection.
- Remaining-work review with preview, apply and cancel.
- Explicit browser saving and validated JSON import/export.

Ranking and allocation are separate. Each eligible task receives at most one block, improving traceability but potentially leaving unused time.

Adaptation requires at least five unpaused minutes, either three page departures or two hidden minutes, and a current maximum above 15 minutes. Students must confirm the suggested 15-minute maximum before it is applied.

The interrupted-session example injects explicitly labelled simulated observations into the same inference function used by live blocks. Live sensing and insufficient-evidence abstention have also been demonstrated separately.

No trained model, external AI service, camera or microphone is used. Thresholds are design heuristics, not validated measures of attention.

Tested implementation: [`e8b1227a9c239258207392e7081106e52986dcad`](https://github.com/sxk1420/studyloom/commit/e8b1227a9c239258207392e7081106e52986dcad).

Supplementary live evidence: [`ea1fb3128978dbeeeb3950b481e4ebe79b4fce56`](https://github.com/sxk1420/studyloom/commit/ea1fb3128978dbeeeb3950b481e4ebe79b4fce56).

Later documentation commits do not necessarily change the tested implementation.

## Run and test

Requires Node.js 18 or later, npm and a modern browser. The verified environment used Node.js v24.9.0 and npm 11.6.0.

No API key or runtime package installation is required.

```sh
git clone https://github.com/sxk1420/studyloom.git
cd studyloom
npm start
```

Open http://127.0.0.1:5173. Keep the terminal running. Ctrl+C stops the server.

Install the locked test dependencies and run verification:

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

## Architecture and information boundaries

HTML/CSS provide presentation. JavaScript modules implement browser-side planning, inference and interaction. The local Node server serves static files.

- `src/engine.mjs`: ranking, allocation, timing and review rules.
- `src/app.mjs`: interface handlers and interaction state.
- `src/storage.mjs`: persistence and validation.
- `src/import.mjs`: JSON import validation.
- `tests/`: reproducible automated verification.
- `docs/`: architecture and development evidence.

Deterministic rules support reproducibility and inspectability but cannot establish individual suitability.

Working tasks, observations and Undo remain in temporary tab memory. Explicit saving persists only tasks and settings in localStorage. Edits do not autosave.

Forget observations clears observations and Undo history without deleting the saved plan. JSON exports may include observations, but import ignores exported observations and calculated plans.

Progress review uses student-reported remaining work rather than automatically deducting elapsed time.

## Development record

- [Initial prototype](https://github.com/sxk1420/studyloom/commit/2f501f5): explained ranking and reversible controls. Lecture 2 informed uncertain interpretation and optional observation.
- [Readability improvements](https://github.com/sxk1420/studyloom/commit/45379cf): larger controls, named dialogs and preserved timer-task selection.
- [Review logic](https://github.com/sxk1420/studyloom/commit/e8f8d14) and [review interface](https://github.com/sxk1420/studyloom/commit/29a7cf1): student-reported progress, non-mutating preview, confirmation and recovery.
- Explicit saving and reproducible verification increased historical test totals from 35 to 49.
- [Validated plan import](https://github.com/sxk1420/studyloom/commit/5f9f0d6): replacement preview, confirmation and Undo; 52 tests passed.
- [Recovery fixes, custom limits and redesign](https://github.com/sxk1420/studyloom/commit/e8b1227a9c239258207392e7081106e52986dcad): repaired active-timer task association during Undo. Five regression cases failed before correction; all six added cases passed afterwards. Custom-duration verification brought the suite to 63 tests.
- [Refreshed interaction evidence](https://github.com/sxk1420/studyloom/commit/16df9d058f1d11d1dcd5390b35f6c197d832bcab): replaced ten screenshots to match the redesigned interface.
- [Supplementary live verification](https://github.com/sxk1420/studyloom/commit/ea1fb3128978dbeeeb3950b481e4ebe79b4fce56): demonstrated live sensing, adaptation and insufficient-evidence abstention.

The Undo repair reconnects the original timed task through its saved snapshot rather than relying on reusable numeric identifiers. Elapsed measurements are preserved.

## Verification

On 25 November 2026, the developer ran 63 successful automated tests:

| Suite             | Passed |
| ----------------- | -----: |
| Engine            |     17 |
| Interface         |     38 |
| Storage           |      5 |
| Import validation |      3 |
| Total             |     63 |

Allocation invariants cover all 55,696 budget/maximum combinations from 5 through 240.

The developer also reported all 18 supplied browser checks passing in VS Code's embedded browser. Its version was not recorded.

Two supplementary screenshot-supported live demonstrations extended this evidence:

| Observation         | Abstention | Adaptation |
| ------------------- | ---------: | ---------: |
| Elapsed time        |      00:30 |      05:07 |
| Departures          |          1 |         10 |
| Hidden time         |      00:23 |      04:24 |
| Adaptation proposed |         No |        Yes |

- [Insufficient-evidence abstention](docs/evidence/11-insufficient-evidence.png)
- [Live adaptation](docs/evidence/12-live-observation.png)

These deliberately generated observations demonstrate functional sensing and selective intervention, not natural study behaviour.

Automated interface tests use jsdom and synthetic events. They cannot establish native browser accessibility or actual attention measurement.

See the [complete verification record](docs/website-checks.md) for the manual matrix, regression history, environment and limitations.

## Developer contributions and AI assistance

OpenAI Codex and ChatGPT assisted with interpreting the brief, design exploration, implementation, testing, documentation and report preparation. Claude provided critical review feedback.

AI-assisted work was checked against assignment requirements and implementation behaviour.

The developer ran automated tests, completed browser walkthroughs, refreshed screenshots, recaptured inconsistent Undo states using comparable settings, performed both supplementary live demonstrations and checked the repository state.

The development record and verification documentation identify implementation changes, regression repairs and their supporting evidence.

No participant results or educational-benefit findings are claimed.

## Evidence and supporting documentation

- [Architecture and implementation boundaries](docs/system-diagram.md)
- [Three illustrated interactions](docs/interaction-walkthrough.md)
- [Verification evidence and limitations](docs/website-checks.md)
- [Lecture-informed design mapping](docs/lecture-mapping.md)
- [Screenshot checklist](docs/screenshot-checklist.md)
- [All twelve evidence screenshots](docs/evidence/)
- [Automated test suite](tests/)

Ten screenshots document the original three developed interactions. Two supplementary captures demonstrate live abstention and adaptation.

## Limitations and future evaluation

Current evidence establishes functional behaviour within documented conditions, not educational effectiveness, accurate concentration measurement or empirically improved appropriate reliance.

Independent participant evaluation, screen-reader auditing and systematic cross-browser coverage remain unverified.

Future controlled evaluation could vary explanation detail and recommendation suitability, measuring comprehension, decision time and appropriate acceptance or rejection.

Public hosting is not configured. Lecture PDFs are not redistributed.

Public repository: https://github.com/sxk1420/studyloom
