# Product Backlog & Epics - MCI Cognitive Games

---

**Last Updated:** 2026-06-26

## 🎯 Product Vision
"สร้างแอปพลิเคชันเกมฝึกทักษะทางปัญญา (Cognitive Training) ที่สนุก เข้าถึงง่าย และสามารถติดตามผลการพัฒนาของผู้ป่วยภาวะสมองเสื่อมระยะเริ่มต้น (MCI) ได้อย่างแม่นยำ ผ่านระบบ Gamification 14 วัน"

---

## 🏆 Epics Breakdown

### E1: User Management & Authentication (P0)
| ID                                     | User Story                                                    | Priority | Status   |
| -------------------------------------- | ------------------------------------------------------------- | -------- | -------- |
| [US-E1-01](./user-stories/archives/US-E1-01.md) | เข้าใช้งานระบบด้วยรหัส HN (Hospital Number)                   | High     | ✅ Done   |
| [US-E1-02](./user-stories/archives/US-E1-02.md) | ลงทะเบียนผู้ใช้ใหม่ (ชื่อ, วันเกิด, อายุ, เพศ, ระดับการศึกษา) | High     | ✅ Done  |
| [US-E1-03](./user-stories/archives/US-E1-03.md) | ระบบคำนวณวันที่สิ้นสุดโปรแกรมอัตโนมัติ (14 วัน)               | Med      | ✅ Done  |

### E2: Core Gamehub & Progression System (P0)
| ID       | User Story                                                         | Priority | Status   |
| -------- | ------------------------------------------------------------------ | -------- | -------- |
| [US-E2-01](./user-stories/archives/US-E2-01.md) | หน้า Gamehub รวมฟีเจอร์หลัก (ข้อมูลผู้เล่น, เป้าหมาย, ความคืบหน้า) | High     | ✅ Done   |
| [US-E2-02](./user-stories/archives/US-E2-02.md) | ระบบแผนที่ด่าน (Level Progression) แบบล็อคด่านตามวันที่            | High     | ✅ Done  |
| [US-E2-03](./user-stories/archives/US-E2-03.md) | ระบบ Daily Goal (ความคืบหน้า 10 ด่านในแต่ละวัน)                    | High     | ✅ Done  |
| [US-E2-04](./user-stories/archives/US-E2-04.md) | ระบบ Daily Streak (ติดตามการเล่นติดต่อกัน 14 วัน)                  | Med      | ✅ Done  |
| [US-E2-05](./user-stories/archives/US-E2-05.md) | ด่านจุดพัก (Rest Level) มินิเกมยืดเส้นยืดสาย                       | Low      | ✅ Done  |
| [US-E2-06](./user-stories/archives/US-E2-06.md) | ด่านเส้นชัย (Finish Level) เช็คชื่อและแสดงความยินดี                | High     | ✅ Done  |

### E3: Cognitive Games Implementation (P1)
| ID       | User Story                                                     | Priority | Status  |
| -------- | -------------------------------------------------------------- | -------- | ------- |
| [US-E3-01](./user-stories/archives/US-E3-01.md) | เกม Zoo Detective (การคิดวิเคราะห์/Executive)                  | High     | ✅ Done  |
| [US-E3-02](./user-stories/archives/US-E3-02.md) | เกม Zoo Feeder (ความจดจ่อ/Attention)                           | High     | ✅ Done  |
| [US-E3-03](./user-stories/archives/US-E3-03.md) | เกม Context Clues (คำศัพท์/Language)                           | High     | ✅ Done  |
| US-E3-04 | เกม Symmetry Decor (มิติสัมพันธ์/Visuospatial) — ดู [GDD](../gdd/minigames/gdd_symmetry_decor.md) | Med      | ✅ Done  |
| US-E3-05 | เกม Postcard Reader (ความจำระยะสั้น/Memory) — ดู [GDD](../gdd/minigames/gdd_postcard_reader.md) | Med      | ✅ Done  |
| [US-E3-06](./user-stories/US-E3-06.md) | เกมจำสัตว์ (ความจำขณะทำงาน/Working Memory) - ระบบคำถามคั่นเวลา | Low      | ✅ Done  |
| [US-E3-07](./user-stories/archives/US-E3-07.md) | เกม Fry Food (ทอดไข่/ทอดอาหาร) และการควบคุมด้วย Accelerometer | Med      | ✅ Done  |
| [US-E3-08](./user-stories/archives/US-E3-08.md) | ระบบติดตั้งแอปพลิเคชันแบบ Progressive Web App (PWA)            | Low      | ✅ Done  |
| [UX-RESP-01](./user-stories/archives/UX-RESP-01.md) | กรอบระบบรองรับมือถือและการวิจัยความละเอียดหน้าจอ (Responsive)   | High     | ✅ Done  |

