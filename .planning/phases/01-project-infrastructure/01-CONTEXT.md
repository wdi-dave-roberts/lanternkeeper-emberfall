# Phase 1: Project Infrastructure - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up MkDocs docs site, structured CHANGELOG with auto-generation pipeline, and reconcile CLAUDE.md — so all subsequent changes are transparently recorded and the project has a single source of truth. No code changes to the app itself.

</domain>

<decisions>
## Implementation Decisions

### CLAUDE.md Reconciliation
- **D-01:** Allie's `claude.md` is the starting point — there are no Godot architecture docs to merge (the Godot reference in DOCS-01 leaked from the sibling `laternfall` project and must be corrected)
- **D-02:** CLAUDE.md stays terse: project summary, design constraints (pillar gate, voice rules), implementation rules, and file pointers to `src/data/` and docs site
- **D-03:** Game content (quest text, feedback lines) stays in `src/data/` as source of truth — not duplicated in CLAUDE.md. This scales to multiple characters without bloating CLAUDE.md
- **D-04:** Voice rules in CLAUDE.md are design constraints (tone, language rules, identity), not full content catalogs

### Docs Site Structure
- **D-05:** MkDocs with Material theme, deployed to GitHub Pages via GitHub Actions auto-deploy on push to main/master
- **D-06:** Two main navigation sections: **Game Design** (pillars, voice, core loop, quests, feedback) and **Dev Reference** (architecture, conventions, contribution guide)
- **D-07:** Dev Reference section must include a Git primer and GSD workflow guide for Allie
- **D-08:** Primary audience is Dave and Allie, primarily Allie — write so a learning developer can use it as reference

### CHANGELOG Format
- **D-09:** Follow the AI state journal format from marketing-ops CHANGELOG — each entry has `Changed:` / `State now:` / `Constrains:` structure, organized by date (reverse chronological)
- **D-10:** Full pipeline: CHANGELOG.md in repo + auto-generated `docs/whats-changed.md` via Claude API + GitHub Action (same pattern as marketing-ops, covers INFR-02 and INFR-04)

### Acceptance Criteria Format
- **D-11:** Emotional acceptance criteria documented in two places: terse enforcement gate in CLAUDE.md (existing Final Rule pattern) + detailed teaching checklist with practical examples on docs site
- **D-12:** CLAUDE.md version stays enforceable ("if a change doesn't satisfy at least one pillar, don't build it"). Docs site version is the teaching tool with examples of what each pillar means in concrete terms (e.g., "Less Pressured: does this introduce any time-based mechanic?")
- **D-13:** Aetherling voice rules follow the same pattern — terse constraints in CLAUDE.md, full reference on docs site

### Cross-Project Isolation
- **D-14:** Audit ALL planning artifacts for `laternfall` / Godot references and correct them. DOCS-01 in REQUIREMENTS.md is a known instance. There may be others.
- **D-15:** Strict project isolation — nothing from `../laternfall` (stack decisions, architecture patterns, design choices) influences this repo. Tech stack is Expo + React Native + TypeScript, full stop.

### Claude's Discretion
- Claude determines the specific content split between CLAUDE.md and docs site (D-02 through D-04 set the principle; Claude decides the details)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### CHANGELOG Format
- `/Users/dave/github/whitedoeinn/marketing-ops/CHANGELOG.md` — Reference implementation of AI state journal format (Changed / State now / Constrains structure). Follow this pattern for this project's CHANGELOG.

### Existing Game Content (source of truth)
- `src/data/quests.ts` — 40 micro-quests grouped by emotion (content to reference on docs site, not duplicate)
- `src/data/feedback.ts` — Aetherling feedback lines by emotion
- `src/data/types.ts` — Emotion, Quest, DailyLog type definitions

### Existing CLAUDE.md
- `claude.md` — Allie's original file, starting point for reconciliation

### Codebase Maps
- `.planning/codebase/STRUCTURE.md` — Current directory layout and file organization
- `.planning/codebase/CONVENTIONS.md` — Naming patterns and code style conventions

### Project Artifacts
- `.planning/PROJECT.md` — Project context, constraints, key decisions
- `.planning/REQUIREMENTS.md` — Full requirements with traceability (DOCS-01 needs Godot reference corrected)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing docs infrastructure — MkDocs, GitHub Actions workflow, and CHANGELOG are all net-new

### Established Patterns
- `src/data/` directory pattern for game content data files — quests and feedback already live here as typed TypeScript exports
- `claude.md` at root follows the project-instructions convention expected by Claude Code

### Integration Points
- GitHub Pages deployment target (repo settings may need Pages enabled)
- GitHub Actions for auto-deploy (workflow file in `.github/workflows/`)
- CHANGELOG.md at repo root, `docs/` directory for MkDocs content
- `docs/whats-changed.md` auto-generated from CHANGELOG via Claude API action

</code_context>

<specifics>
## Specific Ideas

- Dev Reference section on docs site should include a **Git primer** and **GSD workflow guide** specifically for Allie as a learning developer
- Detailed pillar checklist on docs site should include **negative examples** (what violates each pillar) so Allie can recognize pressure mechanics she might accidentally introduce
- Content architecture should scale to multiple characters — each character's data in `src/data/`, browsable on docs site, CLAUDE.md just points to both

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-project-infrastructure*
*Context gathered: 2026-04-12*
