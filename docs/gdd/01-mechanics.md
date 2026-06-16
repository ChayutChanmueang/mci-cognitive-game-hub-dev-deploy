# MCI Cognitive Games — Core Mechanics

**Version:** 1.1 | **Last Updated:** 2026-06-16

## Program-Level Core Loop
1. ผู้เล่นเข้าสู่ระบบด้วยหมายเลข HN หรือสมัครผู้เล่นใหม่
2. Game Hub โหลดโปรแกรมรายวันจาก Supabase และแสดง node ที่เล่นได้ตามวันที่/ประวัติ
3. ผู้เล่นเล่นมินิเกมตามลำดับที่กำหนดใน daily preset
4. ระบบบันทึกคะแนน เวลา stage/level และประวัติการเล่นลง Supabase
5. เมื่อเล่นครบวัน ระบบแสดง rest/check-in/completion flow และอัปเดตความคืบหน้า
6. ผู้เล่นหรือผู้ดูแลสามารถดูข้อมูล profile, leaderboard และ export CSV ได้

## Core Loop ของแต่ละเกม

### 2.1.1 Zoo Detective (นักสืบสวนสัตว์)
1. ระบบนำเสนอฉากและรายการคำใบ้ (Hints)
2. ผู้เล่นเลือกสัตว์และวางลงในตารางปริศนา (Grid)
3. ระบบตรวจสอบความถูกต้องทันที (Real-time Feedback)
4. จบตาเมื่อจัดวางสัตว์ถูกต้องทั้งหมด

**Controls:** Click/Tap เลือกและวางสัตว์
**Difficulty Levels:**
- **Easy:** ตาราง 2x2
- **Medium:** ตาราง 2x3
- **Hard:** ตาราง 3x3

---

### 2.1.2 Zoo Feeder (คนเลี้ยงสัตว์)
1. ระบบเริ่มส่งสัตว์และอาหารบนสายพานลำเลียง (Conveyor Belt)
2. ผู้เล่นให้อาหารที่ถูกต้องแก่สัตว์ที่ปรากฏ
3. ระบบตรวจสอบความเหมาะสมของอาหาร (Herbivore/Carnivore/Junk)
4. จบเกมเมื่อทำภารกิจสำเร็จหรือหมดเวลา

**Controls:** Click/Tap บนอาหารเพื่อให้สัตว์
**Food Types:**
- VEGETABLE: ผัก - สำหรับสัตว์กินผัก
- MEAT: เนื้อ - สำหรับสัตว์กินเนื้อ
- JUNK: ของที่ไม่ควรให้ (ห้ามคลิก)

---

### 2.1.3 Context Clues (คำใบ้บริบท)
1. ระบบแสดงประโยคที่มีช่องว่าง
2. ผู้เล่นเลือกคำที่เหมาะสมจากตัวเลือกภาษาไทย
3. ระบบตรวจสอบความถูกต้อง
4. คะแนน +20 ถ้าถูก, -5 ถ้าผิด

**Controls:** Click/Tap เลือกคำตอบ

---

### 2.1.4 Symmetry Decor (ตกแต่งสมมาตร)
1. ระบบแสดงพื้นที่ทำงานพร้อมแกนสมมาตร
2. ผู้เล่นลากองค์ประกอบวางในฝั่งหนึ่ง
3. ระบบสะท้อน (Mirror) ไปยังอีกฝั่งอัตโนมัติ
4. ประเมินผลเมื่อตกแต่งเสร็จ

**Controls:** Drag & Drop องค์ประกอบ

---

### 2.1.5 Postcard Reader (ผู้อ่านไปรษณีย์)
1. ระบบแสดงไปรษณีย์ (Text & Visual)
2. ผู้เล่นอ่านและจดจำเนื้อหา
3. ระบบถามคำถามจากเนื้อหาที่เพิ่งอ่าน
4. ผู้เล่นเลือกคำตอบที่ถูกต้อง

**Controls:** Click/Tap เลือกคำตอบ

---

### 2.1.6 Resting Point (พักยืดเส้นยืดสาย)
1. ระบบเปิดกิจกรรมพักเมื่อผู้เล่นถึง rest node ใน Game Hub
2. เล่นวิดีโอหรือคำแนะนำการพักสายตา/ยืดเส้น
3. เมื่อครบเวลา ระบบบันทึกประวัติ rest node แล้วกลับไปยัง Game Hub

**Controls:** ดูวิดีโอ/กดดำเนินการต่อเมื่อครบเงื่อนไข

---

### 2.1.7 Fry Food (ทอดอาหาร)
1. ระบบนำเสนอภารกิจทอดอาหารและเงื่อนไขการควบคุม
2. ผู้เล่นควบคุมด้วยการสัมผัสหรือ sensor ตามอุปกรณ์
3. ระบบประเมินจังหวะ/ความแม่นยำและบันทึกคะแนน

**Controls:** Touch / device motion ตาม platform ที่รองรับ

---

## Game Hub & Progression Mechanics
- **Daily Program:** โปรแกรมรายวันประกอบด้วย game nodes, rest node และ check-in node
- **Sequential Completion:** ผู้เล่นต้องเล่น node ตามลำดับ และระบบใช้ `user_game_history` ตรวจว่าจบจริงหรือไม่
- **Date Gate:** วันเล่นคำนวณจาก `started_program`, local day และจำนวนวันของ preset
- **Rest Node:** แทรกระหว่างชุดเกมเพื่อพักสายตาและลดความล้า
- **Check-in Node:** ปิดรอบวันและใช้สร้าง calendar/progress summary
- **Leaderboard:** แสดงคะแนนรวมของผู้เล่น โดยโหลด top players และ rank ของผู้เล่นปัจจุบันจาก Supabase/Edge/RPC fallback
- **Profile Export:** ผู้เล่น/ผู้ดูแลสามารถ export player, game score และ game history เป็น CSV

## ระบบคะแนนและความยาก (General Systems)
เกมหลักมีระดับความยากตาม preset/stage:
- **Easy:** 10 รอบ, คะแนน +15-20, หัก -5
- **Medium:** 10 รอบ, คะแนน +16-20, หัก -6
- **Hard:** 10 รอบ, คะแนน +17-20, หัก -7

Daily preset สามารถกำหนด `gid`, `stage`, `level`, `day`, `loop`, และ `goal` เพื่อปรับลำดับและน้ำหนักการฝึกได้

## Win / Lose Conditions
- **Win:** เล่นครบจำนวนรอบที่กำหนด
- **Lose:** HP หมด (ในบางเกมที่มีระบบหัวใจ) หรือเวลาหมด
- **Program Day Complete:** node ทั้งหมดของวันนั้นถูกบันทึกครบตามลำดับ รวมถึง rest/check-in ถ้ามี

## Linked Software Design
- Subsystems: [System Design](../software/01-system-design.md)
- Architecture: [Concept](../gdd/00-concept.md)

---
[Back to Index](../index.md)
