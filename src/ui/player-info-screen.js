import { calculateAgeFromBirthDate } from "../util/patient-date-util.js";
import { formatThaiPhoneNumber } from "../util/phone-number-util.js";
import {
    formatThaiProgramDate,
    getProgramEndDate,
} from "../util/program-date-util.js";
import { showExportOptionsPopup } from "./export-options-popup.js";
import { showRestingPointPopup } from "./resting-point-popup.js";
import { showCheckInPopup } from "./checkin-summary-screen.js";
import { showDayCompletionPopup } from "./day-completion-popup.js";
import { renderFrameFormPanel } from "./components/frame-form-panel.js";
import { renderIconButtonBack } from "./components/icon-button-back.js";
import { renderButtonOk } from "./components/button-ok.js";
import { renderButtonClose } from "./components/button-close.js";
import { showToast, clearToast } from "./components/toast.js";
import db from "../core/database.js";

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

// US-E9-11: the patient card is the record of what was entered, so it spells the พ.ศ. year out in
// full — a two-digit year reads as ambiguous next to a ค.ศ. date. The compact program-day labels
// elsewhere keep the short form.
function formatDisplayDate(value) {
    return formatThaiProgramDate(value, { shortYear: false });
}

function formatGenderDisplay(gender) {
    const map = { male: "ชาย", female: "หญิง", other: "อื่น ๆ", unknown: "ยังไม่ระบุ" };
    return map[String(gender || "").toLowerCase()] || String(gender || "");
}

function normalizeTestGame(item, index = 0) {
    const gid = String(item?.gid || "").trim();
    const name = String(item?.name || `เกมที่ ${index + 1}`).trim();
    const thName = String(item?.th_name || item?.thName || "").trim();

    return {
        ...item,
        gid,
        name,
        th_name: thName,
        displayName: thName || item?.displayName || name || gid || "เกม",
    };
}

function buildTestGameMenuItems(testGames) {
    return (Array.isArray(testGames) ? testGames : [])
        .map((item, index) => normalizeTestGame(item, index))
        .filter((game) => game.gid)
        .map((game) => `
            <md-menu-item data-quick-game-item data-gid="${escapeHtml(game.gid)}">
                <div slot="headline">${escapeHtml(game.displayName || game.name || game.gid || "เกม")}</div>
                <div slot="supporting-text">${escapeHtml(game.gid || "")}</div>
            </md-menu-item>
        `)
        .join("");
}

function buildTestProgramMenuItems(testProgramPresets, activeProgramId) {
    return (Array.isArray(testProgramPresets) ? testProgramPresets : [])
        .map((program) => {
            const programId = Number(program?.id);
            const isCurrent = Number(activeProgramId || 0) > 0 && programId === Number(activeProgramId);
            const description = String(program?.description || "").trim();
            const supportingText = isCurrent
                ? "ใช้อยู่ตอนนี้"
                : description || `Program ID ${programId}`;

            return `
                <md-menu-item data-program-preset-item data-program-id="${escapeHtml(programId)}" ${isCurrent ? "selected" : ""}>
                    <div slot="headline">${escapeHtml(program?.name || `Program ${programId}`)}</div>
                    <div slot="supporting-text">${escapeHtml(supportingText)}</div>
                </md-menu-item>
            `;
        })
        .join("");
}

