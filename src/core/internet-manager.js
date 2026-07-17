// US-E7-27 · Internet connection manager.
//
// Watches connectivity and drives the "อินเทอร์เน็ตหายไปแล้ว" offline popup:
//   • listens to the browser `online` / `offline` events (+ initial state)
//   • shows the offline popup (with the correct คุณตา/คุณยาย art) when the connection
//     drops, and auto-dismisses it when the connection returns
//   • "ลองอีกครั้ง" actively re-probes the network; if still offline it re-shows,
//     otherwise it fires the optional `onReconnect` callback
//
// Gender note: the player's gender is NOT in the session cookie — it is fetched from the
// DB (`db.getPatientByHn(hn).gender`). Since that request can't succeed while offline,
// the manager resolves gender once WHILE ONLINE and caches it, so the popup can render
// the right character even after the connection drops. Callers that already know the
// gender (e.g. main.js after loading the patient) should push it via `setGender()`.
import db from "./database.js";
import SessionStorageManager from "./session-storage-manager.js";
import { getPatientSessionCookie } from "../util/patient-session.js";
import {
    showOfflinePopup,
    dismissOfflinePopup,
    isOfflinePopupOpen,
    preloadOfflineArt,
} from "../ui/offline-popup.js";

const PATIENT_LOGIN_ID_KEY = "patient_login_id";
// Small same-origin asset used for an active connectivity probe (navigator.onLine only
// reports whether a network interface exists, not whether the internet is reachable).
const DEFAULT_PROBE_URL = "/favicon.png";

class InternetManager {
    constructor() {
        this.started = false;
        this.gender = "";
        this.probeUrl = DEFAULT_PROBE_URL;
        this.onReconnect = null;
        this._onOnline = () => this.handleOnline();
        this._onOffline = () => this.handleOffline();
    }

    /**
     * @param {object}   [options]
     * @param {string}   [options.gender]      cached player gender ("male"|"female")
     * @param {string}   [options.probeUrl]    URL for the active connectivity probe
     * @param {Function} [options.onReconnect] called when connectivity is restored
     */
    configure({ gender, probeUrl, onReconnect } = {}) {
        if (typeof gender === "string") this.gender = gender.trim();
        if (probeUrl) this.probeUrl = probeUrl;
        if (onReconnect !== undefined) this.onReconnect = onReconnect;
        return this;
    }

    /** Cache the player's gender so the offline popup shows the right character. */
    setGender(gender) {
        this.gender = String(gender || "").trim();
        // Buffer the character art now (while presumably online) so it renders when offline.
        this.bufferArt();
        return this;
    }

    /**
     * Buffer the offline popup character art into memory (as data URLs) while online, so the
     * image still renders after the connection drops. No-op when offline (nothing to fetch).
     */
    bufferArt() {
        if (!this.isOnline()) {
            return Promise.resolve();
        }
        return preloadOfflineArt(this.gender).catch(() => {});
    }

    /** Browser's coarse online state (interface up). */
    isOnline() {
        return typeof navigator === "undefined" ? true : navigator.onLine !== false;
    }

    /** Begin watching connectivity. Idempotent. */
    start() {
        if (this.started || typeof window === "undefined") {
            return this;
        }
        this.started = true;
        window.addEventListener("online", this._onOnline);
        window.addEventListener("offline", this._onOffline);

        // Best-effort: resolve + cache gender while (presumably) online.
        this.refreshGender().catch(() => {});

        // If we boot up already offline, surface the popup immediately.
        if (!this.isOnline()) {
            this.handleOffline();
        }
        return this;
    }

    /** Stop watching connectivity. */
    stop() {
        if (!this.started) return this;
        window.removeEventListener("online", this._onOnline);
        window.removeEventListener("offline", this._onOffline);
        this.started = false;
        return this;
    }

    /**
     * Resolve the player's gender from the session + DB and cache it. No-op if already
     * cached or if offline (can't reach the DB). Safe to call repeatedly.
     */
    async refreshGender() {
        if (!this.isOnline()) {
            return this.gender;
        }
        if (this.gender) {
            // Gender already known — just make sure the art is buffered for offline use.
            this.bufferArt();
            return this.gender;
        }
        try {
            const session = getPatientSessionCookie();
            const code = String(
                session?.patientCode || SessionStorageManager.get(PATIENT_LOGIN_ID_KEY, "") || "",
            ).trim();
            if (!code) {
                return this.gender;
            }
            const patient = await db.getPatientByHn(code);
            this.gender = String(patient?.gender || "").trim();
        } catch (error) {
            console.warn("[internet-manager] unable to resolve player gender:", error);
        }
        this.bufferArt();
        return this.gender;
    }

    /**
     * Actively verify reachability with a tiny no-store request. Returns false quickly
     * when the browser already reports offline.
     */
    async probe() {
        if (!this.isOnline()) {
            return false;
        }
        if (typeof fetch === "undefined") {
            return true;
        }
        try {
            await fetch(`${this.probeUrl}?_=${Date.now()}`, { method: "HEAD", cache: "no-store" });
            return true;
        } catch (error) {
            return false;
        }
    }

    /** Connection dropped → show the offline popup (singleton-guarded). */
    handleOffline() {
        if (isOfflinePopupOpen()) {
            return;
        }
        showOfflinePopup({
            gender: this.gender,
            onRetry: () => this.retry(),
        });
    }

    /** Connection restored → close the popup and notify. */
    handleOnline() {
        if (isOfflinePopupOpen()) {
            dismissOfflinePopup(true);
        }
        // Re-resolve + re-buffer art now that we're online again (covers first-boot-offline).
        this.refreshGender().catch(() => {});
        if (typeof this.onReconnect === "function") {
            try {
                this.onReconnect();
            } catch (error) {
                console.error("[internet-manager] onReconnect handler failed:", error);
            }
        }
    }

    /**
     * "ลองอีกครั้ง" handler: the popup closes itself on click, then we re-probe. If still
     * offline, re-show the popup; if back online, notify via onReconnect.
     */
    async retry() {
        const online = await this.probe();
        if (online) {
            if (typeof this.onReconnect === "function") {
                try {
                    this.onReconnect();
                } catch (error) {
                    console.error("[internet-manager] onReconnect handler failed:", error);
                }
            }
        } else {
            // Re-show on the next tick (after the current popup's leave animation).
            setTimeout(() => this.handleOffline(), 350);
        }
    }
}

export default new InternetManager();
