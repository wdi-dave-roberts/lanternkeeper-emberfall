# Phase 1: Project Infrastructure - Research

**Researched:** 2026-04-12
**Domain:** MkDocs + GitHub Pages deployment, CHANGELOG format, CLAUDE.md reconciliation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Allie's `claude.md` is the starting point — there are no Godot architecture docs to merge (the Godot reference in DOCS-01 leaked from the sibling `laternfall` project and must be corrected)
- **D-02:** CLAUDE.md stays terse: project summary, design constraints (pillar gate, voice rules), implementation rules, and file pointers to `src/data/` and docs site
- **D-03:** Game content (quest text, feedback lines) stays in `src/data/` as source of truth — not duplicated in CLAUDE.md. This scales to multiple characters without bloating CLAUDE.md
- **D-04:** Voice rules in CLAUDE.md are design constraints (tone, language rules, identity), not full content catalogs
- **D-05:** MkDocs with Material theme, deployed to GitHub Pages via GitHub Actions auto-deploy on push to main/master
- **D-06:** Two main navigation sections: **Game Design** (pillars, voice, core loop, quests, feedback) and **Dev Reference** (architecture, conventions, contribution guide)
- **D-07:** Dev Reference section must include a Git primer and GSD workflow guide for Allie
- **D-08:** Primary audience is Dave and Allie, primarily Allie — write so a learning developer can use it as reference
- **D-09:** Follow the AI state journal format from marketing-ops CHANGELOG — each entry has `Changed:` / `State now:` / `Constrains:` structure, organized by date (reverse chronological)
- **D-10:** Full pipeline: CHANGELOG.md in repo + auto-generated `docs/whats-changed.md` via Claude API + GitHub Action (same pattern as marketing-ops, covers INFR-02 and INFR-04)
- **D-11:** Emotional acceptance criteria documented in two places: terse enforcement gate in CLAUDE.md (existing Final Rule pattern) + detailed teaching checklist with practical examples on docs site
- **D-12:** CLAUDE.md version stays enforceable ("if a change doesn't satisfy at least one pillar, don't build it"). Docs site version is the teaching tool with examples of what each pillar means in concrete terms (e.g., "Less Pressured: does this introduce any time-based mechanic?")
- **D-13:** Aetherling voice rules follow the same pattern — terse constraints in CLAUDE.md, full reference on docs site
- **D-14:** Audit ALL planning artifacts for `laternfall` / Godot references and correct them. DOCS-01 in REQUIREMENTS.md is a known instance. There may be others.
- **D-15:** Strict project isolation — nothing from `../laternfall` (stack decisions, architecture patterns, design choices) influences this repo. Tech stack is Expo + React Native + TypeScript, full stop.

### Claude's Discretion

- Claude determines the specific content split between CLAUDE.md and docs site (D-02 through D-04 set the principle; Claude decides the details)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFR-01 | Set up MkDocs with Material theme and GitHub Pages deployment | MkDocs 1.6.1 + Material 9.7.6 verified installed; GitHub Actions workflow pattern confirmed from marketing-ops |
| INFR-02 | Adopt structured CHANGELOG.md (AI state journal format from marketing-ops) | CHANGELOG format verified from `/Users/dave/github/whitedoeinn/marketing-ops/CHANGELOG.md` |
| INFR-03 | Create initial docs site with game design goals, architecture overview, and design pillars | Content exists in `claude.md`; site structure defined in D-06 |
| INFR-04 | Set up docs/whats-changed.md auto-generation from CHANGELOG.md | `scripts/generate_whats_changed.py` pattern verified from marketing-ops; GitHub Action workflow verified |
| DOCS-01 | Reconcile CLAUDE.md files — merge Dave's Godot architecture docs with Allie's design pillars and voice rules | D-01 clarifies: no Godot content to merge; Allie's `claude.md` is the starting point; fix the corrupted DOCS-01 requirement text |
| DOCS-02 | Document emotional acceptance criteria — pillar checks that apply to every future change | D-11/D-12 define the two-place pattern; content is in `claude.md` Final Rule section |
| DOCS-03 | Populate docs site with game design docs (design pillars, Aetherling voice, core loop, micro-quests) | Content lives in `claude.md`; `src/data/quests.ts` and `src/data/feedback.ts` for quest/feedback reference |
| DOCS-04 | Document Aetherling voice rules as a standing review convention for any dialogue changes | D-13 pattern; terse in CLAUDE.md, teaching reference on docs site |
</phase_requirements>

