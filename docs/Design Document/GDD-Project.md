# Game Design Document (GDD) - MCI Cognitive Games

**Project:** MCI Cognitive Games (โปรเจกต์เกมฝึกสมองสำหรับผู้ป่วย MCI)
**Version:** 1.0
**Status:** Draft
**Last Updated:** 2026-04-21

\---

## 1\. Game Overview

### 1.1 High-Level Concept

MCI Cognitive Games เป็นแพลตฟอร์มเกมเว็บที่รวบรวมเกมฝึกสมอง 5 เกมย่อยสำหรับผู้ป่วย MCI (Mild Cognitive Impairment) และผู้สูงอายุ เพื่อช่วยพัฒนาความจำ การคิดวิเคราะห์ และทักษะทางปัญญา

### 1.2 Project Type

* **Framework:** Phaser 3.90.0
* **Build Tool:** Vite 6.3.1
* **Language:** JavaScript (ES Modules)
* **Backend:** Supabase (Database \& Authentication)
* **UI Framework:** Material UI (@mui/material)
* **i18n:** @koreez/phaser3-i18n

### 1.3 Target Audience

* ผู้ป่วย MCI (Mild Cognitive Impairment)
* ผู้สูงอายุ
* นักกายภาพบำบัด/นักเวชศาสตร์ฟื้นฟู

### 1.4 Game Collection (5 Mini-Games)

|#|Game Name|Thai Name|Genre|Core Skill|
|-|-|-|-|-|
|1|Zoo Detective|นักสืบสวนสัตว์|Logic Puzzle|การคิดวิเคราะห์, การจำแนกสัตว์|
|2|Zoo Feeder|คนเลี้ยงสัตว์|Simulation/Resource Management|การจัดการทรัพยากร, การตัดสินใจ|
|3|Context Clues|คำใบ้บริบท|Word Puzzle|ความจำ, การเข้าใจภาษา|
|4|Symmetry Decor|ตกแต่งสมมาตร|Visual/Design|การรับรู้เชิงพื้นที่, Fine Motor|
|5|Postcard Reader|ผู้อ่านไปรษณีย์|Reading Comprehension|ความจำ, การอ่านเข้าใจ|

\---

## 2\. Gameplay \& Mechanics

### 2.1 Core Loop ของแต่ละเกม

#### 2.1.1 Zoo Detective

1. ระบบนำเสนอฉากและรายการคำใบ้
2. ผู้เล่นเลือกสัตว์และวางลงในตารางปริศนา
3. ระบบตรวจสอบความถูกต้องทันที
4. จบตาเมื่อจัดวางสัตว์ถูกต้องทั้งหมด

**Controls:** Click/Tap เลือกและวางสัตว์

#### 2.1.2 Zoo Feeder

1. ระบบเริ่มส่งสัตว์และอาหารบนสายพานลำเลียง
2. ผู้เล่นให้อาหารที่ถูกต้องแก่สัตว์
3. ระบบตรวจสอบความเหมาะสมของอาหาร
4. จบเกมเมื่อทำภารกิจสำเร็จหรือหมดเวลา

**Controls:** Click/Tap บนอาหารเพื่อให้สัตว์

#### 2.1.3 Context Clues

1. ระบบแสดงประโยคที่มีคำว่าง
2. ผู้เล่นเลือกคำที่เหมาะสมจากตัวเลือก
3. ระบบตรวจสอบความถูกต้อง
4. คะแนน +20 ถ้าถูก, -5 ถ้าผิด

**Controls:** Click/Tap เลือกคำตอบ

#### 2.1.4 Symmetry Decor

1. ระบบแสดงพื้นที่ทำงานพร้อมแกนสมมาตร
2. ผู้เล่นลากองค์ประกอบวางในฝั่งหนึ่ง
3. ระบบสะท้อนไปยังอีกฝั่งอัตโนมัติ
4. ประเมินผลเมื่อตกแต่งเสร็จ

**Controls:** Drag \& Drop องค์ประกอบ

#### 2.1.5 Postcard Reader

1. ระบบแสดงไปรษณีย์
2. ผู้เล่นอ่านและจดจำเนื้อหา
3. ระบบถามคำถามจากเนื้อหา
4. ผู้เล่นเลือกคำตอบที่ถูกต้อง

**Controls:** Click/Tap เลือกคำตอบ

### 2.2 ระบบ Difficulty

ทุกเกมมี 3 ระดับความยาก:

* **Easy:** 10 รอบ, คะแนน +15-20, หัก -5
* **Medium:** 10 รอบ, คะแนน +16-20, หัก -6
* **Hard:** 10 รอบ, คะแนน +17-20, หัก -7

### 2.3 Data Structures

#### ข้อมูลสัตว์ (Zoo Detective/Zoo Feeder)

```javascript
const DefaultAnimals = \[
    { id: "lion", icon: "🦁" },
    { id: "elephant", icon: "🐘" },
    { id: "giraffe", icon: "🦒" },
    // ... 15 ชนิด
];
```

#### ประเภทอาหาร

```javascript
const FoodTypes = {
    VEGETABLE: 'Vegetable',  // ผัก - สัตว์กินผัก
    MEAT: 'Meat',            // เนื้อ - สัตว์กินเนื้อ
    JUNK: 'Junk'            // ของที่ไม่ควรให้
};
```

\---

## 3\. Story \& Setting

### 3.1 World/Theme

