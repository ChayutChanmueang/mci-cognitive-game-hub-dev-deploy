# แนวทางการปรับปรุง UX/UI สำหรับ MCI Cognitive Games (ฉบับล่าสุด 2026)

เอกสารนี้รวบรวมแนวทางและมาตรฐานการออกแบบ UX/UI ที่ได้จากการปรับปรุงระบบล่าสุด เพื่อให้การพัฒนาในอนาคตมีความต่อเนื่องและเป็นไปในทิศทางเดียวกัน โดยเน้นที่กลุ่มผู้ใช้งานผู้สูงอายุ (MCI) และความทันสมัยของอินเทอร์เฟซ

## 1. ปรัชญาการออกแบบ (Design Philosophy)
- **Premium & Modern:** ใช้ Glassmorphism, เงาที่นุ่มนวล และ Gradient เพื่อให้ความรู้สึกที่เป็นมืออาชีพและน่าใช้งาน
- **Accessibility First:** ออกแบบเพื่อผู้สูงอายุ (Large targets, High contrast, Clear feedback)
- **Unified Experience:** เชื่อมโยงระหว่าง Phaser (In-game) และ React/DOM (Overlay) ให้เป็นหนึ่งเดียวกัน

## 2. ระบบสีและโทน (Color System & Tokens)
ทุกองค์ประกอบต้องใช้ค่าสีจาก `src/util/game-theme.js` เท่านั้น:
- **Primary:** `#356859` (เขียวเข้ม - สงบและมั่นคง)
- **Surface:** `#f7f4ee` (ขาวนวล - ลดความล้าของสายตา)
- **On-Surface:** `#1e1b18` (เกือบดำ - อ่านง่าย)
- **Glass Effect:** ใช้พื้นหลังสีขาวนวลพร้อมค่า Alpha `0.8 - 0.95` และ Blur (ถ้าเป็น DOM)

## 3. ระบบฟอนต์ (Typography)
- **หัวข้อ (Headers):** ใช้ `"Baloo 2"` เพื่อความสนุกสนานและเป็นมิตร
- **เนื้อหาและภาษาไทย:** ใช้ `"Noto Sans Thai"` เพื่อความชัดเจนในการอ่าน
- **ขนาดขั้นต่ำ:** 18px สำหรับเนื้อหาทั่วไป และ 24px+ สำหรับปุ่มกด

## 4. มาตรฐาน UI Components
### ใน Phaser Canvas (In-game)
- **Base Class:** ใช้ `src/game/common/ui/core/ui-panel-base.js` เป็นต้นแบบสำหรับทุก Popup
- **Buttons:** ต้องมี Hover State (Scaling 1.1x) และ Click Animation
- **Feedback:** 
  - ถูก: วงกลมเขียว/เครื่องหมายถูก พร้อมเสียงโทนสูง
  - ผิด: วงกลมแดง/เครื่องหมายกากบาท พร้อมเสียงโทนต่ำและการสั่น (ถ้าเป็นไปได้)

### ใน DOM Overlay (HUD/Menu)
- **Material UI (MUI):** ใช้ MUI Components สำหรับหน้าจอที่ต้องการความซับซ้อน เช่น ระบบสมาชิก, สถิติผู้เล่น
- **Glassmorphic Panels:** ใช้ CSS class `.glass-panel` ที่กำหนดไว้ใน `style.css`
- **Responsiveness:** UI ต้องรองรับทั้งแนวตั้งและแนวนอน โดยเฉพาะส่วนของ HUD ที่ต้องหลบ "Safe Areas" ของมือถือ

## 5. การสื่อสารและการควบคุม (Interaction & EventBus)
- **Separation of Concerns:** แยก Logic ของเกมออกจาก UI Overlay
- **EventBus:** ใช้ `src/game/EventBus.js` ในการส่งข้อมูลระหว่าง Phaser และ React/DOM UI
  - *ตัวอย่าง:* เมื่อผู้เล่นทำคะแนนได้ในเกม ให้ emit event `update-score` เพื่อให้ HUD แสดงผล

## 6. แนวทางการปรับปรุงล่าสุด (Latest Improvements)
1. **Centering Canvas:** จัดวาง Canvas ให้อยู่กึ่งกลางเสมอและรองรับการ Scale แบบ Aspect Fit
2. **Standardized Summaries:** หน้าสรุปผลหลังจบเกมต้องแสดงคะแนน, เวลาที่ใช้ และปุ่ม "เล่นอีกครั้ง" หรือ "กลับหน้าหลัก" ที่ชัดเจน
3. **Tutorial System:** ก่อนเริ่มเกมต้องมีหน้าสอนสั้นๆ (Simple Graphics + Emoji) ที่ผู้เล่นต้องกด "เริ่มเกม" เพื่อยืนยันความเข้าใจ

## 7. Workflow สำหรับนักพัฒนา
1. อ้างอิง Design Tokens จาก `game-theme.js` เสมอ
2. ตรวจสอบความละเอียดของ Asset (Emoji/SVG) ให้คมชัดในทุกหน้าจอ
3. ทดสอบการตอบสนอง (Response Time) ของปุ่มกด – ต้องไม่รู้สึกหน่วง (Lag)
4. ตรวจสอบการแสดงผลภาษาไทยว่าไม่มีการตัดคำที่ผิดพลาด (Word break)

---
*ปรับปรุงล่าสุดเมื่อ: 2 พฤษภาคม 2026*
