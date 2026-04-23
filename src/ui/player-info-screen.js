function createDateValue() {
    return new Date().toISOString().slice(0, 10);
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
    const startedProgram = player.started_program || player.startedProgram || createDateValue();
    const endedProgram = programEndedAt || createDateValue();

    root.innerHTML = `
        <section class="player-info-screen" aria-labelledby="player-info-title">
            <div class="player-info-card">
                <h1 id="player-info-title">ข้อมูลผู้เล่น</h1>

                <form id="player-info-form" class="player-info-form" novalidate>
                    <label class="player-info-row">
                        <span>หมายเลข HN :</span>
                        <md-outlined-text-field
                            id="player-info-hn"
                            value="${hn}"
                            readonly
                            no-asterisk
                        ></md-outlined-text-field>
                    </label>

                    <label class="player-info-row">
                        <span>ชื่อ :</span>
                        <md-outlined-text-field
                            id="player-info-firstname"
                            value="${player.firstname || ""}"
                            readonly
                            no-asterisk
                        ></md-outlined-text-field>
                    </label>

                    <label class="player-info-row">
                        <span>นามสกุล :</span>
                        <md-outlined-text-field
                            id="player-info-lastname"
                            value="${player.lastname || ""}"
                            readonly
                            no-asterisk
                        ></md-outlined-text-field>
                    </label>

                    <label class="player-info-row">
                        <span>อายุ :</span>
                        <md-outlined-text-field
                            id="player-info-age"
                            value="${player.age || ""}"
                            readonly
                            no-asterisk
                        ></md-outlined-text-field>
                    </label>

                    <label class="player-info-row">
                        <span>เพศ :</span>
                        <md-outlined-text-field
                            id="player-info-gender"
                            value="${player.gender || ""}"
                            readonly
                            no-asterisk
                        ></md-outlined-text-field>
                    </label>

                    <label class="player-info-row">
                        <span>การศึกษา :</span>
                        <md-outlined-text-field
                            id="player-info-education"
                            value="${player.education_level || player.educationLevel || ""}"
                            readonly
                            no-asterisk
                        ></md-outlined-text-field>
                    </label>

                    <label class="player-info-row player-info-row--date">
                        <span>วันที่เริ่มโปรแกรม :</span>
                        <md-outlined-text-field
                            id="player-info-started"
                            value="${formatDisplayDate(startedProgram)}"
                            readonly
                            no-asterisk
                        ></md-outlined-text-field>
                    </label>

                    <label class="player-info-row player-info-row--date">
                        <span>วันที่จบโปรแกรม :</span>
                        <md-outlined-text-field
                            id="player-info-ended"
                            value="${formatDisplayDate(endedProgram)}"
                            readonly
                            no-asterisk
                        ></md-outlined-text-field>
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
