# Game Hub Rebuild Spec

## Goal
สร้างหน้า Game Hub ใหม่ที่แสดงรายการเกมตามวันของโปรแกรมจาก database จริง ไม่ล็อกอยู่ที่วันที่ 1 และรองรับโปรแกรมที่มีจำนวนวัน/จำนวนเกมเปลี่ยนได้

## Data Source
- `game_list_data`: รายชื่อเกมทั้งหมด ใช้ `th_name` ก่อน ถ้าไม่มีให้ fallback เป็น `name`
- `game_level_preset_data`: รายการเกมรายวัน พร้อม `day`, `stage`, `level`, `gid`
- `game_daily_preset_data`: เป้าหมายรายวันและ `loop`
- `user_game_profile_data`: โปรแกรมที่ผู้เล่นได้รับ
- `user_patient_data.started_program`: วันที่เริ่มโปรแกรม ใช้คำนวณ program day
- `user_game_history`: สถานะเล่นจบ, จุดพัก, และ check-in

## Core Behavior
- โหลด metadata วันปัจจุบันก่อน เพื่อรู้ `programDay` และ `programDayCount`
- โหลดรายการวันที่เป็น window รอบวันปัจจุบัน เช่น วันที่ 8, 9, 10, 11 เมื่อผู้เล่นอยู่วันที่ 10
- แสดงทุกวันที่โหลดมา ไม่ filter ทิ้งเหลือวันที่ 1
- Top bar แสดงเฉพาะเป้าหมายของวันปัจจุบัน เช่น `เป้าหมายของวันที่ 10`
- รายการเกมด้านล่างแสดงหลาย section ตาม `day` ที่โหลดจาก database
- ถ้าวันปัจจุบันเล่นครบทุก node แล้ว ให้ auto check-in และโหลดวันถัดไปเพิ่มถ้ายังมี
- ไม่มีปุ่มเช็คชื่อในแผนที่ เพราะ check-in เป็นระบบอัตโนมัติ

## Completion Rules
- Node เกมถือว่าสำเร็จเมื่อ `user_game_history` มี `gid`, `stage` ตรงกัน และมี `end_at`
- Node พักถือว่าสำเร็จเมื่อมี record `gid = REST001`
- วันหนึ่งสำเร็จเมื่อทุกเกมและ node พักของวันนั้นสำเร็จครบตามลำดับ
- เกมซ้ำในวันเดียวกันต้องแยกด้วย `stage`

## UI Theme
- ใช้ Material Web components เดิม (`md-filled-button`, `md-outlined-button`, `md-linear-progress`, `md-fab`, `md-menu`)
- ใช้ CSS class theme เดิมของ Game Hub เช่น `hub-clean-screen`, `hub-clean-topbar`, `hub-clean-stage`, `hub-clean-level`
- Responsive เน้นมือถือเหมือน Game Hub เดิม

## Test Tools
- ปุ่ม `ลบประวัติการเล่น`
- ปุ่ม `เล่นเกมครบทั้งหมด`
- Dropdown `เลือกเกมทดสอบ`
- ปุ่ม `เครื่องมือจัดการข้อมูลรายวันเกม`
- ปุ่ม `ออกจากระบบ`
