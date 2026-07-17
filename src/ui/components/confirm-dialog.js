// US-E9-12 · confirm-dialog.js — the shared shell for the confirm/acknowledge popups.
//
// popup-dialog.js and game-exit-popup.js each used to build this markup themselves, and they drifted:
// the dialog moved its buttons INSIDE the Frame_Panel (Frame 1257) while the exit popup left them
// sitting below it, so the exit popup ended up with different panel size, spacing and button
// placement from every other popup. Both now render through this one function, so they cannot drift
// again — which is the actual fix, not just the layout it happens to produce today.
//
// This renders markup only. Which button means "confirm" is deliberately left to the caller: the
// dialog treats green as confirm, while the exit popup makes RED the confirm (exit) action because
// exiting is the destructive one (US-E7-15).
import { renderFramePanel } from "./frame-panel.js";
import { escapeText, escapeAttr } from "./escape.js";

/**
 * @param {object} opts
 * @param {string} opts.titleId    id for aria-labelledby
 * @param {string} opts.messageId  id for aria-describedby (only used when there is a message)
 * @param {string} opts.title
 * @param {string} [opts.message]
 * @param {string} [opts.actions]  pre-rendered button markup, laid out inside the panel
 */
export function renderConfirmDialog({ titleId, messageId, title, message = "", actions = "" } = {}) {
    return `
        <div class="app-popup__backdrop"></div>
        <div
            class="gh-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="${escapeAttr(titleId)}"
            ${message ? `aria-describedby="${escapeAttr(messageId)}"` : ""}
        >
            ${renderFramePanel({
                className: "gh-dialog__panel",
                body: `
                    <h2 id="${escapeAttr(titleId)}" class="gh-dialog__title">${escapeText(title)}</h2>
                    ${message ? `<p id="${escapeAttr(messageId)}" class="gh-dialog__message">${escapeText(message)}</p>` : ""}
                    <div class="gh-dialog__actions">
                        ${actions}
                    </div>
                `,
            })}
        </div>
    `;
}

export default renderConfirmDialog;
