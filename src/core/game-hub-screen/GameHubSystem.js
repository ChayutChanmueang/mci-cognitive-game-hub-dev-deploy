import { GameHubState } from "./GameHubState.js";
import { GameHubUtils } from "./GameHubUtils.js";
import { GameHubDataNormalizer } from "./GameHubDataNormalizer.js";
import { GameHubProgramBuilder } from "./GameHubProgramBuilder.js";
import { GameHubHistoryManager } from "./GameHubHistoryManager.js";
import { HubMapScreen } from "../../ui/game-hub/HubMapScreen.js";
import { showCheckInPopup } from "../../ui/checkin-summary-screen.js";
import db from "../database.js";

/**
 * GameHubSystem
 * ตัวจัดการหลัก (Controller/System Orchestrator) เชื่อมระหว่าง Logic กับ UI 
 * โดยที่ไม่มีโค้ด UI ในตัว แต่เรียกใช้ Component แทน
 */
export class GameHubSystem {
    constructor(root, options = {}) {
        this.root = root;
        this.options = options;
        this.state = options.sharedState || new GameHubState();
        this.activeScreen = null;
        this.parsedPatientHn = String(options.patientHn || "").trim();
        this.patientLabel = GameHubUtils.getPatientLabel();
        
        // กำหนดค่าเริ่มต้นเพื่อป้องกัน Type Error
        if (!Array.isArray(this.state.programGames)) this.state.programGames = [];
        if (!Array.isArray(this.state.programDays)) this.state.programDays = [];
        if (!Array.isArray(this.state.allGames)) this.state.allGames = [];
        if (!Array.isArray(this.state.historyRecords)) this.state.historyRecords = [];
    }

    /**
     * วาด UI ขึ้นมาใหม่ด้วยข้อมูลสถานะปัจจุบัน
     */
    render() {
        this.activeScreen?.destroy();
        this.root.innerHTML = "";

        const allDaySections = GameHubProgramBuilder.buildProgramDaySections(this.state.programDays, this.state.restGame);
        const currentProgramDay = Number(this.state.dailyProgram?.programDay || this.state.programDays[0]?.day || 1);
        const startedProgramForHistory = this.state.dailyProgram?.startedProgram || this.options.programDate;
        
        // **[REMOVED BUG]** ลบ Filter ที่ซับซ้อนและทำงานผิดพลาดออก
        // ให้ UI แสดงผลทุกวัน (DaySection) ที่ถูกโหลดเข้ามาใน State โดยตรง
        const daySections = allDaySections;
        
        const programNodes = GameHubProgramBuilder.flattenProgramDaySections(daySections);
        const currentDaySection = daySections.find((dayItem) => Number(dayItem?.day) === currentProgramDay)
            || daySections[daySections.length - 1]
            || { nodes: [] };
            
        const currentDayHistory = GameHubHistoryManager.getHistoryRecordsForProgramDay(
            this.state.historyRecords,
            startedProgramForHistory,
            currentProgramDay,
        );
        
        const currentDayCompletion = GameHubHistoryManager.getProgramDayCompletion(currentDaySection, currentDayHistory);
        const resolvedCompletedCount = Math.max(
            0,
            Number(this.options.completedCount) || 0,
            currentDayCompletion.completedCount,
        );
        const resolvedDailyGameTarget = currentDayCompletion.gameTarget;
        const resolvedCompletedGameCount = Math.min(resolvedDailyGameTarget, currentDayCompletion.completedGameCount);

        // สร้าง Component UI
        this.activeScreen = new HubMapScreen({
            nodes: programNodes,
            daySections,
            historyRecords: this.state.historyRecords,
            startedProgram: startedProgramForHistory,
            dailyGameTarget: resolvedDailyGameTarget,
            completedCount: resolvedCompletedCount,
            completedGameCount: resolvedCompletedGameCount,
            dailyGoal: this.state.dailyGoal,
            programDay: currentProgramDay,
            patientLabel: this.patientLabel,
            selectableGames: this.state.allGames,
            isLoading: (this.state.programLoading && !this.state.programInitialized) || this.state.historyLoading,
            initialScrollTop: this.state.scrollTop,
            onScrollChange: (scrollTop) => {
                this.state.scrollTop = scrollTop;
            },
            onProfile: this.options.onProfile,
            onTestLogout: this.options.onTestLogout,
            onTestQuickGameSelect: async (selectedGame) => {
                if (this.options.onTestQuickLaunchGame) {
                    await this.options.onTestQuickLaunchGame(selectedGame);
                }
            },
            onTestClearHistory: async () => {
                if (this.options.onTestClearTodayHistory) await this.options.onTestClearTodayHistory();
                await this.loadPlayedHistory(true);
            },
            onTestCompleteAll: async () => {
                const { playedFrom, playedTo } = GameHubUtils.getProgramDateRange(this.options.programDate);
                if (this.options.onTestCompleteAll) {
                    await this.options.onTestCompleteAll({
                        nodes: programNodes,
                        historyRecords: this.state.historyRecords,
                        playedFrom,
                        playedTo,
                    });
                }
                await this.loadPlayedHistory(true);
            },
            onTestDailyDataTools: this.options.onTestDailyDataTools,
            onNodeAction: async (selectedNode) => {
                try {
                    if (selectedNode?.type === "game") {
                        if (this.options.onLaunchGame) await this.options.onLaunchGame(selectedNode.gameData);
                        return;
                    }
                    if (selectedNode?.type === "rest") {
                        if (this.options.onRestNode) {
                            const result = await this.options.onRestNode(selectedNode);
                            if (result?.redirected || result?.cancelled) return;
                            await this.loadPlayedHistory(true);
                        }
                        return;
                    }
                } catch (error) {
                    console.error("Unable to handle selected node action:", error);
                }
            },
        });
        
        this.root.append(this.activeScreen.render());
    }

