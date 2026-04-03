# Prompt-First Workspace Workbench Design

**Date:** 2026-04-03

## Goal

Reframe the workspace experience from a card-led module entry into a prompt-first workbench that makes the current investigation explicit, shows how the system coordinates device, cloud, and AI agent capabilities, and renders results as generated responses to the current question rather than as fixed dashboards.

This design implements the requirements from `uiux/Workspace-UI-Feedback-2026-04-01.zh-CN.md`, with specific emphasis on:

1. reducing the “pre-defined card / fixed query” impression
2. visibly expressing system capability through device signals, cloud-side processing, agent reasoning, backend actions, and auditability

## Scope

This design covers:

- the workspace selection page
- the shared workspace shell and prompt-first workbench pattern
- the three workspace surfaces: `Operations`, `Support`, and `Growth`
- the role of the right-side process rail
- the treatment of `Home Dashboard` inside `Support`

This design does **not** add new top-level workspaces or expand the product beyond:

- `Operations`
- `Support`
- `Growth`

## Design Thesis

The interface should feel like a live investigation surface.

Users should always be able to answer these questions immediately:

1. What question is the system working on right now?
2. What scope and objects is that question about?
3. What device-side, cloud-side, and agent-side work is happening?
4. What result was generated from that process?
5. Why did the system reach this conclusion, and what happened in the background?

If any screen can still be mistaken for a static dashboard with a renamed title, the design has failed.

## Shared Interaction Model

### 1. Workspace selection remains

The app continues to land on a workspace selection page before entering a specific workspace.

The role of this page changes:

- from “three product cards”
- to “three ways to begin work”

Each workspace entry must communicate:

- one-sentence positioning
- the primary work objects
- one or two representative investigations
- a clear enter action

The page should not read like a dashboard of modules or capabilities.

### 2. Every workspace becomes a prompt-first workbench

After entering a workspace, the user lands directly in a workbench rather than a card gallery, empty chat screen, or static report.

The shared page pattern is:

1. top shell with brand, user, customer hierarchy, and workspace
2. pinned `Query Bar`
3. `Current Question` / interpreted intent section
4. visible system capability chain:
   `Device Signals → Cloud Checks → Agent Reasoning / Actions`
5. generated result surface
6. fixed right rail:
   `Reasoning`, `Backend Actions`, `Audit Log`

### 3. Results must be visibly query-driven

The result area must always feel like a response to the active question.

Therefore:

- the current prompt stays visible after navigation into a scenario
- the prompt can be refined, narrowed, rephrased, or followed up
- page headings and summaries must reference the active investigation
- the result blocks must feel assembled for the current case, not permanently fixed

Starter prompts remain valid, but they must be presented as:

- `Starter Prompts`
- `Suggested Questions`
- `Suggested Investigations`

They must never be framed as:

- saved reports
- fixed queries
- templates

## Shared Information Architecture

### Top bar and header hierarchy

The top portion of the product should emphasize four layers:

1. brand
2. customer hierarchy
3. current workspace
4. current user

Recommended arrangement:

- row 1: `Brand` on the left, `Logged in as ...` on the right
- row 2: customer hierarchy breadcrumb on the left, `Workspace: X` on the right

The breadcrumb model should support:

`Region -> ISP -> Sub Group -> Subscriber -> Location -> Home / Office`

Platform-internal language like `Tenant`, `Organization`, or `Scope` should not dominate the visible hierarchy on normal workspace entry screens.

### Query bar

The query bar is a persistent anchor, not a disposable input.

It should communicate:

- active question
- current scope or entity context
- whether the system is generating, updating, or ready for follow-up

The query bar must remain visible after a scenario is entered.

### Current question framing

Below the query bar, a compact section should interpret the active question in product language, for example:

- active investigation
- recognized entities
- current scope
- working objective
- suggested refinement actions

This section is how the UI explicitly tells users: “the page below was generated from this question.”

### Main capability chain

The central visual differentiator is a shared, visible process strip or block that shows three stages:

