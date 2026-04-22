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

    const {
        onAccept = () => {},
        initialPatientCode = "",
    } = options;

    root.innerHTML = `
        <section class="login-screen" aria-labelledby="login-title">
            <div class="login-card">
                <h1 id="login-title">ลงชื่อเข้าใช้</h1>

                <form id="patient-login-form" class="login-form" novalidate>
                    <md-outlined-text-field
                        id="patient-id-input"
                        class="login-field"
                        label="กรอกหมายเลข HN"
                        prefix-text="HN  |"
                        required
                        no-asterisk
                        error-text="กรุณากรอกรหัสผู้ป่วย"
                    ></md-outlined-text-field>

                    <p id="patient-login-feedback" class="login-feedback" aria-live="polite"></p>

                    <md-filled-button id="patient-login-submit" class="login-submit-button" type="submit" disabled>
                        ยืนยัน
                    </md-filled-button>
                </form>
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

    if (initialPatientCode) {
        input.value = initialPatientCode;
    }

    const updateState = () => {
        const value = String(input.value || "").trim();
        const hasValue = value.length > 0;

        submitButton.disabled = !hasValue;
        feedback.textContent = "";
        input.errorText = "กรุณากรอกรหัสผู้ป่วย";

        toggleFieldError(input, false);
    };

    input.addEventListener("input", updateState);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const patientId = String(input.value || "").trim();
        if (!patientId) {
            input.errorText = "กรุณากรอกรหัสผู้ป่วย";
            toggleFieldError(input, true);
            feedback.textContent = "";
            submitButton.disabled = true;
            return;
        }

        sessionStorage.setItem("patient_login_id", patientId);
        submitButton.disabled = true;
        input.disabled = true;
        feedback.textContent = "กำลังตรวจสอบข้อมูล...";

        try {
            const accepted = await onAccept({ patientId });
            if (accepted === false) {
                input.disabled = false;
                updateState();
            }
        } catch (error) {
            console.error("Patient login flow failed:", error);
            toggleFieldError(input, true);
            input.errorText = error?.message || "ไม่สามารถตรวจสอบรหัสผู้ป่วยได้";
            feedback.textContent = "";
            input.disabled = false;
            submitButton.disabled = false;
        }
    });

    updateState();
}
