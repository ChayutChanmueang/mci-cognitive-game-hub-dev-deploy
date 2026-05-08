import { calculateAgeFromBirthDate } from "../util/patient-date-util.js";
import {
    formatThaiPhoneNumber,
    isCompleteThaiPhoneNumber,
    normalizeThaiPhoneNumber,
} from "../util/phone-number-util.js";

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

function setFieldError(input, message = "") {
    if (!input) {
        return;
    }

    input.error = true;
    input.setAttribute("error", "");

    if (message) {
        input.errorText = message;
        input.setAttribute("error-text", message);
    }
}

function clearFieldError(input) {
    if (!input) {
        return;
    }

    input.error = false;
    input.removeAttribute("error");
}

function isValidDateValue(value) {
    const rawValue = String(value || "").trim();
    if (!rawValue) {
        return false;
    }

    const parsedDate = new Date(rawValue);
    return !Number.isNaN(parsedDate.getTime());
}

function getSignupErrorCode(error) {
    const message = String(error?.message || "").toLowerCase();

    if (message.includes("phone") || message.includes("เบอร์โทร")) {
        return "ERR_SIGNUP_PHONE";
    }

    if (message.includes("patient id") || message.includes("hn")) {
        return "ERR_SIGNUP_HN";
    }

    if (message.includes("game") || message.includes("profile")) {
        return "ERR_SIGNUP_GAME_PROFILE";
    }

    return "ERR_SIGNUP_CREATE";
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
                                error-text="กรุณากรอกชื่อ"
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
                                error-text="กรุณากรอกนามสกุล"
                            ></md-outlined-text-field>
                        </label>

                        <label class="signup-row">
                            <span>เบอร์โทร :</span>
                            <md-outlined-text-field
                                id="signup-phone"
                                placeholder="เช่น 081-234-5678"
                                aria-label="เบอร์โทร"
                                type="tel"
                                inputmode="tel"
                                required
                                no-asterisk
                                error-text="กรุณากรอกเบอร์โทร"
                            ></md-outlined-text-field>
                        </label>

                        <label class="signup-row">
                            <span>เพศ :</span>
                            <md-outlined-select
                                id="signup-gender"
                                aria-label="เพศ"
                                required
                                error-text="กรุณาเลือกเพศ"
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
                            <span>วันเกิด :</span>
                            <md-outlined-text-field
                                id="signup-birth-date"
                                aria-label="วันเกิด"
                                type="date"
                                lang="en-GB"
                                required
                                no-asterisk
                                error-text="กรุณาเลือกวันเกิด"
                            ></md-outlined-text-field>
                        </label>

                        <div class="signup-row">
                            <span>อายุ :</span>
                            <div id="signup-age-value" class="signup-age-value">- ปี</div>
                        </div>

                        <label class="signup-row">
                            <span>การศึกษา :</span>
                            <md-outlined-select
                                id="signup-education-level"
                                aria-label="การศึกษา"
                                required
                                error-text="กรุณาเลือกระดับการศึกษา"
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
                                error-text="กรุณาเลือกวันที่เริ่มโปรแกรม"
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
    const firstnameField = root.querySelector("#signup-firstname");
    const lastnameField = root.querySelector("#signup-lastname");
    const phoneField = root.querySelector("#signup-phone");
    const birthDateField = root.querySelector("#signup-birth-date");
    const genderField = root.querySelector("#signup-gender");
    const educationLevelField = root.querySelector("#signup-education-level");
    const startedProgramField = root.querySelector("#signup-started-program");
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

    const updatePhoneDisplay = () => {
        if (!phoneField) {
            return;
        }

        phoneField.value = formatThaiPhoneNumber(phoneField.value);
        clearFieldError(phoneField);
    };

    phoneField?.addEventListener("input", updatePhoneDisplay);
    phoneField?.addEventListener("change", updatePhoneDisplay);

    const requiredFields = [
        firstnameField,
        lastnameField,
        phoneField,
        birthDateField,
        genderField,
        educationLevelField,
        startedProgramField,
    ].filter(Boolean);

    requiredFields.forEach((field) => {
        field.addEventListener("input", () => clearFieldError(field));
        field.addEventListener("change", () => clearFieldError(field));
    });

    backButton.addEventListener("click", () => {
        onBack();
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = {
            hn: String(initialHn || "").trim(),
            firstname: String(firstnameField?.value || "").trim(),
            lastname: String(lastnameField?.value || "").trim(),
            phone: normalizeThaiPhoneNumber(phoneField?.value),
            birthDate: String(birthDateField?.value || "").trim(),
            gender: String(genderField?.value || "").trim(),
            educationLevel: String(educationLevelField?.value || "").trim(),
            startedProgram: String(startedProgramField?.value || "").trim(),
        };
        let hasInvalidField = false;
        const normalizedBirthDate = new Date(formData.birthDate);

        requiredFields.forEach((field) => clearFieldError(field));

        if (!formData.firstname) {
            setFieldError(firstnameField, "กรุณากรอกชื่อ");
            hasInvalidField = true;
        }

        if (!formData.lastname) {
            setFieldError(lastnameField, "กรุณากรอกนามสกุล");
            hasInvalidField = true;
        }

        if (!formData.phone) {
            setFieldError(phoneField, "กรุณากรอกเบอร์โทร");
            hasInvalidField = true;
        } else if (!isCompleteThaiPhoneNumber(formData.phone)) {
            setFieldError(phoneField, "กรุณากรอกเบอร์โทร 10 หลัก");
            hasInvalidField = true;
        }

        if (!isValidDateValue(formData.birthDate)) {
            setFieldError(birthDateField, "กรุณาเลือกวันเกิด");
            hasInvalidField = true;
        } else if (normalizedBirthDate > new Date()) {
            setFieldError(birthDateField, "วันเกิดต้องไม่เป็นวันในอนาคต");
            hasInvalidField = true;
        }

        if (!formData.gender) {
            setFieldError(genderField, "กรุณาเลือกเพศ");
            hasInvalidField = true;
        }

        if (!formData.educationLevel) {
            setFieldError(educationLevelField, "กรุณาเลือกระดับการศึกษา");
            hasInvalidField = true;
        }

        if (!isValidDateValue(formData.startedProgram)) {
            setFieldError(startedProgramField, "กรุณาเลือกวันที่เริ่มโปรแกรม");
            hasInvalidField = true;
        }

        if (hasInvalidField) {
            feedback.textContent = "";
            return;
        }

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
            // TODO: Remove this debug log before production release after signup errors are fully monitored.
            console.error("Patient signup flow failed:", error);
            const errorCode = getSignupErrorCode(error);
            const message = `ไม่สามารถบันทึกข้อมูลผู้ป่วยได้ (${errorCode})`;

            if (errorCode === "ERR_SIGNUP_PHONE") {
                setFieldError(phoneField, message);
            }

            feedback.textContent = message;
            submitButton.disabled = false;
            return;
        }

        feedback.textContent = "";
    });
}
