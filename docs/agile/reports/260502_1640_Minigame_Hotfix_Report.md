# รายงานการแก้ไขด่วน (Hotfix Report)

**รหัสอ้างอิง**: HF-260502-01  
**หัวข้อ**: แก้ไขปัญหา Console Error และการโหลด Plugin ผิดพลาดในมินิเกมทั้งหมด  
**วันที่ดำเนินการ**: 2 พฤษภาคม 2026  
**ผู้ดำเนินการ**: Antigravity (AI Coding Assistant)  
**สถานะ**: ✅ ดำเนินการเสร็จสิ้น (Deployed to Local Dev)

---

## 1. ปัญหาที่พบ (Identified Issues)
จากการตรวจสอบผ่าน Console ในระหว่างการเปิดมินิเกม พบข้อผิดพลาดหลักดังนี้:
1. **Plugin Configuration Error**: พบ Warning `Invalid Scene Plugin: rexUI` เนื่องจากมีการพิมพ์ผิดในไฟล์ Config (`ket` แทนที่จะเป็น `key`)
2. **Redundant Plugin Loading**: มีการใช้ `this.load.scenePlugin` เพื่อดึงไฟล์จาก GitHub CDN ในทุกๆ Scene (MainMenu, Gameplay) ทั้งที่ Plugin ถูกติดตั้งเป็น Package และลงทะเบียนในระดับ Global แล้ว ทำให้เกิด Error `Can't supported version : 3`
3. **Scene Key Mismatch**: ในไฟล์ `Preloader.js` พยายามสั่ง `this.scene.start('MainMenu')` แต่ตัว Scene จริงถูกลงทะเบียนไว้ด้วยคีย์ `'main-menu-scene'` ส่งผลให้บางเกมไม่สามารถแสดงผลหน้าเมนูหลักได้

---

## 2. รายละเอียดการแก้ไข (Technical Fixes)

### 2.1 การแก้ไขระดับ Global Config
แก้ไข typo ในไฟล์ `main.js` ของแต่ละมินิเกม เพื่อให้ Phaser รับทราบการติดตั้ง `rexUI` plugin อย่างถูกต้อง:
- **ไฟล์ที่แก้ไข**:
    - `src/game/context-clues/main.js`
    - `src/game/symmetry-decor/main.js`

### 2.2 การแก้ไขระดับ Scene Lifecycle
ลบโค้ดการโหลด Plugin ซ้ำซ้อนในเมธอด `preload()` ของมินิเกม เพื่อใช้ Plugin ที่ถูก Initialize มาจาก Config หลักเพียงอย่างเดียว:
- **มินิเกมที่ได้รับผลการแก้ไข**:
    - **Context Clues**: แก้ไข `MainMenu.js`, `Gameplay.js`
    - **Postcard Reader**: แก้ไข `MainMenu.js`, `Gameplay.js`
    - **Symmetry Decor**: แก้ไข `MainMenu.js`, `Gameplay.js`

### 2.3 การแก้ไข Scene Key Mismatch
ปรับเปลี่ยนคำสั่งเริ่ม Scene ใน `Preloader.js` ให้ตรงกับ Key ที่ลงทะเบียนไว้ใน `MainMenu.js`:
- **มินิเกมที่ได้รับผลการแก้ไข**:
    - `postcard-reader`
    - `symmetry-decor`
    - `zoo-detective`
    - `zoo-feeder`
    - `context-clues`

---

## 3. ผลการตรวจสอบ (Verification Results)
ทำการตรวจสอบผ่าน Browser Subagent หลังการแก้ไข:
- [x] **Console Errors**: ไม่พบข้อความ Error เกี่ยวกับ `rexUI` หรือ `supported version`
- [x] **Scene Loading**: เกมสามารถโหลดจาก Preloader เข้าสู่ Main Menu ได้โดยไม่มีอาการค้าง
- [x] **Multi-Game Stability**: ทดสอบสลับเกมไปมาใน Hub พบว่าแต่ละเกมสามารถ Initialize ตัวเองได้สมบูรณ์โดยไม่ทิ้ง Error ไว้ใน Console

---

## 4. ข้อเสนอแนะ (Next Steps)
- ควรกำหนดมาตรฐานการตั้งชื่อ Scene Key ให้เป็นรูปแบบเดียวกันทั้งโปรเจกต์ (เช่น ใช้คีย์ตามชื่อไฟล์เสมอ)
- หลีกเลี่ยงการใช้ URL ภายนอก (CDN) ในโค้ดระดับโปรดักชัน เพื่อป้องกันปัญหา Network Latency และ Version Conflict ในอนาคต