### E4: Data Tracking & Analytics (Supabase) (P1)
| ID       | User Story                                                    | Priority | Status   |
| -------- | ------------------------------------------------------------- | -------- | -------- |
| US-E4-01 | บันทึกข้อมูลส่วนตัวและเวลาการใช้งาน Gamehub                   | High     | ✅ Done   |
| US-E4-02 | บันทึกผลการเล่นมินิเกม (Score, Time, Difficulty)              | High     | ✅ Done   |
| [US-E4-03](./user-stories/archives/US-E4-03.md) | บันทึกข้อมูลเชิงลึก (Accuracy, Reaction Time, Fatigue Effect) | Med      | ✅ Done   |
| [US-E4-04](./user-stories/archives/US-E4-04.md) | ระบบจัดเก็บบันทึกการเล่นซ้ำพฤติกรรม (Replay Event Logging)     | Med      | ✅ Done   |

### E5: Admin & Data Management (P2)
| ID       | User Story                            | Priority | Status   |
| -------- | ------------------------------------- | -------- | -------- |
| [US-E5-01](./user-stories/archives/US-E5-01.md) | ระบบ Admin Login เพื่อดูข้อมูลผู้ป่วย | Med      | ✅ Done   |
| [US-E5-02](./user-stories/archives/US-E5-02.md) | ระบบส่งออกข้อมูลเป็นไฟล์ CSV          | Low      | ✅ Done   |
| [US-E5-03](./user-stories/US-E5-03.md) | ระบบลบบัญชีและลงชื่อออก               | Low      | 🏗 In-Progress |
| [US-E5-04](./user-stories/archives/US-E5-04.md) | เครื่องมือจัดการตารางเล่นรายวัน (Daily Preset Editor)         | Med      | ✅ Done   |
| [US-E5-05](./user-stories/archives/US-E5-05.md) | เครื่องมือทดสอบเกมสแตนด์อโลน (Test Game Hub & Video Player)    | Low      | ✅ Done   |

### E6: Stabilization, Deployment & Documentation (P1)
| ID | User Story | Priority | Status |
| --- | --- | --- | --- |
| TD-E6-01 | ตรวจและแก้ branch/deploy drift ระหว่าง `staging`, `dev`, และ test VM | High | ✅ Done |
| TD-E6-02 | ป้องกัน stale leaderboard implementation (`topObserver`) กลับเข้า production build | High | ✅ Done |
| TD-E6-03 | อัปเดตเอกสารหลักให้ตรงกับ implementation ปัจจุบัน | Med | ✅ Done |
| TD-E6-04 | Smoke test Docker/nginx production image หลัง build จาก branch ที่ถูกต้อง | High | ✅ Done |
| TD-E6-05 | ตรวจ UI scroll containment สำหรับ Hub/Profile/Leaderboard ใน viewport จริง | Med | ✅ Done |

