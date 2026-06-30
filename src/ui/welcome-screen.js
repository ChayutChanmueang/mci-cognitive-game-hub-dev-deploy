import { renderStartGameButton } from "./components/start-game-button.js";

export function renderWelcomeScreen(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        onLogin = () => {},
    } = options;

    // US-E7-19: entry button uses the game's Start-Game-Button art (green pill).
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
                ${renderStartGameButton({ label: "เริ่มเล่นเกม" })}
            </div>
        </section>
    `;

    root.querySelector(".gh-start-button")?.addEventListener("click", () => {
        onLogin();
    });
}