export function renderPlayerInfoScreen(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        player = {},
        programEndedAt = "",
        programDayCount = null,
        onBack = () => {},
        onEndProgram = () => {},
        onLogout = () => {},
        onExport = () => {},
        testGames = [],
        testProgramPresets = [],
        activeProgramId = null,
        onTestQuickLaunchGame = () => {},
        onTestChangeProgram = () => {},
        onTestClearTodayHistory = () => {},
        onTestCompleteAll = () => {},
        onTestDailyDataTools = () => {},
        onTestLogout = () => {},
    } = options;

    const normalizedTestGames = (Array.isArray(testGames) ? testGames : []).map((item, index) => normalizeTestGame(item, index));
    const menuItems = buildTestGameMenuItems(normalizedTestGames);
    const programItems = buildTestProgramMenuItems(testProgramPresets, activeProgramId);
    const hn = String(player.hn || player.patientCode || "").trim();
    const phoneDisplay = formatThaiPhoneNumber(player.phone || "");
    const birthDate = player.birth_date || player.date || player.birthDate || "";
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
        <section class="gh-form" aria-labelledby="player-info-title">
            <form id="player-info-form" class="gh-form__stack" novalidate>
                ${renderFrameFormPanel({
                    header: `
                        ${renderIconButtonBack({ id: "player-info-back", ariaLabel: "กลับไปหน้าเกม" })}
                        <h1 id="player-info-title" class="gh-frame-form-panel__title">ข้อมูลผู้เล่น</h1>
                    `,
                    body: `
                        <div class="gh-form__rows">
                            <span class="gh-form__label">หมายเลข ID :</span>
                            <div class="gh-frame-field-box"><div id="player-info-hn" class="gh-frame-field-box__value">${escapeHtml(hn)}</div></div>

                            <span class="gh-form__label">ชื่อ :</span>
                            <div class="gh-frame-field-box"><div id="player-info-firstname" class="gh-frame-field-box__value">${escapeHtml(player.firstname || "")}</div></div>

                            <span class="gh-form__label">นามสกุล :</span>
                            <div class="gh-frame-field-box"><div id="player-info-lastname" class="gh-frame-field-box__value">${escapeHtml(player.lastname || "")}</div></div>

                            <span class="gh-form__label">เบอร์โทร :</span>
                            <div class="gh-frame-field-box"><div id="player-info-phone" class="gh-frame-field-box__value">${escapeHtml(phoneDisplay)}</div></div>

                            <span class="gh-form__label">เพศ :</span>
                            <div class="gh-frame-field-box"><div id="player-info-gender" class="gh-frame-field-box__value">${escapeHtml(formatGenderDisplay(player.gender))}</div></div>

                            <span class="gh-form__label">วันเกิด :</span>
                            <div class="gh-frame-field-box"><div id="player-info-birth-date" class="gh-frame-field-box__value">${escapeHtml(formatDisplayDate(birthDate))}</div></div>

                            <span class="gh-form__label">อายุ :</span>
                            <div class="gh-frame-field-box"><div id="player-info-age" class="gh-frame-field-box__value">${escapeHtml(ageDisplay)}</div></div>

                            <span class="gh-form__label">การศึกษา :</span>
                            <div class="gh-frame-field-box"><div id="player-info-education" class="gh-frame-field-box__value">${escapeHtml(player.educationName || player.education_level || player.educationLevel || "")}</div></div>

                            <span class="gh-form__label">วันที่เริ่มโปรแกรม :</span>
                            <div class="gh-frame-field-box"><div id="player-info-started" class="gh-frame-field-box__value">${escapeHtml(formatDisplayDate(startedProgram))}</div></div>

                            <span class="gh-form__label">วันที่จบโปรแกรม :</span>
                            <div class="gh-frame-field-box"><div id="player-info-ended" class="gh-frame-field-box__value">${escapeHtml(formatDisplayDate(endedProgram))}</div></div>
                        </div>

                        <div class="gh-form__actions">
                            ${renderButtonOk({ id: "player-info-export", label: "ส่งออกข้อมูล" })}
                            ${renderButtonClose({ id: "player-info-logout", label: "ลงชื่อออก" })}
                        </div>
                    `,
                })}
            </form>
        </section>
        <div class="hub-clean-test-menu">
            <md-fab class="hub-clean-test-fab" data-test-menu-trigger variant="secondary" aria-label="เปิดเมนูทดสอบ">
                <md-icon class="material-symbols-rounded" slot="icon">settings</md-icon>
            </md-fab>
            <md-menu data-test-menu positioning="popover" has-overflow>
                <md-menu-item data-test-clear-history>
                    <md-icon class="material-symbols-rounded" slot="start">delete</md-icon>
                    <div slot="headline">ลบประวัติการเล่น</div>
                </md-menu-item>
                <md-menu-item data-test-complete-all>
                    <md-icon class="material-symbols-rounded" slot="start">checklist</md-icon>
                    <div slot="headline">เล่นเกมครบทั้งหมด</div>
                </md-menu-item>
                <md-sub-menu anchor-corner="start-end" menu-corner="start-start">
                    <md-menu-item slot="item">
                        <md-icon class="material-symbols-rounded" slot="start">sports_esports</md-icon>
                        <div slot="headline">เลือกเกมทดสอบ</div>
                        <md-icon class="material-symbols-rounded" slot="end">arrow_right</md-icon>
                    </md-menu-item>
                    <md-menu slot="menu" data-test-quick-game-menu positioning="popover">
                        ${menuItems || `<md-menu-item disabled><div slot="headline">ไม่พบรายการเกม</div></md-menu-item>`}
                    </md-menu>
                </md-sub-menu>
                <md-sub-menu anchor-corner="start-end" menu-corner="start-start">
                    <md-menu-item slot="item">
                        <md-icon class="material-symbols-rounded" slot="start">assignment</md-icon>
                        <div slot="headline">เปลี่ยนโปรแกรมผู้ใช้</div>
                        <md-icon class="material-symbols-rounded" slot="end">arrow_right</md-icon>
                    </md-menu-item>
                    <md-menu slot="menu" data-test-program-menu positioning="popover">
                        ${programItems || `<md-menu-item disabled><div slot="headline">ไม่พบรายการโปรแกรม</div></md-menu-item>`}
                    </md-menu>
                </md-sub-menu>
                <md-menu-item data-test-daily-data-tools>
                    <md-icon class="material-symbols-rounded" slot="start">database</md-icon>
                    <div slot="headline">เครื่องมือจัดการข้อมูลรายวันเกม</div>
                </md-menu-item>
                <md-menu-item data-test-resting-popup>
                    <md-icon class="material-symbols-rounded" slot="start">bedtime</md-icon>
                    <div slot="headline">ทดสอบ Resting Popup</div>
                </md-menu-item>
                <md-menu-item data-test-checkin-popup>
                    <md-icon class="material-symbols-rounded" slot="start">park</md-icon>
                    <div slot="headline">ทดสอบ Check-in Popup</div>
                </md-menu-item>
                <md-menu-item data-test-daycompletion-popup>
                    <md-icon class="material-symbols-rounded" slot="start">weekend</md-icon>
                    <div slot="headline">ทดสอบ Popup พักวันนี้</div>
                </md-menu-item>
                <md-divider role="separator" tabindex="-1"></md-divider>
                <md-menu-item data-test-logout>
                    <md-icon class="material-symbols-rounded" slot="start">logout</md-icon>
                    <div slot="headline">ออกจากระบบ</div>
                </md-menu-item>
            </md-menu>
        </div>
    `;

    const form = root.querySelector("#player-info-form");
    const backButton = root.querySelector("#player-info-back");
    const exportButton = root.querySelector("#player-info-export");
    const logoutButton = root.querySelector("#player-info-logout");
    const bindTestControls = () => {
        const testTrigger = root.querySelector("[data-test-menu-trigger]");
        const testMenu = root.querySelector("[data-test-menu]");
        const quickMenu = root.querySelector("[data-test-quick-game-menu]");
        const programMenu = root.querySelector("[data-test-program-menu]");

        const closeTestMenus = () => {
            if (quickMenu) {
                quickMenu.open = false;
            }
            if (programMenu) {
                programMenu.open = false;
            }
            if (testMenu) {
                testMenu.open = false;
            }
            testTrigger?.setAttribute("aria-expanded", "false");
        };

        if (testTrigger && testMenu) {
            testMenu.anchorElement = testTrigger;
            testTrigger.setAttribute("aria-haspopup", "menu");
            testTrigger.setAttribute("aria-expanded", "false");
            testTrigger.addEventListener("click", () => {
                testMenu.open = !testMenu.open;
                testTrigger.setAttribute("aria-expanded", testMenu.open ? "true" : "false");
            });
            testMenu.addEventListener("closed", () => {
                testTrigger.setAttribute("aria-expanded", "false");
            });
        }

        const selectableGameMap = new Map(normalizedTestGames.map((game) => [game.gid, game]));
        root.querySelectorAll("[data-quick-game-item]").forEach((item) => {
            item.addEventListener("click", async () => {
                const selectedGame = selectableGameMap.get(String(item.getAttribute("data-gid") || "").trim());
                if (selectedGame) {
                    await onTestQuickLaunchGame(selectedGame);
                }
                closeTestMenus();
            });
        });

        const selectableProgramMap = new Map(
            (Array.isArray(testProgramPresets) ? testProgramPresets : [])
                .map((program) => [String(program?.id || "").trim(), program]),
        );
        root.querySelectorAll("[data-program-preset-item]").forEach((item) => {
            item.addEventListener("click", async () => {
                const selectedProgramId = String(item.getAttribute("data-program-id") || "").trim();
                const selectedProgram = selectableProgramMap.get(selectedProgramId);
                if (selectedProgram) {
                    await onTestChangeProgram(selectedProgram);
                }
                closeTestMenus();
            });
        });

        root.querySelector("[data-test-clear-history]")?.addEventListener("click", async () => {
            await onTestClearTodayHistory();
            closeTestMenus();
        });

        root.querySelector("[data-test-complete-all]")?.addEventListener("click", async () => {
            await onTestCompleteAll();
            closeTestMenus();
        });

        root.querySelector("[data-test-daily-data-tools]")?.addEventListener("click", async () => {
            await onTestDailyDataTools();
            closeTestMenus();
        });

        root.querySelector("[data-test-resting-popup]")?.addEventListener("click", async () => {
            closeTestMenus();
            await showRestingPointPopup({ durationSeconds: 10 });
        });

        root.querySelector("[data-test-checkin-popup]")?.addEventListener("click", async () => {
            closeTestMenus();
            const totalDays = 14;
            let treeType = "a";
            try {
                const gameProfile = await db.ensureUserGameProfileTreeType({ hn: player?.hn });
                treeType = String(gameProfile?.tree_type || "a").trim();
            } catch (error) {
                console.warn("Unable to load the player's tree type for the check-in test:", error);
            }
            const completedCount = Math.floor(Math.random() * totalDays) + 1;
            const programStart = new Date();
            programStart.setDate(programStart.getDate() - totalDays + 1);
            const checkInDates = Array.from({ length: completedCount }, (_, i) => {
                const date = new Date(programStart);
                date.setDate(date.getDate() + i);
                return date.toISOString();
            });
            await showCheckInPopup({
                checkInDates,
                programStartedAt: programStart.toISOString(),
                defaultDayCount: totalDays,
                loadVideoSrc: () => db.getRandomGameVideoUrl(),
                treeType,
            });
        });

        root.querySelector("[data-test-daycompletion-popup]")?.addEventListener("click", async () => {
            closeTestMenus();
            await showDayCompletionPopup({ gender: player.gender, dismissible: true });
        });

        root.querySelector("[data-test-logout]")?.addEventListener("click", () => {
            onTestLogout();
            closeTestMenus();
        });
    };

    if (!form || !backButton || !exportButton || !logoutButton) {
        return;
    }

    bindTestControls();

    backButton.addEventListener("click", async () => {
        await onBack(player);
    });
    backButton.addEventListener("keydown", async (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
            return;
        }
        event.preventDefault();
        await onBack(player);
    });

    logoutButton.addEventListener("click", async () => {
        await onLogout(player);
    });

    const handleExport = async () => {
        const exportSelection = await showExportOptionsPopup();

        if (!exportSelection?.exportTypes?.length) {
            clearToast();
            return;
        }

        showToast("กำลังเตรียมข้อมูลสำหรับส่งออก...", { type: "info", duration: 0 });

        try {
            const exported = await onExport(player, exportSelection);
            if (exported === false) {
                clearToast();
                return;
            }
        } catch (error) {
            console.error("Player info export failed:", error);
            showToast(error?.message || "ไม่สามารถส่งออกข้อมูลได้", { type: "error" });
            return;
        }

        showToast("ส่งออกข้อมูลเรียบร้อย", { type: "success" });
    };

    exportButton.addEventListener("click", handleExport);

    form.addEventListener("submit", (event) => {
        event.preventDefault();
    });
}