### E7: Game Art Assets & UI/UX Polish (P1)
| ID | User Story | Priority | Status |
| --- | --- | --- | --- |
| [US-E7-01](./user-stories/US-E7-01.md) | Game art assets สำหรับหน้า Leaderboard | High | 📋 Backlog |
| [US-E7-02](./user-stories/US-E7-02.md) | Game art assets สำหรับหน้า Login และ Sign-up | High | 🏗 In-Progress |
| [US-E7-03](./user-stories/US-E7-03.md) | Game art assets สำหรับหน้า Player-Info | Med | 📋 Backlog |
| [US-E7-04](./user-stories/US-E7-04.md) | Game art assets / ระบบภาพสำหรับ Popup (dialog) | Med | 📋 Backlog |
| [US-E7-05](./user-stories/US-E7-05.md) | แสดงเลขเวอร์ชันบนตัวเกมหลัก (Game Hub) และซ่อนเมื่อเข้ามินิเกม | Med | ✅ Done |
| [US-E7-06](./user-stories/US-E7-06.md) | มินิเกมรองรับการยืดแนวตั้ง (Vertical Responsive) | High | 📋 Backlog |
| [US-E7-07](./user-stories/US-E7-07.md) | ชื่อมินิเกมภาษาไทย (ปก + Gamehub) + ขยายตัวอักษรวิธีเล่น | High | 🏗 In-Progress |
| [US-E7-08](./user-stories/US-E7-08.md) | แก้คำศัพท์ยาก "สมอบก" ในเกมคำใบ้บริบท (เนื้อเรื่องกางเต็นท์) | High | 📋 Backlog |
| [US-E7-09](./user-stories/US-E7-09.md) | จดหมายจากหลานรัก — เสียง AI ใหม่/ถอดเสียง + ขยายตัวอักษรโจทย์ | Med | 📋 Backlog |
| [US-E7-10](./user-stories/US-E7-10.md) | ต้นคิดดีหลายรูปแบบ + เอฟเฟค Juicy (sparkle เริ่มแล้ว) | Med | 🏗 In-Progress |
| [US-E7-11](./user-stories/US-E7-11.md) | ละครสั้น Mood&Tone แฮปปี้ + ความถูกต้องวิดีโอ + ไปป์ไลน์ AI | Med | 📋 Backlog |
| [US-E7-12](./user-stories/US-E7-12.md) | แสดงโดเมน Cognitive ในเกม + สรุปหลังบ้านรายด้าน + เตรียมข้อมูล AI | Med | 📋 Backlog |
| [US-E7-13](./user-stories/US-E7-13.md) | เอฟเฟคฉลองหน้า "เก่งมาก!!!" (ระเบิดริปปิ้น + อนิเมชันคนแก่ดีใจ) | Med | ✅ Done |
| [US-E7-14](./user-stories/US-E7-14.md) | ปรับ Layout หน้าหลัก Game Hub (ระยะเลเวล, สลับชื่อเกม/หมวด, เงาตัวละคร) | Med | 📋 Backlog |
| [US-E7-15](./user-stories/US-E7-15.md) | ระบบสีปุ่มมาตรฐาน (เขียว = ยืนยัน, แดง = ยกเลิก) | Med | 📋 Backlog |
| [US-E7-16](./user-stories/US-E7-16.md) | แก้ Popup (ตัด popup หลังดูละคร + เข้าเกมซ้ำในวันที่เล่นจบแล้ว + เปลี่ยน emoji popup จบโปรแกรมเป็นคุณตา/ยาย) | Med | 🏗 In-Progress |
| [US-E7-17](./user-stories/US-E7-17.md) | ปรับ Boot Loading ให้ใช้โลโก้เกม + dot progress 5 จุด | Med | ✅ Done |

> ⤷ US-E7-07..13 มาจาก [Doctor Feedback — Meeting #2 (2026-06-24)](./meeting-backlogs/2026-06-24.md); US-E7-14..17 มาจาก Owner Task Block (ก้องไผ่) — ดู [Sprint 07](./sprint-backlogs/sprint-07.md)
> บั๊กที่เกี่ยวข้อง: [BUG-004](./reports/bugs/BUG-004.md), [BUG-005](./reports/bugs/BUG-005.md), [BUG-006](./reports/bugs/BUG-006.md), [BUG-007](./reports/bugs/BUG-007.md)

---

## 🔗 Related Documents
- Derived from: [Game Design Document V.1.md](../Game%20Design%20Document%20V.1.md)
- Mechanics: [Core Mechanics](../gdd/01-mechanics.md) (TBD)
- Roadmap: [Sprint Planning](./02-sprint-planning.md)

---

Back to Index: [Index](../index.md)
