# Studyloom verification evidence

Website implementation: [`e8b1227a9c239258207392e7081106e52986dcad`](https://github.com/sxk1420/studyloom/commit/e8b1227a9c239258207392e7081106e52986dcad).

## Evidence summary

- Automated: **63 tests passed**, comprising 17 engine, 38 interface, 5 storage and 3 import-validation tests. The latest run against the redesigned HTML passed on 25 November 2026 before the same website files were committed.
- Manual: on 25 November 2026, the developer reported that all 18 supplied browser checks worked. The matrix below records that report; the assistant did not observe those browser interactions independently.
- Browser: **VS Code’s embedded browser**, confirmed by the developer. VS Code and embedded browser versions were not reported. Individual timings, logs and screenshots for each check were not supplied with the confirmation. This limits reproducibility.
- Screenshots: the ten existing files were captured on 23 November and show the earlier interface. They support the original walkthrough, not visual verification of the redesigned dashboard.
- No independent participant study, screen-reader audit or systematic cross-browser evaluation has been conducted. These checks do not establish improved learning, concentration or appropriate reliance.

## Developer-reported manual results

Every result below is **reported pass**, based on the developer's aggregate confirmation after receiving this numbered checklist. It is not a separately recorded observation for each case.

| # | Check | Expected behaviour | Result |
|---|---|---|---|
| 1 | Default plan | Balanced hour: 50 study, 5 break and 5 unused minutes; recursion first. | Reported pass |
| 2 | Task controls | Add/edit, priority, exclusion, completion, reopening, removal and Undo update the plan appropriately. | Reported pass |
| 3 | Invalid task input | Empty name, zero duration and fractional duration cannot be saved. | Reported pass |
| 4 | Manual maximum | 37 is accepted; recursion receives its 30-minute estimate; 4, 241 and 12.5 restore 37. | Reported pass |
| 5 | Limited time | Twenty-minute example schedules one 20-minute block and exposes 75 remaining minutes. | Reported pass |
| 6 | Priority and Undo | Database notes moves first; Undo restores recursion first. | Reported pass |
| 7 | Timer controls | Elapsed time stops during pause and continues on resume. | Reported pass |
| 8 | Undo during a block | Running/paused blocks retain the original task and duration; finishing offers progress review. | Reported pass |
| 9 | Progress review | Preview/cancel preserve the estimate; Apply changes it to 10; Undo restores the original. | Reported pass |
| 10 | Simulated adaptation | Explicit simulation: 42→15 only on acceptance; Undo restores 42; rejection preserves the setting; 10 is not increased. | Reported pass |
| 11 | Saving/restoration | A saved task and custom maximum survive refresh and explicit Restore; later changes do not autosave. | Reported pass |
| 12 | Export/import | Cancel preserves inputs; confirmation imports them; Undo restores the pre-import state. | Reported pass |
| 13 | Forget observations | Evidence/decisions disappear and Undo is disabled; current tasks and explicitly saved copy remain. | Reported pass |
| 14 | Observation off | Switching tabs does not collect departures or hidden time; the display says Not observed. | Reported pass |
| 15 | Observation on | Three departures over at least five unpaused minutes produce a tentative suggestion after finishing, with a maximum above 15. | Reported pass |
| 16 | Automatic finish | A five-minute block ends with review available; the task is not automatically complete. | Reported pass |
| 17 | Keyboard/dialogs | Tab, Shift+Tab, Enter and Escape provide visible focus, modal containment and useful focus return. | Reported pass |
| 18 | Narrow layout and zoom | At 375px width and separately at 200% zoom, controls/dialogs remain reachable without clipping or horizontal overflow. | Reported pass |

These results describe the tested developer setup only. They are not an accessibility-conformance claim. The keyboard check did not include a screen reader.

## Reproduce the automated checks

From the repository root:

```sh
npm ci
npm test
```

Individual commands: `npm run test:engine`, `npm run test:interface`, `npm run test:storage`, and `node --test tests/import.test.mjs`.

The engine suite checks allocation, ranking, boundaries, timing and review. Allocation invariants run for all 55,696 budget/maximum pairs from 5 through 240. Storage and import tests check field selection, corrupt/invalid data and preservation of original inputs.

The interface suite reads the actual HTML and imports a fresh application module for each test. It checks actual event handlers with controlled time, synthetic visibility events, programmatic focus and dialog/scroll shims. It restores globals and closes each document, failing on unhandled interface errors. A Live observation label in these tests denotes the live application path receiving synthetic events, not a person being observed.

Automated passes establish repeatable state transitions. They do not verify rendered CSS, native modal behaviour, actual tab events, browser throttling or screen-reader usability. The developer-reported manual results are a separate evidence source.

## Development regressions

At the review-repair stage, six cases were added: running-block Undo, paused-block Undo, restored removal before automatic finish, replacement-task rejection, consistent deadline wording and import-preview/cancel wording. Five failed before repair; the replacement-task guard already passed. All six passed after repair, bringing the historical total to 58.

Undo restores cloned state. The correction maps the original timed task to its position in the saved snapshot and reconnects it on restoration. Matching reusable numeric IDs alone would attach a replacement task incorrectly. Elapsed measurements are never rewound.

Five further cases cover manual maximum validation, plan/Undo behaviour, invalid-input recovery, adaptation for custom limits and saving/restoring/importing custom limits. Together with the expanded allocation invariant check, these brought the total to 63. Earlier 35/49/52/58 totals describe historical milestones, not the current suite.

## Automation environment and remaining limits

The assistant's 24 November browser attempt was blocked by a denied local listener and a Chrome launch failure. On 25 November, permission enabled a preview server, which returned HTTP 200; Chrome still exited before loading a page. Neither attempt establishes a visual browser pass. The developer's subsequent reported checks are recorded above separately.

Still unverified: screen-reader behaviour, systematic cross-browser/device coverage, sleep/background-throttling extremes, colour-vision accessibility and educational effectiveness. An independent study could ask students to explain a recommendation, override it, recover an error and reject an unsuitable simulated suggestion; this study has not been run.

The repository walkthrough screenshots have been refreshed for the redesigned interface. The report figures must be checked against these replacement captures before submission. See [screenshot checklist](screenshot-checklist.md).

## Test environment

- Verification date: 25 November 2026
- Operating system: macOS
- Device: MacBook Air
- Node.js: v24.9.0
- npm: 11.6.0
- Automated interface testing: jsdom 26.1.0
- Browser: VS Code embedded browser (version unrecorded)
- Automated tests: 63 passed, 0 failed
- Skipped tests: 0
- Cancelled tests: 0
- Test execution time: approximately 2.40 seconds
- Developer-reported manual browser checks: 18 passed
