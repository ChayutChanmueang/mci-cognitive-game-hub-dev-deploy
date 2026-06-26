# Sprint 07: Game Art Assets, Version Display & Mini-game Vertical Responsiveness

**Goal:** ยกระดับชั้นการนำเสนอ (Presentation Layer) ของแอป โดย (1) เพิ่ม game art assets ให้หน้าจอ DOM หลัก (Leaderboard, Login, Sign-up, Player-Info, Popup และอื่น ๆ) ให้มีเอกลักษณ์ภาพตรงกับธีมเกม, (2) แสดงเลขเวอร์ชันของตัวเกมหลัก (Game Hub shell) โดยซ่อนตัวบ่งชี้นี้เมื่อผู้เล่นเข้าสู่มินิเกม และ (3) ทำให้มินิเกม (Phaser) รองรับการยืดในแนวตั้ง (Vertical Responsive) บนหน้าจอที่สูงได้อย่างถูกต้อง
**Timeline:** 2026-06-23 → 2026-07-06 (14 วัน)

---

## 📅 Internal Timeline
```mermaid
gantt
    title Sprint 07 Tasks & Gantt Chart
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d
    section Epic 7: Game Art Assets
    Leaderboard art (US-E7-01)        :a1, 2026-06-23, 3d
    Login & Sign-up art (US-E7-02)    :a2, 2026-06-25, 3d
    Player-Info art (US-E7-03)        :a3, 2026-06-27, 2d
    Popup visual system (US-E7-04)    :a4, 2026-06-29, 3d
    section Epic 7: Versioning
    Game Hub version indicator (US-E7-05) :a5, 2026-06-24, 2d
    section Epic 7: Responsiveness
    Mini-game vertical stretch (US-E7-06) :a6, 2026-07-01, 4d
    Boot loading visual refresh (US-E7-17) :a7, 2026-06-26, 1d
    section QA
    Visual & responsive QA pass        :q1, 2026-07-04, 2d
```

---

## 📋 Committed Stories & Tasks
| ID | Story / Task | Priority | Status |
|----|--------------|----------|--------|
| [US-E7-01](../user-stories/US-E7-01.md) | Game art assets สำหรับหน้า Leaderboard | High | 📋 Backlog |
| [US-E7-02](../user-stories/US-E7-02.md) | Game art assets สำหรับหน้า Login และ Sign-up | High | 📋 Backlog |
| [US-E7-03](../user-stories/US-E7-03.md) | Game art assets สำหรับหน้า Player-Info | Med | 📋 Backlog |
| [US-E7-04](../user-stories/US-E7-04.md) | Game art assets / ระบบภาพสำหรับ Popup (dialog) | Med | 📋 Backlog |
| [US-E7-05](../user-stories/US-E7-05.md) | แสดงเลขเวอร์ชันบนตัวเกมหลัก (Game Hub) และซ่อนเมื่อเข้ามินิเกม | Med | 📋 Backlog |
| [US-E7-06](../user-stories/US-E7-06.md) | มินิเกมรองรับการยืดแนวตั้ง (Vertical Responsive) | High | 📋 Backlog |
| [US-E7-17](../user-stories/US-E7-17.md) | ปรับ Boot Loading ให้ใช้โลโก้เกม + dot progress 5 จุด | Med | ✅ Done |

---

## 📨 Customer Feedback Items — Doctor Meeting #2 (2026-06-24)
เพิ่มเข้า Sprint 7 จากข้อเสนอแนะของคุณหมอ (Sprint ยังไม่เริ่ม implement) — ดูบันทึกฉบับเต็ม: [2026-06-24](../meeting-backlogs/2026-06-24.md)

| ID | Story / Task | Priority | Status |
|----|--------------|----------|--------|
| [US-E7-07](../user-stories/US-E7-07.md) | ชื่อมินิเกมภาษาไทย (ปก + Gamehub) + ขยายตัวอักษรวิธีเล่น | High | 📋 Backlog |
| [US-E7-08](../user-stories/US-E7-08.md) | แก้คำศัพท์ยาก "สมอบก" ในเกมคำใบ้บริบท (เนื้อเรื่องกางเต็นท์) | High | 📋 Backlog |
| [US-E7-09](../user-stories/US-E7-09.md) | จดหมายจากหลานรัก — เสียง AI ใหม่/ถอดเสียง + ขยายตัวอักษรโจทย์ | Med | 📋 Backlog |
| [US-E7-10](../user-stories/US-E7-10.md) | ต้นคิดดีหลายรูปแบบ + เอฟเฟค Juicy | Med | 📋 Backlog |
| [US-E7-11](../user-stories/US-E7-11.md) | ละครสั้น Mood&Tone แฮปปี้ + ความถูกต้องวิดีโอ + ไปป์ไลน์ AI | Med | 📋 Backlog |
| [US-E7-12](../user-stories/US-E7-12.md) | แสดงโดเมน Cognitive ในเกม + สรุปหลังบ้านรายด้าน + เตรียมข้อมูล AI | Med | 📋 Backlog |
| [US-E7-13](../user-stories/US-E7-13.md) | เอฟเฟคฉลองหน้า "เก่งมาก!!!" (ระเบิดริปปิ้น + อนิเมชันคนแก่ดีใจ) | Med | 📋 Backlog |

