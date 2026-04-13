# Project Skills

## setup-environment

**Trigger:** User says "setup my environment", "set up my environment", "setup", or "get started"

**What it does:** Detects the user's platform (Windows/Mac/Linux), checks for required tools (Node.js, npm), installs project dependencies, starts the Expo dev server, and walks the user through connecting their phone via Expo Go. Designed for non-technical users -- explains everything in plain language.

**Instructions:** Read and follow `.claude/skills/setup-environment.md`

## test-walkthrough

**Trigger:** User references `@TESTING-GUIDE.md`, says "run the testing guide", "start testing", or "test the app"

**What it does:** Interactive step-by-step testing walkthrough. Walks the user through every feature we need verified, explains what we're testing and why, asks for their feedback at each step, records everything to `testing/FEEDBACK.md`, and handles commit/push at the end.

**Instructions:** Read and follow `TESTING-GUIDE.md`
