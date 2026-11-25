# Website acceptance checks

Current working-revision result: all 63 tests (17 engine, 38 simulated-DOM interface, 5 storage, 3 import validation) passed on 24 November 2026. This revision extends base commit aa1e182; the new changes are not yet committed. Real-browser visual and native accessibility checks remain pending. These are not participant results.

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

Engine and simulated-DOM tests cover ranking, adaptation feedback and programmatic focus preservation. Native keyboard behaviour still requires the browser checks above.

## Readability and selection refinement — pending verification

- Select the second scheduled task for the timer, then change a planning preference or block maximum. It should remain selected if still scheduled. Excluding it should fall back to an available task.
- Check at a 375px viewport and 200% zoom that labels, long task names, metrics and controls remain readable without horizontal scrolling.
- Inspect all four dialogs with accessibility tooling; each should have a heading-derived accessible name.

## End-of-block review

1. Start a live block and finish early. Select Review progress. The original estimate should remain unchanged.
2. Choose Made progress and enter 10 remaining minutes. Preview the next plan, then Cancel. Nothing should change.
3. Repeat and Apply update. The task estimate should become 10; Undo restores its previous estimate.
4. Repeat with Finished; it should leave the schedule only after Apply. Undo restores it.
5. Choose Need more time and enter 60. Verify a revised estimate can increase.
6. Change the estimate after previewing; Apply must disappear until a new preview is generated.
7. Remove the timed task during its block. Finishing must not offer a review for a different task. Simulated observation examples must not offer task review.

Historical verification when review was added: 13 simulated-DOM checks passed for these review flows, cancellation, focus after applying, validation and forgetting. Native dialog rendering and real-browser interaction remain pending.

## Reproducible verification — current revision

Run `npm ci`, then `npm test` from the repository root. `npm run test:engine` runs the 17 logic tests; `npm run test:interface` runs the 38 interface tests. The lockfile fixes dependency versions. No test server, browser download, user account or API key is needed.

The interface suite reads the actual index.html and imports a fresh application module for each test. It checks ranking preference changes, user overrides, current-setting feedback, focus restoration, safe text rendering, validation, selected-task preservation, timer controls, synthetic observation thresholds, automatic completion, review preview/cancel/apply/undo, invalidation of old previews, missing-task handling and forgetting.

The harness provides controlled time, synthetic visibility events, and minimal dialog/scroll shims. It restores globals and closes each document after a test, and fails on unhandled interface errors. “Live observation” in a test means the application's live code path received synthetic events; it does not mean a real person was observed.

These tests establish repeatable interface state transitions. They do not establish visual correctness, native keyboard/focus trapping, mobile layout, browser throttling behaviour, screen-reader usability or improved learning. The manual scenarios above remain the real-browser checklist. Earlier notes about temporary scripts describe historical checks; the committed suite is now the reproducible source of evidence.

## Optional browser saving — 23 November 2026

Automated checks verify explicit saving, a new simulated page restoring the saved copy, no autosaving of later edits, restore/undo, deletion, corrupt-data handling, failed writes, active-timer protection, separation from Forget observations, and status updates after another tab deletes the copy. Storage tests verify field selection and validation.

Manual browser check: edit a task, Save plan, refresh and select Restore. Edit again and verify the unsaved status. Restore and Undo. Delete the saved copy, refresh and confirm Restore is disabled. Verify that timer observations never return. Check restoring on another day reminds the student to review relative deadlines. Different browser profiles and site addresses have separate storage; private browsing may discard it.

Use `npm run test:storage` for the five pure storage tests. `npm test` includes all four suites. These tests do not replace a real-browser local-storage check.

## Plan import verification

Historical result at the import milestone: all 52 tests passed. The current total is 63, including an import-preview/cancel interface regression.
The three import-validation tests check valid exports, exclusion of
observations and decisions, and rejection of invalid or oversized data.

The developer reported that the manual import workflow worked.
Detailed per-step results were not separately recorded.
This does not constitute an independent user study.

For final browser verification, record Pass/Fail beside each item:

