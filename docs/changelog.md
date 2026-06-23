# Documentation Changelog

All notable changes to the game documentation suite will be documented in this file.

> Project version follows [Semantic Versioning 2.0.0](https://semver.org). Source of truth: `package.json`. The game is **pre-beta**, so it stays in the `0.x` line (SemVer rule 4 — "anything MAY change"); we do **not** bump to `1.0.0` until a stable, production public API is declared. Within `0.x`: new backward-compatible functionality bumps MINOR; bug fixes bump PATCH.

## Project Version History (reconstructed)

The `package.json` previously held an arbitrary `1.4.0` that never corresponded to a real release (no git release tags, no recorded 1.x progression). On 2026-06-23 the project was renumbered into the correct pre-beta `0.x` line by mapping each feature/system milestone to a MINOR version:

| Version | Date (approx.) | Milestone — new functionality |
| :--- | :--- | :--- |
| `0.1.0` | 2026-02 | First game (Zoo Feeder / sorting line) prototype; Express + Supabase + highscore |
| `0.2.0` | 2026-03 | Supabase client flow, anon auth, scoreboard, login/signup, Game Hub + tutorial |
| `0.3.0` | 2026-04 | Minigames Context Clues, Zoo Detective, Symmetry Decor (drag-drop, puzzle systems) |
| `0.4.0` | 2026-04 | Patient profile (edu/age/phone), admin Supabase auth, session timers, rest/check-in nodes |
| `0.5.0` | 2026-04→05 | Daily preset editor + CSV import/export tooling |
| `0.6.0` | 2026-05 | Minigame infrastructure (EventBus, modular HUD/panels), Resting Point, voice service, error logging |
| `0.7.0` | 2026-05 | Replay logging system, level-complete effects, sprite entities, PWA installability |
| `0.8.0` | 2026-05→06 | Reusable start menu, UI/top-bar redesigns, image-asset redesigns, user event log, Fry Food (accelerometer), mock leaderboard |
| `0.9.0` | 2026-06 | Live leaderboard (RPC + infinite scroll), audio system (BGM/SFX), scoring overhaul, completion popups, tree-growth check-in + short-video VideoPlayer, Docker build |
| `0.10.0` | 2026-06-23 | **(current)** Figma-derived Game Hub components + gender-based avatars + asset consolidation |

> The dates and groupings are reconstructed from git history and are approximate; only `0.10.0` onward is tracked prospectively.

## [2026-06-23] - Game Hub Components & Gender-Based Avatars (v0.10.0)
**Version bump:** `0.9.0 → 0.10.0` (MINOR) — new backward-compatible functionality (Game Hub component system + gender-based character avatars); PATCH reset to 0. (Also renumbered the project from a placeholder `1.4.0` back into the pre-beta `0.x` line — see version history above.)

### Added
- Documented the Figma-derived Game Hub component system (header bar, level-path/progression nodes, and an auto-layout progress bar with fill-width rendering and a text-color flip at the 50% mark) now driving the hub UI.
- Documented gender-based character avatars: the profile avatar in the Game Hub header, the rest/check-in progression node images, and the random gender-based character image on the check-in success screen.

### Changed
- Updated `docs/index.md` snapshot and Active Runtime Surfaces to reflect the Game Hub component system and gender-based avatars; bumped the project version header and Last Updated date.
- Consolidated image/icon/SVG and component CSS assets under `public/` (including `public/assets/gamehub`) and removed the obsolete preview page.

## [2026-06-17] - Video Player Documentation Sync
### Changed
- Added a `VideoPlayer` component section to `docs/software/04-ui-components.md` (no native controls, loading overlay, buffering feedback, read-only progress, volume/mute sync, fullscreen with iOS pseudo-fullscreen fallback, and event API) and updated the `resting-point-popup.js` note.
- Expanded the Resting Point subsystem in `docs/software/01-system-design.md` with the `VideoPlayer` capabilities and the hidden-video filter on random video selection.
- Added the `game_video_list` table (with the `hidden` column) to `docs/software/03-data-schema.md` and documented that `getRandomGameVideoUrl()` only queries `hidden = false`.
- Added a Media line to the implementation snapshot in `docs/index.md`.
- Bumped document versions/dates on the synced software docs.

## [2026-06-16] - Current Implementation Documentation Sync
### Changed
- Updated `docs/index.md` with the current implementation snapshot, active runtime surfaces, and deployment branch hygiene note.
- Updated `docs/gdd/00-concept.md` to reflect the current Vanilla DOM + Material Web + Phaser architecture, Supabase data flow, leaderboard, admin/tooling screens, and Docker/nginx deployment.
- Updated `docs/gdd/01-mechanics.md` with the program-level loop, Game Hub progression, Resting Point, Fry Food, leaderboard, and CSV export mechanics.
- Updated `docs/software/01-system-design.md` with hash routing, Game Hub progression, leaderboard, CSV export, ProgramDateUtil, and database fallback patterns.
- Updated `docs/software/03-data-schema.md` with daily preset, leaderboard read model, runtime notes, and deployment compatibility checks.
- Updated `docs/software/04-ui-components.md` to describe the current DOM/Material Web UI screens instead of the older React HUD wording.
- Updated Agile planning docs (`docs/agile/01-product-backlog.md`, `docs/agile/02-sprint-planning.md`, `docs/agile/kanban.md`) with post-Sprint hardening, branch cleanup, Docker/nginx smoke testing, and documentation sync work.

## [2026-05-26] - User Identifier Schema Update
### Changed
- Updated `docs/software/03-data-schema.md` to describe `user_data` and `user_game_data` without the removed `uid` column and with the current `birth_date` and bigint identity keys.
- Updated `docs/software/02-class-diagram.md` to remove obsolete `uid` and `getPatientByUid()` references from the application model.

## [2026-05-21] - Sprint 6 Progress Sync
### Changed
- Updated Product Backlog (`docs/agile/01-product-backlog.md`) and Kanban Board (`docs/agile/kanban.md`) to reflect the completion of US-E4-03, US-E5-01, and US-E5-02, and set US-E5-03 as In-Progress.
- Updated Sprint 6 Backlog (`docs/agile/sprint-backlogs/sprint-06.md`) to mark committed stories and DB Normalization task progress.
- Synced status and checklists in User Story documentation files (`US-E4-03.md`, `US-E5-01.md`, `US-E5-02.md`, and `US-E5-03.md`).
- Corrected broken link to `260503_Final_System_Test_Report.md` and added `260508_Weekly_Progress_Report.md` to Quality & Progress Report Backlog (`docs/agile/05-report-backlog.md`).

## [2026-05-20] - Sprint 6 Planning
### Added
- Created Sprint 6 Backlog (`docs/agile/sprint-backlogs/sprint-06.md`) specifying sprint goals, Gantt charts, and user stories.
- Created User Story files for remaining Sprint 6 scope:
  - `US-E3-06.md` - เกมจำสัตว์ (ความจำขณะทำงาน/Working Memory)
  - `US-E4-03.md` - บันทึกข้อมูลเชิงลึก (Accuracy, Reaction Time, Fatigue Effect)
  - `US-E5-01.md` - ระบบ Admin Login
  - `US-E5-02.md` - ระบบส่งออกข้อมูลเป็นไฟล์ CSV
  - `US-E5-03.md` - ระบบลบบัญชีและลงชื่อออก

### Changed
- Linked and updated status of all Sprint 6 User Stories to `In-Progress` in Product Backlog (`docs/agile/01-product-backlog.md`).
- Added Sprint 6 row and Mermaid Gantt chart section to Sprint Roadmap (`docs/agile/02-sprint-planning.md`).
- Populated Kanban Board (`docs/agile/kanban.md`) with Sprint 6 tasks in Backlog and In Progress columns.
- Updated Project Index (`docs/index.md`) current status to Sprint 6.

## [2026-05-20] - Sprint 5 Finalization
### Added
- Created Sprint 5 Retrospective report (`docs/agile/retrospectives/sprint-05-retro.md`) covering E2E integration, accessibility features, improvement points (database snake_case column names), and velocity.
- Created Sprint 5 Final Test Report (`docs/agile/reports/260520_Sprint5_Final_Test_Report.md`) validating User Management registration flow, progression map, and resting point minigame.

### Changed
- Completed and closed all Sprint 5 User Stories (`US-E1-02`, `US-E1-03`, `US-E2-02`, `US-E2-03`, `US-E2-04`, `US-E2-05`, `US-E2-06`), detailing implementation mechanisms, database schemas, UI logic, and Bangkok date calculations.
- Updated Sprint 5 Backlog (`docs/agile/sprint-backlogs/sprint-05.md`) to reflect 100% completion of committed user stories and documented resolution of progression map and lock logic risks.
- Updated Retrospectives Backlog (`docs/agile/04-retrospectives-backlog.md`) with Sprint 5 retro and fixed broken markdown links.
- Updated Test Report Backlog (`docs/agile/05-report-backlog.md`) with Sprint 5 final test report, fixed link formatting, and updated quality status dashboard.
- Updated Product Backlog (`docs/agile/01-product-backlog.md`) and Kanban Board (`docs/agile/kanban.md`) to mark all Sprint 5 user stories as Completed/Done.
- Updated Sprint Roadmap (`docs/agile/02-sprint-planning.md`) and Project Index (`docs/index.md`) to mark Sprint 5 status as Completed/Done.

## [2026-05-06] - Agentic AI Documentation
### Added
- Integrated Mermaid diagrams (5 Levels of Maturity, Multi-agent Collaboration, and Reasoning Loop) into `docs/wiki/Agentic-AI/AGENTIC_AI_PROCESS_LVL.md` to enhance visual understanding of the maturity model and workflows.
- Created `docs/wiki/Agentic-AI/AGENTIC_AI_PROCESS_LVL.md` explaining the 4 levels of Agentic AI implementation (Foundation, Specialized Skills, Token Reduction, Integrated Documentation).
- Updated `docs/wiki/wiki.md` with links to the new AI process document and improved existing links.

## [2026-05-06] - Product Backlog & User Stories Update
### Changed
- Overhauled `docs/agile/01-product-backlog.md` based on "Game Design Document V.1.md".
- Added new Epics and User Stories for Detailed Registration, 14-day Level Progression, Rest/Finish Levels, Animal Memory game, and Advanced Analytics (Deep Insights).
- Created detailed User Story documents (`US-E1-01` to `US-E1-03` and `US-E2-01` to `US-E2-06`) in `docs/agile/user-stories/` for the core management and progression systems.
- Synchronized feature status and linked all E1/E2 stories in the backlog for easier navigation.
- Planned **Sprint 05** (May 06-19) focusing on User Management (E1) and Progression System (E2) overhaul.

## [2026-05-03] - Architecture & Project Alignment
### Added
- Created `docs/agile/reports/index.md` as the master index and dashboard for all system test reports.
- Created `docs/agile/retrospectives/index.md` as a central hub for all sprint retrospectives.
- Created `docs/agile/retrospectives/sprint-02-retro.md` to summarize lessons learned from Sprint 2.
- Delivered `Postcard Reader` minigame with expanded memory challenges.
- Implemented project-wide `VoiceService` for Thai instruction text-to-speech.
- Created `Final System Test Report` (v1.0) and confirmed stable status.
- Created `Sprint 04 Retrospective` and finalized documentation suite.
- Created `Documentation & System Overhaul Report` summarizing all session improvements.
### Changed
- Merged `docs/software/04-system-architecture.md` and `docs/software/00-architecture.md` into `docs/gdd/00-concept.md`.
- Renamed `docs/gdd/00-concept.md` to "Game Concept & Architecture".
- Consolidated detailed sprint plans into `docs/agile/sprint-planning.md` for better project tracking.
- Updated `docs/agile/product-backlog.md` and `docs/agile/sprint-planning.md` to reflect Sprint 2 completion status.
- Updated `docs/software/02-class-diagram.md` and `docs/software/03-data-schema.md` to v1.1, adding ECS Lite architecture.
- Updated all cross-references in `README.md`, `docs/index.md`, `docs/wiki/wiki.md`, and other GDD files.
- Updated `game-doc-manager` skill definition to reflect the new documentation structure.
- Updated `docs/software/01-system-design.md` to reflect current architectural patterns (ECS Lite, UIPanel, Object Pooling, Layout Management).
- Polished `Symmetry Decor` game: integrated React HUD (EventBus), added Emoji visuals, and refactored level generation.
- Updated all minigames to use Thai UI elements and centralized Voice Over system.
- Completed all outstanding User Stories in the Product Backlog.
- Set project status to ✅ Completed in the Project Index.

### Removed
- `docs/software/00-architecture.md` (Redundant).
- `docs/software/04-system-architecture.md` (Redundant).

## [2026-05-02] - Minigame Hotfix
### Fixed
- Resolved console errors in `context-clues`, `postcard-reader`, `symmetry-decor`, `zoo-detective`, and `zoo-feeder`.
- Fixed `rexUI` plugin configuration typo (`ket` -> `key`).
- Removed redundant external CDN loading for `rexUI` across all minigames.
- Fixed scene key mismatches in `Preloader.js` starting `MainMenu` instead of `main-menu-scene`.
- Added [HF-260502-01 Report](file:///c:/Users/noppon/sources/mci-cognitive-games/docs/agile/reports/260502_1640_Minigame_Hotfix_Report.md).


## [2026-05-02] - Documentation Restructuring
### Added
- Created `docs/gdd/` folder for Game Design Documents.
- Created `docs/software/` folder for Technical Architecture and Design.
- Created `docs/agile/` folder for Project Management artifacts.
- Created `docs/index.md` as the master document index.
- Created `00-concept.md`, `01-mechanics.md`, `02-narrative.md`, `03-art-direction.md`, `04-audio-direction.md` in `docs/gdd/`.
- Created `00-architecture.md`, `01-system-design.md` in `docs/software/`.

### Changed
- Moved `ClassDiagram-Project.md` to `docs/software/02-class-diagram.md`.
- Moved `DatabaseSchema-Project.md` to `docs/software/03-data-schema.md`.
- Moved `Product-Backlog.md` to `docs/agile/product-backlog.md`.
- Moved `Kanban_Board.md` to `docs/agile/kanban.md`.
- Moved `System-Test-Reports/` to `docs/agile/reports/`.
- Restructured `GDD-Project.md` content into separate modular GDD files.

### Removed
- (Pending) Old `Design-Documents/` and `Progress-Logs/` directories once verification is complete.

---
*Maintained by Antigravity AI Assistant.*
