---
phase: 4
slug: architecture-refactor
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-13
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (installed in Phase 3) |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npx jest --passWithNoTests` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --passWithNoTests`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | ARCH-04 | — | N/A | type-check | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 04-01-02 | 01 | 1 | ARCH-01 | — | N/A | unit | `npx jest --passWithNoTests` | ✅ | ⬜ pending |
| 04-01-03 | 01 | 1 | ARCH-02 | — | N/A | unit | `npx jest --passWithNoTests` | ✅ | ⬜ pending |
| 04-01-04 | 01 | 1 | ARCH-03 | — | N/A | unit | `npx jest --passWithNoTests` | ✅ | ⬜ pending |
| 04-02-01 | 02 | 1 | ARCH-05 | — | N/A | type-check | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 04-02-02 | 02 | 1 | ARCH-06 | — | N/A | grep-verify | `test ! -d src/screens` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 2 | ARCH-07 | — | N/A | manual | visual inspection | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing Jest infrastructure from Phase 3 covers all phase requirements
- TypeScript compiler (`tsc --noEmit`) provides structural validation for discriminated union and hook extraction

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Code readability for Allie | ARCH-07 | Subjective assessment — "can Allie trace the flow" | Open `app/(tabs)/index.tsx`, verify it reads as composition only (~100 lines). Open any hook, verify single-file traceability to storage |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
