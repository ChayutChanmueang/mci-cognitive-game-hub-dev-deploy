# Database Schema Diagram - MCI Cognitive Games

---

## *Document Version: 1.1*  
*Project: MCI Cognitive Games*  
*Last Updated: 2026-05-03*

## 1. Database Overview

```mermaid
erDiagram
    USERS ||--o{ USER_PATIENT_DATA : "has"
    USERS ||--o{ USER_GAME_DATA : "plays"
    USERS ||--o{ USER_EVENT_LOG : "generates"
    GAME_LIST_DATA ||--o{ USER_GAME_DATA : "contains"
```

---

## 2. Database Tables

### 2.1 USERS (Supabase Auth)

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email
        timestamp created_at
        timestamp last_sign_in_at
        json user_metadata
        boolean is_anonymous
    }
```

**Description:** Supabase built-in authentication table

---

### 2.2 user_patient_data

```mermaid
erDiagram
    USER_PATIENT_DATA {
        uuid id PK
        uuid uid FK
        string hn UK
        string firstname
        string lastname
        int age
        string gender
        int education_level
        timestamp started_program
        timestamp created_at
    }
```

**Description:** ข้อมูลผู้ป่วย/ผู้ใช้งาน


| Column          | Type      | Constraints | Description             |
| --------------- | --------- | ----------- | ----------------------- |
| id              | uuid      | PK          | Primary Key             |
| uid             | uuid      | FK          | Reference to auth.users |
| hn              | string    | UK          | หมายเลข HN ของผู้ป่วย   |
| firstname       | string    | NOT NULL    | ชื่อ                    |
| lastname        | string    | NOT NULL    | นามสกุล                 |
| age             | int       | NOT NULL    | อายุ                    |
| gender          | string    | NOT NULL    | เพศ                     |
| education_level | int       | NULLABLE    | ระดับการศึกษา           |
| started_program | timestamp | NOT NULL    | วันที่เริ่มโปรแกรม      |
| created_at      | timestamp | DEFAULT     | วันที่สร้างข้อมูล       |


---

### 2.3 game_list_data

```mermaid
erDiagram
    GAME_LIST_DATA {
        int id PK
        string gid UK
        string name
        string mci_group
        int max_score
        timestamp created_at
    }
```

**Description:** รายการเกมในระบบ


| Column     | Type      | Constraints | Description                   |
| ---------- | --------- | ----------- | ----------------------------- |
| id         | int       | PK          | Primary Key                   |
| gid        | string    | UK          | Game ID (เช่น ZOO001, CTX001) |
| name       | string    | NOT NULL    | ชื่อเกม                       |
| mci_group  | string    | NOT NULL    | กลุ่ม MCI                     |
| max_score  | int       | NULLABLE    | คะแนนสูงสุด                   |
| created_at | timestamp | DEFAULT     | วันที่สร้าง                   |


**Sample Data:**


| gid    | name            | mci_group |
| ------ | --------------- | --------- |
| ZOO001 | Zoo Detective   | ATTENTION |
| ZOO002 | Zoo Feeder      | ATTENTION |
| CTX001 | Context Clues   | MEMORY    |
| SYM001 | Symmetry Decor  | EXECUTIVE |
| POS001 | Postcard Reader | MEMORY    |


---

### 2.4 user_game_data

```mermaid
erDiagram
    USER_GAME_DATA {
        uuid id PK
        uuid uid FK
        string gid FK
        int score
        int level
        timestamp started_at
        timestamp ended_at
    }
```

**Description:** ข้อมูลการเล่นเกมของผู้ใช้


| Column     | Type      | Constraints | Description                 |
| ---------- | --------- | ----------- | --------------------------- |
| id         | uuid      | PK          | Primary Key                 |
| uid        | uuid      | FK          | Reference to auth.users     |
| gid        | string    | FK          | Reference to game_list_data |
| score      | int       | NULLABLE    | คะแนนที่ได้                 |
| level      | int       | NULLABLE    | ระดับความยาก                |
| started_at | timestamp | NOT NULL    | เวลาเริ่มเล่น               |
| ended_at   | timestamp | NOT NULL    | เวลาสิ้นสุด                 |


---

### 2.5 user_event_log

```mermaid
erDiagram
    USER_EVENT_LOG {
        uuid id PK
        uuid uid FK
        string eventid
        string gid
        timestamp created_at
    }
