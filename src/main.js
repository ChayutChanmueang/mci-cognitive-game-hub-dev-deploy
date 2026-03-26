import StartGame from './game/main';
import { renderLoginScreen } from "./ui/login-screen.js";
import { renderSignupScreen } from "./ui/signup-screen.js";

document.addEventListener('DOMContentLoaded', () => {
    const uiRoot = document.getElementById("ui-root");
    const gameContainer = document.getElementById("game-container");
    let hasStartedGame = false;

    if (gameContainer) {
        gameContainer.classList.add("game-container--hidden");
    }

    const showGame = () => {
        if (gameContainer) {
            gameContainer.classList.remove("game-container--hidden");
        }

        if (!uiRoot) {
            return;
        }

        uiRoot.innerHTML = "";

        if (!hasStartedGame) {
            StartGame('game-container');
            hasStartedGame = true;
        }
    };

    const showSignup = ({ hn = "" } = {}) => {
        renderSignupScreen(uiRoot, {
            initialHn: hn,
            onBack: () => showLogin({ patientId: hn }),
            onSubmit: (formData) => {
                console.info("Signup mockup submitted:", formData);
                showGame();
            },
        });
    };

    const showLogin = ({ patientId = "" } = {}) => {
        renderLoginScreen(uiRoot, {
            onAccept: ({ patientId: acceptedId }) => {
                console.info("Login mockup accepted:", acceptedId);
                showGame();
            },
            onOpenSignup: ({ hn }) => showSignup({ hn: hn || patientId }),
        });

        const input = uiRoot?.querySelector("#patient-id-input");
        if (input && patientId) {
            input.value = patientId;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    };

    showLogin();
});
