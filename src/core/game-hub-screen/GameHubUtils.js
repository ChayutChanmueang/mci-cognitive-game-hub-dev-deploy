import { CATEGORY_META } from "./GameHubConstants.js";
import { getPatientSessionCookie, getPatientSessionLabel } from "../../util/patient-session.js";

/**
 * GameHubUtils
 * คลาสสำหรับจัดการ Utility Functions ทั่วไปที่ใช้ในระบบ Game Hub (OOP Pattern)
 */
export class GameHubUtils {
    /**
     * ป้องกัน XSS Injection ด้วยการ Escape HTML
     */
    static escapeHtml(value) {
        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    /**
     * ดึงชื่อผู้เล่นหรือรหัสจาก Session
     */
    static getPatientLabel() {
        const rememberedSession = getPatientSessionCookie();
        if (rememberedSession) {
            return getPatientSessionLabel(rememberedSession);
        }

        const loginId = sessionStorage.getItem("patient_login_id") || "";
        const draft = sessionStorage.getItem("patient_signup_draft");
        if (!draft) {
            return loginId;
        }

        try {
            const parsed = JSON.parse(draft);
            if (parsed?.firstname) {
                return `${parsed.firstname} ${parsed.lastname || ""}`.trim();
            }
        } catch (error) {
            console.warn("Unable to parse patient signup draft:", error);
        }

        return loginId;
    }

    /**
     * ดึงชื่อหมวดหมู่เป็นภาษาไทย
     */
    static getCategoryLabel(categoryId) {
        return CATEGORY_META[categoryId]?.nameTh || "ฝึกสมอง";
    }

    /**
     * ดึงคำอธิบายหมวดหมู่
     */
    static getCategoryDescription(categoryId) {
        return CATEGORY_META[categoryId]?.description || "เกมฝึกสมองประจำวัน";
    }

    /**
     * ดึงช่วงเวลาของวันที่เล่น (Start of day - End of day)
     */
    static getProgramDateRange(programDate = null) {
        const anchor = programDate ? new Date(programDate) : new Date();
        const safeAnchor = Number.isNaN(anchor.getTime()) ? new Date() : anchor;
        const start = new Date(safeAnchor);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        return {
            playedFrom: start.toISOString(),
            playedTo: end.toISOString(),
        };
    }
}
