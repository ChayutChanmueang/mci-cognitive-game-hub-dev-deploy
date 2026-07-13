# Symmetry Decor Mobile Performance Optimization — Case Study

> **Games:** Symmetry Decor, Symmetry Decor (Household)
> **Commit:** `8c7d528` — *feat : optimize symmetry decor code base*
> **Files involved:**
> - [`entity/entity.js`](../../../src/game/symmetry-decor/entity/entity.js) (+ [household copy](../../../src/game/symmetry-decor-household/entity/entity.js))
> - [`components/scripts/draggable.js`](../../../src/game/symmetry-decor/components/scripts/draggable.js), [`sprite-renderer.js`](../../../src/game/symmetry-decor/components/scripts/sprite-renderer.js), [`solutionSocket.js`](../../../src/game/symmetry-decor/components/scripts/solutionSocket.js), [`non-draggable.js`](../../../src/game/symmetry-decor/components/scripts/non-draggable.js)
> - [`scenes/Gameplay.js`](../../../src/game/symmetry-decor/scenes/Gameplay.js) (+ [household copy](../../../src/game/symmetry-decor-household/scenes/Gameplay.js))
> - [`entity/entityGrid.js`](../../../src/game/symmetry-decor/entity/entityGrid.js)
> - [`main.js`](../../../src/game/symmetry-decor/main.js) (+ [household copy](../../../src/game/symmetry-decor-household/main.js))
> - [`common/ui-elements/scripts/level-complete-effect.js`](../../../src/game/common/ui-elements/scripts/level-complete-effect.js) (shared by 7 minigames)
> - Superseded draft: [`docs/ideas/symmetry_optimization_idea`](../../ideas/symmetry_optimization_idea)

---

## Summary

Testers reported that **Symmetry Decor** (a Phaser 3 + Vite drag-and-drop puzzle) felt laggy on mobile web. Investigation found the game was doing a large amount of per-frame work it didn't need for a puzzle with zero physics interactions: ~72 fully-simulated Arcade Physics bodies, ~144 empty per-frame component update calls, a React-bridging event firing 60×/sec instead of 1×/sec, a per-sprite WebGL post-processing pass on blocker tiles, and an 80-node DOM particle effect competing with the Phaser canvas. All of these were fixed without changing gameplay. Two other suspected issues (a "grid cleanup leak" and a missing device-pixel-ratio cap) were investigated and found to be either already handled by the engine or unsafe to fix — see [Investigated But Not Changed](#investigated-but-not-changed) for why that matters as much as the fixes themselves.

