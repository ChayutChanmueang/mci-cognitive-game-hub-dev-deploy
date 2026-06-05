# Sprint 05: User Management & Progression Overhaul

**Goal:** พัฒนาระบบลงทะเบียนผู้ใช้แบบละเอียด และระบบความคืบหน้า (Progression) 14 วัน ตามที่ระบุใน GDD V.1
**Timeline:** 2026-05-06 → 2026-05-19

## 📅 Internal Timeline
```mermaid
gantt
    title Sprint 05 Tasks
    dateFormat  YYYY-MM-DD
    section Epic 1: User Management
    Registration Form (US-E1-02)    :a1, 2026-05-06, 3d
    Auto Program Calculation (US-E1-03) :a2, 2026-05-09, 2d
    section Epic 2: Progression System
    Level Map UI (US-E2-02)        :b1, 2026-05-08, 4d
    Daily Goal & Streak Logic (US-E2-03, 04) :b2, 2026-05-12, 3d
    Rest & Finish Levels (US-E2-05, 06)   :b3, 2026-05-15, 4d
```

## 📋 Committed Stories & Tasks
| ID | Story / Task | Priority | Status |
|----|--------------|----------|--------|
| [US-E1-02](../user-stories/archives/US-E1-02.md) | ระบบลงทะเบียนผู้ใช้ใหม่ (ชื่อ, วันเกิด, เพศ, การศึกษา) | High | ✅ Done |
| [US-E1-03](../user-stories/archives/US-E1-03.md) | ระบบคำนวณวันที่สิ้นสุดโปรแกรมอัตโนมัติ (14 วัน) | Med | ✅ Done |
| [US-E2-02](../user-stories/archives/US-E2-02.md) | ระบบแผนที่ด่าน (Level Progression Map) | High | ✅ Done |
| [US-E2-03](../user-stories/archives/US-E2-03.md) | ระบบ Daily Goal Progress Bar | High | ✅ Done |
| [US-E2-04](../user-stories/archives/US-E2-04.md) | ระบบ Daily Streak Tracking | Med | ✅ Done |
| [US-E2-05](../user-stories/archives/US-E2-05.md) | มินิเกมด่านจุดพัก (Rest Level) | Low | ✅ Done |
| [US-E2-06](../user-stories/archives/US-E2-06.md) | ด่านเส้นชัยและระบบเช็คชื่อ (Finish Level) | High | ✅ Done |

## 📊 Sprint Summary & Velocity
- **งานที่วางแผนไว้ (Planned):** 7 Stories
- **งานที่ทำเสร็จ (Completed):** 7 Stories (100% Completion)
- **อัตราการทำงาน (Velocity):** 7 User Stories สำเร็จลุล่วง
- **การทดสอบระบบ:** ผ่านเกณฑ์ความเสถียรและเชื่อมโยงข้อมูลกับ Supabase Database 100%

## 🛠 Sprint Specifics
- **Definition of Done:**
  - ผ่าน Acceptance Criteria ของทุก User Story
  - ข้อมูลถูกบันทึกและดึงมาจาก Supabase ได้ถูกต้อง
  - UI/UX เป็นไปตามแนวทางที่กำหนดใน GDD
- **Risks & Blockers:**
  - *แก้ไขแล้ว*: ความซับซ้อนของการวาดเส้นทางในแผนที่ด่าน (Progression Map) - แก้ไขโดยปรับโครงสร้าง UI ของด่านให้อยู่ในหน้าเดียวและเลื่อนอัตโนมัติ (Auto-scroll) ไปหาวันปัจจุบันเพื่อความชัดเจน
  - *แก้ไขแล้ว*: การจัดการสถานะ Locked/Unlocked ของด่านตามวันจริง - ใช้ `started_program` ในการเปรียบเทียบระยะเวลาจริงกับประวัติการเข้าเล่นเพื่อความถูกต้อง แม่นยำ