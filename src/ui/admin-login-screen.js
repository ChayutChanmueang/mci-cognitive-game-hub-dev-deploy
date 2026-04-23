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
                    <label class="admin-login-label" for="admin-username-input">ชื่อผู้ใช้ผู้ดูแล :</label>
                    <md-outlined-text-field
                        id="admin-username-input"
                        class="admin-login-field"
                        label="กรอกชื่อผู้ใช้ผู้ดูแล"
                        required
                        no-asterisk
                        error-text="กรุณากรอกชื่อผู้ใช้ผู้ดูแล"
                    ></md-outlined-text-field>

                    <label class="admin-login-label" for="admin-password-input">รหัสผ่าน :</label>
                    <md-outlined-text-field
                        id="admin-password-input"
                        class="admin-login-field"
                        label="กรอกรหัสผ่าน"
                        type="password"
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
    const usernameInput = root.querySelector("#admin-username-input");
    const passwordInput = root.querySelector("#admin-password-input");
    const submitButton = root.querySelector("#admin-login-submit");
    const feedback = root.querySelector("#admin-login-feedback");

    if (!form || !usernameInput || !passwordInput || !submitButton || !feedback) {
        return;
    }

    const updateState = () => {
        const hasUsername = String(usernameInput.value || "").trim().length > 0;
        const hasPassword = String(passwordInput.value || "").trim().length > 0;

        submitButton.disabled = !(hasUsername && hasPassword);
        feedback.textContent = "";
        toggleFieldError(usernameInput, false);
        toggleFieldError(passwordInput, false);
    };

    usernameInput.addEventListener("input", updateState);
    passwordInput.addEventListener("input", updateState);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = String(usernameInput.value || "").trim();
        const password = String(passwordInput.value || "").trim();

        if (!username || !password) {
            toggleFieldError(usernameInput, !username);
            toggleFieldError(passwordInput, !password);
            feedback.textContent = "";
            return;
        }

        submitButton.disabled = true;
        usernameInput.disabled = true;
        passwordInput.disabled = true;
        feedback.textContent = "กำลังตรวจสอบข้อมูลผู้ดูแล...";

        try {
            const accepted = await onSubmit({ username, password });
            if (accepted === false) {
                usernameInput.disabled = false;
                passwordInput.disabled = false;
                updateState();
            }
        } catch (error) {
            console.error("Admin login flow failed:", error);
            toggleFieldError(usernameInput, true);
            toggleFieldError(passwordInput, true);
            feedback.textContent = error?.message || "ไม่สามารถเข้าสู่ระบบผู้ดูแลได้";
            usernameInput.disabled = false;
            passwordInput.disabled = false;
            submitButton.disabled = false;
        }
    });

    updateState();
}
