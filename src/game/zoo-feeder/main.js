import Phaser from 'phaser'

import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'

import UITestScene from './scenes/UITestScene';
import MainMenuScene from './scenes/MainMenu';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { AUTO, Game } from 'phaser';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: AUTO,
    parent: 'game-container',
    backgroundColor: '#83B351',
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

}

export default StartGame;
