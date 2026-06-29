import { calculateAgeFromBirthDate } from "../util/patient-date-util.js";
import {
    formatThaiPhoneNumber,
    isCompleteThaiPhoneNumber,
    normalizeThaiPhoneNumber,
} from "../util/phone-number-util.js";
import { renderFrameFormPanel } from "./components/frame-form-panel.js";
import { renderIconButtonBack } from "./components/icon-button-back.js";
import { renderButtonOk } from "./components/button-ok.js";

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

// US-E7-02: native controls live inside Frame_TextFieldBox surfaces, so errors are shown
// via the box's red-stroke modifier instead of the old Material `error` attribute.
function setFieldError(input) {
    input?.closest(".gh-frame-field-box")?.classList.add("gh-frame-field-box--error");
}

function clearFieldError(input) {
    input?.closest(".gh-frame-field-box")?.classList.remove("gh-frame-field-box--error");
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

    const hnLabel = initialHn ? `ID${initialHn}` : "-";
    const educationOptionsMarkup = educationLevels
        .map((level) => `<option value="${escapeHtml(level?.eduid || "")}">${escapeHtml(level?.name || "")}</option>`)
        .join("");
    const isEducationLevelAvailable = educationLevels.length > 0 && !educationLevelsError;
    const initialFeedback = educationLevelsError || "";

    const fieldInput = ({ id, type = "text", inputmode, placeholder = "", value = "", extra = "" }) => `
        <div class="gh-frame-field-box">
            <input
                id="${escapeHtml(id)}"
                class="gh-frame-field-box__input"
                type="${escapeHtml(type)}"
                ${inputmode ? `inputmode="${escapeHtml(inputmode)}"` : ""}
                ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ""}
                ${value ? `value="${escapeHtml(value)}"` : ""}
                aria-label="${escapeHtml(placeholder || id)}"
                ${extra}
            />
        </div>`;

    const fieldSelect = ({ id, options: opts, disabled = false }) => `
        <div class="gh-frame-field-box">
            <select id="${escapeHtml(id)}" class="gh-frame-field-box__select" aria-label="${escapeHtml(id)}" ${disabled ? "disabled" : ""}>
                ${opts}
            </select>
        </div>`;

    // US-E7-02: Figma art — Frame_Form_Panel + Frame_TextFieldBox + Button_OK.
    root.innerHTML = `
        <section class="gh-form" aria-labelledby="signup-title">
            <form id="patient-signup-form" class="gh-form__stack" novalidate>
                ${renderFrameFormPanel({
                    header: `
                        ${renderIconButtonBack({ id: "signup-back-button", ariaLabel: "กลับ" })}
                        <h1 id="signup-title" class="gh-frame-form-panel__title">ลงทะเบียน</h1>
                    `,
                    body: `
                        <div class="gh-form__rows">
                            <span class="gh-form__label">หมายเลข ID :</span>
                            <div class="gh-frame-field-box"><div class="gh-frame-field-box__value">${escapeHtml(hnLabel)}</div></div>

                            <span class="gh-form__label">ชื่อ :</span>
                            ${fieldInput({ id: "signup-firstname", placeholder: "เช่น สมชาย" })}

                            <span class="gh-form__label">นามสกุล :</span>
                            ${fieldInput({ id: "signup-lastname", placeholder: "เช่น ใจดี" })}

                            <span class="gh-form__label">เบอร์โทร :</span>
                            ${fieldInput({ id: "signup-phone", type: "tel", inputmode: "tel", placeholder: "เช่น 081-234-5678" })}

                            <span class="gh-form__label">เพศ :</span>
                            ${fieldSelect({
                                id: "signup-gender",
                                options: `
                                    <option value="" disabled selected>เลือกเพศ</option>
                                    <option value="male">ชาย</option>
                                    <option value="female">หญิง</option>
                                    <option value="other">อื่น ๆ</option>
                                    <option value="unknown">ยังไม่ระบุ</option>
                                `,
                            })}

                            <span class="gh-form__label">วันเกิด :</span>
                            ${fieldInput({ id: "signup-birth-date", type: "date", extra: 'lang="en-GB"' })}

                            <span class="gh-form__label">อายุ :</span>
                            <div class="gh-frame-field-box"><div id="signup-age-value" class="gh-frame-field-box__value">- ปี</div></div>

                            <span class="gh-form__label">การศึกษา :</span>
                            ${fieldSelect({
                                id: "signup-education-level",
                                disabled: !isEducationLevelAvailable,
                                options: `
                                    <option value="" disabled selected>เลือกระดับการศึกษา</option>
                                    ${educationOptionsMarkup}
                                `,
                            })}

                            <span class="gh-form__label">วันที่เริ่มโปรแกรม :</span>
                            ${fieldInput({ id: "signup-started-program", type: "date", value: createDateValue(), extra: 'lang="en-GB"' })}
                        </div>

                        <p id="signup-feedback" class="gh-form__feedback" aria-live="polite">${escapeHtml(initialFeedback)}</p>

                        <div class="gh-form__actions">
                            ${renderButtonOk({ id: "signup-submit-button", label: "ยืนยันข้อมูลผู้เล่น", disabled: !isEducationLevelAvailable })}
                        </div>
                    `,
                })}
            </form>
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

    submitButton.addEventListener("click", () => {
        if (!submitButton.disabled) {
            form.requestSubmit();
        }
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
        let firstErrorMessage = "";
        const normalizedBirthDate = new Date(formData.birthDate);

        requiredFields.forEach((field) => clearFieldError(field));

        const fail = (field, message) => {
            setFieldError(field);
            hasInvalidField = true;
            if (!firstErrorMessage) {
                firstErrorMessage = message;
            }
        };

        if (!formData.firstname) {
            fail(firstnameField, "กรุณากรอกชื่อ");
        }

        if (!formData.lastname) {
            fail(lastnameField, "กรุณากรอกนามสกุล");
        }

        if (!formData.phone) {
            fail(phoneField, "กรุณากรอกเบอร์โทร");
        } else if (!isCompleteThaiPhoneNumber(formData.phone)) {
            fail(phoneField, "กรุณากรอกเบอร์โทร 10 หลัก");
        }

        if (!isValidDateValue(formData.birthDate)) {
            fail(birthDateField, "กรุณาเลือกวันเกิด");
        } else if (normalizedBirthDate > new Date()) {
            fail(birthDateField, "วันเกิดต้องไม่เป็นวันในอนาคต");
        }

        if (!formData.gender) {
            fail(genderField, "กรุณาเลือกเพศ");
        }

        if (!formData.educationLevel) {
            fail(educationLevelField, "กรุณาเลือกระดับการศึกษา");
        }

        if (!isValidDateValue(formData.startedProgram)) {
            fail(startedProgramField, "กรุณาเลือกวันที่เริ่มโปรแกรม");
        }

        if (hasInvalidField) {
            feedback.textContent = firstErrorMessage;
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
                setFieldError(phoneField);
            }

            feedback.textContent = message;
            submitButton.disabled = false;
            return;
        }

        feedback.textContent = "";
    });
}
