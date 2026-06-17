# MCI Cognitive Games — System Design

**Version:** 1.4 | **Last Updated:** 2026-06-17

```mermaid
graph TD
    subgraph Core
        EventBus
        DB[Database & Storage]
        Session[SessionStorageManager]
        ProgramDate[ProgramDateUtil]
        Voice[VoiceService]
        DDM[DragDropManager]
    end

    subgraph AppUI
        Routes[Hash Router]
        Hub[Game Hub]
        Profile[Player Profile / CSV]
        Leaderboard
        Admin[Admin / Daily Preset Tool]
    end

    subgraph Games
        Entities
        Components
        Scenes
        UIElements
    end

    subgraph UI
        WebHUD[Web Components HUD]
        PhaserUI[Phaser UIPanel]
    end

    subgraph Utils
        ObjectPool
        Layout
        DBUtil[MiniGameDBUtil]
    end

    AppUI <--> Core
    Core <--> Games
    Core <--> UI
    Games <--> Utils
    UI <--> Utils
```

เอกสารนี้อธิบายรายละเอียดการออกแบบระบบเชิงโครงสร้าง (Subsystems) และรูปแบบการเขียนโปรแกรม (Design Patterns) ที่ใช้ในโครงการ

## 1. โครงสร้างมินิเกมมาตรฐาน (Standardized Minigame Structure)
ทุกมินิเกมจะถูกจัดเก็บภายใต้ `src/game/[game-name]/` โดยมีโครงสร้างโฟลเดอร์ที่เหมือนกันเพื่อความง่ายในการบำรุงรักษา:

- `main.js`: จุดเริ่มต้นของมินิเกม (Entry Point) ทำหน้าที่ตั้งค่า Phaser Game Config และโหลด Scenes
- `components/`: สคริปต์ตรรกะย่อยที่นำไปประกอบร่างเป็น Entity (เช่น `Clickable.js`, `Draggable.js`)
- `entity/`: วัตถุหลักในเกม (เช่น ผู้เล่น, สัตว์, ตาราง) ที่ขยายจาก Phaser Sprite และรองรับระบบ Component
- `scenes/`: ฉากต่างๆ ของ Phaser (Boot, Preloader, MainMenu, Gameplay)
- `ui-elements/`: หน้าจอ Overlay และ UI Panels ภายใน Phaser (เช่น `ResultPanel.js`)
- `constants.js`: ค่าคงที่, การตั้งค่าความยาก, และ Asset Keys (รวมถึงข้อมูลด่านในบางเกม)

---

## 2. ระบบหลัก (Core Systems)

### 2.0 App Controller & Hash Routing
`src/main.js` ทำหน้าที่เป็น application controller หลัก โดยใช้ hash route เช่น `#/login`, `#/signup`, `#/hub`, `#/leaderboard`, `#/player-info`, `#/admin-login`, `#/tools/daily-presets` และ `#/game/:gid` เพื่อสลับระหว่าง DOM screens และ Phaser game instance

หน้าที่หลัก:
- จัดการ body/app mode (`hub-mode`, `landing-mode`, `game-mode`)
- โหลดข้อมูลผู้เล่นและ session
- เตรียม game launch context ผ่าน `SessionStorageManager`
- เชื่อมต่อ Supabase ผ่าน `src/core/database.js`
- ซ่อน/แสดง game canvas และ DOM UI ตาม route

### 2.1 Entity-Component System (ECS Lite)
ในมินิเกมรุ่นใหม่ (เช่น Context Clues, Postcard Reader) มีการนำรูปแบบ ECS มาใช้เพื่อแยกตรรกะออกจากตัววัตถุ:
- **Entity**: คลาสที่ขยายจาก `Phaser.Physics.Arcade.Sprite` ทำหน้าที่เป็น Container สำหรับ Components
- **Component**: คลาสฐานสำหรับสร้าง Logic ย่อย (เช่น `Clickable`, `EmojiRenderer`, `Draggable`)
- **การใช้งาน**: `entity.addComponent(ComponentClass)`

### 2.2 UI System (Dual-Layer Architecture)
ระบบ UI ถูกแบ่งออกเป็น 2 ชั้นเพื่อให้เหมาะสมกับหน้าที่:
1. **DOM + Material Web UI**: ใช้ Vanilla JS template ร่วมกับ Material Web Components (`@material/web`) สำหรับ UI หลักภายนอกเกม เช่น Login, Signup, Game Hub, Profile, Leaderboard, Admin และ Daily Preset Tool (จัดการผ่าน `src/ui/`)
2. **Phaser UIPanel**: ใช้สำหรับ UI ภายใน Canvas ของเกม เช่น หน้าต่าง Pause หรือ Tutorial (จัดการผ่าน `src/game/common/ui/core/ui-panel-base.js`) โดยใช้ระบบ Tween และ Phaser Graphics

