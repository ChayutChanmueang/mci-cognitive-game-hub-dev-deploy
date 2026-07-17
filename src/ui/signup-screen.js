import { calculateAgeFromBirthDate } from "../util/patient-date-util.js";
import {
    formatThaiPhoneNumber,
    isCompleteThaiPhoneNumber,
    normalizeThaiPhoneNumber,
} from "../util/phone-number-util.js";
import { getCurrentBuddhistYear } from "../util/thai-era-date.js";
import { renderFrameFormPanel } from "./components/frame-form-panel.js";
import { renderIconButtonBack } from "./components/icon-button-back.js";
import { renderButtonOk } from "./components/button-ok.js";
import { renderThaiDateSelect, attachThaiDateSelect } from "./components/thai-date-select.js";
import { showToast, clearToast } from "./components/toast.js";

// US-E9-11: the form speaks พ.ศ.; the database keeps ค.ศ. The date selects convert at the boundary.
const MAX_PATIENT_AGE_YEARS = 120;
const PROGRAM_START_BACKDATE_YEARS = 10;

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
        loadRandomTreeType = null,
        onSubmit = () => {},
    } = options;

    const hnLabel = initialHn ? `ID${initialHn}` : "-";
    const currentBuddhistYear = getCurrentBuddhistYear();
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
                            ${renderThaiDateSelect({
                                id: "signup-birth-date",
                                ariaLabel: "วันเกิด",
                                minYear: currentBuddhistYear - MAX_PATIENT_AGE_YEARS,
                                maxYear: currentBuddhistYear,
                            })}

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
                            ${renderThaiDateSelect({
                                id: "signup-started-program",
                                ariaLabel: "วันที่เริ่มโปรแกรม",
                                value: createDateValue(),
                                minYear: currentBuddhistYear - PROGRAM_START_BACKDATE_YEARS,
                                maxYear: currentBuddhistYear,
                            })}
                        </div>

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
    const firstnameField = root.querySelector("#signup-firstname");
    const lastnameField = root.querySelector("#signup-lastname");
    const phoneField = root.querySelector("#signup-phone");
    const genderField = root.querySelector("#signup-gender");
    const educationLevelField = root.querySelector("#signup-education-level");
    const ageValue = root.querySelector("#signup-age-value");

    if (!form || !backButton || !submitButton) {
        return;
    }

    const updateAgeDisplay = () => {
        if (!ageValue) {
            return;
        }

        // getValue() is ISO ค.ศ., which is what calculateAgeFromBirthDate expects.
        const age = calculateAgeFromBirthDate(birthDate?.getValue());
        ageValue.textContent = Number.isInteger(age) ? `${age} ปี` : "- ปี";
    };

    const birthDate = attachThaiDateSelect(root, "signup-birth-date", {
        onChange: () => {
            birthDate?.setError(false);
            updateAgeDisplay();
        },
    });
    const startedProgram = attachThaiDateSelect(root, "signup-started-program", {
        onChange: () => startedProgram?.setError(false),
    });

    updateAgeDisplay();

    // US-E7-18: surface a failed education-levels load (blocks submit) as a toast.
    if (initialFeedback) {
        showToast(initialFeedback, { type: "error", duration: 6000 });
    }

    const updatePhoneDisplay = () => {
        if (!phoneField) {
            return;
        }

        phoneField.value = formatThaiPhoneNumber(phoneField.value);
        clearFieldError(phoneField);
    };

    phoneField?.addEventListener("input", updatePhoneDisplay);
    phoneField?.addEventListener("change", updatePhoneDisplay);

    // The two date groups own their own error state via their controllers, so they are not listed here.
    const requiredFields = [
        firstnameField,
        lastnameField,
        phoneField,
        genderField,
        educationLevelField,
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
            // Already ISO ค.ศ. — the พ.ศ. the user picked never leaves the date select.
            birthDate: birthDate?.getValue() || "",
            gender: String(genderField?.value || "").trim(),
            educationLevel: String(educationLevelField?.value || "").trim(),
            startedProgram: startedProgram?.getValue() || "",
        };
        let hasInvalidField = false;
        let firstErrorMessage = "";

        requiredFields.forEach((field) => clearFieldError(field));
        birthDate?.setError(false);
        startedProgram?.setError(false);

        const fail = (field, message) => {
            setFieldError(field);
            hasInvalidField = true;
            if (!firstErrorMessage) {
                firstErrorMessage = message;
            }
        };

        const failDate = (controller, message) => {
            controller?.setError(true);
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

        if (!formData.birthDate) {
            failDate(birthDate, "กรุณาเลือกวันเกิดให้ครบ วัน เดือน และปี พ.ศ.");
        } else if (new Date(formData.birthDate) > new Date()) {
            failDate(birthDate, "วันเกิดต้องไม่เป็นวันในอนาคต");
        }

        if (!formData.gender) {
            fail(genderField, "กรุณาเลือกเพศ");
        }

        if (!formData.educationLevel) {
            fail(educationLevelField, "กรุณาเลือกระดับการศึกษา");
        }

        if (!formData.startedProgram) {
            failDate(startedProgram, "กรุณาเลือกวันที่เริ่มโปรแกรมให้ครบ วัน เดือน และปี พ.ศ.");
        }

        if (hasInvalidField) {
            showToast(firstErrorMessage, { type: "error" });
            return;
        }

        sessionStorage.setItem("patient_signup_draft", JSON.stringify(formData));
        submitButton.disabled = true;
        showToast("กำลังบันทึกข้อมูลผู้ป่วย...", { type: "info", duration: 0 });

        try {
            if (typeof loadRandomTreeType === "function") {
                formData.treeType = await loadRandomTreeType();
            }
            const submitted = await onSubmit(formData);
            if (submitted === false) {
                clearToast();
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

            showToast(message, { type: "error" });
            submitButton.disabled = false;
            return;
        }

        clearToast();
    });
}
