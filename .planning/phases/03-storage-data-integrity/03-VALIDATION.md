---
phase: 3
slug: storage-data-integrity
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-12
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x + jest-expo |
| **Config file** | jest.config.js (Wave 0 installs) |
| **Quick run command** | `npx jest --testPathPattern storage` |
| **Full suite command** | `npx jest` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --testPathPattern storage`
- **After every plan wave:** Run `npx jest`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | STOR-01 | — | N/A | unit | `npx jest --testPathPattern storage` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | STOR-02 | — | N/A | unit | `npx jest --testPathPattern storage` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | STOR-03 | — | N/A | grep | `grep -r calculateStreak src/ lib/` | ✅ | ⬜ pending |
| 03-02-02 | 02 | 1 | STOR-04 | — | N/A | unit | `npx jest --testPathPattern storage` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 1 | STOR-05 | — | N/A | grep | `grep -rn "type Emotion" src/ app/ lib/` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `jest.config.js` — Jest configuration with jest-expo preset and moduleNameMapper for @/* alias
- [ ] `__tests__/lib/storage.test.ts` — stubs for STOR-01, STOR-02, STOR-04
- [ ] `jest-expo`, `@testing-library/react-native`, `react-test-renderer` — dev dependency install

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| App starts fresh after clearing storage | STOR-05 | Requires device/emulator runtime | Clear AsyncStorage, launch app, complete one ritual, verify DailyLog persists |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
