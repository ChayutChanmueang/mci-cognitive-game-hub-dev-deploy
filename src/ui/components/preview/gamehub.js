// Step 8a preview — full GameHub composition at 1080 scale, with mock data.
import "../components.css";
import { renderHeaderBar } from "../header-bar.js";
import { renderLevelPath } from "../level-path.js";

// mock day sections covering every state + connector case
const daySections = [
  {
    day: 1,
    label: "วันที่ 1",
    nodes: [
      { id: "d1-1", type: "game", state: "pass", number: 1 },
      { id: "d1-2", type: "game", state: "pass", number: 2 },
      { id: "d1-3", type: "rest", state: "pass", emoji: "🏋️" },
      { id: "d1-4", type: "game", state: "pass", number: 3 },
      { id: "d1-5", type: "checkin", state: "pass", emoji: "🏁" },
    ],
  },
  {
    day: 2,
    label: "วันที่ 2",
    nodes: [
      { id: "d2-1", type: "game", state: "pass", number: 1 },
      {
        id: "d2-2",
        type: "game",
        state: "current",
        fryfood: true,
        day: 2,
        category: "ภารกิจประจำวัน",
        title: "เกมทอดอาหาร",
        description: "เล่นเกมทอดอาหารก่อนเริ่มโปรแกรมประจำวัน",
      },
      { id: "d2-3", type: "game", state: "next", number: 3, sideLabel: "Context Clues" },
      { id: "d2-4", type: "rest", state: "next", emoji: "🏋️", sideLabel: "พักยืดเส้นยืดสาย" },
      { id: "d2-5", type: "game", state: "next", number: 4, sideLabel: "จับคู่ภาพ" },
      { id: "d2-6", type: "checkin", state: "next", emoji: "🏁", sideLabel: "รอเช็คชื่อ" },
    ],
  },
];

const scroll = document.getElementById("gh-scroll");
const frameWidth = 440;
const zoom = frameWidth / 1080;

scroll.innerHTML = `
  <div class="gh-stage" style="zoom:${zoom};padding:68px 0 200px;">
    <div style="margin:0 0 40px 61px;">
      ${renderHeaderBar({
        patientLabel: "สมชาย รักธรรมชาติ",
        goalTitle: "เป้าหมายของวันที่ 2",
        goalSummary: "ทำภารกิจ 6 ขั้นตอน ให้ครบตามแผนประจำวัน",
        progress: 0.33,
        done: 2,
        total: 6,
      })}
    </div>
    ${renderLevelPath(daySections)}
  </div>`;
