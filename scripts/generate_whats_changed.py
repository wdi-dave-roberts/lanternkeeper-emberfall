#!/usr/bin/env python3
"""Generate docs/whats-changed.md from CHANGELOG.md using Claude API.

Reads the structured AI state journal and generates a narrative that
Allie (co-developer, learning developer) can follow. Preserves the static
header and regenerates all per-change entries.

Requires ANTHROPIC_API_KEY environment variable.
"""

import os
import re
import sys
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("ERROR: anthropic package not installed. Run: pip install anthropic")
    sys.exit(1)


REPO_ROOT = Path(__file__).resolve().parent.parent
CHANGELOG_PATH = REPO_ROOT / "CHANGELOG.md"
WHATS_CHANGED_PATH = REPO_ROOT / "docs" / "whats-changed.md"
GENERATED_MARKER = "<!-- GENERATED CONTENT BELOW"

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

USER_PROMPT_TEMPLATE = """\
Here is the CHANGELOG.md content to translate into a progress narrative:

```markdown
{changelog_content}
```

Generate the progress entries now. Start with the most recent date first."""


def read_static_header(path: Path) -> str:
    """Extract the static header from whats-changed.md (everything above the generated marker)."""
    if not path.exists():
        print(f"ERROR: {path} does not exist")
        sys.exit(1)

    content = path.read_text()
    marker_pos = content.find(GENERATED_MARKER)
    if marker_pos == -1:
        # No marker found — look for the --- separator after the system map
        # Find the last --- before any ## heading
        lines = content.split("\n")
        header_end = 0
        for i, line in enumerate(lines):
            if line.startswith("## ") and line != "## System Map":
                header_end = i
                break
        if header_end == 0:
            print("ERROR: Could not find generated content boundary in whats-changed.md")
            sys.exit(1)
        return "\n".join(lines[:header_end])

    # Find the end of the marker line
    marker_end = content.find("\n", marker_pos)
    if marker_end == -1:
        return content[:marker_pos].rstrip() + "\n\n" + content[marker_pos:marker_pos + len(GENERATED_MARKER) + 50].split("\n")[0] + "\n\n"

    return content[:marker_end + 1].rstrip() + "\n\n"


def generate_narrative(changelog_content: str) -> str:
    """Call Claude API to generate the narrative from changelog entries."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY environment variable not set")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=8192,
        system=SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": USER_PROMPT_TEMPLATE.format(changelog_content=changelog_content)}
        ],
    )

    return message.content[0].text


def main():
    changelog_content = CHANGELOG_PATH.read_text()
    static_header = read_static_header(WHATS_CHANGED_PATH)
    narrative = generate_narrative(changelog_content)
    output = static_header + narrative + "\n"
    WHATS_CHANGED_PATH.write_text(output)
    print(f"Generated {WHATS_CHANGED_PATH} ({len(narrative.splitlines())} lines of content)")


if __name__ == "__main__":
    main()
