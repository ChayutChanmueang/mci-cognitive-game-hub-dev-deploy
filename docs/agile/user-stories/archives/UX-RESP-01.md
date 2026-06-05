# User Story / Task: UX-RESP-01 - การพัฒนากรอบระบบรองรับมือถือ (Mobile Responsiveness Framework)

**Status:** ✅ Done (Research & Guidelines Ready for Discussion)  
**Epic:** [E3: Cognitive Games Implementation](../01-product-backlog.md)  
**Owner:** [TBD]  

---

## 📖 Objective
จัดทำกรอบการออกแบบและร่างแนวทางการเขียนโค้ด (Design & Coding Framework) เพื่อนำเสนอในการประชุมทีมพัฒนาและแพทย์ผู้ร่วมวิจัย เพื่อหาข้อตกลงเรื่องการจัดวางเลย์เอาต์ (Layout) ของหน้าจอเกมบนมือถือในอัตราส่วนที่ต่างกันอย่างสุดขั้ว (Extreme Aspect Ratios) และขนาดฟอนต์/ปุ่มกดที่ปลอดภัยสำหรับผู้สูงอายุ (MCI)

---

## 💬 ประเด็นสำคัญสำหรับการอภิปรายในที่ประชุม (Meeting Agenda Items)

### 1. การตัดสินใจเลือกโหมดการจัดขนาด Phaser Canvas (FIT vs RESIZE)
ในการจัดการหน้าจอเกมที่เรนเดอร์ใน Canvas มีสองแนวทางหลักที่ทีมพัฒนาและผู้บริหารถ้องเลือก:

*   **แนวทางที่ 1: `Scale.FIT` (แนะนำสำหรับการเปิดตัวครั้งแรก)**
    *   *การทำงาน*: บีบ/ขยาย Canvas ให้พอดีกับหน้าจอมือถือโดยรักษาอัตราส่วนเดิม (เช่น 4:3 หรือ 16:9) จะเกิดขอบสีดำ (Letterbox/Pillarbox) ที่ด้านข้างหากหน้าจอยาวกว่าปกติ
    *   *ข้อดี*: พัฒนาง่าย ตำแหน่งสัมบูรณ์ของวัตถุในเกมไม่เลื่อนหลุดตำแหน่ง เหมาะกับความต้องการความแม่นยำสูง
    *   *ข้อเสีย*: แสดงผลไม่เต็มพื้นที่หน้าจอของมือถือรุ่นใหม่
*   **แนวทางที่ 2: `Scale.RESIZE`**
    *   *การทำงาน*: ขยายพื้นที่วาดภาพ Canvas ให้เต็มความกว้างและยาวของอุปกรณ์จริง 100%
    *   *ข้อดี*: ภาพเกมแสดงผลเต็มขอบจอ ไม่มีแถบดำ สวยงามทันสมัย
    *   *ข้อเสีย*: ต้องเขียนโค้ดคำนวณตำแหน่งวัตถุในระบบใหม่ทั้งหมด วัตถุสิ่งเร้าในเกม (Stimuli) อาจกระจายตัวห่างกันเกินไปบนจอยาว ส่งผลต่อความเที่ยงตรงของการทดสอบทางการแพทย์ (เช่น เวลาตอบสนองอาจช้าลงเพราะระยะนิ้วที่ไกลขึ้น)

---

### 2. ขนาดปุ่มและระยะกั้นสัมผัสสำหรับนิ้วผู้สูงอายุ (MCI Target Padding)
จากแนวทาง Accessibility First ทีมต้องการกำหนดขนาดสัมผัสปุ่มจริง:
*   **ขนาดมองเห็น (Visible Size)**: ไม่น้อยกว่า 48x48px (สำหรับปุ่ม HUD) และไม่น้อยกว่า 80x80px (สำหรับปุ่มคำตอบมินิเกม)
*   **พื้นที่ตอบสนองการกด (Hit Area)**: ขยายขอบเขตสัมผัสทางกายภาพ (Interactive Padding) ออกไปอีกอย่างน้อย 12px รอบทิศทางเพื่อความลื่นไหลสำหรับผู้สูงอายุที่กล้ามเนื้อมืออ่อนแรงหรือสั่น
*   **ระยะการจัดวาง (Grid Gap)**: ปุ่มคำเลือกตัวเลือกห้ามวางชิดกันเกินไป ต้องรักษาระยะห่างขั้นต่ำ 24px เสมอ

