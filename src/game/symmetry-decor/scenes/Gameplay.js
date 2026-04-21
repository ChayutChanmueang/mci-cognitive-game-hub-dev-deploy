import Phaser from "phaser";
import GameplayUI from "../entity/script/ui/gameplay-ui";
import Entity from "../entity/entity";
import DraggableComponent from "../components/scripts/draggable";
import SocketComponent from "../components/scripts/socket";
import EntityGrid from "../entity/entityGrid";
import NonDraggableComponent from "../components/scripts/non-draggable";

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
    // const socketEntityA = new Entity(this, 200, 300,'__WHITE');
    // socketEntityA.setTint(0xffffff);
    // socketEntityA.body.setSize(200,200);
    // socketEntityA.setDisplaySize(200,200);
    // this.grid.addEntityAt(0,0,socketEntityA);
    // const socketEntityB = new Entity(this, 500, 300,'__WHITE');
    // socketEntityB.setTint(0xffffff);
    // socketEntityB.body.setSize(200,200);
    // socketEntityB.setDisplaySize(200,200);
    // this.grid.addEntityAt(0,1,socketEntityB);

    // const socketA = socketEntityA.addComponent(SocketComponent, "Socket A");
    // const socketB = socketEntityB.addComponent(SocketComponent, "Socket B");

    // // --- SETUP DRAGGABLES ---
    // const boxEntity1 = new Entity(this, 0, 0, 'boxTexture');
    // boxEntity1.setDisplaySize(180,180);
    // //const boxEntity2 = new Entity(this, 0, 0, 'boxTexture');

    // const drag1 = boxEntity1.addComponent(DraggableComponent);
    // //const drag2 = boxEntity2.addComponent(DraggableComponent);

    // // --- INITIALIZE POSITIONS ---
    // socketA.attach(boxEntity1);
    // drag1.currentSocket = socketA;

    //socketB.attach(boxEntity2);
    //drag2.currentSocket = socketB;
    this.constructGrid();

    this.level = data.level || 1;

    this.gameplayUI = new GameplayUI(this, 0, 0);
  }
  constructGrid(){
    const _gridConfig = {
      width: 900,
      height: 900,
      columns: 12,
      rows:12,
      padding:0
    }

    this.grid = new EntityGrid(this, 100, 300, _gridConfig);
    //this.grid.sortableChildren = true;

    for(var i = 0; i < _gridConfig.columns; i++){
      for(var j = 0; j < _gridConfig.rows; j++){
        var cell = new Entity(this, 0, 0,'__WHITE');
        cell.setTint(0xffffff);
        var socket = cell.addComponent(SocketComponent, "Socket " + i + "," + j);
        this.grid.addEntityAt(i,j,cell);
        if(i == j){
          var box = new Entity(this, 0, 0,'__WHITE');
          box.setTint(0x000000);
          box.setDisplaySize(this.grid.cellWidth,this.grid.cellHeight);
          box.setDepth(100);
          var drag = box.addComponent(DraggableComponent);

          socket.attach(box);
          drag.currentSocket = socket;
        }
        else if(i == 0 || j == 0){
          var lockedCell = this.grid.getEntityAt(i,j);
          var lockedSocket = lockedCell.getComponent(SocketComponent);
          var blocker = new Entity(this,0,0,'__WHITE');

          blocker.setTint(0xff0000);
          blocker.setDisplaySize(this.grid.cellWidth,this.grid.cellHeight);
          blocker.setDepth(100);

          blocker.addComponent(NonDraggableComponent,lockedSocket);
        }
      }
    }

    this.grid.sort('depth');
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