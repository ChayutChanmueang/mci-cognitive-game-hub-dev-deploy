import { GameHubSystem } from "../core/game-hub-screen/GameHubSystem.js";
import { GameHubState } from "../core/game-hub-screen/GameHubState.js";

/**
 * สร้างสถานะเริ่มต้นของ Game Hub
 */
export function createGameHubState() {
    return new GameHubState();
}

/**
 * เข้าสู่การแสดงหน้าจอ Game Hub
 * โค้ดทั้งหมดได้ถูกแยกโครงสร้างตามหลัก Clean Architecture 
 * ระบบไปอยู่ที่ `src/core/game-hub-screen`
 * UI Component ไปอยู่ที่ `src/ui/game-hub`
 */
export async function renderGameHubScreen(root, options = {}) {
    if (!root) {
        return;
    }

    // เรียกใช้ระบบควบคุมหลัก (Orchestrator System)
    const system = new GameHubSystem(root, options);
    await system.init();
}
