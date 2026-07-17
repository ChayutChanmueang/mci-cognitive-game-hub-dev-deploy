import Phaser from 'phaser'

import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'

import UITestScene from './scenes/UITestScene';
import MainMenuScene from './scenes/MainMenu';
import StartMenuScene from './scenes/StartMenu';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { AUTO, Game } from 'phaser';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: AUTO,
    parent: 'game-container',
    backgroundColor: 'linear-gradient(180deg, #93B351 0%, #77B351 65% , #77B351 100%)',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1100, // The "logical" resolution
        height: 2000
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // 0 for top-down, 300 for platformers
            debug: false      // Keep this true while debugging!
        }
    },
    scene: [
        //MainMenuScene,
        StartMenuScene,
        UITestScene,
        Boot,
        Preloader,
    ],
    plugins: {
        scene: [
            {
                key: 'rexUI',
                plugin: UIPlugin,
                mapping: 'rexUI'
            }
        ]
    }
};

export const StartGame = (parent) => {
    document.documentElement.style.setProperty("--game-mode-background", config.backgroundColor);
    return new Game({ ...config, parent });

    const originalDestroy = game.destroy.bind(game);
    game.destroy = (removeCanvas, noReturn) => {
        if (versionContainer && versionContainer.parentNode) {
            versionContainer.parentNode.removeChild(versionContainer);
        }
        originalDestroy(removeCanvas, noReturn);
    };

    return game;
}

export default StartGame;
