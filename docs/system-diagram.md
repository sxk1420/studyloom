# Studyloom system diagram

Solid connections show implemented flows. The dashed connection supplies
explicitly simulated observations. No trained model or external AI API is used.

```mermaid
flowchart TD
    U["Student"]

    subgraph Browser["Browser — implemented"]
        UI["Controls and task inputs"]
        STATE["Current tasks and settings"]
        RANK["Rule-based ranking"]
        PLAN["Time-budget planner"]
        VIEW["Plan and explanations"]

        TIMER["Optional block timer"]
        SENSE["Opt-in page visibility"]
        OBS["Latest block observations"]
        INFER["Rule-based uncertain inference"]
        SUGGEST["Shorter-block suggestion"]
        CHOICE["Accept or reject"]

        REVIEW["Student progress review"]
        PREVIEW["Preview revised plan"]
        APPLY["Apply or cancel"]
        UNDO["One-step Undo"]

        SAVE["Explicit Save / Restore / Delete"]
        LOCAL[("Local storage: tasks and settings")]

        EXPORT["JSON export"]
        IMPORT["Validate import and preview"]
        CONFIRM["Confirm replacement or cancel"]
    end

    DEMO["SIMULATED: interrupted-session example"]
    FILE["Student-owned JSON file"]

    U --> UI
    UI --> STATE
    STATE --> RANK
    RANK --> PLAN
    PLAN --> VIEW
    VIEW --> U

    U --> TIMER
    TIMER --> OBS
    SENSE --> OBS
    U -->|"Enable observation"| SENSE
    DEMO -.->|"Labelled test observations"| OBS
    OBS --> INFER
    INFER --> SUGGEST
    SUGGEST --> U
    U --> CHOICE
    CHOICE -->|"Accept: change block maximum"| STATE
    CHOICE -->|"Reject: keep setting"| VIEW

    TIMER -->|"Finished live block"| REVIEW
    U -->|"Outcome and remaining estimate"| REVIEW
    REVIEW --> PREVIEW
    PREVIEW --> U
    U --> APPLY
    APPLY -->|"Confirm"| STATE
    APPLY -->|"Cancel: keep plan"| VIEW

    U --> UNDO
    UNDO -->|"Restore previous plan state"| STATE

    STATE --> SAVE
    U --> SAVE
    SAVE <--> LOCAL
    SAVE -->|"Explicit restore"| STATE

    STATE --> EXPORT
    OBS --> EXPORT
    EXPORT --> FILE
    FILE --> IMPORT
    IMPORT -->|"Validated tasks and settings only"| CONFIRM
    U --> CONFIRM
    CONFIRM -->|"Confirm"| STATE
```

## Boundaries

- Inference uses selected rules and thresholds, not a trained model.
- Page visibility does not reveal which other pages or applications are used.
- Hidden time is not proof of distraction.
- Observations and timer activity remain in tab memory.
- Optional browser storage contains only tasks and planning settings.
- Export can include observations; import ignores them.
- Preview does not change the plan until the student confirms.
- Undo restores plan state, not elapsed time or forgotten observations.
- The local Node.js server serves files; planning runs in the browser.
- No planned-only components are included in this diagram.
