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
        confirmText = "ออกจากเกม",
        cancelText = "เล่นต่อ",
        icon = "logout",
        tone = "error",
        dismissible = false,
        panelBorderColor = null,
        panelHeaderColor = null,
        primaryFontColor = null,
        secondaryFontColor = null,
    } = options;

    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        const titleId = `popup-title-${Date.now()}`;
        const messageId = `popup-message-${Date.now()}`;
        
        overlay.className = "app-popup";
        overlay.innerHTML = `
            <div class="app-popup__backdrop"></div>
            <div
                class="app-popup__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="${titleId}"
                aria-describedby="${messageId}"
                style="width: min(100%, 500px); padding: 0; gap: 0; border-radius: 64px; border: 6px solid ${escapeHtml(panelBorderColor || '#54AC24')}; overflow: hidden; background: #FFFFFF; display: flex; flex-direction: column;"
            >
                <div style="background-color: ${escapeHtml(panelHeaderColor || '#65BD35')}; padding: 24px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <h2 id="${titleId}" style="margin: 0; font-size: 32px; color: #FFFFFF; font-weight: 700; line-height: 1.2;">${escapeHtml(title)}</h2>
                </div>
                <div style="padding: 24px 32px 32px; display: flex; flex-direction: column; gap: 32px; text-align: left;">
                    <p id="${messageId}" style="margin: 0; font-size: 22px; line-height: 1.6; color: ${escapeHtml(primaryFontColor || '#4A4A4A')};">${escapeHtml(message)}</p>
                    <div class="app-popup__actions">
                        <md-outlined-button type="button" data-popup-action="confirm" style="--md-sys-color-primary: ${escapeHtml(secondaryFontColor || '#65BD35')}; --md-sys-color-outline: ${escapeHtml(secondaryFontColor || '#65BD35')};">
                            ${escapeHtml(confirmText)}
                        </md-outlined-button>
                        <md-filled-button type="button" data-popup-action="cancel" style="--md-sys-color-primary: ${escapeHtml(panelHeaderColor || '#65BD35')}; --md-sys-color-on-primary: #FFFFFF;">
                            ${escapeHtml(cancelText)}
                        </md-filled-button>
                    </div>
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
