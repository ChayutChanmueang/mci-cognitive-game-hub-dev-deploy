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

    root.innerHTML = `
        <section class="login-screen" aria-labelledby="login-title">
            <div class="login-card">
                <h1 id="login-title">ลงชื่อเข้าใช้</h1>

                <form id="patient-login-form" class="login-form" novalidate>
                    <md-outlined-text-field
                        id="patient-id-input"
                        class="login-field"
                        label="กรอกหมายเลข ID"
                        prefix-text="ID&nbsp;&nbsp;|"
                        type="number"
                        inputmode="numeric"
                        min="0"
                        step="1"
                        required
                        no-asterisk
                        error-text="กรุณากรอกรหัสผู้เล่น"
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
        input.value = normalizePatientId(initialPatientCode);
    }

    const updateState = () => {
        input.value = normalizePatientId(input.value);
        const value = input.value;
        const hasValue = value.length > 0;

        submitButton.disabled = !hasValue;
        feedback.textContent = "";
        input.errorText = "กรุณากรอกรหัสผู้เล่น";

        toggleFieldError(input, false);
    };

    input.addEventListener("input", updateState);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const patientId = normalizePatientId(input.value);
        if (!patientId) {
            input.errorText = "กรุณากรอกรหัสผู้เล่น";
            toggleFieldError(input, true);
            feedback.textContent = "";
            submitButton.disabled = true;
            return;
        }

        sessionStorage.setItem("patient_login_id", patientId);
        submitButton.disabled = true;
        input.disabled = true;
        feedback.textContent = "กำลังตรวจสอบข้อมูล...";

        console.log("Accept");

        try {
            const accepted = await onAccept({ patientId });
            if (accepted === false) {
                input.disabled = false;
                updateState();
            }
        } catch (error) {
            console.error("Patient login flow failed:", error);
            toggleFieldError(input, true);
            input.errorText = error?.message || "ไม่สามารถตรวจสอบรหัสผู้เล่นได้";
            feedback.textContent = "";
            input.disabled = false;
            submitButton.disabled = false;
        }
    });

    updateState();
}
