import Phaser from 'phaser';
import { EventBus } from '../../../core/EventBus.js';
import { StartMenuPanel } from '../../../ui/start-menu-panel.js';
import SessionStorageManager from '../../../core/session-storage-manager.js';
import { StartMenuSetting } from '../constants.js';

export default class StartMenuScene extends Phaser.Scene {
    constructor() {
        super('zoo-detective-start-menu-scene');
    }

    preload() {
        this.load.image('background', 'assets/zoo-detective/etc/BG.png');
    }

    create() {
        this.background = this.add.sprite(0, 0, 'background').setOrigin(0, 0);
        this.background.setDisplaySize(this.scale.width, this.scale.height);
        this.background.setDepth(-10);

        // Register Audio
        const sounds = {
            'correct': { src: ['assets/audio/common/sfx/Correct.mp3'] },
            'wrong': { src: ['assets/audio/common/sfx/Wrong.wav'] },
            'endgame': { src: ['assets/audio/common/sfx/EndGame.mp3'] }
        };
        EventBus.emit('audio:register', 'zoo-detective', sounds);

        // Play BGM
        EventBus.emit('audio:bgm', 'zoo-detective');

        EventBus.emit('minigame:hide-hud');

        const level = this.resolveSelectedLevel();
        const uiRoot = document.getElementById('ui-root');

        if (uiRoot) {
            this.startMenuPanel = new StartMenuPanel(uiRoot, {
                title: StartMenuSetting.title,
                description: StartMenuSetting.description,
                instructions: StartMenuSetting.instructions,
                level,
                levelDetail: StartMenuSetting.levelDetailTemplate(level),
                panelBorderColor: StartMenuSetting.panelBorderColor,
                panelHeaderColor: StartMenuSetting.panelHeaderColor,
                primaryFontColor: StartMenuSetting.primaryFontColor,
                secondaryFontColor: StartMenuSetting.secondaryFontColor,
                titleFontSize: StartMenuSetting.titleFontSize,
                coverImage: StartMenuSetting.coverImage,
                panelClass: 'result-panel--zoo-detective',
            });
            this.startMenuPanel.render();
        }

        const handleStartGame = () => {
            this.scene.start('gameplay-scene', {
                level,
                skipTutorial: true,
            });
        };

        EventBus.on('startmenu:start-game', handleStartGame);

        this.events.once('shutdown', () => {
            EventBus.off('startmenu:start-game', handleStartGame);
            this.startMenuPanel?.destroy();
        });
    }

    resolveSelectedLevel() {
        const levelString = SessionStorageManager.get('selected_game_level', '1');
        const parsedLevel = parseInt(levelString, 10);

        if (!Number.isNaN(parsedLevel)) {
            return parsedLevel;
        }

        if (levelString === 'easy') return 1;
        if (levelString === 'medium' || levelString === 'normal') return 2;
        if (levelString === 'hard') return 3;

        return StartMenuSetting.defaultLevel;
    }
}
