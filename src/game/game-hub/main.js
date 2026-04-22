import Phaser from 'phaser'

import { HUB_VIEW } from './constants';
import MainMenuScene from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';

const config = {
    type: AUTO,
    parent: 'game-container',
    backgroundColor: HUB_VIEW.backgroundColor,
    scale: {
        mode: HUB_VIEW.scaleMode,
        autoCenter: HUB_VIEW.autoCenter,
        width: HUB_VIEW.width,
        height: HUB_VIEW.height
    },
    physics: {
        default: 'arcade', 
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        MainMenuScene,
    ]
};

const StartGame = (parent, options = {}) => {
    return new Game({
        ...config,
        parent,
        callbacks: {
            postBoot: (game) => {
                game.registry.set('hubOptions', options);
            },
        },
    });
}

export { StartGame };
export default StartGame;
