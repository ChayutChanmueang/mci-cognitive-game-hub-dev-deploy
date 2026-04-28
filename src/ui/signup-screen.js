function createDateValue() {
    return new Date().toISOString().slice(0, 10);
}

function calculateAgeFromBirthDate(birthDateValue) {
    const rawValue = String(birthDateValue || "").trim();
    if (!rawValue) {
        return null;
    }

    const parsedBirthDate = new Date(rawValue);
    if (Number.isNaN(parsedBirthDate.getTime())) {
        return null;
    }

    const today = new Date();
    let age = today.getFullYear() - parsedBirthDate.getFullYear();
    const hasBirthdayPassedThisYear = (
        today.getMonth() > parsedBirthDate.getMonth()
        || (
            today.getMonth() === parsedBirthDate.getMonth()
            && today.getDate() >= parsedBirthDate.getDate()
        )
    );

    if (!hasBirthdayPassedThisYear) {
        age -= 1;
    }

    if (age < 0) {
        return null;
    }

    return age;
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export function renderSignupScreen(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        initialHn = "",
        educationLevels = [],
        educationLevelsError = "",
        onBack = () => {},
        onSubmit = () => {},
    } = options;

    const hnLabel = initialHn ? `HN${initialHn}` : "-";
    const educationOptionsMarkup = educationLevels
        .map((level) => `
                                <md-select-option value="${escapeHtml(level?.eduid || "")}">
                                    <div slot="headline">${escapeHtml(level?.name || "")}</div>
                                </md-select-option>
        `)
        .join("");
    const isEducationLevelAvailable = educationLevels.length > 0 && !educationLevelsError;
    const initialFeedback = educationLevelsError || "";

    root.innerHTML = `
        <section class="signup-screen" aria-labelledby="signup-title">
            <div class="signup-card">
                <div class="signup-card__header">
                    <md-icon-button id="signup-back-button" type="button" aria-label="กลับ">
                        <span class="material-symbols-rounded">arrow_back</span>
                    </md-icon-button>
                    <h1 id="signup-title">ข้อมูลผู้เล่น</h1>
                </div>

                <form id="patient-signup-form" class="signup-form" novalidate>
                    <div class="signup-row signup-row--hn">
                        <label>หมายเลข HN :</label>
                        <div class="signup-hn-value">${hnLabel}</div>
                    </div>

                    <div class="signup-fields">
                        <label class="signup-row">
                            <span>ชื่อ :</span>
                            <md-outlined-text-field
                                id="signup-firstname"
                                placeholder="เช่น สมชาย"
                                aria-label="ชื่อ"
                                required
                                no-asterisk
                            ></md-outlined-text-field>
                        </label>

                        <label class="signup-row">
                            <span>นามสกุล :</span>
                            <md-outlined-text-field
                                id="signup-lastname"
                                placeholder="เช่น ใจดี"
                                aria-label="นามสกุล"
                                required
                                no-asterisk
                            ></md-outlined-text-field>
                        </label>

                        <label class="signup-row">
                            <span>วันเกิด :</span>
                            <md-outlined-text-field
                                id="signup-birth-date"
                                aria-label="วันเกิด"
                                type="date"
                                lang="en-GB"
                                required
                                no-asterisk
                            ></md-outlined-text-field>
                        </label>

                        <div class="signup-row">
                            <span>อายุ :</span>
                            <div id="signup-age-value" class="signup-age-value">- ปี</div>
                        </div>

                        <label class="signup-row">
                            <span>เพศ :</span>
                            <md-outlined-select
                                id="signup-gender"
                                aria-label="เพศ"
                                required
                            >
                                <md-select-option value="male">
                                    <div slot="headline">ชาย</div>
                                </md-select-option>
                                <md-select-option value="female">
                                    <div slot="headline">หญิง</div>
                                </md-select-option>
                                <md-select-option value="other">
                                    <div slot="headline">อื่น ๆ</div>
                                </md-select-option>
                                <md-select-option value="unknown">
                                    <div slot="headline">ยังไม่ระบุ</div>
                                </md-select-option>
                            </md-outlined-select>
                        </label>

                        <label class="signup-row">
                            <span>การศึกษา :</span>
                            <md-outlined-select
                                id="signup-education-level"
                                aria-label="การศึกษา"
                                required
                                ${isEducationLevelAvailable ? "" : "disabled"}
                            >
                                <md-select-option value="">
                                    <div slot="headline">เลือกระดับการศึกษา</div>
                                </md-select-option>
                                ${educationOptionsMarkup}
                            </md-outlined-select>
                        </label>

                        <label class="signup-row signup-row--date">
                            <span>วันที่เริ่มโปรแกรม :</span>
                            <md-outlined-text-field
                                id="signup-started-program"
                                aria-label="วันที่เริ่มโปรแกรม"
                                type="date"
                                lang="en-GB"
                                value="${createDateValue()}"
                                required
                                no-asterisk
                            ></md-outlined-text-field>
                        </label>
                    </div>

                    <p id="signup-feedback" class="signup-feedback" aria-live="polite">${escapeHtml(initialFeedback)}</p>

                    <md-filled-button id="signup-submit-button" class="signup-submit-button" type="submit" ${isEducationLevelAvailable ? "" : "disabled"}>
                        ยืนยันข้อมูลผู้เล่น
                    </md-filled-button>
                </form>
            </div>
        </section>
    `;

    const form = root.querySelector("#patient-signup-form");
    const backButton = root.querySelector("#signup-back-button");
    const submitButton = root.querySelector("#signup-submit-button");
    const feedback = root.querySelector("#signup-feedback");
    const birthDateField = root.querySelector("#signup-birth-date");
    const ageValue = root.querySelector("#signup-age-value");

    if (!form || !backButton || !submitButton || !feedback) {
        return;
    }

    const updateAgeDisplay = () => {
        if (!ageValue) {
            return;
        }

        const age = calculateAgeFromBirthDate(birthDateField?.value);
        ageValue.textContent = Number.isInteger(age) ? `${age} ปี` : "- ปี";
    };

    birthDateField?.addEventListener("input", updateAgeDisplay);
    birthDateField?.addEventListener("change", updateAgeDisplay);
    updateAgeDisplay();

    backButton.addEventListener("click", () => {
        onBack();
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = {
            hn: String(initialHn || "").trim(),
            firstname: String(root.querySelector("#signup-firstname")?.value || "").trim(),
            lastname: String(root.querySelector("#signup-lastname")?.value || "").trim(),
            birthDate: String(root.querySelector("#signup-birth-date")?.value || "").trim(),
            gender: String(root.querySelector("#signup-gender")?.value || "").trim(),
            educationLevel: String(root.querySelector("#signup-education-level")?.value || "").trim(),
            startedProgram: String(root.querySelector("#signup-started-program")?.value || "").trim(),
        };

        sessionStorage.setItem("patient_signup_draft", JSON.stringify(formData));
        submitButton.disabled = true;
        feedback.textContent = "กำลังบันทึกข้อมูลผู้ป่วย...";

        try {
            const submitted = await onSubmit(formData);
            if (submitted === false) {
                feedback.textContent = "";
                submitButton.disabled = false;
                return;
            }
        } catch (error) {
            console.error("Patient signup flow failed:", error);
            feedback.textContent = error?.message || "ไม่สามารถบันทึกข้อมูลผู้ป่วยได้";
            submitButton.disabled = false;
            return;
        }

        feedback.textContent = "";
    });
}
