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
        
        <!-- US-E7-22: partner/supporter logos, bottom row -->
        <div class="landing-screen__partners" aria-label="หน่วยงานที่เกี่ยวข้อง">
            <img class="landing-screen__partner-logo" src="/assets/common/Logo/CAMT.png" alt="วิทยาลัยศิลปะ สื่อ และเทคโนโลยี มหาวิทยาลัยเชียงใหม่ (CAMT)" />
            <img class="landing-screen__partner-logo" src="/assets/common/Logo/NAPLAB.png" alt="NAPLAB Game Studio" />
            <img class="landing-screen__partner-logo" src="/assets/common/Logo/CMU-Logo.png" alt="มหาวิทยาลัยเชียงใหม่ (Chiang Mai University)" />
            <img class="landing-screen__partner-logo" src="/assets/common/Logo/MedCMU.png" alt="คณะแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่ (MedCMU)" />
            <img class="landing-screen__partner-logo" src="/assets/common/Logo/NRCT.png" alt="สำนักงานการวิจัยแห่งชาติ (วช. / NRCT)" />
        </div>
    `;

    root.querySelector(".gh-start-button")?.addEventListener("click", () => {
        onLogin();
    });
}
