// US-E7-04 · popup-dialog.js — Figma popup art.
// The generic confirm/prompt dialog now renders with the verified Figma components:
//   • Frame_Panel (3161:657)        -> the white blue-stroke frame around title + message
//   • Button_Close_Stroke (3204:28) -> the red "cancel" button (below the panel)
//   • Button_OK_Stroke (3204:29)    -> the green "confirm" button (below the panel)
// Layout follows the confirm mock (title + message inside the panel, two stroke
// buttons below it). Acknowledge-only calls (no cancelText) show a single green button.
//
// The multi-choice mode (`actions: [...]`, e.g. the launch-with/without-history
// picker) is a different, list-style page — per the design note we only swap its
// FRAME to the Frame_Panel look and keep its existing Material button list intact.
//
// Behaviour is unchanged: returns a Promise resolving true (confirm), false
// (cancel / dismiss / Escape / backdrop), or the chosen action value.
import { renderConfirmDialog } from "./components/confirm-dialog.js";
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

export function showPopup(options = {}) {
    if (typeof document === "undefined") {
        return Promise.resolve(false);
    }

    const {
        title = "แจ้งเตือน",
        message = "",
        confirmText = "ตกลง",
        cancelText = "",
        icon = "info",
        tone = "default",
        dismissible = true,
        actions = null,
    } = options;

    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        const titleId = `popup-title-${Date.now()}`;
        const messageId = `popup-message-${Date.now()}`;
        const hasCancel = Boolean(String(cancelText || "").trim());
        const customActions = Array.isArray(actions)
            ? actions
                .map((action) => ({
                    value: action?.value,
                    label: String(action?.label || "").trim(),
                    variant: action?.variant === "filled" ? "filled" : "outlined",
                }))
                .filter((action) => action.label)
            : [];

        overlay.className = "app-popup";

        if (customActions.length) {
            // ── Multi-choice (list) mode — Image #10 style: change only the frame.
            // Keep the existing header + Material button list; wrap it in the
            // Frame_Panel look via the `gh-dialog--framed` class.
            const actionMarkup = customActions
                .map((action, index) => {
                    const tagName = action.variant === "filled" ? "md-filled-button" : "md-outlined-button";
                    return `
                        <${tagName} type="button" data-popup-action="custom" data-popup-action-index="${index}">
                            ${escapeHtml(action.label)}
                        </${tagName}>
                    `;
                })
                .join("");

            overlay.innerHTML = `
                <div class="app-popup__backdrop"></div>
                <div
                    class="app-popup__dialog app-popup__dialog--prompt app-popup__dialog--${escapeHtml(tone)} gh-dialog--framed"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="${titleId}"
                    aria-describedby="${messageId}"
                >
                    <div class="app-popup__header">
                        <div class="app-popup__icon-wrap">
                            <span class="material-symbols-rounded app-popup__icon">${escapeHtml(icon)}</span>
                        </div>
                        <div class="app-popup__copy">
                            <h2 id="${titleId}">${escapeHtml(title)}</h2>
                            <p id="${messageId}">${escapeHtml(message)}</p>
                        </div>
                    </div>
                    <div class="app-popup__actions">
                        ${actionMarkup}
                    </div>
                </div>
            `;
        } else {
            // ── Confirm / acknowledge mode — Frame 1257 layout: Frame_Panel holds the
            // centered title + message AND the stroke buttons, all inside the frame.
            const actionsMarkup = hasCancel
                ? `<div class="gh-dialog-popup__button">
                    ${renderButtonCloseStroke({ label: cancelText })}
                </div>
                <div class="gh-dialog-popup__button">
                    ${renderButtonOkStroke({ label: confirmText })}
                </div>`
                : `<div class="gh-dialog-popup__button">
                    ${renderButtonOkStroke({ label: confirmText })}
                </div>`;

            // US-E9-12: shared with game-exit-popup.js so the two cannot drift apart again.
            overlay.innerHTML = renderConfirmDialog({
                titleId,
                messageId,
                title,
                message,
                actions: actionsMarkup,
            });
        }

        const confirmButton = overlay.querySelector(".gh-button-ok-stroke");
        const cancelButton = overlay.querySelector(".gh-button-close-stroke");
        const customActionButtons = overlay.querySelectorAll('[data-popup-action="custom"]');
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

        confirmButton?.addEventListener("click", () => {
            cleanup(true);
        });

        cancelButton?.addEventListener("click", () => {
            cleanup(false);
        });

        customActionButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const actionIndex = Number(button.getAttribute("data-popup-action-index"));
                cleanup(customActions[actionIndex]?.value ?? null);
            });
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
            (customActionButtons[customActionButtons.length - 1] || confirmButton)?.focus();
        });
    });
}

export default showPopup;
