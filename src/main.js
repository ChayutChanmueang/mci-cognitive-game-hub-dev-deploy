import ZooFeeder from './game/zoo-feeder/main';
import db from "./core/database.js";
import { renderGameHubScreen } from "./ui/game-hub-screen.js";
import { renderLoginScreen } from "./ui/login-screen.js";
import { renderSignupScreen } from "./ui/signup-screen.js";

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById("app");
    const uiRoot = document.getElementById("ui-root");
    const gameContainer = document.getElementById("game-container");
    let hasStartedGame = false;

    if (gameContainer) {
        gameContainer.classList.add("game-container--hidden");
    }

    const showHub = async () => {
        if (!uiRoot || !gameContainer) {
            return;
        }

        document.body.classList.remove("game-mode");
        app?.classList.remove("game-mode");
        gameContainer.classList.add("game-container--hidden");

        await renderGameHubScreen(uiRoot, {
            loadGamesByCategory: (mciGroup, options) => db.getGamesByMciGroup(mciGroup, options),
            onLaunchGame: async (selectedGame) => {
                try {
                    await db.logUserEvent("SPG", selectedGame?.gid || null);
                } catch (error) {
                    console.warn("Unable to log start game event:", error);
                }

                showGame();
            },
        });
    };

    const showGame = () => {
        if (!gameContainer || !uiRoot) {
            return;
        }

        document.body.classList.add("game-mode");
        app?.classList.add("game-mode");
        uiRoot.innerHTML = "";
        gameContainer.classList.remove("game-container--hidden");

        if (!hasStartedGame) {
            ZooFeeder('game-container');
            hasStartedGame = true;
        }
    };

    const showSignup = ({ hn = "" } = {}) => {
        renderSignupScreen(uiRoot, {
            initialHn: hn,
            onBack: () => showLogin({ patientId: hn }),
            onSubmit: async (formData) => {
                await db.createPatientProfile(formData);
                await showHub();
            },
        });
    };

    const showLogin = ({ patientId = "" } = {}) => {
        renderLoginScreen(uiRoot, {
            onAccept: async ({ patientId: acceptedId }) => {
                const patient = await db.getPatientByHn(acceptedId);

                if (patient) {
                    await showHub();
                    return;
                }

                showSignup({ hn: acceptedId });
            },
        });

        const input = uiRoot?.querySelector("#patient-id-input");
        if (input && patientId) {
            input.value = patientId;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    };

    showLogin();
});
