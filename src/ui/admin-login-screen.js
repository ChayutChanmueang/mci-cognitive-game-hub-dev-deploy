function toggleFieldError(input, hasError) {
    if (!input) {
        return;
    }

    if (hasError) {
        input.setAttribute("error", "");
    } else {
        input.removeAttribute("error");
    }
}

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

    root.innerHTML = `
        <section class="login-screen admin-login-screen" aria-labelledby="admin-login-title">
            <div class="login-card admin-login-card">
                <h1 id="admin-login-title">ข้อมูลผู้ใช้งาน</h1>

                <form id="admin-login-form" class="admin-login-form" novalidate>
                    <label class="admin-login-label" for="admin-email-input">อีเมลผู้ดูแล :</label>
                    <md-outlined-text-field
                        id="admin-email-input"
                        class="admin-login-field"
                        label="กรอกอีเมลผู้ดูแล"
                        type="email"
                        inputmode="email"
                        autocomplete="username"
                        required
                        no-asterisk
                        error-text="กรุณากรอกอีเมลผู้ดูแลให้ถูกต้อง"
                    ></md-outlined-text-field>

                    <label class="admin-login-label" for="admin-password-input">รหัสผ่าน :</label>
                    <md-outlined-text-field
                        id="admin-password-input"
                        class="admin-login-field"
                        label="กรอกรหัสผ่าน"
                        type="password"
                        autocomplete="current-password"
                        required
                        no-asterisk
                        error-text="กรุณากรอกรหัสผ่าน"
                    ></md-outlined-text-field>

                    <p id="admin-login-feedback" class="login-feedback admin-login-feedback" aria-live="polite"></p>

                    <md-filled-button id="admin-login-submit" class="login-submit-button admin-login-submit" type="submit" disabled>
                        ลงชื่อเข้าใช้
                    </md-filled-button>
                </form>
            </div>
        </section>
    `;

    const form = root.querySelector("#admin-login-form");
    const emailInput = root.querySelector("#admin-email-input");
    const passwordInput = root.querySelector("#admin-password-input");
    const submitButton = root.querySelector("#admin-login-submit");
    const feedback = root.querySelector("#admin-login-feedback");

    if (!form || !emailInput || !passwordInput || !submitButton || !feedback) {
        return;
    }

    const updateState = () => {
        const email = normalizeEmail(emailInput.value);
        const hasPassword = String(passwordInput.value || "").trim().length > 0;
        const hasEmail = email.length > 0;

        submitButton.disabled = !(hasEmail && hasPassword);
        feedback.textContent = "";
        toggleFieldError(emailInput, false);
        toggleFieldError(passwordInput, false);
    };

    emailInput.addEventListener("input", updateState);
    passwordInput.addEventListener("input", updateState);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = normalizeEmail(emailInput.value);
        const password = String(passwordInput.value || "").trim();

        if (!email || !password) {
            toggleFieldError(emailInput, !email);
            toggleFieldError(passwordInput, !password);
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
