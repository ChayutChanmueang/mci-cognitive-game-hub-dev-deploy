# Test Plan: Sprint 05 Initial Features (May 05-06)

**Date:** 2026-05-06  
**Status:** 🏗 Draft  
**Target Sprint:** Sprint 05 (User Management & Progression Overhaul)

## 🎯 Overview
แผนการทดสอบนี้จัดทำขึ้นเพื่อตรวจสอบความถูกต้องของฟีเจอร์ที่พัฒนาในช่วงวันที่ 5 - 6 พฤษภาคม 2026 ซึ่งเน้นไปที่ระบบลงทะเบียนผู้ป่วยใหม่และการปรับปรุงหน้า Game Hub ให้รองรับระบบแผนที่ด่าน (Progression Map) แบบรายวัน

---

## 📋 Feature Mapping & Test Cases

### 1. User Management: Registration Flow
**Related User Stories:** 
- [US-E1-02: ลงทะเบียนผู้ใช้ใหม่](../user-stories/US-E1-02.md)
- [US-E1-03: ระบบคำนวณวันที่สิ้นสุดโปรแกรมอัตโนมัติ](../user-stories/US-E1-03.md)

| ID | Test Scenario | Expected Result | Status |
|----|---------------|-----------------|--------|
| REG-01 | ตรวจสอบการคำนวณอายุอัตโนมัติจากวันเกิด | เมื่อเลือกวันเกิด อายุต้องแสดงผลถูกต้องตามปีปัจจุบัน (บวก/ลบ ตามเดือน/วัน) | [ ] |
| REG-02 | ตรวจสอบ Validation ของฟิลด์ที่จำเป็น (ชื่อ, เบอร์โทร, วันเกิด, เพศ, การศึกษา) | หากเว้นว่างหรือกรอกผิดรูปแบบ (เช่น เบอร์โทรไม่ครบ 10 หลัก) ต้องแสดง Error Text ใต้ฟิลด์ | [ ] |
| REG-03 | ตรวจสอบการบันทึกข้อมูลลง Supabase | เมื่อกด "ยืนยัน" ข้อมูลต้องถูก Insert ลง Table `users` และ `user_patient_data` อย่างถูกต้อง | [ ] |
| REG-04 | ตรวจสอบการกำหนดวันเริ่มโปรแกรม | ระบบต้องบันทึก `started_program` ตามที่ผู้ใช้เลือก เพื่อใช้คำนวณวันในหน้า Game Hub | [ ] |

### 2. Game Hub: Level Progression Map (New UI)
**Related User Stories:** 
- [US-E2-02: ระบบแผนที่ด่าน (Level Progression Map)](../user-stories/US-E2-02.md)
- [US-E2-03: ระบบ Daily Goal Progress Bar](../user-stories/US-E2-03.md)

| ID | Test Scenario | Expected Result | Status |
|----|---------------|-----------------|--------|
| HUB-01 | ตรวจสอบการแสดงผล Multi-day Window | หน้า Hub ต้องแสดงรายการวันแบบ Windowed (เช่น วันที่ผ่านมา, วันปัจจุบัน, และวันถัดไป) | [ ] |
| HUB-02 | ตรวจสอบสถานะของ Node (Locked/Unlocked) | เกมในลำดับที่ยังไม่ถึงต้องถูกล็อก และเกมที่ผ่านแล้วต้องมีเครื่องหมายถูก (✓) | [ ] |
| HUB-03 | ตรวจสอบความถูกต้องของ Progress Bar | Progress Bar ด้านบนต้องแสดง % ตามจำนวนเกมที่เล่นจบจริงในวันนั้นๆ | [ ] |
| HUB-04 | ตรวจสอบระบบ Auto Check-in | เมื่อเล่นเกมครบทุก Node ในวันนั้น ระบบต้องทำการบันทึก Check-in อัตโนมัติและแสดงผลใน Timeline | [ ] |

### 3. Minigame: Resting Point (Rest Level)
**Related User Stories:** 
- [US-E2-05: มินิเกมด่านจุดพัก (Rest Level)](../user-stories/US-E2-05.md)

| ID | Test Scenario | Expected Result | Status |
|----|---------------|-----------------|--------|
| RST-01 | ตรวจสอบการเข้าถึงด่านจุดพักจาก Game Hub | เมื่อกด Node "พักยืดเส้น" ต้องสามารถ Launch เกมพักผ่อนได้ถูกต้อง | [ ] |
| RST-02 | ตรวจสอบการบันทึกประวัติหลังพัก | เมื่อกดบันทึกการพัก ต้องมี Record `REST001` ใน `user_game_history` เพื่อให้ Node แสดงสถานะสำเร็จ | [ ] |

---

## 🛠 Testing Tools & Helpers
- **Debug Menu in Game Hub:** ใช้ปุ่ม "เล่นเกมครบทั้งหมด" (Test Complete All) เพื่อจำลองการผ่านด่าน
- **Clear History:** ใช้ปุ่ม "ลบประวัติการเล่น" เพื่อ Reset สถานะในการทดสอบซ้ำ
- **Supabase Dashboard:** ตรวจสอบข้อมูลใน Table `users` และ `user_game_history`

---

## 📝 Verification Plan
1. **Manual Testing:** ดำเนินการตาม Test Cases ด้านบนผ่าน Browser
2. **Data Integrity:** เช็คข้อมูลใน Database หลังจากทำ Action ต่างๆ
3. **UI Consistency:** ตรวจสอบความสวยงามและการตอบสนองของ UI ตาม GDD V.1

---
*Created by Antigravity AI Assistant*
