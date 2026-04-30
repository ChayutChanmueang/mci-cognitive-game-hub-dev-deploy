import "./daily-preset-tool.css";

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

const DEFAULT_PRESETS = Object.freeze([
    {
        id: "preset-1",
        name: "Preset 1",
        dayCount: 14,
    },
]);

export function renderDailyPresetTool(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        presets = DEFAULT_PRESETS,
        onBack = () => {},
        onOpenPreset = () => {},
        onAddPreset = () => {},
    } = options;

    const presetItems = (Array.isArray(presets) ? presets : DEFAULT_PRESETS)
        .map((preset) => `
            <md-filled-tonal-button class="daily-preset-card" type="button" data-preset-id="${escapeHtml(preset.id)}">
                <span class="daily-preset-card__inner">
                    <span class="daily-preset-card__copy">
                        <strong>${escapeHtml(preset.name)}</strong>
                        <small>จำนวน ${escapeHtml(String(preset.dayCount))} วัน</small>
                    </span>
                    <span class="material-symbols-rounded daily-preset-card__icon" aria-hidden="true">chevron_right</span>
                </span>
            </md-filled-tonal-button>
        `).join("");

    root.innerHTML = `
        <section class="daily-preset-tool-screen">
            <div class="daily-preset-tool">
                <header class="daily-preset-tool__header">
                    <md-icon-button type="button" aria-label="กลับ" data-tool-back>
                        <span class="material-symbols-rounded">arrow_back</span>
                    </md-icon-button>
                    <h1>ระบบ เพิ่ม/แก้ไข ข้อมูลรายวัน</h1>
                    <span aria-hidden="true"></span>
                </header>

                <main class="daily-preset-tool__content">
                    <div class="daily-preset-tool__list">
                        ${presetItems}
                        <md-filled-tonal-button class="daily-preset-card daily-preset-card--add" type="button" data-add-preset aria-label="เพิ่ม preset">
                            <span class="daily-preset-card__inner daily-preset-card__inner--add">
                                <span class="material-symbols-rounded daily-preset-card__add-icon" aria-hidden="true">add</span>
                            </span>
                        </md-filled-tonal-button>
                    </div>
                </main>
            </div>
        </section>
    `;

    root.querySelector("[data-tool-back]")?.addEventListener("click", () => {
        onBack();
    });

    root.querySelectorAll("[data-preset-id]").forEach((item) => {
        item.addEventListener("click", () => {
            const presetId = item.getAttribute("data-preset-id") || "";
            const preset = (Array.isArray(presets) ? presets : DEFAULT_PRESETS)
                .find((entry) => String(entry.id) === presetId);
            onOpenPreset(preset || null);
        });
    });

    root.querySelector("[data-add-preset]")?.addEventListener("click", () => {
        onAddPreset();
    });
}
