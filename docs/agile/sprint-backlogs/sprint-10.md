# Sprint 10: Field Feedback — ต่อจาก Sprint 09

**Status:** 🟢 **Active** (kickoff 2026-07-17)
**Goal:** รับงานที่เลื่อนจาก Sprint 09 — **full data export**, low-end perf (A10s), system font scale
**Timeline:** 2026-07-17 → 2026-07-30 (14 วัน)
**Release target:** PATCH ต่อจาก `1.1.5` — **US-E9-05 shipped `1.1.6`**; US-E9-07/09 ตามที่ ship ถัดไป
**Source:** [Field Feedback — ลงพื้นที่ (2026-07-10)](../meeting-backlogs/2026-07-10.md)

---

## 📅 Internal Timeline
```mermaid
gantt
    title Sprint 10 Tasks & Gantt Chart
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d
    section P1 — Export
    Full data export (US-E9-05)      :done, t5, 2026-07-17, 1d
    section P0 — Device perf
    Low-end perf A10s (US-E9-07)     :t7, 2026-07-22, 5d
    section P1 — Offline art
    Internet-loss art refresh (US-E9-13) :active, t13, 2026-07-17, 2d
    section P1 — A11y
    System font scale (US-E9-09)     :t9, 2026-07-24, 4d
    section QA
    A10s playtest                    :q1, 2026-07-27, 4d
```

---

## 📋 Committed Stories & Tasks

### 🔵 In Progress
| ID | Story / Task | Priority | สถานะ |
|----|--------------|----------|--------|
| [US-E9-13](../user-stories/US-E9-13.md) | อัปเดต art popup อินเทอร์เน็ตหาย — `*_internet_loss.png` | P1 | 🔵 In Progress (art กำลังเปลี่ยน) |

### ✅ Shipped ใน Sprint 10
| ID | Story / Task | Priority | สถานะ |
|----|--------------|----------|--------|
| [US-E9-05](../user-stories/US-E9-05.md) | ส่งออกข้อมูลผู้เล่นครบถ้วนไม่สูญหาย (Edge Function / pagination) | P1 | ✅ Done (v1.1.6, 2026-07-17) |

### 📋 Backlog (Sprint 10)
| ID | Story / Task | Priority | สถานะ |
|----|--------------|----------|--------|
| [US-E9-07](../user-stories/US-E9-07.md) | Optimize สเปคต่ำ — เอฟเฟคเก่งมาก + Phaser (Galaxy A10s) | P0 | 📋 Backlog *(sparkle slice ✅ v1.1.5; confetti + Phaser ค้าง)* |
| [US-E9-09](../user-stories/US-E9-09.md) | Layout ทนต่อการขยายฟอนต์ระบบ (System Font Scale) | P1 | 📋 Backlog |

> **2026-07-17:** [US-E9-13](../user-stories/US-E9-13.md) → **In Progress** — อัปเดต `*_internet_loss.png`
> **2026-07-17:** [US-E9-05](../user-stories/US-E9-05.md) ✅ Done (**v1.1.6**) — full data export
> **2026-07-17:** Sprint 10 kickoff
> **2026-07-15:** US-E9-07 sparkle slice shipped ใน **v1.1.5** — remainder ค้าง Backlog
> **2026-07-14:** Owner เลื่อน US-E9-05/07/09 จาก Sprint 09

### 📱 เครื่องอ้างอิงขั้นต่ำสุด
**Samsung Galaxy A10s** (SM-A107F/M) — ใช้ทดสอบ [US-E9-07](../user-stories/US-E9-07.md)

---

## 📌 Context

- [Sprint 09](sprint-09.md) ✅ **Completed** (2026-07-17) — P0 gameplay [US-E9-01](../user-stories/US-E9-01.md)..[US-E9-04](../user-stories/US-E9-04.md) Done
- [US-E9-10](../user-stories/US-E9-10.md) ✅ Done ใน Sprint 09 (CLI, ไม่ bump version)
- **Current shipped:** `1.1.6` (US-E9-05 full data export)
- **Focus รอบนี้:** US-E9-13 (internet-loss art); ถัดไป US-E9-07 / US-E9-09

---

## 📊 Sprint Summary
- **งานที่ commit:** US-E9-13 In Progress; US-E9-05 ✅ Done; US-E9-07/09 Backlog
- **สถานะ:** 🟢 **Sprint 10 Open** (US-E9-05 shipped 2026-07-17)

---

Back to Product Backlog: [Product Backlog](../01-product-backlog.md) | Roadmap: [Sprint Planning](../02-sprint-planning.md) | Back to Index: [Index](../../index.md)
