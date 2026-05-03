# Sprint 1: Foundation & Zoo Games

**Goal:** วางโครงสร้างพื้นฐานของโปรเจกต์ และพัฒนา Logic พื้นฐานของเกม Zoo Detective & Zoo Feeder
**Timeline:** 2026-03-01 → 2026-03-14

## 📅 Internal Timeline
```mermaid
gantt
    title Sprint 01 Tasks
    dateFormat  YYYY-MM-DD
    section Foundation
    Architecture Setup :done, s1a, 2026-03-01, 5d
    Engine Lifecycle   :done, s1b, 2026-03-05, 5d
    section Development
    Zoo Detective Logic :done, s1c, 2026-03-07, 7d
    Zoo Feeder Logic    :done, s1d, 2026-03-07, 7d
    section Deployment
    Git & CI/CD Setup   :done, s1e, 2026-03-12, 3d
```

## 📋 Committed Stories & Tasks
| ID | Story / Task | Owner | Estimate | Status |
|----|--------------|-------|----------|--------|
| [[US-E1-01]] | ระบบค้นหาภาพและตรรกะของ Zoo Detective | UI Dev | - | ✅ Done |
| [[US-E1-03]] | ระบบสายพานลำเลียงและฟิสิกส์ของ Zoo Feeder | UI Dev | - | ✅ Done |
| [[US-E1-05]] | ระบบคลังคำถามและประมวลผล Context Clues | Core Dev | - | ✅ Done |

## 🛠 Sprint 1 Specifics
- **Core Architecture:** จัดโครงสร้างโปรเจกต์ (Vite, Phaser, File Structure)
- **Game Engine:** ติดตั้ง Phaser 3 และกำหนด Scene Lifecycle พื้นฐาน
- **Dev Environment:** ตั้งค่า Git และเตรียม CI/CD เบื้องต้น
