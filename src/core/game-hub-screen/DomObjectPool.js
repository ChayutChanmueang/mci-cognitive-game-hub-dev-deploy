/**
 * DomObjectPool
 * ประยุกต์เทคนิค Object Pool จาก BaseObjectPool ของ Phaser มาใช้กับ DOM Elements (UI Components)
 * ช่วยลดการจองหน่วยความจำและการสร้าง DOM ใหม่ซ้ำๆ (Garbage Collection Optimization)
 */
export class DomObjectPool {
    constructor({ createMember, maxSize = 50 }) {
        if (typeof createMember !== "function") {
            throw new Error("DomObjectPool requires a 'createMember' factory function.");
        }
        this.createMemberCallback = createMember;
        this.pool = [];
        this.activeMembers = new Set();
        this.maxSize = maxSize;
    }

    /**
     * เรียกใช้งาน Object จาก Pool หากไม่มีจะสร้างใหม่
     */
    acquire(options) {
        let member;
        if (this.pool.length > 0) {
            member = this.pool.pop();
            // ถ้า Component มีการรองรับการ Reset state ก็ให้ใช้งาน ไม่งั้นก็เซ็ต options ตรงๆ
            if (member.reset) {
                member.reset(options);
            } else {
                member.options = options;
            }
        } else {
            member = this.createMemberCallback(options);
        }

        this.activeMembers.add(member);
        return member;
    }

    /**
     * คืน Object กลับเข้า Pool และเคลียร์ DOM Event เพื่อรอการนำไปใช้ใหม่
     */
    release(member) {
        if (!member) return;

        if (this.activeMembers.has(member)) {
            this.activeMembers.delete(member);

            // เคลียร์ UI DOM ออกจาก Document
            if (member.element) {
                member.element.remove();
            }
            if (member.unbind) {
                member.unbind(); // ยกเลิกการ bind events
            }

            if (this.pool.length < this.maxSize) {
                this.pool.push(member);
            } else {
                // หาก Pool เต็ม ให้ทำลาย Object ทิ้งเพื่อประหยัด Memory
                if (member.destroy) {
                    member.destroy();
                }
            }
        }
    }

    /**
     * คืนค่า Object ทั้งหมดที่กำลังถูกใช้งานกลับเข้า Pool
     */
    releaseAll() {
        for (const member of this.activeMembers) {
            this.release(member);
        }
    }

    /**
     * ทำลาย Object ทั้งหมดใน Pool อย่างถาวร
     */
    destroy() {
        this.releaseAll();
        for (const member of this.pool) {
            if (member.destroy) member.destroy();
        }
        this.pool = [];
        this.activeMembers.clear();
    }
}
