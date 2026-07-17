// US-E7-04 · Figma popup art. Composes the existing Frame_Form_Panel (white panel +
// blue top header bar) with a single green Start-Game-Button below it — the shared
// skeleton for the check-in success, resting, and day/program-completion popups.
//
// Returns the inner HTML for an `.app-popup` overlay. The caller creates the overlay
// (`className = "app-popup"`), sets `innerHTML`, then wires the button via `.gh-start-button`
// (and may update `.gh-start-button__label` to change the text). The Start-Game-Button is
// rendered with its full base/fill/label divs so its size is defined by `--gh-scale`
// (set on `.gh-popup`).
import {renderFrameFormPanel, renderFramePopupPanel} from "./frame-form-panel.js";
import { renderStartGameButton } from "./start-game-button.js";
import { escapeText, escapeAttr } from "./escape.js";

// Each popup passes a unique `variant` so its root gets a `gh-popup--<variant>` class.
// CSS scopes the per-popup character/shadow/message knobs to that class (see
// public/components.css → "Per-popup overrides"), so tuning one popup never leaks
// into the others.
function variantClass(variant) {
  return variant ? ` gh-popup--${variant}` : "";
}

/**
 * @param {object} [opts]
 * @param {string} [opts.title]       header text (white on blue bar)
 * @param {string} [opts.body]        body HTML (trusted; character + message etc.)
 * @param {string} [opts.buttonLabel] Start-Game-Button label (default "ต่อไป")
 * @param {string} [opts.ariaLabel]   dialog aria-label
 * @param {string} [opts.variant]     per-popup style scope → `gh-popup--<variant>`
 */
export function renderFramePopupMarkup({ title = "", body = "", buttonLabel = "ต่อไป", ariaLabel, variant = "" } = {}) {
  return `
    <div class="app-popup__backdrop"></div>
    <div class="gh-popup${variantClass(variant)}" role="dialog" aria-modal="true"${ariaLabel ? ` aria-label="${escapeAttr(ariaLabel)}"` : ""}>
      ${renderFramePopupPanel({
        className: "gh-popup__panel",
        header: `<h2 class="gh-frame-form-panel__title">${escapeText(title)}</h2>`,
        body,
      })}
      <div class="gh-popup__button">
        ${renderStartGameButton({ label: buttonLabel })}
      </div>
    </div>`;
}

export function renderFramePopupShortMarkup({ title = "", body = "", buttonLabel = "ต่อไป", ariaLabel, variant = "" } = {}) {
    return `
    <div class="app-popup__backdrop"></div>
    <div class="gh-popup-short${variantClass(variant)}" role="dialog" aria-modal="true"${ariaLabel ? ` aria-label="${escapeAttr(ariaLabel)}"` : ""}>
      ${renderFramePopupPanel({
        className: "gh-popup__panel",
        header: `<h2 class="gh-frame-form-panel__title">${escapeText(title)}</h2>`,
        body,
    })}
      <div class="gh-popup__button">
        ${renderStartGameButton({ label: buttonLabel })}
      </div>
    </div>`;
}
