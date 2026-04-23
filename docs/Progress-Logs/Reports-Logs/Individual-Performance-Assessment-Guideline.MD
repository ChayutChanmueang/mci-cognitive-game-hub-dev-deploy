# 📑 Individual Performance Assessment Guideline

**โปรเจกต์:** MCI Cognitive Games (Phaser 3 + Vite)

**เกณฑ์การประเมิน:** อิงตามผลลัพธ์ (Outcome-based) และหลักฐานจาก Version Control

---

## 💎 1. ด้าน Contribution (ความมุ่งมั่นและการส่งมอบงาน)

|**ระดับคะแนน**|**คุณสมบัติและหลักฐานที่ต้องปรากฏ (Outcome)**|
|---|---|
|**1 (Poor)**|ทำงานกระจุกตัวช่วงใกล้กำหนดส่ง (ปั่นงานวันสุดท้าย), Commit Message ไม่สื่อความหมาย ("fix", "update", "."), ทำงานบน Main Branch เท่านั้น|
|**2 (Fair)**|มีการ Commit มากกว่า 1 ครั้งแต่ยังไม่สม่ำเสมอ, Message เริ่มสื่อสารถิ่งที่ทำบ้างแต่ยังคลุมเครือ, ยังไม่มีการแยก Branch|
|**3 (Good)**|Commit งานต่อเนื่องตามลำดับการพัฒนาจริง, Message สื่อสารเข้าใจว่าทำอะไรในแต่ละส่วน, เริ่มมีการแยก Branch สำหรับ Feature ใหม่บ้าง|
|**4 (Very Good)**|Commit สม่ำเสมอเห็น Flow การพัฒนาชัดเจน, Message ระบุรายละเอียดสิ่งที่เปลี่ยนได้ดี, แยก Branch ตาม Feature และ Merge เมื่อเสร็จสมบูรณ์|
|**5 (Excellent)**|**Atomic Commits:** แตกงานย่อยและ Commit ถี่อย่างมีคุณภาพ, **ระบุ Task ID ในทุก Message**, มี Pull Request และการ Review ชัดเจนก่อน Merge|

---

## 🔍 2. ด้าน Traceability (ความสามารถในการสืบย้อนงาน)

|**ระดับคะแนน**|**คุณสมบัติและหลักฐานที่ต้องปรากฏ (Outcome)**|
|---|---|
|**1 (Poor)**|Progress Log ไม่เชื่อมโยงกับงานจริง, หาที่มาของงานใน Git ไม่ได้, งานที่ทำไม่มีระบุไว้ใน Backlog หรือแผนงาน|
|**2 (Fair)**|มี Progress Log แต่ข้อมูลยังไม่สอดคล้องกับสิ่งที่ทำในโค้ด, มี ID ระบุบ้างแต่ไม่ครบถ้วน หรือ ID ไม่สื่อถึง Task ที่ทำ|
|**3 (Good)**|ใช้ ID งานระบุในเอกสารและ Commit Message เป็นส่วนใหญ่ แต่ข้อมูลยังไม่สอดคล้องกัน 100% (เช่น ID ใน Log กับใน Git สลับกัน)|
|**4 (Very Good)**|Traceability สูง: งานเกือบทุกส่วนสามารถสืบย้อนได้ผ่าน ID ที่ตรงกันระหว่าง Sprint Backlog, Commit และ Progress Log|
|**5 (Excellent)**|**Traceability สมบูรณ์:** ทุกส่วนงานเชื่อมโยงผ่าน ID เดียวกันตั้งแต่ GDD -> Backlog -> Commit -> **Source Code (Comment)** มีการระบุที่มาของ Logic ชัดเจน|

---

## 📦 3. ด้าน Assets & Code Organization (ระเบียบวิธีจัดการทรัพยากร)

