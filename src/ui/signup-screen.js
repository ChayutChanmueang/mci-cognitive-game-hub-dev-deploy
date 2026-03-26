function createDateValue() {
    return new Date().toISOString().slice(0, 10);
}

export function renderSignupScreen(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        initialHn = "",
        onBack = () => {},
        onSubmit = () => {},
    } = options;

    root.innerHTML = `
        <section class="auth-screen">
            <div class="auth-shell auth-shell--signup">
                <div class="auth-card auth-card--wide">
                    <div class="auth-card__header auth-card__header--spread">
                        <div class="auth-card__header-group">
                            <md-outlined-button id="signup-back-button" type="button">
                                <span slot="icon" class="material-symbols-rounded">arrow_back</span>
                                Back
                            </md-outlined-button>
                            <div>
                                <p class="auth-eyebrow">Patient Registration</p>
                                <h2>กรอกข้อมูลผู้ป่วย</h2>
                                <p>หน้านี้เป็น mockup สำหรับลงทะเบียนผู้ป่วยใหม่ก่อนเริ่มโปรแกรม</p>
                            </div>
                        </div>
                    </div>

                    <form id="patient-signup-form" class="signup-form" novalidate>
                        <section class="signup-section">
                            <div class="signup-section__heading">
                                <h3>ข้อมูลผู้ป่วย</h3>
                                <p>กรอกข้อมูลทั่วไปของผู้ป่วยให้ครบก่อนเริ่มโปรแกรมฝึกสมอง</p>
                            </div>

                            <div class="signup-context">
                                <span class="signup-context__label">Patient ID / HN</span>
                                <strong class="signup-context__value">${initialHn || "-"}</strong>
                            </div>

                            <div class="signup-grid signup-grid--two">
                                <md-outlined-text-field
                                    id="signup-firstname"
                                    class="auth-field"
                                    label="ชื่อ"
                                    required
                                ></md-outlined-text-field>
                                <md-outlined-text-field
                                    id="signup-lastname"
                                    class="auth-field"
                                    label="นามสกุล"
                                    required
                                ></md-outlined-text-field>
                            </div>

                            <div class="signup-grid signup-grid--three">
                                <md-outlined-text-field
                                    id="signup-age"
                                    class="auth-field"
                                    label="อายุ"
                                    type="number"
                                    min="1"
                                    required
                                ></md-outlined-text-field>

                                <md-outlined-select
                                    id="signup-gender"
                                    class="auth-field"
                                    label="เพศ"
                                    required
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

                                <md-outlined-select
                                    id="signup-education-level"
                                    class="auth-field"
                                    label="ระดับการศึกษา"
                                >
                                    <md-select-option value="placeholder-1">
                                        <div slot="headline">ตัวเลือกตัวอย่าง 1</div>
                                    </md-select-option>
                                    <md-select-option value="placeholder-2">
                                        <div slot="headline">ตัวเลือกตัวอย่าง 2</div>
                                    </md-select-option>
                                    <md-select-option value="placeholder-3">
                                        <div slot="headline">ตัวเลือกตัวอย่าง 3</div>
                                    </md-select-option>
                                </md-outlined-select>
                            </div>

                            <div class="signup-note">
                                ฟิลด์ระดับการศึกษาเป็น mockup ชั่วคราว และจะเปลี่ยนเป็นตัวเลือกจริงภายหลัง
                            </div>
                        </section>

                        <section class="signup-section signup-section--program">
                            <div class="signup-section__heading">
                                <h3>ข้อมูลเริ่มโปรแกรม</h3>
                                <p>กำหนดวันที่เริ่มโปรแกรมฝึกสมอง โดยใช้ปฏิทินของ browser</p>
                            </div>

                            <div class="signup-grid signup-grid--program-row">
                                <md-outlined-text-field
                                    id="signup-started-program"
                                    class="auth-field"
                                    label="วันที่เริ่มโปรแกรม"
                                    type="date"
                                    value="${createDateValue()}"
                                    required
                                ></md-outlined-text-field>

                                <div class="signup-submit-wrap">
                                    <md-filled-button id="signup-submit-button" type="submit">
                                        <span slot="icon" class="material-symbols-rounded">how_to_reg</span>
                                        ยืนยันข้อมูลคนไข้
                                    </md-filled-button>
                                </div>
                            </div>

                            <p id="signup-feedback" class="auth-feedback" aria-live="polite"></p>
                        </section>
                    </form>
                </div>
            </div>
        </section>
    `;

    const form = root.querySelector("#patient-signup-form");
    const backButton = root.querySelector("#signup-back-button");
    const submitButton = root.querySelector("#signup-submit-button");
    const feedback = root.querySelector("#signup-feedback");

    if (!form || !backButton || !submitButton || !feedback) {
        return;
    }

    backButton.addEventListener("click", () => {
        onBack();
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = {
            hn: String(initialHn || "").trim(),
            firstname: String(root.querySelector("#signup-firstname")?.value || "").trim(),
            lastname: String(root.querySelector("#signup-lastname")?.value || "").trim(),
            age: String(root.querySelector("#signup-age")?.value || "").trim(),
            gender: String(root.querySelector("#signup-gender")?.value || "").trim(),
            educationLevel: String(root.querySelector("#signup-education-level")?.value || "").trim(),
            startedProgram: String(root.querySelector("#signup-started-program")?.value || "").trim(),
        };

        sessionStorage.setItem("patient_signup_draft", JSON.stringify(formData));
        submitButton.disabled = true;
        feedback.textContent = "กำลังบันทึกข้อมูลผู้ป่วย...";

        try {
            await onSubmit(formData);
        } catch (error) {
            console.error("Patient signup flow failed:", error);
            feedback.textContent = error?.message || "ไม่สามารถบันทึกข้อมูลผู้ป่วยได้";
            submitButton.disabled = false;
            return;
        }

        feedback.textContent = "";
    });
}
