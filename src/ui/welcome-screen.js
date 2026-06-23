export function renderWelcomeScreen(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        onLogin = () => {},
    } = options;

    root.innerHTML = `
        <section class="landing-screen" aria-labelledby="landing-title">
            <div class="landing-screen__logo">
                <img
                    id="landing-title"
                    class="landing-screen__logo-img"
                    src="/Logo.png"
                    alt="Game Logo"
                />
            </div>

            <div class="landing-screen__actions">
                <md-filled-button id="landing-login-button" class="landing-login-button" type="button">
                    ลงชื่อเข้าใช้
                </md-filled-button>
            </div>
        </section>
    `;

    root.querySelector("#landing-login-button")?.addEventListener("click", () => {
        onLogin();
    });
}
