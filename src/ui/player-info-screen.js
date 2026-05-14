import { calculateAgeFromBirthDate } from "../util/patient-date-util.js";
import { formatThaiPhoneNumber } from "../util/phone-number-util.js";
import {
    formatThaiProgramDate,
    getProgramEndDate,
} from "../util/program-date-util.js";
import {
    CsvExportScope,
    CsvExportType,
} from "../util/player-csv-export.js";

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
    return formatThaiProgramDate(value);
}

function showExportOptionsPopup() {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        const titleId = `player-export-title-${Date.now()}`;
        const messageId = `player-export-message-${Date.now()}`;
        const previousOverflow = document.body.style.overflow;

        overlay.className = "app-popup player-info-export-popup";
        overlay.innerHTML = `
            <div class="app-popup__backdrop"></div>
            <div
                class="app-popup__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="${titleId}"
                aria-describedby="${messageId}"
            >
                <div class="app-popup__header">
                    <div class="app-popup__icon-wrap">
                        <span class="material-symbols-rounded app-popup__icon">download</span>
                    </div>
                    <div class="app-popup__copy">
                        <h2 id="${titleId}">ส่งออกข้อมูล</h2>
                        <p id="${messageId}">เลือกข้อมูลที่ต้องการส่งออกเป็น CSV</p>
                        <div class="player-info-export-popup__group" role="radiogroup" aria-label="ขอบเขตข้อมูล">
                            <label class="player-info-export-popup__option">
                                <input
                                    type="radio"
                                    name="player-export-scope"
                                    data-export-scope="${CsvExportScope.Current}"
                                    checked
                                >
                                <span>ข้อมูลของผู้เล่นคนนี้</span>
                            </label>
                            <label class="player-info-export-popup__option">
                                <input
                                    type="radio"
                                    name="player-export-scope"
                                    data-export-scope="${CsvExportScope.All}"
                                >
                                <span>ข้อมูลทั้งหมด</span>
                            </label>
                        </div>
                        <label class="player-info-export-popup__option">
                            <input
                                type="checkbox"
                                data-export-option="${CsvExportType.Player}"
                                checked
                            >
                            <span>ส่งออกข้อมูลผู้เล่น</span>
                        </label>
                        <label class="player-info-export-popup__option">
                            <input
                                type="checkbox"
                                data-export-option="${CsvExportType.Game}"
                            >
                            <span>ส่งออกข้อมูลการเล่นเกม</span>
                        </label>
                        <label class="player-info-export-popup__option">
                            <input
                                type="checkbox"
                                data-export-option="${CsvExportType.History}"
                            >
                            <span>ส่งออกประวัติการเล่นรายวัน</span>
                        </label>
                    </div>
                </div>
                <div class="app-popup__actions">
                    <md-outlined-button type="button" data-popup-cancel>ยกเลิก</md-outlined-button>
                    <md-filled-button type="button" data-popup-confirm>ส่งออก</md-filled-button>
                </div>
            </div>
        `;

        const cleanup = (result) => {
            document.removeEventListener("keydown", onKeyDown);
            overlay.remove();
            document.body.style.overflow = previousOverflow;
            resolve(result);
        };
        const getSelection = () => ({
            exportScope: String(
                overlay.querySelector("[data-export-scope]:checked")?.getAttribute("data-export-scope")
                    || CsvExportScope.Current,
            ),
            exportTypes: [...overlay.querySelectorAll("[data-export-option]:checked")]
                .map((input) => String(input.getAttribute("data-export-option") || "").trim())
                .filter(Boolean),
        });
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                cleanup(null);
            }
        };

        overlay.querySelector("[data-popup-cancel]")?.addEventListener("click", () => cleanup(null));
        overlay.querySelector("[data-popup-confirm]")?.addEventListener("click", () => cleanup(getSelection()));
        overlay.querySelector(".app-popup__backdrop")?.addEventListener("click", () => cleanup(null));

        document.body.style.overflow = "hidden";
        document.body.appendChild(overlay);
        document.addEventListener("keydown", onKeyDown);
        requestAnimationFrame(() => {
            overlay.querySelector("[data-popup-confirm]")?.focus();
        });
    });
}

export function renderPlayerInfoScreen(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        player = {},
        programEndedAt = "",
        programDayCount = null,
        onEndProgram = () => {},
        onLogout = () => {},
        onExport = () => {},
    } = options;

    const hn = String(player.hn || player.patientCode || "").trim();
    const phoneDisplay = formatThaiPhoneNumber(player.phone || "");
    const birthDate = player.date || player.birthDate || "";
    const age = calculateAgeFromBirthDate(birthDate);
    const ageDisplay = Number.isInteger(age) ? `${age} ปี` : "- ปี";
    const startedProgram = player.started_program || player.startedProgram || createDateValue();
    const resolvedProgramDayCount = programDayCount
        ?? player.programDayCount
        ?? player.program_day_count
        ?? null;
    const calculatedProgramEndDate = getProgramEndDate(startedProgram, resolvedProgramDayCount);
    const endedProgram = programEndedAt || calculatedProgramEndDate || "";

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
                        <span>เบอร์โทร :</span>
                        <div id="player-info-phone" class="player-info-value">${escapeHtml(phoneDisplay)}</div>
                    </label>

                    <label class="player-info-row">
                        <span>เพศ :</span>
                        <div id="player-info-gender" class="player-info-value">${escapeHtml(player.gender || "")}</div>
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
        const exportSelection = await showExportOptionsPopup();

        if (!exportSelection?.exportTypes?.length) {
            feedback.textContent = "";
            return;
        }

        feedback.textContent = "กำลังเตรียมข้อมูลสำหรับส่งออก...";

        try {
            const exported = await onExport(player, exportSelection);
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
