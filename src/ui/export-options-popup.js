// US-E7-30 / US-E10-04 · export-options-popup.js — the "ส่งออกข้อมูล" CSV picker.
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
// ⚠️ The three sections look identical (same Figma circle) but the input TYPE differs on
// purpose, and the difference is carried by real <input type> so keyboard + screen readers
// stay correct even though the art does not distinguish them:
//   ข้อมูลของ    → radio    — scope is one-or-the-other (this player / everyone)
//   ประเภทข้อมูล → checkbox — several data types at once (US-E9-05 depends on this)
//   กลุ่มผู้เล่น  → radio    — one group at a time, plus "ทุกกลุ่ม" (US-E10-04)
//
// US-E10-04: the group filter only applies to scope = "ผู้เล่นทั้งหมด" — a single player is
// already in exactly one group, so the group radios are DISABLED while "ผู้เล่นคนนี้" is
// selected. Groups load async from the caller's `loadGroups`; until they arrive (or if it
// fails) only "ทุกกลุ่ม" is shown, which reproduces the pre-US-E10-04 behaviour.
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

// The "all groups" radio carries an empty value so getSelection resolves it to null (= no
// GRPID filter), which is exactly the pre-US-E10-04 export.
const ALL_GROUPS_VALUE = "";

/**
 * @param {object} [options]
 * @param {() => Promise<Array<{grpid: string, tagName: string}>>} [options.loadGroups]
 *        Returns the group tags to offer. Optional: without it the popup shows only
 *        "ทุกกลุ่ม" and behaves exactly as before.
 * @returns {Promise<{exportScope: string, exportTypes: string[], exportGroup: string|null}|null>}
 *          null when cancelled — unchanged, so the caller's "backed out" branch keeps working.
 */
export function showExportOptionsPopup({ loadGroups } = {}) {
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

              <div class="gh-export-popup__group gh-export-popup__group--tag" role="radiogroup" aria-labelledby="${titleId}-group" data-group-container>
                <p id="${titleId}-group" class="gh-export-popup__legend">กลุ่มผู้เล่น :</p>
                <div data-group-options>
                  ${renderCheckOption({
                    type: "radio",
                    name: "export-group",
                    value: ALL_GROUPS_VALUE,
                    label: "ทุกกลุ่ม",
                    checked: true,
                    dataAttr: "data-export-group",
                  })}
                </div>
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
    const groupContainer = overlay.querySelector("[data-group-container]");
    const groupOptions = overlay.querySelector("[data-group-options]");

    const isAllScope = () =>
      overlay.querySelector("[data-export-scope]:checked")?.value === CsvExportScope.All;

    const getSelection = () => ({
      exportScope:
        overlay.querySelector("[data-export-scope]:checked")?.value || CsvExportScope.Current,
      exportTypes: typeInputs.filter((input) => input.checked).map((input) => input.value),
      // Group only applies to the "everyone" scope; for a single player it is meaningless.
      exportGroup: isAllScope()
        ? overlay.querySelector("[data-export-group]:checked")?.value || null
        : null,
    });

    // Exporting nothing produces an empty file rather than an error, so the confirm button
    // is disabled until at least one type is ticked. The old Material checkboxes allowed it.
    const syncConfirmEnabled = () => {
      if (!confirmButton) return;
      const hasType = typeInputs.some((input) => input.checked);
      confirmButton.disabled = !hasType;
      confirmButton.setAttribute("aria-disabled", String(!hasType));
    };

    // Group radios are only meaningful for scope "ผู้เล่นทั้งหมด" — disable + dim them
    // otherwise, so it is clear the group has no effect on a single-player export.
    const syncGroupEnabled = () => {
      const enabled = isAllScope();
      groupContainer?.classList.toggle("gh-export-popup__group--disabled", !enabled);
      overlay.querySelectorAll("[data-export-group]").forEach((input) => {
        input.disabled = !enabled;
      });
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
    overlay.querySelectorAll("[data-export-scope]").forEach((input) =>
      input.addEventListener("change", syncGroupEnabled),
    );
    syncConfirmEnabled();
    syncGroupEnabled();

    document.body.style.overflow = "hidden";
    document.body.appendChild(overlay);
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => {
      confirmButton?.focus();
    });

    // Load the real groups and append them after "ทุกกลุ่ม". Done after mount so the popup
    // shows immediately; if it fails the popup still works with "ทุกกลุ่ม" only.
    if (typeof loadGroups === "function" && groupOptions) {
      Promise.resolve()
        .then(loadGroups)
        .then((groups) => {
          if (settled || !Array.isArray(groups)) return;
          const markup = groups
            .filter((group) => group && group.grpid)
            .map((group) =>
              renderCheckOption({
                type: "radio",
                name: "export-group",
                value: group.grpid,
                label: group.tagName || group.grpid,
                dataAttr: "data-export-group",
              }),
            )
            .join("");
          groupOptions.insertAdjacentHTML("beforeend", markup);
          syncGroupEnabled();
        })
        .catch(() => {
          /* keep "ทุกกลุ่ม" only — no group filter available */
        });
    }
  });
}

export default showExportOptionsPopup;
