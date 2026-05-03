# Agile Sprint Plan - MCI Cognitive Games

---

## 📅 Sprint Schedule Overview (2-Week Cycles)

| Sprint | Timeline | Focus Area | Key Deliverables |
|:---|:---|:---|:---|
| **Sprint 1** | Week 1-2 | Foundation & Zoo Games | Logic พื้นฐานของ Zoo Detective & Zoo Feeder (Completed) |
| **Sprint 2** | Week 3-4 | UI & Data Setup | Zoo Games สมบูรณ์, Context Clues UI, Setup Database (Completed) |
| **Sprint 3** | Week 5-6 | Logic Games & Integration | Symmetry Decor, ระบบ Auth, ระบบบันทึกคะแนน (Completed) |
| **Sprint 4** | Week 7-8 | **(Current)** Final Polish & Variety | Postcard Reader, Voice Over, UX Final Polish |

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
    Logic Games & Integration :done, s3, 2026-05-04, 14d
    section Sprint 4
    Final Polish & Optimization :active, s4, 2026-05-18, 14d
```

---

## 🚀 Sprint Breakdown

### Sprint 2: UI Interactive & Data Foundation (Completed)
**Goal:** ทำให้เกม Zoo ชุดแรกสมบูรณ์ 100% และเตรียมระบบฐานข้อมูลให้พร้อมใช้งาน
- [x] [[US-E1-02]] Zoo Detective UI & Feedback (Finish)
- [x] [[US-E1-04]] Zoo Feeder Interaction Logic (Finish)
- [x] [[US-E1-06]] UI สำหรับ Context Clues (Thai Support)
- [x] [[US-E2-01]] Setup Supabase Tables (Completed)
- [x] [[US-E3-01]] ปรับขนาด Font/ปุ่ม (Accessibility Basics)

### Sprint 3: Logic Games & Data Integration (Completed)
**Goal:** เพิ่มเกมฝึกตรรกะ (Symmetry Decor), เชื่อมต่อระบบ Authentication และแก้ไขปัญหาความเสถียรของข้อมูล
**Timeline:** 2026-05-04 → 2026-05-17

#### 📅 Internal Timeline
```mermaid
gantt
    title Sprint 03 Tasks
    dateFormat  YYYY-MM-DD
    section Core Logic
    Symmetry Decor Polish :done, logic1, 2026-05-04, 5d
    Auth UI Integration   :done, logic2, 2026-05-06, 4d
    section Data & Stability
    Database Schema Fix   :done, data1, 2026-05-04, 2d
    Supabase Retry Logic  :done, data2, 2026-05-05, 3d
    section UI/UX
    Scroll Offset Fix     :done, ui1, 2026-05-08, 3d
    section Testing
    System Test Sprint 3  :done, test1, 2026-05-15, 3d
```

#### 📋 Committed Stories & Tasks
| ID | Story / Task | Owner | Estimate | Done? |
|----|--------------|-------|----------|-------|
| [[US-E1-07]] | ระบบ Grid และการวาดภาพสะท้อน (Symmetry Decor) | UI Dev | 40h | ✅ Done |
| [[US-E2-02]] | ระบบ Authentication สำหรับแพทย์และผู้ป่วย | Core Dev | 24h | ✅ Done |
| [[US-E2-03]] | API สำหรับส่งคะแนนและเวลาที่ใช้ (Integration) | Core Dev | 16h | ✅ Done |
| **BUG-001** | Supabase Transient Connection Fix | Core Dev | 8h | ✅ Done |
| **BUG-002** | Zoo Detective Drag-and-Drop Scroll Offset | UI Dev | 8h | ✅ Done |
| **BUG-003** | Database Logging Foreign Key Fix | Data Eng | 4h | ✅ Done |

#### 🛠 Sprint 3 Specifics
- **Definition of Done:** ผ่านการทดสอบ Game Loop, ข้อมูลบันทึกถูกต้อง 100%, UI รองรับ Tablet, Code Review เสร็จสิ้น
- **Risks & Blockers:** Supabase Rate Limiting (Mitigation: Batch Logging), Database Schema Sync Issues.

### Sprint 4: Final Polish & Alternative Games (**Current**)
**Goal:** ส่งมอบเกมทางเลือกอื่นๆ เพิ่มเติม และปรับปรุงความง่ายในการใช้งาน (UX) สำหรับผู้สูงอายุ
**Timeline:** 2026-05-18 → 2026-05-31

#### 📋 Committed Stories & Tasks
| ID | Story / Task | Owner | Estimate | Status |
|----|--------------|-------|----------|--------|
| [[US-E1-08]] | Postcard Reader (Final Polish & Animation) | UI Dev | 40h | ✅ Done |
| [[US-E3-02]] | ระบบ Voice Over คำแนะนำการเล่น (Web Speech) | Core Dev | 24h | ✅ Done |
| **QA-001** | Final End-to-End System Testing | QA Team | 16h | ✅ Done |
| **POL-001** | UI Consistency & Animation Polish | UI Dev | 16h | ✅ Done |

#### 🛠 Sprint 4 Specifics
- **Alternative Gameplay:** เพิ่มความหลากหลายของเนื้อหาใน Postcard Reader และปรับปรุงระบบการสุ่มโจทย์
- **Accessibility:** ระบบเสียงอ่านอัตโนมัติสำหรับผู้สูงอายุที่มีปัญหาด้านการสายตา
- **Final QA:** ตรวจสอบความถูกต้องของข้อมูลสถิติและการบันทึก Log ทั้งโปรเจกต์

---

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
