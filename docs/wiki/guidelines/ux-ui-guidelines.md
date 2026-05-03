# UX/UI Improvement Guidelines for Phaser & Web UI

This document serves as the general guideline for all UX/UI in the project. For the latest patterns (MUI, Glassmorphism, 2026+ updates), please refer to the **[[ux-ui-modernization-guidelines.md|Modern UX/UI Modernization Guidelines]]**.

## 1. Unified Design Token System
All UI elements (both Phaser and DOM) must use the centralized tokens defined in `src/util/game-theme.js`.

### Key Design Tokens:
- **Colors:** Primary (`0x356859`), Surface (`0xf7f4ee`), On-Surface (`0x1e1b18`).
- **Typography:** Main Font (`Baloo 2`), Body Font (`Noto Sans Thai`).
- **Border Radius:** Medium (`16px`), Large (`28px`).
- **Glassmorphism:** Use `Theme.colors.surface` with `0.95` alpha for panels.

## 2. Phaser Game Elements Guidelines
For elements rendered inside the Phaser canvas (Tutorials, Game Over, In-game popups):

### Common Components:
- **Base Class:** Always extend or redirect to `src/game/common/ui/core/ui-panel-base.js`.
- **Panels:** Use `UIPanel` which includes a standard dark overlay and rounded glass background.
- **Buttons:** Use `createButton()` from the base class for consistent hover/click animations.
- **Transitions:** Use 'Back.out' ease for opening and 'Power2.in' for closing.

### Layout:
- Centers should be responsive using `scene.scale.width / 2`.
- Depth for UI should be `2000` or higher to stay above game entities.

## 3. Web/HUD UI Guidelines
For elements rendered in the DOM overlaying the game:

### HUD Structure:
- Use the `MinigameHUD` class in `src/ui/minigame-hud.js`.
- Communication with the game must happen via the `EventBus`.
- HUD should be "Glassmorphic" using CSS variables from `public/style.css`.

### Interaction:
- Use Material Web Components (`<md-icon-button>`, `<md-linear-progress>`) where possible.
- Ensure all interactive elements have hover states and active states.

## 4. Localization & Accessibility
- **Language:** Default to Thai for game instructions.
- **Thai Fonts:** Always include fallback to "Noto Sans Thai".
- **Contrast:** Ensure text color follows the `onSurface` or `onPrimary` tokens for readability.

## 5. Improvement Workflow
1. **Check Guidelines:** Read this document.
2. **Review Existing Components:** Check `src/game/common/ui` for reusable logic.
3. **Use Tokens:** Never hardcode hex values; use `Theme.colors`.
4. **Test & Verify:** Use the browser to verify visual consistency and performance.

---
*Last Updated: 2026-05-02*
