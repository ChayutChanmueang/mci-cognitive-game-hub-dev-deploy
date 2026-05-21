# Sprint 05 Retrospective

**Date:** 2026-05-20 | **Facilitator:** Antigravity AI

## What Went Well ✅
- **E2E Integration Success:** ระบบลงทะเบียนผู้ป่วยและระบบความคืบหน้า 14 วัน (Progression System) ทำงานร่วมกับฐานข้อมูล Supabase ได้อย่างสมบูรณ์แบบ ข้อมูลถูกบันทึกและซิงค์ข้อมูลลงสู่หน้าหลัก Hub ได้รวดเร็ว
- **Elderly-Friendly Interaction:** การพัฒนา Progress Bar ขนาดใหญ่เห็นได้เด่นชัด และระบบเลื่อนหน้าจออัตโนมัติไปยังด่านปัจจุบัน (Auto-scroll to Active Day) ช่วยลดความยุ่งยากในการใช้งานของผู้สูงอายุ (MCI) ได้อย่างเป็นรูปธรรม
- **Adaptive Gatekeeper:** ระบบล็อกด่านตามระยะเวลานับจากวันที่เริ่มโปรแกรมจริง ช่วยควบคุมระยะเวลาในการฝึกสมองของผู้ใช้ไม่ให้ข้ามวัน และมีกลไกตรวจสอบเงื่อนไขความสำเร็จของวันก่อนกดยืนยันเช็คชื่อ
- **Proper Resting Intervals:** มินิเกมจุดพักผ่อนยืดเส้นสายร่างกาย (`REST001`) ช่วยคลายความล้าของผู้ป่วย และมีการดักจับในระดับ Database เพื่อไม่ให้ข้อมูลการพักถูกนำไปคำนวณปะปนกับสถิติระดับความยากของมินิเกมหลัก

## What Could Improve 🔧
- **Database Column Conventions (Kebab vs Snake):** คอลัมน์สำหรับตรวจสอบการเช็คชื่อในปัจจุบันยังถูกจัดเก็บเป็น `"check-in"` (kebab-case ในเครื่องหมายคำพูด) ซึ่งขัดกับมาตรฐาน snake_case ส่งผลให้ต้องใช้เครื่องหมายคำพูดครอบเวลาเขียนคำสั่ง SQL
- **Attribute Naming Redundancy:** ฟิลด์วันเกิดในโค้ดฝั่ง Client-side ปัจจุบันยังใช้คอลัมน์ชื่อว่า `date` (ในตาราง `user_patient_data`) ซึ่งไม่มีความเฉพาะเจาะจง ควรปรับแก้ชื่อฟิลด์เป็น `birth_date` ตามมาตรฐานที่ตกลงกันในการประชุมมาตรฐานข้อมูลเมื่อวันที่ 2026-05-11

## Action Items (For Sprint 06 / Maintenance)
| Action | Owner | Note |
|--------|-------|------|
| ทำการรัน Migration Script ปรับเปลี่ยนคอลัมน์จาก `"check-in"` เป็น `check_in` (snake_case) และอัปเดต Query ใน `database.js` | Data Eng | เพื่อความเสถียรและสอดคล้องตามมาตรฐาน SQL |
| ปรับเปลี่ยนโครงสร้างฟิลด์ `date` เป็น `birth_date` ในหน้า Signup และ Database Schema | Team Web / DB | เพิ่มความชัดเจนและสอดคล้องกับตารางประวัติผู้ป่วย |
| ตรวจสอบผลกระทบของการจัดเขตเวลา "Asia/Bangkok" ในกรณีผู้เล่นข้ามเขตเวลาหรือปรับเวลาในตัวเครื่อง | QA | เพื่อป้องกันบั๊กล็อค/ปลดล็อคด่านคลาดเคลื่อน |

## Velocity
- **Planned:** 7 Stories
- **Completed:** 7 Stories (US-E1-02, US-E1-03, US-E2-02, US-E2-03, US-E2-04, US-E2-05, US-E2-06)
- **Notes:** ปิดด่านได้ครบตามแผนงาน 100% สรุปภาพรวมเสร็จสมบูรณ์เรียบร้อย

---

Back to Index: [Index](../../index.md)  
Back to Retrospectives: [Retrospectives](../04-retrospectives-backlog.md)
