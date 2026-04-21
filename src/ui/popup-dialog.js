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
    } = options;

    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        const titleId = `popup-title-${Date.now()}`;
        const messageId = `popup-message-${Date.now()}`;
        const hasCancel = Boolean(String(cancelText || "").trim());

        overlay.className = "app-popup";
        overlay.innerHTML = `
            <div class="app-popup__backdrop"></div>
            <div
                class="app-popup__dialog app-popup__dialog--${escapeHtml(tone)}"
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
                    ${
                        hasCancel
                            ? `
                                <md-outlined-button type="button" data-popup-action="cancel">
                                    ${escapeHtml(cancelText)}
                                </md-outlined-button>
                            `
                            : ""
                    }
                    <md-filled-button type="button" data-popup-action="confirm">
                        ${escapeHtml(confirmText)}
                    </md-filled-button>
                </div>
            </div>
        `;

        const confirmButton = overlay.querySelector('[data-popup-action="confirm"]');
        const cancelButton = overlay.querySelector('[data-popup-action="cancel"]');
        const backdrop = overlay.querySelector(".app-popup__backdrop");
        const previousOverflow = document.body.style.overflow;

        let settled = false;

        const cleanup = (result) => {
            if (settled) {
                return;
            }

            settled = true;
            overlay.remove();
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKeyDown);
            resolve(result);
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

        backdrop?.addEventListener("click", () => {
            if (dismissible) {
                cleanup(false);
            }
        });

        document.body.style.overflow = "hidden";
        document.body.appendChild(overlay);
        document.addEventListener("keydown", onKeyDown);
        requestAnimationFrame(() => {
            confirmButton?.focus();
        });
    });
}

export default showPopup;
