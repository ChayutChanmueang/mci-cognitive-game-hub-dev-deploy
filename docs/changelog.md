# Documentation Changelog

All notable changes to the game documentation suite will be documented in this file.

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
