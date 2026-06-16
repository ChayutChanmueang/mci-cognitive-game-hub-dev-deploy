import Phaser from 'phaser';
import { EventBus } from '../../../core/EventBus.js';
import { StartMenuPanel } from '../../../ui/start-menu-panel.js';
import SessionStorageManager from '../../../core/session-storage-manager.js';
import { StartMenuSetting } from '../constants.js';

export default class StartMenuScene extends Phaser.Scene {
    constructor() {
        super('fry-food-start-menu-scene');
    }

    preload() {
        // Preload start menu specific assets here
        // this.load.image('background', 'assets/fry-food/etc/BG.png');
    }

    create(data) {
        // Add background (uncomment when asset is available)
        // this.background = this.add.sprite(0, 0, 'background').setOrigin(0, 0);
        // this.background.setDisplaySize(this.scale.width, this.scale.height);
        // this.background.setDepth(-10);

        // Register Audio
        const sounds = {
            'sizzling': { src: ['assets/audio/fry-food/Sizzlingcooking_SFX.mp3'] },
            'flip': { src: ['assets/audio/fry-food/Flip_Short_SFX.mp3'] },
            'ting': { src: ['assets/audio/fry-food/Ting_SFX.mp3'] },
            'endgame': { src: ['assets/audio/common/sfx/EndGame.mp3'] },
        };
        EventBus.emit('audio:register', 'fry-food', sounds);

        // Hide the top bar HUD
        EventBus.emit('minigame:hide-hud');

        // Get the current game level from session storage
        const levelString = SessionStorageManager.get('selected_game_level', '1');
        let level = parseInt(levelString, 10);
        if (isNaN(level)) {
            if (levelString === 'easy') level = 1;
            else if (levelString === 'medium' || levelString === 'normal') level = 2;
            else if (levelString === 'hard') level = 3;
            else level = StartMenuSetting.defaultLevel;
        }

        // Render the DOM-based StartMenuPanel
        const uiRoot = document.getElementById('ui-root');
        if (uiRoot) {
            this.startMenuPanel = new StartMenuPanel(uiRoot, {
                title: StartMenuSetting.title,
                description: StartMenuSetting.description,
                instructions: StartMenuSetting.instructions,
                level: level,
                levelDetail: StartMenuSetting.levelDetailTemplate(level),
                panelBorderColor: StartMenuSetting.panelBorderColor,
                panelHeaderColor: StartMenuSetting.panelHeaderColor,
                primaryFontColor: StartMenuSetting.primaryFontColor,
                secondaryFontColor: StartMenuSetting.secondaryFontColor,
                titleFontSize: StartMenuSetting.titleFontSize,
                coverImage: StartMenuSetting.coverImage,
            });
            this.startMenuPanel.render();
        }

        // Listen for the start button press and transition to the gameplay scene
        const handleStartGame = () => {
            // Attempt to enter fullscreen (requires user gesture, which this click is)
            if (this.scale && !this.scale.isFullscreen) {
                try {
                    const fsPromise = this.scale.startFullscreen();
                    if (fsPromise && typeof fsPromise.catch === 'function') {
                        fsPromise.catch(() => {});
                    }
                } catch (e) {}
            }
            // Attempt to lock orientation immediately while we have the gesture
            // 'portrait-primary' prevents 180-degree upside-down rotation
            if (screen.orientation && typeof screen.orientation.lock === 'function') {
                screen.orientation.lock('portrait-primary').catch(() => {});
            }

            this.scene.start('fry-food-gameplay-scene');
        };
        EventBus.on('startmenu:start-game', handleStartGame);

        // Clean up DOM elements and listeners when transitioning away
        this.events.once('shutdown', () => {
            EventBus.off('startmenu:start-game', handleStartGame);
            if (this.startMenuPanel) {
                this.startMenuPanel.destroy();
            }
        });
    }

    update(time, delta) {
        // Start menu scene update loop
    }
}
