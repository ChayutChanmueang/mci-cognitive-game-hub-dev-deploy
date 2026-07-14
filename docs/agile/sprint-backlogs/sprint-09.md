# Sprint 09: Field Feedback Hotfix — ลงพื้นที่ (แก้ด่วน)

**Goal:** แก้ปัญหาเร่งด่วนจากการลงพื้นที่จริงกับผู้สูงอายุที่เริ่มเล่นโปรแกรม 14 วันแล้ว — เน้น **UX ระหว่างเล่นเกม**, **เครื่องสเปคต่ำ**, และ **ระบบหลังบ้านที่ commit แล้ว**
**Timeline:** 2026-07-10 → 2026-07-23 (14 วัน) — *ขยายตาม scope*
**Release target:** PATCH line ต่อจาก `1.1.3` — [US-E9-05](../user-stories/US-E9-05.md) → `1.1.4`, [US-E9-09](../user-stories/US-E9-09.md) → `1.1.5` *(planned; bump ตอน ship)* — [US-E9-10](../user-stories/US-E9-10.md) ✅ Done (CLI ops, **ไม่ bump version**)
**Source:** [Field Feedback — ลงพื้นที่ (2026-07-10)](../meeting-backlogs/2026-07-10.md)

---

## 📅 Internal Timeline
```mermaid
gantt
    title Sprint 09 Tasks & Gantt Chart
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d
    section P0 — Gameplay Hotfix
    Symmetry Decor UX (US-E9-01)     :t1, 2026-07-10, 4d
    Fry Food skip button (US-E9-02)  :t2, 2026-07-10, 2d
    Zoo Detective drag (US-E9-03)    :t3, 2026-07-12, 3d
    Postcard font size (US-E9-04)    :t4, 2026-07-14, 2d
    section P0 — Device / Hub
    Screen wake lock (US-E9-06)      :t6, 2026-07-10, 2d
    Low-end perf A10s (US-E9-07)     :t7, 2026-07-12, 5d
    Game Hub label swap (US-E9-08)   :t8, 2026-07-14, 1d
    section P1 — Admin / A11y committed
    Full data export (US-E9-05)      :t5, 2026-07-14, 5d
    System font scale (US-E9-09)     :t9, 2026-07-16, 3d
    update-user-hn.js (US-E9-10)     :t11, 2026-07-18, 3d
    section QA
    Mobile QA + A10s playtest      :q1, 2026-07-18, 4d
```

---

## 📋 Committed Stories & Tasks

### 🔴 P0 — แก้ด่วน (Gameplay)
| ID | Story / Task | Priority | Status |
|----|--------------|----------|--------|
| [US-E9-01](../user-stories/US-E9-01.md) | ภัยพิบัติระดับ Symmetry — บล็อกฝั่งโจทย์, ลดโหมดสะท้อน, ลดช่อง 2×2/4×4/6×6, เส้นแบ่งชัด, จบเมื่อหมดเวลา | High | 📋 Backlog |
| [US-E9-02](../user-stories/US-E9-02.md) | เกมทำอาหาร — ปุ่มข้ามเมื่อไม่มี Gyroscope (ไม่ได้คะแนน) | High | 📋 Backlog |
| [US-E9-03](../user-stories/US-E9-03.md) | เกมสัตว์นักสืบ — เปลี่ยน input เป็นลากเพื่อวาง | High | 📋 Backlog |
| [US-E9-04](../user-stories/US-E9-04.md) | จดหมายจากหลานรัก — ขยายตัวอักษรโจทย์เพิ่มเติม | High | 📋 Backlog |

### 🔴 P0 — แก้ด่วน (Device / Game Hub)
| ID | Story / Task | Priority | Status |
|----|--------------|----------|--------|
| [US-E9-06](../user-stories/US-E9-06.md) | ป้องกันหน้าจอดับระหว่างเล่นเกม (Screen Wake Lock) | High | ✅ Done (v1.1.2, owner verified 2026-07-10) |
| [US-E9-07](../user-stories/US-E9-07.md) | Optimize สเปคต่ำ — เอฟเฟคเก่งมาก + Phaser (Galaxy A10s baseline) | High | 🔵 In Progress |
| [US-E9-08](../user-stories/US-E9-08.md) | Game Hub — ชื่อเกมบน / หมวดหมู่ล่าง (แก้จากลงพื้นที่) | High | ✅ Done (v1.1.1) |

### 🟡 P1 — Committed (In Progress)
| ID | Story / Task | Planned version | Status |
|----|--------------|-----------------|--------|
| [US-E9-05](../user-stories/US-E9-05.md) | ส่งออกข้อมูลผู้เล่นครบถ้วนไม่สูญหาย | `1.1.4` | 🔵 In Progress |
| [US-E9-09](../user-stories/US-E9-09.md) | Layout ทนต่อการขยายฟอนต์ระบบ (System Font Scale) | `1.1.5` | 🔵 In Progress |

