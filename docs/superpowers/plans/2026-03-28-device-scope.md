# Device Scope Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a gateway-device scope under subscriber so AI cards and actions default to device-level operations.

**Architecture:** Extend the existing hierarchical scope model with a new `device` level and add mock device data beneath each subscriber. Keep `subscriber` as an aggregate container while moving default diagnostics, actions, and copy that previously targeted subscribers down to `device` in the command center.

**Tech Stack:** React 18, TypeScript, React Router, Motion, Vite

---
