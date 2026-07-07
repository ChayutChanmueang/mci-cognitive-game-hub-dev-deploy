import { renderFramePanel } from "./components/frame-panel.js";
import { renderFrameTextFieldBox } from "./components/frame-text-field-box.js";
import { renderStartGameButton } from "./components/start-game-button.js";
import { showToast, clearToast } from "./components/toast.js";

function normalizePatientId(value) {
    return String(value || "").replaceAll(/\D/g, "");
}

export function renderLoginScreen(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        onAccept = () => {},
        initialPatientCode = "",
    } = options;

    // US-E7-02: Figma login art — Frame_Panel + Frame_TextFieldBox + Start-Game-Button.
    root.innerHTML = `
        <section class="gh-login" aria-labelledby="login-title">
            <form id="patient-login-form" class="gh-login__stack" novalidate>
                ${renderFramePanel({
                    className: "gh-login__panel gh-login-padding__panel",
                    body: `
                        <h1 id="login-title" class="gh-login__title">ลงชื่อเข้าใช้</h1>
                        <div class="gh-login__row">
                            ${renderFrameTextFieldBox({
                                id: "patient-id-input",
                                type: "text",
                                inputmode: "numeric",
                                placeholder: "กรอกหมายเลข HN",
                                autocomplete: "off",
                                ariaLabel: "กรอกหมายเลข HN",
                                align: "center",
                                className: "gh-login__field",
                            })}
                        </div>
                    `,
                })}
                <div class="login-screen__actions">
                ${renderStartGameButton({ label: "เข้าสู่ระบบ", disabled: true })}
                </div>
            </form>
        </section>
    `;

    const form = root.querySelector("#patient-login-form");
    const input = root.querySelector("#patient-id-input");
    const submitButton = root.querySelector(".gh-start-button");
    const fieldBox = input?.closest(".gh-frame-field-box");

    if (!form || !input || !submitButton) {
        return;
    }

    if (initialPatientCode) {
        input.value = normalizePatientId(initialPatientCode);
    }

    const setError = (hasError) => {
        fieldBox?.classList.toggle("gh-frame-field-box--error", Boolean(hasError));
    };

    const updateState = () => {
        input.value = normalizePatientId(input.value);
        submitButton.disabled = input.value.length === 0;
        clearToast();
        setError(false);
    };

    input.addEventListener("input", updateState);
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            form.requestSubmit();
        }
    });
    submitButton.addEventListener("click", () => {
        if (!submitButton.disabled) {
            form.requestSubmit();
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const patientId = normalizePatientId(input.value);
        if (!patientId) {
            setError(true);
            showToast("กรุณากรอกรหัสผู้เล่น", { type: "error" });
            submitButton.disabled = true;
            return;
        }

        sessionStorage.setItem("patient_login_id", patientId);
        submitButton.disabled = true;
        input.disabled = true;
        showToast("กำลังตรวจสอบข้อมูล...", { type: "info", duration: 0 });

        try {
            const accepted = await onAccept({ patientId });
            if (accepted === false) {
                input.disabled = false;
                updateState();
            } else {
                clearToast();
            }
        } catch (error) {
            console.error("Patient login flow failed:", error);
            setError(true);
            showToast(error?.message || "ไม่สามารถตรวจสอบรหัสผู้เล่นได้", { type: "error" });
            input.disabled = false;
            submitButton.disabled = false;
        }
    });

    updateState();
}
