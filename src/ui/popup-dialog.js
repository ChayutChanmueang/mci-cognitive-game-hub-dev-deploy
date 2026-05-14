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
        const actionMarkup = customActions.length
            ? customActions.map((action, index) => {
                const tagName = action.variant === "filled" ? "md-filled-button" : "md-outlined-button";
                return `
                    <${tagName} type="button" data-popup-action="custom" data-popup-action-index="${index}">
                        ${escapeHtml(action.label)}
                    </${tagName}>
                `;
            }).join("")
            : `
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
            `;

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
                    ${actionMarkup}
                </div>
            </div>
        `;

        const confirmButton = overlay.querySelector('[data-popup-action="confirm"]');
        const cancelButton = overlay.querySelector('[data-popup-action="cancel"]');
        const customActionButtons = overlay.querySelectorAll('[data-popup-action="custom"]');
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
