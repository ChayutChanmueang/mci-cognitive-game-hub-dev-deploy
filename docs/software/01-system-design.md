# MCI Cognitive Games — System Design

**Version:** 1.0 | **Last Updated:** 2026-05-02

## Mini-Game Subsystems
ทุกเกมจะถูกโครงสร้างในลักษณะเดียวกันภายใต้โฟลเดอร์ `src/game/[game-name]/` โดยประกอบด้วย Scenes สำคัญดังนี้:

### Scene Lifecycle
1. **Boot Scene:** กำหนดค่าเริ่มต้นของระบบ
2. **Preloader Scene:** โหลด Assets (Emoji, Sound, etc.)
3. **MainMenu Scene:** หน้าจอเริ่มต้นและคำแนะนำการเล่น (Tutorial)
4. **Gameplay Scene:** หัวใจหลักของเกม จัดการ Logic และ Input
5. **GameOver Scene:** สรุปผลและบันทึกคะแนน

### Subsystem Breakdown
- **Zoo Detective System:**
  - `GridGenerator`: สร้างตารางปริศนาตามระดับความยาก
  - `HintSystem`: สุ่มคำใบ้ที่สัมพันธ์กับตาราง
- **Zoo Feeder System:**
  - `ConveyorManager`: จัดการการเคลื่อนที่ของสายพาน
  - `Spawner`: สุ่มสัตว์และอาหาร
- **Context Clues System:**
  - `ThaiTextLoader`: โหลดข้อมูลโจทย์ภาษาไทย
  - `ScoreCalculator`: คำนวณคะแนนตามเวลาและความถูกต้อง

## Key Design Patterns
- **Object Pooling:** ใช้ใน Zoo Feeder สำหรับสัตว์และอาหารบนสายพาน เพื่อลด Garbage Collection
- **State Pattern:** ใช้จัดการสถานะของเกม (Playing, Paused, GameOver)
- **Singleton:** สำหรับ Database Manager และ Storage Manager

## Related Documents
- Architecture: [[../gdd/00-concept.md]]
- GDD Mechanics: [[../gdd/01-mechanics.md]]
