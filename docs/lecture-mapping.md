# Lecture-informed implementation notes

These notes connect the implemented prototype to the supplied lectures and support the accompanying report.

| Supplied lecture | Relevant pages | Concrete design decision |
|---|---|---|
| W01 L01, From Calculators to Copilots | 14 | Identify initiative (student starts), inference (possible session mismatch), visibility (observations and rule), reversibility (undo). |
| W01 L02, Ingredients | 5, 18–19 | Optional Page Visibility signals go beyond explicit commands; a rule makes an uncertain interpretation; a suggestion changes the interaction; acceptance/rejection closes the loop. A priority calculator alone was insufficient. |
| W02 L04, Perception, Attention and Feedback | 14, 18–20 | Explain the threshold and acknowledge changes immediately. Deliver adaptation after a block to avoid interrupting study. No measured attention benefit is claimed. |
| W02 L05, Memory, Mental Models and Cognitive Load | 8–10, 16–17 | Visible task controls support recognition. Short summaries with expandable explanations limit interface burden. Explicit memory boundaries discourage a false belief that the system knows or remembers everything. |
| W02 L06, Action, Error, Agency and Decision | 6, 9, 13–15 | Provide visible outcomes, undo for slips, persistent first-priority overrides and a veto on adaptation. Explain ranking because the top result influences decisions. |
| W04 L10, Context Engineering and Memory | 12, 14–15 | Keep current observations inspectable and forgettable. Proposed preference changes require approval and remain directly editable. No hidden long-term profile is maintained. |
| W04 L12, Tools, Connectors and the Boundary | 5, 13–16 | Separate proposals from state-changing actions. Feedback comes from actual state changes. There is no LLM tool-calling implementation; this is an application of the boundary principle. |

## Limitations to test
The three-departure/two-hidden-minute threshold is a chosen criterion, not calibrated sensitivity. Online reading can cause false alarms; off-screen distraction can be missed. Users may reject a correct suggestion. Timer time does not demonstrate effort or learning. Background throttling or device sleep can delay the automatic finish notification. Only the latest block observation is retained. Reload clears working session state; explicitly saved tasks and settings remain in browser storage until deleted and require explicit restoration.
