# Database Schema Diagram - MCI Cognitive Games

---

## *Document Version: 1.2*  
*Project: MCI Cognitive Games*  
*Last Updated: 2026-05-08*

## 1. Database Overview

```mermaid
erDiagram
    USERS ||--o{ USER_PATIENT_DATA : "has"
    USER_PATIENT_DATA ||--o{ USER_GAME_HISTORY : "tracks"
    USER_PATIENT_DATA ||--o{ USER_GAME_PROFILE_DATA : "assigned to"
    USER_GAME_HISTORY ||--o| USER_GAME_DATA : "linked to"
    GAME_LIST_DATA ||--o{ USER_GAME_DATA : "records"
    GAME_LEVEL_PRESET_LIST ||--o{ GAME_LEVEL_PRESET_DATA : "defines"
    GAME_LEVEL_PRESET_LIST ||--o{ USER_GAME_PROFILE_DATA : "used by"
```

---

## 2. Core Tables

### 2.1 USERS (Supabase Auth)
Supabase built-in authentication table (`auth.users`).

### 2.2 user_patient_data
ข้อมูลผู้ป่วย/ผู้ใช้งานหลัก

| Column          | Type      | Constraints | Description                         |
| --------------- | --------- | ----------- | ----------------------------------- |
| id              | uuid      | PK          | Primary Key                         |
| uid             | uuid      | FK          | Reference to auth.users             |
| hn              | string    | UK          | หมายเลข HN ของผู้ป่วย (Patient ID)  |
| firstname       | string    | NOT NULL    | ชื่อ                                |
| lastname        | string    | NOT NULL    | นามสกุล                             |
| phone           | string    | UK          | เบอร์โทรศัพท์                       |
| date            | string    | NOT NULL    | วันเกิด (Birth Date)                |
| gender          | string    | NOT NULL    | เพศ                                 |
| education_level | string    | NULLABLE    | ระดับการศึกษา (ID)                  |
| started_program | timestamp | NOT NULL    | วันที่เริ่มโปรแกรม                  |
| created_at      | timestamp | DEFAULT     | วันที่สร้างข้อมูล                   |

---

### 2.3 game_list_data
รายการมินิเกมทั้งหมดในระบบ

| Column     | Type      | Constraints | Description                   |
| ---------- | --------- | ----------- | ----------------------------- |
| id         | int       | PK          | Primary Key                   |
| gid        | string    | UK          | Game ID (เช่น ZOO001, CTX001) |
| name       | string    | NOT NULL    | ชื่อภาษาอังกฤษ                |
| th_name    | string    | NULLABLE    | ชื่อภาษาไทย                   |
| mci_group  | string    | NOT NULL    | กลุ่ม MCI (Attention, Memory) |
| max_score  | int       | NULLABLE    | คะแนนสูงสุดพื้นฐาน            |
| created_at | timestamp | DEFAULT     | วันที่สร้าง                   |

---

### 2.4 user_game_data
ข้อมูลการเล่นเกมเชิงลึก (คะแนนและเวลา)

| Column     | Type      | Constraints | Description                 |
| ---------- | --------- | ----------- | --------------------------- |
| id         | uuid      | PK          | Primary Key                 |
| gid        | string    | FK          | Reference to game_list_data |
| score      | int       | NULLABLE    | คะแนนที่ได้                 |
| level      | int       | NULLABLE    | ระดับความยาก (ถ้ามี)        |
| started_at | timestamp | NOT NULL    | เวลาเริ่มเล่น               |
| ended_at   | timestamp | NOT NULL    | เวลาสิ้นสุด                 |

---

### 2.5 user_game_history
บันทึกประวัติการเข้าเล่นเกมและกิจกรรมใน Hub (Timeline)

| Column            | Type      | Constraints | Description                             |
| ----------------- | --------- | ----------- | --------------------------------------- |
| id                | int       | PK          | Primary Key                             |
| hn                | string    | FK          | Reference to user_patient_data(hn)      |
| gid               | string    | FK          | Reference to game_list_data(gid)        |
| stage             | int       | NULLABLE    | ลำดับด่านในโปรแกรม                      |
| start_at          | timestamp | NOT NULL    | เวลาที่กดเริ่ม                          |
| end_at            | timestamp | NULLABLE    | เวลาที่เล่นเสร็จ                        |
| user_game_data_id | uuid      | FK          | Linked to user_game_data                |
| check-in          | boolean   | DEFAULT F   | สถานะการเช็คชื่อ                        |

---

## 3. Game Program & Preset System

### 3.1 game_level_preset_list
รายชื่อโปรแกรมการฝึก (เช่น โปรแกรมพื้นฐาน, โปรแกรมเข้มข้น)

| Column      | Type      | Description        |
| ----------- | --------- | ------------------ |
| id          | int       | PK                 |
| name        | string    | ชื่อโปรแกรม        |
| description | string    | รายละเอียดโปรแกรม  |

### 3.2 game_level_preset_data
รายละเอียดการจับคู่ เกม-ด่าน-วัน ในแต่ละโปรแกรม

| Column | Type   | Description                            |
| ------ | ------ | -------------------------------------- |
| id     | int    | PK                                     |
| gpid   | int    | FK (game_level_preset_list)            |
| gdid   | int    | FK (game_daily_preset_data)            |
| gid    | string | FK (game_list_data)                    |
| day    | int    | วันที่กำหนดให้เล่น                     |
| stage  | int    | ลำดับภายในวัน                          |
| level  | int    | ระดับความยากของ Phaser Game ในด่านนั้น |

### 3.3 user_game_profile_data
ตารางเชื่อมโยงผู้ป่วยกับโปรแกรมที่กำลังเล่น

| Column  | Type   | Description                         |
| ------- | ------ | ----------------------------------- |
| id      | int    | PK                                  |
| hn      | string | FK (user_patient_data)              |
| program | int    | FK (game_level_preset_list)         |

---

## 4. Full ER Diagram

```mermaid
erDiagram
    auth_users ||--o{ user_patient_data : "has profile"
    user_patient_data ||--o{ user_game_history : "timeline"
    user_patient_data ||--o{ user_game_profile_data : "assigned"
    
    game_list_data ||--o{ user_game_data : "scores"
    game_list_data ||--o{ user_game_history : "logs"
    game_list_data ||--o{ game_level_preset_data : "presetted"

    user_game_history ||--o| user_game_data : "links"
    
    game_level_preset_list ||--o{ game_level_preset_data : "structure"
    game_level_preset_list ||--o{ user_game_profile_data : "selection"
    
    game_daily_preset_data ||--o{ game_level_preset_data : "daily config"
```

---

## 5. Environment Variables
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---
[Back to Index](../index.md)
