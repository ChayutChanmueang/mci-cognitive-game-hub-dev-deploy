# Agile Sprint Plan - MCI Cognitive Games

---

**Last Updated:** 2026-07-13

## 📅 Sprint Schedule Overview (2-Week Cycles)

| Sprint                                    | Timeline      | Focus Area                           | Status    |
| :---------------------------------------- | :------------ | :----------------------------------- | :-------- |
| [sprint-01](sprint-backlogs/sprint-01.md) | Mar 01-14     | Foundation & Zoo Games               | Completed |
| [sprint-02](sprint-backlogs/sprint-02.md) | Mar 15-28     | UI & Data Setup                      | Completed |
| [sprint-03](sprint-backlogs/sprint-03.md) | Mar 29-Apr 11 | Logic Games & Integration            | Completed |
| [sprint-04](sprint-backlogs/sprint-04.md) | Apr 12-30     | Final Polish & Variety               | Completed |
| [sprint-05](sprint-backlogs/sprint-05.md) | May 06-19     | User Management & Progression Overhaul | Completed |
| [sprint-06](sprint-backlogs/sprint-06.md) | May 20-31     | Integration, Analytics & Admin | Completed |
| Post-Sprint Hardening | Jun 01-16 | Deployment stabilization, branch cleanup, documentation sync | Completed |
| [sprint-07](sprint-backlogs/sprint-07.md) | Jun 23-Jul 07 | Game Art Assets, Version Display & Mini-game Vertical Responsiveness → **v1.0.0 release** | Completed |
| [sprint-08](sprint-backlogs/sprint-08.md) | Jul 08-21 | Per-player progression tree (`tree_type`) + post-1.0 line → target **v1.1.0** | **Active** (wrap-up) |
| [sprint-09](sprint-backlogs/sprint-09.md) | Jul 10-23 | Field Feedback Hotfix — ลงพื้นที่ (แก้ด่วน UX มินิเกม) → target **v1.1.1** | **Active** |

## 📊 Project Timeline (Gantt Chart)
```mermaid
gantt
    title MCI Cognitive Games Roadmap
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d
    section Sprint 1
    Foundation & Zoo Games :done, s1, 2026-03-01, 14d
    section Sprint 2
    UI & Data Setup        :done, s2, 2026-03-15, 14d
    section Sprint 3
    Logic Games & Integration :done, s3, 2026-03-29, 14d
    section Sprint 4
    Final Polish & Optimization :done, s4, 2026-04-12, 20d
    section Sprint 5
    User Management & Progression :done, s5, 2026-05-06, 14d
    section Sprint 6
    Integration, Analytics & Admin :done, s6, 2026-05-20, 12d
    section Hardening
    Deploy stabilization & docs sync :done, harden, 2026-06-01, 16d
    section Sprint 7
    Art assets, version display & vertical responsive :done, s7, 2026-06-23, 14d
    v1.0.0 stable release :milestone, rel10, 2026-07-07, 1d
    section Sprint 8
    Per-player tree_type (US-E8-01) :active, s8, 2026-07-08, 14d
    v1.1.0 target :milestone, rel11, 2026-07-21, 1d
    section Sprint 9
    Field feedback hotfix (US-E9-01..04) :active, s9, 2026-07-10, 14d
    v1.1.1 target :milestone, rel111, 2026-07-23, 1d
```

---

## 🚀 Sprint Details

ดูรายละเอียดงานในแต่ละ Sprint ได้ที่ลิงก์ด้านล่าง:

- **[sprint-01](sprint-backlogs/sprint-01.md)**: Foundation & Zoo Games
- **[sprint-02](sprint-backlogs/sprint-02.md)**: UI Interactive & Data Foundation
- **[sprint-03](sprint-backlogs/sprint-03.md)**: Logic Games & Data Integration
- **[sprint-04](sprint-backlogs/sprint-04.md)**: Final Polish & Alternative Games
- **[sprint-05](sprint-backlogs/sprint-05.md)**: User Management & Progression Overhaul
- **[sprint-06](sprint-backlogs/sprint-06.md)**: Integration, Analytics & Admin Dashboard
- **Post-Sprint Hardening**: Stabilize deployment branches, verify Docker/nginx production build, fix stale leaderboard branch drift, and refresh documentation
- **[sprint-07](sprint-backlogs/sprint-07.md)**: Game Art Assets, Version Display & Mini-game Vertical Responsiveness — **Completed → [v1.0.0](../changelog.md) stable release (2026-07-07)**
- **[sprint-08](sprint-backlogs/sprint-08.md)**: Per-player progression tree (`tree_type` a/b/c/d) — **Active (wrap-up)** (post-1.0, target `1.1.0`)
- **[sprint-09](sprint-backlogs/sprint-09.md)**: Field Feedback Hotfix — ลงพื้นที่ (แก้ด่วน UX มินิเกม) — **Active** (post-1.0, target `1.1.1`) — จาก [Meeting 2026-07-10](meeting-backlogs/2026-07-10.md)

