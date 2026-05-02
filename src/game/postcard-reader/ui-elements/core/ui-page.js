import UIPanel from "../../../common/ui/core/ui-panel-base";

export default class UIPage extends UIPanel {
    constructor(scene, x, y, setting = {}) {
        // Handle postcard-reader's specific setting object
        const sizeX = setting.size?.x || 500;
        const sizeY = setting.size?.y || 500;
        super(scene, x, y, sizeX, sizeY);
    }
}