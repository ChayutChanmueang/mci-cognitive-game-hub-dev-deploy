import { createThaiText } from "../../../../util/thai-text";
import { EventBus } from "../../../../core/EventBus.js";

export default class Button {
  constructor(scene, x, y, settings = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = settings.width || 500;
    this.height = settings.height || 200;
    this.defaultColor = settings.color || 0x00aa00;
    this.hoverColor = settings.hoverColor || 0x00ff00;
    this.clickColor = settings.clickColor || 0x005500;
    this.labelText = settings.labelText || "";
    this.labelOffset = settings.labelOffset || { x: 0, y: 0 };
    this.labelOrigin = settings.labelOrigin || { x: 0, y: 0 };
    this.useThaiText = settings.useThaiText || false;

    this.isActive = true;

    this.container = scene.add.container(x, y);

    this.uiBackground = scene.add.graphics();
    this.drawBg = (color) => {
        this.uiBackground.clear();
        
        // Shadow (Figma: X=0, Y=12, Blur=4, Spread=0, Color=#E49A2C)
        // Simulate slight blur by drawing outer layers with lower alpha
        this.uiBackground.fillStyle(0xE49A2C, 0.3);
        this.uiBackground.fillRoundedRect(-this.width / 2 - 2, -this.height / 2 + 10, this.width + 4, this.height + 4, 54);
        this.uiBackground.fillStyle(0xE49A2C, 0.6);
        this.uiBackground.fillRoundedRect(-this.width / 2 - 1, -this.height / 2 + 11, this.width + 2, this.height + 2, 53);
        // Core shadow
        this.uiBackground.fillStyle(0xE49A2C, 1);
        this.uiBackground.fillRoundedRect(-this.width / 2, -this.height / 2 + 12, this.width, this.height, 52);

        // Main Background
        this.uiBackground.fillStyle(color, 1);
        this.uiBackground.fillRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, 52);
    };
    this.drawBg(this.defaultColor);

    this.uiBackground.setInteractive(
        new Phaser.Geom.Rectangle(-this.width / 2, -this.height / 2, this.width, this.height),
        Phaser.Geom.Rectangle.Contains
    );
    this.uiBackground.input.cursor = 'pointer';

    if (!this.useThaiText) {
      this.label = scene.add
        .text(0 + this.labelOffset.x, 0 + this.labelOffset.y, this.labelText, {
          fontSize: "28px",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
    } else {
      this.label = createThaiText(
        scene,
        0 + this.labelOffset.x,
        0 + this.labelOffset.y,
        this.labelText,
        {
          fontSize: "72px",
          fontStyle: "bold",
          color: "#743D14", // Better contrast against light background
        },
        { origin: 0.5, wrapWidth: 800 },
      );
    }

    this.container.add([this.uiBackground, this.label]);

    if (settings.onClick != null) {
      this.uiBackground.on("pointerdown", () => {
        EventBus.emit('audio:play', 'ui:click');
        settings.onClick();
        this.drawBg(this.clickColor);
      });
    } else {
      this.uiBackground.on("pointerdown", () =>
        this.drawBg(this.clickColor),
      );
    }

    this.uiBackground.on("pointerover", () =>
      this.drawBg(this.hoverColor),
    );
    this.uiBackground.on("pointerout", () =>
      this.drawBg(this.defaultColor),
    );
    this.uiBackground.on("pointerup", () =>
      this.drawBg(this.defaultColor),
    );
  }
  forceShow() {
    this.container.setVisible(true);
  }
  forceHide() {
    this.container.setVisible(false);
  }
  destroy() {
    this.container.destroy();
  }
  getContainer() {
    return this.container;
  }
}
