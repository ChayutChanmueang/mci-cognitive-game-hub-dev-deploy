import { Scene } from 'phaser';
import { EventBus } from '../../../core/EventBus.js';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image('background', 'assets/bg.png');
    }

    create ()
    {
        const sounds = {
            'correct': { src: ['assets/audio/common/sfx/Correct.mp3'] },
            'wrong': { src: ['assets/audio/common/sfx/Wrong.wav'] },
            'endgame': { src: ['assets/audio/common/sfx/EndGame.mp3'] }
        };
        EventBus.emit('audio:register', 'zoo-detective', sounds);

        this.scene.start('Preloader');
    }
}
