---
phase: 1
slug: project-infrastructure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-12
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bash scripts + curl (infrastructure validation) |
| **Config file** | none — validation via CLI commands |
| **Quick run command** | `mkdocs build --strict 2>&1` |
| **Full suite command** | `mkdocs build --strict && test -f CHANGELOG.md && test -f CLAUDE.md` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `mkdocs build --strict 2>&1`
- **After every plan wave:** Run full suite command
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | INFR-01 | — | N/A | integration | `test -f mkdocs.yml && mkdocs build --strict` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | INFR-02 | — | N/A | integration | `test -f .github/workflows/docs.yml` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 1 | INFR-03 | — | N/A | integration | `test -f CHANGELOG.md && grep "## " CHANGELOG.md` | ❌ W0 | ⬜ pending |
| 1-02-02 | 02 | 1 | INFR-04 | — | N/A | integration | `test -f .github/workflows/changelog-enforcer.yml` | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 2 | DOCS-01 | — | N/A | integration | `test -f CLAUDE.md && ! grep -i "godot" CLAUDE.md` | ❌ W0 | ⬜ pending |
| 1-03-02 | 03 | 2 | DOCS-02 | — | N/A | integration | `grep "design.pillars" mkdocs.yml` | ❌ W0 | ⬜ pending |
| 1-03-03 | 03 | 2 | DOCS-03 | — | N/A | integration | `mkdocs build --strict && test -d site/` | ❌ W0 | ⬜ pending |
| 1-03-04 | 03 | 2 | DOCS-04 | — | N/A | integration | `grep -l "pillar" docs/` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `mkdocs.yml` — MkDocs configuration file
- [ ] `docs/` directory — documentation source files
- [ ] `.github/workflows/docs.yml` — GitHub Pages deployment workflow

*Infrastructure phase — all artifacts are created by the phase itself.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| GitHub Pages publicly viewable | INFR-02 | Requires browser visit to deployed URL | Visit `https://<owner>.github.io/lanternkeeper-emberfall/` after deploy |
| GitHub Pages enabled in repo settings | INFR-02 | Requires repo admin action | Settings → Pages → Source: GitHub Actions |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
