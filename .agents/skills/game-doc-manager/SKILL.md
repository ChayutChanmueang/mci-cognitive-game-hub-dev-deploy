---
name: game-doc-manager
description: >
  Manages all documentation for game development projects — including GDD (Game Design
  Documents), Software Design docs, and Agile management artifacts. Use this skill
  whenever the user mentions GDD, game design, sprint planning, backlog, software
  architecture for a game, class diagrams, or wants to create/update/review any
  project document. Trigger even for casual requests like "write up the game concept",
  "plan this sprint", "draft the system design", or "check if our docs are consistent".
  Outputs Markdown (.md) format. Designed for small teams (2–5 people) using an
  engine-agnostic approach.
---

# Game Development Document Manager

Acts as a disciplined technical writer and project manager for game development teams.
Maintains a structured, interlinked document suite covering game design, software
architecture, and Agile workflow — keeping all artifacts consistent with each other.

---

## Document Suite Overview

Three document groups, ordered by priority:

| Group | Purpose | Key Docs |
|-------|---------|----------|
| **GDD** | What the game IS | Concept, Mechanics, Narrative, Art Direction |
| **Software Design** | How it's BUILT | Architecture, System Design, Class Diagrams |
| **Agile Management** | How it's MANAGED | Product Backlog, Sprint Plans, Retrospectives |

All documents live under `docs/` and cross-reference each other via links.

---

## Folder Structure

```
docs/
├── gdd/
│   ├── 00-concept.md           ← High-level game concept & vision
│   ├── 01-mechanics.md         ← Core gameplay loops & rules
│   ├── 02-narrative.md         ← Story, characters, world
│   ├── 03-art-direction.md     ← Visual style, UI/UX guidelines
│   └── 04-audio-direction.md   ← Music, SFX guidelines
├── software/
│   ├── 00-architecture.md      ← System overview & tech stack
│   ├── 01-system-design.md     ← Subsystem breakdown
│   ├── 02-class-diagram.md     ← Key classes & relationships (Mermaid)
│   └── 03-data-schema.md       ← Data structures & persistence
├── agile/
│   ├── product-backlog.md      ← Full feature & task list
│   ├── sprint-XX-plan.md       ← Per-sprint plan (duplicate for each sprint)
│   └── retrospectives/
│       └── sprint-XX-retro.md
├── index.md                    ← Master index with doc status
└── changelog.md                ← Record of all doc updates
```

---

## Workflow

### Command: "create [doc type]"
Generate a new document from the appropriate template below.
Steps:
1. Identify which template to use (GDD / Software / Agile).
2. Fill placeholders from context provided by the user.
3. Add cross-references to related existing docs.
4. Update `docs/index.md` and `docs/changelog.md`.
5. Output as **Markdown** by default; offer `.docx` if user needs to share externally.

### Command: "update [doc]"
Edit an existing document.
Steps:
1. Read the current doc to understand existing content.
2. Apply changes without breaking cross-references.
3. If the change affects another doc (e.g., a mechanic change affects the backlog), flag it and offer to update that doc too.
4. Append an entry to `docs/changelog.md`.

### Command: "sprint from GDD" / "generate backlog"
Derive Agile artifacts directly from GDD content.
Steps:
1. Read `docs/gdd/01-mechanics.md` and other GDD files.
2. Identify features, systems, and tasks implied by the design.
3. Write user stories in the format: `As a [player], I want [feature] so that [outcome]`.
4. Populate `docs/agile/product-backlog.md` grouped by priority (Must Have / Should Have / Nice to Have).
5. If sprint length is given, generate a `sprint-XX-plan.md` with a realistic subset.

### Command: "check consistency" / "lint docs"
Verify that documents agree with each other.
Check for:
- Features described in GDD but missing from the backlog.
- Classes in Software Design not traceable to any GDD mechanic.
- Sprint tasks that reference docs/features not yet written.
- Broken `[[wikilinks]]` or missing cross-references.
Report findings as a checklist; offer to fix each one.

---

## Templates

### GDD — Game Concept (`docs/gdd/00-concept.md`)
```markdown
# [Game Title] — Game Concept

**Version:** 0.1 | **Last Updated:** YYYY-MM-DD | **Owner:** [Name]

## Elevator Pitch
[One paragraph: what is the game, who is it for, what makes it unique?]

## Genre & Platform
- **Genre:** [e.g., 2D Platformer, Top-down RPG]
- **Platform:** [e.g., PC, Mobile, Web]
- **Engine:** [e.g., Unity, Godot, engine-agnostic]
- **Target Audience:** [age, gamer type]

## Core Fantasy
[What does the player FEEL when playing? What is the emotional promise?]

## Unique Selling Points
1. [USP 1]
2. [USP 2]
3. [USP 3]

## Scope & Timeline
- **Team Size:** [N people]
- **Target Duration:** [X months]
- **Milestone 1 (Prototype):** [Date]
- **Milestone 2 (Alpha):** [Date]
- **Milestone 3 (Release):** [Date]

## Related Documents
- Mechanics: [[../gdd/01-mechanics.md]]
- Architecture: [[../software/00-architecture.md]]
- Backlog: [[../agile/product-backlog.md]]
```

