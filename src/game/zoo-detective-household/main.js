import Phaser from 'phaser'

import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'

import StartMenuScene from './scenes/StartMenu';
import MainMenuScene from './scenes/MainMenu';
import GameplayScene from './scenes/Gameplay';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { AUTO, Game } from 'phaser';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: AUTO,
    parent: 'game-container',
    backgroundColor: '#5eaed6',
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
            debug: false
        }
    },
    scene: [
        StartMenuScene,
        //MainMenuScene,
        GameplayScene,
        Boot,
        Preloader,
    ],
    plugins: {
        scene:[
            {
                key: 'rexUI',
                plugin: UIPlugin,
                mapping: 'rexUI'
            }
        ]
    }
};

const StartGame = (parent) => {
    document.documentElement.style.setProperty("--game-mode-background", config.backgroundColor);
    const game = new Game({ ...config, parent });

    const parentEl = typeof parent === 'string' ? document.getElementById(parent) : parent;
    let versionContainer = null;
    if (parentEl) {
        versionContainer = document.createElement('div');
        versionContainer.id = 'game-version-indicator';
        versionContainer.style.position = 'absolute';
        versionContainer.style.bottom = '16px';
        versionContainer.style.right = '16px';
        versionContainer.style.zIndex = '1000';
        versionContainer.style.pointerEvents = 'none';
        versionContainer.style.color = '#333';
        versionContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        versionContainer.style.padding = '4px 8px';
        versionContainer.style.borderRadius = '4px';
        versionContainer.style.fontFamily = 'sans-serif';
        versionContainer.style.fontSize = '12px';
        versionContainer.style.fontWeight = 'bold';
        versionContainer.innerHTML = 'v0.1.0';
        parentEl.appendChild(versionContainer);
    }

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
