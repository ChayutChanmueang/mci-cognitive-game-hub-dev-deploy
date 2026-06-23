// Shared HTML escaping for the ported components — mirrors game-hub-screen.js
// escapeHtml so dynamic values injected into template strings stay safe.

export function escapeText(value) {
  return String(value == null ? "" : value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function escapeAttr(value) {
  return escapeText(value).replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
