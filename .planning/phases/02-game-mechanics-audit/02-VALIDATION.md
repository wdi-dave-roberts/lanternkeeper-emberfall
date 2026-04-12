---
phase: 2
slug: game-mechanics-audit
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-12
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compiler + grep (no unit test framework — Jest deferred to Phase 3) |
| **Config file** | `tsconfig.json` |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx tsc --noEmit` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit` + plan-level verification commands
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-T1 | 01 | 1 | MECH-07 | — | N/A | static | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 02-01-T2 | 01 | 1 | MECH-07, MECH-06 | T-02-01 | N/A | static+grep | `npx tsc --noEmit && grep -c 'GAME_CONFIG' lib/storage.ts app/(tabs)/index.tsx` | ✅ | ⬜ pending |
| 02-02-T1 | 02 | 1 | MECH-01..05, 08, 09 | — | N/A | file | `test -f docs/game-design/mechanics-audit.md` | ✅ | ⬜ pending |
| 02-02-T2 | 02 | 1 | MECH-01 | — | N/A | grep | `grep -c 'mechanics-audit' mkdocs.yml` | ✅ | ⬜ pending |
| 02-03-T1 | 03 | 2 | MECH-10, 11, 12 | — | N/A | grep | `grep -c 'Gap Analysis\|Parameter Interactions\|Calibration' docs/game-design/mechanics-audit.md` | ✅ | ⬜ pending |
| 02-03-T2 | 03 | 2 | MECH-01 | — | N/A | manual | Human review checkpoint | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. TypeScript compiler (`npx tsc --noEmit`) is already available. No additional test framework needed for this phase.

Jest unit test infrastructure deferred to Phase 3 (STOR-04 requires round-trip unit test).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Audit document is readable by non-developer | MECH-01 | Subjective quality — requires human review | Allie reads audit page on docs site and confirms understanding |
| Emotion chip ordering has no visual bias | MECH-03 | Visual/UX judgment | Review emotion selection UI in simulator, verify no primacy bias |
| Stuck/Frustrated quests feel as validating as Inspired/Alright | MECH-04 | Tone and emotional quality judgment | Read all 40 quests side-by-side, compare tone across emotion groups |
| Fog/leaf persistence options documented with pillar ratings | MECH-06 | Documentation quality | Review audit page section on fog persistence |
| calculateStreak() flagged as design violation | MECH-08 | Documentation presence | Review audit page section on streak calculation |
| Gap analysis covers ritual/companion game patterns | MECH-10 | Domain knowledge judgment | Review gap analysis section for completeness |
| Parameter interaction map identifies conflicts | MECH-11 | Analytical judgment | Review interaction map for missed dependencies |
| Calibration assessments are reasonable | MECH-12 | Requires playtesting context | Review calibration column in parameter table |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-12
