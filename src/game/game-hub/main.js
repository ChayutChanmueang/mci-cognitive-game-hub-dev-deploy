import Phaser, { AUTO, Game } from "phaser";

import { HUB_VIEW } from "./constants";
import MainMenuScene from "./scenes/MainMenu";

const config = {
    type: AUTO,
    parent: "game-container",
    backgroundColor: HUB_VIEW.backgroundColor,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: HUB_VIEW.width,
        height: HUB_VIEW.height,
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scene: [
        MainMenuScene,
    ],
};

const StartGame = (parent, options = {}) => new Game({
    ...config,
    parent,
    callbacks: {
        postBoot: (game) => {
            game.registry.set("hubOptions", options);
        },
    },
});

export { StartGame };
export default StartGame;
