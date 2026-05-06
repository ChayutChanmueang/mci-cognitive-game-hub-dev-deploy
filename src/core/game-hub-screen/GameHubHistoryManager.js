import { REST_GAME_GID } from "./GameHubConstants.js";
import { GameHubDataNormalizer } from "./GameHubDataNormalizer.js";

/**
 * GameHubHistoryManager
 * คลาสสำหรับจัดการและคำนวณประวัติการเล่น, สถานะความสำเร็จของเป้าหมาย (OOP Pattern)
 */
export class GameHubHistoryManager {
    /**
     * ตรวจสอบว่า Node เกมนี้ตรงกับประวัติการเล่นหรือไม่
     */
    static isNodeMatchedByHistory(node, historyRecord) {
        if (!node || !historyRecord) {
            return false;
        }

        if (node.type === "game") {
            const nodeStage = node.stage == null || node.stage === "" ? null : Number(node.stage);
            return Boolean(historyRecord.gid)
                && historyRecord.gid === node.gid
                && (nodeStage == null || historyRecord.stage == null || Number(historyRecord.stage) === nodeStage)
                && Boolean(historyRecord.endAt);
        }

        if (node.type === "rest") {
            return historyRecord.gid === REST_GAME_GID;
        }

        if (node.type === "checkin") {
            return historyRecord.checkIn === true || !historyRecord.gid;
        }

        return false;
    }

    /**
     * คำนวณจำนวน Node ที่เล่นจบแล้วเรียงตามลำดับ
     */
    static getSequentialCompletedCount(nodes, historyRecords) {
        const normalizedHistory = (historyRecords || [])
            .map((record) => GameHubDataNormalizer.normalizeHistoryRecord(record))
            .sort((first, second) => {
                const firstTime = new Date(first.playedAt || 0).getTime();
                const secondTime = new Date(second.playedAt || 0).getTime();
                return firstTime - secondTime;
            });

        let cursor = 0;
        let completedCount = 0;

        for (const node of nodes || []) {
            let matchedIndex = -1;

            for (let index = cursor; index < normalizedHistory.length; index += 1) {
                if (this.isNodeMatchedByHistory(node, normalizedHistory[index])) {
                    matchedIndex = index;
                    break;
                }
            }

            if (matchedIndex < 0) {
                break;
            }

            cursor = matchedIndex + 1;
            completedCount += 1;
        }

        return completedCount;
    }

    /**
     * กรองประวัติการเล่นตาม Date Key
     */
    static getHistoryRecordsByDateKey(historyRecords, dateKey) {
        if (!dateKey) {
            return historyRecords || [];
        }

        return (historyRecords || []).filter((record) => {
            const key = GameHubDataNormalizer.getCheckInDateKey(record?.playedAt);
            return key === dateKey;
        });
    }

    /**
     * ดึงประวัติการเล่นของวันที่กำหนด (Program Day)
     */
    static getHistoryRecordsForProgramDay(historyRecords, startedProgram, programDay) {
        const anchor = GameHubDataNormalizer.getProgramDayAnchorDate(startedProgram, programDay);
        const key = GameHubDataNormalizer.getCheckInDateKey(anchor);
        return this.getHistoryRecordsByDateKey(historyRecords, key);
    }

    /**
     * ตรวจสอบว่ามีการ Check-in หรือยัง
     */
    static hasCheckInRecord(historyRecords, dateKey = "") {
        const scopedHistory = this.getHistoryRecordsByDateKey(historyRecords, dateKey);
        return (scopedHistory || [])
            .map((record) => GameHubDataNormalizer.normalizeHistoryRecord(record))
            .some((record) => record.checkIn === true);
    }

    /**
     * นับจำนวนเกมที่เล่นจบไปแล้ว
     */
    static getCompletedGameCount(nodes, completedNodeCount) {
        const safeCompletedNodeCount = Math.max(0, Number(completedNodeCount) || 0);
        return (nodes || [])
            .slice(0, safeCompletedNodeCount)
            .reduce((count, node) => (
                node?.type === "game"
                    ? count + 1
                    : count
            ), 0);
    }

    /**
     * สรุปผลความคืบหน้าของวัน
     */
    static getProgramDayCompletion(daySection, historyRecords) {
        const nodes = daySection?.nodes || [];
        const completedCount = this.getSequentialCompletedCount(nodes, historyRecords);
        const gameTarget = nodes.filter((node) => node.type === "game").length;
        const completedGameCount = Math.min(gameTarget, this.getCompletedGameCount(nodes, completedCount));

        return {
            completedCount,
            completedGameCount,
            gameTarget,
            isComplete: nodes.length > 0 && completedCount >= nodes.length,
        };
    }

    /**
     * ตรวจสอบว่าเกมสำหรับวันนั้นเล่นจบหมดหรือยัง
     */
    static areProgramDayGamesComplete(daySection, historyRecords) {
        const gameNodes = (daySection?.nodes || []).filter((node) => node?.type === "game");
        if (!gameNodes.length) {
            return false;
        }

        const normalizedHistory = (historyRecords || []).map((record) => GameHubDataNormalizer.normalizeHistoryRecord(record));
        return gameNodes.every((node) =>
            normalizedHistory.some((historyRecord) => this.isNodeMatchedByHistory(node, historyRecord)),
        );
    }
}