---

## Summary

This phase is pure infrastructure and documentation — no app code changes. The goal is to give Lanternkeeper: Emberfall a living docs site, a structured change history, and a reconciled single-source-of-truth CLAUDE.md before any subsequent refactoring work begins.

The technical pattern for every deliverable is already proven. The marketing-ops project (`/Users/dave/github/whitedoeinn/marketing-ops/`) has an identical MkDocs + Material + GitHub Pages + CHANGELOG pipeline running in production. Research confirms all tools are installed locally (MkDocs 1.6.1, Material 9.7.6, anthropic 0.85.0) and the GitHub Actions workflow pattern can be copied almost verbatim. The main adaptation work is content — writing game design docs for Allie, not solving engineering problems.

The one technical wrinkle is GitHub Pages: the repo currently has Pages disabled (404 on the GitHub Pages API). Enabling Pages on the `wdi-dave-roberts` account requires a one-time repo settings change (source: GitHub Actions deployment). Everything else is file creation and git push.

**Primary recommendation:** Copy the marketing-ops infrastructure pattern wholesale. Adapt content only. The pipeline is: `mkdocs.yml` config + `docs/` directory + `.github/workflows/docs.yml` (build and deploy on push to master) + `.github/workflows/whats-changed.yml` (weekly Claude API generation). Enable GitHub Pages in repo settings to activate deployment.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| mkdocs | 1.6.1 | Static site generator from Markdown | Installed locally, proven in marketing-ops |
| mkdocs-material | 9.7.6 | Material Design theme for MkDocs | Installed locally, marketing-ops reference implementation |
| anthropic | 0.85.0 | Python client for Claude API | Installed locally, used in marketing-ops `generate_whats_changed.py` |

[VERIFIED: local `pip show` and `mkdocs --version`]

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| actions/checkout | v4 | GitHub Actions step | All workflows |
| actions/setup-python | v5 | GitHub Actions Python setup | docs.yml and whats-changed.yml |
| actions/cache | v4 | Cache pip packages in CI | docs.yml (speeds up Material install) |
| actions/upload-pages-artifact | v3 | Package site/ for Pages | docs.yml build job |
| actions/deploy-pages | v4 | Deploy to GitHub Pages | docs.yml deploy job |

[VERIFIED: from marketing-ops `.github/workflows/docs.yml`]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MkDocs Material | Docusaurus, VitePress | Both require Node.js/npm build; MkDocs is pip-based, already proven, aligns with marketing-ops pattern |
| Claude API for whats-changed | Manual editing | Manual editing breaks down as entries accumulate; automation is the decision |

**Installation:**
```bash
# MkDocs and Material are already installed via pyenv Python 3.11.9
# No additional installation needed for local development
pip install mkdocs-material  # (in CI only — already local)
pip install anthropic         # (in CI only — already local)
```

**Version verification:** [VERIFIED: `mkdocs --version` → 1.6.1, `pip show mkdocs-material` → 9.7.6, `pip show anthropic` → 0.85.0]

---

## Architecture Patterns

### Recommended Project Structure

```
lanternkeeper-emberfall/
├── docs/                     # MkDocs content
│   ├── index.md              # Docs home page
│   ├── whats-changed.md      # Auto-generated from CHANGELOG.md
│   ├── game-design/
│   │   ├── pillars.md        # Design pillars + emotional acceptance criteria
│   │   ├── voice.md          # Aetherling voice rules (teaching reference)
│   │   ├── core-loop.md      # Core loop walkthrough
│   │   ├── quests.md         # Micro-quest reference (links to src/data/)
│   │   └── feedback.md       # Feedback line reference (links to src/data/)
│   ├── dev-reference/
│   │   ├── architecture.md   # Architecture overview
│   │   ├── conventions.md    # Naming/code style conventions
│   │   ├── contributing.md   # Contribution guide for Allie
│   │   ├── git-primer.md     # Git basics for Allie
│   │   └── gsd-workflow.md   # GSD workflow guide for Allie
│   └── stylesheets/
│       └── extra.css         # Optional theme customizations
├── scripts/
│   └── generate_whats_changed.py   # Claude API generation script
├── .github/
│   └── workflows/
│       ├── docs.yml              # Build + deploy to GitHub Pages on push to master
│       └── whats-changed.yml     # Weekly auto-regenerate docs/whats-changed.md
├── mkdocs.yml                # MkDocs configuration
├── CHANGELOG.md              # AI state journal (human-edited, machine-read)
└── CLAUDE.md                 # Reconciled single-source-of-truth (renamed from claude.md)
```

