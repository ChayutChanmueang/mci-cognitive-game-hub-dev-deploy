# Zoo Feeder Tutorial Panel — Figma Alignment, Round 2 (Closing Remaining Gaps)

## 1. Context

The original planning doc (`docs/ideas/zoo-feeder-tutorial-panel-figma-alignment.md`) spec'd out
bringing `TutorialPanel` in line with the zoo-feeder Figma "คู่มือการเล่น" (how to play) tutorial.

**That plan has already been implemented in the working tree** (uncommitted at time of writing) —
confirmed by reading the actual files:

- [`src/ui/tutorial-panel.js`](../../src/ui/tutorial-panel.js) already has a
  `this.options.variant === "figma"` branch throughout (`isFigma` checks in `buildCategoryCard`,
  `buildRejectCard`, and `render()`), gated so `medicine-feeder` (which never passes `variant`)
  renders exactly as before.
- [`public/style.css`](../../public/style.css) (around line 3225) already has the `--figma`
  modifier classes: 971px wrapper, 152px/80px header, 407×210 nav buttons with
  `border: 12px solid #FFFFFF`, etc.
- [`src/game/zoo-feeder/themes/zoo-theme.json`](../../src/game/zoo-feeder/themes/zoo-theme.json)
  already has `rejectText` and `startButtonText` in `StartMenuSetting`.
- [`src/game/zoo-feeder/scenes/UITestScene.js`](../../src/game/zoo-feeder/scenes/UITestScene.js)
  (around line 131) already passes `variant: "figma"`, `rejectText`, `startButtonText` into
  `TutorialPanel`.
- `index.html` already loads Noto Sans Thai Looped weight `600`, and the `'Noto Looped Thai'`
  font-family typo bug is already fixed everywhere in `tutorial-panel.js`.

This round's job is **not** to rebuild the panel — it's to audit that already-implemented
"figma" variant against a newer, more detailed CSS/image export (which includes exact per-icon
rotation values and the full prohibited-sign badge geometry that round 1 only approximated), and
close the handful of remaining fidelity gaps. Almost all existing code stays as-is.

## 2. What's already verified correct (no change needed)

Cross-checking the new CSS export against the current code confirms these already match:

| Element | Spec | Current code |
|---|---|---|
| Panel | 971px wide, 152px header, `box-shadow: 0 16px 8px rgba(0,0,0,.15)` | `.tutorial-wrapper--figma`, `.result-panel--tutorial-figma` |
| Header title | 80px / 700 | `.result-panel--tutorial-figma .result-header h2` |
| Page title / subdescription | 56px/600, 44px/500 | `descFontSize` / `subDescFontSize` in `render()` |
| Category badge pill | h114, radius 30.88, padding `0 38px`, 60px/600 white text | `buildCategoryCard` / `buildRejectCard` isFigma branch |
| Caption ("อาหารที่กินได้ :" / "ของที่ต้องคัดออก :") | 48px/600 `#945E17` | already rendered; both keys exist in theme JSON |
| Chip container | radius 52, tinted bg | `chipContainerRadius = isFigma ? "52px" : "70px"` |
| Item "peek-over" effect | icon overlaps rounded top edge | `chipAlignItems: flex-end` + negative `margin-top` on item `<img>` |
| Prohibited badge | cream fill `#FFEEC6`, red border `#F94747` ~8px, radius caps at half of 252, shadow `0 ~11px 4px rgba(80,80,80,.25)` | `buildRejectCard` isFigma badge markup — already near-exact |
| Nav buttons | 407×209.76, radius ~89, `border: 12px solid #FFFFFF`, 75px/700 text | `.tutorial-nav-btn--figma` |
| Page 1 shows only "ถัดไป" (no back button) | Frame 1256 has one button only | `tutorial-nav-btn--hidden` on `currentPage === 0` |
| Final page button label | "เริ่มเกม" | `startButtonText` wired from theme JSON |

**Resolved open item from round 1:** the original doc flagged uncertainty over whether the
herbivore page should show 2 or 3 animal icons (Figma seemed to show only 2). The newer CSS
export includes `Group 1320` containing **three** nested groups (`Group 13`, `Group 12`,
`Group 10` — one detailed vector-icon export per animal face), confirming **3 icons**, matching
the 3 `ReceiverSetting` entries (COW / PANDA / ELEPHANT) already in `zoo-theme.json`. No code
change required — this caveat can be dropped from future reference.

