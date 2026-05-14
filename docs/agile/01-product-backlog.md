# Product Backlog & Epics - MCI Cognitive Games

---

## 🎯 Product Vision
"สร้างแอปพลิเคชันเกมฝึกทักษะทางปัญญา (Cognitive Training) ที่สนุก เข้าถึงง่าย และสามารถติดตามผลการพัฒนาของผู้ป่วยภาวะสมองเสื่อมระยะเริ่มต้น (MCI) ได้อย่างแม่นยำ ผ่านระบบ Gamification 14 วัน"

---

## 🏆 Epics Breakdown

### E1: User Management & Authentication (P0)
| ID                                     | User Story                                                    | Priority | Status   |
| -------------------------------------- | ------------------------------------------------------------- | -------- | -------- |
| [US-E1-01](./user-stories/US-E1-01.md) | เข้าใช้งานระบบด้วยรหัส HN (Hospital Number)                   | High     | ✅ Done   |
| [US-E1-02](./user-stories/US-E1-02.md) | ลงทะเบียนผู้ใช้ใหม่ (ชื่อ, วันเกิด, อายุ, เพศ, ระดับการศึกษา) | High     | 🏗 To Do |
| [US-E1-03](./user-stories/US-E1-03.md) | ระบบคำนวณวันที่สิ้นสุดโปรแกรมอัตโนมัติ (14 วัน)               | Med      | 🏗 To Do |

### E2: Core Gamehub & Progression System (P0)
| ID       | User Story                                                         | Priority | Status   |
| -------- | ------------------------------------------------------------------ | -------- | -------- |
| [US-E2-01](./user-stories/US-E2-01.md) | หน้า Gamehub รวมฟีเจอร์หลัก (ข้อมูลผู้เล่น, เป้าหมาย, ความคืบหน้า) | High     | ✅ Done   |
| [US-E2-02](./user-stories/US-E2-02.md) | ระบบแผนที่ด่าน (Level Progression) แบบล็อคด่านตามวันที่            | High     | 🏗 To Do |
| [US-E2-03](./user-stories/US-E2-03.md) | ระบบ Daily Goal (ความคืบหน้า 10 ด่านในแต่ละวัน)                    | High     | 🏗 To Do |
| [US-E2-04](./user-stories/US-E2-04.md) | ระบบ Daily Streak (ติดตามการเล่นติดต่อกัน 14 วัน)                  | Med      | 🏗 To Do |
| [US-E2-05](./user-stories/US-E2-05.md) | ด่านจุดพัก (Rest Level) มินิเกมยืดเส้นยืดสาย                       | Low      | 🏗 To Do |
| [US-E2-06](./user-stories/US-E2-06.md) | ด่านเส้นชัย (Finish Level) เช็คชื่อและแสดงความยินดี                | High     | 🏗 To Do |

### E3: Cognitive Games Implementation (P1)
| ID       | User Story                                                     | Priority | Status  |
| -------- | -------------------------------------------------------------- | -------- | ------- |
| US-E3-01 | เกม Zoo Detective (การคิดวิเคราะห์/Executive)                  | High     | ✅ Done  |
| US-E3-02 | เกม Zoo Feeder (ความจดจ่อ/Attention)                           | High     | ✅ Done  |
| US-E3-03 | เกม Context Clues (คำศัพท์/Language)                           | High     | ✅ Done  |
| US-E3-04 | เกม Symmetry Decor (มิติสัมพันธ์/Visuospatial)                 | Med      | ✅ Done  |
| US-E3-05 | เกม Postcard Reader (ความจำระยะสั้น/Memory)                    | Med      | ✅ Done  |
| US-E3-06 | เกมจำสัตว์ (ความจำขณะทำงาน/Working Memory) - ระบบคำถามคั่นเวลา | Low      | ❌ To Do |

### E4: Data Tracking & Analytics (Supabase) (P1)
| ID       | User Story                                                    | Priority | Status   |
| -------- | ------------------------------------------------------------- | -------- | -------- |
| US-E4-01 | บันทึกข้อมูลส่วนตัวและเวลาการใช้งาน Gamehub                   | High     | ✅ Done   |
| US-E4-02 | บันทึกผลการเล่นมินิเกม (Score, Time, Difficulty)              | High     | ✅ Done   |
| US-E4-03 | บันทึกข้อมูลเชิงลึก (Accuracy, Reaction Time, Fatigue Effect) | Med      | 🏗 To Do |

### E5: Admin & Data Management (P2)
| ID       | User Story                            | Priority | Status   |
| -------- | ------------------------------------- | -------- | -------- |
| US-E5-01 | ระบบ Admin Login เพื่อดูข้อมูลผู้ป่วย | Med      | 🏗 To Do |
| US-E5-02 | ระบบส่งออกข้อมูลเป็นไฟล์ CSV          | Low      | 🏗 To Do |
| US-E5-03 | ระบบลบบัญชีและลงชื่อออก               | Low      | 🏗 To Do |

---

## 🔗 Related Documents
- Derived from: [Game Design Document V.1.md](../Game%20Design%20Document%20V.1.md)
- Mechanics: [Core Mechanics](../gdd/01-mechanics.md) (TBD)
- Roadmap: [Sprint Planning](./02-sprint-planning.md)

---

Back to Index: [Index](../index.md)