# Studyloom

README prose word count: 564

An explainable study planner with an optional observation-and-adaptation loop, developed for an Intelligent Interactive Systems project.

## Status
Implemented: editable tasks, transparent ranking, bounded session plans, priority override, exclusion, completion, one-step undo, timer, opt-in page-visibility observation, tentative adaptation, accept/reject controls, forget controls and JSON export.

Demonstration tasks are fictional. The interrupted-session example injects labelled simulated observations into the same inference function used by the live timer. No trained model, grade prediction, camera, microphone, persistent profile or external AI call is used.

This is a prototype. Weights and adaptation thresholds are design assumptions, not validated learning guidance. Page departures do not establish distraction. No user study has been conducted. Browser and accessibility checks remain pending.

## Run
Requires Node.js 18 or later. No dependencies or API keys.

```sh
npm start
```

Open http://127.0.0.1:5173. Keep the terminal running; Ctrl+C stops the server.

```sh
npm test
```

Thirteen automated tests cover planning, invalid inputs, budget invariants, inference thresholds and timer observation rules.

## Technology
HTML and CSS provide the responsive interface. JavaScript modules implement rules, state and controls. The browser Page Visibility API supplies optional page-hidden events; a monotonic clock supplies elapsed time. Node.js serves local files and runs tests. Everything stays in tab memory until exported; reload clears state.

## Development record
- Initial concept: prioritise tasks from deadlines and confidence, explain the score, and retain user overrides.
- Lecture review: Lecture 2 requires sensing beyond explicit commands and interpretation under uncertainty. The design was extended with optional page-visibility observations and tentative shorter-block suggestions.
- Implementation: separate pure planning/inference functions from interface code. Adaptation appears after a block, requires acceptance, and never automatically completes tasks.
- Checks: 13 automated tests passed, including every supported budget at both block maxima. JavaScript syntax checks passed; the local server returned HTTP 200. Browser automation could not launch in this environment. These tests do not demonstrate improved learning or usability.
- Recovery: forget removes observations, decisions and undo history; plan undo never rewinds live measurements.

### Review fixes — 18 November 2026
- Balanced scoring now uses urgency + support; deadline scoring uses 3 × urgency + support. A regression test verifies a case where the two preferences produce different orders while preserving a user override.
- Adaptation decisions are described as past actions, with the current block maximum displayed separately to avoid stale claims after manual changes.
- Task actions restore keyboard focus after rendering; deletion selects the next task (or previous last task), with Add as the empty-list fallback. Saving a task focuses its Edit control.
- All 13 engine tests and JavaScript syntax checks pass. The new feedback and focus behaviours still need browser verification.

## AI assistance
OpenAI Codex helped interpret the supplied brief and slides, design the prototype, generate implementation and tests, and draft this README. Automated checks verified arithmetic, thresholds and timer transitions. The student still needs to inspect the interface, verify lecture alignment, conduct any claimed user evaluation and understand the implementation. No participant feedback or learning outcome has been invented.

## Inspection guide
- `src/engine.mjs`: scoring, planning, inference and observation functions.
- `src/app.mjs`: interface state and interaction controls.
- `tests/engine.test.mjs`: automated verification.
- `docs/website-checks.md`: walkthrough and pending browser checks.
- `docs/lecture-mapping.md`: design notes tied to supplied slide pages; not a report.

Public repository: https://github.com/sxk1420/studyloom

No submission commit is designated yet. Hosting, browser verification, evaluation and the assignment report are unfinished. No lecture PDFs are redistributed in this repository.