## 📈 Epic Completeness Strategy (Alignment)

เพื่อให้โครงการเดินหน้าอย่างสมดุล เราจะพัฒนาทั้ง 3 Epics ขนานกันไปในแต่ละ Sprint:

### 🎮 E1: Core Cognitive Games (The Heart)
- **Sprint 1-2:** เน้นเกมกลุ่ม "Attention & Memory" (Zoo Games) เพื่อสร้าง Quick Win
- **Sprint 3:** เน้นเกมกลุ่ม "Executive Function & Language" (Symmetry, Context)
- **Sprint 4:** เพิ่มความหลากหลายใน "Memory & Reading" (Postcard Reader) และขัดเกลาทุกระบบ
- **Target:** สมบูรณ์ 100% เมื่อจบ Sprint 4

### 📊 E2: Patient Data & Tracking (The Brain)
- **Sprint 2:** วางโครงสร้างพื้นฐาน (Database Setup)
- **Sprint 3:** เชื่อมต่อระบบ (Integration) เพื่อให้แพทย์เริ่มเห็นข้อมูลการเล่น
- **Target:** ระบบพร้อมใช้งานจริง (Stable) เมื่อจบ Sprint 3

### ♿ E3: Accessibility & UX (The Soul)
- **Sprint 2:** เริ่มต้นด้วยมาตรฐานพื้นฐาน (Font/Button Size)
- **Sprint 4:** เพิ่มส่วนเสริมเพื่อการเข้าถึง (Voice Over) และขัดเกลา UI ทั้งหมด
- **Target:** ได้มาตรฐานการออกแบบเพื่อผู้สูงอายุเมื่อจบโครงการ

### 🛠 E6: Stabilization & Deployment
- **June hardening:** Reset/align staging with dev-approved code, restore environment/Docker deployment files, and validate production build on the test VM
- **Documentation:** Update GDD, software design, schema, UI components, backlog and roadmap to match the current app
- **Target:** Test VM and local builds use the same implementation baseline and no stale UI code remains in production bundles

### 🎨 E7: Game Art Assets & UI/UX Polish
- **Sprint 7:** เพิ่ม game art assets ให้หน้าจอ DOM หลัก (Leaderboard, Login, Sign-up, Player-Info, Popup), แสดงเลขเวอร์ชันบนตัวเกมหลัก (ซ่อนในมินิเกม) และทำให้มินิเกมยืดแนวตั้งได้ (Vertical Responsive)
- **Target:** ชั้นการนำเสนอ (presentation layer) มีเอกลักษณ์ภาพครบทุกหน้าจอหลัก — **shipped in v1.0.0** (2026-07-07). Post-1.0 follow-ups: US-E7-06 (vertical responsive), US-E7-08/11/12.

### 🌳 E8: Check-in Personalization (Post-1.0)
- **Sprint 8:** ต้นคิดดีหลายชนิดต่อผู้เล่น — `game_tree_list` + `user_game_profile_data.tree_type`; สุ่มตอน signup; **lazy backfill** ผู้เล่น v1.0.0 ที่ `tree_type` เป็น NULL → [US-E8-01](user-stories/US-E8-01.md)
- **Target:** ship **v1.1.0** (MINOR) เมื่อ US-E8-01 ผ่าน DoD

### 🔧 E9: Field Feedback Hotfixes (Post-1.0 — ลงพื้นที่)
- **Sprint 9:** แก้ด่วนจากการลงพื้นที่จริงกับผู้สูงอายุ — Symmetry Decor, Fry Food skip, Zoo Detective drag, Postcard font → [US-E9-01](user-stories/US-E9-01.md)..[US-E9-04](user-stories/US-E9-04.md)
- **Phase 2:** ส่งออกข้อมูลผู้เล่นครบถ้วน → [US-E9-05](user-stories/US-E9-05.md)
- **Source:** [Meeting 2026-07-10](meeting-backlogs/2026-07-10.md)
- **Target:** ship **v1.1.1** (PATCH) สำหรับ P0 gameplay fixes

**Shipped so far (Sprint 9):**

| Story | Version | Verified |
| :--- | :--- | :--- |
| [US-E9-08](user-stories/US-E9-08.md) Game Hub — ชื่อเกมบน / หมวดหมู่ล่าง | `1.1.1` | ✅ owner 2026-07-10 |
| [US-E9-06](user-stories/US-E9-06.md) Screen Wake Lock | `1.1.2` | ✅ owner 2026-07-10 |
| [US-E9-11](user-stories/US-E9-11.md) Sign-up วันเกิด/วันที่เริ่มโปรแกรม เป็น พ.ศ. | `1.1.3` | ✅ owner 2026-07-13 |

- [US-E9-07](user-stories/US-E9-07.md) (Optimize สเปคต่ำ) อยู่ระหว่างทำ — target ขยับเป็น **`1.1.4`** เพราะ `1.1.3` ถูก US-E9-11 ship ไปก่อน

---

Back to Index: [Index](../index.md)