This document exists as both a record of what was done and a **reusable checklist** ([Guidelines for Future Optimization Work](#guidelines-for-future-optimization-work)) for the next minigame that needs the same treatment.

---

## Investigation Method

Before changing any code, the root causes were established and independently verified, rather than trusting a single pass:

1. **Locate and scope** — confirmed the tech stack (Phaser 3.90 + Vite, not Unity) and found that `symmetry-decor-household` is a byte-for-byte duplicate of `symmetry-decor` with the same bugs.
2. **Cross-check an existing draft** — an unstaged analysis already existed at `docs/ideas/symmetry_optimization_idea`. Every claim in it was re-verified by reading the actual source directly rather than trusting the document, and it held up.
3. **Independent research passes** — a second look at rendering/asset patterns and a third look at gameplay logic + git history surfaced two additional bottlenecks the first draft missed (the `preFX` post-processing pass and the DOM confetti effect).
4. **Safety check before the riskiest change** — before removing Arcade Physics from the shared `Entity` base class, every file in both game directories was grepped for `.body`, `setVelocity`, `setImmovable`, `overlap`, `collide` to confirm nothing outside the drag-and-drop system depended on it.
5. **Verify against the installed library, not memory/habit** — a commonly-suggested "cap the canvas resolution" fix was checked against this project's actual `node_modules/phaser/types/phaser.d.ts` and found not to exist as a simple config key in Phaser 3.90. It was dropped rather than shipped as a guess.
6. **Household parity check** — the two game directories were diffed file-by-file for every fix, because they had already silently diverged in places (see [Fix 4](#fix-4-drop-per-sprite-webgl-post-fx-on-blockers-symmetry-decor-only) and [Fix 3](#fix-3-batch-grid-border-draw-calls-symmetry-decor-only)).

---

## Root Causes (ranked by impact)

| # | Issue | Scope | Severity |
|---|-------|-------|----------|
| 1 | Unnecessary Arcade Physics body on every grid entity (~72/round) | Both | 🔴 Critical |
| 2 | Per-frame no-op component `update()` loop (~144 calls/frame) | Both | 🔴 Critical |
| 3 | `EventBus.emit('minigame:tick', ...)` fired every frame instead of once/sec | Both | 🔴 Critical |
| 4 | `console.log` in the hot drag-drop path | Both | 🟡 Moderate |
| 5 | Per-line-segment Graphics draw calls for the grid border | `symmetry-decor` only | 🟡 Moderate |
| 6 | Per-sprite WebGL `preFX` post-processing pass on blocker tiles | `symmetry-decor` only | 🟡 Moderate-High |
| 7 | 80-node DOM confetti effect with per-frame string (`dataset`) parsing | Shared file, 7 minigames | 🟡 Moderate-High |
| — | Suspected grid-rebuild memory leak | investigated, **not a real bug** | — |
| — | Missing device-pixel-ratio cap | investigated, **not safely fixable in this Phaser version** | — |
| — | Oversized `BG.png` (1.58 MB) / BGM (3.84 MB @ 256 kbps) | deferred, no tooling available | — |

---

## Fixes Applied

### Fix 1 — Remove unnecessary Arcade Physics

`Entity` (the base class for every grid cell, draggable, and blocker) extended `Phaser.Physics.Arcade.Sprite` and called `scene.physics.add.existing(this)` in its constructor, even though the game has zero collisions, velocity, or overlap checks — it's pure drag-and-drop with snap-to-socket logic. On a 6×6 Hard grid this meant ~72 fully-simulated physics bodies stepped every frame.

**Fix:** changed the base class to `Phaser.GameObjects.Sprite` and removed `scene.physics.add.existing(this)`. Also removed the now-dead `physics: { default: 'arcade', ... }` block from both `main.js` configs, and deleted the dead `if (this.entity.body) {...}` guard branches in `draggable.js` and the `syncPhysicsBody()` method in `sprite-renderer.js` that only existed to keep a physics body in sync.

**Why this was safe:** every physics-body read elsewhere in the codebase was already defensively guarded (`if (this.entity.body)`), so removing the body turns those into harmless no-ops instead of runtime errors. The only file with a real physics-world call (`trigger-listener.js`, `scene.physics.add.overlap(...)`) is dead code — confirmed via grep that its `TriggerListener` class is never imported or instantiated in either game directory.

### Fix 2 — Remove the per-frame no-op component loop

`Entity.preUpdate(time, delta)` iterated every attached component and called `.update()` on all of them, every frame. The base `Component.update(time, delta) {}` is empty, and no live component in either game overrides it — so this was pure call overhead for nothing.

**Fix:** deleted the `preUpdate()` override entirely (it's not needed once `Entity` no longer chains into Arcade Physics' own `preUpdate`).

### Fix 3 — Throttle the `minigame:tick` event, remove hot-path logging

`Gameplay.js`'s `update()` emitted `EventBus.emit('minigame:tick', ...)` unconditionally every frame (~60×/sec), crossing the Phaser→React bridge. The receiving HUD only needs to update once per visible second, since `timeLeftS` is already an integer.

**Fix:** cached the last-emitted value and only emit when it actually changes:
```javascript
const clampedTimeLeftS = Math.max(0, timeLeftS);
if (clampedTimeLeftS !== this._lastTimeLeftS) {
  this._lastTimeLeftS = clampedTimeLeftS;
  EventBus.emit('minigame:tick', { timeLeft: clampedTimeLeftS, maxTime: maxTimeS });
}
```
Also removed `console.log` calls from `solutionSocket.js`'s `checkEntity()` (called on every drop and every solution sweep) and from the `socketFilled` handler in `Gameplay.js`'s `create()`.

### Fix 4 — Batch grid border draw calls (`symmetry-decor` only)

`entityGrid.js`'s `drawGridBackground()` called `beginPath()`/`strokePath()` **once per individual line segment** in a nested loop — up to ~60 separate draw-call pairs on a 6×6 grid. Each pair is a separate WebGL draw call, and mobile GPUs have a much tighter draw-call budget than desktop.

**Fix:** collected segments into two arrays by color (normal border, reference-side border) and issued one `beginPath()`/`strokePath()` pair per color instead of per segment — 2 draw calls regardless of grid size.

**Household parity note:** `symmetry-decor-household`'s `entityGrid.js` needed no change — it already batches into a single path, because it lacks the "reference side" visual feature that forces the color split in the primary game. This was confirmed by diffing the two files before assuming the same fix applied to both.

### Fix 4b — Drop per-sprite WebGL post-FX on blockers (`symmetry-decor` only)

`non-draggable.js` called `this.entity.preFX.addColorMatrix().brightness(0.8)` on every blocker tile (up to ~18 on Hard difficulty) to dim it. `preFX` attaches a real WebGL post-processing render pass (extra render target + composite) *per sprite* — one of the more GPU-expensive things available in Phaser, multiplied across many sprites at once.

**Fix:** replaced it with `setAlpha(0.85)` + `setTint(0x888888)` — no post-FX pass at all. This is not a new idea: `symmetry-decor-household`'s version of the same file already used exactly this cheaper approach in production, so `symmetry-decor` was simply converged onto the pattern its sibling had already proven. This is a **visible change** (tint-dimming vs. a color-matrix brightness pass) — worth a screenshot sign-off if revisited.

### Fix 5 — Optimize the shared confetti effect

`level-complete-effect.js`'s `animateConfetti()` (fired on every round completion, shared by **7 minigames**) ran, every animation frame for ~1.5s: `parseFloat()` on 5 `dataset.*` string attributes × 80 DOM nodes, then wrote `style.transform`/`style.opacity` on each. DOM `dataset` reads/writes are string-serialized, which is expensive to repeat 80× per frame for ~90 frames.

**Fix:** replaced the per-particle `dataset` string state with a plain JS array of numeric objects created once at burst start (`{ el, dx, dy, x, y, rotation, rotationSpeed }`), so each frame does numeric property reads/writes instead of string parsing. The trajectory math, particle count, duration, and visual output are unchanged — this was a pure internal-representation change.

---

## Investigated But Not Changed

Not every suspected issue turned out to be real. Documenting *why* something wasn't changed is as valuable as documenting what was — it prevents the next person from re-adding dead defensive code or attempting an unsafe fix.

### "Grid rebuild doesn't clean up" — not a real bug

The original draft assumed that `constructGrid()`'s full destroy-and-rebuild every round left orphaned Graphics objects and physics bodies, recommending an explicit cleanup pass or adopting the project's `src/util/object-pool/` utility.

Checked directly against `node_modules/phaser/src/gameobjects/container/Container.js`: `EntityGrid` extends `Phaser.GameObjects.Container`, whose `preDestroy()` calls `this.removeAll(!!this.exclusive)`, and `exclusive` **defaults to `true`**. `removeAll(true)` calls `.destroy()` on every child in the container's list — which includes every `Entity` and both `Graphics` objects, since they were all added via `this.add(...)`. Destroying each `Entity` cascades into its own `destroy()` override, which already cleans up its components (event listeners, etc.).

**Conclusion:** the cleanup was already correct. No code change was made — adding an explicit destroy loop would have been redundant dead code duplicating what the engine already guarantees. `ArcadeObjectPool` (the only physics-aware pool available) was also confirmed to be the wrong fit post-Fix-1 anyway, since it wraps `scene.physics.add.group`.

### Device-pixel-ratio cap — not safely fixable in this Phaser version

A commonly-cited fix for GPU fill-rate cost on high-DPI phones is capping the canvas resolution via a `resolution` game-config key. Checked directly against `node_modules/phaser/types/phaser.d.ts`: **Phaser 3.90's `GameConfig`, `RenderConfig`, and `ScaleConfig` types have no `resolution` key.** The only available workaround would be globally overriding `window.devicePixelRatio` before creating the `Phaser.Game` instance — but that's a page-global mutation that would also affect the surrounding React shell's own rendering, other minigames, and anything else reading that property. Judged too risky for the benefit and skipped.

---

## Deferred (Out of Scope This Pass)

- **`public/assets/symmetry-decor/etc/BG.png`** — 1.58 MB, shared by both game variants. Target: < 300 KB, or a smaller native resolution than the current 1080×1920 stretch target.
- **`public/assets/audio/symmetry-decor/Symmetry_BGM.mp3`** — 3.84 MB at 256 kbps. Target: ~128 kbps (~1.9 MB) — negligible perceptible quality loss for a looping background track.
- No code changes are needed for either — both are referenced by file path only (`audio-manager.js` / the Preloader's `this.load.image`), so a drop-in replacement at the same path is transparent to the loader.
- **Why deferred:** no image/audio compression tooling (`ffmpeg`, `pngquant`, `cwebp`, `imagemagick`, `sharp`) was available in the working environment at the time. This needs either the project's own asset pipeline or a follow-up session with the right tooling installed.

---

## How to Verify the Improvement

DevTools emulation (Edge or Chrome — same Chromium engine, identical panels) cannot fully replicate a real 2GB-RAM device, so use a layered approach:

1. **Performance tab** — `F12 → Performance`, set CPU throttling to 4×–6× (gear icon), record a session covering idle grid, dragging, and a round transition/confetti burst. Check the FPS graph for dips and the Scripting proportion in the Summary panel.
2. **Rendering tab** — enable **"Frame Rendering Stats"** for a live on-screen FPS overlay while playing, without needing a full recording.
3. **Memory tab** — take a heap snapshot at game start, play ~10 rounds, take a second snapshot, and use the **Comparison** view. `Entity`/`Sprite`/`Graphics`/`HTMLDivElement` (confetti) counts should stay flat between snapshots, not grow every round. Also watch **Performance Monitor** (`Ctrl+Shift+P → Show Performance Monitor`) for JS heap size while playing — it should plateau/sawtooth, not climb unbounded.
4. **Real low-end device (most reliable for the 2GB-RAM concern)** — connect an Android phone via USB debugging, open `edge://inspect#devices` (or `chrome://inspect#devices`) on desktop, and inspect the mobile tab directly. This runs the same DevTools panels against the device's real CPU/GPU/RAM, which DevTools emulation cannot fake.
5. **True before/after** — `git stash` to temporarily revert to the pre-fix state (or check out the parent of commit `8c7d528`), record the same trace/snapshots as a baseline, then `git stash pop` (or check back out) and repeat for comparison.

---

## Guidelines for Future Optimization Work

A checklist distilled from this case study, for the next minigame that needs the same treatment:

1. **Don't attach Arcade Physics to a GameObject unless something actually needs collision, velocity, or overlap detection.** A drag-and-drop puzzle almost never does — physics bodies are one of the most expensive per-frame costs available in Phaser.
2. **Audit any `update()`/`preUpdate()` override for no-op work.** If it loops over a list calling `.update()` on things that inherit an empty base method, either filter to only components that actually override it, or remove the loop.
3. **Rate-limit cross-runtime events** (Phaser scene → React/DOM bridge). Match the emit frequency to what the UI actually needs to *see* change (e.g. once per visible second for a timer), not every render frame.
4. **Strip `console.log`/`console.warn` from hot paths** (drag/drop handlers, per-frame checks, anything called per-entity per-interaction) before considering a feature done — synchronous console I/O is notably expensive in mobile browsers.
5. **Batch `Graphics` draw calls by style.** Collect same-color/same-style line segments or shapes and issue one `beginPath()`/`strokePath()` pair per style group instead of one per segment — mobile GPUs have a much tighter draw-call budget than desktop.
6. **Avoid `preFX` (WebGL post-processing pipelines) for simple visual effects.** A per-sprite color-matrix/blur/glow pass is genuinely expensive when multiplied across many sprites. `setAlpha()` + `setTint()` covers most "dim/gray out/highlight" needs at a fraction of the cost.
7. **DOM-based effects layered over a WebGL canvas are a classic mobile jank source.** If one is necessary (e.g. a confetti burst using real `<div>`s for crisp text/shadows), keep the per-frame, per-node math in plain numeric variables — never read/write `element.dataset.*` inside an animation loop; it's string-serialized on every access.
8. **Verify suspected leaks against the engine's actual cleanup guarantees before adding defensive code.** Read the relevant engine source (e.g. `Phaser.GameObjects.Container.preDestroy`) rather than assuming a leak exists. Redundant cleanup code that duplicates what the framework already does is dead weight, not safety.
9. **Don't guess at engine config APIs from memory or general web advice.** Check the installed version's type definitions or source (`node_modules/<engine>/types/...` or the source itself) before promising a fix like a resolution/DPR cap — APIs change across major/minor versions.
10. **Diff copy-pasted game variants before applying a "shared" fix to both.** `symmetry-decor` and `symmetry-decor-household` started as byte-identical duplicates but had already silently diverged in places (one had already dropped `preFX`, the other's grid-drawing code didn't need the same batching). Apply fixes per-directory, guided by the same intent, not a blind copy/paste.
11. **Oversized image/audio assets are a repeat pattern across this project's minigames**, not unique to Symmetry Decor (background PNGs commonly 1.5MB+, BGM files 2–5MB+). This is worth a dedicated, project-wide asset-pipeline pass with proper tooling (`ffmpeg`/`pngquant`/`sharp`/similar) rather than a per-game afterthought.
12. **Verification needs three layers**, not just one: CPU-throttled DevTools Performance recordings (catches scripting-time regressions), heap-snapshot diffing across repeated play sessions (catches leaks), and — critically for low-RAM target devices — testing on an actual low-end physical device via remote debugging, since DevTools cannot emulate RAM pressure.
