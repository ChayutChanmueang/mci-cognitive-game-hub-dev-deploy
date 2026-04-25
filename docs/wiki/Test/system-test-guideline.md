# แนวทางการทดสอบระบบ (System Test Guidelines)

เอกสารฉบับนี้จัดทำขึ้นเพื่อใช้เป็นแนวทางสำหรับทีมงานในการทดสอบระบบและทำ Script Testing เพื่อให้มั่นใจว่าระบบทำงานได้อย่างถูกต้อง มีประสิทธิภาพ และตรงตามความต้องการ (Requirements) ก่อนนำไปใช้งานจริง

## 1. วัตถุประสงค์ (Objectives)
- เพื่อให้ทีมงานมีมาตรฐานและขั้นตอนการทดสอบที่เป็นไปในทิศทางเดียวกัน
- เพื่อค้นหาข้อบกพร่อง (Bugs/Defects) และแก้ไขก่อนถึงมือผู้ใช้งาน
- เพื่อเพิ่มความมั่นใจในคุณภาพของซอฟต์แวร์

## 2. ประเภทของการทดสอบ (Types of Testing)
ทีมงานควรดำเนินการทดสอบในระดับต่างๆ ดังนี้:

1. **Unit Testing**: ทดสอบการทำงานของฟังก์ชันหรือคอมโพเนนต์ย่อยที่สุดแบบแยกส่วน (Isolation)
2. **Integration Testing**: ทดสอบการทำงานร่วมกันระหว่างหลายๆ คอมโพเนนต์ หรือการเชื่อมต่อกับ API/Database
3. **System Testing**: ทดสอบการทำงานของระบบโดยรวมทั้งหมด (End-to-End) ตาม Use Case หรือ User Flow จริง
4. **Performance Testing**: ทดสอบประสิทธิภาพของระบบเมื่อมีการใช้งานพร้อมกันหลายคน หรือโหลดข้อมูลจำนวนมาก
5. **User Acceptance Testing (UAT)**: ทดสอบร่วมกับผู้ใช้งานจริงเพื่อยืนยันว่าระบบตอบโจทย์ธุรกิจ

## 3. ขั้นตอนการทดสอบ (Testing Process)
1. **วิเคราะห์ความต้องการ (Requirement Analysis)**: ทำความเข้าใจฟีเจอร์ที่ต้องทดสอบ
2. **สร้างแผนการทดสอบ (Test Planning)**: กำหนดขอบเขต, เครื่องมือ, และผู้รับผิดชอบ
3. **เขียนกรณีทดสอบ (Test Case Design)**: ระบุขั้นตอนการทดสอบ (Steps), ข้อมูลที่ใช้ (Test Data), และผลลัพธ์ที่คาดหวัง (Expected Result)
4. **ดำเนินการทดสอบ (Test Execution)**: ทำการทดสอบตาม Test Case ที่ออกแบบไว้ (Manual & Automated)
5. **บันทึกผลและแจ้งข้อบกพร่อง (Bug Reporting)**: บันทึกผลการทดสอบ หากพบปัญหาให้เปิด Issue เพื่อแจ้งให้นักพัฒนาทราบ
6. **ทดสอบซ้ำ (Retesting & Regression Testing)**: ทดสอบซ้ำหลังจากนักพัฒนาแก้ไขบัคเสร็จแล้ว และทดสอบภาพรวมไม่ให้กระทบฟีเจอร์เดิม

## 4. แนวทางการทำ Script Testing (Automation Testing)

การทำ Script Testing จะช่วยลดเวลาในการทำ Regression Test และเพิ่มความแม่นยำในการทดสอบระบบซ้ำๆ

### เครื่องมือที่แนะนำ (Tools)
- **Unit/Integration Test**: Jest, Mocha, Chai, Vitest (เนื่องจากเป็น Vite project แนะนำ Vitest)
- **E2E/System Test**: Cypress, Playwright
- **Performance Test**: k6, JMeter