1. `Device Signals`
2. `Cloud Checks`
3. `Agent Reasoning / Actions`

This is a first-class part of the main canvas, not only a right-rail detail.

Its job is to demonstrate that the system is coordinating:

- device telemetry or local execution
- cloud data, enrichment, or backend checks
- agent interpretation, decision-making, and recommended or executed actions

This area must vary by workspace and by scenario so it feels grounded in the current investigation.

### Generated result surface

The main result area should be a generated composition of blocks chosen for the current question.

The layout should support combinations such as:

- summary / situation framing
- impacted entities or candidate list
- evidence or comparison view
- recommended actions
- next questions / follow-up prompts

The result surface should avoid reading as a stable dashboard template that merely swaps values.

### Right rail

The right rail remains fixed and always contains:

1. `Reasoning`
2. `Backend Actions`
3. `Audit Log`

Its role is supporting evidence and traceability.

It should not be the only place where system capability is shown. The main canvas already exposes the high-level chain; the right rail provides finer-grained proof.

## Shared Visual Direction

### Welcome page

The workspace selection page should reduce “equal-sized feature cards” and increase the feeling of three distinct work modes.

It should still be scannable and lightweight, but no longer read as:

- three preset modules
- three dashboard tiles
- three static landing cards

### Workbench

The workbench should feel operational, alive, and generated.

Desired qualities:

- clear top-to-bottom narrative
- minimal dashboard chrome
- strong prompt and investigation framing
- restrained cards only where a card is the correct unit of generated content
- obvious sense of process between data inputs and agent output

Avoid:

- large static scenario cards as the main content
- hero-card dashboards
- symmetric KPI mosaics that look pre-authored
- result areas that could belong to any unrelated dashboard

## Workspace-Specific Designs

### Operations

#### Positioning

`Discover and explain fleet-wide risks`

#### Primary objects

- incident
- cohort
- region
- location

#### Primary scenario for this round

`Post-Rollout Hidden Regression Detection`

#### Secondary scenario

`Regional Incident Interpretation`

#### Operations workbench emphasis

The page should foreground:

- risk summary
- abnormal cohort detection
- firmware / region / model correlation
- high-risk locations
- why the system believes this is a rollout-related regression

#### Operations capability chain content

`Device Signals`

- gateway telemetry
- disconnect patterns
- cohort anomaly signals

`Cloud Checks`

- firmware inventory
- regional aggregation
- model/version correlation
- incident history comparison

`Agent Reasoning / Actions`

- regression confidence
- root-cause synthesis
- rollout rollback recommendation
- escalation or report generation

Operations should not center the UI around deeply technical implementation labels such as DPI-specific internals unless they directly support the current business-operational investigation.

### Support

#### Positioning

`Handle cases and location issues`

#### Primary objects

- case
- location
- home
- gateway

#### Primary scenario for this round

`Critical Session Protection`

#### Secondary scenario

`Autonomous Wi-Fi Recovery`

#### Support workbench emphasis

The page should foreground:

- protected session or critical moment
- current risk state
- whether protection is preventive or already mitigating visible impact
- local or backend actions already executed
- verification result
- final outcome

For the secondary scenario, the page should emphasize:

- location summary
- case summary
- identified issue
- executed actions
- verification result
- closed-loop outcome

#### Support capability chain content

`Device Signals`

- gateway quality metrics
- local interference detection
- session-level QoS signals
- on-prem device state

`Cloud Checks`

- subscriber context
- traffic prioritization rules
- service and policy checks
- historical degradation comparisons

`Agent Reasoning / Actions`

- classify likely cause
- decide whether to protect or remediate
- trigger local or cloud action
- verify result
- close or continue the case

#### Home Dashboard treatment

The existing `Home Dashboard` should be demoted to a secondary drill-in detail surface.

It should not remain a primary workspace entry point, primary result state, or dominant navigation destination.

It can be opened from within a generated case view when the user wants deeper home-level detail.

### Growth

#### Positioning

`Identify upsell and churn prevention opportunities`

#### Primary objects

