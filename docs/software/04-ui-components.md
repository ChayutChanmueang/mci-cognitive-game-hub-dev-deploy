# UI Components Documentation - MCI Cognitive Games

---

## *Document Version: 1.0*  
*Project: MCI Cognitive Games*  
*Last Updated: 2026-05-03*

## 1. UI System Overview

ระบบ UI ของโครงการแบ่งออกเป็น 2 ชั้นหลัก เพื่อรองรับความต้องการที่แตกต่างกันของหน้าจอเมนูและหน้าจอภายในเกม:

1. **React HUD**: จัดการ UI ที่ซับซ้อน เช่น แถบคะแนนด้านบน หรือปุ่มเมนูหลัก (จัดการผ่าน `src/ui/`)
2. **Phaser UIPanel**: ใช้สำหรับ UI ภายในเกม (Gameplay Overlays) เช่น หน้าต่างสรุปผล (GameOver), Tutorial, หรือปุ่มตอบคำถาม โดยใช้ `UIPanel.js` เพื่อความลื่นไหลผ่านระบบ Tween

---

## 2. Base UI Architecture

### 2.1 Abstract UIPanel
ทุก UI ภายในเกมจะสืบทอดจาก `UIPanel` ซึ่งเป็น abstract class:
- **ฟังก์ชันหลัก**: `show()`, `hide()`, `setPosition(x, y)`
- **องค์ประกอบ**: มี `background` เป็น GameObject พื้นฐาน

---

## 3. Core UI Components

### 3.1 Panels
| Component | Description | Usage |
| :--- | :--- | :--- |
| `GameOverPanel` | แสดงคะแนนสรุปเมื่อจบเกม | แสดงผลคะแนนและปุ่มนำทาง (Home, Restart) |
| `TutorialPanel` | แสดงขั้นตอนการเล่น | ใช้สำหรับแนะนำผู้เล่นก่อนเริ่มเกม (steps) |
| `NextQuizPanel` | หน้าจอยืนยันเพื่อไปข้อถัดไป | ใช้ในเกมแนว Quiz เช่น Context Clues |

### 3.2 UI Elements
| Component | Description | Usage |
| :--- | :--- | :--- |
| `Button` | ปุ่มกดมาตรฐาน | รองรับ text, สถานะ enable/disable, และ callback |
| `ProgressBar` | แถบแสดงความคืบหน้า | รองรับการเปลี่ยนค่าผ่าน `setValue` และ `animateTo` |
| `DotProgressBar` | แถบความคืบหน้าแบบจุด | ใช้ในส่วนแสดงความคืบหน้าของเกม (UI-element) |

---

## 4. UI Layout & Utilities

### 4.1 Layout Management
- **SquareGridLayout**: จัดวางวัตถุในรูปแบบตาราง (ใช้ใน Zoo Detective เพื่อจัดการตำแหน่งช่องตาราง)
- **AnimalIconTray**: จัดวางไอคอนสัตว์แบบ Grid ที่ปรับขนาดอัตโนมัติ

---

## 5. Event Communication (EventBus)
การสื่อสารระหว่าง React UI และ Phaser Gameplay ทำผ่าน `src/core/EventBus.js`:
- **จาก React -> Phaser**: เช่น `start-game`, `pause-game`, `change-level`
- **จาก Phaser -> React**: เช่น `game-over`, `score-update`, `timer-tick`

---

## 6. Implementation Reference
- [System Design](01-system-design.md)
- [Class Diagram](02-class-diagram.md)

---
[Back to Index](../index.md)
