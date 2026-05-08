# MCI Cognitive Games — System Design

**Version:** 1.1 | **Last Updated:** 2026-05-03

```mermaid
graph TD
    subgraph Core
        EventBus
        DB[Database & Storage]
        Voice[VoiceService]
    end

    subgraph Games
        Entities
        Components
        Scenes
        UIElements
    end

    subgraph UI
        ReactHUD
        PhaserUI[Phaser UIPanel]
    end

    subgraph Utils
        ObjectPool
        Layout
    end

    Core <--> Games
    Core <--> UI
    Games <--> Utils
```

เอกสารนี้อธิบายรายละเอียดการออกแบบระบบเชิงโครงสร้าง (Subsystems) และรูปแบบการเขียนโปรแกรม (Design Patterns) ที่ใช้ในโครงการ

## 1. โครงสร้างมินิเกมมาตรฐาน (Standardized Minigame Structure)
ทุกมินิเกมจะถูกจัดเก็บภายใต้ `src/game/[game-name]/` โดยมีโครงสร้างโฟลเดอร์ที่เหมือนกันเพื่อความง่ายในการบำรุงรักษา:

- `components/`: สคริปต์ตรรกะย่อยที่นำไปประกอบร่างเป็น Entity
- `entity/`: วัตถุหลักในเกม (เช่น ผู้เล่น, สัตว์, ตาราง)
- `scenes/`: ฉากต่างๆ ของ Phaser (Boot, Preloader, MainMenu, Gameplay)
- `ui-elements/`: หน้าจอ Overlay และ UI Panels ภายใน Phaser
- `data/`: (ถ้ามี) โครงสร้างข้อมูลเฉพาะของเกมนั้นๆ
- `constants.js`: ค่าคงที่, การตั้งค่าความยาก, และ Asset Keys

---

## 2. ระบบหลัก (Core Systems)

### 2.1 Entity-Component System (ECS Lite)
ในมินิเกมรุ่นใหม่ (เช่น Context Clues, Postcard Reader) มีการนำรูปแบบ ECS มาใช้เพื่อแยกตรรกะออกจากตัววัตถุ:
- **Entity**: คลาสที่ขยายจาก `Phaser.Physics.Arcade.Sprite` ทำหน้าที่เป็น Container สำหรับ Components
- **Component**: คลาสฐานสำหรับสร้าง Logic ย่อย (เช่น `Clickable`, `EmojiRenderer`, `Draggable`)
- **การใช้งาน**: `entity.addComponent(ComponentClass)`

### 2.2 UI System (UIPanel Architecture)
ระบบ UI ถูกแบ่งออกเป็น 2 ชั้น:
1. **React HUD**: ใช้สำหรับ UI ที่ซับซ้อน เช่น แถบคะแนนด้านบน หรือปุ่มเมนูหลัก (จัดการผ่าน `src/ui/`)
2. **Phaser UIPanel**: ใช้สำหรับ UI ภายในเกม เช่น หน้าต่างสรุปผล (GameOver) หรือ Tutorial (จัดการผ่าน `UIPanel.js`) โดยใช้ระบบ Tween เพื่อความลื่นไหล

### 2.3 EventBus (The Bridge)
ใช้ `src/core/EventBus.js` เป็นตัวกลางในการสื่อสารระหว่าง React และ Phaser:
- **Phaser -> React**: ส่งเหตุการณ์ `game-over`, `score-update`, `timer-tick`
- **React -> Phaser**: ส่งเหตุการณ์ `start-game`, `pause-game`, `change-level`

---

## 3. ระบบสนับสนุนทั่วไป (Common Utilities)

### 3.1 Object Pooling
ใช้เพื่อเพิ่มประสิทธิภาพโดยการนำวัตถุกลับมาใช้ใหม่ ลดภาระของ Garbage Collector:
- **BaseObjectPool**: คลาสแม่สำหรับจัดการกลุ่มวัตถุ
- **ArcadeObjectPool**: ปรับแต่งมาเพื่อใช้งานร่วมกับฟิสิกส์ของ Phaser Arcade

### 3.2 Layout Management
จัดการการจัดวางตำแหน่งที่รองรับความละเอียดหน้าจอที่หลากหลาย:
- **SquareGridLayout**: จัดวางวัตถุในรูปแบบตาราง (ใช้ใน Zoo Detective)
- **AnimalIconTray**: จัดวางไอคอนสัตว์แบบ Grid ที่ปรับขนาดอัตโนมัติ
- **ProgressBar**: แถบแสดงความก้าวหน้า (Linear หรือ Circular)

---

## 4. รายละเอียด Subsystems รายเกม

### 4.1 Zoo Detective (นักสืบสวนสัตว์)
- `RandomPuzzle`: ระบบ Generate ปริศนาและคำใบ้ตามระดับความยาก
- `HintLineViewer`: แสดงคำใบ้ทีละขั้นตอนพร้อมสถานะการตรวจสอบ
- `SquareGridLayout`: จัดการการโต้ตอบกับช่องตารางและการวางสัตว์

### 4.2 Zoo Feeder (คนเลี้ยงสัตว์)
- `ConveyorManager`: จัดการความเร็วและทิศทางของสายพานลำเลียง
- `Spawner`: สุ่มการเกิดของสัตว์และอาหารโดยใช้ Object Pooling
- `Clickable Component`: จัดการการคลิกให้อาหาร

### 4.3 Context Clues (คำใบ้บริบท)
- `RandomQuiz`: ดึงข้อมูลโจทย์จาก `QuizGameData` และสุ่มลำดับ
- `EmojiRenderer`: จัดการการแสดงผลอิโมจิขนาดใหญ่ในตัวเลือก
- `TriggerListener`: ตรวจสอบเงื่อนไขการเลือกคำตอบ

### 4.4 Symmetry Decor (ตกแต่งสมมาตร)
- `EntityGrid`: ระบบตารางที่รองรับการสะท้อน (Mirroring) ของแกนสมมาตร
- `Draggable/Socket`: ระบบลากวางวัตถุและตรวจสอบจุดติดตั้งที่ถูกต้อง

### 4.5 Postcard Reader (ผู้อ่านไปรษณีย์)
- `PostcardPanel`: จัดการการแสดงผลข้อความและรูปภาพในไปรษณีย์
- `ProgressBar`: แสดงเวลาที่เหลือในการจดจำเนื้อหา
- `VoiceService`: ระบบอ่านออกเสียงภาษาไทยอัตโนมัติเพื่อเพิ่มประสิทธิภาพการจดจำ

---

## 5. มาตรฐานการพัฒนา (Design Patterns)
- **Singleton Pattern**: ใช้ใน `DatabaseManager`, `StorageManager`, และ `EventBus`
- **Observer Pattern**: ใช้ในระบบ EventBus
- **State Pattern**: จัดการ Game State ภายใน Gameplay Scene (IDLE, PLAYING, EVALUATING, GAMEOVER)
- **Factory Pattern**: ใช้ใน Object Pool สำหรับการสร้างสมาชิกใหม่

---

## Related Documents
- Architecture: [Concept](../gdd/00-concept.md)
- GDD Mechanics: [Mechanics](../gdd/01-mechanics.md)


---
[Back to Index](../index.md)


