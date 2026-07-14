# Documentation Changelog

All notable changes to the game documentation suite will be documented in this file.

> Project version follows [Semantic Versioning 2.0.0](https://semver.org). Source of truth: `package.json`. **v1.0.0** (2026-07-07) is the first **stable production release** — owner-declared full build after Sprint 7 merge to `development`. Post-1.0: backward-compatible features bump **MINOR** (`1.Y.0`); bug fixes bump **PATCH** (`1.0.Z`). The pre-1.0 `0.x` line (Feb–Jul 2026) is preserved in the version history below.
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
| `0.12.0` | 2026-06-25 | Sprint 7 polish: check-in celebration effect, rainbow sparkle, tree growth transition, app version badge |
| `0.12.1` | 2026-06-26 | Fix BUG-005: stale async route handler bouncing user back to Game Hub (route-version guard) |
| `0.13.0` | 2026-06-26 | Boot loading overlay (modal) that blocks interaction until the first screen is ready |
| `0.13.1` | 2026-06-26 | Fix boot overlay staying up ~10-20s — dismiss at first paint, not after full data load |
| `0.14.0` | 2026-06-26 | Boot loading visual refresh: game logo + 5-dot progress indicator |
| `0.14.1` | 2026-06-26 | Fix BUG-006: Player-Info background + test FAB scrolled with content on short screens (scroll containment) |
| `0.14.2` | 2026-06-26 | Fix BUG-007: Game Hub header not centered in some browsers (`justify-items` on a non-grid element) |
| `0.15.0` | 2026-06-26 | US-E7-16 AC#2: same-day re-entry "วันนี้พักก่อน" rest popup with gender-based resting character (คุณตา/คุณยาย) + ground shadow |
| `0.16.0` | 2026-06-26 | Standardized Figma `Character_Shadow` (`.character-shadow`) applied under every คุณตา/คุณยาย figure (rest popup + check-in success + level-path nodes) |
| `0.17.0` | 2026-06-26 | US-E7-02: Figma login art — Frame_Panel + Frame_TextFieldBox + Start-Game-Button applied to player & admin Login screens |
| `0.18.0` | 2026-06-29 | US-E7-02/03: Figma form art — Frame_Form_Panel + Button_OK/Close + IconButtonBack applied to Sign-up & Player-Info screens |
| `0.19.0` | 2026-06-29 | US-E7-19: Welcome screen entry button uses the `Start-Game-Button` art (green "เริ่มเล่นเกม") instead of `md-filled-button` |
| `0.20.0` | 2026-06-29 | US-E7-04: Figma popup art — Frame_Form_Panel + Start-Game-Button on check-in success, resting, day/program-completion popups (also US-E7-16 AC#6 gender char) |
| `0.21.0` | 2026-07-02 | US-E7-20: transition system — popup fade+scale (0.5s) on all popups, page fade between DOM screens, loading overlay on Game Hub/minigame entry; boot loading extracted to reusable JS component (`src/ui/loading-overlay.js`, second copy of the inline boot overlay) |
| `0.22.0` | 2026-07-02 | US-E7-21: progress-tree number stays readable at any fill — two-layer clipped text (base on cream track + high-contrast dark copy clipped to the yellow fill via `--tree-fill`) |
| `0.23.0` | 2026-07-02 | US-E7-18: Android-style Toast component (`src/ui/components/toast.js`, `showToast`/`clearToast`) — replaces inline `<p>` feedback on Login/Admin-Login/Sign-up/Player-Info; bottom-center pill, info/success/error, a11y + reduced-motion |
| `0.24.0` | 2026-07-02 | US-E7-22: partner/supporter logo row (CAMT, NAPLAB, CMU, MedCMU, NRCT) at the bottom of the Welcome screen |
| `0.25.0` | 2026-07-03 | US-E7-01: Leaderboard Figma art port — ported `gh-leaderboard-*` components (`leaderboard-row`, `leaderboard-top-bar`, `leaderboard-bottom-status`, `bg-rounded-leaderboard`) + coin/trophy/flower assets under `public/assets/leaderboard/`; per-rank medal coins, orange "you" highlight, pinned bottom rank bar; scales via `--gh-scale` |
| `0.26.0` | 2026-07-06 | US-E7-25: "วันนี้พักก่อน" rest popup uses the reclining beanbag character art (`OldMan/OldWoman_resting_02.png`, gender-based) + widened/seated ground shadow scoped to the short popup |
| `0.26.1` | 2026-07-06 | Popup style isolation — per-popup `gh-popup--<variant>` scope + `--popup-*` CSS variables so rest / program-completion / check-in / resting-point popups tune independently; Sprint 7 verification pass (US-E7-01/07/10/22/25 confirmed by owner → Done) |
| `0.27.0` | 2026-07-06 | US-E7-26: additional Leaderboard layout pass — refined row / top-bar / bottom-status spacing & alignment and constrained page content to a centered `max 720px` wrapper (built on the US-E7-01 `gh-leaderboard-*` art); scales via `--gh-scale` |
| `0.28.0` | 2026-07-06 | US-E7-23: Context Clues easier answer placement — larger, independently tunable answer-box / blank-slot hit areas (`answerBox.hitArea`/`hitOffset`) + overlap-based drop in `DragDropManager` (`overlapDrop`: a word snaps in when its box overlaps an accepting zone, no pixel-perfect pointer aim) |
| `0.29.0` | 2026-07-06 | US-E7-24 (Fry Food → **Physical** category on Game Hub), US-E7-27 (offline "อินเทอร์เน็ตหายไปแล้ว" popup + `InternetManager`, gender art buffered as data URLs for offline render), US-E7-28 (program-complete popup shows Thai-era **start/end dates**) |
| `0.30.0` | 2026-07-07 | US-E7-09 (Postcard Reader voice/font), US-E7-14 (Game Hub layout — spacing/swap/shadow), US-E7-15 (standardized green/red buttons); BUG-004 Resolved (black background after full-screen minigame) |
| `1.0.0` | 2026-07-07 | First production-ready full build: owner-declared milestone after `features/game-hub` → `development` merge; core patient/admin flows, 14-day Game Hub program, minigame suite, PWA, Supabase persistence, Docker/nginx deploy |
| `1.1.0` | 2026-07-08 | US-E8-01 per-player progression trees, signup assignment, and lazy backfill for existing profiles |
| `1.1.1` | 2026-07-10 | US-E9-08 Game Hub label swap: game name ↑ / category ↓ (commit `a3ffc8d`) |
| `1.1.2` | 2026-07-10 | US-E9-06 Screen Wake Lock: screen stays awake during minigames and story videos and dims again on return to the Game Hub; silent-video fallback for non-HTTPS origins (field feedback hotfix) — owner verified on device |
| `1.1.3` | 2026-07-13 | **(current)** US-E9-11 Sign-up dates are entered and shown in **พ.ศ.** (วัน/เดือน/ปี selects replacing `<input type="date">`, which can only render ค.ศ.); DB keeps ค.ศ. Patient-Info card now prints the full Buddhist year (`15/01/2510`) instead of a 2-digit one — owner verified on device |

> The dates and groupings are reconstructed from git history and are approximate; only `0.10.0` onward is tracked prospectively. **`1.0.0`** is the first formally declared stable release.

## [2026-07-14] - US-E9-12 status → In Progress (docs)
**Docs-only** — no `package.json` bump.

- [US-E9-12](agile/user-stories/US-E9-12.md) → **🔵 In Progress** — popup ออกจากเกม (`game-exit-popup.js`)
- Product backlog, kanban, sprint-09

## [2026-07-14] - Sprint 09 scope rebalance (docs)
**Docs-only** — no `package.json` bump.

### Changed
- [US-E9-03](agile/user-stories/US-E9-03.md) → **🔵 In Progress** (Sprint 09)
- [US-E9-05](agile/user-stories/US-E9-05.md), [US-E9-07](agile/user-stories/US-E9-07.md), [US-E9-09](agile/user-stories/US-E9-09.md) → **📋 Backlog** — เลื่อน [Sprint 10](agile/sprint-backlogs/sprint-10.md)
- [US-E9-12](agile/user-stories/US-E9-12.md) — จัด layout/art `game-exit-popup.js` ให้ตรง `popup-dialog.js` confirm mode (Sprint 09)
- Product backlog, kanban, sprint-09, sprint-10 (new), meeting 2026-07-10, sprint planning

## [2026-07-14] - US-E9-10 status → Done (docs)
**Docs-only** — no `package.json` bump (CLI ops tool, ไม่เกี่ยวกับโค้ดเกมโดยตรง).

### Changed
- [US-E9-10](agile/user-stories/US-E9-10.md) → **✅ Done** — CLI [`update-user-hn.js`](../../update-user-hn.js) (`--from-hn`, `--to-hn`, `--dry-run`)
- Product backlog, kanban, sprint-09, meeting 2026-07-10 action item #11

## [2026-07-14] - US-E7-08, US-E7-11, US-E7-12 status → Done (docs)
**Docs-only** — no `package.json` bump.

- [US-E7-08](agile/user-stories/US-E7-08.md) → **✅ Done** — แก้คำศัพท์ Context Clues โดยทีมเนื้อหา/แพทย์
- [US-E7-11](agile/user-stories/US-E7-11.md) → **✅ Done** — ละครสั้น/วิดีโอใหม่โดยทีมเนื้อหา
- [US-E7-12](agile/user-stories/US-E7-12.md) → **✅ Done** — โดเมน Cognitive + สรุปหลังบ้านโดยทีมหลังบ้าน/ข้อมูล
- Product backlog, kanban, sprint-07/08, meeting 2026-06-24 action items, sprint planning

## [2026-07-14] - US-E5-03 status → Done (docs)
**Docs-only** — no `package.json` bump.

### Changed
- [US-E5-03](agile/user-stories/US-E5-03.md) → **✅ Done** — ลบบัญชีผ่าน CLI [`delete-user.js`](../../delete-user.js) + logout ในแอป (Admin UI แทนด้วย script)
- Product backlog, kanban, sprint-08 carried-over table

## [2026-07-14] - US-E8-01 status → Done (docs)
**Docs-only** — no `package.json` bump (shipped ใน **v1.1.0** แล้ว).

### Changed
- [US-E8-01](agile/user-stories/US-E8-01.md) → **✅ Done** (owner verified 2026-07-14: ต้นคิดดีหลายชนิดแสดงผลได้ปกติ)
- Sprint 8 → Completed; product backlog, kanban, meeting action item #5, sprint planning

## [2026-07-14] - Sprint 09 scope commit: US-E9-05, 09, 10 (docs)
**Docs-only** — no `package.json` bump.

### Changed
- Owner commits [US-E9-05](agile/user-stories/US-E9-05.md), [US-E9-09](agile/user-stories/US-E9-09.md), [US-E9-10](agile/user-stories/US-E9-10.md) to current Sprint 09 release line — status → **In Progress**
- Planned PATCH targets: US-E9-05 → `1.1.4`, US-E9-09 → `1.1.5`, US-E9-10 → `1.1.6` (bump ตอน ship แต่ละ story)
- อัปเดต [Sprint 09](agile/sprint-backlogs/sprint-09.md), [product backlog](agile/01-product-backlog.md), [kanban](agile/kanban.md), [meeting 2026-07-10](agile/meeting-backlogs/2026-07-10.md)

## [1.1.3] - 2026-07-13
**Version bump:** `1.1.2 → 1.1.3` (**PATCH**) — fixes incorrect behavior (the sign-up form asked for and displayed a calendar era ผู้สูงอายุ do not use). No new user-facing capability: the form already collected a birth date and a program start date; it now collects them in the era the user actually knows. The new `thai-era-date.js` / `thai-date-select.js` modules are the implementation of that fix, not a new feature surface.

### Fixed
- **US-E9-11** — Sign-up birth date (`วันเกิด`) and program start date (`วันที่เริ่มโปรแกรม`) are entered and displayed in **พ.ศ.**; the database still stores ISO **ค.ศ.** (`YYYY-MM-DD`). Conversion happens only at the UI boundary, so no Buddhist year ever reaches the backend.
- Patient-Info card printed the Buddhist year with two digits (`15/01/10`), which reads as ambiguous next to a ค.ศ. date. It now spells the year out (`15/01/2510`). The compact program-day labels elsewhere keep the short form.

### Changed
- `<input type="date">` replaced by three native selects (วัน / เดือน / ปี พ.ศ.). A native date input always renders its calendar and text in the **browser's own locale** and exposes no era/locale override, so พ.ศ. is not achievable with it — this is why the control had to change. The selects also remove typing for elderly users and make a malformed date impossible to enter.
- The three selects are fused into one field-box-shaped pill (`gh-frame-field-box-date-l/-c/-r`) so the date keeps the same two-column row as every other field. The month shows its abbreviation once chosen (`ม.ค.`) because the full name is wider than the collapsed select; the dropdown still lists full names (`มกราคม`).
- Day options follow the selected month and year — กุมภาพันธ์ offers 28 or 29 days by Buddhist leap year, and a day past the end of a shorter month clamps down.

### Added
- `src/util/thai-era-date.js` — พ.ศ. ↔ ค.ศ. conversion, Thai month names/abbreviations, Buddhist-aware days-in-month.
- `src/ui/components/thai-date-select.js` — the วัน/เดือน/ปี control; `getValue()`/`setValue()` speak ISO ค.ศ.

### Validated
- Buddhist-era conversion: พ.ศ. 15/ม.ค./2510 persists as `1967-01-15`; age renders `59 ปี`; the submitted payload contains no Buddhist year.
- Calendar edges: 29 ก.พ. 2567 (=2024, leap) accepted; 29 ก.พ. 2566 rejected; 31 เม.ย. rejected (no silent month rollover); switching 31 ธ.ค. → ก.พ. clamps to the 28th.
- An incomplete date blocks submit and outlines the whole pill in red.
- Layout verified at 360px and 768px, including the widest case (`30 | เม.ย. | 2510`) and the empty placeholder state — no cropping. Production build passes.
- Owner verified on device (2026-07-13).

---

## [2026-07-10] - Field Feedback รอบ 2 → US-E9-06..11 (docs)
**Docs-only** (no `package.json` bump).

### Added
- User stories [US-E9-06](agile/user-stories/US-E9-06.md)..[US-E9-11](agile/user-stories/US-E9-11.md) จาก feedback รอบ 2 (ลงพื้นที่)
- อัปเดต [Meeting 2026-07-10](agile/meeting-backlogs/2026-07-10.md) §2.7–2.12, [Sprint 09](agile/sprint-backlogs/sprint-09.md), backlog, kanban

### Consolidation
- **US-E9-07** รวม: เอฟเฟคเก่งมากค้าง + Phaser performance + Galaxy A10s เป็นเครื่องอ้างอิงขั้นต่ำ
- แยกต่างหาก: Wake lock (06), Game Hub labels (08), system font scale (09), HN CLI (10), พ.ศ. signup (11)

---

## [2026-07-10] - Field Feedback ลงพื้นที่ → Sprint 09 + Epic E9 (docs)
**Docs-only** (no `package.json` bump).

### Added
- Meeting note: [2026-07-10 Field Feedback — ลงพื้นที่](agile/meeting-backlogs/2026-07-10.md)
- Epic **E9: Field Feedback Hotfixes** — user stories [US-E9-01](agile/user-stories/US-E9-01.md)..[US-E9-05](agile/user-stories/US-E9-05.md)
- [Sprint 09](agile/sprint-backlogs/sprint-09.md): แก้ด่วน UX มินิเกมจากการลงพื้นที่ → target **`1.1.1`** PATCH
- อัปเดต product backlog, sprint planning, meeting logs, project index

### Notes
- ต้นคิดดีสุ่ม 4 ชนิด → ครอบคลุมแล้วใน [US-E8-01](agile/user-stories/US-E8-01.md) (Sprint 08, target `1.1.0`) — ไม่สร้าง story ซ้ำ
- ลำดับความสำคัญ: P0 gameplay (US-E9-01..04) ก่อน → P1 ระบบ (US-E9-05)

---

## [1.1.0] - 2026-07-08
**Version bump:** `1.0.0 → 1.1.0` (**MINOR**) — adds backward-compatible per-player progression-tree personalization.

### Corrected
- Synced the production `user_game_profile_data` DDL: `tree_type` is nullable with **no database default**. Signup therefore supplies the catalog-selected value explicitly; omitted values remain `NULL` for lazy backfill.

### Added
- `database.js`: catalog-backed `getGameTreeList()`, `pickRandomTreeType()`, and race-aware `ensureUserGameProfileTreeType({ hn })`.
- Sign-up assigns and persists a random tree type from `game_tree_list`; Game Hub lazily backfills existing `NULL`, blank, or invalid values.
- Check-in tree assets resolve through `/assets/checkin-popup/{tree_type}/tree_{tree_type}_{01..14}.png` in both static and growth-transition states.
- Supabase migration adds the authenticated SELECT grant/RLS policy required to read `game_tree_list`.

### Changed
- User game-profile reads include `tree_type`; Game Hub and Player Info test hooks pass it to the check-in popup.
- Empty/inaccessible tree catalogs fail closed in the data layer, preventing accidental mass persistence of fallback type `a` before the RLS migration is deployed.
- US-E8-01 moved to Review / Testing. Production build passes; the RLS migration still needs deployment before manual Supabase and mobile visual QA.

### Fixed
- Restored the check-in growth sequence: the calendar DOM now renders the previous/smaller tree stage initially, holds it for the original timing, then transitions to the current/grown stage. The grown asset is preloaded during the hold to prevent a flash of the final tree before animation.

## [2026-07-08] - US-E8-01: production DB snapshot (docs)
**Docs-only** (no `package.json` bump).

### Added
- Production data snapshots from Supabase export (owner, 2026-07-08):
  - `game_tree_list`: 4 rows (`a`–`d`, `name` null)
  - `user_game_profile_data`: 17 rows (id 59–75), **all `tree_type = NULL`**, all `program = 5`
- SQL reference files: `docs/agile/user-stories/assets/us-e8-01-game_tree_list_rows.sql`, `us-e8-01-user_game_profile_data_rows.sql`
- § **Production Snapshot** in [US-E8-01](agile/user-stories/US-E8-01.md) with full HN table

### Changed
- [US-E8-01](agile/user-stories/US-E8-01.md): AC#1/#7, migration notes, marked DB migration task done
- [03-data-schema.md](software/03-data-schema.md), [sprint-08.md](agile/sprint-backlogs/sprint-08.md): production counts

## [2026-07-08] - US-E8-01: v1.0.0 player backfill + `game_tree_list` (docs)
**Docs-only** (no `package.json` bump — ยังอยู่ที่ `1.0.0` จนกว่า US-E8-01 จะ ship เป็น **`1.1.0`** MINOR).

### Added
- ตาราง **`game_tree_list`** — แหล่งรายการชนิดต้นไม้ที่สุ่มได้ (`id`, `name`); seed ตัวอย่าง `a`/`b`/`c`/`d`
- **Lazy backfill** สำหรับผู้เล่น **v1.0.0 ที่เริ่มโปรแกรมไปแล้ว**: ถ้า `user_game_profile_data.tree_type IS NULL` (หรือว่าง) → สุ่มจาก `game_tree_list` แล้ว **`UPDATE`** ตอนโหลด profile — ค่าคงที่หลัง login ครั้งแรก (ไม่ fallback ชั่วคราวบน UI อย่างเดียว)

### Changed
- [US-E8-01](agile/user-stories/US-E8-01.md): AC#3 (backfill), §`game_tree_list`, §Migration, tasks (`ensureUserGameProfileTreeType`, `getGameTreeList`, `pickRandomTreeType`)
- [sprint-08.md](agile/sprint-backlogs/sprint-08.md): DoD + risks (race backfill, empty `game_tree_list`)
- [03-data-schema.md](software/03-data-schema.md): §3.4 `game_tree_list`, ER diagram, runtime notes ของ `user_game_profile_data`
- `01-product-backlog.md`, `kanban.md`, `index.md`, `02-sprint-planning.md`

## [2026-07-08] - Sprint 8 Planning: Per-Player Progression Tree (US-E8-01, docs)
**Docs-only** (no `package.json` bump — ยังอยู่ที่ `1.0.0` จนกว่า US-E8-01 จะ ship เป็น **`1.1.0`** MINOR).

### Added
- Opened **Sprint 8** (2026-07-08 → 2026-07-21): [sprint-08.md](agile/sprint-backlogs/sprint-08.md) — post-1.0 line, target **v1.1.0**
- Epic **E8: Check-in Personalization & Post-1.0 Enhancements** with [US-E8-01](agile/user-stories/US-E8-01.md):
  - ต้นคิดดีหลายชนิดต่อผู้เล่น — `user_game_profile_data.tree_type` + `game_tree_list`
  - สุ่มตอนสร้าง profile; lazy backfill ผู้เล่นเก่า `tree_type = NULL`
  - asset ที่ `public/assets/checkin-popup/{type}/tree_{type}_01..14.png`
  - ต่อยอดงานที่ยกจาก US-E7-10 (ต้นไม้หลายรูปแบบ)
- Documented `tree_type` column + DDL ใน [03-data-schema.md](software/03-data-schema.md)

### Changed
- Updated `01-product-backlog.md`, `02-sprint-planning.md`, `kanban.md`, `index.md`
- Linked US-E7-10 deferred AC#1/#6 → US-E8-01

## [1.0.0] - 2026-07-07
**Version bump:** `0.30.0 → 1.0.0` (**MAJOR**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — deliberate stable-release milestone: owner confirms the game is **production-ready / full build** after Sprint 7 work merged to `development`. Resets MINOR and PATCH to 0.

### Release highlights
- **Patient flow (complete):** Welcome → Login/Sign-up → Game Hub → daily minigames → check-in / profile / leaderboard.
- **14-day cognitive program:** level progression, daily goals, rest nodes, program-complete popup with Thai-era start/end dates (US-E7-28), block play before program start date (US-E7-29).
- **Minigame suite:** Zoo Detective, Zoo Feeder, Context Clues, Symmetry Decor, Postcard Reader, Resting Point, Fry Food (accelerometer + iOS gyro).
- **Presentation layer (Sprint 7):** Figma-derived DOM UI (Leaderboard, Login, Sign-up, Player-Info, popups), gender-based คุณตา/คุณยาย art, Toast, transitions, offline popup + `InternetManager` (US-E7-27), version badge (US-E7-05).
- **Platform:** Installable PWA, service worker, VideoPlayer (check-in / rest), Supabase + edge-function fallbacks, CSV export, admin tools, Docker/nginx production build.
- **Stability fixes shipped in 0.x line:** BUG-004/005/006/007 resolved; boot loading overlay; route-version guard; scroll containment.

### Known follow-up (post-1.0 backlog — not blocking this release)
- US-E7-06 (minigame vertical responsive), ~~US-E7-08/11/12~~ (doctor feedback — **Done** 2026-07-14, ฝ่ายอื่น), ~~US-E5-03~~ (delete-account — **Done** 2026-07-14), TD-DB-01.

### Docs
- Bumped `package.json`, `docs/index.md`, `docs/changelog.md`, sprint planning — project status → **Stable Release 1.0.0**.

## [0.30.0] - 2026-07-07
**Version bump:** `0.29.0 → 0.30.0` (**MINOR**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — three Sprint 7 user stories verified complete by the owner plus one bug fix; highest applicable part (MINOR) wins.

### Added / Changed
- **US-E7-09 — Postcard Reader voice & readability.** เกมจดหมายจากหลานรัก: ปรับเสียง AI หรือถอดเสียง + ขยายตัวอักษรโจทย์ให้อ่านง่าย — owner ยืนยันแสดงผลได้ปกติ (2026-07-07).
- **US-E7-14 — Game Hub layout polish.** ระยะห่างเลเวล, สลับชื่อเกม ↔ หมวด Cognitive, เงาตัวละคร (`.character-shadow`) ทั้ง node และ popup — owner ยืนยันแสดงผลได้ปกติ (2026-07-07).
- **US-E7-15 — Standardized button colors.** ปุ่มเขียว = ยืนยัน/เริ่ม/ต่อไป, ปุ่มแดง = ยกเลิก — สม่ำเสมอทุกหน้าจอและ popup — owner ยืนยันแสดงผลได้ปกติ (2026-07-07).

### Fixed
- **BUG-004 — black Game Hub background after full-screen minigame.** กลับจากมินิเกม full-screen แล้วพื้นหลัง Game Hub ไม่เป็นสีดำอีกต่อไป — owner ยืนยัน Resolved (2026-07-07).

### Docs
- Marked **US-E7-09, US-E7-14, US-E7-15 Done** and **BUG-004 Resolved**. Synced `01-product-backlog.md`, `sprint-07.md`, `kanban.md`, user-story files, and `BUG-004.md`.
- Added **US-E7-29** (block Game Hub start button before program start date; node state = not yet playable) to backlog, sprint-07, kanban.

## [0.29.0] - 2026-07-06
**Version bump:** `0.28.0 → 0.29.0` (**MINOR**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — three new backward-compatible features (offline popup, program-complete dates, Physical category) verified by the owner; the highest applicable part (MINOR) wins and they share one version.

### Added
- **US-E7-27 — offline / no-internet notification popup.** New `src/ui/offline-popup.js` (`showOfflinePopup` / `dismissOfflinePopup` / `isOfflinePopupOpen`) and `src/core/internet-manager.js` (`InternetManager` singleton). Watches `online`/`offline` events (started at bootstrap in `src/main.js`) + an active `HEAD` probe; shows the "อินเทอร์เน็ตหายไปแล้ว" popup with the gender-based คุณตา/คุณยาย climbing-tree art ("ตรวจสอบอินเทอร์เน็ต แล้วลองปิดเปิดเกมใหม่นะ") when the connection drops and auto-dismisses when it returns. On reconnect (auto or the "ลองอีกครั้ง" button) it re-renders the current route via `onReconnect`.
  - **Offline art survives the disconnect:** the character images are fetched + encoded as `data:` URLs **while online** (`preloadOfflineArt`, buffered in a `Map`) and rendered from that buffer offline, so the image isn't a broken network request. `public/sw.js` (bumped to `CACHE_VERSION v2`) additionally precaches the art and serves a cache fallback on network failure as a safety net.
  - Styling isolated behind the `gh-popup--offline` variant (`--popup-*` overrides + `align-content: start` so the figure hugs the top per the design), so the base popups are untouched.
- **US-E7-28 — program-complete popup shows start/end dates.** `showProgramCompletionPopup()` (`src/ui/day-completion-popup.js`) now renders two Thai-era (`DD/MM/YY`, พ.ศ.) date lines — "เริ่มต้น …" / "สิ้นสุด …" — computed from `startedProgram` + `getProgramEndDate()` and formatted with `formatThaiProgramDate()` (`src/util/program-date-util.js`); date lines are hidden gracefully when no start date is available. New `gh-popup__complete-text` / `gh-popup__dates` / `gh-popup__date-line` styles scoped under the `gh-popup--program-complete` variant.

### Changed
- **US-E7-24 — Fry Food categorized as Physical on the Game Hub.** The เจียวไข่/ทอดอาหาร game (`PHY001`) is now grouped as **`Physical`** instead of `Executive`: added a `Physical` entry to `CATEGORY_META` (Thai label + description) and switched `DAILY_REQUIRED_GAME_FALLBACK.mci_group` to `"Physical"` in `src/ui/game-hub-screen.js`, so the hub shows the correct category label.

### Docs
- Marked **US-E7-24, US-E7-27, US-E7-28 Done** (owner-confirmed 2026-07-06 — แสดงผลถูกต้อง). Synced `01-product-backlog.md`, `sprint-07.md`, `kanban.md`, and user-story files.
- **Docs sync after merge to `development`** (2026-07-07, commit `3256a20`): reconciled `sprint-07.md` + `kanban.md` with product backlog — marked US-E7-04/05/16/17/18/19/20/21/13 Done and BUG-005/006/007 Resolved per merged `features/game-hub` branch.

## [0.28.0] - 2026-07-06
**Version bump:** `0.27.0 → 0.28.0` (**MINOR**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — new backward-compatible input functionality (overlap-based drop + configurable hit areas) completing a distinct user story.

### Changed
- **US-E7-23 — easier answer placement in Context Clues.** The answer choice boxes and the in-sentence "วางคำ" blank slots now expose an independently tunable **collision / hit area** (`answerBox.hitArea` + `answerBox.hitOffset`, and the blank-slot drop area) separate from their visible size, so the tappable/droppable region can be made larger than the artwork without moving it. Falls back to the previous sizes when unconfigured.
  - Touched: `src/game/context-clues/entity/script/quiz.js`, `src/game/context-clues/constants.js`, `src/game/context-clues/utils/auto-insert-layout.js`.

### Added
- **`DragDropManager` overlap-drop fallback** (`src/core/drag-drop-manager.js`, `overlapDrop` option, default `on`). When a drag ends without the pointer released over a drop zone, the drop still succeeds if the dragged item's bounds **overlap** an accepting zone (edge touch counts); the zone with the largest overlap wins (`findOverlappingDropZone`). Drop resolution was refactored into a shared `performDrop()`. Lets elderly players place a word by proximity instead of pixel-perfect aim.

### Docs
- Marked **US-E7-23 Done** (owner-confirmed 2026-07-06 — "แก้ไขเรียบร้อยแล้ว"). Synced `01-product-backlog.md`, `sprint-07.md`, `kanban.md`.
- Added new backlog stories **US-E7-27** (offline / no-internet notification popup) and **US-E7-28** (program-complete popup shows program start & end dates).

## [0.27.0] - 2026-07-06
**Version bump:** `0.26.1 → 0.27.0` (**MINOR**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — backward-compatible UI enhancement completing a distinct user story (consistent with sibling Leaderboard story US-E7-01 → v0.25.0). The code landed across recent `features/game-hub` commits (`adjust leaderboard layout`, `constrain content to 720px via centered clamp wrappers`, `enhance leaderboard layout`) and is now formally versioned as the owner has confirmed it complete.

### Changed
- **US-E7-26 — additional Leaderboard layout pass.** Refined the spacing/alignment of the leaderboard rows, top bar, and "อันดับของคุณ" bottom-status bar, and constrained the page content to a **centered `max 720px`** wrapper so the list reads cleanly on wide and mobile viewports. Builds on the US-E7-01 `gh-leaderboard-*` Figma art; still scales via `--gh-scale` and preserves scroll / infinite-scroll and the current-player highlight.
  - Touched: `public/components.css` (`gh-leaderboard-*`), `src/ui/leaderboard-screen.js`, `src/ui/components/leaderboard-top-bar.js`, `leaderboard-bottom-status.js`, `leaderboard-row.js`.

### Docs
- Marked **US-E7-26 Done** (owner-confirmed 2026-07-06 — "แก้ไขเองเรียบร้อยแล้ว"). Synced `01-product-backlog.md`, `sprint-07.md`, and `kanban.md`.

## [0.26.1] - 2026-07-06
**Version bump:** `0.26.0 → 0.26.1` (**PATCH**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — backward-compatible refactor that fixes cross-popup style bleed; no new user-facing feature.

### Fixed
- **Popup styles were shared and bled across popups.** The rest ("วันนี้พักก่อน"), program-completion ("ยินดีด้วย"), and check-in "เก่งมาก !!!" popups all shared the `.gh-popup__character` / `.gh-popup__character-img` / `.gh-popup__character-shadow` / `.gh-popup__message` rules, so tuning one (e.g. shrinking the beanbag figure) changed the others too. Each popup now carries a `gh-popup--<variant>` class on its root and the shared rules read `--popup-*` CSS variables, so per-popup character/shadow/message **size & position** can be set in isolation.

### Changed
- **`renderFramePopupMarkup` / `renderFramePopupShortMarkup`** (`src/ui/components/frame-popup.js`) take a `variant` option that adds `gh-popup--<variant>` to the popup root. Wired unique variants: `rest-day` + `program-complete` (`day-completion-popup.js`), `resting-point` (`resting-point-popup.js`), `checkin-success` + `checkin-calendar` (`checkin-summary-screen.js`).
- **`public/components.css`** — `.gh-popup` / `.gh-popup-short` now declare tunable knobs (`--popup-gap`, `--popup-panel-height`, `--popup-char-margin-top`, `--popup-char-img-width`, `--popup-char-img-pad-bottom`, `--popup-shadow-width`, `--popup-shadow-bottom`, `--popup-message-font-size`, `--popup-message-line-height`); character/shadow/message rules consume them. Per-variant override blocks (`.gh-popup--rest-day`, `.gh-popup--program-complete`, `.gh-popup--checkin-success`) replace the earlier `.gh-popup-short .gh-popup__character-shadow` hack. Base defaults restored to the original look (char image `100%`, shadow `64%` / `4px`); `rest-day` keeps the beanbag tuning (image `70%`, shadow `70%` / `0`).

### Docs (Sprint 7 verification pass — owner-confirmed 2026-07-06)
- Marked **Done**: `US-E7-01` (Leaderboard art, v0.25.0 — displays correctly), `US-E7-07` (Thai mini-game names — confirmed), `US-E7-10` (tree growth + rainbow sparkle Juicy effects — displays well), `US-E7-22` (Welcome-screen partner logos, v0.24.0 — displays correctly), `US-E7-25` (rest popup character + independent positioning — confirmed). Synced `01-product-backlog.md`, `sprint-07.md`, and `kanban.md`.

## [0.26.0] - 2026-07-06
**Version bump:** `0.25.0 → 0.26.0` (**MINOR**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — new backward-compatible UI functionality (rest popup art refresh).

### Changed
- **US-E7-25 — "วันนี้พักก่อน" rest popup art.** `showDayCompletionPopup` (`src/ui/day-completion-popup.js`) now shows the **reclining beanbag** character art instead of the standing/sitting resting pose: `getRestingCharacter()` points at `OldMan_resting_02.png` / `OldWoman_resting_02.png` (still gender-based off the DB `gender`, `female` → คุณยาย, otherwise คุณตา). Title "วันนี้พักก่อน" + message "กลับมาเล่นใหม่วันพรุ่งนี้นะ" and the `.character-shadow` markup are unchanged.
- **Ground shadow re-seated for the new pose.** Added a scoped rule `.gh-popup-short .gh-popup__character-shadow` in `public/components.css` (`width: 80%`, `bottom: 12px`) so the shadow widens and sits under the beanbag base. Scoped to `.gh-popup-short` (only the rest popup uses `renderFramePopupShortMarkup`), so the program-completion (finish-line) popup keeps the original 64% / 4px shadow.
- Marked `US-E7-25` **Done** and moved it to Done in `kanban.md`, `sprint-07.md`, and `01-product-backlog.md`.

## [2026-07-06] - New tasks: Owner Task Block (US-E7-23..26, docs)
**Docs-only** (no `package.json` bump). Records four new owner requirements (ก้องไผ่, Medium); implementation not started.

### Added
- Created four user stories under `docs/agile/user-stories/`:
  - `US-E7-23` — ขยาย collision กล่องวางคำตอบเกม **Context Clues** ให้กดง่ายขึ้น (hitbox ใน `clickable.js`/`quiz.js`); sibling ของ `US-E7-08`.
  - `US-E7-24` — ย้ายชื่อเกม **"ทอดอาหาร" (Fry Food)** ขึ้นแทนที่หมวดหมู่ MCI ในหน้าหลัก; instance ของการสลับชื่อเกม ↔ หมวด Cognitive ใน `US-E7-14` (+ ใช้ `th_name` ตาม `US-E7-07`).
  - `US-E7-25` — ใส่ตัวละครคุณตา/คุณยาย **นั่งพัก** ใน Popup **"วันนี้พักก่อน"** (`day-completion-popup.js` มี `getRestingCharacter()` อยู่แล้ว → verify/refresh art); ต่อเนื่อง `US-E7-16` AC#2.
  - `US-E7-26` — จัด **layout หน้า Leaderboard เพิ่มเติม** (`gh-leaderboard-*` ใน `components.css`); ต่อยอดจาก `US-E7-01` (v0.25.0).
- Registered all four in `01-product-backlog.md` (E7 table), `sprint-07.md` (new dated **Owner Task Block — ก้องไผ่ (2026-07-06)** group + task table, planned count 17 → 21), and `kanban.md` (Backlog lane).

## [2026-06-29] - New requirement: Toast component (US-E7-18, docs)
**Docs-only** (no `package.json` bump). Records a new owner requirement.

### Added
- Created `US-E7-18` — move the inline feedback messages (errors + "กำลังทำงาน..." status) below the input fields on **Login, Admin Login, Sign-up, Player-Info** (and other feedback spots) into an **Android-style Toast**: a reusable class/module under `src/ui/components/` (e.g. `toast.js`), floating bottom-center, auto-dismiss, with `role`/`aria-live` and CSS in `public/components.css`. Saved the reference image under `docs/agile/user-stories/assets/us-e7-18-toast.jpg`.
- Registered `US-E7-18` in `01-product-backlog.md` (E7), `sprint-07.md` (Owner Task Block → new "Feedback / Toast" group), and `kanban.md` (Backlog).
- Created `US-E7-19` — the **Welcome screen** entry button still uses `md-filled-button` ("ลงชื่อเข้าใช้"), not the ported `Start-Game-Button` art; story tracks swapping it to `renderStartGameButton`. Registered in `01-product-backlog.md`, `sprint-07.md` (Art หน้าจอ DOM group), and `kanban.md`.

## [2026-06-26] - Sprint 7 boot loading visual refresh task (docs)
**Docs-only** (no `package.json` bump). Records the initial Sprint 7 UI polish task; implementation is tracked in `0.14.0` below.

### Added
- Created `US-E7-17` for refreshing the boot loading screen to use the game logo (`/Logo.png`, matching `src/ui/welcome-screen.js`) plus a 5-dot `.dotted-loader` progress indicator.
- Added `US-E7-17` to `01-product-backlog.md`, `sprint-07.md`, and linked it from `docs/index.md`.

## [0.20.0] - 2026-06-29
**Version bump:** `0.19.0 → 0.20.0` (**MINOR**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — new backward-compatible UI functionality (Figma popup art).

### Added
- **`renderFramePopupMarkup`** (`src/ui/components/frame-popup.js`) — a shared popup skeleton composing the existing `Frame_Form_Panel` (white panel + blue header bar) with a single green `Start-Game-Button` below it. Since `.gh-start-button` is `width/height: 100%`, the button is wrapped in a sizing div **`.gh-popup__button`** (fixed `280×100`, `--gh-scale` on `.gh-popup` scales its radius + label). CSS `.gh-popup` / `.gh-popup__button` / `.gh-popup__character` / `.gh-popup__message` in `public/components.css`.

### Changed
- **US-E7-04 — popup art.** Reskinned the info/celebration popups with the Figma frame + green button (single button, per owner): (1) **all three check-in steps** in `checkin-summary-screen.js` — the "เก่งมาก !!!" success page, the **progress-tree** page ("เป้าหมายของฉัน"; tree-grow + sparkle animation preserved by keeping `.tree-progress-frame`/`.tree-progress-plant`), and the **video** page (gradient backdrop; title above a plain `Frame_Panel` clip frame — no header — that stays **locked at 9:16** and fills the available height, shrinking to fit when the clip ends and the `Start-Game-Button` "ต่อไป" appears below it, via `.gh-video-popup.is-ended`); (2) the **resting** popup (`resting-point-popup.js`, title "คุณทำได้ดีมาก"; timer/cat/skip logic preserved, button label flips to "กลับสู่หน้าหลัก" via `.gh-start-button__label`); (3) **day-completion** "วันนี้พักก่อน" and **program-completion** "ยินดีด้วย" (`day-completion-popup.js`). Each character shows the standard `Character_Shadow`. The generic `popup-dialog.js` (`showPopup`) is intentionally **not** changed (different design).
- **Frame-popup backdrop** = the app background gradient instead of the dim blur, via `.app-popup:has(.gh-popup) .app-popup__backdrop`. Introduced a shared `--app-bg-gradient` token (`:root`) used by both `body` and this backdrop, so recoloring the body background recolors the popup backdrop too. Dialog popups keep the dim-blur backdrop.
- **US-E7-16 AC#6** — `showProgramCompletionPopup` now uses a gender finish-line character (คุณตา/คุณยาย) instead of the 🧓 emoji; `game-hub-screen.js` passes `gender: options.patientGender`.

## [0.19.0] - 2026-06-29
**Version bump:** `0.18.0 → 0.19.0` (**MINOR**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — new backward-compatible UI functionality.

### Changed
- **US-E7-19 — Welcome screen entry button.** `src/ui/welcome-screen.js` now renders the ported `Start-Game-Button` art (`renderStartGameButton`, green gradient pill) with the label **"เริ่มเล่นเกม"** instead of the `md-filled-button` "ลงชื่อเข้าใช้". Click still calls `onLogin()` (now wired via `.gh-start-button`). The button is sized to the Welcome column via a local `--gh-scale` (0.62, 0.5 ≤360px) on `.landing-screen__actions` in `public/style.css`.

## [0.18.0] - 2026-06-29
**Version bump:** `0.17.0 → 0.18.0` (**MINOR**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — new backward-compatible UI functionality (Figma form art on Sign-up + Player-Info).

### Added
- **Three more ported Figma components** in `src/ui/components/`: `FrameFormPanel` → `frame-form-panel.js` (`Frame_Form_Panel` 3161:746 — white panel + blue stroke/shadow + blue top header bar), `ButtonOk` → `button-ok.js` (`Button_OK` 3161:643 — green gradient pill) and `ButtonClose` → `button-close.js` (`Button_Close` 3161:649 — red gradient pill), plus `IconButtonBack` → `icon-button-back.js` (`Icon_ButtonBack` 3161:652 — exact Figma SVG back arrow). CSS (exact Figma colors/strokes) in `public/components.css` under `.gh-form` / `.gh-frame-form-panel` / `.gh-button-ok` / `.gh-button-close` / `.gh-icon-button-back`, with read-only (`.gh-frame-field-box__value`) and native-select (`.gh-frame-field-box__select`) variants of the field box.

### Changed
- **Player-Info (US-E7-03)** rebuilt with the Figma art: `Frame_Form_Panel` (blue header with `IconButtonBack` + "ข้อมูลผู้เล่น" title), the 10 read-only fields shown in `Frame_TextFieldBox` value boxes (one shared grid so labels/fields align), and the two actions as `Button_OK` "ส่งออกข้อมูล" (green) + `Button_Close` "ลงชื่อออก" (red). The test FAB menu and all handlers/ids are unchanged.
- **Sign-up (US-E7-02)** rebuilt the same way with one `Button_OK` "ยืนยันข้อมูลผู้เล่น". The Material `md-outlined-text-field` / `md-outlined-select` controls were replaced with native `<input>` / `<select>` inside `Frame_TextFieldBox` surfaces; validation/age/phone/draft/submit logic preserved, with errors now shown via the `.gh-frame-field-box--error` red stroke + the feedback line (button submits via `form.requestSubmit()`).
- **`components.css` already loads globally** (via `src/main.js`, from 0.17.0), so these screens are styled before the hub loads. The former `.player-info-*` / `.signup-*` / `.login-*` rules in `public/style.css` are now unused (left in place, harmless).

## [0.17.0] - 2026-06-26
**Version bump:** `0.16.0 → 0.17.0` (**MINOR**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — new backward-compatible UI functionality (Figma login art).

### Added
- **US-E7-02 — Figma login art (Login only; Sign-up deferred per owner).** Ported two Figma components into `src/ui/components/`: `FramePanel` → `frame-panel.js` (`Frame_Panel` 3161:657 — white surface, blue OUTSIDE stroke 12 + drop shadow) and `FrameTextFieldBox` → `frame-text-field-box.js` (`Frame_BoxTextInformation` 3161:646 — white box, light-blue stroke, wrapping a borderless native `<input>`). The existing `start-game-button.js` (`Start-Game-Button` 3108:68) is reused. CSS (exact Figma colors/strokes) added to `public/components.css` under `.gh-login` / `.gh-frame-panel` / `.gh-frame-field-box`.

### Changed
- **Player & admin Login screens rebuilt with the Figma components.** `src/ui/login-screen.js` (HN entry — panel + centered `กรอกหมายเลข HN` field + green `เริ่มเล่นเกม` button) and `src/ui/admin-login-screen.js` (panel + `อีเมลผู้ดูแล :` / `รหัสผ่าน :` label+field rows + button) now compose `renderFramePanel` / `renderFrameTextFieldBox` / `renderStartGameButton` instead of `md-outlined-text-field` / `md-filled-button`. Validation/submit behavior preserved (digit normalization, enable-on-input, async submit, error state) — errors now show via a `.gh-frame-field-box--error` red stroke + feedback text; the button submits via `form.requestSubmit()` (Enter key also submits). The Start-Game-Button is authored at Figma 1080 scale, so a login-scoped `--gh-scale` (0.6, 0.5 ≤360px) sizes it to the column.
- **`components.css` now loads globally** via `import "../public/components.css"` in `src/main.js` (previously imported only by `game-hub-screen.js`, so the login screens — rendered before the hub — were unstyled).
- **Field overflow fix:** the native `<input>` carries an intrinsic (`size`-attribute) min-content width that, as a grid item with the default `min-width: auto`, made the admin email/password fields overflow the panel. Added `min-width: 0` to `.gh-frame-field-box` and `.gh-frame-field-box__input` so the field always shrinks to its column.

## [0.16.0] - 2026-06-26
**Version bump:** `0.15.0 → 0.16.0` (**MINOR**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — new backward-compatible UI functionality (shared shadow component).

### Added
- **Standardized `Character_Shadow`.** Added a reusable `.character-shadow` CSS class in `public/style.css` reproducing Figma component `3165:775` as a flat gray ground ellipse (`background: rgba(121, 121, 121, 0.34)`, `aspect-ratio: 163.07 / 52.29`, `border-radius: 50%`, no blur/stroke — per the Figma export reference at `test figma export/src/components/CharacterShadow.vue`). Consumers set width + position only. Per the project's Figma-CSS-first rule, it is pure CSS (no image asset).

### Changed
- **Applied the standard shadow under every คุณตา/คุณยาย figure.** (1) The same-day re-entry rest popup (`day-completion-popup.js`) now uses `.character-shadow` instead of its ad-hoc blurred shadow. (2) Added the shadow under the check-in "เก่งมาก !!!" success character (`checkin-summary-screen.js`): the cheer image is wrapped in `.checkin-success-character` with the image given a controlled width (`clamp(150px, 40vw, 200px)`) and the shadow placed at its base. (3) Added the shadow under the Game Hub level-path character nodes (`level-path.js` `renderEmojiNode` → `.gh-emoji-node__shadow`), where the gender character stands on the rest/check-in coins; it paints behind the character image and is scaled via `--gh-scale`. The rest (sitting) and check-in (standing) nodes carry per-type modifier classes (`.gh-emoji-node-rest__image/__shadow`, `.gh-emoji-node-checkin__image/__shadow`) so each character + shadow can be positioned/sized independently. Only the header profile **avatar** (`Profile_OldMan/OldWoman.png`) is excluded — it is a cropped face in a circular frame, not a figure on a floor.

## [0.15.0] - 2026-06-26
**Version bump:** `0.14.2 → 0.15.0` (**MINOR**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — new backward-compatible UI functionality.

### Changed
- **US-E7-16 AC#2 — same-day re-entry rest popup.** Redesigned `showDayCompletionPopup` (`src/ui/day-completion-popup.js`), shown when the player has already completed today's goal and re-enters the Game Hub on the same day. Replaced the generic "เก่งมากวันนี้" + 🧓 emoji popup with the compact **"วันนี้พักก่อน"** design: a gender-based resting character (`OldMan_resting.png` / `OldWoman_resting.png` → คุณตา / คุณยาย, picked from `options.patientGender`), message "กลับมาเล่นใหม่วันพรุ่งนี้นะ", and a green confirm button "กลับหน้าหลัก". Added a soft elliptical ground shadow under the character (US-E7-14 #4). The button uses the default `md-filled-button` green (`--md-sys-color-primary` `#356859`, US-E7-15 "เขียว = ยืนยัน"); frame uses the shared `app-popup` dialog system (will inherit dedicated US-E7-04 art when that lands). New CSS block `.app-popup__dialog--rest-day` + `.rest-day-popup-*` in `public/style.css`. `showProgramCompletionPopup` is unchanged.

### Added
- **Test hook:** added a "ทดสอบ Popup พักวันนี้" item to the Player-Info settings FAB menu (`src/ui/player-info-screen.js`) so the "วันนี้พักก่อน" popup can be previewed on demand (uses the current player's gender, `dismissible: true`). Sits alongside the existing Resting / Check-in test items.

## [0.14.2] - 2026-06-26
**Version bump:** `0.14.1 → 0.14.2` (**PATCH**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — backward-compatible cross-browser layout bug fix, no new functionality.

### Fixed
- **BUG-007:** the Game Hub header (`.gh-header-bar`) was not centered in some browsers (notably Firefox) and DevTools warned *"justify-items has no effect on this element since it's not a grid container"*. `.gh-header-float` relied on `justify-items: center` to centre its child, but the element was plain block flow so the property was ignored; its own `justify-self: center` was likewise dead against the block parent `.hub-clean-shell`. Fix (CSS-only in `public/components.css`): made `.gh-header-float` a grid container (`display: grid`, keeping `justify-items: center`) and centred the float itself with `margin-inline: auto` (dropping the ineffective `justify-self`). Header now centres consistently across engines and the warning is gone.

## [0.14.1] - 2026-06-26
**Version bump:** `0.14.0 → 0.14.1` (**PATCH**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — backward-compatible layout bug fix, no new functionality.

### Fixed
- **BUG-006:** on the Player-Info page the gradient background got cut/scrolled and the test FAB drifted up with the content. Three CSS-only fixes in `public/style.css`: (1) **removed `min-height: 100vh` from the shared card-screen rule** (`.login-screen, .signup-screen, .player-info-screen`) — the section stacked inside `#app` (also `min-height: 100vh` + `padding: 24px`) and with global `box-sizing: border-box` overflowed by the 48px padding, pushing the screen down; the viewport height now lives only on the `#app` shell (which keeps `min-height: 100vh` + `place-items: center`). (2) **moved the page gradient onto a fixed pseudo-element** `body::before` (`position: fixed; inset: 0; z-index: -1`) so it stays pinned to the viewport and no longer scrolls with content (avoids `background-attachment: fixed` on `body`, unreliable on iOS Safari); hidden inside minigames via `body.game-mode::before`. (3) changed the test FAB `.hub-clean-test-menu` from `position: absolute` to `position: fixed` so it floats. Full-bleed screens that legitimately own their height (`.landing-screen`, `.checkin-summary-screen`) were left unchanged.

## [0.14.0] - 2026-06-26
**Version bump:** `0.13.1 → 0.14.0` (**MINOR**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — new backward-compatible boot loading presentation behavior.

### Changed
- **US-E7-17:** boot loading overlay now uses the game logo (`/Logo.png`, matching `src/ui/welcome-screen.js`) and a 5-dot `.dotted-loader` progress indicator instead of the spinner + "กำลังโหลด..." text.
- Kept the existing `finishBootLoading()` / first usable paint dismissal path unchanged, so the visual refresh does not reintroduce the long-loading issue from [PB-01-02](agile/problems/PB-01-02.md).

## [0.13.1] - 2026-06-26
**Version bump:** `0.13.0 → 0.13.1` (**PATCH**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — backward-compatible bug fix to the boot overlay, no new functionality.

### Fixed
- **Boot loading overlay stayed up ~10-20s.** It was dismissed only when the boot's first-render promise resolved, which for the Game Hub is the **whole** `renderGameHubScreen()` promise — i.e. after `loadProgram()` + `loadHistory()` finished (and the safety timeout often became what hid it). Now `renderGameHubScreen` fires an `onReady` callback right after its **initial paint**, and `showHub` passes `onReady: finishBootLoading`, so the overlay clears as soon as the hub is visible (~1-2s) while data continues loading in the background. Safety-net timeout tightened `12s → 8s`. Root cause: [PB-01-02](agile/problems/PB-01-02.md).

## [0.13.0] - 2026-06-26
**Version bump:** `0.12.1 → 0.13.0` (**MINOR**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — new backward-compatible functionality (a boot loading screen).

### Added
- **Boot loading overlay** (modal). Markup with critical inline styles lives in `index.html` so it paints immediately (before `style.css`/fonts), covering the screen with a spinner + "กำลังโหลด...". It blocks interaction until the first route has fully rendered, so the user can't tap a game/leaderboard before data is ready (complements the BUG-005 / [PB-01-01](agile/problems/PB-01-01.md) route-version guard). Dismissed once via `finishBootLoading()` in `src/main.js` with a fade-out; a 12s safety timeout guarantees it can never trap the user behind it if a load hangs.
- To support "dismiss only when ready", `navigateTo()` now returns the `renderCurrentRoute()` promise on its direct-render paths, and the in-dispatcher redirects `return navigateTo(...)` so the boot promise chains through redirects to the real final screen.

## [0.12.1] - 2026-06-26
**Version bump:** `0.12.0 → 0.12.1` (**PATCH**, per [semantic-versioning skill](../.agents/skills/semantic-versioning/SKILL.md) §2/§3) — backward-compatible bug fix, no new functionality.

### Fixed
- **BUG-005** — slow data loads no longer bounce the user back to the Game Hub. When the user opened a minigame or the Leaderboard before the Hub finished loading, a stale in-flight `showHub()` (and `renderGameHubScreen`'s post-load re-renders) painted the Hub over the newer screen. Fixed with a **route-version guard**: `showHub` snapshots `routeRenderVersion` and aborts if it changes after its `await`s, and passes an `isStale` callback into `renderGameHubScreen` so its `render()` skips painting once the route has moved on. Root-cause write-up: [PB-01-01](agile/problems/PB-01-01.md).

### Docs
- New **Problem Records** log (`docs/agile/problems/`, numbered `PB-XX-XX`) capturing root causes + the rule to avoid repeating them; first record `PB-01-01`. Linked from `docs/index.md`; `BUG-005` marked Resolved.

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
