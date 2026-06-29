// Frame_TextFieldBox / Frame_BoxTextInformation (Figma 3161:646). Ported from the
// verified demo (FrameTextFieldBox.vue). A white rounded box with a light-blue
// OUTSIDE stroke (box-shadow spread), wrapping a borderless native <input> so the
// surface matches Figma exactly while keeping a real, accessible form control.
//
//   3161:647 fill #fff, stroke rgb(173,229,249) OUTSIDE 1.646, cornerRadius 18.667
import { escapeAttr } from "./escape.js";

/**
 * @param {object} [opts]
 * @param {string} [opts.id]
 * @param {string} [opts.type]        input type (default "text")
 * @param {string} [opts.inputmode]
 * @param {string} [opts.placeholder]
 * @param {string} [opts.autocomplete]
 * @param {string} [opts.value]
 * @param {string} [opts.ariaLabel]   used when there is no visible <label for>
 * @param {"left"|"center"} [opts.align]  text alignment inside the box
 * @param {string} [opts.className]   extra class(es) appended to the box
 */
export function renderFrameTextFieldBox({
  id,
  type = "text",
  inputmode,
  placeholder = "",
  autocomplete,
  value = "",
  ariaLabel,
  align = "left",
  className = "",
} = {}) {
  const boxCls = `gh-frame-field-box${className ? ` ${className}` : ""}`;
  const inputCls = `gh-frame-field-box__input${align === "center" ? " gh-frame-field-box__input--center" : ""}`;
  const attrs = [
    id ? `id="${escapeAttr(id)}"` : "",
    `type="${escapeAttr(type)}"`,
    inputmode ? `inputmode="${escapeAttr(inputmode)}"` : "",
    placeholder ? `placeholder="${escapeAttr(placeholder)}"` : "",
    autocomplete ? `autocomplete="${escapeAttr(autocomplete)}"` : "",
    value ? `value="${escapeAttr(value)}"` : "",
    ariaLabel ? `aria-label="${escapeAttr(ariaLabel)}"` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `<div class="${boxCls}"><input class="${inputCls}" ${attrs} /></div>`;
}
