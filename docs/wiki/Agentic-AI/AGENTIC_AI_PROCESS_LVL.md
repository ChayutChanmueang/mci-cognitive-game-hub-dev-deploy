# 🎮 Agentic AI Implementation: Game Dev Maturity Model

**Version:** 1.2 | **Last Updated:** 2026-05-06 | **Owner:** Project Developer

เอกสารฉบับนี้อธิบายถึงลำดับขั้นความเชี่ยวชาญ (Maturity Model) ของการใช้ Agentic AI ในโปรเจค MCI Cognitive Games เพื่อให้ AI พัฒนาจากการเป็นแค่ "ผู้ช่วยพิมพ์โค้ด" ไปสู่การเป็น "ทีมสถาปนิกและผู้ผลิตเกมอัจฉริยะ"

---

## 📊 5 Levels of AI Maturity (ระดับความก้าวหน้า)

จากการวิจัยและแนวทางปฏิบัติระดับสากล เราแบ่งระดับการใช้งาน AI ออกเป็น 5 ขั้นดังนี้:

### 🛡️ LvL 1: The Junior (Foundation & Rules)
**ความสามารถ**: ทำงานตามคำสั่งเฉพาะหน้าที่ชัดเจนและปฏิบัติตามกฎเหล็กพื้นฐาน
*   **Context**: เข้าใจ Stack เทคโนโลยี (Phaser, React, Vite) ผ่านไฟล์กำหนดค่า
*   **Tools**: `AGENTS.md`, `.agents/rules/`
*   **Game Dev Example**: "สร้าง Template ของ `Phaser.Scene` โดยต้องมีเมธอด `preload`, `create` และ `update` ตามมาตรฐานโปรเจค"

### 🧩 LvL 2: The Specialist (Domain Expertise)
**ความสามารถ**: ประยุกต์ใช้ Patterns การพัฒนาเกมระดับสูงเพื่อแก้ปัญหาเฉพาะด้าน
*   **Context**: เข้าใจเรื่อง Performance, Memory Management และ Game Lifecycle
*   **Tools**: `.agents/skills/` (เช่น `phaser-best-practices`, `writing-phaser-3-games`)
*   **Game Dev Example**: "ใช้ skill `phaser` เพื่อออกแบบระบบดักจับ Input ของมือถือให้ลื่นไหลเหมือนเล่นบน Desktop"

### 📉 LvL 3: The Architect (Structural awareness)
**ความสามารถ**: วิเคราะห์ความสัมพันธ์ของโค้ดทั้งระบบเพื่อเพิ่มประสิทธิภาพและลด Token
*   **Context**: มองเห็น Dependency Graph และเข้าใจผลกระทบของการแก้ไขโค้ดข้าม Module
*   **Tools**: `graphify`, `graphify-out/GRAPH_REPORT.md`
*   **Game Dev Example**: "ตรวจสอบผ่าน Graphify ว่าหากเปลี่ยนโครงสร้างของ `EventBus` จะส่งผลกระทบต่อระบบ UI ตัวไหนบ้าง"

### 📝 LvL 4: The Producer (Design-Driven Development)
**ความสามารถ**: ตัดสินใจแก้ไขโค้ดโดยอ้างอิงจากงานออกแบบและสถานะของโครงการ
*   **Context**: เชื่อมโยง Logical Code เข้ากับ GDD, Software Design และ Agile Backlog
*   **Tools**: `docs/gdd/`, `docs/software/`, `docs/agile/`
*   **Game Dev Example**: "อ่าน GDD ด่าน 'Context Clues' และอัปเดต User Story ใน Backlog ให้เป็น Done หลังจาก Implement ฟีเจอร์เสร็จ"

### 🤖 LvL 5: The Orchestrator (Autonomous Collaboration)
**ความสามารถ**: การทำงานแบบ **Multi-agent System (MAS)** โดย AI สามารถวางแผนและมอบหมายงานให้ Sub-agents เฉพาะทางทำงานร่วมกันเป็นทีม
*   **Context**: เข้าใจการแบ่งแยกหน้าที่ (Separation of Concerns) และการประสานงานข้ามระบบ (Orchestration)
*   **Tools**: `invoke_agent`, `codebase_investigator`, `generalist`, ระบบ Shared Memory
*   **Game Dev Example**: "มอบหมายให้ `codebase_investigator` วิเคราะห์โครงสร้างมินิเกมเดิม และสั่งให้ `generalist` สร้าง Boilerplate สำหรับเกมใหม่พร้อมเชื่อมต่อระบบ UI และเสียงโดยอัตโนมัติ"

---

## 👥 Multi-agent Collaboration: การทำงานเป็นทีมของ AI

ในระดับสูงสุด AI จะไม่ได้ทำงานแบบตัวเดียว (Monolithic) แต่จะทำงานเป็น **"สตูดิโอจำลอง"** ที่ประกอบด้วย:
1.  **Manager (Orchestrator)**: ผู้วางกลยุทธ์และคุมลำดับงาน
2.  **Architect**: ผู้พิจารณาโครงสร้างและผลกระทบข้าม Module
3.  **Developer**: ผู้ลงมือเขียนโค้ดตาม Skill เฉพาะทาง (Phaser/React)
4.  **QA / Reviewer**: ผู้ตรวจสอบความถูกต้องและรัน Validation Loop

