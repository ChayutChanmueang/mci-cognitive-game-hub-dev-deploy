export default class BaseObjectPool{
    constructor(scene,{
        group = null,
        groupFactory = null,
        groupConfig = {},
        createMember = null,
        warmup = 0,
        warmupArgs = []
    } = {}){
        if(!scene){
            throw new Error("BaseObjectPool requires a Phaser scene.");
        }

        this.scene = scene;
        this.createMemberCallback = createMember;
        this.group = group ?? this.createGroup(groupFactory, groupConfig);

        if(!this.group){
            throw new Error("BaseObjectPool could not create a Phaser group.");
        }

        if(warmup > 0){
            this.warmup(warmup, ...warmupArgs);
        }
    }

    createGroup(groupFactory, groupConfig){
        if(groupFactory){
            return groupFactory(this.scene, groupConfig);
        }

        return this.scene.add.group(groupConfig);
    }

    createMember(...args){
        if(!this.createMemberCallback){
            throw new Error("Provide createMember in the pool config or override createMember().");
        }

        return this.createMemberCallback(this.scene, ...args);
    }

    acquire(...args){
        let member = this.group.getFirstDead(false);

        if(!member && !this.group.isFull()){
            member = this.createMember(...args);

            if(member && !this.group.contains(member)){
                this.group.add(member);
            }
        }

        if(!member){
            return null;
        }

        this.activateMember(member, ...args);
        this.afterAcquire(member, ...args);

        return member;
    }

    release(member, ...args){
        if(!member){
            return null;
        }

        this.beforeRelease(member, ...args);
        this.deactivateMember(member, ...args);

        return member;
    }

    activateMember(member){
        if(member.setActive){
            member.setActive(true);
        }
        else{
            member.active = true;
        }

        if(member.setVisible){
            member.setVisible(true);
        }
        else if("visible" in member){
            member.visible = true;
        }
    }

    deactivateMember(member){
        this.group.killAndHide(member);

        if(member.setActive){
            member.setActive(false);
        }
        else{
            member.active = false;
        }

        if(member.setVisible){
            member.setVisible(false);
        }
        else if("visible" in member){
            member.visible = false;
        }
    }

    afterAcquire(member, ...args){
        if(member.onAcquireFromPool){
            member.onAcquireFromPool(...args);
        }
    }

    beforeRelease(member, ...args){
        if(member.onReleaseToPool){
            member.onReleaseToPool(...args);
        }
    }

    warmup(count, ...args){
        const members = [];

        for(let i = 0; i < count; i++){
            const member = this.acquire(...args);

            if(!member){
                break;
            }

            members.push(member);
        }

        for(const member of members){
            this.release(member);
        }

        return members.length;
    }

    releaseAll(...args){
        for(const member of this.getActiveChildren()){
            this.release(member, ...args);
        }

        return this;
    }

    forEachActive(callback, context = this){
        for(const member of this.getActiveChildren()){
            callback.call(context, member);
        }

        return this;
    }

    getChildren(){
        return this.group.getChildren();
    }

    getActiveChildren(){
        return this.group.getMatching("active", true);
    }

    getInactiveChildren(){
        return this.group.getMatching("active", false);
    }

    destroy(destroyChildren = true, removeFromScene = false){
        this.group.destroy(destroyChildren, removeFromScene);
    }
}
