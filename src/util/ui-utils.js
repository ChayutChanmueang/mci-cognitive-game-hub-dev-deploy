/**
 * Automatically scales a Phaser Text object so it does not exceed the maximum allowed width.
 * @param {Phaser.GameObjects.Text} textObject - The text object to scale.
 * @param {number} maxWidth - The maximum allowed width in pixels.
 * @param {number} defaultScale - The default scale to reset to if the text fits.
 */
export function autoScaleText(textObject, maxWidth, defaultScale = 1) {
    if (!textObject || !textObject.width) return;
    
    if (textObject.width > maxWidth) {
        const newScale = maxWidth / textObject.width;
        textObject.setScale(newScale);
    } else {
        textObject.setScale(defaultScale);
    }
}
