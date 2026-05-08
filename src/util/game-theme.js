/**
 * GameTheme.js
 * Bridges the Material Design tokens from CSS to Phaser-friendly values.
 */

const Theme = {
    // Colors (0xRRGGBB format for Phaser)
    colors: {
        primary: 0x356859,
        onPrimary: 0xffffff,
        primaryContainer: 0xd2eadf,
        onPrimaryContainer: 0x143b30,
        secondary: 0x5f6257,
        surface: 0xf7f4ee,
        surfaceContainer: 0xffffff,
        onSurface: 0x1e1b18,
        onSurfaceVariant: 0x64605a,
        outline: 0xb7b0a8,
        error: 0xba1a1a,
        
        // Transparent variants (using alpha separately in Phaser)
        overlay: 0x000000,
        overlayAlpha: 0.5,
        
        glass: 0xffffff,
        glassAlpha: 0.8,
    },
    
    // Typography
    fonts: {
        main: '"Baloo 2", "Noto Sans Thai", sans-serif',
        body: '"Noto Sans Thai", sans-serif',
    },
    
    // Effects
    borderRadius: {
        small: 8,
        medium: 16,
        large: 28,
        extraLarge: 54,
    },
    
    // Helper to convert hex string to number
    hexToNum(hex) {
        return parseInt(hex.replace('#', ''), 16);
    }
};

export default Theme;
