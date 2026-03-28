# Command Center Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add restrained ambient background color layers, cursor-follow feedback, chat entry motion, and hover feedback to the Command Center.

**Architecture:** Keep all motion scoped to the Command Center surface and chat card system. Reuse the existing `motion/react` dependency and drive visuals from CSS variables so the dark theme stays coherent. Respect reduced-motion and avoid persistent heavy per-card animation logic.

**Tech Stack:** React, Vite, Tailwind v4, motion/react, CSS custom properties

---

### Task 1: Add Ambient Motion Tokens

**Files:**
- Modify: `src/styles/theme.css`

- [ ] Define ambient gradient and card glow tokens for dark mode and safe fallbacks for light mode.
- [ ] Add reduced-motion-safe keyframes for slow background drift.
- [ ] Keep token names scoped to command-center ambient usage and card hover highlights.

### Task 2: Animate Command Center Background

**Files:**
- Modify: `src/app/pages/command-center.tsx`

- [ ] Add pointer tracking state for the main chat workspace only.
- [ ] Render layered gradient backgrounds with one slow animated layer and one pointer-follow radial layer.
- [ ] Keep pointer tracking disabled for reduced-motion users and make the effect pointer-events safe.
- [ ] Update the empty-state suggestion cards to use the same hover language as chat cards.

### Task 3: Tighten Chat Message Entry Motion

**Files:**
- Modify: `src/app/pages/command-center.tsx`
- Modify: `src/app/components/chat-messages.tsx`

- [ ] Differentiate text-message and card-message entry timing so AI text lands before data cards.
- [ ] Add consistent spring-based fade/slide/scale entry for user bubbles, AI bubbles, and card blocks.
- [ ] Keep typing indicator motion lighter than card motion.

### Task 4: Add Card Hover Feedback

**Files:**
- Modify: `src/app/components/chat-messages.tsx`

- [ ] Extend `CardWrapper` to accept pointer movement and render a subtle local highlight.
- [ ] Add restrained border/translate/shadow feedback on hover.
- [ ] Keep complex cards readable by limiting tilt and using only tiny transform values.

### Task 5: Verify

**Files:**
- Verify only

- [ ] Run `npm run build`.
- [ ] Confirm no TypeScript or Tailwind class issues are introduced.
- [ ] Spot-check that reduced-motion guards compile cleanly.
