import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import Entity from "../entity/entity";
import DraggableComponent from "../components/scripts/draggable";
import SocketComponent from "../components/scripts/socket";

export default class GameplayScene extends Phaser.Scene {
  constructor() {
    super("gameplay-scene");
  }

  preload() {
    this.load.scenePlugin(
      "rexuiplugin",
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js",
      "rexUI",
      "rexUI",
    );

    this.load.image('button-idle', 'assets/button_rectangle_depth_flat.png')
    this.load.image('button-press', 'assets/button_rectangle_flat.png')
  }

  create(data) {
    // this.easyBtn = this.createButton(this.scale.width/2 ,(this.scale.height/2) - 100, "RETURN", () => {
    //         this.scene.start('main-menu-scene')
    //     });
    // this.titleText = this.add.text(this.scale.width/2,this.scale.height/2 - 250,"GAMEPLAY",{
    //         fontSize: '96px', fontStyle: 'bold'
    //     }).setOrigin(0.5);
    // this.titleText.setDepth(100);

    this.events.on('socketFilled', (socketComponent, entity) => {
      console.log(`Locked into ${socketComponent.name}`);
    });

    // --- SETUP SOCKETS ---
    const socketEntityA = new Entity(this, 200, 300,'white');
    socketEntityA.setTint(0xffffff);
    //socketEntityA.body.setSize(200,200);
    socketEntityA.setDisplaySize(200,200);
    const socketEntityB = new Entity(this, 500, 300,'white');
    socketEntityB.setTint(0xffffff);
    //socketEntityB.body.setSize(200,200);
    socketEntityB.setDisplaySize(200,200);

    const socketA = socketEntityA.addComponent(SocketComponent, "Socket A");
    const socketB = socketEntityB.addComponent(SocketComponent, "Socket B");

    // --- SETUP DRAGGABLES ---
    const boxEntity1 = new Entity(this, 0, 0, 'boxTexture');
    //const boxEntity2 = new Entity(this, 0, 0, 'boxTexture');

    const drag1 = boxEntity1.addComponent(DraggableComponent);
    //const drag2 = boxEntity2.addComponent(DraggableComponent);

    // --- INITIALIZE POSITIONS ---
    socketA.attach(boxEntity1);
    drag1.currentSocket = socketA;

    //socketB.attach(boxEntity2);
    //drag2.currentSocket = socketB;

    this.level = data.level || 1;

    this.gameplayUI = new GameplayUI(this, 0, 0);
  }
  createButton(x, y, text, onClick) {
    const bg = this.add.rectangle(x, y, 200, 60, 0x00aa00, 1).setInteractive({ useHandCursor: true });
    bg.setScale(1.5);
    const label = this.add.text(x, y, text, {
      fontSize: '28px', fontStyle: 'bold'
    }).setOrigin(0.5);
    label.setScale(1.5);

    bg.on('pointerdown', onClick);

    bg.on('pointerover', () => bg.setFillStyle(0x00ff00));
    bg.on('pointerout', () => bg.setFillStyle(0x00aa00));

    return [bg, label];
  }
}