- opportunity
- segment
- offer
- campaign

#### Primary scenario for this round

`Pre-Churn Rescue / Plan Upgrade Opportunity`

#### Growth workbench emphasis

The page should foreground:

- opportunity summary
- candidate locations
- why the location or household was selected
- recommended offer or rescue action
- expected business impact

Growth must no longer read as `Coming Soon`.

It must clearly stand beside troubleshooting as a first-class work mode, while staying focused on CSP-facing growth and retention use cases.

#### Growth capability chain content

`Device Signals`

- device profile
- usage peaks
- network experience patterns
- saturation behavior

`Cloud Checks`

- segmentation
- churn scoring
- opportunity ranking
- offer eligibility

`Agent Reasoning / Actions`

- explain why this household is a candidate
- select recommended offer or rescue intervention
- estimate impact
- suggest next campaign or operator action

This round should not broaden into ad-tech-style targeting or broad data monetization storytelling.

## Entry Page Changes

The workspace selection page should be redesigned to support the new workbench story.

Each workspace entry should include:

- positioning statement
- primary objects
- representative investigations
- enter workbench action

It should also preview the query-driven nature of the system, for example by:

- using “Suggested Investigations” language
- showing a visible sense that entry leads into an active workbench
- avoiding the visual style of generic feature cards

## Process and State Behavior

### Empty state

Before the first query, the workbench should still feel active.

It may show:

- suggested investigations
- current scope context
- capability chain preview
- workspace-specific active themes or priorities

But it must not look like a module chooser.

### During generation

When a prompt is submitted:

- the active question remains visible
- the capability chain should show progress or active stages
- the right rail should switch to current reasoning, backend action, and audit updates

### After generation

After results appear:

- the current question remains editable
- follow-up prompts are shown as continuation, not as a reset
- the result composition remains visibly tied to the active question

## Component and Data Implications

This design assumes reuse and restructuring of existing building blocks rather than a ground-up rewrite.

Expected areas of change:

- workspace welcome page structure and wording
- shared app shell / top hierarchy presentation
- shared workbench framing sections across all workspace pages
- main scenario presentation area
- visible capability-chain component in the main canvas
- tighter coupling between active scenario, query framing, and right-rail data
- reduced prominence of static support home dashboard entry

## Success Criteria

The redesign succeeds if:

1. users can tell at a glance what question the system is answering
2. the main canvas visibly shows device, cloud, and agent coordination
3. each workspace feels like a real work entry point rather than a module tile
4. `Support` clearly communicates both handling and protecting
5. `Growth` feels fully active, not deferred
6. the right rail consistently explains reasoning, backend process, and auditability
7. the result area feels generated from the current question, not like a renamed dashboard

## Risks and Guardrails

### Risk: workbench becomes another dashboard

Guardrail:

- keep the prompt and current question visible
- make the capability chain scenario-specific
- ensure result blocks are clearly assembled for the active investigation

### Risk: too much process chrome overwhelms the result

Guardrail:

- keep the chain concise and high signal
- leave detail to the right rail
- prioritize outcome clarity over ornamental process decoration

### Risk: workspace welcome still feels like three product cards

Guardrail:

- anchor each entry around work intent and representative investigations
- reduce equal-weight promotional card treatment
- make the enter action feel like moving into a work mode

### Risk: Support falls back to generic troubleshooting

Guardrail:

- treat `Critical Session Protection` as a first-class scenario
- show closed-loop protection and verification
- keep `Home Dashboard` subordinate to the case view

## Testing and Review Expectations

Implementation should be reviewed against the following questions:

1. Is the current question always visible in the workbench?
2. Does the top hierarchy clearly separate brand, customer hierarchy, workspace, and user?
3. Is the device/cloud/agent chain visible in the main canvas for all three workspaces?
4. Does the right rail remain consistent and useful?
5. Does each workspace focus on the intended scenario and object model?
6. Has `Growth` fully replaced its former “coming soon” posture?
7. Has `Home Dashboard` been demoted to a secondary drill-in?
