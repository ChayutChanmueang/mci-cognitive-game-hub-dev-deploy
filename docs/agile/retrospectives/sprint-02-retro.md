# Sprint 02 Retrospective

**Date:** 2026-05-03 | **Facilitator:** Antigravity AI

## What Went Well ✅
- **End-to-End Flow:** ระบบสามารถทำงานตั้งแต่ลงทะเบียนผู้เล่น -> Game Hub -> เล่นเกมจนจบ -> กลับหน้า Hub ได้อย่างสมบูรณ์
- **Thai Language Support:** การแสดงผลภาษาไทยในเกม (โดยเฉพาะ Context Clues) ทำได้ถูกต้องและอ่านง่าย
- **Technical Debt Cleanup:** การทำ Hotfix (HF-260502-01) ช่วยลดขยะใน Console และจัดการเรื่อง Plugin Loading ได้ดีขึ้นมาก
- **Documentation Overhaul:** การจัดระเบียบเอกสารใหม่ (Consolidation) ทำให้โครงสร้างโครงการชัดเจนและ AI เข้าถึงข้อมูลได้แม่นยำขึ้น
- **ECS Lite Adoption:** การใช้รูปแบบ Entity-Component ทำให้โค้ดในเกมรุ่นหลังมีความยืดหยุ่นและดูแลรักษาง่าย

## What Could Improve 🔧
- **Supabase Stability:** พบปัญหา Transient Connection (Missing Key) ในบางจังหวะ ซึ่งส่งผลต่อความเชื่อมั่นในระบบ Cloud
- **Database Schema Sync:** พบปัญหา Foreign Key Constraint Violation บ่อยครั้งเนื่องจากข้อมูลในตารางอ้างอิงไม่ตรงกับที่เกมส่งไป
- **UX Precision:** ระบบ Drag-and-Drop ใน Zoo Detective ยังมีปัญหาเรื่อง Coordinate Offset เมื่อมีการ Scroll หน้าจอ
- **Testing Coverage:** ปัจจุบันยังเน้นการทดสอบแบบ Manual/AI Browser ซึ่งใช้เวลานาน ควรเริ่มมองหาการทำ Unit Test สำหรับ Logic หลัก

## Action Items for Next Sprint
| Action | Owner | Due |
|--------|-------|-----|
| แก้ไข Database Schema (Event IDs) ให้สอดคล้องกับ Logic เกม | Dev Team | Sprint 3 - Day 2 |
| เพิ่ม Retry Mechanism สำหรับการเชื่อมต่อ Supabase | Core Dev | Sprint 3 - Day 3 |
| ปรับปรุงการคำนวณพิกัด Drag-and-Drop ให้รองรับ Scroll Offset | UI Dev | Sprint 3 - Day 5 |
| กำหนดมาตรฐาน Scene Key Naming Convention | AI Lead | Sprint 3 - Day 1 |

## Velocity
- **Planned:** 5 User Stories
- **Completed:** 4 User Stories (US-E1-02, US-E1-04, US-E1-06, US-E3-01, US-E3-03)
- **Notes:** US-E2-01 (Supabase Setup) ยังติดสถานะ In-Progress เนื่องจากพบปัญหาการ Sync ข้อมูล

---

Back to Index: [Index](../../index.md)
Back to Retrospectives: [Retrospectives](../04-retrospectives-backlog.md)