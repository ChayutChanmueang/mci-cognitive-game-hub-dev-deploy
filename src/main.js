import StartGame from './game/main';
import db from "./core/database.js";
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

    const showGame = () => {
        if (!app) {
            return;
        }

        document.body.classList.add("game-mode");
        app.classList.add("game-mode");
        app.innerHTML = '<div id="game-container"></div>';

        if (!hasStartedGame) {
            StartGame('game-container');
            hasStartedGame = true;
        }
    };

    const showSignup = ({ hn = "" } = {}) => {
        renderSignupScreen(uiRoot, {
            initialHn: hn,
            onBack: () => showLogin({ patientId: hn }),
            onSubmit: async (formData) => {
                await db.createPatientProfile(formData);
                showGame();
            },
        });
    };

    const showLogin = ({ patientId = "" } = {}) => {
        renderLoginScreen(uiRoot, {
            onAccept: async ({ patientId: acceptedId }) => {
                const patient = await db.getPatientByHn(acceptedId);

                if (patient) {
                    showGame();
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
