# Command Center Demo Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the three command-center workspace tabs so each scope action lands on a relevant demo answer, remove the DPI anomaly demo, and make the reasoning rail progress more slowly and match the active question.

**Architecture:** Keep the existing workspace pages and card layout, but centralize demo alignment in shared scenario/process helpers. Scope actions and starter cards will carry explicit scenario mappings, while the right rail will render staged reasoning snapshots derived from the active query, active scope, and matched scenario instead of static workspace-wide copy.

**Tech Stack:** React, Vite, Vitest, motion/react

---

### Task 1: Lock demo alignment with tests

**Files:**
- Modify: `src/app/lib/workspace-experience.test.ts`
- Create: `src/app/lib/scenario-resolver.test.ts`
- Modify: `src/app/lib/workbench-model.test.ts`

- [ ] **Step 1: Write the failing tests**

Add tests that prove:
- representative scope actions from `fleet`, `support`, and `growth` carry explicit scenario mappings and resolve to a workspace-appropriate scenario
- the removed DPI anomaly prompt no longer resolves
- staged process snapshots include the active question/scope and progress from intake to ready

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/app/lib/workspace-experience.test.ts src/app/lib/scenario-resolver.test.ts src/app/lib/workbench-model.test.ts`

Expected: FAIL because the new resolver/process helpers and scenario mappings do not exist yet.

### Task 2: Add shared resolver and staged process helpers

**Files:**
- Modify: `src/app/lib/scenario-resolver.ts`
- Modify: `src/app/lib/workbench-model.ts`
- Modify: `src/app/lib/scenario-definitions.ts`

- [ ] **Step 1: Add minimal shared APIs**

Implement:
- a workspace-aware scenario resolver that can prefer an explicit scenario id
- a staged process snapshot builder that returns `reasoning`, `backendActions`, and `auditEntries` for `idle`, `intake`, `evidence`, `synthesis`, and `ready`
- removal of the DPI anomaly scenario from exported demo candidates

- [ ] **Step 2: Run focused tests**

Run: `npm test -- --run src/app/lib/workspace-experience.test.ts src/app/lib/scenario-resolver.test.ts src/app/lib/workbench-model.test.ts`

Expected: PASS for shared-library tests.

### Task 3: Rewire workspace demos to shared helpers

**Files:**
- Modify: `src/app/lib/workspace-experience.ts`
- Modify: `src/app/lib/workspace-definitions.ts`
- Modify: `src/app/pages/workspace-operations.tsx`
- Modify: `src/app/pages/workspace-support.tsx`
- Modify: `src/app/pages/workspace-growth.tsx`
- Modify: `src/app/components/generative/workspace-session.tsx`
- Modify: `src/app/lib/use-workspace-card-settings.ts`

- [ ] **Step 1: Align visible demo prompts**

Update starter cards and every scope-level action so each workspace uses user-facing operational language and maps to an explicit scenario id.

- [ ] **Step 2: Slow staged demo progression**

Replace the current near-instant scenario handoff with a slower staged progression. The page should set an active process context before the final workspace card appears so the right rail visibly steps through intake, evidence, synthesis, and ready states.

- [ ] **Step 3: Keep settings compatibility**

Preserve existing settings overrides by making any new action/scenario metadata optional and merge-safe.

- [ ] **Step 4: Run targeted tests and build**

Run:
- `npm test -- --run src/app/lib/workspace-experience.test.ts src/app/lib/scenario-resolver.test.ts src/app/lib/workbench-model.test.ts`
- `npm run build`

Expected:
- tests pass
- build exits with code 0
