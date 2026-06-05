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
                        <div class="player-info-export-popup__group" aria-label="ขอบเขตข้อมูล">
                            <label class="player-info-export-popup__option player-info-export-popup__scope">
                                <span class="player-info-export-popup__scope-copy">
                                    <span class="player-info-export-popup__scope-title">ส่งออกข้อมูล ผู้เล่นคนนี้/ทุกคน</span>
                                    <span class="player-info-export-popup__scope-value" data-export-scope-value>
                                        ข้อมูลของผู้เล่นคนนี้
                                    </span>
                                </span>
                                <md-switch
                                    aria-label="ส่งออกข้อมูลทั้งหมด"
                                    data-export-scope-switch
                                    icons
                                ></md-switch>
                            </label>
                        </div>
                        <label class="player-info-export-popup__option">
                            <md-checkbox
                                aria-label="ส่งออกข้อมูลผู้เล่น"
                                touch-target="wrapper"
                                data-export-option="${CsvExportType.Player}"
                                checked
                            ></md-checkbox>
                            <span>ส่งออกข้อมูลผู้เล่น</span>
                        </label>
                        <label class="player-info-export-popup__option">
                            <md-checkbox
                                aria-label="ส่งออกข้อมูลการเล่นเกม"
                                touch-target="wrapper"
                                data-export-option="${CsvExportType.Game}"
                            ></md-checkbox>
                            <span>ส่งออกข้อมูลการเล่นเกม</span>
                        </label>
                        <label class="player-info-export-popup__option">
                            <md-checkbox
                                aria-label="ส่งออกประวัติการเล่นรายวัน"
                                touch-target="wrapper"
                                data-export-option="${CsvExportType.History}"
                            ></md-checkbox>
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
        const scopeSwitch = overlay.querySelector("[data-export-scope-switch]");
        const scopeValue = overlay.querySelector("[data-export-scope-value]");
        const updateScopeValue = () => {
            if (!scopeValue) {
                return;
            }

            scopeValue.textContent = scopeSwitch?.selected
                ? "ข้อมูลของผู้เล่นทุกคน"
                : "ข้อมูลของผู้เล่นคนนี้";
        };
        const getSelection = () => ({
            exportScope: scopeSwitch?.selected ? CsvExportScope.All : CsvExportScope.Current,
            exportTypes: [...overlay.querySelectorAll("[data-export-option]")]
                .filter((checkbox) => checkbox.checked)
                .map((checkbox) => String(checkbox.getAttribute("data-export-option") || "").trim())
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
        scopeSwitch?.addEventListener("change", updateScopeValue);
        updateScopeValue();

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
        <section class="player-info-screen" aria-labelledby="player-info-title">
            <div class="player-info-card">
                <header class="player-info-card__header">
                    <md-filled-tonal-icon-button id="player-info-back" class="player-info-back" aria-label="กลับไปหน้าเกม" type="button">
                        <md-icon class="material-symbols-rounded">arrow_back</md-icon>
                    </md-filled-tonal-icon-button>
                    <h1 id="player-info-title">ข้อมูลผู้เล่น</h1>
                    <span aria-hidden="true"></span>
                </header>

                <form id="player-info-form" class="player-info-form" novalidate>
                    <label class="player-info-row">
                        <span>หมายเลข ID :</span>
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
                        <div id="player-info-gender" class="player-info-value">${escapeHtml(formatGenderDisplay(player.gender))}</div>
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
                        <md-filled-button id="player-info-export" type="button">
                            ส่งออกข้อมูล
                        </md-filled-button>
                        <md-filled-button id="player-info-logout" type="button">
                            ลงชื่อออก
                        </md-filled-button>
                    </div>
                </form>
            </div>
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
    const feedback = root.querySelector("#player-info-feedback");
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

        root.querySelector("[data-test-logout]")?.addEventListener("click", () => {
            onTestLogout();
            closeTestMenus();
        });
    };

    if (!form || !backButton || !exportButton || !logoutButton || !feedback) {
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
    };

    exportButton.addEventListener("click", handleExport);

    form.addEventListener("submit", (event) => {
        event.preventDefault();
    });
}