    /**
     * ดึงข้อมูล Program จากเซิร์ฟเวอร์หรือฐานข้อมูล
     */
    async loadProgramGames(force = false) {
        if (this.state.programLoading) return;

        if (force || !this.state.programInitialized) {
            this.state.programLoading = true;
            if (!this.state.programInitialized) {
                this.state.programGames = [];
                this.state.programDays = [];
            }
            this.render();

            try {
                const gameListItems = typeof this.options.loadGameList === "function" ? await this.options.loadGameList() : [];
                this.state.allGames = GameHubProgramBuilder.buildAllGames(gameListItems);
                this.state.restGame = GameHubProgramBuilder.findRestGame(this.state.allGames);
                
                let dailyProgram = null;
                if (typeof this.options.loadDailyProgram === "function" && this.parsedPatientHn) {
                    try {
                        // **[CORRECTED LOGIC]** ปรับการโหลด Window ให้ชัดเจนและถูกต้อง
                        // ถ้าเล่นวันปัจจุบันจบ (includeNextProgramDay) จะโหลด [day-1, day, day+1, day+2]
                        // ถ้ายังไม่จบ จะโหลด [day-2, day-1, day, day+1]
                        dailyProgram = await this.options.loadDailyProgram({
                            hn: this.parsedPatientHn,
                            windowBefore: this.state.includeNextProgramDay ? 1 : 2,
                            windowAfter: this.state.includeNextProgramDay ? 2 : 1,
                        });
                    } catch (error) {
                        console.warn("Unable to load daily game program:", error);
                    }
                }
                
                // **[CORRECTED LOGIC]** ใช้ข้อมูล `days` ที่มาจาก `dailyProgram` โดยตรง
                // ซึ่งเป็น Array ของวันทั้งหมดใน Window ที่โหลดมา
                const dailyProgramDays = GameHubProgramBuilder.buildProgramDaysFromDailyProgram(dailyProgram);
                
                this.state.dailyProgram = dailyProgram || null;
                const currentDay = Number(dailyProgram?.programDay || dailyProgramDays[0]?.day || 1);
                const currentDayItem = dailyProgramDays.find((dayItem) => Number(dayItem?.day) === currentDay)
                    || dailyProgramDays[dailyProgramDays.length - 1]
                    || null;
                    
                this.state.dailyGoal = String(currentDayItem?.goal || dailyProgram?.dailyPreset?.goal || "").trim();
                this.state.programDays = dailyProgramDays; // <--- ใช้ข้อมูลที่ถูกต้อง
                this.state.programError = "";
            } catch (error) {
                console.warn("Unable to load game list:", error);
                this.state.allGames = GameHubProgramBuilder.buildAllGames([]);
                this.state.restGame = null;
                this.state.dailyProgram = null;
                this.state.dailyGoal = "";
                this.state.programGames = [];
                this.state.programDays = [];
                this.state.programError = error?.message || "Unable to load game list";
            }

            this.state.programInitialized = true;
            this.state.programLoading = false;
            
            if (this.options.onStateChange) {
                this.options.onStateChange({ scene: "intro", activeCategory: "Attention" });
            }
            this.render();
        }
    }

    /**
     * ดำเนินการ Check-in ให้ผู้ใช้อัตโนมัติเมื่อบรรลุเป้าหมาย
     */
    async maybeAutoCheckIn({ programNodes, historyRecords, checkInKey = "" }) {
        const targetNodes = GameHubProgramBuilder.getAutoCheckInTargetNodes(programNodes);

        if (!this.parsedPatientHn || !targetNodes.length) return;
        if (this.state.autoCheckInLoading || this.state.autoCheckInCompletedKey === checkInKey) return;
        
        if (GameHubHistoryManager.hasCheckInRecord(historyRecords)) {
            this.state.autoCheckInCompletedKey = checkInKey;
            return;
        }

        const completedTargetCount = GameHubHistoryManager.getSequentialCompletedCount(targetNodes, historyRecords);
        if (completedTargetCount < targetNodes.length) return;

        this.state.autoCheckInLoading = true;

        try {
            const checkInRecord = await db.addUserGameHistory({
                hn: this.parsedPatientHn,
                checkIn: true,
                startAt: new Date().toISOString(),
            });

            this.state.historyRecords = [
                ...this.state.historyRecords,
                GameHubDataNormalizer.normalizeHistoryRecord(checkInRecord),
            ];
            this.state.autoCheckInCompletedKey = checkInKey;
            this.render();

            const checkInDates = await db.getUserCheckInDatesByHn({ hn: this.parsedPatientHn });
            await showCheckInPopup({
                checkInDates,
                defaultDayCount: this.options.defaultDayCount || 14,
            });
        } catch (error) {
            console.error("Unable to auto check in completed daily program:", error);
        } finally {
            this.state.autoCheckInLoading = false;
        }
    }

