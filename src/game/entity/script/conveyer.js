import Entity from "../entity";
import Animal from "./animal";
import Fruit from "./fruit";

export default class Conveyer extends Entity{
    constructor(scene,x,y,speed = 150){
        super(scene,x,y,null);
        this.isMoving = true;

        this.speed = speed;

        if(!scene.textures.exists('beltSegment')){
            const canvas = scene.textures.createCanvas('beltSegment',100,32);
            const ctx = canvas.context;

            ctx.fillStyle = '#333333';
            ctx.fillRect(0,0,100,32);

            ctx.fillStyle = '#444444';
            ctx.fillRect(0,28,100,4);

            canvas.refresh();
        }

        this.conveyer = scene.add.tileSprite(
            x,
            y + 500,
            100,
            1100,
            'beltSegment'
        );
        //this.conveyer.setDepth(-1);

        this.animal = new Animal(scene,scene.scale.width/2,1200);

        this.foods = [];
        this.spawnFoods();
        this.spawnTimer = this.scene.time.addEvent({
            delay: 1000, //ms
            callback: this.spawnFoods,
            callbackScope: this,
            loop: true
        });
    }
    update(time,delta){
        if(!this.isMoving) return;

        const _deltaInSeconds = delta/1000;
        const _moveDistance = this.speed * _deltaInSeconds;
        this.conveyer.tilePositionY -= _moveDistance;
    }
    setSpeed(newSpeed){
        this.speed = newSpeed;
        for(const _food of this.foods){
            _food.setVelocityY(this.speed);
        }
    }
    spawnFoods(){
        const _fruit = new Fruit(this.scene, this.x, this.y,this);
        _fruit.setVelocityY(this.speed);
        this.foods.push(_fruit);
        this.spawnCooldown = 0;

        _fruit.once('destroy', () => {
            this.removeFoodFromList(_fruit);
        })
        _fruit.once('itemSorted', () => {
            this.removeFoodFromList(_fruit);
        })
    }
    removeFoodFromList(fruit){
        const index = this.foods.indexOf(fruit);

        if(index > -1){
            this.foods.splice(index,1);
        }
    }
    onRemoveFood(foodType){
        if(foodType == this.animal.currentAnimal.AcceptableFoodType){
            //console.log("Why you remove the food");
            this.scene.onRemoveEatableFood();
        }
        else{
            //console.log("Good job!");
            this.scene.onRemoveUneatableFood();
        }
    }
    addSpeed(addedSpeed){
        this.setSpeed(this.speed + addedSpeed);
    }
    disableFoodsInput(){
        this.foods.forEach(food => {
            if(food.active){
                food.disableInteractive();
            }
        });
    }
    stop(){
        this.isMoving = false;
        this.disableFoodsInput();
        if(this.spawnTimer) this.spawnTimer.paused = true;
    }
}