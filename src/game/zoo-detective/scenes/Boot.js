import { Scene } from 'phaser';
import { EventBus } from '../../../../core/EventBus.js';

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
            'popup': { src: ['assets/audio/zoo-detective/Panel_PopUp.mp3'] },
            'correct': { src: ['assets/audio/zoo-detective/Correct.mp3'] },
            'wrong': { src: ['assets/audio/zoo-detective/Wrong.wav'] },
            'endgame': { src: ['assets/audio/zoo-detective/EndGame.mp3'] }
        };
        EventBus.emit('audio:register', 'zoo-detective', sounds);

        this.scene.start('Preloader');
    }
}
