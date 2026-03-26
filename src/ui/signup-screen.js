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

                                <div style="position: relative;">
                                    <md-outlined-text-field
                                        id="signup-gender-trigger"
                                        class="auth-field select-trigger"
                                        label="เพศ"
                                        readonly
                                        required
                                    >
                                        <md-icon slot="trailing-icon" class="material-symbols-rounded">arrow_drop_down</md-icon>
                                    </md-outlined-text-field>
                                    <md-menu id="signup-gender-menu" anchor="signup-gender-trigger">
                                        <md-menu-item value="male">
                                            <div class="row">
                                                <div class="col-md-2 menu-icon">
                                                    <span class="material-symbols-rounded">male</span>
                                                </div>
                                                <div class="col-md-10 menu-text">ชาย</div>
                                            </div>
                                        </md-menu-item>
                                        <md-menu-item value="female">
                                            <div class="row">
                                                <div class="col-md-2 menu-icon">
                                                    <span class="material-symbols-rounded">female</span>
                                                </div>
                                                <div class="col-md-10 menu-text">หญิง</div>
                                            </div>
                                        </md-menu-item>
                                        <md-menu-item value="other">
                                            <div class="row">
                                                <div class="col-md-2 menu-icon">
                                                    <span class="material-symbols-rounded">transgender</span>
                                                </div>
                                                <div class="col-md-10 menu-text">อื่น ๆ</div>
                                            </div>
                                        </md-menu-item>
                                        <md-menu-item value="unknown">
                                            <div class="row">
                                                <div class="col-md-2 menu-icon">
                                                    <span class="material-symbols-rounded">question_mark</span>
                                                </div>
                                                <div class="col-md-10 menu-text">ยังไม่ระบุ</div>
                                            </div>
                                        </md-menu-item>
                                    </md-menu>
                                    <input type="hidden" id="signup-gender" value="">
                                </div>

                                <div style="position: relative;">
                                    <md-outlined-text-field
                                        id="signup-education-level-trigger"
                                        class="auth-field select-trigger"
                                        label="ระดับการศึกษา"
                                        readonly
                                    >
                                        <md-icon slot="trailing-icon" class="material-symbols-rounded">arrow_drop_down</md-icon>
                                    </md-outlined-text-field>
                                    <md-menu id="signup-education-level-menu" anchor="signup-education-level-trigger">
                                        <md-menu-item value="placeholder-1">
                                            <div class="row">
                                                <div class="col-md-2 menu-icon">
                                                    <span class="material-symbols-rounded">school</span>
                                                </div>
                                                <div class="col-md-10 menu-text">ประถมศึกษา</div>
                                            </div>
                                        </md-menu-item>
                                        <md-menu-item value="placeholder-2">
                                            <div class="row">
                                                <div class="col-md-2 menu-icon">
                                                    <span class="material-symbols-rounded">school</span>
                                                </div>
                                                <div class="col-md-10 menu-text">มัธยมศึกษา</div>
                                            </div>
                                        </md-menu-item>
                                        <md-menu-item value="placeholder-3">
                                            <div class="row">
                                                <div class="col-md-2 menu-icon">
                                                    <span class="material-symbols-rounded">school</span>
                                                </div>
                                                <div class="col-md-10 menu-text">ปริญญาตรี</div>
                                            </div>
                                        </md-menu-item>
                                    </md-menu>
                                    <input type="hidden" id="signup-education-level" value="">
                                </div>
                            </div>

                            <div class="signup-note">
                                ข้อมูลนี้จะใช้ในการเปรียบเทียบผลการฝึกตามช่วงวัยและระดับการศึกษา
                            </div>
                        </section>

                        <section class="signup-section signup-section--program">
                            <div class="signup-section__heading">
                                <h3>ข้อมูลเริ่มโปรแกรม</h3>
                                <p>กำหนดวันที่เริ่มโปรแกรมฝึกสมอง</p>
                            </div>

                            <div class="signup-grid signup-grid--program">
                                <md-outlined-text-field
                                    id="signup-started-program"
                                    class="auth-field"
                                    label="วันที่เริ่มโปรแกรม"
                                    type="date"
                                    value="${createDateValue()}"
                                    required
                                ></md-outlined-text-field>
                            </div>
                        </section>

                        <div class="auth-actions">
                            <md-filled-button id="signup-submit-button" type="submit">
                                <span slot="icon" class="material-symbols-rounded">how_to_reg</span>
                                ยืนยันข้อมูลคนไข้
                            </md-filled-button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    `;

    const form = root.querySelector("#patient-signup-form");
    const backButton = root.querySelector("#signup-back-button");

    if (!form || !backButton) {
        return;
    }

    // Gender Menu Logic
    const genderTrigger = root.querySelector("#signup-gender-trigger");
    const genderMenu = root.querySelector("#signup-gender-menu");
    const genderHiddenInput = root.querySelector("#signup-gender");

    genderTrigger.addEventListener("click", () => {
        genderMenu.open = !genderMenu.open;
    });

    genderMenu.addEventListener("closed", (e) => {
        const item = e.target.selectedItem;
        if (item) {
            const value = item.value;
            const text = item.querySelector(".menu-text").textContent;
            genderTrigger.value = text;
            genderHiddenInput.value = value;
        }
    });

    // Education Menu Logic
    const eduTrigger = root.querySelector("#signup-education-level-trigger");
    const eduMenu = root.querySelector("#signup-education-level-menu");
    const eduHiddenInput = root.querySelector("#signup-education-level");

    eduTrigger.addEventListener("click", () => {
        eduMenu.open = !eduMenu.open;
    });

    eduMenu.addEventListener("closed", (e) => {
        const item = e.target.selectedItem;
        if (item) {
            const value = item.value;
            const text = item.querySelector(".menu-text").textContent;
            eduTrigger.value = text;
            eduHiddenInput.value = value;
        }
    });

    backButton.addEventListener("click", () => {
        onBack();
    });

    form.addEventListener("submit", (event) => {
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
        onSubmit(formData);
    });
}