ธีม "สวนสัตว์" และ "ชีวิตประจำวัน" เพื่อให้ผู้เล่นสูงอายุรู้สึกคุ้นเคยและสนุก

### 3.2 Visual Style

* **Art Direction:** สไตล์ Emoji/Icon ที่ใช้งานง่าย
* **UI:** Material Design สำหรับหน้าจอ Login/Signup/GameHub
* **In-Game:** ใช้ Emoji เป็นตัวแทนสัตว์และอาหาร (🦁🐘🍎🐟)
* **Color Scheme:** สีสดใส, High Contrast สำหรับผู้สูงอายุ
* **Font:** รองรับภาษาไทย (Thai Text)

### 3.3 Language Support

* ภาษาไทยเป็นหลัก
* ระบบ i18n สำหรับขยายในอนาคต

\---

## 4\. Assets \& Audio

### 4.1 Graphics

* **Assets Location:** `public/assets/`
* **Game Assets:** Emoji-based sprites (ไม่ต้องใช้ไฟล์ภาพ)
* **UI Elements:** SVG/Material Icons

### 4.2 Audio

* **Requirements:** Sound effects สำหรับ:

  * การคลิก/แตะ
  * คะแนนถูก/ผิด
  * เสียงตัวละคร (ถ้ามี)
  * BGM พื้นหลัง (Optional)

### 4.3 Technical Requirements

* รองรับ Responsive (Desktop/Tablet)
* รองรับ Touch Input
* Object Pooling สำหรับ Performance

\---

## 5\. Technical Architecture

### 5.1 Project Structure

```
src/
├── core/                    # Core systems
│   ├── database.js          # Supabase interaction
│   ├── storage-manager.js   # Local storage
│   └── drag-drop-manager.js
├── game/
│   ├── zoo-detective/       # Game 1
│   ├── zoo-feeder/          # Game 2
│   ├── context-clues/       # Game 3
│   ├── symmetry-decor/      # Game 4
│   └── postcard-reader/     # Game 5
├── ui/                      # React/Material UI screens
│   ├── login-screen.js
│   ├── signup-screen.js
│   └── game-hub-screen.js
└── util/                    # Utilities
    ├── layout/
    ├── object-pool/
    └── thai-text.js
```

### 5.2 Database Schema (Supabase)

**Tables:**

* `user\_patient\_data` - ข้อมูลผู้ป่วย
* `game\_list\_data` - รายการเกม
* `user\_game\_data` - คะแนนการเล่น
* `user\_event\_log` - บันทึกเหตุการณ์

### 5.3 Game Entry Point

แต่ละเกมมี `main.js` และ Scenes:

* `Boot.js` - เริ่มต้น
* `Preloader.js` - โหลดทรัพยากร
* `MainMenu.js` - เมนูหลัก
* `Gameplay.js` - หน้าเล่นเกม

\---

## 6\. Development Guidelines

### 6.1 Commands

```bash
npm install       # ติดตั้ง dependencies
npm run dev       # Development server
npm run build      # Production build
npm run dev-nolog  # Dev without logging
npm run build-nolog # Build without logging
```

### 6.2 Key Patterns

* Scene-based architecture
* Centralized state management
* Object pooling for performance
* Component-based entity system

\---

## 7\. Appendix: Game-Specific Details

### 7.1 Zoo Detective

* **Grid Size:** 2x2 (Easy), 2x3 (Medium), 3x3 (Hard)
* **Animals:** 15 ชนิด
* **Logic:** ใช้คำใบ้เกี่ยวกับตำแหน่งและความสัมพันธ์

### 7.2 Zoo Feeder

* **Conveyor Belt:** สายพานลำเลียงอาหารและสัตว์
* **Food Types:** ผัก, เนื้อ, ของที่ไม่ดี

### 7.3 Context Clues

* **Easy:** ประโยคง่าย, คำตอบเดียว
* **Medium:** ประโยคซับซ้อนขึ้น
* **Hard:** 2 คำตอบต่อข้อ

### 7.4 Symmetry Decor

* **Mirror System:** สะท้อนองค์ประกอบข้ามแกน
* **Placement:** Drag \& Drop

### 7.5 Postcard Reader

* **Easy:** ไปรษณีย์สั้น, 2 คำถาม
* **Normal:** ไปรษณีย์ยาวขึ้น, เนื้อหาซับซ้อน
* **Hard:** เนื้อหายาวมาก, ต้องจำรายละเอียด

---

## 8. Traceability Matrix (Design to Progress)

| Game / Module | Design Doc (GDD) | Related User Stories |
| :--- | :--- | :--- |
| **Zoo Detective** | [[gdd_zoo_detective]] | [[US-E1-01]], [[US-E1-02]] |
| **Zoo Feeder** | [[gdd_zoo_feeder]] | [[US-E1-03]], [[US-E1-04]] |
| **Context Clues** | [[gdd_zoo_detective|Wiki-ContextClues]] | [[US-E1-05]], [[US-E1-06]] |
| **Symmetry Decor** | [[gdd_symmetry_decor]] | [[US-E1-07]] |
| **Postcard Reader** | [[gdd_symmetry_decor|Wiki-Postcard]] | [[US-E1-08]] |
| **Database System** | [[DatabaseSchema-Project]] | [[US-E2-01]], [[US-E2-02]], [[US-E2-03]] |
| **UI & Accessibility** | [[ClassDiagram-Project]] | [[US-E3-01]], [[US-E3-02]] |

\---

*End of GDD*

