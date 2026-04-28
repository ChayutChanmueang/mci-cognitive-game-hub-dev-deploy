import { calculateAgeFromBirthDate } from "../util/patient-date-util.js";

function createDateValue() {
    return new Date().toISOString().slice(0, 10);
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function formatDisplayDate(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear() + 543).slice(-2);
    return `${day}/${month}/${year}`;
}

export function renderPlayerInfoScreen(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        player = {},
        programEndedAt = "",
        onEndProgram = () => {},
        onLogout = () => {},
        onExport = () => {},
    } = options;

    const hn = String(player.hn || player.patientCode || "").trim();
    const birthDate = player.date || player.birthDate || "";
    const age = calculateAgeFromBirthDate(birthDate);
    const ageDisplay = Number.isInteger(age) ? `${age} ปี` : "- ปี";
    const startedProgram = player.started_program || player.startedProgram || createDateValue();
    const endedProgram = programEndedAt || createDateValue();

    root.innerHTML = `
        <section class="player-info-screen" aria-labelledby="player-info-title">
            <div class="player-info-card">
                <h1 id="player-info-title">ข้อมูลผู้เล่น</h1>

                <form id="player-info-form" class="player-info-form" novalidate>
                    <label class="player-info-row">
                        <span>หมายเลข HN :</span>
                        <div id="player-info-hn" class="player-info-value">${escapeHtml(hn)}</div>
                    </label>

                    <label class="player-info-row">
                        <span>ชื่อ :</span>
                        <div id="player-info-firstname" class="player-info-value">${escapeHtml(player.firstname || "")}</div>
                    </label>

                    <label class="player-info-row">
                        <span>นามสกุล :</span>
                        <div id="player-info-lastname" class="player-info-value">${escapeHtml(player.lastname || "")}</div>
                    </label>

                    <label class="player-info-row">
                        <span>วันเกิด :</span>
                        <div id="player-info-birth-date" class="player-info-value">${escapeHtml(formatDisplayDate(birthDate))}</div>
                    </label>

                    <label class="player-info-row">
                        <span>อายุ :</span>
                        <div id="player-info-age" class="player-info-value">${escapeHtml(ageDisplay)}</div>
                    </label>

                    <label class="player-info-row">
                        <span>เพศ :</span>
                        <div id="player-info-gender" class="player-info-value">${escapeHtml(player.gender || "")}</div>
                    </label>

                    <label class="player-info-row">
                        <span>การศึกษา :</span>
                        <div id="player-info-education" class="player-info-value">${escapeHtml(player.educationName || player.education_level || player.educationLevel || "")}</div>
                    </label>

                    <label class="player-info-row player-info-row--date">
                        <span>วันที่เริ่มโปรแกรม :</span>
                        <div id="player-info-started" class="player-info-value">${escapeHtml(formatDisplayDate(startedProgram))}</div>
                    </label>

                    <label class="player-info-row player-info-row--date">
                        <span>วันที่จบโปรแกรม :</span>
                        <div id="player-info-ended" class="player-info-value">${escapeHtml(formatDisplayDate(endedProgram))}</div>
                    </label>

                    <p id="player-info-feedback" class="player-info-feedback" aria-live="polite"></p>

                    <div class="player-info-actions">
                        <md-filled-button id="player-info-end-program" type="button">
                            จบโปรแกรม
                        </md-filled-button>
                        <md-filled-button id="player-info-logout" type="button">
                            ลงชื่อออก
                        </md-filled-button>
                    </div>

                    <md-filled-button id="player-info-export" class="player-info-export-button" type="submit">
                        ส่งออกข้อมูล
                    </md-filled-button>
                </form>
            </div>
        </section>
    `;

    const form = root.querySelector("#player-info-form");
    const endProgramButton = root.querySelector("#player-info-end-program");
    const logoutButton = root.querySelector("#player-info-logout");
    const feedback = root.querySelector("#player-info-feedback");

    if (!form || !endProgramButton || !logoutButton || !feedback) {
        return;
    }

    endProgramButton.addEventListener("click", async () => {
        await onEndProgram(player);
    });

    logoutButton.addEventListener("click", async () => {
        await onLogout(player);
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        feedback.textContent = "กำลังเตรียมข้อมูลสำหรับส่งออก...";

        try {
            const exported = await onExport(player);
            if (exported === false) {
                feedback.textContent = "";
                return;
            }
        } catch (error) {
            console.error("Player info export failed:", error);
            feedback.textContent = error?.message || "ไม่สามารถส่งออกข้อมูลได้";
            return;
        }

        feedback.textContent = "";
    });
}
