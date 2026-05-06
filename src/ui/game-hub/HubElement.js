/**
 * HubElement
 * คลาสพื้นฐานสำหรับ UI Component สร้างโดยใช้เทคนิค OOP
 * ใช้ร่วมกับ DomObjectPool ได้
 */
export class HubElement {
    constructor(options = {}) {
        this.options = options;
        this.element = null;
        this.cleanups = [];
        this.children = [];
    }

    /**
     * สำหรับการนำกลับมาใช้ซ้ำ (Object Pool)
     */
    reset(options) {
        this.options = options;
        this.destroy(); // ล้าง state และลูกหลานเก่าออกให้หมดก่อน
    }

    html() {
        return "";
    }

    render() {
        const template = document.createElement("template");
        template.innerHTML = this.html().trim();
        this.element = template.content.firstElementChild;
        this.bind();
        return this.element;
    }

    on(target, eventName, handler, options) {
        if (!target) {
            return;
        }

        target.addEventListener(eventName, handler, options);
        this.cleanups.push(() => target.removeEventListener(eventName, handler, options));
    }

    addChild(child, target) {
        this.children.push(child);
        target?.append(child.render());
    }

    bind() {}

    /**
     * ยกเลิก Event Listeners (สำหรับการหมุนเวียน Object Pool)
     */
    unbind() {
        this.cleanups.forEach((cleanup) => cleanup());
        this.cleanups = [];
    }

    destroy() {
        this.children.forEach((child) => child.destroy());
        this.unbind();
        this.children = [];
        this.element?.remove();
        this.element = null;
    }
}