- Export a modified plan and select the downloaded file for import.
- Preview shows the exported tasks without changing the current plan.
- Cancel leaves current tasks unchanged.
- Confirm replaces the current tasks and planning settings.
- Undo restores the previous plan.
- Invalid JSON or an unrelated JSON file is rejected.
- Import is disabled while a block is running or paused.
- Import does not overwrite the saved browser copy.
- Relative deadlines are accompanied by a reminder to check them.

## Review fixes — 24 November 2026

Six regression cases were added. Before the fixes, five failed and the replacement-task guard passed. After the fixes all 58 tests passed:

- Undo during a running block retains review access and can apply a remaining-work estimate.
- The same flow works while paused without rewinding elapsed time.
- Undoing removal restores the original task for review after automatic timer completion.
- A replacement task with the same numeric ID cannot receive the original task's review.
- Cards and explanations consistently describe overdue, today, tomorrow and later deadlines.
- Import preview uses the same deadline wording; cancellation preserves current tasks.

The active task is mapped to its object position in the saved undo snapshot. Restoring the snapshot reconnects that original task; matching numeric IDs alone would incorrectly attach replacements. Live measurements are not restored from undo.

The optional save panel now starts collapsed; action feedback is also displayed within the active panel; secondary text is at least 14px at the default 16px root size. The one-block policy is retained and unused-time feedback explains its consequence. These are implementation changes awaiting visual browser verification.

A browser attempt on 24 November was blocked: the environment denied the local server listener (EPERM), and automated Chrome exited before opening a page. No browser pass is claimed from that attempt.

### Remaining browser checks to record

Record browser/version, viewport, actions, observed result and Pass/Fail for each:

1. At 375px and 200% zoom, inspect the planner, expanded saving panel and every dialog for clipping and horizontal overflow.
2. Use Tab, Shift+Tab, Enter and Escape through task editing and review. Confirm visible focus, modal focus containment and focus return.
3. Start a block, change its maximum, Undo, finish and review. Repeat paused and after undoing task removal.
4. Try deadlines -2, 0 and 1; inspect the card, explanation and import preview.
5. Save, reload, expand saving and restore; export/import, cancel, apply and undo.
6. With observation enabled, leave/return during a block and finish after the threshold; check actual browser timing and visibility behaviour.

Developer screenshots and reported manual checks exist for the earlier version. No independent participant study or screen-reader audit has been completed.

## Manual maximum block — 24 November 2026

The maximum is now entered as 5–240 whole minutes. Five added tests cover validation, manual input/Undo, invalid-input recovery, adaptation with shorter custom limits, and custom-limit persistence/import. The allocation invariant check now covers all 55,696 whole-number budget/maximum pairs from 5 to 240. All 63 tests pass. Older 58-test results above describe the preceding repair stage.

Browser check still required: enter 37, leave the field with Tab, and inspect the plan; enter 4 and confirm the previous value is restored. Try 10 with the interrupted-session example: no suggestion should increase the maximum to 15. Try 42, accept 15, and Undo to restore 42. An active block retains its original duration.

The accompanying revised report predates this manual-input addition; update its test count and scope before final submission.

## Colourful dashboard redesign — 25 November 2026

Rebuilt the stylesheet and reorganised the page into an indigo introduction, lavender task panel, peach planner and mint timer section. Added Planner/Timer/Saved plan navigation, distinct time-summary tiles, restyled dialogs and a large elapsed-time display. Optional saving now follows the timer; manual maximum-block input and all existing interaction IDs remain intact. The 63 existing automated checks pass against the redesigned HTML.

This changes presentation, not task ranking, inference thresholds or the one-block-per-task policy. The layout includes single-column breakpoints, wrapping action rows, visible focus outlines, reduced-motion support and print rules. Actual responsive layout, keyboard behaviour and colour perception still need browser review.

A local preview server returned HTTP 200 on 25 November after permission was granted; automated Chrome still exited before loading a page. No screenshot or visual browser pass is claimed. Earlier report screenshots show the old green layout and should be refreshed before submission.
