// US-E7-04 · game-exit-popup.js — Figma popup art (same system as popup-dialog.js).
// Renders with the verified Figma components:
//   • Frame_Panel (3161:657)        -> the white blue-stroke frame around title + message
//   • Button_Close_Stroke (3204:28) -> the red button = "ออก" / exit (resolves true)
//   • Button_OK_Stroke (3204:29)    -> the green button = "เล่นต่อ" / keep playing (resolves false)
// Red is the destructive (exit) action and green is the safe (keep playing)
// action, per the standard button-colour convention (US-E7-15).
//
// Layout follows the confirm mock (title + message inside the panel, two stroke
// buttons below it), matching popup-dialog.js confirm mode.
//
// Behaviour is unchanged: returns a Promise resolving true (confirm/exit) or
// false (cancel/keep playing / dismiss / Escape / backdrop).
import { renderFramePanel } from "./components/frame-panel.js";
import { renderButtonOkStroke } from "./components/button-ok-stroke.js";
import { renderButtonCloseStroke } from "./components/button-close-stroke.js";
import { dismissPopup } from "./transition/popup-transition.js";

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export function showGameExitPopup(options = {}) {
    if (typeof document === "undefined") {
        return Promise.resolve(false);
    }

    const {
        title = "ออกจากเกม",
        message = "คุณต้องการออกจากเกมที่กำลังเล่นอยู่ใช่หรือไม่? ความก้าวหน้าในรอบนี้อาจจะไม่ถูกบันทึก",
        confirmText = "ออก",
        cancelText = "เล่นต่อ",
        dismissible = false,
        // Retained for call-site compatibility (main.js passes per-game colors);
        // the shared popup-dialog art is neutral (fixed Frame_Panel), so they are unused.
        // eslint-disable-next-line no-unused-vars
        icon, tone, panelBorderColor, panelHeaderColor, primaryFontColor, secondaryFontColor,
    } = options;

    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        const titleId = `popup-title-${Date.now()}`;
        const messageId = `popup-message-${Date.now()}`;

        overlay.className = "app-popup";
        overlay.innerHTML = `
            <div class="app-popup__backdrop"></div>
            <div
                class="gh-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="${titleId}"
                ${message ? `aria-describedby="${messageId}"` : ""}
            >
                ${renderFramePanel({
                    className: "gh-dialog__panel",
                    body: `
                        <h2 id="${titleId}" class="gh-dialog__title">${escapeHtml(title)}</h2>
                        ${message ? `<p id="${messageId}" class="gh-dialog__message">${escapeHtml(message)}</p>` : ""}
                    `,
                })}
                <div class="gh-dialog__actions">
                    <div class="gh-dialog-popup__button">
                        ${renderButtonCloseStroke({ label: confirmText })}
                    </div>
                    <div class="gh-dialog-popup__button">
                        ${renderButtonOkStroke({ label: cancelText })}
                    </div>
                </div>
            </div>
        `;

        // Red button (Close_Stroke) is the exit action; green (OK_Stroke) keeps playing.
        const exitButton = overlay.querySelector(".gh-button-close-stroke");
        const keepPlayingButton = overlay.querySelector(".gh-button-ok-stroke");
        const backdrop = overlay.querySelector(".app-popup__backdrop");
        const previousOverflow = document.body.style.overflow;

        let settled = false;

        const cleanup = (result) => {
            if (settled) {
                return;
            }

            settled = true;
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKeyDown);
            // Play the leave animation, then remove + resolve (US-E7-20).
            dismissPopup(overlay).then(() => resolve(result));
        };

        const onKeyDown = (event) => {
            if (event.key === "Escape" && dismissible) {
                cleanup(false);
            }
        };

        exitButton?.addEventListener("click", () => {
            cleanup(true);
        });

        keepPlayingButton?.addEventListener("click", () => {
            cleanup(false);
        });

        backdrop?.addEventListener("click", () => {
            if (dismissible) {
                cleanup(false);
            }
        });

        document.body.style.overflow = "hidden";
        document.body.appendChild(overlay);
        document.addEventListener("keydown", onKeyDown);
        requestAnimationFrame(() => {
            // Focus the safe option (keep playing) by default.
            keepPlayingButton?.focus();
        });
    });
}

export default showGameExitPopup;
