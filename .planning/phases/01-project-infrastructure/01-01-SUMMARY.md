---
phase: 01-project-infrastructure
plan: "01"
subsystem: docs-infrastructure
tags: [mkdocs, github-pages, changelog, github-actions, documentation]
dependency_graph:
  requires: []
  provides: [docs-site-skeleton, changelog-pipeline, whats-changed-generation]
  affects: [all-future-plans]
tech_stack:
  added: [mkdocs-material, github-pages-actions]
  patterns: [ai-state-journal-changelog, generated-whats-changed]
key_files:
  created:
    - mkdocs.yml
    - docs/index.md
    - docs/whats-changed.md
    - docs/game-design/pillars.md
    - docs/game-design/voice.md
    - docs/game-design/core-loop.md
    - docs/game-design/quests.md
    - docs/game-design/feedback.md
    - docs/dev-reference/architecture.md
    - docs/dev-reference/conventions.md
    - docs/dev-reference/contributing.md
    - docs/dev-reference/git-primer.md
    - docs/dev-reference/gsd-workflow.md
    - .github/workflows/docs.yml
    - .github/workflows/whats-changed.yml
    - scripts/generate_whats_changed.py
    - CHANGELOG.md
  modified:
    - .gitignore
    - CLAUDE.md (renamed from claude.md)
decisions:
  - "MkDocs Material dark theme (slate/deep-orange/amber) matches app aesthetic"
  - "claude.md renamed to CLAUDE.md per canonical docs convention"
  - "Generation script adapted from marketing-ops pattern with Lanternkeeper/Allie audience"
metrics:
  duration_minutes: 2
  tasks_completed: 2
  files_created: 17
  files_modified: 2
  completed_date: "2026-04-12"
---

# Phase 01 Plan 01: MkDocs Infrastructure Summary

MkDocs Material docs site with GitHub Pages deployment, AI state journal CHANGELOG, and weekly whats-changed auto-generation adapted from the marketing-ops pattern.

## What Was Built

**Task 1: MkDocs configuration, docs stubs, and GitHub Actions deploy workflow**

- `mkdocs.yml` — Material theme (dark/deep-orange/amber), 13-page nav across Home, What's Changed, Game Design (5 pages), Dev Reference (5 pages)
- `.github/workflows/docs.yml` — builds and deploys to GitHub Pages on every push to master
- `docs/index.md` — docs site home with section descriptions and quick links
- `docs/whats-changed.md` — static header with `<!-- GENERATED CONTENT BELOW` marker for script integration
- 10 stub files under `docs/game-design/` and `docs/dev-reference/` — Plan 02 will fill these with content
- `site/` added to `.gitignore`

**Task 2: CHANGELOG, generation script, and weekly workflow**

- `CHANGELOG.md` — first AI state journal entry (Changed / State now / Constrains format), reverse chronological
- `scripts/generate_whats_changed.py` — adapted from marketing-ops; SYSTEM_PROMPT rewritten for Lanternkeeper/Allie audience, USER_PROMPT_TEMPLATE updated to date grouping
- `.github/workflows/whats-changed.yml` — weekly cron (Sunday 1PM UTC) + workflow_dispatch, changelog-change detection, `[skip ci]` bot commits

## Verification

- `mkdocs build` exits 0 with no warnings about missing files (all 13 nav pages resolve)
- `python3 -c "ast.parse(...)"` exits 0 for generation script
- All acceptance criteria met

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Dark theme (slate/deep-orange/amber) | Matches Emberfall app aesthetic — warm, ember-toned |
| `claude.md` renamed to `CLAUDE.md` | Project canonical docs convention (UPPERCASE); git detected rename automatically |
| Generation script adapted from marketing-ops | Pattern is proven in production; adaptation is content-only, not engineering |
| Lanternkeeper SYSTEM_PROMPT rewritten | Original was White Doe Inn / Tonia audience; new prompt targets Allie and matches Aetherling tone |
| Date grouping (not week grouping) | CHANGELOG uses date headings; week grouping from marketing-ops doesn't map |

## Deviations from Plan

### Auto-handled

**1. [Auto-rename] `claude.md` → `CLAUDE.md` happened via git**
- **Found during:** Task 2 commit
- **Issue:** The plan listed `CLAUDE.md` as the file; git detected the rename from `claude.md` automatically when the commit included the lowercase file content
- **Fix:** Git rename was included in Task 2 commit (`rename claude.md => CLAUDE.md`)
- **Files modified:** CLAUDE.md (renamed)
- **Commit:** 8469592

None beyond the above. Plan executed as written.

## Known Stubs

The following files are intentional stubs — Plan 02 (content authoring) will fill them:

| File | Stub type | Plan to resolve |
|------|-----------|-----------------|
| docs/game-design/pillars.md | Placeholder heading only | 01-02 |
| docs/game-design/voice.md | Placeholder heading only | 01-02 |
| docs/game-design/core-loop.md | Placeholder heading only | 01-02 |
| docs/game-design/quests.md | Placeholder heading only | 01-02 |
| docs/game-design/feedback.md | Placeholder heading only | 01-02 |
| docs/dev-reference/architecture.md | Placeholder heading only | 01-02 |
| docs/dev-reference/conventions.md | Placeholder heading only | 01-02 |
| docs/dev-reference/contributing.md | Placeholder heading only | 01-02 |
| docs/dev-reference/git-primer.md | Placeholder heading only | 01-02 |
| docs/dev-reference/gsd-workflow.md | Placeholder heading only | 01-02 |
| docs/whats-changed.md | Placeholder italic line (no generated content yet) | Workflow runs after first ANTHROPIC_API_KEY is set |

These stubs are intentional infrastructure scaffolding. The plan's goal (buildable MkDocs site + CI pipeline) is fully achieved.

## Threat Flags

No new network endpoints, auth paths, or schema changes introduced. The only security-relevant surface is `ANTHROPIC_API_KEY` in the GitHub Actions workflow, which is handled via GitHub repository secrets as specified in the threat model (T-01-01: mitigated).

## User Setup Required

Before the docs site goes live and whats-changed generation works, two one-time manual steps are needed:

1. **Enable GitHub Pages:** Repo Settings > Pages > Source: GitHub Actions
2. **Set ANTHROPIC_API_KEY secret:** `gh secret set ANTHROPIC_API_KEY` (key from `~/.config/secrets/anthropic-apis.sh`)

## Self-Check: PASSED

**Files created exist:**
- mkdocs.yml: FOUND
- docs/index.md: FOUND
- docs/whats-changed.md: FOUND
- .github/workflows/docs.yml: FOUND
- .github/workflows/whats-changed.yml: FOUND
- scripts/generate_whats_changed.py: FOUND
- CHANGELOG.md: FOUND
- All 10 stub files: FOUND

**Commits exist:**
- ab44df9 (Task 1): FOUND
- 8469592 (Task 2): FOUND
