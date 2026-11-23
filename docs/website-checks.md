# Website acceptance checks

Status: all 49 tests (16 engine, 28 simulated-DOM interface, 5 storage) passed on 23 November 2026. Real-browser visual and native accessibility checks remain pending. These are not participant results.

## 1. Normal planning
Load “A balanced hour”. Expect 50 study minutes, 5 break minutes, 5 unused minutes and 45 estimated minutes remaining. Expand the first explanation. Put database notes first: the first block should change despite its lower score. Undo restores the prior order.

## 2. Overload and recovery
Load “Only 20 minutes”. Expect one 20-minute block and 75 minutes remaining. Add, edit, exclude, complete, reopen and remove a task. Undo a removal. Try an empty name, fractional duration and time below 5; invalid values must not alter the plan.

## 3. Uncertain adaptation
Load “An interrupted session”. Verify SIMULATED EXAMPLE is visible. Accept 15-minute blocks: the plan should change; Undo restores the former maximum. Reload the example and reject: the maximum stays unchanged. Forget observations: evidence and decision disappear, Undo is disabled, and plan settings remain.

## 4. Live loop
Start a block with observation off: departures and hidden time must not be collected. Finish and review. Start another with observation on; leave and return to the page three times over at least five minutes, then finish. Expect a tentative suggestion. Pausing must stop elapsed and hidden-time accumulation. Do not assume page departures measure concentration.

## 5. Usability and safety of state
Check keyboard navigation, visible focus, dialog Escape and focus return, readable layout at 375px width, no horizontal overflow, and export validity. Try a task name containing HTML: it must display as text. Start a timer, then edit the plan: the active timer must retain its original task and duration. Forget while running: timing stops and evidence clears.

## Suggested evaluation later
Ask a volunteer to explain why the first task was selected, override it, recover a removal and reject a simulated inference. Record observed difficulties and their actual comments with consent. Do not claim this proves learning benefits. This evaluation has not been run.

## Regression checks after review fixes
1. Add a high-confidence task due today and a low-confidence task due tomorrow, both 25 minutes. Exclude other tasks. Balanced mode puts tomorrow's task first (8 versus 7); deadline mode puts today's task first (19 versus 18). An explicit Do first override still wins.
2. Load the interrupted example, accept 15 minutes, then manually select 25. The panel must show the earlier acceptance and “Current maximum: 25 minutes per block.” Undo should restore 15 and update the displayed current maximum. Repeat after rejection and after loading a normal-plan example.
3. Use Tab and Enter to pin, exclude, complete and remove tasks. Focus should stay on the same action when it survives. Deletion should focus the next task's Edit control, then the previous task if last, or Add if the list becomes empty. Saving an edit or new task should focus that task's Edit control.

These three checks are pending user/browser verification; only the ranking regression has an automated engine test.

## Readability and selection refinement — pending verification
- Select the second scheduled task for the timer, then change a planning preference or block maximum. It should remain selected if still scheduled. Excluding it should fall back to an available task.
- Check at a 375px viewport and 200% zoom that labels, long task names, metrics and controls remain readable without horizontal scrolling.
- Inspect both dialogs with accessibility tooling; each should have a heading-derived accessible name.

## End-of-block review
1. Start a live block and finish early. Select Review progress. The original estimate should remain unchanged.
2. Choose Made progress and enter 10 remaining minutes. Preview the next plan, then Cancel. Nothing should change.
3. Repeat and Apply update. The task estimate should become 10; Undo restores its previous estimate.
4. Repeat with Finished; it should leave the schedule only after Apply. Undo restores it.
5. Choose Need more time and enter 60. Verify a revised estimate can increase.
6. Change the estimate after previewing; Apply must disappear until a new preview is generated.
7. Remove the timed task during its block. Finishing must not offer a review for a different task. Simulated observation examples must not offer task review.

Verification: 13 simulated-DOM checks passed for these review flows, cancellation, focus after applying, validation and forgetting. Native dialog rendering and real-browser interaction remain pending.

## Reproducible verification — 23 November 2026

Run `npm ci`, then `npm test` from the repository root. `npm run test:engine` runs the 16 logic tests; `npm run test:interface` runs the 19 interface tests. The lockfile fixes dependency versions. No test server, browser download, user account or API key is needed.

The interface suite reads the actual index.html and imports a fresh application module for each test. It checks ranking preference changes, user overrides, current-setting feedback, focus restoration, safe text rendering, validation, selected-task preservation, timer controls, synthetic observation thresholds, automatic completion, review preview/cancel/apply/undo, invalidation of old previews, missing-task handling and forgetting.

The harness provides controlled time, synthetic visibility events, and minimal dialog/scroll shims. It restores globals and closes each document after a test, and fails on unhandled interface errors. “Live observation” in a test means the application's live code path received synthetic events; it does not mean a real person was observed.

These tests establish repeatable interface state transitions. They do not establish visual correctness, native keyboard/focus trapping, mobile layout, browser throttling behaviour, screen-reader usability or improved learning. The manual scenarios above remain the real-browser checklist. Earlier notes about temporary scripts describe historical checks; the committed suite is now the reproducible source of evidence.

## Optional browser saving — 23 November 2026

Automated checks verify explicit saving, a new simulated page restoring the saved copy, no autosaving of later edits, restore/undo, deletion, corrupt-data handling, failed writes, active-timer protection, separation from Forget observations, and status updates after another tab deletes the copy. Storage tests verify field selection and validation.

Manual browser check: edit a task, Save plan, refresh and select Restore. Edit again and verify the unsaved status. Restore and Undo. Delete the saved copy, refresh and confirm Restore is disabled. Verify that timer observations never return. Check restoring on another day reminds the student to review relative deadlines. Different browser profiles and site addresses have separate storage; private browsing may discard it.

Use `npm run test:storage` for the five pure storage tests. `npm test` includes all three suites. These tests do not replace a real-browser local-storage check.
