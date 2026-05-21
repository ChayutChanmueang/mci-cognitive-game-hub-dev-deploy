# Data Reference & Payloads Guide

เอกสารฉบับนี้จัดทำขึ้นเพื่อให้ทีมผู้พัฒนาเห็นภาพรวมของข้อมูลที่ใช้สื่อสารภายในระบบ (Data Flow) และหน้าตาของข้อมูล (Payloads) ที่เกิดขึ้นจริงในแต่ละสถานะ

---

## 1. Key Terminology (คำศัพท์สำคัญ)

| Term      | Full Name        | Description                                                                         | Example                  |
| --------- | ---------------- | ----------------------------------------------------------------------------------- | ------------------------ |
| **HN**    | Health Number    | รหัสประจำตัวผู้ป่วย (ใช้เป็น Primary Key ในการระบุตัวตนผู้เล่น)                     | `HN001`, `P0025`         |
| **GID**   | Game ID          | รหัสเฉพาะของแต่ละมินิเกม                                                            | `ZOO001` (Zoo Detective) |
| **GPID**  | Game Program ID  | รหัสโปรแกรมการฝึก (หนึ่งโปรแกรมมีหลายด่าน หลายวัน)                                  | `1` (Standard Program)   |
| **Stage** | Game Stage       | ลำดับการเล่นภายในหนึ่งวัน (เริ่มที่ 0 หรือ 1 ตามการตั้งค่า) ที่แสดงออกมาใน Game Hub | `0`, `1`, `2`            |
| **Level** | Difficulty Level | ระดับความยากที่ส่งเข้าไปใน Phaser Engine                                            | `1` (Easy), `2` (Normal) |

---

## 2. Core Data Objects (ตัวอย่างข้อมูลหลัก)

### 2.1 Patient Profile (ข้อมูลผู้เล่น)
ดึงมาจาก `db.getPatientByHn(hn)`

```json
{
  "id": "uuid-v4-identifier",
  "hn": "HN001",
  "firstname": "สมชาย",
  "lastname": "ใจดี",
  "phone": "0812345678",
  "gender": "Male",
  "education_level": "Bachelor",
  "started_program": "2026-05-01T00:00:00Z"
}
```

### 2.2 Game List Item (ข้อมูลมินิเกม)
ดึงมาจาก `db.getGameList()`

```json
{
  "gid": "ZOO001",
  "name": "Zoo Detective",
  "th_name": "นักสืบสวนสัตว์",
  "mci_group": "Attention",
  "max_score": 100
}
```

---

## 3. Game Flow & History (ลำดับการไหลของข้อมูล)

เมื่อผู้เล่นเริ่มเล่นเกมจนจบ ข้อมูลจะถูกบันทึกผ่าน 2 ขั้นตอนหลัก:

### Step 1: Launch (ก่อนเริ่มเกม)
ระบบจะสร้าง **History Row** เพื่อจองสิทธิ์การเล่นไว้ก่อน (สถานะ `end_at` จะเป็น `null`)

```json
// บันทึกผ่าน db.addUserGameHistory()
{
  "id": 12345,
  "hn": "HN001",
  "gid": "ZOO001",
  "stage": 1,
  "start_at": "2026-05-08T10:00:00Z",
  "end_at": null,
  "user_game_data_id": null
}
```

### Step 2: Complete (เมื่อเล่นจบ)
Minigame จะส่งคะแนนกลับมา และระบบจะอัปเดต History Row เดิมด้วย `user_game_data_id` ที่ได้จากการ Insert คะแนนจริง

```json
// ข้อมูลคะแนน (user_game_data)
{
  "id": "uuid-game-score",
  "score": 85,
  "level": 1,
  "started_at": "2026-05-08T10:00:00Z",
  "ended_at": "2026-05-08T10:05:00Z"
}

// อัปเดตกลับไปที่ History Row (id: 12345)
{
  "end_at": "2026-05-08T10:05:00Z",
  "user_game_data_id": "uuid-game-score"
}
```

---

## 4. Daily Program Structure (โครงสร้างภารกิจรายวัน)

นี่คือโครงสร้างที่ `Game Hub` ใช้แสดงผล "เส้นทางการเล่น" (Timeline) ในแต่ละวัน

```json
{
  "programDay": 1,
  "programDayCount": 15,
  "games": [
    {
      "gid": "ZOO001",
      "stage": 1,
      "level": 1,
      "displayName": "นักสืบสวนสัตว์",
      "goal": "หาทิศทางของสัตว์ให้ถูกต้อง",
      "loop": 1
    },
    {
      "gid": "REST001",
      "stage": 2,
      "level": null,
      "displayName": "พักยืดเส้นยืดสาย"
    }
  ]
}
```

---

## 5. Tips สำหรับ Developer
- **GID `REST001`**: เป็นค่าพิเศษ (Reserved) สำหรับจุดพักเบรกระหว่างเกม
- **Check-In**: ในฐานข้อมูล History หาก `check-in` เป็น `true` หมายถึงรายการนั้นคือ "การลงทะเบียนเช็คชื่อ" ไม่ใช่การเล่นเกม
- **Session Storage**: ข้อมูล `selected_game_gid` และ `pending_history_id` จะถูกเก็บไว้ใน Session Storage ของ Browser เพื่อใช้ส่งต่อข้อมูลระหว่าง Web UI และ Phaser

---
[กลับไปหน้าหลัก](../index.md)