|**ระดับคะแนน**|**คุณสมบัติและหลักฐานที่ต้องปรากฏ (Outcome)**|
|---|---|
|**1 (Poor)**|ไฟล์ Assets และ Code วางกระจัดกระจายไม่แยกโฟลเดอร์, ชื่อไฟล์/ตัวแปรตั้งแบบสุ่ม (`img1.png`, `aaa.js`), เขียนโค้ดไม่มี Format|
|**2 (Fair)**|เริ่มมีการแยกโฟลเดอร์บ้างแต่ยังไม่สมบูรณ์, ชื่อไฟล์เริ่มสื่อความหมายแต่ยังไม่เป็นระบบเดียวกัน (Mixing camelCase, snake_case)|
|**3 (Good)**|แยกโฟลเดอร์ตามประเภทชัดเจน (`/assets`, `/src`), Naming Convention เป็นระบบเดียวกันเกือบทั้งโครงการ (เช่น camelCase สำหรับตัวแปร)|
|**4 (Very Good)**|จัดการไฟล์เรียบร้อย, โค้ดสะอาดปฏิบัติตาม **Javascript Standard**, เริ่มมีการเขียน **JSDoc** หรือ Comment อธิบาย Logic ที่ซับซ้อน|
|**5 (Excellent)**|**Self-documenting Code:** โค้ดสะอาดมากจนอ่านเข้าใจได้ทันที, จัดการ Assets เป็นระบบขั้นสูง (เช่น Atlas/Spritesheet), มีการใช้ Pattern ที่เหมาะสมกับ Phaser|

---

## 📊 รูปแบบการส่งรายงานผล (Report Format)

การประเมินจะถูกบันทึกเป็นไฟล์ **.csv** หรือ **.md** โดยกำหนดโครงสร้างคอลัมน์และข้อกำหนดดังนี้:

| **คอลัมน์ (Header)** | **คำอธิบาย** |
| :--- | :--- |
| **Assessment_Date** | วันที่ทำการประเมิน (รูปแบบ YYYY-MM-DD) |
| **Author_Name** | ชื่อนักศึกษา/ผู้รับการประเมิน (**หากพบชื่อใน Git Log ซ้ำซ้อนหรือคล้ายกัน ให้ผู้ประเมินรวมเป็นชื่อเดียว**) |
| **Contribution_Score** | Contribution (1-5) |
| **Traceability_Score** | Traceability (1-5) |
| **Assets_Org_Score** | Assets & Organization (1-5) |
| **Total_Score** | Total (15) |
| **Contribution_Reason**| **เหตุผลที่ให้คะแนนในด้าน Contribution** (เช่น ความถี่ หรือคุณภาพของ Message) |
| **Traceability_Reason** | **เหตุผลที่ให้คะแนนในด้าน Traceability** (เช่น ความเชื่อมโยงของ ID) |
| **Assets_Org_Reason**  | **เหตุผลที่ให้คะแนนในด้าน Assets & Org** (เช่น ระเบียบของโค้ดและไฟล์) |



> **💡 ข้อแนะนำ:** การรวมชื่อ (Author Consolidation) เป็นสิ่งสำคัญมากในการตรวจงานผ่าน Git เพื่อป้องกันการสับสนหากนักศึกษาใช้ Email หรือ Username หลายชื่อในการ Commit งาน

---


## 🛠 วิธีการใช้งาน Guideline สำหรับผู้สอน (Internal Workflow)

1. **Iterative Check:** ในทุกๆ สัปดาห์ หรือทุก Milestone ให้ผู้สอนเปิดดู **Git Network Graph** เพื่อดูการแยก Branch (Contribution)
    
2. **ID Spot Check:** สุ่มเลือก 1 Feature จากในเกม แล้วดูว่าสามารถไล่สายจาก **Code -> Commit -> Backlog -> GDD** ผ่าน ID ได้หรือไม่ (Traceability)
    
3. **Code & File Review:** เปิด Folder Project เพื่อเช็คว่ามีไฟล์ขยะหลุดมาไหม และสุ่มเปิด Scene หรือ Component ใน Phaser เพื่อเช็ค Naming Convention (Organization)
    

---

## 📈 สรุป Metric การให้คะแนนแบบสะสม

| **หมวดหมู่**     | **น้ำหนักคะแนน** | **วิธีการให้คะแนน**                          |
| ---------------- | ---------------- | -------------------------------------------- |
| **Contribution** | 5                | ประเมินจากความสม่ำเสมอใน Git Log             |
| **Traceability** | 5                | ประเมินจากความเชื่อมโยงของ ID ในทุก Document |
| **Assets & Org** | 5                | ประเมินจากโครงสร้างไฟล์และ Coding Standard   |

> **คำแนะนำ:** หากนักศึกษาพบ Outcome ในระดับ "Excellent" ติดต่อกัน 2 Milestone อาจมีการมอบ "Pro Badge" เพื่อเป็นคะแนนโบนัสหรือสิทธิพิเศษในการยกเว้นการสอบย่อยบางส่วน เพื่อกระตุ้นให้รักษามาตรฐานงานไว้ครับ