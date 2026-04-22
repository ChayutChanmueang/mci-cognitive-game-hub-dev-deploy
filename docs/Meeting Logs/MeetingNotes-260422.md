# Meeting Note - MCI Cognitive Games (Example)

---

**Project:** MCI Cognitive Games
**Meeting Date:** 2026-04-21
**Week:** 3
**Attendees:** สมชาย, สมศักดิ์, สมปอง, สมศรี
**Note Taker:** สมชาย
**Version:** 1.0
**Last Updated:** 2026-04-21

---

## 1. Meeting Info

| Item | Detail |
|------|--------|
| **Meeting Type** | Weekly Sprint |
| **Time** | 14:00 - 15:30 |
| **Location** | ห้องประชุม ชั้น 3 |
| **Sprint** | Sprint 1 - Core Features |

---

## 2. Attendees

| Name | Role | Present |
|------|------|---------|
| สมชาย | Project Lead | ✓ |
| สมศักดิ์ | Frontend Developer | ✓ |
| สมปอง | Game Designer | ✓ |
| สมศรี | QA/Tester | ✓ |

---

## 3. Agenda

1. ติดตามความคืบหน้า Sprint 1
2. รายงานปัญหาและอุปสรรค
3. วางแผน Sprint 2
4. อัปเดต GDD และเอกสาร

---

## 4. Discussion Notes

### 4.1 ติดตามความคืบหน้า Sprint 1

- **ความคืบหน้า:**
  - Zoo Detective: เสร็จสิ้น 80% (Scene หลักเสร็จ, กำลังทำ UI)
  - Zoo Feeder: เสร็จสิ้น 60% (Conveyor belt ทำเสร็จ, กำลังทำระบบให้อาหาร)
  - Context Clues: เสร็จสิ้น 40% (Question data เตรียมพร้อม, กำลังทำ UI)
  - Symmetry Decor: เสร็จสิ้น 20% (เริ่มวางโครงสร้าง)
  - Postcard Reader: ยังไม่เริ่ม

- **Decisions:** ตัดสินใจเน้นพัฒนา Zoo Detective และ Zoo Feeder ให้เสร็จก่อน

- **Action Items:**
  - สมศักดิ์: ทำ UI ของ Zoo Detective ให้เสร็จภายในสัปดาห์นี้
  - สมปอง: อัปเดต Hint System ให้รองรับ dynamic hints

### 4.2 รายงานปัญหาและอุปสรรค

- **ปัญหา 1:** ฐานข้อมูล Supabase ยังไม่พร้อม
  - **Impact:** ทำให้การทดสอบระบบบันทึกคะแนนไม่ได้
  - **Resolution:** ติดต่อฝ่าย backend เร่งด่วน

- **ปัญหา 2:** Asset สำหรับเกมยังไม่ครบ
  - **Impact:** ต้องใช้ placeholder ทดลองเล่น
  - **Resolution:** สมศรีจะติดตามกับทีมออกแบบ

- **Action Items:**
  - สมชาย: ติดต่อ backend team เรื่อง Supabase
  - สมศรี: ติดตาม asset จากทีมออกแบบ

### 4.3 วางแผน Sprint 2

- **เป้าหมาย:** เน้นพัฒนา Context Clues และ Symmetry Decor
- **Decisions:**
  - เพิ่ม Bug Fix Day ในวันศุกร์
  - ทำ Code Review ทุกวันอังคาร

- **Action Items:**
  - สมศักดิ์: จัดลำดับความสำคัญของงานใน Sprint 2

### 4.4 อัปเดตเอกสาร

- **GDD:** อัปเดตแล้วเมื่อ 2026-04-20
- **Class Diagram:** เพิ่มส่วน Database Schema
- **API Documentation:** รอ backend spec

- **Action Items:**
  - สมปอง: อัปเดต Game Loop Diagram

---

## 5. Action Items

| # | Task | Owner | Due Date | Status |
|---|------|-------|----------|--------|
| 1 | ทำ UI ของ Zoo Detective ให้เสร็จ | สมศักดิ์ | 2026-04-23 | [✓] |
| 2 | ติดต่อ backend team เรื่อง Supabase | สมชาย | 2026-04-22 | [ ] |
| 3 | ติดตาม asset จากทีมออกแบบ | สมศรี | 2026-04-24 | [ ] |
| 4 | อัปเดต Hint System ให้รองรับ dynamic hints | สมปอง | 2026-04-25 | [ ] |
| 5 | อัปเดต Game Loop Diagram | สมปอง | 2026-04-26 | [ ] |
| 6 | จัดลำดับความสำคัญของงานใน Sprint 2 | สมศักดิ์ | 2026-04-22 | [ ] |

---

## 6. Blockers & Risks

| Issue | Impact | Resolution |
|-------|--------|------------|
| Supabase ยังไม่พร้อม | ทดสอบระบบบันทึกคะแนนไม่ได้ | ติดต่อ backend team |
| Asset ไม่ครบ | ใช้ placeholder ทดลองเล่น | ติดตามทีมออกแบบ |

---

## 7. Next Meeting

| Item | Detail |
|------|--------|
| **Date** | 2026-04-28 |
| **Time** | 14:00 |
| **Agenda** | Sprint 1 Review, Sprint 2 Planning |

---

## 8. Metrics Summary

| Metric | Value | Notes |
|--------|-------|-------|
| **Tasks Completed** | 12 | จากทั้งหมด 25 |
| **Tasks In Progress** | 8 | |
| **Blockers** | 2 | Supabase, Asset |

---

## Notes

- ประชุมครั้งหน้าจะมีการ Demo Zoo Detective ให้ดู
- กำหนดส่ง Sprint 1 ภายในวันศุกร์ที่ 24 เมษายน

---

*Note taken by: สมชาย*
