import UIPanel from "../../../common/ui/core/ui-panel-base";

export default class UIPage extends UIPanel {
    constructor(scene, x, y, setting = {}) {
        // Handle postcard-reader's specific setting object by passing the whole object
        super(scene, x, y, setting);
    }
}