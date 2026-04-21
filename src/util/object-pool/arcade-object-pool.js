import BaseObjectPool from "./base-object-pool";

export default class ArcadeObjectPool extends BaseObjectPool{
    createGroup(groupFactory, groupConfig){
        if(groupFactory){
            return groupFactory(this.scene, groupConfig);
        }

        return this.scene.physics.add.group(groupConfig);
    }

    activateMember(member, x = member.x, y = member.y, ...args){
        if(member.enableBody){
            member.enableBody(true, x, y, true, true);
        }
        else{
            super.activateMember(member, x, y, ...args);

            if(typeof x === "number" && typeof y === "number" && member.setPosition){
                member.setPosition(x, y);
            }

            if(member.body){
                member.body.enable = true;
            }
        }
    }

    deactivateMember(member, ...args){
        if(member.setVelocity){
            member.setVelocity(0, 0);
        }

        if(member.setAcceleration){
            member.setAcceleration(0, 0);
        }

        if(member.setAngularVelocity){
            member.setAngularVelocity(0);
        }

        if(member.disableBody){
            member.disableBody(true, true);
            return;
        }

        if(member.body){
            member.body.enable = false;
        }

        super.deactivateMember(member, ...args);
    }
}