## 3. Remaining gaps to close

These are the only real deltas between the current implementation and the newer, more detailed
spec:

1. **Item icons on the reject page should be individually rotated.** The new CSS shows the
   junk-item images (`Frame 1334` / `1336` inside the reject page's `Group 1319`) each carrying a
   `transform: rotate(...)` — roughly 8.34deg on one item, 10.71deg on another, third left
   upright — giving the "carelessly discarded" items a scattered look, whereas the accept-page
   items (herbivore / carnivore) are all upright. The current shared `itemImgs` mapper in
   `buildRejectCard` / `buildCategoryCard` applies no rotation at all.
2. **Prohibited-badge diagonal slash is short.** Figma's slash (`Rectangle 926`) is 258.19px wide
   against a 265.08px-wide badge — i.e. it spans ~97% of the badge, crossing it almost
   corner-to-corner. Current code uses `width: 80%`, which reads visibly shorter / off-center
   once compared side-by-side with the reference.
3. **Per-item peek offset is currently one flat value** (`-35px` margin-top for every chip item,
   on both accept and reject cards). The newer spec implies each icon's peek amount differs
   slightly per image (source crops differ per asset), most noticeably the reject page's rotated
   icons needing a bit more negative margin to still read as "peeking" once rotated. Not worth
   hardcoding Figma's exact per-image px values (the project's actual PNG assets have different
   crops than Figma's placeholder images), but reject-card rotated items should get a somewhat
   larger default offset than accept-card items.
4. **Minor cleanup, recommended while touching this code anyway:** round 1's doc already flagged
   that the item-chip markup (icon + name label) is duplicated verbatim between
   `buildCategoryCard` and `buildRejectCard`. Since gaps #1 and #3 both require editing that exact
   block, extract it into one shared private helper now instead of maintaining two copies.

## 4. Implementation guide

**Tech stays exactly as-is:** plain DOM string templates with inline styles, driven by the
existing `variant === "figma"` gating — no framework, canvas, or SVG needed. All of Figma's
detailed per-icon "Vector" path exports (the `Group 13` / `12` / `10` layers in the design file)
are just Figma's internal decomposition of already-rasterized PNG icons this project already
ships under `public/assets/zoo-feeder/animal/icons/` and `public/assets/zoo-feeder/food/` —
there's nothing to hand-draw; keep using the existing `<img>`-based approach.

### Step 1 — Extract the shared item-chip helper
File: `src/ui/tutorial-panel.js`
Add a private method, e.g. `buildItemChip(item, itemNames, { isFigma, rotateDeg })`, returning the
existing chip markup (icon `<img>` + name `<span>`), parameterized by an optional `rotateDeg`.
Call it from both `buildCategoryCard` (no rotation) and `buildRejectCard` (with rotation, see
Step 2). This removes the current duplication without changing accept-page output at all.

### Step 2 — Add subtle rotation to reject-page item icons
File: `src/ui/tutorial-panel.js`, inside `buildRejectCard`'s `itemImgs` mapping.
Apply a small per-index rotation only when `isFigma` and only on the reject card — e.g. alternate
something like `[-8, 0, 10]` degrees by item index (tune visually against the Figma reference;
exact degrees aren't critical, the "scattered" effect is what matters). Combine with a slightly
larger negative `margin-top` (~`-45px` instead of `-35px`) on the rotated items only, so the icon
still visually peeks above the chip container after rotation. Leave `buildCategoryCard`'s items
unrotated, matching the spec (herbivore/carnivore pages show upright icons).

### Step 3 — Widen the prohibited-badge slash
File: `src/ui/tutorial-panel.js`, inside `buildRejectCard`'s badge markup (currently `width: 80%`
on the diagonal `<div>`). Change to roughly `width: 97%` (or a fixed `~257px` against the ~265px
badge) so the slash reads as spanning the full circle, matching the reference image.

### Step 4 — No changes needed to `style.css`, `zoo-theme.json`, or `UITestScene.js`
All the metrics those files already encode (panel/header/nav-button sizing, `rejectText`,
`startButtonText`, `variant: "figma"` wiring) already match the newer spec. Don't touch them.

## 5. Additional gap found from live-build screenshot QA

A screenshot of the actual running zoo-feeder tutorial (page 1, herbivore) on a phone-shaped
viewport showed the panel's own internals rendering correctly (orange header, badge, 3 animal
icons, tinted item-chip box, nav button all present and structurally matching Figma) — but the
panel+button composition only fills roughly the middle ~50-55% of the screen's height. A large
band of dimmed gameplay is visible above (top HUD bar + three empty conveyor lanes) and below
(idle receiver animals standing on grass), whereas the Figma mockup frames show the panel+button
filling nearly the entire screen with minimal surrounding space.

