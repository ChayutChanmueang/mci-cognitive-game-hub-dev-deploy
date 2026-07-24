# Zoo Feeder Tutorial Panel — Figma Alignment Plan

## 1. Goal

Bring `TutorialPanel` (`src/ui/tutorial-panel.js`) into pixel-and-proportion alignment with the
approved Figma design for the zoo-feeder "คู่มือการเล่น" (how to play) carousel, **without changing
the visual output for `medicine-feeder`**, which reuses the same shared component.

This is a planning document only. No code is changed as part of writing this file.

## 2. Current architecture (recap)

- `TutorialPanel` is plain JS/DOM (no framework), instantiated by
  `src/game/zoo-feeder/scenes/UITestScene.js` (and identically by
  `src/game/medicine-feeder/scenes/UITestScene.js`) into the `#ui-root` overlay div.
- Pages are **not** a static array — they're derived at render time from theme JSON
  (`zoo-theme.json`): one page per distinct `ReceiverSetting[...].AcceptableCategory`
  (currently "Vegetable" → herbivore page, "Meat" → carnivore page), plus one trailing
  "reject" page for any `ItemSpriteLibrary` category with no receiver ("Junk").
- Outer chrome (overlay, panel box, nav button row) is styled via CSS classes in
  `public/style.css`. Per-page card content (badges, icon rows, item chips) is built as
  **inline `style="..."` strings** inside `buildCategoryCard()` / `buildRejectCard()` in
  `tutorial-panel.js` — there is no separate CSS for those.
- A `resizePanel()` method scale-fits the whole wrapper to the viewport (`transform: scale()`),
  capped at 1.0. This logic is dimension-agnostic and needs **no changes** — it measures the
  rendered wrapper, so it will adapt automatically once the wrapper's natural size changes.

## 3. Problems found vs. the Figma spec

| # | Issue | Current | Figma target |
|---|---|---|---|
| 1 | **Font-family typo (bug, not a design change)** | Inline styles use `'Noto Looped Thai'`, which is **not a loaded font** (only `"Noto Sans Thai Looped"` is linked in `index.html`) — text silently falls back to generic sans-serif | `'Noto Sans Thai Looped'` (matches `--main-font` CSS var already used elsewhere) |
| 2 | Font weight 600 used but not loaded | Google Fonts link only requests weights `400;500;700` for Noto Sans Thai Looped | Add `;600` to the weight list |
| 3 | Panel width | 876px (`.tutorial-wrapper`, `.result-panel`) | 971px |
| 4 | Header bar height | 200px | ~152px (151.93) |
| 5 | Header title font size | 100px | 80px |
| 6 | Panel drop shadow | none | `box-shadow: 0px 16px 8px rgba(0,0,0,0.15)` |
| 7 | Page title ("เกมคัดเลือก...") font size | 52px | 56px |
| 8 | Subdescription font size | 32px | 44px |
| 9 | Category badge icon size | fixed 253×253px | ~200–215px tall (Figma icons run 169–214px depending on page) |
| 10 | Chip container border-radius / padding | `border-radius: 70px; padding: 26px 52px` | `border-radius: 52px`, sized closer to a 756×260 box |
| 11 | Item icons sit flush inside their chip | no overlap | icons should visually overlap ("peek over") the top edge of the rounded chip background |
| 12 | Reject-page icon | plain `Garbage.png` at 205×205px | red-circle "prohibited sign" badge (cream fill, red border, diagonal red slash) around the trash icon |
| 13 | Nav buttons size | 360×180px, font 60px, no border | 406.97×209.76px, font ~75px, `border: 12px solid #FFFFFF` |
| 14 | Nav row width / gap | 876px / 40px | 950px / ~50px |
| 15 | Final page button label | hardcoded `"เริ่มเล่นเกม"` | `"เริ่มเกม"` |
| 16 | `rejectText` never wired | `UITestScene.js` doesn't pass `rejectText`; relies on a hardcoded fallback string in `tutorial-panel.js` that happens to match | Wire it explicitly from theme JSON, matching the existing `acceptText` pattern |

