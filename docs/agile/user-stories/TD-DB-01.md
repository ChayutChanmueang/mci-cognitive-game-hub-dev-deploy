# Technical Debt Task: TD-DB-01 - Database Normalization & Column Renaming

**Status:** 🏗 In-Progress (Sprint 6)
**Epic:** [E2: Core Gamehub & Progression System](../01-product-backlog.md) / [E4: Data Tracking & Analytics](../01-product-backlog.md)
**Owner:** TBD

---

## 📖 Description
**ในฐานะ** ผู้พัฒนาระบบ (Developer)
**ฉันต้องการ** ปรับปรุงโครงสร้างคอลัมน์และรูปแบบการตั้งชื่อตารางฐานข้อมูลใน Supabase ให้เป็นมาตรฐานเดียวกัน (snake_case และการระบุความหมายที่ชัดเจน)
**เพื่อให้** โค้ดฝั่ง Javascript API และฐานข้อมูลฝั่ง Postgres SQL ทำงานสอดคล้องกันได้อย่างถูกต้อง ลดข้อผิดพลาดการดึงคีย์ข้อมูล และสนับสนุนระบบ Cascade Deletion

---

## ✅ Acceptance Criteria
1. [ ] **ปรับปรุงชื่อคอลัมน์วันเกิด**: เปลี่ยนชื่อคอลัมน์จาก `date` ⮕ `birth_date` ในตารางข้อมูลผู้ป่วย `user_patient_data`
2. [ ] **ปรับปรุงคีย์เช็คอิน**: เปลี่ยนชื่อรูปแบบการตั้งชื่อจาก kebab-case (`check-in`) ⮕ snake_case (`check_in`) ในตารางประวัติการเล่นและพารามิเตอร์ของระบบ API
3. [ ] **ปรับปรุงโค้ดฝั่ง Client/API**: อัปเดต SQL Query, ฟังก์ชัน Supabase Client และ Javascript Helpers ทั้งหมดที่เรียกใช้คีย์เดิมให้เป็นคีย์ใหม่โดยไม่ส่งผลกระทบต่อข้อมูลเดิม
4. [ ] **ทดสอบความเข้ากันได้**: ตรวจสอบว่าระบบลงทะเบียน เข้าสู่ระบบ แสดงข้อมูลคนไข้ และส่งออกข้อมูล CSV ทำงานได้ตามปกติหลังจากเปลี่ยนชื่อคอลัมน์

---

## 🛠 Technical Tasks
- [x] ตรวจสอบและอัปเดต Data Schema และ Class Diagram ในระบบเอกสารการออกแบบ
- [ ] ปรับปรุงโค้ดใน `src/core/database.js` ในฟังก์ชันเกี่ยวกับการบันทึกประวัติการเล่นและการตรวจสอบสิทธิ์การเล่นรายวัน
- [ ] ปรับปรุงโค้ดใน `src/main.js` ในการดึงข้อมูลส่วนตัว ( birth_date ) และตรรกะการเช็คอิน ( check_in )
- [ ] ปรับปรุงหน้าจอลงทะเบียน `src/ui/signup-screen.js` และหน้าข้อมูลผู้เล่น `src/ui/player-info-screen.js` ให้ใช้คีย์ `birth_date`
- [ ] ตรวจสอบระบบดึงข้อมูลส่งออกไฟล์ CSV ให้รองรับคีย์ใหม่ทั้งหมด
- [ ] รันคำสั่ง SQL Migration บน Supabase เพื่อแก้ไข Schema ของตารางจริง

---

## 🔗 Related Files
- Schema Document: [03-data-schema.md](../../software/03-data-schema.md)
- Database Client: [src/core/database.js](../../../src/core/database.js)
- Main Controller: [src/main.js](../../../src/main.js)
- UI player info: [src/ui/player-info-screen.js](../../../src/ui/player-info-screen.js)
- UI signup form: [src/ui/signup-screen.js](../../../src/ui/signup-screen.js)
- Product Backlog: [01-product-backlog](../01-product-backlog.md)
- Sprint 6 Backlog: [sprint-06.md](../sprint-backlogs/sprint-06.md)
