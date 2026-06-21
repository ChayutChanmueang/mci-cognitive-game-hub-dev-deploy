// Shared number glyph for Current/Next node states.
//
// Figma: the number TEXT is white, Noto Looped Thai Bold 80, with INNER_SHADOW
// offset(0,4) radius4 rgba(0,0,0,0.25) (identical on 3108:111 current and
// 3031:194 next). CSS cannot do inner shadow on text, so it's an inline SVG + filter.
//
// DEVIATION from Figma (deliberate, production requirement): Figma's number box is
// a fixed 53px-wide LEFT/BOTTOM-aligned box sized for a single digit, which CLIPS
// two-digit numbers (a day can have 10+ game nodes). We instead use a wide box and
// CENTER the number horizontally on the coin (`centerX`), keeping the exact Figma
// vertical position (`top`) + bottom baseline. Single digits shift only a few px;
// two-digit numbers (10, 11, …) now render fully and stay centered.

const BOX_W = 160; // wide enough for two 80px digits; never clips
let seq = 0;

/**
 * @param {number|string} number  value to display (game number)
 * @param {{centerX:number, top:number}} pos  coin-face center X + Figma box top (px)
 */
export function renderNumberGlyph(number, { centerX, top }) {
  const fid = `gh-num-inner-${seq++}`; // unique filter id per instance
  const label = String(number).replace(/[<>&"]/g, ""); // hygiene; values are game numbers
  const left = centerX - BOX_W / 2;
  return `<svg class="gh-node-num" style="left:${left}px;top:${top}px;width:${BOX_W}px;height:128px" width="${BOX_W}" height="128" viewBox="0 0 ${BOX_W} 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="${fid}" x="-50%" y="-50%" width="200%" height="200%">
          <feComponentTransfer in="SourceAlpha"><feFuncA type="table" tableValues="1 0" /></feComponentTransfer>
          <feGaussianBlur stdDeviation="2" />
          <feOffset dx="0" dy="4" result="offsetblur" />
          <feFlood flood-color="rgb(0,0,0)" flood-opacity="0.25" />
          <feComposite in2="offsetblur" operator="in" />
          <feComposite in2="SourceAlpha" operator="in" />
          <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode /></feMerge>
        </filter>
      </defs>
      <text x="${BOX_W / 2}" y="128" text-anchor="middle" dominant-baseline="text-after-edge" fill="#ffffff" filter="url(#${fid})">${label}</text>
    </svg>`;
}