**Root cause:** `resizePanel()` in `tutorial-panel.js` scales the whole wrapper uniformly via
`scale = Math.min(1.0, scaleX, scaleY)` to guarantee no clipping. The Figma-variant wrapper's
natural (unscaled) size is ~971×1443px — an aspect ratio (width÷height) of ~0.67. A typical
portrait phone viewport is narrower relative to its height (aspect ratio roughly 0.45–0.55).
Because the design is proportionally "wider" than the phone screen, **`scaleX` (fit-to-width)
becomes the binding constraint**, and the resulting scaled height ends up well short of the
available viewport height — leaving that vertical slack empty top and bottom. This matches what
the screenshot shows. It isn't a missing-style bug; it's a scale-fit/aspect-ratio mismatch. Note
that the Figma mockup images aren't proof this fits any specific real device — those frames were
almost certainly just cropped tightly around the design in the Figma canvas, not simulating an
actual phone viewport.

**Recommended fix (two complementary changes, both low-risk):**

1. In `resizePanel()`, bump the width budget slightly, e.g. `window.innerWidth * 0.9` →
   `* 0.95`. Since `transform: scale()` scales both dimensions together, a larger achievable
   scale from more width budget also proportionally grows the height, shrinking (not
   eliminating) the dead space.
2. More impactful: reduce the Figma-variant wrapper's own *natural* height so its aspect ratio
   moves closer to a real phone's, which raises the scale that `scaleX` allows in the first
   place. Candidates inside the isFigma branch of `tutorial-panel.js` / the `--figma` CSS rules:
   trim the ~43px inter-section gaps between page-content blocks, and tighten the chip
   container's vertical padding (currently `16px 52px`) — these are exactly the kind of "safe to
   compress a little" gaps that won't visibly break the Figma proportions at a glance, but add up
   across the ~1443px total height.

Do **not** try to fix this by changing the `Math.min(scaleX, scaleY)` fit strategy itself (e.g.
biasing toward height) — that risks the panel overflowing/clipping horizontally on genuinely
narrow devices, which is worse than the current symmetric dead-space behavior.

**Also verify while implementing:** the item-chip name labels ("พืช" / "ข้าวโพด" / "แอปเปิ้ล")
sit inside Figma-specified pill widths as narrow as 56–142px. Confirm the project's actual font
rendering of these Thai strings at 40px/600 doesn't wrap or clip inside those widths on the live
build — the current code doesn't fix a width on the label `<span>`, so this is likely fine, but
worth a visual double-check now that a real screenshot is available for comparison.

## 6. Verification (manual — no automated tests)

1. Run the dev server, open zoo-feeder, step through all 3 tutorial pages (herbivore → carnivore
   → reject) via both Back and Next/Start.
2. Compare the reject page's three item chips against the reference image: confirm two icons now
   sit at a slight tilt while the third stays upright, and that they still visually "peek" above
   the tinted chip container's top edge without looking cut off or floating.
3. Compare the prohibited (no-entry) badge on the reject page against the reference image: the red
   diagonal slash should now visually cross the full badge circle, not stop short.
4. Confirm herbivore/carnivore pages are pixel-unchanged (no rotation applied there — only the
   reject page changes).
5. Resize the browser window and confirm `resizePanel()` still scale-fits smoothly with no
   clipping.
6. Open medicine-feeder's tutorial panel and confirm it's still pixel-identical to its pre-figma
   baseline (876px width, no rotation, old badge) — regression check that `variant` gating still
   holds after these edits.
7. On an actual phone-shaped viewport (or a resized/narrow browser window, not just a wide
   desktop window), confirm the panel+button now visibly fills more of the screen height after
   the `resizePanel()` width-budget and internal-spacing tuning from §5 — compare against this
   round's baseline screenshot to confirm the dimmed dead space above/below has shrunk.