### 2.3 EventBus (The Bridge)
ใช้ `src/core/EventBus.js` เป็นตัวกลางในการสื่อสารระหว่างส่วนที่เป็น Web UI และ Phaser:
- **Phaser -> Web UI**: ส่งเหตุการณ์ `game-over`, `score-update`, `timer-tick`
- **Web UI -> Phaser**: ส่งเหตุการณ์ `start-game`, `pause-game`, `change-level`

### 2.4 Drag-Drop Manager
ระบบจัดการการลากวางส่วนกลาง (`src/core/drag-drop-manager.js`) ที่ช่วยให้การตรวจจับการลากวัตถุและการตรวจสอบจุดวาง (Drop Zone) เป็นไปอย่างเป็นระบบ

### 2.5 Game Hub Progression System
Game Hub (`src/ui/game-hub-screen.js`) สร้าง daily progression จากข้อมูล preset และ history:
- `buildProgramDays()` แปลงข้อมูล Supabase เป็น day sections
- `buildDayNodes()` แทรก game/rest/check-in nodes
- `getSequentialCompletedCount()` ตรวจ completion แบบลำดับ
- `bindCurrentNodeScrollController()` scroll ไปยัง node ปัจจุบันโดยแยก logic เป็น utility

### 2.6 Leaderboard System
Leaderboard (`src/ui/leaderboard-screen.js`) แสดง top players และ rank ของผู้เล่นปัจจุบัน:
- ใช้ `db.getLeaderboard({ currentHn, offset, limit })`
- ใช้ `db.getUserRank(hn)` สำหรับ bottom bar/current rank
- Database layer พยายามเรียก Edge Function ก่อน แล้ว fallback เป็น RPC/client query
- หมายเหตุ deploy: branch เก่าบางชุดเคยมี stale `topObserver`; build ปัจจุบันไม่ควรมี symbol นี้ใน `src` หรือ `dist`

### 2.7 Data Export System
Profile screen ใช้ `src/util/player-csv-export.js` เพื่อสร้างและดาวน์โหลด CSV:
- Player CSV
- Game score CSV
- Game history/check-in CSV
- รองรับ current player และ all players scope ตามสิทธิ์/flow ที่เปิดใช้

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

### 3.3 MiniGameDBUtil
ตัวช่วยในการเชื่อมต่อข้อมูลเกมจาก Phaser กลับไปยัง Database ผ่าน `sessionStorage` และ `src/core/database.js` เพื่อบันทึกคะแนนและสถานะการเล่น

### 3.4 ProgramDateUtil
`src/util/program-date-util.js` รวม logic วันที่ของโปรแกรม:
- local day start
- date key
- program day date
- program end date
- program day status
- Thai display date

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

### 4.6 Resting Point (พักยืดเส้นยืดสาย)
- ฝัง `VideoPlayer` (`src/util/video-player/`) ใน popup flow สำหรับ rest node และ check-in short-video step
- `VideoPlayer` รองรับ loading overlay, buffering feedback, read-only progress, volume/mute และ fullscreen (มี pseudo-fullscreen fallback สำหรับ iOS WebKit)
- วิดีโอสุ่มผ่าน `Database.getRandomGameVideoUrl()` ซึ่งกรองเฉพาะแถวที่ `hidden = false` ใน `game_video_list`
- บันทึก history ด้วย `REST001`
- กลับไป Game Hub หลังพักครบเงื่อนไข

### 4.7 Fry Food (ทอดอาหาร)
- Minigame แยก entry point ใน `src/game/fry-food/main.js`
- รองรับ flow ทดสอบและ launch ผ่าน route/game context

---

## 5. มาตรฐานการพัฒนา (Design Patterns)
- **Singleton Pattern**: ใช้ใน `DatabaseManager`, `StorageManager`, และ `EventBus`
- **Observer Pattern**: ใช้ในระบบ EventBus
- **State Pattern**: จัดการ Game State ภายใน Gameplay Scene (IDLE, PLAYING, EVALUATING, GAMEOVER)
- **Factory Pattern**: ใช้ใน Object Pool สำหรับการสร้างสมาชิกใหม่
- **Fallback Pattern**: Database methods ใช้ Edge Function -> RPC -> client query fallback เพื่อให้ deploy/test environment ทำงานได้แม้ backend บางส่วนยังไม่พร้อม

---

## Related Documents
- Architecture: [Concept](../gdd/00-concept.md)
- GDD Mechanics: [Mechanics](../gdd/01-mechanics.md)


---
[Back to Index](../index.md)

