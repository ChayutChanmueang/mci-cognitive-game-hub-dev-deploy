# Documentation Changelog

All notable changes to the game documentation suite will be documented in this file.

> Project version follows [Semantic Versioning 2.0.0](https://semver.org). Source of truth: `package.json`. The game is **pre-beta**, so it stays in the `0.x` line (SemVer rule 4 — "anything MAY change"); we do **not** bump to `1.0.0` until a stable, production public API is declared. Within `0.x`: new backward-compatible functionality bumps MINOR; bug fixes bump PATCH.
>
> ⚠️ **REMINDER — bump the version with the change, not "at ship".** Every change that adds functionality (MINOR) or fixes a bug (PATCH) **must** apply the version bump in lockstep — update `package.json` **and** this changelog **and** every doc that cites the version — following the **[semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md)** (see its §4 decision procedure + §5 update protocol + §9 checklist). Do **not** defer bumps to release time and do **not** bump PATCH for new features. When several unreleased changes accumulate, the highest applicable part wins and they share one version.

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
| `0.10.0` | 2026-06-23 | Figma-derived Game Hub components + gender-based avatars + asset consolidation |
| `0.11.0` | 2026-06-23 | Welcome screen + game logo, full PWA icon set, iOS gyro input handler, in-game logging rework |
| `0.12.0` | 2026-06-25 | **(current)** Sprint 7 polish: check-in celebration effect, rainbow sparkle, tree growth transition, app version badge |

> The dates and groupings are reconstructed from git history and are approximate; only `0.10.0` onward is tracked prospectively.

## [0.12.0] - 2026-06-25
**Version bump:** `0.11.0 → 0.12.0` (**MINOR**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — new backward-compatible functionality shipped this sprint: check-in celebration effect, rainbow sparkle effect, tree growth transition, and the app version badge. Highest applicable part wins; PATCH reset to 0. Bug-fix-style refinements within these features (sparkle star shape/sizing, growth timing) fold into the same unreleased MINOR. The detailed dated sub-entries below are all part of this version.

> The per-feature dated entries that follow were authored mid-development and previously said "not bumped yet"; that deferral was incorrect under the skill (§5: bump in lockstep). They are now consolidated under `0.12.0`.

## [2026-06-25] - App Version Badge (US-E7-05, code)
**Part of `0.12.0` (MINOR).**

### Added
- Version badge shown on every DOM page (Game Hub, Login, Sign-up, Leaderboard, Player-Info, popups). Appended once as `.app-version-badge` to `document.body` in `src/main.js`, displaying `v<version>`.
- Version comes from a **single source of truth** (`package.json`), injected at build time via Vite `define: { __APP_VERSION__ }` in both `vite/config.dev.mjs` and `vite/config.prod.mjs` (read with `readFileSync`). Verified `v0.12.0` is folded into the production bundle.
- Auto show/hide tied to the existing `body.game-mode` class via CSS (`public/style.css`): hidden inside minigames, visible on all DOM shells — no per-route JS toggling. `pointer-events: none`, `user-select: none`.
- **Position is page-aware:** bottom-**left** on the Game Hub, bottom-**right** on every other DOM page. Driven by a `body.game-hub-route` class set in `showHub()` and cleared in `renderCurrentRoute()` on each route change; CSS overrides `right→left` under that class.

## [2026-06-25] - Thai minigame names in Game Hub (US-E7-07, data — partial)
**No project version change (stays at `0.12.0`).** Database-data change, not a repo code change — `game-hub-screen.js` already renders `th_name || name`, so no code/version bump.

### Changed
- Minigame display names now show in **Thai on the Game Hub**, by populating the database `th_name` column. Internal `gid`/slug references untouched.

### Pending (US-E7-07 remaining)
- Game **covers/tutorials** and **result screens** still show English names — not done yet.
- How-to-play text **font enlargement** on game covers — not done yet.

## [2026-06-25] - Scope cut: drop "พบกันใหม่วันพรุ่งนี้" after-drama popup (US-E7-16, docs)
**Docs-only** (no `package.json` bump). Records an owner scope decision.

### Changed
- **US-E7-16 AC#1 changed from "fix" to "cut":** the after-drama see-you-tomorrow popup ("พบกันใหม่วันพรุ่งนี้" / "พรุ่งนี้มีต้นคิดดี และละครสั้นรอคุณอยู่") is **removed from scope** — it will not be shown. After the short-video (drama) step, the check-in flow closes and returns home directly (no extra popup). The page was never implemented in code, so this is a design/scope removal only.
- Updated `US-E7-16.md` (title, AC#1 + scope-change note, technical tasks, visual-reference caption marked ❌ removed), `01-product-backlog.md`, and `sprint-07.md` accordingly.

## [2026-06-25] - Tree Growth Transition (US-E7-10, code)
**Part of `0.12.0` (MINOR).**

### Added
- Tree growth animation on the check-in progression page. New screen-local helper `growTreeTransition(img, prevStage, nextStage, onGrow)` in `checkin-summary-screen.js`: shows the **previous** stage, bounces it up then collapses it down, swaps to the **current** stage image, then bounces the new tree up (overshoot → settle). Scales from `transform-origin: bottom center` so the tree appears to grow out of its pot. Web Animations API; kept out of the shared effect components (mirrors `bounceCheckInCharacter`).
- Day 1 already maps to a previous stage (`getTreeStage(completedDays - 1)` → `tree_01`), so there is always a "previous tree" — no empty case.
- Respects `prefers-reduced-motion` (skips the animation, sets the final image) and exposes a `cancel()` handle that is cancelled in `cleanup()`.

### Changed
- **Re-timed the sparkle burst** to fire at the grow moment (via the `onGrow` callback, when the new tree pops in) instead of immediately on entering the page.

## [2026-06-24] - Sparkle Particle Effect (US-E7-10, code)
**Part of `0.12.0` (MINOR).**

### Added
- New reusable component `src/ui/components/effects/sparkle-effect.js` — rainbow, random sparkle particles that spread out and up from an anchor element (bone-meal-inspired, not green). 4-point twinkle star drawn as an inline **SVG cubic-bezier path** (concave sides, adapted from a p5.js `bezierVertex` star) that scales per particle; Web Animations API, `position: fixed`, `pointer-events: none`, staggered spawn for gradual spread, glow via `drop-shadow`, `cancel()` handle, respects `prefers-reduced-motion`.
- Wired into `checkin-summary-screen.js`: shows on the **tree progression (calendar) step**, anchored to `.tree-progress-frame`; cancelled in `cleanup()`. Growth-transition animation intentionally **not** added yet (per request) — sparkle currently fires on entering the page, to be re-timed to the grow moment later.
- Both effect components now live under `src/ui/components/effects/` (celebration-effect moved here too).

### Changed
- Tuned sparkle defaults to be bigger and denser: particle `count` 18 → 48, spread radius factor 0.6 → 1.0 (`centerOf`), and a new `sMinMax` option `{min, max}` to control per-particle star size in px (default `{min:25, max:50}`).

### Spec (docs)
- Documented the **tree growth transition** flow in `US-E7-10` (previous stage → bounce up → collapse → bounce next stage up; day 1 already has `tree_01`, so no empty case) and saved 2 sparkle reference screenshots under `docs/agile/user-stories/assets/`.

## [2026-06-24] - Check-in Celebration Effect (US-E7-13, code)
**First feature of `0.12.0` (MINOR `0.11.0 → 0.12.0`).** New backward-compatible functionality.

### Added
- New component `src/ui/components/effects/celebration-effect.js` — **generic, reusable** DOM/hub confetti burst (`position: fixed`, above popups, `pointer-events: none`, auto-cleanup + `cancel()` handle, optional headline/sound, respects `prefers-reduced-motion`). Kept **separate** from the Phaser `level-complete-effect.js` so the 6 minigames are untouched; intentionally contains **no screen-specific animation**.
- Wired into `checkin-summary-screen.js` "เก่งมาก !!!" step: confetti + a screen-local `bounceCheckInCharacter()` helper (two slow 0.5s-up/0.5s-down bounces via Web Animations API) on the gender-based character; both cancelled in `cleanup()` if the popup closes early. US-E7-13 → 🏗 In-Progress (pending mobile QA).

## [2026-06-24] - Sprint 7 Scroll-Containment Bug (BUG-006)
**Process/docs only — no project version change (stays at `0.11.0`).**

### Added
- Filed `BUG-006` (Open, Medium): on small screens, scrolling drags the **background** (gets cut off) and the **FAB** (fails to float, ends mid-screen) along with the content — broken scroll containment, seen on Player-Info. Saved the reference screenshot under `docs/agile/reports/bugs/assets/`; added to `sprint-07.md` Stability table and `kanban.md`; linked to the TD-E6-05 scroll-containment audit.

## [2026-06-24] - Sprint 7 Popup/Layout Test Specs (+ reference screenshots)
**Process/docs only — no project version change (stays at `0.11.0`).**

### Added
- Saved 3 reference screenshots under `docs/agile/user-stories/assets/` and embedded them in the relevant stories.
- `US-E7-16`: post-drama popup must show the **ต้นคิดดี at the same growth size as the previous screen**; same-day re-entry popup must show a **gender-based resting elderly character** (male = คุณตา, female = คุณยาย).
- `US-E7-14`: added the level-spacing reference image; new criterion to add a **shadow beneath the elderly character in both node and popup** (not just the main page).

## [2026-06-24] - Sprint 7 Owner Task Block (ก้องไผ่)
**Process/docs only — no project version change (stays at `0.11.0`).**

### Added
- Added an **Owner Task Block (ก้องไผ่)** section to `sprint-07.md` mapping each assigned item to a story or coordination note.
- Created `US-E7-14` (Game Hub main-page layout: level spacing, swap game-name ↔ cognitive-category, character shadow), `US-E7-15` (standardized button colors — green = start/confirm/next, red = cancel), `US-E7-16` (popup fixes: post-drama popup + same-day re-entry popup). Registered in `01-product-backlog.md` and `kanban.md`.

### Changed
- Extended `US-E7-02` to cover the **Admin Login** screen art (`admin-login-screen.js`).
- Mapped existing art stories to the owner block (Login/Sign-up → US-E7-02, Player-Info → US-E7-03, Popup frame → US-E7-04, Leaderboard → US-E7-01); noted **พี่กวาง assets** as the E7 art source.
- Captured the backend data-deletion agreement with น้องเกม (clean full player-data deletion, no SE/our-side blockers) as a coordination item linked to `US-E5-03` and `TD-DB-01`.

## [2026-06-24] - Sprint 7 Stability Bugs + Version-UI Refinement
**Process/docs only — no project version change (stays at `0.11.0`).**

### Added
- Filed `BUG-004` (black background after returning from a full-screen mini-game) and `BUG-005` (slow DB load → premature navigation bounces the user back to Game Hub) as Open bugs targeting Sprint 7; added a "Stability & Bug Fixes" section to `sprint-07.md` and queued both in `kanban.md`.

### Changed
- Refined `US-E7-05` acceptance criteria: the version indicator renders at **body (html) level** across **all DOM pages** (not just Game Hub) and is hidden only inside mini-games.

## [2026-06-24] - Doctor Feedback (Meeting #2) → Sprint 7
**Process/docs only — no project version change (stays at `0.11.0`).**

### Added
- Recorded **สรุปประชุมอัปเดต MCI กับคุณหมอ ครั้งที่ 2** as `docs/agile/meeting-backlogs/2026-06-24.md` (full doctor feedback, categorized into Dev / Clinical / Strategy, with action items).
- Created seven feedback-derived stories `US-E7-07`..`US-E7-13`: Thai mini-game names + larger how-to-play text; replace unfamiliar word "สมอบก" in Context Clues; Postcard Reader voice/text; multi-variant check-in tree + juicy effects; happier short-drama videos + AI production pipeline; in-game cognitive-domain display + backend aggregation for AI readiness; "เก่งมาก!!!" check-in celebration effect (confetti/ribbon burst + elderly-character bounce).

### Changed
- Expanded **Sprint 7** scope from 6 to 13 stories (added a "Customer Feedback Items" section); registered the new stories in `01-product-backlog.md` (E7) and `kanban.md`.
- Refreshed the meeting index `03-meeting-backlogs.md` (added the 2026-05-11, 2026-06-08, and 2026-06-24 entries; corrected the 2026-04-07 link).

## [2026-06-24] - Documentation Link Audit
**Process/docs only — no project version change (stays at `0.11.0`).**

### Fixed
- Full link audit across `docs/`: repaired **32 broken relative links** (the ones unresolvable even under Obsidian vault-name resolution).
- `01-product-backlog.md`: de-linked four user stories with no backing file (`US-E3-04/05`, `US-E4-01/02`); Symmetry/Postcard now point to their GDD pages instead.
- `changelog.md`: replaced an absolute `file:///c:/Users/...` Windows path with a repo-relative link.
- `sprint-01..04.md`: fixed back-link to the renamed `02-sprint-planning.md` (was `03-sprint-backlogs.md`).
- Reports/bugs (`BUG-001..003`, `POL-001`, `QA-001`): removed `.md.md` double extensions, corrected the final-system-test report name (`260531` → `260503`), and pointed epic-name pseudo-links to the product backlog.
- `TD-DB-01.md`: corrected source-file paths (`../../../../src` → `../../../src`).
- Archived `US-E3-01/02/03`: fixed epic and `voice-service.js` links.
- Meeting notes (`2026-04-07`, `2026-05-06`, `meeting-template`): fixed Sprint Planning links and de-linked untracked template files.

## [2026-06-23] - Sprint 7 Planning (Art Assets, Versioning & Vertical Responsiveness)
**Process/docs only — no project version change (stays at `0.11.0`).**

### Added
- Opened **Sprint 7** (2026-06-23 → 2026-07-06): created `docs/agile/sprint-backlogs/sprint-07.md` and Epic **E7: Game Art Assets & UI/UX Polish** with stories `US-E7-01`..`US-E7-06` (art assets for Leaderboard, Login/Sign-up, Player-Info, Popup; Game Hub version indicator hidden inside mini-games; mini-game vertical-responsive stretch).

### Changed
- Updated `docs/agile/02-sprint-planning.md` (schedule table, Gantt, sprint details, E7 strategy; marked Post-Sprint Hardening Completed), `docs/agile/01-product-backlog.md` (added E7), and `docs/agile/kanban.md` (queued E7 stories).
- Updated `docs/index.md` Current Sprint pointer to Sprint 7.

## [2026-06-23] - Welcome Screen, PWA Icons & iOS Motion Input (v0.11.0)
**Version bump:** `0.10.0 → 0.11.0` (MINOR) — new backward-compatible functionality (welcome screen + game logo, full PWA icon set, iOS gyro input handler, temporary iOS permission button) shipped alongside fixes; highest applicable part wins, PATCH reset to 0.

### Added
- Welcome screen with the game logo (`public/Logo.png`); the former `landing-screen.js` is now `welcome-screen.js`.
- Full PWA icon set — `icon-192`, `icon-512`, maskable icon, and `apple-touch-icon` — with a corrected `manifest.webmanifest` for installable app icons.
- iOS gyro input handler in the accelerometer manager so Fry Food motion controls work on iOS; plus a temporary iOS motion-permission button.

### Changed
- Reworked in-game data/answer logging across Postcard Reader, Symmetry Decor, Zoo Feeder, Zoo Detective, and Fry Food (logging functions and wrong-answer/score logging logic).
- Game Hub scroll FAB down state now renders the real `scroll-bottom-arrow.svg` instead of a CSS 180° rotation of the up-arrow.
- Updated the game background color and the game icon asset.

### Fixed
- Double score-add bug in Context Clues; answer-logging and second-data-logging issues in Symmetry Decor.
- iOS HTTPS motion-permission handling, permission call order, and fullscreen skip in Fry Food.
- PWA app icon not updating after asset changes.

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
- Added [HF-260502-01 Report](agile/reports/260502_1640_Minigame_Hotfix_Report.md).


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
