# Agile Sprint Plan - MCI Cognitive Games

---

## 📅 Sprint Schedule Overview (2-Week Cycles)

| Sprint | Timeline | Focus Area | Key Deliverables |
|:---|:---|:---|:---|
| **Sprint 1** | Week 1-2 | Foundation & Zoo Games | Logic พื้นฐานของ Zoo Detective & Zoo Feeder (Completed) |
| **Sprint 2** | Week 3-4 | UI & Data Setup | Zoo Games สมบูรณ์, Context Clues UI, Setup Database (Finalizing) |
| **Sprint 3** | Week 5-6 | **(Next)** Logic Games & Integration | Symmetry Decor, ระบบ Auth, ระบบบันทึกคะแนน (Score API) |
| **Sprint 4** | Week 7-8 | AR & Accessibility Polish | Postcard Reader (AR), Voice Over, UX Final Polish |

## 📊 Project Timeline (Gantt Chart)
```mermaid
gantt
    title MCI Cognitive Games Roadmap
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d
    section Sprint 1
    Foundation & Zoo Games :done, s1, 2026-04-06, 14d
    section Sprint 2
    UI & Data Setup        :done, s2, 2026-04-20, 14d
    section Sprint 3
    Logic Games & Integration :active, s3, 2026-05-04, 14d
    section Sprint 4
    AR & Final Polish      :s4, after s3, 14d
```

---

## 🚀 Sprint Breakdown

### Sprint 2: UI Interactive & Data Foundation (Completed)
**Goal:** ทำให้เกม Zoo ชุดแรกสมบูรณ์ 100% และเตรียมระบบฐานข้อมูลให้พร้อมใช้งาน
- [x] [[US-E1-02]] Zoo Detective UI & Feedback (Finish)
- [x] [[US-E1-04]] Zoo Feeder Interaction Logic (Finish)
- [x] [[US-E1-06]] UI สำหรับ Context Clues (Thai Support)
- [ ] [[US-E2-01]] Setup Supabase Tables (Data Structure) - *In Progress: ติดปัญหา Sync ข้อมูล*
- [x] [[US-E3-01]] ปรับขนาด Font/ปุ่ม (Accessibility Basics)

### Sprint 3: Logic Games & Data Integration (**Current**)
**Goal:** เพิ่มเกมฝึกตรรกะ (Symmetry Decor), เชื่อมต่อระบบ Authentication และแก้ไขปัญหาความเสถียรของข้อมูล
**Timeline:** 2026-05-04 → 2026-05-17

#### 📅 Internal Timeline
```mermaid
gantt
    title Sprint 03 Tasks
    dateFormat  YYYY-MM-DD
    section Core Logic
    Symmetry Decor Polish :logic1, 2026-05-04, 5d
    Auth UI Integration   :logic2, 2026-05-06, 4d
    section Data & Stability
    Database Schema Fix   :data1, 2026-05-04, 2d
    Supabase Retry Logic  :data2, 2026-05-05, 3d
    section UI/UX
    Scroll Offset Fix     :ui1, 2026-05-08, 3d
    section Testing
    System Test Sprint 3  :test1, 2026-05-15, 3d
```

#### 📋 Committed Stories & Tasks
| ID | Story / Task | Owner | Estimate | Done? |
|----|--------------|-------|----------|-------|
| [[US-E1-07]] | ระบบ Grid และการวาดภาพสะท้อน (Symmetry Decor) | UI Dev | 40h | ✅ Done |
| [[US-E2-02]] | ระบบ Authentication สำหรับแพทย์และผู้ป่วย | Core Dev | 24h | [ ] |
| [[US-E2-03]] | API สำหรับส่งคะแนนและเวลาที่ใช้ (Integration) | Core Dev | 16h | [ ] |
| **BUG-001** | Supabase Transient Connection Fix | Core Dev | 8h | ✅ Done |
| **BUG-002** | Zoo Detective Drag-and-Drop Scroll Offset | UI Dev | 8h | ✅ Done |
| **BUG-003** | Database Logging Foreign Key Fix | Data Eng | 4h | ✅ Done |

#### 🛠 Sprint 3 Specifics
- **Definition of Done:** ผ่านการทดสอบ Game Loop, ข้อมูลบันทึกถูกต้อง 100%, UI รองรับ Tablet, Code Review เสร็จสิ้น
- **Risks & Blockers:** Supabase Rate Limiting (Mitigation: Batch Logging), Database Schema Sync Issues.

### Sprint 4: AR Experience & Final Polish (Next)
**Goal:** ส่งมอบเกม AR และปรับปรุงความง่ายในการใช้งาน (UX) สำหรับผู้สูงอายุ
- [ ] [[US-E1-08]] Postcard Reader (AR System)
- [ ] [[US-E3-02]] ระบบ Voice Over คำแนะนำการเล่น
- [ ] Final QA & Bug Fixing across all Epics

---

## 📈 Epic Completeness Strategy (Alignment)

เพื่อให้โครงการเดินหน้าอย่างสมดุล เราจะพัฒนาทั้ง 3 Epics ขนานกันไปในแต่ละ Sprint:

### 🎮 E1: Core Cognitive Games (The Heart)
- **Sprint 1-2:** เน้นเกมกลุ่ม "Attention & Memory" (Zoo Games) เพื่อสร้าง Quick Win
- **Sprint 3:** เน้นเกมกลุ่ม "Executive Function & Language" (Symmetry, Context)
- **Sprint 4:** เพิ่มความล้ำสมัยด้วย "Visuospatial" (Postcard AR)
- **Target:** สมบูรณ์ 100% เมื่อจบ Sprint 4

### 📊 E2: Patient Data & Tracking (The Brain)
- **Sprint 2:** วางโครงสร้างพื้นฐาน (Database Setup)
- **Sprint 3:** เชื่อมต่อระบบ (Integration) เพื่อให้แพทย์เริ่มเห็นข้อมูลการเล่น
- **Target:** ระบบพร้อมใช้งานจริง (Stable) เมื่อจบ Sprint 3

### ♿ E3: Accessibility & UX (The Soul)
- **Sprint 2:** เริ่มต้นด้วยมาตรฐานพื้นฐาน (Font/Button Size)
- **Sprint 4:** เพิ่มส่วนเสริมเพื่อการเข้าถึง (Voice Over) และขัดเกลา UI ทั้งหมด
- **Target:** ได้มาตรฐานการออกแบบเพื่อผู้สูงอายุเมื่อจบโครงการ