> **หมายเหตุนอกขอบเขต Dev:** การเก็บข้อมูล MOCA (กระดาษ → Google Sheet) เป็นกระบวนการของทีมแพทย์ และจุดเด่นของแอป/บทบาท AI/ทิศทางธีมใหม่ต่อเนื่อง เป็นประเด็นเชิงกลยุทธ์ — บันทึกไว้ในรายงานการประชุม

---

## 🐛 Stability & Bug Fixes
บั๊กที่พบในช่วง Sprint 7 และต้องแก้ในรอบนี้

| ID | Bug / Task | Severity | Status |
|----|------------|----------|--------|
| [BUG-004](../reports/bugs/BUG-004.md) | กลับจากมินิเกมโหมด full-screen แล้วพื้นหลัง Game Hub เป็นสีดำ | 🟠 Medium | 🔴 Open |
| [BUG-005](../reports/bugs/BUG-005.md) | โหลดข้อมูลช้า → ผู้ใช้เปิดเกม/Leaderboard ก่อนโหลดเสร็จแล้วถูกดีดกลับหน้า Game Hub (เสนอ: loading overlay หรือเลิก redirect) | 🔴 High | ✅ Resolved |
| [BUG-006](../reports/bugs/BUG-006.md) | จอเล็ก: scroll ลงแล้ว background ถูกตัด + ปุ่ม FAB ไม่ float (เลื่อนตาม content) — scroll containment เสีย | 🟠 Medium | ✅ Resolved |

> หมายเหตุ: UI แสดงเวอร์ชันระดับ body ครอบทุกหน้า (และซ่อนในมินิเกม) อยู่ใน [US-E7-05](../user-stories/US-E7-05.md) แล้ว — ปรับ acceptance criteria ให้ครอบคลุมการ render ระดับ body/ทุกหน้า

---

## 👤 Owner Task Block — ก้องไผ่ (2026-06-24)
งานที่มอบหมายให้ **ก้องไผ่** ในรอบนี้ แต่ละข้อ map กับ User Story (มีอยู่/สร้างใหม่) หรือเป็น note/coordination

**หน้าหลัก (Game Hub)**
- [ ] ปรับระยะห่างแต่ละเลเวลให้ห่างขึ้น (ปุ่มเริ่มเกมไม่เบียดมินิเกมถัดไป) → [US-E7-14](../user-stories/US-E7-14.md)
- [ ] สลับตำแหน่งชื่อเกม ↔ ชื่อหมวด Cognitive ในหน้าหลัก → [US-E7-14](../user-stories/US-E7-14.md)
- [ ] เพิ่มเงาตัวละครในหน้าหลัก → [US-E7-14](../user-stories/US-E7-14.md)
- [ ] นำ **Assets พี่กวาง** มาใส่ (เป็นแหล่ง art ของงาน E7) → ใช้ร่วมกับ US-E7-01..04, US-E7-14

**ระบบสีปุ่ม**
- [ ] ปุ่มเขียว = "เริ่มเกม"/"ตกลง"/"ต่อไป", ปุ่มแดง = "ยกเลิก" → [US-E7-15](../user-stories/US-E7-15.md)

**Art หน้าจอ DOM**
- [ ] หน้าลงชื่อเข้าใช้ (Login) + สมัครสมาชิก (Sign-up) → [US-E7-02](../user-stories/US-E7-02.md)
- [ ] หน้า Login ของ Admin → [US-E7-02](../user-stories/US-E7-02.md) (ขยายขอบเขตให้รวม Admin Login)
- [ ] หน้าข้อมูลผู้เล่น (Player-Info) → [US-E7-03](../user-stories/US-E7-03.md)
- [ ] หน้า Leaderboard → [US-E7-01](../user-stories/US-E7-01.md)

