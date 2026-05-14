import Component from "../component";

export default class SpriteRenderer extends Component {
    constructor(entity, settings) {
        super(entity);
        // We use texture keys instead of emoji strings
        this.textureKey = settings.textureKey || '__DEFAULT';
        this.sizeScale = settings.sizeScale || 1;
        this.offsetX = settings.offsetX || 0;
        this.offsetY = settings.offsetY || 0;
    }

    awake() {
        // Remove the 0.001 alpha hack from the prototype phase
        this.entity.setAlpha(1);
        
        // Directly set the texture and scale on the Entity (which is a Sprite)
        this.entity.setTexture(this.textureKey);
        this.entity.setScale(this.sizeScale);
        this.syncPhysicsBody();
    }

    changeSprite(newTextureKey) {
        // Easily swap textures dynamically
        this.entity.setTexture(newTextureKey);
    }

    syncPhysicsBody() {
        if (this.entity.body) {
            // Adjust the hitbox size to match the newly scaled sprite, and auto-center the offset
            this.entity.body.setSize(this.entity.width, this.entity.height, true);
            
            // Force the physics engine to resync its position with the visual game object
            this.entity.body.updateFromGameObject(); 

            // 2. Apply your custom offset to shift the physical hitbox
            this.entity.body.setOffset(this.offsetX, this.offsetY);
            this.entity.body.updateFromGameObject();
        }
    }

    // Notice we completely removed the update() and destroy() methods!
    // Because we are using the Entity's native sprite, Phaser automatically 
    // handles the transform syncing and garbage collection for us, saving CPU cycles.
}

/* Usage Example in your Fruit or Animal class:
this.addComponent(SpriteRenderer, {
    textureKey: 'apple_png_key', 
    sizeScale: sizeScale
});
*/