### ✅ Shipped ใน Sprint 09
| ID | Story / Task | หมายเหตุ |
|----|--------------|----------|
| [US-E9-10](../user-stories/US-E9-10.md) | CLI `update-user-hn.js` — แก้ ID/`hn` ที่ลงทะเบียนผิด | ✅ Done (2026-07-14, CLI ops — **ไม่ bump version**) |
| [US-E9-11](../user-stories/US-E9-11.md) | หน้าสร้างบัญชี — แสดงปีเกิดเป็น พ.ศ. | ✅ Done (v1.1.3, 2026-07-13) |

### ✅ ครอบคลุมแล้ว (Sprint 08)
| ID | Story / Task | หมายเหตุ |
|----|--------------|----------|
| [US-E8-01](../user-stories/US-E8-01.md) | ต้นคิดดีสุ่ม 4 ชนิด (`a`/`b`/`c`/`d`) | ✅ Done (v1.1.0, 2026-07-14) |

---

## 📌 Context — ต่อจาก v1.0.0 / Sprint 08

- [v1.0.0](../../changelog.md) (2026-07-07) — ผู้สูงอายุเริ่มเล่นโปรแกรม 14 วันแล้ว → **แก้อย่างระมัดระวัง**
- **Current shipped:** `1.1.3` (US-E9-11 พ.ศ. signup)
- [Sprint 08](sprint-08.md) ปิดแล้ว — [US-E8-01](../user-stories/US-E8-01.md) ✅ Done (**v1.1.0**, 2026-07-14)
- Sprint 09 เริ่มขนานกับ Sprint 08 wrap-up (ตอนนี้ Sprint 08 ปิดแล้ว)
- Feedback มาจาก [Meeting 2026-07-10](../meeting-backlogs/2026-07-10.md) (รอบ 1 + รอบ 2)
- **2026-07-14:** Owner commit US-E9-05, 09 ในรอบ release นี้; US-E9-10 ✅ Done (CLI, ไม่ bump version)

### ลำดับความสำคัญ (ตาม owner)
1. **P0:** ปัญหาระหว่างเล่นเกม + เครื่องสเปคต่ำ (US-E9-01..04, 06..08)
2. **P1 committed:** ระบบหลังบ้าน + A11y (US-E9-05 → `1.1.4`, 09 → `1.1.5`)
3. **Done:** US-E8-01 (v1.1.0), US-E9-10 (CLI), US-E9-11 (v1.1.3), US-E9-06/08

### การรวม Story
| รวมแล้ว | จาก feedback |
| --- | --- |
| [US-E9-07](../user-stories/US-E9-07.md) | เอฟเฟคเก่งมากค้าง + Phaser เข้าเกมไม่ได้บน A10s |
| แยกต่างหาก | Wake lock, Game Hub labels, font scale, export, HN script, พ.ศ. |

### เครื่องอ้างอิงขั้นต่ำสุด
**Samsung Galaxy A10s** (SM-A107F/M) — Helio P22, 2–3 GB RAM, PowerVR GE8320 — ใช้ทดสอบ US-E9-07

---

## 🛠 Sprint Specifics
- **Definition of Done (DoD):**
  - P0 stories ผ่าน AC ครบ + ทดสอบบนมือถือจริง (รวม A10s สำหรับ US-E9-07)
  - P1 committed (05, 09, 10) ผ่าน AC + bump PATCH ตาม planned version ตอน ship
  - ไม่กระทบข้อมูลผู้เล่นที่เล่นโปรแกรมอยู่แล้ว (backward-compatible)
  - อัปเดต GDD/mechanics ที่เกี่ยวข้อง
- **Risks & Blockers:**
  - **Scope ใหญ่:** P0 ยังค้าง + P1 committed 3 stories — timeline อาจขยาย
  - **ผู้เล่นกำลังเล่นอยู่:** เปลี่ยน grid size / input mode อาจสับสนผู้ที่คุ้นเคยกับเวอร์ชันเก่า
  - **A10s optimization:** อาจต้อง trade-off เอฟเฟคบนเครื่องสเปคต่ำ
  - **HN update script:** ต้อง transaction ครบทุกตาราง FK — ทดสอบ dry-run บน staging ก่อน

---

## 📊 Sprint Summary
- **งานที่ commit:** 11 stories (7 P0 + 3 P1 committed + US-E9-11 Done) + US-E8-01 ใน Sprint 08
- **เป้าหมายถัดไป:** ship **`1.1.4` → `1.1.5`** สำหรับ US-E9-05, 09 — US-E9-10 ✅ Done (CLI, ไม่ bump version)
- **สถานะ:** 🟢 **Sprint 9 Open** (อัปเดต 2026-07-14)

---
Back to Product Backlog: [Product Backlog](../01-product-backlog.md) | Roadmap: [Sprint Planning](../02-sprint-planning.md) | Back to Index: [Index](../../index.md)
