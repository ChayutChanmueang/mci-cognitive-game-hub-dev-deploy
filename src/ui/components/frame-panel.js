// Frame_Panel (Figma 3161:657). Ported from the verified demo (FramePanel.vue).
// A white rounded surface with a blue OUTSIDE stroke (12) rendered as box-shadow
// spread, plus a soft drop shadow. Used as a flexible container — pass the inner
// markup via `body` (trusted HTML composed by the caller) and an optional extra class.
//
//   3161:658 fill #fff, stroke rgb(138,197,219) OUTSIDE 12, cornerRadius 104,
//            DROP_SHADOW offset(0,16) radius 8 rgba(0,0,0,0.15)

/**
 * @param {object} [opts]
 * @param {string} [opts.body]      inner HTML (already-escaped / trusted)
 * @param {string} [opts.className] extra class(es) appended to the panel
 */
export function renderFramePanel({ body = "", className = "" } = {}) {
  const cls = `gh-frame-panel${className ? ` ${className}` : ""}`;
  return `<div class="${cls}">${body}</div>`;
}
