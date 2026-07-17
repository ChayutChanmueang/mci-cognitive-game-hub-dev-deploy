// Frame_Form_Panel (Figma 3161:746). Ported from the verified demo (FrameFormPanel.vue).
// A white rounded panel (blue OUTSIDE stroke 12 + drop shadow) with a blue top header
// bar (top corners rounded). Pass the header content (e.g. back button + title) and the
// body content (fields + actions). Both are trusted HTML composed by the caller.
//
//   3161:695 base #fff, stroke rgb(138,197,219) OUTSIDE 12, cornerRadius 104, drop shadow
//   3161:739 top bar rgb(137,212,239), top corners 104, bottom 0

/**
 * @param {object} [opts]
 * @param {string} [opts.header]    header HTML (back button + title)
 * @param {string} [opts.body]      body HTML (fields + actions)
 * @param {string} [opts.className] extra class(es) on the panel
 */
export function renderFrameFormPanel({ header = "", body = "", className = "" } = {}) {
  const cls = `gh-frame-form-panel${className ? ` ${className}` : ""}`;
  return `<div class="${cls}">
      <div class="gh-frame-form-panel__top">${header}</div>
      <div class="gh-frame-form-panel__body">${body}</div>
    </div>`;
}

export function renderFramePopupPanel({ header = "", body = "", className = "" } = {}) {
  const cls = `gh-frame-form-panel${className ? ` ${className}` : ""}`;
  return `<div class="${cls}">
      <div class="gh-frame-form-panel__top">${header}</div>
      <div class="gh-frame-popup-panel__body">${body}</div>
    </div>`;
}