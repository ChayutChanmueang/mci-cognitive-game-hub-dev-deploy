# 💾 Core Module Summary: Database Interaction (src/core/database.js)

## 🎯 วัตถุประสงค์หลัก
เป็นศูนย์กลางในการจัดการการเข้าถึงและโต้ตอบกับฐานข้อมูล Supabase สำหรับกิจกรรมทั้งหมดของแอปพลิเคชัน เป็นโมดูลที่สำคัญที่สุดในการรักษาความต่อเนื่องของการเล่นและการบันทึกผลงานของผู้ใช้ (User Persistence).

## 🏗️ โครงสร้างข้อมูลหลักที่ต้องทราบ
*   **`user_patient_data`**: เก็บโปรไฟล์ผู้ป่วย (HN, Name, Age, etc.).
*   **`game_list_data`**: รายชื่อเกมทั้งหมดในระบบ.
*   **`user_game_data`**: บันทึกสถิติการเล่นของแต่ละครั้ง (Score, Level, Start/End Time).
*   **`user_event_log`**: บันทึกเหตุการณ์สำคัญที่เกิดขึ้นในแอปฯ เพื่อใช้ในการวิเคราะห์พฤติกรรมผู้ใช้.

## 🔑 ฟังก์ชันที่ต้องทำความเข้าใจและอ้างอิง
1.  **Authentication Flow (`initAuth`, `ensureSignedIn`)**: ต้องมีการรับรองตัวตนของผู้เล่นเสมอ ก่อนการดำเนินการใดๆ กับข้อมูลส่วนบุคคล
2.  **CRUD Operations**: การเพิ่ม/แก้ไขโปรไฟล์ผู้ป่วย, การบันทึกสถิติเกม (Submit Game Data), และการอ่านรายการเกมทั้งหมด.
3.  **Error Handling**: การจัดการกรณีที่เกิดข้อผิดพลาดในการทำธุรกรรม (เช่น `hn` ซ้ำ หรือ Missing user ID) เป็นสิ่งสำคัญ

## 📝 Flowchart การใช้งานทั่วไป
*   *(ควรระบุขั้นตอน: User Login $\rightarrow$ Check Session $\rightarrow$ Get Client $\rightarrow$ Proceed)*