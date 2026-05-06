import { REST_GAME_GID } from "./GameHubConstants.js";

/**
 * GameHubDataNormalizer
 * คลาสรับผิดชอบการทำ Normalization ของข้อมูลจาก Database หรือ API ให้เป็น Format มาตรฐาน (OOP Pattern)
 */
export class GameHubDataNormalizer {
    /**
     * แปลงรูปแบบข้อมูลเกม
     */
    static normalizeGame(item, index, fallbackCategory = "Attention") {
        const category = String(item?.mci_group || fallbackCategory || "Attention").trim();
        const name = String(item?.name || `เกมที่ ${index + 1}`).trim();
        const thName = String(item?.th_name || item?.thName || "").trim();

        return {
            id: item?.id ?? `${category}-${index}`,
            gid: String(item?.gid || `${category}-${index}`).trim(),
            name,
            th_name: thName,
            displayName: thName || name,
            mci_group: category,
            max_score: item?.max_score ?? null,
            created_at: item?.created_at ?? null,
        };
    }

    /**
     * แปลงรูปแบบข้อมูลประวัติการเล่น
     */
    static normalizeHistoryRecord(item) {
        const gid = String(item?.gid || "").trim();
        const stage = item?.stage == null || item?.stage === "" ? null : Number(item.stage);
        return {
            gid,
            stage,
            rest: gid === REST_GAME_GID,
            checkIn: Boolean(item?.checkIn || item?.check_in || item?.["check-in"]) || !gid,
            playedAt: item?.start_at || item?.startAt || item?.played_at || item?.playedAt || null,
            endAt: item?.end_at || item?.endAt || null,
        };
    }

    /**
     * สร้าง Key วันที่สำหรับใช้ตรวจสอบการเช็คอิน (รูปแบบ YYYY-MM-DD)
     */
    static getCheckInDateKey(programDate = null) {
        const anchor = programDate ? new Date(programDate) : new Date();
        const safeAnchor = Number.isNaN(anchor.getTime()) ? new Date() : anchor;
        const year = safeAnchor.getFullYear();
        const month = String(safeAnchor.getMonth() + 1).padStart(2, "0");
        const day = String(safeAnchor.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    /**
     * คำนวณหาวันที่เริ่มต้นของวันที่เล่น
     */
    static getProgramDayAnchorDate(startedProgram, programDay = 1) {
        const anchor = startedProgram ? new Date(startedProgram) : new Date();
        const safeAnchor = Number.isNaN(anchor.getTime()) ? new Date() : anchor;
        const dayStart = new Date(safeAnchor);
        dayStart.setHours(0, 0, 0, 0);
        const offsetDays = Math.max(0, (Number(programDay) || 1) - 1);
        dayStart.setDate(dayStart.getDate() + offsetDays);
        return dayStart;
    }
}