### หลักการเขียน Script Testing ที่ดี
1. **Keep it Independent**: แต่ละ Test Case ต้องทำงานเป็นอิสระต่อกัน (ไม่พึ่งพาผลลัพธ์จาก Test Case อื่น)
2. **Clear Naming**: ตั้งชื่อ Test Case ให้ชัดเจนว่ากำลังทดสอบอะไร (เช่น `should load game scene successfully`)
3. **Use Arrange-Act-Assert (AAA)**:
   - **Arrange**: เตรียมข้อมูลและการตั้งค่าเริ่มต้น
   - **Act**: เรียกใช้งานฟังก์ชันหรือการกระทำที่ต้องการทดสอบ
   - **Assert**: ตรวจสอบผลลัพธ์ว่าตรงกับที่คาดหวังหรือไม่
4. **Mock External Services**: ใน Unit/Integration Test ควรจำลอง (Mock) ข้อมูลจาก API หรือบริการภายนอกเพื่อให้การทดสอบรวดเร็วและควบคุมได้
5. **Maintainability**: เขียนโค้ดเทสให้อ่านง่าย มีการใช้ตัวแปรซ้ำหรือสร้าง Helper functions เมื่อจำเป็น

### ตัวอย่างโค้ด (Pseudocode - E2E Testing ด้วย Playwright)
```javascript
import { test, expect } from '@playwright/test';

test.describe('Game Loading System', () => {
  test('should load game successfully and display start button', async ({ page }) => {
    // Arrange: ไปที่หน้าเว็บเกม
    await page.goto('http://localhost:8080');
    
    // Act & Assert: ตรวจสอบว่ามี Canvas ของเกมแสดงขึ้นมา
    const gameCanvas = page.locator('canvas');
    await expect(gameCanvas).toBeVisible();

    // ตัวอย่างการตรวจสอบปุ่ม Start
    const startButton = page.getByRole('button', { name: 'Start Game' });
    await expect(startButton).toBeVisible();
    await startButton.click();
  });
});
```

## 5. รูปแบบการแจ้งปัญหา (Bug Report Format)
เมื่อพบข้อบกพร่อง ควรระบุรายละเอียดให้ชัดเจนดังนี้ในระบบ Issue Tracker:

- **Title**: หัวข้อที่กระชับและเข้าใจง่าย (ตัวอย่าง: ปุ่ม Start Game ไม่ตอบสนองบนมือถือ)
- **Environment**: สภาพแวดล้อมที่พบปัญหา (เช่น OS: iOS 17, Browser: Safari)
- **Pre-conditions**: สถานะเริ่มต้นหรือสิ่งที่ต้องเตรียมก่อนเกิดปัญหา
- **Steps to Reproduce**: ขั้นตอนในการทำให้เกิดปัญหาแบบละเอียด
  1. เปิดหน้าเว็บเกม
  2. กดปุ่ม 'Start Game'
- **Expected Result**: ผลลัพธ์ที่ควรจะเป็น (เกมเริ่มและเปลี่ยนไป Scene ถัดไป)
- **Actual Result**: ผลลัพธ์ที่เกิดขึ้นจริง (ความผิดปกติ) (ไม่มีอะไรเกิดขึ้น)
- **Severity/Priority**: ระดับความรุนแรง (เช่น High)
- **Attachments**: ภาพหน้าจอ (Screenshot) หรือวิดีโอ (Video) และ Console Log

## 6. Checklists ก่อนขึ้นระบบ (Pre-Release Testing Checklist)
- [ ] ผ่านการรัน Automated Tests (ถ้ามี) แบบ 100% (ไม่มี Fail)
- [ ] ทดสอบการแสดงผลบนขนาดหน้าจอและ Browser ที่รองรับ (Cross-Browser & Responsive Test) โดยเฉพาะบนโทรศัพท์มือถือและแท็บเล็ต
- [ ] ทดสอบกรณีที่เครือข่ายมีปัญหา (Offline/Slow Network) เบื้องต้น
- [ ] ตรวจสอบว่าไม่มี Console Errors ปรากฏใน Developer Tools
- [ ] ยืนยันผล UAT จากผู้ทดสอบเรียบร้อยแล้ว