```

**Description:** บันทึกเหตุการณ์ต่างๆ


| Column     | Type      | Constraints | Description             |
| ---------- | --------- | ----------- | ----------------------- |
| id         | uuid      | PK          | Primary Key             |
| uid        | uuid      | FK          | Reference to auth.users |
| eventid    | string    | NOT NULL    | รหัสเหตุการณ์           |
| gid        | string    | NULLABLE    | Game ID (ถ้ามี)         |
| created_at | timestamp | DEFAULT     | วันที่บันทึก            |


**Event IDs:**


| eventid | Description  |
| ------- | ------------ |
| OPAPP   | เปิดแอป      |
| SPG     | เริ่มเล่นเกม |


---

## 3. Entity Relationship Diagram

```mermaid
erDiagram
    auth_users {
        uuid id PK
        string email
        timestamp created_at
    }

    user_patient_data {
        uuid id PK
        uuid uid FK
        string hn UK
        string firstname
        string lastname
        int age
        string gender
        int education_level
        timestamp started_program
        timestamp created_at
    }

    game_list_data {
        int id PK
        string gid UK
        string name
        string mci_group
        int max_score
        timestamp created_at
    }

    user_game_data {
        uuid id PK
        uuid uid FK
        string gid FK
        int score
        int level
        timestamp started_at
        timestamp ended_at
    }

    user_event_log {
        uuid id PK
        uuid uid FK
        string eventid
        string gid
        timestamp created_at
    }

    auth_users ||--o{ user_patient_data : "has profile"
    auth_users ||--o{ user_game_data : "plays"
    auth_users ||--o{ user_event_log : "logs"
    game_list_data ||--o{ user_game_data : "tracks"
```

---

## 4. MCI Group Classification

```mermaid
classDiagram
    class MCI_Group {
        <<enumeration>>
        ATTENTION
        MEMORY
        EXECUTIVE
        LANGUAGE
        VISUOSPATIAL
    }
```

**Mapping:**


| Game            | MCI Group | Skill Trained               |
| --------------- | --------- | --------------------------- |
| Zoo Detective   | ATTENTION | Logical thinking, Deduction |
| Zoo Feeder      | ATTENTION | Decision making, Timing     |
| Context Clues   | MEMORY    | Language comprehension      |
| Symmetry Decor  | EXECUTIVE | Spatial reasoning           |
| Postcard Reader | MEMORY    | Reading comprehension       |


---

## 5. API Flow Diagrams

### 5.1 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Supabase

    User->>App: Open App
    App->>Supabase: getSession()
    Supabase-->>App: Session (or null)

    alt No Session
        App->>Supabase: signInAnonymously()
        Supabase-->>App: Anonymous Session
    end

    App->>App: Store Session
```

### 5.2 Submit Score Flow

```mermaid
sequenceDiagram
    participant User
    participant GameScene
    participant Database
    participant Supabase

    User->>GameScene: Complete Game
    GameScene->>Database: submitGameData({gid, score, level, startedAt, endedAt})
    Database->>Database: Validate Input
    Database->>Supabase: INSERT into user_game_data
    Supabase-->>Database: Success
    Database-->>GameScene: Return payload
    GameScene->>User: Show Success
```

### 5.3 Load Patient Data Flow

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Database
    participant Supabase

    User->>App: Enter HN
    App->>Database: getPatientByHn(hn)
    Database->>Supabase: SELECT from user_patient_data
    Supabase-->>Database: Patient Data (or null)

    alt Patient Found
        Database-->>App: Return Patient
        App->>App: Load Game Hub
    else Patient Not Found
        Database-->>App: Return null
        App->>User: Show Error
    end
```

---

## 6. Indexes & Constraints

```sql
-- Primary Keys
ALTER TABLE user_patient_data ADD PRIMARY KEY (id);
ALTER TABLE game_list_data ADD PRIMARY KEY (id);
ALTER TABLE user_game_data ADD PRIMARY KEY (id);
ALTER TABLE user_event_log ADD PRIMARY KEY (id);

-- Unique Constraints
ALTER TABLE user_patient_data ADD CONSTRAINT unique_hn UNIQUE (hn);
ALTER TABLE game_list_data ADD CONSTRAINT unique_gid UNIQUE (gid);

-- Foreign Keys
ALTER TABLE user_patient_data ADD CONSTRAINT fk_patient_user
    FOREIGN KEY (uid) REFERENCES auth.users(id);

ALTER TABLE user_game_data ADD CONSTRAINT fk_game_user
    FOREIGN KEY (uid) REFERENCES auth.users(id);

ALTER TABLE user_game_data ADD CONSTRAINT fk_game_list
    FOREIGN KEY (gid) REFERENCES game_list_data(gid);

ALTER TABLE user_event_log ADD CONSTRAINT fk_event_user
    FOREIGN KEY (uid) REFERENCES auth.users(id);

-- Indexes
CREATE INDEX idx_patient_hn ON user_patient_data(hn);
CREATE INDEX idx_game_user ON user_game_data(uid);
CREATE INDEX idx_game_gid ON user_game_data(gid);
CREATE INDEX idx_event_user ON user_event_log(uid);
CREATE INDEX idx_event_created ON user_event_log(created_at);
```

---

## 7. Security Rules (RLS)

```sql
-- Enable RLS
ALTER TABLE user_patient_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_game_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_event_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_list_data ENABLE ROW LEVEL SECURITY;

-- Patients: Users can only see their own data
CREATE POLICY "Patients can view own data"
    ON user_patient_data FOR SELECT
    USING (auth.uid() = uid);

CREATE POLICY "Users can insert own data"
    ON user_patient_data FOR INSERT
    WITH CHECK (auth.uid() = uid);

-- Game Data: Users can only see their own
CREATE POLICY "Users can view own game data"
    ON user_game_data FOR SELECT
    USING (auth.uid() = uid);

CREATE POLICY "Users can insert own game data"
    ON user_game_data FOR INSERT
    WITH CHECK (auth.uid() = uid);

-- Game List: Public read access
CREATE POLICY "Public can view game list"
    ON game_list_data FOR SELECT
    USING (true);

-- Event Log: Users can only insert their own
CREATE POLICY "Users can insert own events"
    ON user_event_log FOR INSERT
    WITH CHECK (auth.uid() = uid);
```

---

## 8. Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 9. Implementation Reference
- **Schema Setup:** [US-E2-01](US-E2-01.md) (Supabase Table Setup)
- **Authentication:** [US-E2-02](US-E2-02.md) (Patient Auth Integration)
- **Data Flow:** [US-E2-03](US-E2-03.md) (Score & Time API)

---

## Notes

- ใช้ Supabase เป็น Backend-as-a-Service
- รองรับ Anonymous Login สำหรับผู้ที่ไม่ต้องการสร้างบัญชี
- Row Level Security (RLS) สำหรับความปลอดภัยของข้อมูล
- ทุกตารางมีการสร้าง Index สำหรับ Query ที่ใช้บ่อย
\

---
[? Back to Index](../index.md)\