**Popup**
- [ ] กรอบ Popup + นำไปใส่ Popup ต่าง ๆ ที่มีในเกม → [US-E7-04](../user-stories/US-E7-04.md)
- [ ] **ตัด** Popup หลังดูละครเสร็จ ("พบกันใหม่วันพรุ่งนี้") ออก → [US-E7-16](../user-stories/US-E7-16.md)
- [ ] แก้ Popup เมื่อผู้เล่นเล่นจบของวันแล้วเข้ามาในวันเดิม → [US-E7-16](../user-stories/US-E7-16.md)

**Boot Loading**
- [x] ปรับ boot loading ตอนเปิดเกมให้ใช้โลโก้เกมเหมือนหน้า Welcome และ dot progress จำนวน 5 จุด → [US-E7-17](../user-stories/US-E7-17.md)

**ข้อมูลหลังบ้าน (coordination)**
- [ ] ตกลงกับ **น้องเกม** เรื่องข้อมูลหลังบ้าน เช่น เงื่อนไข/ขั้นตอน **ลบข้อมูลผู้เล่นทั้งหมด** ให้ลบได้เลยโดยไม่ติดปัญหาทั้งฝั่ง SE และฝั่งเรา → เกี่ยวข้องกับ [US-E5-03](../user-stories/US-E5-03.md) และ [TD-DB-01](../user-stories/TD-DB-01.md) (Owner: ก้องไผ่ + น้องเกม)

---

## 📊 Sprint Summary & Velocity
- **งานที่วางแผนไว้ (Planned):** 17 User Stories ภายใต้ Epic E7 (6 เดิม + 7 จาก Doctor Feedback ครั้งที่ 2 + 4 จาก Owner Task Block ก้องไผ่) และบั๊ก BUG-004/005/006
- **สถานะปัจจุบัน (Status):** 📋 Planned — เริ่มต้น Sprint
- **เป้าหมายความสำเร็จ (Sprint Target):** ทุกหน้าจอ DOM หลักมี art asset ตรงธีม, ตัวเกมหลักแสดงเลขเวอร์ชันที่ sync กับ `package.json` (และซ่อนในมินิเกม), และมินิเกมทุกเกมยืดแนวตั้งได้โดยไม่มีการตัดขอบ/letterbox ภายในวันที่ 6 กรกฎาคม 2026

---

## 🛠 Sprint Specifics
- **Definition of Done (DoD):**
  - หน้าจอ Leaderboard, Login, Sign-up, Player-Info และ Popup ใช้ art asset จากธีมเกม (ไม่ใช่ placeholder) และผ่านการตรวจบนมือถือจริง
  - art asset ทั้งหมดถูกจัดเก็บภายใต้ `public/assets/` ตาม convention และไม่ทำให้ bundle หลักโตเกินจำเป็น
  - ตัวบ่งชี้เวอร์ชันบน Game Hub อ่านค่ามาจากแหล่งความจริงเดียว (`package.json`) และหายไปเมื่อมินิเกม (Phaser) ทำงานอยู่
  - boot loading overlay ใช้โลโก้เกมเดียวกับหน้า Welcome และ dot progress 5 จุด โดยยังปิดตาม first usable paint / `finishBootLoading()` เดิม
  - มินิเกมทุกเกมรองรับการยืดแนวตั้งบน viewport ที่สูง โดย element ภายในจัดตำแหน่ง/anchor ถูกต้อง ไม่มีพื้นที่ว่างผิดปกติหรือ asset ถูกตัด
  - ผ่าน visual QA และ responsive QA บนอัตราส่วนหน้าจอแนวตั้งหลายขนาด
- **Risks & Blockers:**
  - **ขนาด bundle จาก art assets**: ภาพจำนวนมากอาจทำให้แอปโหลดช้า -> *แนวทางแก้ไข*: บีบอัด/ใช้รูปแบบที่เหมาะสม (เช่น WebP/SVG), โหลดเฉพาะที่จำเป็น และพิจารณาทำ Figma เป็น CSS แทนรูปภาพในจุดที่ทำได้
  - **ความหลากหลายของอัตราส่วนหน้าจอแนวตั้ง**: การยืดแนวตั้งอาจทำให้ layout ของบางมินิเกมเพี้ยน -> *แนวทางแก้ไข*: เลือกกลยุทธ์ Phaser Scale ที่เหมาะ (RESIZE/FIT + reflow) และทดสอบบนช่วงความสูงที่กว้าง
  - **การ sync เลขเวอร์ชัน**: เลขที่ฮาร์ดโค้ดอาจไม่ตรงกับ release -> *แนวทางแก้ไข*: ดึงค่าจาก `package.json` ตอน build (Vite `define`/import) ไม่ฮาร์ดโค้ด

---
Back to Product Backlog: [Product Backlog](../01-product-backlog.md) | Back to Index: [Index](../../index.md)
