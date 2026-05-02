# 🧩 Detail Design: Procedural Generation System (Zoo Detective)

## 📄 Overview
ระบบ **Procedural Generation** ของ Zoo Detective รับผิดชอบในการสร้างปริศนาตรรกะแบบสุ่มที่มีคำตอบเดียว (Unique Solution) โดยใช้ความสัมพันธ์เชิงพื้นที่ (Spatial Relations) เป็นเงื่อนไขหลัก ระบบนี้ถูกออกแบบมาให้สามารถสร้างปริศนาที่ไม่มีวันซ้ำกันและปรับความยากได้ตามโครงสร้างของตาราง

---

## 🏗️ System Architecture
ระบบประกอบด้วยคลาสหลักคือ `RandomPuzzle` ซึ่งทำงานแยกส่วนจาก UI (Decoupled Logic) เพื่อให้ง่ายต่อการทดสอบและนำไปใช้ซ้ำ

### Key Class: `RandomPuzzle`
- **Constructor**: รับค่า `levelConfig` (ขนาดตาราง) และ `animals` (Pool ของสัตว์)
- **getPuzzle()**: ฟังก์ชันหลักที่ส่งคืนวัตถุ Puzzle ที่ประกอบด้วยตารางสัตว์และชุดคำใบ้
- **generateHints(solution)**: อัลกอริทึมสำหรับสร้างลำดับคำใบ้จากคำตอบที่สุ่มได้

---

## ⚙️ Generation Algorithm: Tree-based Expansion
ระบบใช้หลักการ "ขยายจากจุดยึด" เพื่อรับประกันว่าทุกช่องในตารางจะมีความเชื่อมโยงกันและผู้เล่นสามารถหาคำตอบได้จริง

1.  **Solution Generation**:
    *   สุ่มเลือกสัตว์จาก Pool ตามจำนวนช่อง (`rows * columns`).
    *   สุ่มวางสัตว์ลงในตำแหน่งต่างๆ ของตารางเพื่อเป็น "คำตอบที่ถูกต้อง" (Golden Path).

2.  **Anchor Generation (จุดเริ่มต้น)**:
    *   สุ่มเลือก 1 ช่องในตารางเป็น "จุดยึด" (Anchor).
    *   สร้างคำใบ้ประเภท `anchor` ที่ระบุตำแหน่งโดยตรง เช่น *"สิงโต อยู่ที่ มุมซ้ายบน"*.

3.  **Recursive Relation Mapping**:
    *   ใช้เซต `visited` เพื่อติดตามช่องที่ถูกสร้างคำใบ้แล้ว.
    *   สุ่มเลือกช่องที่ `visited` แล้ว 1 ช่องเป็นจุดอ้างอิง (Source).
    *   หาช่องข้างเคียง (Neighbors: Up, Down, Left, Right) ที่ยังไม่ได้ `visited`.
    *   สร้างคำใบ้ประเภท `relation` เชื่อมโยงระหว่าง Source และ Target เช่น *"ลิง อยู่ทางขวาของ สิงโต"*.
    *   ทำซ้ำจนกระทั่งทุกช่องในตารางถูก `visited`.

---

## 📈 Complexity Scaling (การปรับความยาก)
ความซับซ้อนของปริศนาจะถูกกำหนดโดยตัวแปรดังนี้:

| ระดับความยาก | ขนาดตาราง | จำนวนสัตว์ใน Pool | ประเภทคำใบ้ |
| :--- | :--- | :--- | :--- |
| **Easy** | 2x2 | 4 | Anchor + Direct Neighbor |
| **Medium** | 2x3 | 6 | Anchor + Direct Neighbor |
| **Hard** | 3x3 | 9 | Anchor + Direct Neighbor |

### แนวทางการขยายแบบ Procedural เต็มตัว:
ในอนาคต ระบบสามารถปรับเปลี่ยน `levelConfig` แบบไดนามิกผ่านฟังก์ชันคำนวณ:
- **Grid Size**: `Rows = 2 + floor(Round / 5)`, `Cols = 2 + floor(Round / 3)`
- **Pool Size**: การเพิ่มจำนวนสัตว์ตัวเลือก (Distractors) ในถาดวาง เพื่อให้ผู้เล่นต้องคัดเลือกสัตว์ออกก่อนวาง

---

## 📄 Data Structures

### Hint Object
```javascript
{
  type: "anchor" | "relation",
  animal: Object,          // ข้อมูลสัตว์เป้าหมาย
  referenceAnimal: Object, // ข้อมูลสัตว์อ้างอิง (สำหรับ relation)
  direction: "up" | "down" | "left" | "right",
  targetIndex: Number,     // ตำแหน่งในตาราง (0 ถึง N-1)
  text: String             // ข้อความคำใบ้ภาษาไทย
}
```

### Puzzle Data Object
```javascript
{
  levelName: String,
  rows: Number,
  columns: Number,
  availableAnimals: Array, // สัตว์ทั้งหมดที่ต้องใช้ในรอบนี้
  solution: Array,         // ลำดับสัตว์ที่ถูกต้องในแต่ละ Index
  hints: Array             // รายการคำใบ้ที่สร้างขึ้น
}
```

---

## 🔮 Future Extensions (แผนการพัฒนา)
1.  **Negative Hints**: เพิ่มคำใบ้แบบปฏิเสธ เช่น *"นกฮูก ไม่ได้อยู่แถวเดียวกับ ช้าง"*.
2.  **Sequence Hints**: คำใบ้ที่ระบุลำดับ เช่น *"สัตว์กินเนื้อทั้งหมด อยู่ในคอลัมน์แรก"*.
3.  **Ambiguous Hints**: คำใบ้ที่ระบุขอบเขตกว้างขึ้น เช่น *"ยีราฟ อยู่ชั้นบน"* (ซึ่งอาจมีได้ 3 ช่อง) เพื่อให้ผู้เล่นต้องใช้คำใบ้อื่นมาตัดตัวเลือกออก