---

### 3. แบบจำลองตัวอย่างโค้ดเพื่อเริ่มพัฒนาทันที (Coding Boilerplates)

#### 💻 ตัวอย่าง CSS (Global UI / DOM Overlay)
การใช้ตัวแปร CSS ร่วมกับหน่วย viewport เพื่อให้ส่วน HUD ปรับขนาดตามหน้าจอจริงและหลบมุมกล้อง (Notch):

```css
:root {
  /* กำหนดระยะขอบจอโดยดึงค่า Safe Area Insets หรือใช้ค่าเริ่มต้น 20px */
  --safe-padding-top: max(20px, env(safe-area-inset-top));
  --safe-padding-bottom: max(20px, env(safe-area-inset-bottom));
  --safe-padding-left: max(20px, env(safe-area-inset-left));
  --safe-padding-right: max(20px, env(safe-area-inset-right));
  
  /* ตัวแปรฟอนต์ปรับขนาดไดนามิกตามความกว้างจอขั้นต่ำ-สูงสุด */
  --font-size-header: clamp(24px, 5vw, 36px);
  --font-size-body: clamp(18px, 3.5vw, 22px);
}

.game-hud-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: var(--safe-padding-top) var(--safe-padding-right) 10px var(--safe-padding-left);
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.patient-info-text {
  font-size: var(--font-size-body);
  font-family: 'Noto Sans Thai', sans-serif;
}
```

#### 🕹️ ตัวอย่าง Phaser Script (Game Engine Integration)
การกำหนดพิกเซลวัตถุแบบร้อยละและการควบคุม Resize Event ภายในเกม:

```javascript
export default class BaseResponsiveScene extends Phaser.Scene {
  constructor(key) {
    super(key);
  }

  create() {
    // ลงทะเบียนตรวจสอบการปรับหน้าจอ
    this.scale.on('resize', this.onResize, this);
    
    // วาดองค์ประกอบ UI
    this.drawUI();
  }

  drawUI() {
    const { width, height } = this.scale;

    // 1. วาดปุ่มโฮมมุมซ้ายบน
    if (!this.homeButton) {
      this.homeButton = this.add.image(60, 60, 'home-btn').setInteractive();
    } else {
      this.homeButton.setPosition(60, 60);
    }

    // 2. จัดเรียงแผงคะแนนกึ่งกลางหน้าจอด้านล่าง
    if (!this.scorePanel) {
      this.scorePanel = this.add.container(width / 2, height - 80);
      // วาดกรอบสี่เหลี่ยมโค้ง (Rounded Rect)
      const bg = this.add.graphics();
      bg.fillStyle(0x356859, 0.9);
      bg.fillRoundedRect(-150, -30, 300, 60, 15);
      this.scorePanel.add(bg);
    } else {
      this.scorePanel.setPosition(width / 2, height - 80);
    }
  }

  onResize(gameSize) {
    // ปรับเปลี่ยนตำแหน่งของวัตถุทั้งหมดเมื่อเกิดการ Resize หน้าจอจริง
    this.drawUI();
  }

  destroy() {
    this.scale.off('resize', this.onResize, this);
  }
}
```

---

## 🔗 Related Files
- เอกสารวิจัยความละเอียดหน้าจอ: [Mobile Responsiveness Guidelines](../../wiki/guidelines/ux-ui-mobile-responsiveness-guidelines.md)
- รายละเอียดภาพรวม: [01-product-backlog](../01-product-backlog.md)
- แนวทาง UX/UI โครงการ: [Modern UX/UI Modernization Guidelines](../../wiki/guidelines/ux-ui-modernization-guidelines.md)

---
Back to Product Backlog: [Product Backlog](../01-product-backlog.md) | Back to Index: [Index](../../index.md)