### GDD — Core Mechanics (`docs/gdd/01-mechanics.md`)
```markdown
# [Game Title] — Core Mechanics

**Version:** 0.1 | **Last Updated:** YYYY-MM-DD

## Core Loop
[Describe the primary gameplay loop in 3–5 steps. e.g., Explore → Fight → Reward → Upgrade → Explore]

## Player Actions
| Action | Input | Result | Notes |
|--------|-------|--------|-------|
| [Move] | [WASD] | [Character moves] | |
| [Attack] | [Space] | [Deals damage] | |

## Game Systems
### [System Name, e.g., Combat System]
[Description of how this system works, its rules, and win/lose conditions.]

**Linked to Software Design:** [[../software/01-system-design.md#combat-system]]

## Progression & Economy
[How does the player grow? XP, items, unlocks, currency?]

## Win / Lose Conditions
- **Win:** [Condition]
- **Lose:** [Condition]
```

### Software Design — Architecture (`docs/software/00-architecture.md`)
```markdown
# [Game Title] — Software Architecture

**Version:** 0.1 | **Last Updated:** YYYY-MM-DD

## Tech Stack
| Layer | Technology | Notes |
|-------|-----------|-------|
| Engine | [e.g., Unity 2022 LTS] | |
| Language | [e.g., C#] | |
| Version Control | [e.g., Git / GitHub] | |
| CI/CD | [e.g., GitHub Actions] | |

## High-Level Architecture
[Describe the major layers: Game Loop, Input, State Management, Rendering, Audio, Data/Save]

```mermaid
graph TD
    Input --> GameLoop
    GameLoop --> StateManager
    StateManager --> Renderer
    StateManager --> AudioManager
    GameLoop --> DataManager
```

## Key Design Patterns Used
- **[Pattern, e.g., Observer]:** [Where and why]
- **[Pattern, e.g., State Machine]:** [Where and why]

## Related Documents
- System Design: [[./01-system-design.md]]
- GDD Mechanics: [[../gdd/01-mechanics.md]]
```

### Agile — Product Backlog (`docs/agile/product-backlog.md`)
```markdown
# [Game Title] — Product Backlog

**Last Updated:** YYYY-MM-DD | **Version:** 0.1

## Must Have (MVP)
| ID | User Story | Acceptance Criteria | Estimate | Status |
|----|-----------|---------------------|----------|--------|
| US-001 | As a player, I want to [action] so that [outcome] | [Criteria] | [S/M/L] | [ ] |

## Should Have
| ID | User Story | Acceptance Criteria | Estimate | Status |
|----|-----------|---------------------|----------|--------|
| US-0XX | ... | ... | ... | [ ] |

## Nice to Have
| ID | User Story | Acceptance Criteria | Estimate | Status |
|----|-----------|---------------------|----------|--------|
| US-0XX | ... | ... | ... | [ ] |

## Linked GDD Features
- Derived from: [[../gdd/01-mechanics.md]], [[../gdd/00-concept.md]]
```

### Agile — Sprint Plan (`docs/agile/sprint-XX-plan.md`)
```markdown
# Sprint [XX] Plan

**Sprint Dates:** YYYY-MM-DD → YYYY-MM-DD
**Sprint Goal:** [One sentence: what will be DONE by end of sprint?]
**Team:** [Names]

## Committed Stories
| ID | Story | Owner | Estimate | Done? |
|----|-------|-------|----------|-------|
| US-001 | [Story title] | [Name] | [hrs] | [ ] |

## Definition of Done
- [ ] Code reviewed by at least 1 teammate
- [ ] Feature tested on [platform]
- [ ] Relevant doc updated (GDD / Software Design)

## Risks & Blockers
- [Risk 1]: [Mitigation]

## Linked Documents
- Backlog: [[./product-backlog.md]]
- Architecture: [[../software/00-architecture.md]]
```

### Agile — Retrospective (`docs/agile/retrospectives/sprint-XX-retro.md`)
```markdown
# Sprint [XX] Retrospective

**Date:** YYYY-MM-DD | **Facilitator:** [Name]

## What Went Well ✅
- [Item]

## What Could Improve 🔧
- [Item]

## Action Items for Next Sprint
| Action | Owner | Due |
|--------|-------|-----|
| [Action] | [Name] | [Date] |

## Velocity
- **Planned:** [N hrs / points]
- **Completed:** [N hrs / points]
- **Notes:** [Why the difference?]
```

---

## Output Format Rules

- **Format:** Markdown (`.md`) — suitable for Git repos, Obsidian, GitHub Wiki, and VS Code.
- Always include `**Version:**` and `**Last Updated:**` fields in every document header.
- Use `[[wikilinks]]` for internal cross-references between docs.

---

## Special Commands Reference

| User says | Action |
|-----------|--------|
| `"create GDD"` | Generate full GDD suite (concept + mechanics stubs) |
| `"create sprint [N]"` | Generate sprint plan from backlog |
| `"sprint from GDD"` | Auto-derive backlog + sprint from GDD content |
| `"update [doc name]"` | Edit existing doc, propagate changes |
| `"check consistency"` | Cross-check all docs for conflicts/gaps |
| `"retro sprint [N]"` | Generate retrospective template |
| `"status"` | Show `docs/index.md` — what exists, what's missing |