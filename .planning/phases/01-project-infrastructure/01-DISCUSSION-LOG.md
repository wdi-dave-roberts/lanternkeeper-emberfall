# Phase 1: Project Infrastructure - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 01-project-infrastructure
**Areas discussed:** CLAUDE.md reconciliation, Docs site structure, CHANGELOG format, Acceptance criteria format

---

## CLAUDE.md Reconciliation

### Where are Dave's Godot architecture docs?

| Option | Description | Selected |
|--------|-------------|----------|
| They don't exist yet | Placeholder — nothing to merge | |
| They're outside the repo | Godot docs live elsewhere | |
| They were already removed | Dave's docs cleaned out | |

**User's choice:** Free text — user asked which repo we're in, clarifying that Godot was for `../laternfall`, not this project.

### Is there a separate Godot repo, or just clean up Allie's file?

| Option | Description | Selected |
|--------|-------------|----------|
| Separate Godot repo exists | Another repo with Godot docs | |
| Just clean up Allie's file | No Godot docs to merge | ✓ |
| Let me check | Need a moment | |

**User's choice:** Clarified that the original project (`../laternfall`) planned to use Godot, but not this project. Emphasized ensuring artifacts from the initial project don't leak into this one.

### What should CLAUDE.md contain vs docs site?

| Option | Description | Selected |
|--------|-------------|----------|
| Slim CLAUDE.md, content on docs | Lean CLAUDE.md, content moves to docs site | |
| CLAUDE.md stays comprehensive | Everything in CLAUDE.md, docs gets a copy | |
| You decide | Claude determines the split | ✓ |

**User's choice:** You decide

### Should DOCS-01 be corrected to drop Godot reference?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, correct it now | Update DOCS-01 to reflect reality | ✓ |
| Leave it, fix during execution | Don't change requirements now | |

**User's choice:** Yes, and go further — ensure technical stack isn't influenced by `../laternfall`

### Voice rules and content data split

| Option | Description | Selected |
|--------|-------------|----------|
| Voice rules in CLAUDE.md, data on docs | Keep voice constraints, move content | |
| Everything stays in CLAUDE.md | Full context always available | |
| You decide | Claude determines | |

**User's choice:** Free text — pointed out that putting game content in CLAUDE.md is poor separation of concerns, doesn't scale to multiple characters, and asked about existing content organization in `src/data/`.

### Content organization approach

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, that's clean | CLAUDE.md: constraints + pointers. src/data/: source of truth. Docs: browsable reference. | ✓ |
| Needs adjustment | Close but needs tweaking | |

**User's choice:** Yes, that's clean

---

## Docs Site Structure

### Primary audience

| Option | Description | Selected |
|--------|-------------|----------|
| Dave and Allie (internal) | Working reference for two of you | ✓ |
| Garrett (recipient) | Part of the gift | |
| All three + future contributors | Internal + presentable | |

**User's choice:** Dave and Allie, primarily Allie
**Notes:** User also noted Dev Reference needs a Git primer and GSD workflow guide

### Navigation organization

| Option | Description | Selected |
|--------|-------------|----------|
| Game design + dev reference | Two main sections | ✓ |
| Flat and simple | Single-level navigation | |
| You decide | Claude structures it | |

**User's choice:** Option 1, with note that Dev Reference needs Git primer and GSD workflow guide

### Deployment method

| Option | Description | Selected |
|--------|-------------|----------|
| GitHub Actions auto-deploy | Auto-deploy on push | ✓ |
| Manual deploy | Only when triggered | |
| You decide | Claude picks | |

**User's choice:** GitHub Actions auto-deploy

---

## CHANGELOG Format

### What does the AI state journal format look like?

| Option | Description | Selected |
|--------|-------------|----------|
| Check marketing-ops repo | Reference CHANGELOG in another repo | ✓ |
| Standard Keep a Changelog | keepachangelog.com format | |
| Describe it for me | User explains desired format | |

**User's choice:** Check marketing-ops repo
**Notes:** Reviewed `/Users/dave/github/whitedoeinn/marketing-ops/CHANGELOG.md` — Changed / State now / Constrains format

### Auto-generation pipeline

| Option | Description | Selected |
|--------|-------------|----------|
| Full pipeline (Recommended) | CHANGELOG + auto-generated whats-changed.md | ✓ |
| CHANGELOG only for now | Start with CHANGELOG, add pipeline later | |
| You decide | Claude determines | |

**User's choice:** Full pipeline

---

## Acceptance Criteria Format

### How should emotional acceptance criteria be used?

| Option | Description | Selected |
|--------|-------------|----------|
| Review checklist | Checklist on docs site | |
| CLAUDE.md gate | Baked into CLAUDE.md as enforcement | |
| Both | Checklist on docs + rule in CLAUDE.md | ✓ |

**User's choice:** Asked for advice, then agreed with "Both" recommendation

### Voice rules split pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, that's right | Terse gate in CLAUDE.md + detailed checklist on docs | ✓ |
| Docs only | Just docs site checklist | |
| Different idea | User has different approach | |

**User's choice:** Yes, that's right

---

## Claude's Discretion

- D-02/D-03/D-04: Specific content split between CLAUDE.md and docs site (principle decided, details delegated to Claude)

## Deferred Ideas

None — discussion stayed within phase scope
