# VoiceService Documentation - MCI Cognitive Games

---

## *Document Version: 1.0*  
*Project: MCI Cognitive Games*  
*Last Updated: 2026-05-03*

## 1. Overview
`VoiceService` เป็นโมดูลหลักที่ใช้จัดการระบบอ่านออกเสียง (Text-to-Speech: TTS) ภายในเกม เพื่อใช้สำหรับอ่านคำแนะนำ (Instructions) และเนื้อหาต่างๆ โดยออกแบบมาให้ใช้งานง่ายและรองรับการเข้าถึงของผู้สูงอายุ (Accessibility)

## 2. Technical Implementation
โมดูลนี้พัฒนาโดยใช้ **Web Speech API (`SpeechSynthesis`)** ของเบราว์เซอร์

### 2.1 Key Features
- **Thai Voice Support**: มีกลไกเลือกเสียงภาษาไทยเป็นอันดับแรก (`_loadVoices`)
- **Elderly-Friendly Settings**: ตั้งค่าความเร็วในการอ่าน (`rate`) ไว้ที่ 0.9 ซึ่งช้ากว่าปกติเล็กน้อย เพื่อความชัดเจนในการฟังสำหรับผู้สูงอายุ
- **Safety Mechanism**: มีระบบยกเลิกการอ่านปัจจุบัน (`synth.cancel()`) ก่อนเริ่มอ่านประโยคใหม่ เพื่อป้องกันเสียงซ้อนกัน
- **State Control**: สามารถเปิด-ปิดระบบได้ (`setEnabled`) และหยุดการอ่านได้ทันที (`stop`)

### 2.2 API Methods
| Method | Description | Parameters |
| :--- | :--- | :--- |
| `speak(text, options)` | เริ่มต้นอ่านข้อความ | `text` (string), `options` (rate, pitch, volume) |
| `stop()` | หยุดการอ่านทันที | - |
| `setEnabled(value)` | เปิดหรือปิดการใช้งาน | `value` (boolean) |

## 3. Implementation Example
การใช้งานภายในโปรเจกต์มักเรียกผ่าน `VoiceService` instance (Singleton):

```javascript
import VoiceService from '../../core/voice-service.js';

// อ่านคำแนะนำเกม
VoiceService.speak("กรุณาลากไปรษณียบัตรไปที่กล่องรับจดหมาย");

// หยุดการอ่าน
VoiceService.stop();
```

---

## 4. Design Patterns
- **Singleton Pattern**: โมดูลส่งออก (export default) เป็น instance ของ `VoiceService` ทำให้มั่นใจได้ว่ามีการจัดการสถานะของ `speechSynthesis` เพียงที่เดียวในทั้งแอปพลิเคชัน

---
[Back to Index](../index.md)