### Pattern 1: MkDocs Material Configuration

**What:** `mkdocs.yml` at repo root defines site metadata, theme, nav, and markdown extensions.
**When to use:** Required for all MkDocs sites.

```yaml
# Source: marketing-ops/mkdocs.yml (adapted for Lanternkeeper)
site_name: Lanternkeeper: Emberfall
site_url: https://wdi-dave-roberts.github.io/lanternkeeper-emberfall/
repo_url: https://github.com/wdi-dave-roberts/lanternkeeper-emberfall
edit_uri: edit/master/docs/

theme:
  name: material
  palette:
    - scheme: slate        # Dark mode by default — matches app aesthetic
      primary: deep orange
      accent: amber
  features:
    - navigation.tabs
    - navigation.sections
    - navigation.top
    - search.suggest
    - search.highlight
    - toc.follow
    - content.action.edit

nav:
  - Home: index.md
  - "What's Changed": whats-changed.md
  - Game Design:
    - Design Pillars: game-design/pillars.md
    - Aetherling's Voice: game-design/voice.md
    - Core Loop: game-design/core-loop.md
    - Micro-Quests: game-design/quests.md
    - Feedback Lines: game-design/feedback.md
  - Dev Reference:
    - Architecture: dev-reference/architecture.md
    - Conventions: dev-reference/conventions.md
    - Contributing: dev-reference/contributing.md
    - Git Primer: dev-reference/git-primer.md
    - GSD Workflow: dev-reference/gsd-workflow.md

markdown_extensions:
  - admonition
  - pymdownx.details
  - pymdownx.superfences
  - pymdownx.tasklist:
      custom_checkbox: true
  - toc:
      permalink: true
```

[CITED: marketing-ops/mkdocs.yml — adapted, not copied verbatim]

### Pattern 2: GitHub Actions — Docs Deploy Workflow

**What:** Build MkDocs site and deploy to GitHub Pages on every push to master.
**When to use:** Required for INFR-01.

```yaml
# Source: marketing-ops/.github/workflows/docs.yml (exact copy, branch changed to master)
name: docs
on:
  push:
    branches:
      - master   # This repo uses master, not main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: 3.x
      - run: echo "cache_id=$(date --utc '+%V')" >> $GITHUB_ENV
      - uses: actions/cache@v4
        with:
          key: mkdocs-material-${{ env.cache_id }}
          path: ~/.cache
          restore-keys: mkdocs-material-
      - run: pip install mkdocs-material
      - run: mkdocs build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

[VERIFIED: from marketing-ops/.github/workflows/docs.yml — only change is `main` → `master`]

### Pattern 3: GitHub Actions — Whats-Changed Generation

**What:** Weekly cron + workflow_dispatch trigger to regenerate `docs/whats-changed.md` from CHANGELOG.md using Claude API.
**When to use:** Required for INFR-04. Requires `ANTHROPIC_API_KEY` repository secret.

Key adaptation from marketing-ops: the `SYSTEM_PROMPT` in `generate_whats_changed.py` must be rewritten for the Lanternkeeper audience (Dave and Allie, not Tonia). The script structure is identical — only the persona and framing change.

[VERIFIED: from marketing-ops/.github/workflows/whats-changed.yml and scripts/generate_whats_changed.py]

### Pattern 4: CHANGELOG.md AI State Journal Format

**What:** Each entry uses `Changed:` / `State now:` / `Constrains:` structure under a date heading.
**When to use:** Every time state changes. Mandatory at start of phase (first entry = project state at milestone start).

```markdown
# Changelog

