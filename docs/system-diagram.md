# Studyloom system diagram

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

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    S -.-> F
    F --> G
    G --> H
    H -->|"Accept: update block limit"| B
    E -->|"End live block"| I
    I --> J
    J --> K
    K -->|"Apply: update task"| B
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

### Implementation and control boundaries

- All components shown are implemented. The dashed connection supplies
  explicitly labelled simulated observations for demonstration.
- Ranking and adaptation use transparent rules, not a trained model
  or external AI service.
- Page-visibility observation is optional and off by default.
  Hidden time does not establish distraction or concentration.
- Rejecting an adaptation or cancelling a review leaves the current
  plan settings or task estimates unchanged.
- Students can override task priority and undo the latest plan change.
  Undo does not reverse elapsed time or recover forgotten observations.
- Observations remain temporary and can be forgotten.
- Explicit browser saving stores tasks and settings. Restore and delete
  are student-controlled actions.
- JSON export supports downloading a snapshot. Import validates tasks
  and settings, previews the replacement and requires confirmation.
  Imported observations do not become live evidence.
- The local Node server serves website files; the application logic runs
  in the browser.

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
