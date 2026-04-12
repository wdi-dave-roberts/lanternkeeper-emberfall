# GSD Workflow

GSD (Get Shit Done) is a structured workflow Dave uses with Claude Code to plan, execute, and verify changes to the codebase. This page explains what it is and how it affects you as a contributor.

---

## What GSD Is

GSD is a planning system built on top of Claude Code. Before making changes, it generates a plan. After changes are made, it creates a summary of what was done. Plans and summaries live in the `.planning/` directory at the root of the repo.

The system keeps track of what needs to happen, what has happened, and what's next — across multiple sessions and agents.

---

## The Commands

Dave uses these Claude Code slash commands to drive work:

| Command | When it's used |
|---------|---------------|
| `/gsd-quick` | Small fixes, doc updates, one-off tasks |
| `/gsd-debug` | Investigating and fixing bugs |
| `/gsd-execute-phase` | Planned phase work — larger, structured changes |

These commands are Claude Code tools, not terminal commands. You won't run them yourself.

---

## How It Affects You

**The `.planning/` directory** contains plans, summaries, research, and state. If you see files like `01-02-PLAN.md` or `01-02-SUMMARY.md`, those are GSD artifacts from a completed plan. They are documentation of what was decided and why.

**The commit history** reflects GSD's structure. Commits follow a pattern like `feat(01-02): write game design docs pages` — the `01-02` is the phase and plan number. This makes it easy to trace a commit back to the plan that produced it.

**CLAUDE.md** enforces that changes go through a GSD workflow. If you open Claude Code on this project, it will nudge you toward using a GSD command before making edits. This keeps plans and execution in sync.

---

## You Don't Need to Use GSD Directly

GSD is Dave's tool for coordinating with Claude Code. You contribute through normal Git workflows — branch, edit, commit, push, pull request.

Understanding GSD helps you:
- Read the commit history and understand what phase each change belongs to
- Find the plan behind a decision (check `.planning/phases/`)
- Know why `.planning/` files exist and that they shouldn't be edited manually

If you want to propose a change that feels significant — a new screen, a mechanic change, a content update — mention it to Dave first. Significant changes go through planning before implementation. That's the GSD way.
