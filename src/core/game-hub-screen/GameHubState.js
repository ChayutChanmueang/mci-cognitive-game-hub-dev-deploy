/**
 * GameHubState
 * คลาสเก็บและจัดการสถานะทั้งหมดของหน้า Game Hub (State Object)
 */
export class GameHubState {
    constructor() {
        this.programGames = [];
        this.programDays = [];
        this.allGames = [];
        this.restGame = null;
        this.dailyProgram = null;
        this.dailyGoal = "";
        this.historyRecords = [];
        this.autoCheckInLoading = false;
        this.autoCheckInCompletedKey = "";
        this.includeNextProgramDay = false;
        this.programInitialized = false;
        this.programLoading = false;
        this.historyLoading = false;
        this.programError = "";
        this.historyError = "";
        this.scrollTop = 0;
    }

    /**
     * อัปเดตข้อมูลของ State
     */
    update(newState) {
        Object.assign(this, newState);
    }
}