AI state journal for Lanternkeeper: Emberfall. Each entry captures what changed,
the resulting state, and constraints on future work. Reverse chronological.

For the human-readable narrative, see [What's Changed](docs/whats-changed.md).

---

## 2026-04-12

### Phase 1 — Project Infrastructure
- **Changed:** [what was done]
- **State now:** [what is true as a result]
- **Constrains:** [what future work must respect]
```

[VERIFIED: pattern confirmed in marketing-ops/CHANGELOG.md]

### Pattern 5: CLAUDE.md Reconciliation

**What:** Existing `claude.md` (Allie's file) becomes `CLAUDE.md` — uppercase per project convention. Content is slimmed to terse constraints only. Full content moves to docs site.

**What stays in CLAUDE.md:**
- Project summary (4-6 lines)
- Tech stack (4-5 bullet points)
- Design Pillars (the 3 pillars, 1-2 lines each — no elaboration)
- Core Loop (numbered list, brief)
- Aetherling Voice (tone + language rules as short lists, identity is/is-not lists)
- Implementation Rules (the 4 existing rules)
- File Structure (existing section, trimmed)
- Final Rule (the enforcement gate — unchanged)
- GSD sections appended by tooling (leave `<!-- GSD:* -->` blocks intact)

**What moves to docs site only:**
- Full micro-quest catalog (40 items) — link to `src/data/quests.ts` instead
- Full feedback lines catalog (20 items) — link to `src/data/feedback.ts` instead
- Detailed pillar checklist with examples (DOCS-02)
- Detailed voice reference with examples (DOCS-04)
- Architecture deep-dive (already in `.planning/codebase/`)

**File rename:** `claude.md` → `CLAUDE.md` (uppercase per project standards.md convention: "UPPERCASE for canonical docs")

### Anti-Patterns to Avoid

- **Duplicating quest/feedback content in CLAUDE.md:** 40 quests + 20 feedback lines is 60 entries that will drift. Keep in `src/data/`, reference from docs. (D-03)
- **Manually editing `docs/whats-changed.md`:** This file is generated. Edits will be overwritten. Marker comment required. (D-10)
- **Hardcoding `main` branch in GitHub Actions:** This repo uses `master`. (verified via `gh api`)
- **Skipping the `<!-- GENERATED CONTENT BELOW` marker in whats-changed.md:** The generation script splits on this marker to preserve the static header. Required.
- **Publishing Pages before enabling it in repo settings:** GitHub Pages is not yet enabled (404 on Pages API). Must enable in Settings → Pages → Source: GitHub Actions before the workflow can deploy.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Docs site | Custom HTML/CSS site | MkDocs Material | Already proven, installed, search/nav/dark mode included |
| Human-readable changelog | Manual rewrite | Claude API generation script | Pattern exists in marketing-ops; adapting is ~30 lines |
| GitHub Pages deployment | Custom deploy scripts | `actions/deploy-pages@v4` | Official GitHub action, zero config |
| CHANGELOG format | Custom format | AI state journal (Changed/State now/Constrains) | Already proven in marketing-ops, optimized for agent consumption |

**Key insight:** Every deliverable in this phase has a working reference implementation in marketing-ops. The work is adaptation and content authoring, not engineering.

---

## Runtime State Inventory

Step 2.5: SKIPPED — this is a greenfield infrastructure phase. No app code is changing, no stored data references will be renamed, and no runtime systems are being modified. The new files (CHANGELOG.md, docs/, mkdocs.yml, workflows) are net-new.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| mkdocs | INFR-01, INFR-03 | Yes (pyenv) | 1.6.1 | — |
| mkdocs-material | INFR-01, INFR-03 | Yes (pyenv) | 9.7.6 | — |
| anthropic (Python) | INFR-04 | Yes (pyenv) | 0.85.0 | — |
| GitHub Actions (CI) | INFR-01, INFR-04 | Yes | — | — |
| GitHub Pages | INFR-01 | Not enabled | — | Enable in repo Settings → Pages → Source: GitHub Actions |
| ANTHROPIC_API_KEY repo secret | INFR-04 | Unknown — must verify | — | Add via GitHub repo Settings → Secrets |
| Python 3.x (pyenv 3.11.9) | scripts/ | Yes | 3.11.9 | — |
| gh CLI | Repo config | Yes | — | — |

**Missing dependencies with no fallback:**
- GitHub Pages must be enabled before the docs workflow can successfully deploy. This is a one-time manual step in repo settings.

**Missing dependencies with fallback:**
- `ANTHROPIC_API_KEY` repository secret — if not set, the `whats-changed.yml` action will fail silently but docs deployment (INFR-01) still works. Secret must be added for INFR-04 to function.

[VERIFIED: tool availability via `mkdocs --version`, `pip show`, `gh auth status`; Pages status via `gh api repos/wdi-dave-roberts/lanternkeeper-emberfall/pages`]

---

## Common Pitfalls

### Pitfall 1: Branch Name Mismatch
**What goes wrong:** The marketing-ops `docs.yml` workflow triggers on `branches: [main]`. This repo uses `master`. Copy-paste without changing this means the docs workflow never fires.
**Why it happens:** GitHub default branch naming changed; this repo predates or opts out of that default.
**How to avoid:** Replace `main` with `master` in all workflow `on: push: branches:` sections.
**Warning signs:** Push to master, no workflow triggered, no Pages deployment.

### Pitfall 2: GitHub Pages Not Enabled
**What goes wrong:** The workflow runs, `mkdocs build` succeeds, `upload-pages-artifact` succeeds, but `deploy-pages` fails with "Pages not enabled" or similar error.
**Why it happens:** GitHub Pages requires a one-time opt-in per repo. The API currently returns 404 for this repo's Pages endpoint.
**How to avoid:** Wave 0 task: enable GitHub Pages in repo Settings → Pages → Source: GitHub Actions (not a branch).
**Warning signs:** Deploy job fails immediately with a Pages API error.

### Pitfall 3: Generated Marker Missing in whats-changed.md
**What goes wrong:** The `generate_whats_changed.py` script splits on `<!-- GENERATED CONTENT BELOW` to find where to insert generated content. If this marker is absent, the script errors or overwrites the entire file.
**Why it happens:** The file is created manually without the marker, or the marker is accidentally deleted.
**How to avoid:** The initial `docs/whats-changed.md` must include the `<!-- GENERATED CONTENT BELOW` marker comment after the static header.
**Warning signs:** Script exits with "Could not find generated content boundary."

### Pitfall 4: MkDocs build fails on missing nav files
**What goes wrong:** `mkdocs build` fails if `nav:` in `mkdocs.yml` references a `.md` file that doesn't exist yet.
**Why it happens:** Nav is defined upfront; content files must exist before build runs.
**How to avoid:** All files listed in `nav:` must exist before the first CI run. Stub files (even just a heading) are sufficient.
**Warning signs:** `mkdocs build` local run exits with "Documentation file not found."

### Pitfall 5: GSD-injected sections in claude.md
**What goes wrong:** `claude.md` contains `<!-- GSD:project-start -->` through `<!-- GSD:profile-end -->` comment blocks injected by the GSD tooling. If these are removed or reordered during reconciliation, the GSD tools will re-inject them or fail to find their markers.
**Why it happens:** GSD auto-updates `CLAUDE.md` by finding these comment markers.
**How to avoid:** Leave all `<!-- GSD:* -->` blocks intact and at the end of the file. Only edit the content above the first `<!-- GSD:project-start -->` marker. The rename from `claude.md` to `CLAUDE.md` must also be reflected in any GSD tool configuration that references the filename.
**Warning signs:** GSD tools report "could not find CLAUDE.md" or re-inject duplicate sections.

---

## Code Examples

Verified patterns from official sources:

### whats-changed.md Initial File Structure
```markdown
---
title: "What's Changed"
---

# What's Changed

This page tracks every meaningful change to Lanternkeeper: Emberfall.

<!-- GENERATED CONTENT BELOW — do not edit manually. Run scripts/generate_whats_changed.py to regenerate. -->

```
[VERIFIED: pattern from marketing-ops/docs/whats-changed.md]

### CHANGELOG.md Initial Entry
```markdown
# Changelog

AI state journal for Lanternkeeper: Emberfall. Each entry captures what changed,
the resulting state, and constraints on future work. Reverse chronological.

For the human-readable narrative, see [What's Changed](https://wdi-dave-roberts.github.io/lanternkeeper-emberfall/whats-changed/) on the docs site.

---

## 2026-04-12

### Project Infrastructure — Milestone Start
- **Changed:** Added MkDocs docs site with Material theme, GitHub Pages deployment, CHANGELOG, and reconciled CLAUDE.md. Corrected DOCS-01 requirement (no Godot content exists — was a cross-project leak from laternfall). Renamed claude.md to CLAUDE.md.
- **State now:** Docs site live at https://wdi-dave-roberts.github.io/lanternkeeper-emberfall/. CHANGELOG.md is the running state journal. CLAUDE.md is the single source of truth for project constraints, pointing to src/data/ for game content and docs site for teaching reference. Game content (40 quests, 20 feedback lines) lives exclusively in src/data/.
- **Constrains:** Do not manually edit docs/whats-changed.md (generated). Do not duplicate quest/feedback content in CLAUDE.md. All future changes must satisfy at least one design pillar.
```

### generate_whats_changed.py System Prompt (adapted for Lanternkeeper)
```python
SYSTEM_PROMPT = """\
You are a progress journal writer for Lanternkeeper: Emberfall, a calm companion \
game for solo indie developers. You translate structured technical changelog entries \
into a narrative that Allie (co-developer, learning developer) can follow.

Rules:
- Write in outcomes, not operations. "The docs site is now live" not "configured mkdocs.yml"
- Explain WHY every change matters to the project
- Use "we" — this is collaborative work
- Keep it warm but not performative — match Aetherling's tone: calm, dry, warm-under-the-surface
- Avoid jargon; if you must use a term, add a brief parenthetical the first time
- Be concrete about what's different now vs. before

Entry structure:
- Title (#### heading) — one sentence describing the outcome
- Body — 2-3 sentences on what changed
- **Why:** — one sentence on why this matters

What to skip: pure docs restructuring, internal tooling without user impact, chore entries.

Output ONLY the generated markdown entries. No preamble."""
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `claude.md` (lowercase) | `CLAUDE.md` (uppercase) | This phase | Matches project canonical docs convention |
| Quest/feedback content in CLAUDE.md | Content in `src/data/`, reference link in CLAUDE.md | This phase | Prevents drift, scales to multiple characters |
| No change history | CHANGELOG.md + auto-generated whats-changed.md | This phase | All subsequent changes are transparently recorded |
| No docs site | MkDocs Material on GitHub Pages | This phase | Allie has a learning reference; design decisions are visible |

**Deprecated/outdated:**
- DOCS-01 requirement text: The current text says "merge Dave's Godot architecture docs with Allie's design pillars." This is incorrect — there are no Godot docs in this repo (D-01, D-14). The requirement text must be corrected as part of this phase.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `ANTHROPIC_API_KEY` is available as a GitHub repository secret (or will be added) | Environment Availability | whats-changed.yml workflow fails silently; INFR-04 incomplete until added |
| A2 | GitHub Pages can be enabled via Settings → Pages → Source: GitHub Actions on a public repo under `wdi-dave-roberts` account | Environment Availability | If account restrictions prevent Pages, deployment target must change |

---

## Open Questions

1. **ANTHROPIC_API_KEY repository secret**
   - What we know: The secret is required by `whats-changed.yml`; it is not verified as set
   - What's unclear: Whether it already exists in this repo's secrets
   - Recommendation: Wave 0 task to verify or add via `gh secret set ANTHROPIC_API_KEY`

2. **`claude.md` → `CLAUDE.md` rename and GSD tooling**
   - What we know: GSD injects content blocks using comment markers in the file; the filename matters to the tooling
   - What's unclear: Whether GSD config hardcodes `claude.md` (lowercase) or auto-discovers CLAUDE.md
   - Recommendation: Rename the file and test GSD commands; if they break, check `.planning/config.json` or GSD tooling source for filename references

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected in codebase (STRUCTURE.md: "No test files found") |
| Config file | None — Wave 0 gap |
| Quick run command | N/A — this phase is docs/config only |
| Full suite command | `mkdocs build` (validates all nav files exist and markdown is parseable) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFR-01 | MkDocs site builds without errors | smoke | `mkdocs build` | ❌ Wave 0 (mkdocs.yml) |
| INFR-01 | GitHub Pages deployment succeeds | manual | Check `https://wdi-dave-roberts.github.io/lanternkeeper-emberfall/` | — |
| INFR-02 | CHANGELOG.md exists and follows AI state journal format | manual | Visual inspection | ❌ Wave 0 |
| INFR-03 | Docs site contains required content sections | smoke | `mkdocs build` + visual inspection | ❌ Wave 0 |
| INFR-04 | `generate_whats_changed.py` runs without error | smoke | `python3 scripts/generate_whats_changed.py` (requires ANTHROPIC_API_KEY) | ❌ Wave 0 |
| DOCS-01 | CLAUDE.md is reconciled, Godot refs removed, GSD blocks intact | manual | Visual inspection | ❌ Wave 0 |
| DOCS-02 | Pillar checklist with examples exists on docs site | manual | Visual inspection of `docs/game-design/pillars.md` | ❌ Wave 0 |
| DOCS-03 | Docs site is navigable and contains game design content | manual | `mkdocs serve` + browser review | ❌ Wave 0 |
| DOCS-04 | Voice rules teaching reference on docs site | manual | Visual inspection of `docs/game-design/voice.md` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `mkdocs build` — catches broken nav and missing files
- **Per wave merge:** `mkdocs build` + manual site review
- **Phase gate:** Full site deployed and publicly viewable before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `mkdocs.yml` — required before any `mkdocs build` can run
- [ ] `docs/index.md` — MkDocs requires at minimum an index page
- [ ] All files listed in `nav:` must be stubbed before CI runs
- [ ] `.github/workflows/docs.yml` — required for INFR-01
- [ ] `.github/workflows/whats-changed.yml` — required for INFR-04
- [ ] `scripts/generate_whats_changed.py` — required for INFR-04
- [ ] `CHANGELOG.md` — required for INFR-02 and INFR-04
- [ ] `docs/whats-changed.md` (with GENERATED marker) — required for INFR-04 script to run

---

## Security Domain

This phase introduces no authentication, user data handling, network endpoints, or secrets in code. The only security-relevant element is the `ANTHROPIC_API_KEY` repository secret consumed by the GitHub Actions workflow — standard GitHub Actions secrets handling applies (secret is injected as environment variable, never logged, never committed to source).

ASVS categories V2/V3/V4/V6 do not apply to a static docs site + CHANGELOG. V5 (input validation) is not applicable — no user input is processed.

---

## Sources

### Primary (HIGH confidence)
- `marketing-ops/CHANGELOG.md` — Reference implementation of AI state journal format (verified locally)
- `marketing-ops/.github/workflows/docs.yml` — GitHub Actions deploy workflow (verified locally, exact copy)
- `marketing-ops/.github/workflows/whats-changed.yml` — Whats-changed generation workflow (verified locally)
- `marketing-ops/scripts/generate_whats_changed.py` — Generation script (verified locally, adaptation required)
- `marketing-ops/mkdocs.yml` — MkDocs configuration reference (verified locally)
- `mkdocs --version` output — MkDocs 1.6.1 installed locally
- `pip show mkdocs-material` — Material 9.7.6 installed locally
- `pip show anthropic` — anthropic 0.85.0 installed locally
- `gh api repos/wdi-dave-roberts/lanternkeeper-emberfall/pages` → 404 — Pages not enabled (verified)
- `gh api repos/wdi-dave-roberts/lanternkeeper-emberfall` — repo is public, default branch is `master` (verified)

### Secondary (MEDIUM confidence)
- `marketing-ops/mkdocs.yml` — MkDocs Material features list; current feature IDs assumed stable for Material 9.x

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all tools verified installed locally; reference implementation in marketing-ops
- Architecture: HIGH — copy of proven marketing-ops pattern with minor adaptations
- Pitfalls: HIGH — branch name and Pages enablement verified via tool calls; rest from reference implementation experience
- Content authoring: MEDIUM — content split decisions (D-02 to D-04) are locked; actual page writing is Claude's discretion

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (stable tooling — MkDocs and GitHub Actions action versions rarely break)
