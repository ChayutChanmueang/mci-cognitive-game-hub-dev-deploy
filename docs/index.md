# 🎮 MCI Cognitive Games — Project Index

**Project:** MCI Cognitive Games (เกมฝึกสมองสำหรับผู้ป่วย MCI)
**Status:** 🟢 Pre-beta (0.x) — Stabilization & Deployment Testing | **Current Sprint:** [Sprint 7 — Art, Versioning & Vertical Responsiveness](agile/sprint-backlogs/sprint-07.md)
**Version:** 0.14.1 | **Last Updated:** 2026-06-26 | **Knowledge Hub:** [🌐 Project Wiki](wiki/wiki.md)

---

## Current Implementation Snapshot

MCI Cognitive Games is currently a Phaser 3 + Vite browser application with DOM-based Material Web UI screens. The app now includes patient login/signup, a daily program game hub, profile and CSV export tools, leaderboard, admin login, daily preset management, Supabase-backed persistence, and a Docker/nginx production deployment flow.

### Active Runtime Surfaces
- **Patient flow:** Welcome (game logo) -> Login -> Signup if HN is missing -> Game Hub -> Minigames -> Check-in/Profile/Leaderboard.
- **Platform/PWA:** Installable PWA with a full icon set (192/512/maskable + apple-touch) and web manifest; Fry Food motion controls use the accelerometer manager with an iOS gyro input handler and motion-permission flow.
- **Admin/tooling flow:** Admin login, player data screens, CSV export, daily preset editor, and test/debug controls.
- **Game suite:** Zoo Detective, Zoo Feeder, Context Clues, Symmetry Decor, Postcard Reader, Resting Point, and Fry Food.
- **Game Hub UI:** Figma-derived component system — header bar, level-path/progression nodes, and an auto-layout progress bar (fill-width rendering with a text-color flip at the 50% mark); CSS `--gh-scale` scaling with scroll-to-current targeting.
- **Character avatars:** Gender-based character images for the Game Hub header profile avatar, the rest/check-in progression nodes, and the check-in success screen.
- **Data services:** Supabase client, edge-function fallback paths, leaderboard RPC/client fallback, user rank lookup, game history, check-in history, and CSV export helpers.
- **Media:** Embeddable `VideoPlayer` (loading overlay, buffering feedback, read-only progress, volume/mute sync, fullscreen with iOS pseudo-fullscreen fallback) used in the check-in short-video step and resting point; random video selection filters hidden entries from `game_video_list`.
- **Deployment note:** Test VM and nginx builds must use a branch that includes the leaderboard rewrite fix; older staging builds may still contain stale `topObserver` code.

### Latest Sprint 7 UI Update
- **[US-E7-17](agile/user-stories/US-E7-17.md) — Boot loading visual refresh:** boot loading ตอนเปิดเกมแสดงโลโก้เกมแบบเดียวกับหน้า `src/ui/welcome-screen.js` (`/Logo.png`) และใช้ dot progress แบบง่ายจำนวน **5 dots** แทน spinner/ข้อความโหลดเดิม โดย overlay ยังปิดผ่าน logic `finishBootLoading()`/first usable paint เดิม

---

## 📘 Game Design (GDD)
เอกสารที่ระบุว่าเกมนี้คืออะไร มีระบบและทิศทางอย่างไร
- [00. Game Concept & Architecture](gdd/00-concept.md) - แนวคิดหลัก กลุ่มเป้าหมาย และสถาปัตยกรรมระบบ
- [01. Core Mechanics](gdd/01-mechanics.md) - ระบบการเล่น เงื่อนไขเกม และ progression ระดับโปรแกรม
- [02. Narrative & Theme](gdd/02-narrative.md) - เรื่องราวและบรรยากาศในเกม
- [03. Art Direction](gdd/03-art-direction.md) - รูปแบบวิชวลและ UI/UX Guidelines
- [04. Audio Direction](gdd/04-audio-direction.md) - แนวทางการใช้เสียงและดนตรี
- [Minigame Detailed Designs](gdd/minigames/README.md) - รายละเอียดทางเทคนิคและกลไกเชิงลึกของแต่ละมินิเกม

---

## 💻 Software Design
เอกสารทางเทคนิคเกี่ยวกับการสร้างและสถาปัตยกรรม
- [00. Concept Design](gdd/00-concept.md) - (ดูใน Game Concept) โครงสร้างและการทำงานระหว่าง DOM App UI, Supabase และ Phaser
- [01. System Design](software/01-system-design.md) - รายละเอียด Subsystems และ Design Patterns
- [02. Class Diagram](software/02-class-diagram.md) - แผนภาพความสัมพันธ์ของ Class หลัก
- [03. Data Schema](software/03-data-schema.md) - โครงสร้างฐานข้อมูล Supabase
- [04. Data Reference](software/03-data-reference.md) - ตัวอย่างข้อมูล (Payloads) และคู่มือสำหรับนักพัฒนา

---

## 🚀 Agile Management
เอกสารการบริหารจัดการโครงการและการทดสอบ
- [Kanban Board](agile/kanban.md) - สถานะงานปัจจุบัน
- [01. Product Backlog](agile/01-product-backlog.md) - รายการฟีเจอร์และ User Stories ทั้งหมด
- [02. Sprint Roadmap](agile/02-sprint-planning.md) - แผนการดำเนินงานภาพรวมและรายละเอียด Sprint ปัจจุบัน
- [03. Meeting Logs](agile/03-meeting-backlogs.md) - บันทึกการประชุมของทีม
- [04. Sprint Retrospectives](agile/04-retrospectives-backlog.md) - บันทึกสรุปบทเรียนและแนวทางการปรับปรุงในแต่ละ Sprint
- [05. System Test Reports](agile/05-report-backlog.md) - รายงานผลการทดสอบระบบและสรุปสถานะคุณภาพล่าสุด
- [🧩 Problem Records (Root-Cause Log)](agile/problems/README.md) - บันทึกสาเหตุรากของปัญหา (`PB-XX-XX`) และกฎที่ต้องทำตามเพื่อไม่ทำผิดซ้ำ

---

## 📚 Resources & Guidelines
- [🌐 Project Wiki](wiki/wiki.md) - คลังความรู้และบันทึกโครงการ
- [Documentation & System Overhaul Report](wiki/development/Documentation_Overhaul_Report.md) - สรุปรายละเอียดการปรับปรุงโครงสร้างและระบบครั้งใหญ่ (พฤษภาคม 2026)
- [Modern UX/UI Guidelines](wiki/guidelines/ux-ui-modernization-guidelines.md) - แนวทางการปรับปรุงล่าสุด (2026)
- [Testing Guidelines](wiki/guidelines/system-test-guideline.md) - แนวทางการทดสอบระบบ
- [Documentation Changelog](changelog.md) - ประวัติการแก้ไขเอกสาร

---
*Generated by Antigravity AI Assistant using game-doc-manager skill.*