    /**
     * ดึงข้อมูลประวัติการเล่นของผู้ใช้งาน
     */
    async loadPlayedHistory(force = false) {
        if (this.state.historyLoading && !force) return;

        if (!this.parsedPatientHn) {
            this.state.historyRecords = [];
            this.state.historyError = "";
            this.render();
            return;
        }

        this.state.historyLoading = true;
        this.render();

        try {
            const allProgramGames = (this.state.programDays || []).flatMap((dayItem) => dayItem?.games || []);
            const gids = allProgramGames.map((game) => String(game?.gid || "").trim()).filter(Boolean);
            const startDate = this.state.dailyProgram?.startedProgram || this.options.programDate || null;
            const endDate = this.state.dailyProgram?.programEndDate || this.options.programDate || null;
            
            const { playedFrom } = GameHubUtils.getProgramDateRange(startDate);
            const { playedTo } = GameHubUtils.getProgramDateRange(endDate);

            if (typeof this.options.loadCompletedGameHistoryRecords === "function" || typeof this.options.loadInstantNodeHistoryRecords === "function") {
                const [completedGameRows, instantNodeRows] = await Promise.all([
                    typeof this.options.loadCompletedGameHistoryRecords === "function"
                        ? this.options.loadCompletedGameHistoryRecords({ hn: this.parsedPatientHn, gids, playedFrom, playedTo })
                        : [],
                    typeof this.options.loadInstantNodeHistoryRecords === "function"
                        ? this.options.loadInstantNodeHistoryRecords({ hn: this.parsedPatientHn, playedFrom, playedTo })
                        : [],
                ]);

                this.state.historyRecords = [
                    ...(Array.isArray(completedGameRows) ? completedGameRows : []),
                    ...(Array.isArray(instantNodeRows) ? instantNodeRows : []),
                ].map((record) => GameHubDataNormalizer.normalizeHistoryRecord(record));
            } else if (typeof this.options.loadHistoryRecords === "function") {
                const historyRows = await this.options.loadHistoryRecords({ hn: this.parsedPatientHn, playedFrom, playedTo });
                this.state.historyRecords = Array.isArray(historyRows)
                    ? historyRows.map((record) => GameHubDataNormalizer.normalizeHistoryRecord(record))
                    : [];
            } else {
                this.state.historyRecords = [];
            }

            this.state.historyError = "";
            this.state.historyLoading = false;
            this.render();

            const currentProgramDay = Number(this.state.dailyProgram?.programDay || this.state.programDays[0]?.day || 1);
            const currentDayAnchor = GameHubDataNormalizer.getProgramDayAnchorDate(
                this.state.dailyProgram?.startedProgram || this.options.programDate,
                currentProgramDay,
            );
            const currentDayKey = GameHubDataNormalizer.getCheckInDateKey(currentDayAnchor);
            const currentDayHistory = GameHubHistoryManager.getHistoryRecordsByDateKey(this.state.historyRecords, currentDayKey);
            
            const currentProgramNodes = GameHubProgramBuilder.buildDailyProgramNodes(
                (this.state.programDays || []).find((dayItem) => Number(dayItem?.day) === currentProgramDay)?.games || this.state.programGames,
                this.state.restGame,
            );
            
            await this.maybeAutoCheckIn({
                programNodes: currentProgramNodes,
                historyRecords: currentDayHistory,
                checkInKey: currentDayKey,
            });

            const currentDaySection = GameHubProgramBuilder.buildProgramDaySections(this.state.programDays, this.state.restGame)
                .find((dayItem) => Number(dayItem?.day) === currentProgramDay);
                
            if (currentDaySection) {
                const currentDayCompletion = GameHubHistoryManager.getProgramDayCompletion(currentDaySection, currentDayHistory);
                const currentDayGamesComplete = GameHubHistoryManager.areProgramDayGamesComplete(currentDaySection, currentDayHistory);
                
                if (
                    (currentDayCompletion.isComplete || currentDayGamesComplete)
                    && !this.state.includeNextProgramDay
                    && currentProgramDay < Number(this.state.dailyProgram?.programDayCount || 0)
                ) {
                    this.state.includeNextProgramDay = true;
                    await this.loadProgramGames(true);
                    await this.loadPlayedHistory(true);
                    return;
                }
            }
        } catch (error) {
            console.warn("Unable to load played game history:", error);
            this.state.historyRecords = [];
            this.state.historyError = error?.message || "Unable to load played game history";
        }

        this.state.historyLoading = false;
        this.render();
    }

    /**
     * ฟังก์ชันเริ่มต้นระบบ
     */
    async init() {
        this.render();
        await this.loadProgramGames();
        await this.loadPlayedHistory();
    }
}
