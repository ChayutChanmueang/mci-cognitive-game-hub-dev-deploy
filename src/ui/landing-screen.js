export function renderLandingScreen(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        onLogin = () => {},
    } = options;

    root.innerHTML = `
        <section class="landing-screen" aria-labelledby="landing-title">
            <div class="landing-screen__logo" role="img" aria-label="Game Logo">
                <h1 id="landing-title">Game Logo</h1>
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
