# Sprint 10: Field Feedback — ต่อจาก Sprint 09 (เลื่อนจากรอบก่อน)

**Goal:** รับงานที่เลื่อนจาก Sprint 09 — export ครบชุด, low-end perf (A10s), system font scale
**Timeline:** TBD (หลัง Sprint 09)
**Release target:** PATCH ต่อจาก `1.1.5` — US-E9-07 remainder, US-E9-05/09 ตาม stories ที่ ship
**Source:** [Field Feedback — ลงพื้นที่ (2026-07-10)](../meeting-backlogs/2026-07-10.md)

---

## 📋 Carried over จาก Sprint 09 (2026-07-14)

| ID | Story / Task | Priority | สถานะ |
|----|--------------|----------|--------|
| [US-E9-05](../user-stories/US-E9-05.md) | ส่งออกข้อมูลผู้เล่นครบถ้วนไม่สูญหาย (Edge Function / pagination) | P1 | 📋 Backlog |
| [US-E9-09](../user-stories/US-E9-09.md) | Layout ทนต่อการขยายฟอนต์ระบบ (System Font Scale) | P1 | 📋 Backlog |

### 🔵 In Progress (เริ่มก่อน kickoff Sprint 10)
| ID | Story / Task | Priority | สถานะ |
|----|--------------|----------|--------|
| [US-E9-07](../user-stories/US-E9-07.md) | Optimize สเปคต่ำ — เอฟเฟคเก่งมาก + Phaser (Galaxy A10s) | P0 | 🔵 In Progress — sparkle slice **v1.1.5** (2026-07-15); confetti + Phaser ค้าง |

> Owner ยืนยัน 2026-07-14: US-E9-05/09 **ไม่ทำใน Sprint 09** — คง priority เดิม รอวางแผน release ตอน kickoff Sprint 10
> **2026-07-15:** US-E9-07 เริ่ม ship บางส่วน — task `sparkle-effect.js` ✅ ใน **v1.1.5**

---

## 📌 Context

- Sprint 09 P0 gameplay — [US-E9-01](../user-stories/US-E9-01.md)..[US-E9-04](../user-stories/US-E9-04.md) ✅ Done ทั้งหมด
- [US-E9-10](../user-stories/US-E9-10.md) ✅ Done แล้วใน Sprint 09 (CLI, ไม่ bump version)
- **Current shipped:** `1.1.5` (US-E9-07 sparkle-effect partial)

---

Back to Product Backlog: [Product Backlog](../01-product-backlog.md) | Roadmap: [Sprint Planning](../02-sprint-planning.md) | Back to Index: [Index](../../index.md)