Items 3–15 are visual/design changes and **must be scoped to zoo-feeder only** (see §5).
Items 1–2 are correctness bugs and should be fixed globally (they only improve medicine-feeder too).

## 4. Unified design token reference (Figma spec)

All Figma coordinates were exported relative to two different parent frames depending on page
(a bare "Group" for pages 1–2, an auto-layout "Frame" for page 3), which introduces a constant
+239px offset between them. Normalizing everything to **y = 0 at the top edge of the white
rounded panel** (i.e. the header's top edge) gives one consistent table:

| Element | y (from panel top) | Size | Font / weight | Color |
|---|---|---|---|---|
| Header bar | 0 | height 152px | — | bg `#FFA02E` (via `panelHeaderColor` option) |
| Header title "คู่มือการเล่น" | 12 | h 128 | 80px / 700, line-height 128 | `#FFFFFF` |
| Page title (e.g. "เกมคัดเลือกอาหารให้ถูกต้อง") | ~163.5 | w 679, h 90 | 56px / 600, line-height 90 | `#945E17` (primaryFontColor) |
| Subdescription ("เลือกอาหารที่สัตว์กินไม่ได้ออกจากสายพาน") | ~243.5 | w 784, h 70 | 44px / 500, line-height 70, center | `#DE8519` (secondaryFontColor) |
| Category badge pill | ~338 | h 114, auto-width (≈349–401px per text), radius 30.875, padding `0 38px` | 60.68px / 600 | white text on category color |
| Icon row (animal icons / prohibited badge) | ~504 | h 176 (herbivore) – 214 (carnivore) – 252 (reject badge) | — | — |
| Caption ("อาหารที่กินได้ :" / "ของที่ต้องคัดออก :") | ~732.5 | h 77 | 48px / 600 | `#945E17` |
| Chip container (tinted rounded box) | ~837.5 | w 756, h 260, radius 52 | — | category tint @ 20% alpha |
| ↳ each item: icon | — | ~175–208px tall, "peeks" above container top | — | drop-shadow `0 4px 8px rgba(0,0,0,.25)` |
| ↳ each item: name label pill | — | h ~61–64 | 40px / 600 | `#81512E`, 1px white text-stroke |
| *(gap 43px)* | 1183 | — | — | — |
| Nav button row | 1183+ | w 950, buttons 406.97×209.76, radius 89.4, gap 50.62, border `12px solid #FFFFFF` | 74.94px / 700 | white text |

Per-page deltas:

| Page | Badge text | Badge color | Icon row content | Caption | Chip container tint | Final button |
|---|---|---|---|---|---|---|
| 1. Herbivore (Vegetable) | "สัตว์กินพืช" (349px) | green `#7DC850` | 2–3 animal icons (Cow/Panda/Elephant — see §6 open note) | "อาหารที่กินได้ :" | `rgba(73,205,56,0.2)` | Next → "ถัดไป" |
| 2. Carnivore (Meat) | "สัตว์กินเนื้อ" (362px) | orange `#EA7D30` | 3 animal icons (Lion/Fox/Bear) | "อาหารที่กินได้ :" | `rgba(249,169,112,0.2)` | Next → "ถัดไป" |
| 3. Reject (Junk) | "สิ่งที่กินไม่ได้" (401px) | red `#F04E4E` | 1 large prohibited-sign badge (265×252) | "ของที่ต้องคัดออก :" | `rgba(249,169,112,0.2)` (same orange tint, confirmed in Figma) | Last → **"เริ่มเกม"** |

Note: colors above are already correct in the current code (driven by `CategoryStyles` /
`cardPalettes` / hardcoded reject styling) — only sizes, fonts and spacing need changes.

## 5. Scoping the change to zoo-feeder only

Add a new `TutorialPanel` constructor option: `variant` (string), default `"classic"`.

- `medicine-feeder`'s `UITestScene.js` — **no changes**, so it implicitly keeps `variant: "classic"`
  and renders exactly as it does today (876px baseline, current fonts/sizes).
- `zoo-feeder`'s `UITestScene.js` — passes `variant: "figma"`.

Inside `tutorial-panel.js`, `render()` adds a modifier class when `variant === "figma"`:
- `tutorial-wrapper` → also gets `tutorial-wrapper--figma`
- `tutorial-result-panel` → also gets `result-panel--tutorial-figma`
- `tutorial-nav-row` → also gets `tutorial-nav-row--figma`
- both nav buttons → also get `tutorial-nav-btn--figma`

`public/style.css` gets new rules under these modifier classes (971px width, 152px header,
407×210 buttons, etc. — see §4) **alongside**, not replacing, the existing classic rules.

`buildCategoryCard()`, `buildRejectCard()`, and the new prohibited-badge builder branch
internally on `this.options.variant` for the inline-style values (font sizes, icon sizing,
peek-over offsets, chip container proportions) — the `"classic"` branch is simply today's
existing code, moved as-is into an `if` branch, so medicine-feeder's output is byte-for-byte
unchanged.

## 6. Open item worth flagging to the design/content owner

Figma's herbivore page (`Group 1320` in the source CSS) shows only **2** animal icon groups,
but `zoo-theme.json`'s `ReceiverSetting` currently maps **3** receivers (COW, PANDA, ELEPHANT)
to the `Vegetable` category, so the current code will always render 3 icons there. This is
either an intentional design simplification (show fewer example animals) or the Figma mock
predates the Panda receiver being added. Recommend confirming with whoever owns the Figma file
before finalizing the icon-row layout; the icon-sizing/gap values in §4 work fine for either
2 or 3 icons (flex row, `object-fit: contain`, consistent gap), so this doesn't block
implementation — it only affects which/how-many icons appear.

## 7. Implementation steps (ordered, lowest-risk first)

### Step 1 — Global font-family bugfix
File: `src/ui/tutorial-panel.js`
Replace every occurrence of `'Noto Looped Thai'` with `'Noto Sans Thai Looped'` (7 occurrences,
in the description/subdescription blocks and inside `buildCategoryCard`/`buildRejectCard`).
Applies to both games — this is a correctness fix, not a design change.

File: `index.html` (line 12)
Add weight `600` to the `Noto+Sans+Thai+Looped` weight list in the Google Fonts `<link>`.

### Step 2 — Theme JSON additions
File: `src/game/zoo-feeder/themes/zoo-theme.json`
Add to `StartMenuSetting`:
- `"rejectText": "ของที่ต้องคัดออก :"`
- `"startButtonText": "เริ่มเกม"`

(Leave `medicine-feeder`'s theme JSON untouched — its `UITestScene.js` won't pass these new
options through, so `TutorialPanel` will keep using its own `"classic"`-variant defaults.)

### Step 3 — Wire new options into zoo-feeder's instantiation
File: `src/game/zoo-feeder/scenes/UITestScene.js` (~line 131)
In the `new TutorialPanel(uiRoot, { ... })` call, add:
- `variant: "figma"`
- `rejectText: StartMenuSetting.rejectText`
- `startButtonText: StartMenuSetting.startButtonText`

### Step 4 — Outer chrome CSS (variant-gated)
File: `public/style.css`
Add new modifier rules (do not edit the existing classic rules):
- `.tutorial-wrapper--figma { width: 971px; }`
- `.result-panel--tutorial-figma { box-shadow: 0px 16px 8px rgba(0,0,0,0.15); }` (border-radius
  104px and border color/width are already correct and shared)
- `.result-panel--tutorial-figma .result-header { height: 152px; }`
- `.result-panel--tutorial-figma .result-header h2 { font-size: 80px; }`
- `.tutorial-nav-row--figma { width: 950px; gap: 50px; }`
- `.tutorial-nav-btn--figma { width: 407px; height: 210px; font-size: 75px; border-radius: 89px; border: 12px solid #FFFFFF; box-sizing: border-box; }`

### Step 5 — Per-page inline styles (variant-gated) in `tutorial-panel.js`
Branch `buildCategoryCard()` on `this.options.variant`:
- description block font-size: 56px (figma) vs 52px (classic)
- subdescription font-size: 44px (figma) vs 32px (classic), tighten `margin-top` to ~0–8px
- badge pill padding: `0 38px` (figma) vs `0 45px` (classic)
- icon `<img>` sizing: `height: 210px; width: auto;` (figma) vs `253px` (classic); row `gap: 28px`
- chip container: `border-radius: 52px` (figma) vs `70px` (classic); adjust `padding` so the
  box lands close to 260px tall with the 175px item images (tune visually against Figma)

Mirror the same branching in `buildRejectCard()`.

Recommended cleanup while touching this: the item-chip image+label markup is currently
duplicated between `buildCategoryCard` and `buildRejectCard`. Consider extracting a small
private helper (e.g. `buildItemChip(item, itemNames, variant)`) used by both — optional, not
required for correctness.

### Step 6 — "Peek-over" effect for chip items (figma variant only)
Within the figma-variant item-chip markup:
- Change the chip container's alignment so items are anchored to the bottom
  (`align-items: flex-end`) rather than centered.
- Give the item `<img>` a negative `margin-top` (~-30 to -40px, tune per image aspect ratio) so
  it visually overlaps/extends above the container's rounded top edge.
- Ensure the image renders above the container background (natural DOM stacking already
  achieves this since the image is a child, not a sibling positioned behind — no explicit
  z-index should be needed, but verify visually).

### Step 7 — Prohibited-sign badge for the reject page (figma variant only)
Replace the reject card's plain `<img src="assets/zoo-feeder/etc/Garbage.png" .../>` with a
composite badge, e.g.:
```html
<div style="position:relative; width:252px; height:252px; border-radius:126px;
            background:#FFEEC6; border:8px solid #F94747;
            box-shadow:0 11px 4px rgba(80,80,80,0.25);
            display:flex; align-items:center; justify-content:center;">
  <img src="assets/zoo-feeder/etc/Garbage.png"
       style="height:85%; width:auto; object-fit:contain;" />
  <div style="position:absolute; width:80%; height:8px; background:#F94747;
              border-radius:4px; transform:rotate(54deg);"></div>
</div>
```
(Values are starting points from the Figma spec — fine-tune the slash length/angle and icon
inset visually against the reference.) Keep the classic-variant branch as today's plain
`<img>` markup, unchanged.

### Step 8 — Final button label
In `render()`, replace the hardcoded `"เริ่มเล่นเกม"` string with
`this.options.startButtonText || "เริ่มเล่นเกม"` so zoo-feeder (which now passes
`startButtonText: "เริ่มเกม"` via Step 2/3) shows the Figma text while medicine-feeder keeps
its existing default.

## 8. Verification (manual — no automated tests per request)

1. Run the dev server and open the zoo-feeder game; step through all 3 tutorial pages
   (herbivore → carnivore → reject) using both Back and Next/Start buttons.
2. Compare each page side-by-side against the Figma reference at 100% browser zoom on a
   desktop-sized viewport; check header size, text sizes/positions, badge, icon row, chip
   row, and nav buttons.
3. Resize the browser window (including narrow/short viewports) and confirm `resizePanel()`
   still scales the whole panel down smoothly with no clipping or overlap, and stays centered.
4. Confirm page 1 shows only the Next button (centered, no Back), page 2/3 show both buttons,
   and the final page's forward button reads "เริ่มเกม" and starts the game on click.
5. Open medicine-feeder's tutorial panel and confirm it looks **pixel-identical to before**
   this change (876px width, old fonts, old reject icon, old button label) — this is the
   regression check that the `variant` gating worked.
6. Spot-check that `'Noto Sans Thai Looped'` is actually rendering (inspect computed font-family
   in devtools) rather than falling back to a generic sans-serif, on both games.
