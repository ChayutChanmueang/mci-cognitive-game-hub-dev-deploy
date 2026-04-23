# 📖 Documentation Workflow Guideline

เอกสารชุดนี้แนะนำลำดับการสร้างเอกสารโครงการโดยใช้เทมเพลตมาตรฐาน เพื่อให้การออกแบบและการติดตามความคืบหน้าเป็นไปอย่างมีประสิทธิภาพ

---

## 🛠️ Phase 1: Design Documents (The "What")
*เน้นการวางโครงสร้างและไอเดียก่อนเริ่มลงมือเขียนโค้ด*

เริ่มทำเอกสารตามลำดับความสำคัญดังนี้:

1.  **[Game Design Document (GDD)](Design-Documents/GDD-Template.md)**: 
    *   **ทำตอนไหน:** เริ่มต้นโครงการทันที
    *   **เป้าหมาย:** สรุปภาพรวม Concept, ระบบการเล่น (Mechanics) และเป้าหมายของโครงการ
2.  **[Game Loop Diagram](Design-Documents/GameLoop-Template.md)**:
    *   **เป้าหมาย:** วาด Flow การทำงานของเกม ตั้งแต่เริ่มจนจบ รวมถึง Logic การ Update และ Physics เพื่อให้เห็นภาพรวมของระบบ
3.  **[Class Diagram](Design-Documents/ClassDiagram-Template.md)**:
    *   **เป้าหมาย:** ออกแบบโครงสร้าง Code, การสืบทอด (Inheritance) และความสัมพันธ์ระหว่าง Class ต่างๆ
4.  **[Database Schema](Design-Documents/DatabaseSchema-Template.md)**:
    *   **เป้าหมาย:** ออกแบบโครงสร้างตารางข้อมูล (ER Diagram) และ Flow การเชื่อมต่อ API/Database

---

## 🚀 Phase 2: Progress & Planning (The "When & How")
*เน้นการบริหารจัดการเวลาและการส่งมอบงาน*

เมื่อได้แบบร่างใน Phase 1 แล้ว ให้เริ่มวางแผนการทำงานดังนี้:

1.  **[Product Backlog & Milestones](Progress-Logs/Product-Backlog-Template.md)**:
    *   **Action:** แตกเป้าหมายหลักเป็น Milestones (M1, M2, ...) และสร้าง User Stories คร่าวๆ
2.  **[User Story Details](Progress-Logs/User-Storys/User-Story-Template.md)**:
    *   **Action:** เขียนรายละเอียดการยอมรับงาน (Acceptance Criteria) และบันทึกทางเทคนิคสำหรับแต่ละ Story ที่จะทำใน Sprint นั้นๆ
3.  **[Weekly Backlog](Progress-Logs/Weekly-Backlogs/Weekly-Backlog-Template.md)**:
    *   **Action:** ในทุกต้นสัปดาห์ ให้ดึงงานจาก Product Backlog มาลงใน Weekly Backlog เพื่อกำหนดเป้าหมายรายวัน
4.  **[Meeting Notes](Progress-Logs/Meeting-Logs/MeetingNote-Template.md)**:
    *   **Action:** ใช้บันทึกผลการประชุม การ Demo งาน และปัญหาที่พบ (Blockers) เพื่อนำไปปรับปรุงในสัปดาห์ถัดไป

---

## 🧭 Entry Point: The Dashboard
เพื่อให้ทุกคนเข้าถึงเอกสารได้ง่าย ให้ใช้ **[DASHBOARD-Template.md](DASHBOARD-Template.md)** เป็นหน้าแรกของโครงการ โดยทำการเชื่อมโยง Link ไปยังเอกสารจริงที่สร้างขึ้นในโฟลเดอร์ `docs/Design-Documents/` และ `docs/Progress-Logs/`

---

## 💡 Obsidian Tips & Plugins
เพื่อให้การใช้งานเอกสารมีประสิทธิภาพสูงสุด แนะนำให้ติดตั้ง Community Plugins ต่อไปนี้:

1.  **Templater**: ใช้สำหรับสร้างไฟล์ใหม่จาก Template อัตโนมัติ (เช่น สร้าง Meeting Note หรือ User Story)
2.  **Kanban**: ใช้สำหรับสร้างและจัดการ Kanban Board ในรูปแบบ Markdown เพื่อติดตามสถานะงาน
3.  **Calendar**: ช่วยในการจัดการเอกสารรายวันและเข้าถึงบันทึกการประชุมตามวันที่ได้ง่าย
4.  **Editing Toolbar**: เพิ่มแถบเครื่องมือช่วยปรับแต่ง Markdown (ตัวหนา, สีข้อความ, ตาราง) ให้ใช้งานง่ายเหมือน Word

**Workflow Features:**
*   **Bi-directional Links:** ใช้ `[[Link]]` ในการเชื่อมโยง User Story กับ Design Doc เพื่อให้สามารถตรวจสอบย้อนกลับ (Traceability) ได้ง่าย
*   **Mermaid Diagrams:** ใช้ Code Block `mermaid` ในเอกสาร Design เพื่อสร้าง Diagram ที่แก้ไขได้ง่าย แนะนำประเภทที่เหมาะสมดังนี้:
    *   `flowchart TD/LR`: เหมาะสำหรับ **Game Loop** และกระบวนการทาง Logic ของเกม
    *   `stateDiagram-v2`: เหมาะสำหรับจัดการ **Game States** (เช่น Main Menu -> Playing -> Game Over)
    *   `classDiagram`: เหมาะสำหรับออกแบบโครงสร้าง **Class Diagram** และความสัมพันธ์ของ Code
    *   `erDiagram`: เหมาะสำหรับออกแบบ **Database Schema** และความสัมพันธ์ของข้อมูล
    *   `sequenceDiagram`: เหมาะสำหรับแสดงลำดับการส่งข้อมูล (เช่น **API Flow** หรือ Auth Flow)
