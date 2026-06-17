# UI Components Documentation - MCI Cognitive Games

---

## *Document Version: 1.2*  
*Project: MCI Cognitive Games*  
*Last Updated: 2026-06-17*

## 1. UI System Overview

ระบบ UI ของโครงการแบ่งออกเป็น 2 ชั้นหลัก เพื่อรองรับความต้องการที่แตกต่างกันของหน้าจอเมนูและหน้าจอภายในเกม:

1. **DOM + Material Web UI**: จัดการ UI ที่ซับซ้อน เช่น login, signup, game hub, profile, leaderboard, admin login, daily preset tool, popup และ HUD overlay (จัดการผ่าน `src/ui/`)
2. **Phaser UIPanel**: ใช้สำหรับ UI ภายในเกม (Gameplay Overlays) เช่น หน้าต่างสรุปผล (GameOver), Tutorial, หรือปุ่มตอบคำถาม โดยใช้ `UIPanel.js` เพื่อความลื่นไหลผ่านระบบ Tween

---

## 2. Base UI Architecture

### 2.1 Abstract UIPanel
ทุก UI ภายในเกมจะสืบทอดจาก `UIPanel` ซึ่งเป็น abstract class:
- **ฟังก์ชันหลัก**: `show()`, `hide()`, `setPosition(x, y)`
- **องค์ประกอบ**: มี `background` เป็น GameObject พื้นฐาน

---

## 3. Core UI Components

### 3.0 App-Level Screens (`src/ui/`)
| Screen / Module | Description | Notes |
| :--- | :--- | :--- |
| `login-screen.js` | Patient login ด้วย HN | ถ้าไม่พบผู้เล่นจะพาไป signup |
| `signup-screen.js` | ลงทะเบียนผู้เล่นใหม่ | ใช้ phone/date/education validation |
| `game-hub-screen.js` | Daily program hub | แสดง goal, progress, node map, rest/check-in และ leaderboard FAB |
| `player-info-screen.js` | ข้อมูลผู้เล่นและ export | รองรับ CSV export และ test controls |
| `leaderboard-screen.js` | ตารางคะแนนรวม | โหลด leaderboard และ user rank |
| `admin-login-screen.js` | Admin login | สำหรับเข้าหน้าเครื่องมือ/ข้อมูลผู้ดูแล |
| `daily-preset-tool-screen.js` | Daily preset editor | จัดการ preset รายวันและ game mapping |
| `checkin-summary-screen.js` | Check-in/calendar summary | ใช้หลังจบ daily flow |
| `resting-point-popup.js` | Rest node popup | ฝัง `VideoPlayer` สำหรับขั้นตอนพักผ่อน |

### 3.0.1 VideoPlayer (`src/util/video-player/`)
Component วิดีโอแบบ self-contained ที่ฝังลงใน container ใดก็ได้ (ไม่สร้าง modal/backdrop เอง — เป็นหน้าที่ของผู้เรียก) ใช้ใน check-in short-video step และ resting point

| ความสามารถ | รายละเอียด |
| :--- | :--- |
| ไม่มี native controls | ป้องกันการ seek/ข้ามวิดีโอ; เล่น/หยุดด้วยการแตะที่ผิวจอ |
| Loading overlay | แสดง `md-circular-progress` ขณะโหลดจนกว่าวิดีโอจะ `canplay`/`playing` |
| Buffering feedback | event `waiting`/`stalled` ระหว่างเล่นจะแสดง loading overlay อีกครั้ง |
| Read-only progress bar | `md-linear-progress` แสดงความคืบหน้า (pointer-events: none) |
| Volume / mute | ปุ่ม mute toggle พร้อมไอคอนตามระดับเสียง; sync ได้ผ่าน `VideoManager` |
| Fullscreen toggle | ใช้ Fullscreen API; fallback เป็น pseudo-fullscreen (CSS) บน iOS WebKit |
| Events | `play`, `pause`, `ended`, `progress`, `volume-changed`, `mute-changed`, `destroy` |

API หลัก: `VideoPlayer.mount(container, { src, label })`, `play()`, `pause()`, `replay()`, `setVolume()`, `setMuted()`, `on(event, cb)`, `destroy()`

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
การสื่อสารระหว่าง DOM UI และ Phaser Gameplay ทำผ่าน `src/core/EventBus.js`:
- **จาก DOM UI -> Phaser**: เช่น launch game context, hide/show HUD, navigation state
- **จาก Phaser -> DOM UI**: เช่น game completion, score update, timer tick, result summary

## 6. Layout Rules for Current UI
- App-level screens should lock viewport height and scroll only their intended content region
- Game Hub and Leaderboard must keep FAB/topbar/bottom bar independent from scroll content
- Before UI edits, read [UX/UI Guidelines](../wiki/guidelines/ux-ui-guidelines.md)
- Use Material Symbols / Material Web components consistently for icon buttons, FABs, progress and form controls

---

## 6. Implementation Reference
- [System Design](01-system-design.md)
- [Class Diagram](02-class-diagram.md)

---
[Back to Index](../index.md)
