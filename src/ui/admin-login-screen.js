import { renderFramePanel } from "./components/frame-panel.js";
import { renderFrameTextFieldBox } from "./components/frame-text-field-box.js";
import { renderStartGameButton } from "./components/start-game-button.js";

function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
}

export function renderAdminLoginScreen(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        onSubmit = () => {},
    } = options;

    // US-E7-02: Figma login art — Frame_Panel + Frame_TextFieldBox + Start-Game-Button.
    root.innerHTML = `
        <section class="gh-login gh-login--admin" aria-labelledby="admin-login-title">
            <form id="admin-login-form" class="gh-login__stack" novalidate>
                ${renderFramePanel({
                    className: "gh-login__panel gh-admin-login-padding__panel",
                    body: `
                        <h1 id="admin-login-title" class="gh-login__title">ลงชื่อเข้าใช้</h1>
                        <div class="gh-login__row gh-login-grid__row">
                            <label class="gh-login__row-label" for="admin-email-input"><p class="gh-login-text-field">อีเมลผู้ดูแล :</p></label>
                            ${renderFrameTextFieldBox({
                                id: "admin-email-input",
                                type: "email",
                                inputmode: "email",
                                placeholder: "กรอกอีเมลผู้ดูแล",
                                autocomplete: "username",
                            })}
                        </div>
                        <div class="gh-login__row gh-login-grid__row">
                            <label class="gh-login__row-label" for="admin-password-input"><p class="gh-login-text-field">รหัสผ่าน :</p></label>
                            ${renderFrameTextFieldBox({
                                id: "admin-password-input",
                                type: "password",
                                placeholder: "กรอกรหัสผ่าน",
                                autocomplete: "current-password",
                            })}
                        </div>
                        <p id="admin-login-feedback" class="gh-login__feedback" aria-live="polite"></p>
                    `,
                })}
                <div class="login-screen__actions">
                ${renderStartGameButton({ label: "เข้าสู่ระบบ", disabled: true })}
                </div>
            </form>
        </section>
    `;

    const form = root.querySelector("#admin-login-form");
    const emailInput = root.querySelector("#admin-email-input");
    const passwordInput = root.querySelector("#admin-password-input");
    const submitButton = root.querySelector(".gh-start-button");
    const feedback = root.querySelector("#admin-login-feedback");

    if (!form || !emailInput || !passwordInput || !submitButton || !feedback) {
        return;
    }

    const setError = (input, hasError) => {
        input?.closest(".gh-frame-field-box")?.classList.toggle("gh-frame-field-box--error", Boolean(hasError));
    };

    const updateState = () => {
        const hasEmail = normalizeEmail(emailInput.value).length > 0;
        const hasPassword = String(passwordInput.value || "").trim().length > 0;

        submitButton.disabled = !(hasEmail && hasPassword);
        feedback.textContent = "";
        setError(emailInput, false);
        setError(passwordInput, false);
    };

    const onEnter = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            form.requestSubmit();
        }
    };

    emailInput.addEventListener("input", updateState);
    passwordInput.addEventListener("input", updateState);
    emailInput.addEventListener("keydown", onEnter);
    passwordInput.addEventListener("keydown", onEnter);
    submitButton.addEventListener("click", () => {
        if (!submitButton.disabled) {
            form.requestSubmit();
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = normalizeEmail(emailInput.value);
        const password = String(passwordInput.value || "").trim();

        if (!email || !password) {
            setError(emailInput, !email);
            setError(passwordInput, !password);
            feedback.textContent = "";
            return;
        }

        submitButton.disabled = true;
        emailInput.disabled = true;
        passwordInput.disabled = true;
        feedback.textContent = "กำลังตรวจสอบข้อมูลผู้ดูแล...";

        try {
            const accepted = await onSubmit({ email, password });
            if (accepted === false) {
                emailInput.disabled = false;
                passwordInput.disabled = false;
                updateState();
            }
        } catch (error) {
            console.error("Admin login flow failed:", error);
            feedback.textContent = error?.message || "";
            emailInput.disabled = false;
            passwordInput.disabled = false;
            submitButton.disabled = false;
        }
    });

    updateState();
}
