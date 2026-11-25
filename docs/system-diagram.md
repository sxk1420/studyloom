# Studyloom system diagram

Implementation: `e8b1227a9c239258207392e7081106e52986dcad`. The redesigned dashboard retains the student-controlled interaction architecture and supports manually specified maximum block durations.

Solid connections show implemented flows. The dashed connection supplies
explicitly simulated observations. No trained model or external AI API is used.

```mermaid
flowchart TD
    A["Student: tasks, estimates and preferences"]
    B["Current tasks and settings"]
    C["Rule-based ranking and time allocation"]
    D["Study plan with explanations"]
    E["Optional timer and opt-in page visibility"]
    F["Latest block observations"]
    G["Rule-based adaptation suggestion"]
    H["Student accepts or rejects"]
    I["Student reviews remaining work"]
    J["Preview revised plan"]
    K["Student applies or cancels"]
    S["SIMULATED: example observations"]
    R["Retain current block limit"]
    Q["Retain current task estimate"]

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    S -.-> F
    F --> G
    G --> H
    H -->|"Accept: update block limit"| B
    H -->|"Reject"| R
    E -->|"End live block"| I
    I --> J
    J --> K
    K -->|"Apply: update task"| B
    K -->|"Cancel"| Q
```

## Implementation and control boundaries

- Ranking and adaptation use deterministic rules and thresholds, not a trained model or external AI service.
- Students can specify a maximum block length of 5–240 whole minutes. Each eligible task receives at most one block, constrained by its estimate, the maximum and the remaining budget.
- Adaptation proposes a 15-minute maximum only when the current maximum exceeds 15 minutes.
- Page-visibility observation is optional and off by default. It cannot identify which other websites or applications are being used.
- Hidden time does not establish distraction, concentration or learning.
- Simulated observations are explicitly labelled and are separate from live task progress.
- Rejecting an adaptation retains the current block limit. Cancelling a progress review retains the current task estimate.
- Students can override task priority and undo the latest plan change. Undo restores plan state, not elapsed time or forgotten observations.
- Timer activity and observations remain temporary and can be forgotten.
- Explicit browser saving stores tasks and planning settings. Restoration and deletion are student-controlled.
- JSON export can include observations. Import validates tasks and settings, previews replacement and requires confirmation. Imported observations do not become live evidence.
- The local Node server serves static files; planning and inference run in the browser.
- All illustrated components represent implemented functionality rather than proposed future features.

## Component architecture

This companion view shows implementation boundaries; the flow above explains the student-controlled loop. All solid boxes and connections below are implemented. Only the labelled demo input supplies simulated observations. No planned-only component is claimed.

```mermaid
flowchart TB
    SERVER["Node server · static files only"] --> UI
    USER["Student"] -->|"Inputs and decisions"| UI
    subgraph BROWSER["Browser · implemented"]
        UI["HTML/CSS controls and explanations"]
        APP["app.mjs · state and confirmation handlers"]
        ENGINE["engine.mjs · ranking, allocation, inference, review"]
        SIGNAL["Page Visibility API + monotonic clock"]
        MEMORY["Temporary observations + undo snapshot"]
        STORE["storage.mjs · validate saved plans"]
        LOCAL[("localStorage · tasks/settings only")]
        IMPORT["import.mjs · validate and extract inputs"]
        UI -->|"Events"| APP
        APP -->|"Validated inputs"| ENGINE
        ENGINE -->|"Plan or proposal"| APP
        APP -->|"Render feedback"| UI
        SIGNAL -->|"Opt-in observations"| MEMORY
        MEMORY -->|"Latest block"| ENGINE
        APP <-->|"Explicit save/restore/delete"| STORE
        STORE <--> LOCAL
        IMPORT -->|"Preview then confirm"| APP
    end
    SIM["SIMULATED · fixed example"] -.-> MEMORY
    FILE["Student-owned JSON file"] --> IMPORT
    APP -->|"Explicit export; may include observations"| FILE
```

The static server does not receive task data. Import excludes exported observations, decisions and calculated plans. Saving excludes timer observations and inferred decisions. The intelligence is the deterministic ranking and uncertain adaptation rule; confirmation handlers control whether proposals change state.
