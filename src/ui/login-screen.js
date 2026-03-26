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

export function renderLoginScreen(root, options = {}) {
    if (!root) {
        return;
    }

    const { onAccept = () => {} } = options;

    root.innerHTML = `
        <section class="auth-screen">
            <div class="auth-shell auth-shell--login">
                <div class="auth-brand">
                    <p class="auth-eyebrow">Brain Training Setup</p>
                    <h1>Setup Patient</h1>
                    <p class="auth-copy">
                        กรุณากรอก patient ID หรือ HN ที่ได้รับจากแพทย์ก่อนเริ่มใช้งานระบบฝึกสมอง
                    </p>
                </div>

                <div class="auth-card">
                    <div class="auth-card__header">
                        <span class="material-symbols-rounded auth-card__icon" aria-hidden="true">badge</span>
                        <div>
                            <h2>Patient Login</h2>
                            <p>หน้านี้เป็น mockup สำหรับ flow login ด้วยรหัสผู้ป่วย</p>
                        </div>
                    </div>

                    <form id="patient-login-form" class="auth-form" novalidate>
                        <md-outlined-text-field
                            id="patient-id-input"
                            class="auth-field"
                            label="Patient ID / HN"
                            placeholder="เช่น HN-000123"
                            required
                            supporting-text="กรอกรหัสผู้ป่วยเพื่อดำเนินการต่อ"
                        ></md-outlined-text-field>

                        <p id="patient-login-feedback" class="auth-feedback" aria-live="polite">
                            กรอกรหัสผู้ป่วยก่อนกด Accept ID
                        </p>

                        <div class="auth-actions auth-actions--login-only">
                            <md-filled-button id="patient-login-submit" type="submit" disabled>
                                <span slot="icon" class="material-symbols-rounded">arrow_forward</span>
                                Accept ID
                            </md-filled-button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    `;

    const form = root.querySelector("#patient-login-form");
    const input = root.querySelector("#patient-id-input");
    const submitButton = root.querySelector("#patient-login-submit");
    const feedback = root.querySelector("#patient-login-feedback");

    if (!form || !input || !submitButton || !feedback) {
        return;
    }

    const updateState = () => {
        const value = String(input.value || "").trim();
        const hasValue = value.length > 0;

        submitButton.disabled = !hasValue;
        feedback.textContent = hasValue
            ? "กด Accept ID เพื่อไปยังขั้นตอนถัดไป"
            : "กรอกรหัสผู้ป่วยก่อนกด Accept ID";

        toggleFieldError(input, false);
    };

    input.addEventListener("input", updateState);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const patientId = String(input.value || "").trim();
        if (!patientId) {
            toggleFieldError(input, true);
            feedback.textContent = "กรุณากรอกรหัสผู้ป่วย";
            submitButton.disabled = true;
            return;
        }

        sessionStorage.setItem("patient_login_id", patientId);
        submitButton.disabled = true;
        input.disabled = true;
        feedback.textContent = "กำลังตรวจสอบรหัสผู้ป่วย...";

        try {
            await onAccept({ patientId });
        } catch (error) {
            console.error("Patient login flow failed:", error);
            toggleFieldError(input, true);
            feedback.textContent = error?.message || "ไม่สามารถตรวจสอบรหัสผู้ป่วยได้";
            input.disabled = false;
            updateState();
        }
    });

    updateState();
}