### 🛠️ การเตรียมตัวสำหรับ Multi-agent (Preparation Checklist)
เพื่อให้ทีม AI ทำงานได้อย่างมีประสิทธิภาพ ผู้พัฒนาควรเตรียมความพร้อมดังนี้:
*   **Shared Source of Truth**: มั่นใจว่า GDD, Software Design และ AGENTS.md อัปเดตล่าสุด AI ทุกตัวต้อง "เห็นภาพเดียวกัน"
*   **Clear Boundaries**: แบ่ง Folder และ Module ให้ชัดเจน (เช่น `src/game/`, `src/ui/`) เพื่อลดการแก้ไขไฟล์ทับซ้อนกันระหว่าง Agent
*   **Robust Tooling**: เตรียมคำสั่งตรวจสอบอัตโนมัติ (เช่น `npm test`, `npm run lint`) ให้พร้อมใช้งาน เพื่อให้ QA Agent ทำงานได้
*   **Memory Hooks**: ใช้ `MEMORY.md` บันทึก "การตัดสินใจเชิงสถาปัตยกรรม" เพื่อให้ Agent ตัวใหม่ที่ถูกเรียกมา (Invoked) เข้าใจบริบทได้ทันทีโดยไม่ต้องอ่านโค้ดทั้งหมดใหม่

---

## ⚙️ Core Operational Workflow: The "Reasoning Loop"

เพื่อให้ AI ทำงานได้อย่างแม่นยำในทุกระดับ เราใช้กระบวนการ **ReAct (Reason + Act)** ซึ่งขยายความได้ดังนี้:

### 🔍 1. Ask (Inquiry & Research)
*   **Goal**: สร้างความเข้าใจ (Mental Model) ก่อนลงมือ
*   **Action**: ค้นหาไฟล์ด้วย `grep_search`, ค้นหาอินเทอร์เน็ตผ่าน `google_web_search`
*   **Rule**: ห้ามแก้ไขไฟล์เด็ดขาด เน้นการตั้งสมมติฐานและการวิจัย

### 🗺️ 2. Plan (Strategy & Decomposition)
*   **Goal**: แบ่งงานใหญ่เป็นงานย่อย (Task Decomposition) เพื่อลดความผิดพลาด
*   **Action**: ใช้ `enter_plan_mode` เพื่อเขียน `PLAN.md`
*   **Technique**: **Chain of Thought (CoT)** - ให้ AI อธิบายเหตุผลในแต่ละขั้นตอนว่าทำไมถึงเลือกวิธีนี้

### 🛠️ 3. Act (Execution & Implementation)
*   **Goal**: เปลี่ยนแผนเป็นโค้ดจริงอย่าง "ศัลยกรรม" (Surgical Edits)
*   **Action**: ใช้ `replace` หรือ `write_file`
*   **Rule**: แก้ไขเฉพาะจุดที่เกี่ยวข้อง ไม่แก้โค้ดที่ไม่เกี่ยวข้องเพื่อป้องกันผลกระทบข้างเคียง

### 🧪 4. Validate (Verification Loop)
*   **Goal**: ยืนยันว่างานสำเร็จตาม Acceptance Criteria (Zero-Trust Policy)
*   **Action**: รัน `npm test`, `tsc`, หรือตรวจสอบผลลัพธ์ผ่าน `run_shell_command`
*   **Rule**: **"หลักฐานเชิงประจักษ์สำคัญกว่าคำยืนยันของ AI"**

### 🔄 5. Reflect & Correct (Self-Correction)
*   **Goal**: ตรวจสอบความล้มเหลวและเปลี่ยนกลยุทธ์ (Backtracking)
*   **Action**: หากรัน Test ไม่ผ่าน AI จะต้องวิเคราะห์สาเหตุ (Error Analysis) และเสนอแผนแก้ไขใหม่ (Re-planning)

---

## 📚 อ้างอิงและองค์ความรู้เพิ่มเติม

1.  **ReAct Pattern**: การผสมผสานระหว่าง Reasoning และ Acting เพื่อให้ Agent มีความฉลาดในการตอบสนองต่อสภาพแวดล้อม [Ref: arXiv:2210.03629]
2.  **Autonomous Agent Maturity**: ลำดับขั้นการพัฒนา Agent จาก Chatbot สู่ Orchestrator [Ref: Salesforce/Microsoft AI Models]
3.  **Human-in-the-loop (HITL)**: ความสำคัญของการมีมนุษย์ตรวจสอบในจุดตัดสินใจสำคัญ (Critical Approval Gates) เพื่อความปลอดภัยของระบบ

---
*Generated by Antigravity AI Assistant (Level 5 Orchestrator) using game-doc-manager skill.*
