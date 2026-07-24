// US-E7-30 · export-options-popup.js — the "ส่งออกข้อมูล" CSV picker.
//
// Moved out of player-info-screen.js, which built this markup inline with generic
// `app-popup` / Material components while every other popup in the app had already moved
// to the Figma art. Same reasoning as US-E9-12: a popup that composes the shared pieces
// cannot drift away from the others again.
//
// Art: Frame_Form_Panel (blue header bar + white panel) via renderFramePopupPanel, the
// Icon_ButtonBack in the header, and the standard stroke buttons — red = ยกเลิก,
// green = ส่งออกข้อมูล (US-E7-15).
//
// ⚠️ The two groups look identical (same Figma circle) but behave differently on purpose:
//   ข้อมูลของ    → radio    — the scope is one-or-the-other (this player / everyone)
//   ประเภทข้อมูล → checkbox — you may export several data types at once
// That mirrors the previous switch + checkboxes behaviour, which US-E9-05's export flow
// depends on. The circles are the same by design, so the difference is carried by real
// <input type> — keyboard and screen-reader behaviour stay correct even though the art
// does not distinguish them.
import { renderFramePopupPanel } from "./components/frame-form-panel.js";
import { renderIconButtonBack } from "./components/icon-button-back.js";
import { renderButtonOkStroke } from "./components/button-ok-stroke.js";
import { renderButtonCloseStroke } from "./components/button-close-stroke.js";
import { renderCheckOption } from "./components/check-circle.js";
import { dismissPopup } from "./transition/popup-transition.js";
import { CsvExportScope, CsvExportType } from "../util/player-csv-export.js";

const SCOPE_OPTIONS = [
  { value: CsvExportScope.Current, label: "ผู้เล่นคนนี้" },
  { value: CsvExportScope.All, label: "ผู้เล่นทั้งหมด" },
];

const TYPE_OPTIONS = [
  { value: CsvExportType.Player, label: "ข้อมูลผู้เล่น", checked: true },
  { value: CsvExportType.Game, label: "ข้อมูลการเล่นเกม" },
  { value: CsvExportType.History, label: "ประวัติการเล่นรายวัน" },
];

/**
 * @returns {Promise<{exportScope: string, exportTypes: string[]}|null>}
 *          null when cancelled — unchanged from the previous implementation, so the
 *          caller's "user backed out" branch keeps working.
 */
export function showExportOptionsPopup() {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    const titleId = `player-export-title-${Date.now()}`;
    const messageId = `player-export-message-${Date.now()}`;
    const previousOverflow = document.body.style.overflow;

    overlay.className = "app-popup";
    overlay.innerHTML = `
      <div class="app-popup__backdrop"></div>
      <div
        class="gh-popup gh-popup--export"
        role="dialog"
        aria-modal="true"
        aria-labelledby="${titleId}"
        aria-describedby="${messageId}"
      >
        ${renderFramePopupPanel({
          className: "gh-popup__panel",
          header: `
            ${renderIconButtonBack({ id: "export-popup-back", ariaLabel: "ปิดหน้าต่างส่งออกข้อมูล" })}
            <h2 id="${titleId}" class="gh-frame-form-panel__title">ส่งออกข้อมูล</h2>
          `,
          body: `
            <div class="gh-export-popup__scroll">
              <p id="${messageId}" class="gh-export-popup__lead">เลือกข้อมูลที่ต้องการส่งออกเป็น CSV</p>

              <div class="gh-export-popup__group" role="radiogroup" aria-labelledby="${titleId}-scope">
                <p id="${titleId}-scope" class="gh-export-popup__legend">ข้อมูลของ :</p>
                ${SCOPE_OPTIONS.map((option, index) =>
                  renderCheckOption({
                    type: "radio",
                    name: "export-scope",
                    value: option.value,
                    label: option.label,
                    checked: index === 0,
                    dataAttr: "data-export-scope",
                  }),
                ).join("")}
              </div>

              <div class="gh-export-popup__group" role="group" aria-labelledby="${titleId}-type">
                <p id="${titleId}-type" class="gh-export-popup__legend">ประเภทข้อมูล :</p>
                ${TYPE_OPTIONS.map((option) =>
                  renderCheckOption({
                    type: "checkbox",
                    name: "export-type",
                    value: option.value,
                    label: option.label,
                    checked: Boolean(option.checked),
                    dataAttr: "data-export-option",
                  }),
                ).join("")}
              </div>
            </div>

            <div class="gh-export-popup__actions">
              ${renderButtonCloseStroke({ label: "ยกเลิก", id: "export-popup-cancel" })}
              ${renderButtonOkStroke({ label: "ส่งออกข้อมูล", id: "export-popup-confirm" })}
            </div>
          `,
        })}
      </div>
    `;

    // The old inline version removed the node synchronously, skipping the US-E7-20 leave
    // animation that every other popup plays (AC#4). `settled` guards against a second
    // trigger (e.g. Escape during the 0.5s close) resolving the promise twice.
    let settled = false;
    const cleanup = (result) => {
      if (settled) return;
      settled = true;
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      dismissPopup(overlay).then(() => resolve(result));
    };

    const typeInputs = [...overlay.querySelectorAll("[data-export-option]")];
    const confirmButton = overlay.querySelector("#export-popup-confirm");

    const getSelection = () => ({
      exportScope:
        overlay.querySelector("[data-export-scope]:checked")?.value || CsvExportScope.Current,
      exportTypes: typeInputs.filter((input) => input.checked).map((input) => input.value),
    });

    // Exporting nothing produces an empty file rather than an error, so the confirm button
    // is disabled until at least one type is ticked. The old Material checkboxes allowed it.
    const syncConfirmEnabled = () => {
      if (!confirmButton) return;
      const hasType = typeInputs.some((input) => input.checked);
      confirmButton.disabled = !hasType;
      confirmButton.setAttribute("aria-disabled", String(!hasType));
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        cleanup(null);
      }
    };

    overlay.querySelector("#export-popup-cancel")?.addEventListener("click", () => cleanup(null));
    overlay.querySelector("#export-popup-back")?.addEventListener("click", () => cleanup(null));
    confirmButton?.addEventListener("click", () => cleanup(getSelection()));
    overlay.querySelector(".app-popup__backdrop")?.addEventListener("click", () => cleanup(null));
    typeInputs.forEach((input) => input.addEventListener("change", syncConfirmEnabled));
    syncConfirmEnabled();

    document.body.style.overflow = "hidden";
    document.body.appendChild(overlay);
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => {
      confirmButton?.focus();
    });
  });
}

export default showExportOptionsPopup;
