import "../public/components.css";
import db from "./core/database.js";
import edgeFunction from "./core/edge-function.js";
import { renderCheckInSummaryScreen } from "./ui/checkin-summary-screen.js";
import { createGameHubState, renderGameHubScreen } from "./ui/game-hub-screen.js";
import { createTestGameHubState, renderTestGameHubScreen } from "./ui/test-game-hub.js";
import { renderAdminLoginScreen } from "./ui/admin-login-screen.js";
import { renderWelcomeScreen } from "./ui/welcome-screen.js";
import { renderLeaderboardScreen } from "./ui/leaderboard-screen.js";
import { renderLoginScreen } from "./ui/login-screen.js";
import { renderPlayerInfoScreen } from "./ui/player-info-screen.js";
import { showPopup } from "./ui/popup-dialog.js";
import { showGameExitPopup } from "./ui/game-exit-popup.js";
import { showLoadingOverlay, hideLoadingOverlay } from "./ui/loading-overlay.js";
import { renderWithFade } from "./ui/transition/screen-transition.js";
import { renderSignupScreen } from "./ui/signup-screen.js";
import { renderDailyPresetTool } from "./tools/daily-preset-tool.js";
import { renderDailyPresetEditor } from "./tools/daily-preset-editor.js";
import {
    deleteGameLevelPresetList,
    getGameLevelPresetEditorData,
    getGameLevelPresetLists,
    getGameListOptions,
    saveGameLevelPreset,
} from "./tools/daily-preset-database.js";
import {
    buildPatientSession,
    clearPatientSessionCookie,
    getPatientSessionCookie,
    getPatientSessionLabel,
    setPatientSessionCookie,
} from "./util/patient-session.js";
import {
    buildGameCsv,
    buildGameHistoryCsv,
    buildPlayerCsv,
    buildPlayersCsv,
    CsvExportScope,
    CsvExportType,
    downloadCsv,
    getGameHistoriesCsvFilename,
    getGameHistoryCsvFilename,
    getGameCsvFilename,
    getGamesCsvFilename,
    getPlayerCsvFilename,
    getPlayersCsvFilename,
} from "./util/player-csv-export.js";
import { getProgramDateRange } from "./util/program-date-util.js";
import StringUtil from "./util/string-util.js";
import { EventBus } from "./core/EventBus.js";
import AudioManager from "./core/audio-manager.js";
import internetManager from "./core/internet-manager.js";
import { MinigameHUD } from "./ui/minigame-hud.js";
import { MinigameResultPanel } from "./ui/minigame-result-panel.js";
import StorageManager from "./core/storage-manager.js";
import SessionStorageManager from "./core/session-storage-manager.js";
import MiniGameDBUtil from "./util/minigame-db-util.js";

const gameModuleLoaders = import.meta.glob(["./game/*/main.js", "!./game/game-hub/main.js"]);

const ROUTES = Object.freeze({
    home: "#/home",
    login: "#/login",
    adminLogin: "#/admin-login",
    playerInfo: "#/player-info",
    leaderboard: "#/leaderboard",
    signup: "#/signup",
    hub: "#/hub",
    testGameHub: "#/test-game-hub",
    checkInSummary: "#/checkin-summary",
    dailyPresetTool: "#/tools/daily-presets",
});

const GAME_ROUTE_PREFIX = "#/game/";
const HUB_ROUTE_PREFIX = "#/hub/";
const DEFAULT_HUB_SCENE = "intro";
const DEFAULT_HUB_CATEGORY = "Attention";
const HUB_CATEGORIES = new Set(["Memory", "Visuospatial", "Attention", "Language", "Executive", "Physical"]);
const PATIENT_LOGIN_ID_KEY = "patient_login_id";
const PATIENT_SIGNUP_DRAFT_KEY = "patient_signup_draft";
const PENDING_GAME_LAUNCH_KEY = "pending_game_launch_gid";
const BACK_BUTTON_PROTECTED_SLUGS = new Set([
    "zoo-feeder",
    "medicine-feeder",
    "postcard-reader",
    "symmetry-decor",
    "symmetry-decor-household",
    "context-clues",
    "zoo-detective",
    "fry-food",
]);
const GAME_COLORS = Object.freeze({
    "zoo-feeder": { border: "#DE8D23", header: "#FEA837", textPrimary: "#945E17", textSecondary: "#DE8519" },
    "medicine-feeder": { border: "#2A7CC7", header: "#4A9FE0", textPrimary: "#1A4F82", textSecondary: "#2A7CC7" },
    "zoo-detective": { border: "#2D8FBA", header: "#45A9D4", textPrimary: "#235B75", textSecondary: "#3D86A8" },
    "symmetry-decor": { border: "#DB4670", header: "#FF5585", textPrimary: "#A83855", textSecondary: "#F26A8D" },
    "symmetry-decor-household": { border: "#446A46", header: "#619B64", textPrimary: "#2C452E", textSecondary: "#3E6641" },
    "postcard-reader": { border: "#54AC24", header: "#65BD35", textPrimary: "#446930", textSecondary: "#6F9F55" },
    "context-clues": { border: "#C73969", header: "#E34F81", textPrimary: "#8F2448", textSecondary: "#C8577C" },
    "fry-food": { border: "#DE8D23", header: "#FEA837", textPrimary: "#945E17", textSecondary: "#DE8519" },
});
let activeThemeColors = null;
EventBus.on("minigame:theme-ready", (colors) => {
    activeThemeColors = colors;
});
const TEST_GAME_HUB_LAUNCH_GID_KEY = "test_game_hub_launch_gid";
const PENDING_GAME_HISTORY_STORAGE = Object.freeze({
    map: "pending_game_history_by_gid",
    legacyId: "pending_game_history_id",
    legacyStartAt: "pending_game_history_start_at",
});
const SELECTED_GAME_STORAGE = Object.freeze({
    gid: "selected_game_gid",
    name: "selected_game_name",
    thName: "selected_game_th_name",
    group: "selected_game_group",
    stage: "selected_game_stage",
    level: "selected_game_level",
    day: "selected_game_day",
    presetDataId: "selected_game_preset_data_id",
});

document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    const uiRoot = document.getElementById("ui-root");
    const gameContainer = document.getElementById("game-container");

    // App version badge (US-E7-05): shows on every DOM page (Game Hub, Login, Sign-up,
    // Leaderboard, Player-Info, Popups, …) and is hidden while a minigame is active —
    // hide/show is driven purely by the `body.game-mode` class via CSS, so no JS toggling
    // is needed on route changes. Version comes from package.json (single source of truth),
    // injected at build time by Vite's `define` as `__APP_VERSION__`.
    const APP_VERSION = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "";
    if (APP_VERSION && !document.getElementById("app-version-badge")) {
        const badge = document.createElement("div");
        badge.id = "app-version-badge";
        badge.className = "app-version-badge";
        badge.setAttribute("aria-hidden", "true");
        badge.textContent = `v${APP_VERSION}`;
        document.body.appendChild(badge);
    }
    const hubUiState = createGameHubState();
    const testGameHubUiState = createTestGameHubState();
    let activeGameInstance = null;
    let currentGameSlug = null;
    let routeRenderVersion = 0;
    let exitLogHn = "";
    let gameOpenedLogged = false;

    // Boot loading overlay (markup in index.html). It's a modal cover that blocks interaction
    // until the first screen is fully rendered, so the user can't tap a game/leaderboard before
    // data is ready. Dismissed exactly once; a safety timeout guarantees it can never trap the
    // user behind it if a load hangs.
    let bootLoadingDismissed = false;
    const finishBootLoading = () => {
        if (bootLoadingDismissed) {
            return;
        }
        bootLoadingDismissed = true;
        const overlay = document.getElementById("app-loading");
        if (!overlay) {
            return;
        }
        overlay.classList.add("app-loading--hidden");
        setTimeout(() => overlay.remove(), 400);
    };

    // Back-button guard state: tracks whether a protected minigame is active.
    // Uses a pushState sentinel so back press keeps the URL stable (popstate handler),
    // with a hashchange fallback for edge cases where the sentinel is bypassed.
    // Back-button guard state
    let isBackGuardActive = false;
    let backGuardSelectedGame = null;
    let backGuardCleanup = null;
    let isBackGuardBlocking = false;

    // Initialize the global audio system
    AudioManager.init();

    // US-E7-27: watch connectivity and show the "อินเทอร์เน็ตหายไปแล้ว" popup when the
    // connection drops (auto-closes when it returns). On reconnect, re-render the current
    // route so any data that failed to load while offline is refreshed.
    internetManager
        .configure({
            onReconnect: () => {
                void renderCurrentRoute();
            },
        })
        .start();

    const handleBeforeUnload = () => {
        if (exitLogHn) {
            edgeFunction.logUserEventKeepalive(exitLogHn, "game.closed");
        }
    };

    const setupExitLog = (hn) => {
        teardownExitLog();
        exitLogHn = String(hn || "").trim();
        if (exitLogHn) {
            window.addEventListener("beforeunload", handleBeforeUnload);
        }
    };

    const teardownExitLog = () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        exitLogHn = "";
    };

    const destroyActiveGame = () => {
        // Unregister game sounds IMMEDIATELY, before any Phaser destroy logic can potentially throw an error
        if (currentGameSlug) {
            EventBus.emit('audio:unregister', currentGameSlug);
        }

        // Global nuclear fallback: immediately stop minigame BGM and all actively playing sounds
        EventBus.emit('audio:bgm-stop');
        EventBus.emit('audio:stop-all');

        if (activeGameInstance) {
            if (activeGameInstance.scale && activeGameInstance.scale.isFullscreen) {
                try {
                    activeGameInstance.scale.stopFullscreen();
                } catch (e) { }
            }
            try {
                if (typeof activeGameInstance.destroy === "function") {
                    activeGameInstance.destroy(true);
                }
            } catch (e) {
                console.error("[Main] Error during game destruction:", e);
            }
        }

        // Native exit fullscreen and orientation unlock as fallback
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => { });
        }
        if (screen.orientation && typeof screen.orientation.unlock === 'function') {
            try {
                screen.orientation.unlock();
            } catch (e) { }
        }

        activeGameInstance = null;
        currentGameSlug = null;

        if (gameContainer) {
            gameContainer.innerHTML = "";
        }

        document.documentElement.style.removeProperty("--game-mode-background");

        // Clear any inline styles that might have been set by Phaser Fullscreen
        document.body.style.backgroundColor = "";
        document.body.style.backgroundImage = "";
        document.documentElement.style.backgroundColor = "";
        document.documentElement.style.backgroundImage = "";


    };

    const showUiRoot = () => {
        if (uiRoot) {
            uiRoot.hidden = false;
        }
    };

    const hideUiRoot = () => {
        if (uiRoot) {
            uiRoot.hidden = true;
            uiRoot.innerHTML = "";
        }
    };

    const resolveGameModuleLoader = (gameName) => {
        const parsedName = String(gameName || "").trim();
        const slug = StringUtil.toSlug(parsedName);
        const modulePath = `./game/${slug}/main.js`;

        return {
            parsedName,
            slug,
            modulePath,
            loader: gameModuleLoaders[modulePath] || null,
        };
    };

    const getGameRouteHash = (selectedGame) => {
        const gid = String(selectedGame?.gid || "").trim();
        const slug = StringUtil.toSlug(selectedGame?.name || "");

        if (!gid || !slug) {
            return ROUTES.hub;
        }

        return `${GAME_ROUTE_PREFIX}${gid}/${slug}`;
    };

    const getGameDisplayName = (selectedGame, fallback = "นี้") =>
        String(
            selectedGame?.displayName
            || selectedGame?.th_name
            || selectedGame?.thName
            || selectedGame?.name
            || fallback,
        ).trim();

    const getGameHistoryNodeKey = (selectedGame) => {
        const gid = String(selectedGame?.gid || "").trim();
        const stage = selectedGame?.stage == null || selectedGame?.stage === ""
            ? ""
            : String(selectedGame.stage).trim();
        return stage ? `${gid}:stage-${stage}` : gid;
    };

    const getHubRouteHash = (options = {}) => {
        const scene = options?.scene === "selection" ? "selection" : DEFAULT_HUB_SCENE;
        const rawCategory = String(options?.category || DEFAULT_HUB_CATEGORY).trim();
        const category = HUB_CATEGORIES.has(rawCategory) ? rawCategory : DEFAULT_HUB_CATEGORY;

        if (scene === "selection") {
            return `${HUB_ROUTE_PREFIX}selection/${category}`;
        }

        return `${HUB_ROUTE_PREFIX}intro`;
    };

    const getTestGameHubRouteHash = (options = {}) => {
        const rawCategory = String(options?.category || DEFAULT_HUB_CATEGORY).trim();
        const category = HUB_CATEGORIES.has(rawCategory) ? rawCategory : DEFAULT_HUB_CATEGORY;
        return `${ROUTES.testGameHub}/selection/${category}`;
    };

    const getGameExitRoute = (selectedGame = null) => {
        const selectedGid = String(selectedGame?.gid || "").trim();
        const testLaunchGid = String(SessionStorageManager.get(TEST_GAME_HUB_LAUNCH_GID_KEY, "") || "").trim();

        return selectedGid && testLaunchGid === selectedGid
            ? getTestGameHubRouteHash({ scene: "selection", category: selectedGame?.mci_group })
            : ROUTES.hub;
    };

    const getCurrentRoute = () => {
        const rawHash = window.location.hash || "";
        const hashWithoutMarker = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash;
        const normalizedPath = hashWithoutMarker
            ? hashWithoutMarker.startsWith("/")
                ? hashWithoutMarker
                : `/${hashWithoutMarker}`
            : "/";

        if (normalizedPath === "/" || normalizedPath === "/home") {
            return { name: "home" };
        }

        if (normalizedPath === "/login") {
            return { name: "login" };
        }

        if (normalizedPath === "/admin-login") {
            return { name: "admin-login" };
        }

        if (normalizedPath === "/player-info") {
            return { name: "player-info" };
        }

        if (normalizedPath === "/leaderboard") {
            return { name: "leaderboard" };
        }

        if (normalizedPath === "/signup") {
            return { name: "signup" };
        }

        if (normalizedPath === "/checkin-summary") {
            return { name: "checkin-summary" };
        }

        if (normalizedPath === "/tools/daily-presets") {
            return { name: "daily-preset-tool" };
        }

        if (normalizedPath.startsWith("/tools/daily-presets/")) {
            const presetId = normalizedPath
                .slice("/tools/daily-presets/".length)
                .split("/")
                .map((segment) => String(segment || "").trim())
                .filter(Boolean)[0] || "";
            return { name: "daily-preset-editor", presetId };
        }

        if (normalizedPath === "/hub" || normalizedPath === "/hub/intro") {
            return {
                name: "hub",
                scene: "intro",
                category: DEFAULT_HUB_CATEGORY,
            };
        }

        if (normalizedPath.startsWith("/hub/selection")) {
            const segments = normalizedPath
                .slice("/hub/".length)
                .split("/")
                .map((segment) => String(segment || "").trim())
                .filter(Boolean);

            return {
                name: "hub",
                scene: "selection",
                category: segments[1] || DEFAULT_HUB_CATEGORY,
            };
        }

        if (normalizedPath === "/test-game-hub" || normalizedPath === "/test-game-hub/intro") {
            return {
                name: "test-game-hub",
                scene: "selection",
                category: DEFAULT_HUB_CATEGORY,
            };
        }

        if (normalizedPath.startsWith("/test-game-hub/selection")) {
            const segments = normalizedPath
                .slice("/test-game-hub/".length)
                .split("/")
                .map((segment) => String(segment || "").trim())
                .filter(Boolean);

            return {
                name: "test-game-hub",
                scene: "selection",
                category: segments[1] || DEFAULT_HUB_CATEGORY,
            };
        }

        if (normalizedPath.startsWith("/game/")) {
            const segments = normalizedPath
                .slice("/game/".length)
                .split("/")
                .map((segment) => String(segment || "").trim())
                .filter(Boolean);

            const gid = segments[0] || "";
            const slug = segments[1] || "";

            if (gid) {
                return {
                    name: "game",
                    gid,
                    slug,
                };
            }
        }

        return { name: "unknown" };
    };

    const navigateTo = (hash, options = {}) => {
        const { replace = false } = options;
        const nextHash = hash.startsWith("#") ? hash : `#${hash}`;

        if (window.location.hash === nextHash) {
            // Return the promise so callers (e.g. boot) can await the first render. The hash
            // is unchanged, so no hashchange event fires — we render directly here.
            return renderCurrentRoute();
        }

        if (replace) {
            const url = new URL(window.location.href);
            url.hash = nextHash.slice(1);
            window.history.replaceState(null, "", url);
            return renderCurrentRoute();
        }

        // Changing the hash triggers the hashchange listener, which renders asynchronously;
        // there's no promise to hand back in this path.
        window.location.hash = nextHash;
        return undefined;
    };

    const persistSelectedGame = (selectedGame) => {
        SessionStorageManager.save(SELECTED_GAME_STORAGE.gid, String(selectedGame?.gid || "").trim());
        SessionStorageManager.save(SELECTED_GAME_STORAGE.name, String(selectedGame?.name || "").trim());
        SessionStorageManager.save(
            SELECTED_GAME_STORAGE.thName,
            String(selectedGame?.th_name || selectedGame?.thName || selectedGame?.displayName || "").trim(),
        );
        SessionStorageManager.save(SELECTED_GAME_STORAGE.group, String(selectedGame?.mci_group || "").trim());
        SessionStorageManager.save(SELECTED_GAME_STORAGE.stage, String(selectedGame?.stage ?? "").trim());
        SessionStorageManager.save(SELECTED_GAME_STORAGE.level, String(selectedGame?.level ?? "").trim());
        SessionStorageManager.save(SELECTED_GAME_STORAGE.day, String(selectedGame?.day ?? "").trim());
        SessionStorageManager.save(SELECTED_GAME_STORAGE.presetDataId, String(selectedGame?.presetDataId ?? selectedGame?.preset_data_id ?? "").trim());
    };

    const getPersistedSelectedGame = () => {
        const gid = String(SessionStorageManager.get(SELECTED_GAME_STORAGE.gid, "") || "").trim();
        const name = String(SessionStorageManager.get(SELECTED_GAME_STORAGE.name, "") || "").trim();
        const thName = String(SessionStorageManager.get(SELECTED_GAME_STORAGE.thName, "") || "").trim();
        const mciGroup = String(SessionStorageManager.get(SELECTED_GAME_STORAGE.group, "") || "").trim();
        const stage = String(SessionStorageManager.get(SELECTED_GAME_STORAGE.stage, "") || "").trim();
        const level = String(SessionStorageManager.get(SELECTED_GAME_STORAGE.level, "") || "").trim();
        const day = String(SessionStorageManager.get(SELECTED_GAME_STORAGE.day, "") || "").trim();
        const presetDataId = String(SessionStorageManager.get(SELECTED_GAME_STORAGE.presetDataId, "") || "").trim();

        if (!gid || !name) {
            return null;
        }

        return {
            gid,
            name,
            th_name: thName,
            displayName: thName || name,
            mci_group: mciGroup || "Attention",
            stage: stage ? Number(stage) : null,
            level: level ? Number(level) : null,
            day: day ? Number(day) : null,
            presetDataId: presetDataId ? Number(presetDataId) : null,
        };
    };

    const getPersistedSelectedGameByGid = (gid) => {
        const parsedGid = String(gid || "").trim();
        const selectedGame = getPersistedSelectedGame();

        if (!parsedGid || selectedGame?.gid !== parsedGid) {
            return null;
        }

        return selectedGame;
    };

    const readPendingGameHistoryMap = () => {
        try {
            const parsed = SessionStorageManager.get(PENDING_GAME_HISTORY_STORAGE.map, {});
            return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
        } catch (error) {
            console.warn("Unable to parse pending game history map:", error);
            return {};
        }
    };

    const writePendingGameHistoryMap = (historyMap) => {
        const normalizedMap = historyMap && typeof historyMap === "object" && !Array.isArray(historyMap)
            ? historyMap
            : {};

        if (Object.keys(normalizedMap).length === 0) {
            SessionStorageManager.delete(PENDING_GAME_HISTORY_STORAGE.map);
            return;
        }

        SessionStorageManager.save(PENDING_GAME_HISTORY_STORAGE.map, normalizedMap);
    };

    const setPendingGameHistoryByKey = (nodeKey, selectedGame, historyRecord, fallbackStartAt = "") => {
        const parsedNodeKey = String(nodeKey || "").trim();
        const parsedGid = String(selectedGame?.gid || historyRecord?.gid || "").trim();
        if (!parsedNodeKey || !parsedGid || !historyRecord?.id) {
            return;
        }

        const historyMap = readPendingGameHistoryMap();
        historyMap[parsedNodeKey] = {
            id: Number(historyRecord.id),
            gid: parsedGid,
            stage: historyRecord.stage ?? selectedGame?.stage ?? null,
            nodeKey: parsedNodeKey,
            hn: String(historyRecord.hn || "").trim(),
            startAt: String(historyRecord.start_at || historyRecord.startAt || fallbackStartAt || "").trim(),
            endAt: historyRecord.end_at || null,
            userGameDataId: historyRecord.user_game_data_id || null,
        };
        writePendingGameHistoryMap(historyMap);
    };

    const removePendingGameHistoryByKey = (nodeKey) => {
        const parsedNodeKey = String(nodeKey || "").trim();
        if (!parsedNodeKey) {
            return;
        }

        const historyMap = readPendingGameHistoryMap();
        delete historyMap[parsedNodeKey];
        writePendingGameHistoryMap(historyMap);
    };

    const clearSelectedGameState = () => {
        SessionStorageManager.delete(PENDING_GAME_LAUNCH_KEY);
        SessionStorageManager.delete(TEST_GAME_HUB_LAUNCH_GID_KEY);
        SessionStorageManager.delete(PENDING_GAME_HISTORY_STORAGE.map);
        SessionStorageManager.delete(PENDING_GAME_HISTORY_STORAGE.legacyId);
        SessionStorageManager.delete(PENDING_GAME_HISTORY_STORAGE.legacyStartAt);
        SessionStorageManager.delete(SELECTED_GAME_STORAGE.gid);
        SessionStorageManager.delete(SELECTED_GAME_STORAGE.name);
        SessionStorageManager.delete(SELECTED_GAME_STORAGE.thName);
        SessionStorageManager.delete(SELECTED_GAME_STORAGE.group);
        SessionStorageManager.delete(SELECTED_GAME_STORAGE.stage);
        SessionStorageManager.delete(SELECTED_GAME_STORAGE.level);
        SessionStorageManager.delete(SELECTED_GAME_STORAGE.day);
        SessionStorageManager.delete(SELECTED_GAME_STORAGE.presetDataId);
    };

    const clearPatientClientState = () => {
        teardownExitLog();
        clearPatientSessionCookie();
        SessionStorageManager.delete(PATIENT_LOGIN_ID_KEY);
        SessionStorageManager.delete(PATIENT_SIGNUP_DRAFT_KEY);
        clearSelectedGameState();
        Object.assign(hubUiState, createGameHubState());
    };

    const rememberPatientSession = async (patient) => {
        const patientSession = buildPatientSession(patient);
        setPatientSessionCookie(patientSession);
        return patientSession;
    };

    if (gameContainer) {
        gameContainer.classList.add("game-container--hidden");
    }

    const showLanding = () => {
        if (!uiRoot || !gameContainer) {
            return;
        }

        document.body.classList.remove("game-mode");
        document.body.classList.remove("hub-mode");
        document.body.classList.add("landing-mode");
        app?.classList.remove("game-mode");
        app?.classList.remove("hub-mode");
        app?.classList.add("landing-mode");
        destroyActiveGame();
        gameContainer.classList.add("game-container--hidden");
        showUiRoot();

        renderWelcomeScreen(uiRoot, {
            onLogin: () => navigateTo(ROUTES.login),
        });
    };

    const showHub = async (options = {}) => {
        if (!uiRoot || !gameContainer) {
            return;
        }

        // BUG-005 / PB-01-01: snapshot the route version so we can detect if the user
        // navigates away (e.g. opens a game or the leaderboard) while this handler's data
        // is still loading. A stale handler must NOT render the Hub over the newer route.
        const renderVersion = routeRenderVersion;

        EventBus.emit("minigame:hide-hud");

        document.body.classList.remove("game-mode");
        document.body.classList.add("hub-mode");
        document.body.classList.remove("landing-mode");
        document.body.classList.add("game-hub-route"); // scopes the version badge to this page
        app?.classList.remove("game-mode");
        app?.classList.add("hub-mode");
        app?.classList.remove("landing-mode");
        destroyActiveGame();
        
        // Start hub BGM AFTER destroying the active game (which kills all previous audio)
        // EventBus.emit('audio:bgm', 'hub'); // Temporarily disabled
        
        gameContainer.classList.add("game-container--hidden");
        showUiRoot();

        const rememberedPatient = getPatientSessionCookie();
        const patientCode = String(rememberedPatient?.patientCode || SessionStorageManager.get(PATIENT_LOGIN_ID_KEY, "") || "").trim();
        const patientLabel = rememberedPatient ? getPatientSessionLabel(rememberedPatient) : patientCode;

        let patientGender = "";
        if (patientCode) {
            try {
                const patient = await db.getPatientByHn(patientCode);
                patientGender = String(patient?.gender || "").trim();
                // Cache gender so the offline popup can show the right character even
                // once the connection drops (can't hit the DB then). US-E7-27.
                internetManager.setGender(patientGender);
            } catch (error) {
                console.warn("Unable to load patient gender for avatar:", error);
            }
        }

        // BUG-005 / PB-01-01: bail out if the route changed during the patient load above.
        if (renderVersion !== routeRenderVersion) {
            return;
        }

        setupExitLog(patientCode);

        if (!gameOpenedLogged && patientCode) {
            gameOpenedLogged = true;
            edgeFunction.logUserEvent(patientCode, "game.opened").catch(() => { });
        }

        await renderGameHubScreen(uiRoot, {
            // BUG-005 / PB-01-01: renderGameHubScreen renders once, then re-renders after its
            // own async loads. This lets it skip those re-renders if the user has since left.
            isStale: () => renderVersion !== routeRenderVersion,
            // PB-01-02: dismiss the boot loading overlay at first paint (hub visible), not after
            // the slow data loads. Idempotent + once-guarded, so calling it on every hub nav is safe.
            onReady: finishBootLoading,
            loadGameList: () => db.getGameList(),
            loadProgramPresets: () => db.getGameLevelPresetList(),
            loadDailyProgram: (params) => db.getDailyGameProgramByHn(params),
            loadCompletedGameHistoryRecords: ({ hn, gids, playedFrom, playedTo }) =>
                db.getCompletedUserGameHistoryByHn({
                    hn,
                    gids,
                    startFrom: playedFrom,
                    startTo: playedTo,
                }),
            loadInstantNodeHistoryRecords: ({ hn, playedFrom, playedTo }) =>
                db.getInstantUserNodeHistoryByHn({
                    hn,
                    startFrom: playedFrom,
                    startTo: playedTo,
                }),
            completedCount: 0,
            patientHn: patientCode,
            patientCode,
            patientLabel,
            patientGender,
            initialScene: options.initialScene,
            initialCategory: options.initialCategory,
            sharedState: hubUiState,
            onStateChange: ({ scene, activeCategory }) => {
                navigateTo(getHubRouteHash({
                    scene,
                    category: activeCategory,
                }), { replace: true });
            },
            onProfile: () => {
                navigateTo(ROUTES.adminLogin);
            },
            onLeaderboard: () => {
                navigateTo(ROUTES.leaderboard);
            },
            onLaunchGame: async (selectedGame) => {
                const hasConfirmed = await showPopup({
                    title: "ยืนยันการเข้าเกม",
                    message: `ต้องการเปิดเกม ${getGameDisplayName(selectedGame)} ใช่หรือไม่`,
                    confirmText: "เริ่มเกม",
                    cancelText: "ยกเลิก",
                    icon: "play_circle",
                });

                if (!hasConfirmed) {
                    return;
                }

                const selectedGid = String(selectedGame?.gid || "").trim();
                const selectedNodeKey = getGameHistoryNodeKey(selectedGame);
                try {
                    // Start a game history row here. Game completion should later update this row
                    // with end_at and user_game_data_id via db.completeUserGameHistory(...).
                    const startedAt = new Date().toISOString();
                    const historyRecord = await db.addUserGameHistory({
                        hn: patientCode,
                        gid: selectedGid,
                        stage: selectedGame?.stage ?? null,
                        startAt: startedAt,
                        userGameDataId: null,
                    });

                    if (!historyRecord?.id) {
                        throw new Error("Missing user_game_history id");
                    }

                    setPendingGameHistoryByKey(selectedNodeKey, selectedGame, historyRecord, startedAt);
                } catch (error) {
                    console.warn("Unable to write launch history:", error);
                    await showPopup({
                        title: "บันทึกประวัติไม่สำเร็จ",
                        message: "ระบบยังไม่สามารถบันทึกประวัติการเล่นเกมลงฐานข้อมูลได้",
                        confirmText: "รับทราบ",
                        icon: "error",
                        tone: "error",
                    });
                    return;
                }

                persistSelectedGame(selectedGame);
                SessionStorageManager.delete(TEST_GAME_HUB_LAUNCH_GID_KEY);
                SessionStorageManager.save(PENDING_GAME_LAUNCH_KEY, selectedNodeKey);
                navigateTo(getGameRouteHash(selectedGame));
            },
            // Test-only shortcut: opens a selected game without creating normal history.
            onTestQuickLaunchGame: async (selectedGame) => {
                const selectedGid = String(selectedGame?.gid || "").trim();
                if (!selectedGid) {
                    return;
                }

                const launchMode = await showPopup({
                    title: "เปิดเกมทดสอบ",
                    message: `เลือกวิธีเปิดเกม ${getGameDisplayName(selectedGame)}`,
                    icon: "sports_esports",
                    actions: [
                        { value: "cancel", label: "ยกเลิก", variant: "outlined" },
                        { value: "no-history", label: "เปิดเกมไม่เก็บประวัติ", variant: "outlined" },
                        { value: "with-history", label: "เปิดเกมเก็บประวัติ", variant: "filled" },
                    ],
                });

                if (launchMode === "cancel" || !launchMode) {
                    return;
                }

                if (launchMode === "with-history") {
                    const selectedNodeKey = getGameHistoryNodeKey(selectedGame);
                    try {
                        const startedAt = new Date().toISOString();
                        const historyRecord = await db.addUserGameHistory({
                            hn: patientCode,
                            gid: selectedGid,
                            stage: selectedGame?.stage ?? null,
                            startAt: startedAt,
                            userGameDataId: null,
                        });

                        if (!historyRecord?.id) {
                            throw new Error("Missing user_game_history id");
                        }

                        setPendingGameHistoryByKey(selectedNodeKey, selectedGame, historyRecord, startedAt);
                        persistSelectedGame(selectedGame);
                        SessionStorageManager.delete(TEST_GAME_HUB_LAUNCH_GID_KEY);
                        SessionStorageManager.save(PENDING_GAME_LAUNCH_KEY, selectedNodeKey);
                        navigateTo(getGameRouteHash(selectedGame));
                        return;
                    } catch (error) {
                        console.warn("Unable to write test launch history:", error);
                        await showPopup({
                            title: "บันทึกประวัติไม่สำเร็จ",
                            message: "ระบบยังไม่สามารถบันทึกประวัติการเล่นเกมทดสอบลงฐานข้อมูลได้",
                            confirmText: "รับทราบ",
                            icon: "error",
                            tone: "error",
                        });
                        return;
                    }
                }

                persistSelectedGame(selectedGame);
                SessionStorageManager.delete(TEST_GAME_HUB_LAUNCH_GID_KEY);
                SessionStorageManager.delete(PENDING_GAME_LAUNCH_KEY);
                removePendingGameHistoryByKey(getGameHistoryNodeKey(selectedGame));
                navigateTo(getGameRouteHash(selectedGame));
            },
            // Test-only shortcut: clears today's hub history so QA can replay the daily path.
            onTestClearTodayHistory: async () => {
                if (!patientCode) {
                    await showPopup({
                        title: "ไม่พบผู้เล่น",
                        message: "ยังไม่พบข้อมูลผู้เล่นที่กำลังใช้งาน จึงไม่สามารถลบประวัติได้",
                        confirmText: "รับทราบ",
                        icon: "warning",
                    });
                    return;
                }

                const hasConfirmed = await showPopup({
                    title: "ยืนยันการลบประวัติ",
                    message: "ต้องการลบประวัติการเล่นทั้งหมดของวันนี้ใช่หรือไม่",
                    confirmText: "ตกลง",
                    cancelText: "ยกเลิก",
                    icon: "delete",
                    tone: "error",
                });

                if (!hasConfirmed) {
                    return;
                }

                const start = new Date();
                start.setHours(0, 0, 0, 0);
                const end = new Date(start);
                end.setDate(end.getDate() + 1);

                await db.deleteUserGameHistoryByHn({
                    hn: patientCode,
                    playedFrom: start.toISOString(),
                    playedTo: end.toISOString(),
                });

                await showPopup({
                    title: "ลบประวัติสำเร็จ",
                    message: "ระบบลบประวัติการเล่นของวันนี้เรียบร้อยแล้ว",
                    confirmText: "รับทราบ",
                    icon: "check_circle",
                });
            },
            // Test-only shortcut: writes fake completed history rows for games and rest only.
            onTestCompleteAll: async ({ nodes = [], playedFrom = null, playedTo = null } = {}) => {
                if (!patientCode) {
                    await showPopup({
                        title: "ไม่พบผู้เล่น",
                        message: "ยังไม่พบข้อมูลผู้เล่นที่กำลังใช้งาน จึงไม่สามารถบันทึกประวัติได้",
                        confirmText: "รับทราบ",
                        icon: "warning",
                    });
                    return;
                }

                const playableNodes = (Array.isArray(nodes) ? nodes : [])
                    .filter((node) => ["game", "rest"].includes(node?.type));

                if (!playableNodes.length) {
                    await showPopup({
                        title: "ไม่พบรายการเกม",
                        message: "ยังไม่มีรายการภารกิจประจำวันที่ใช้บันทึกข้อมูลทดสอบได้",
                        confirmText: "รับทราบ",
                        icon: "info",
                    });
                    return;
                }

                const hasConfirmed = await showPopup({
                    title: "บันทึกว่าเล่นครบทั้งหมด",
                    message: "ระบบจะเพิ่มประวัติทดสอบของวันนี้ให้ครบทุกเกม รวมจุดพัก โดยไม่บันทึกเช็คชื่อ",
                    confirmText: "ตกลง",
                    cancelText: "ยกเลิก",
                    icon: "checklist",
                });

                if (!hasConfirmed) {
                    return;
                }

                const parsedFrom = playedFrom ? new Date(playedFrom) : null;
                const parsedTo = playedTo ? new Date(playedTo) : null;
                const intervalMs = 2000;
                let baseTime = new Date();
                baseTime.setMilliseconds(0);

                if (parsedFrom && !Number.isNaN(parsedFrom.getTime()) && baseTime < parsedFrom) {
                    baseTime = new Date(parsedFrom);
                }

                if (parsedTo && !Number.isNaN(parsedTo.getTime())) {
                    const latestBaseTime = parsedTo.getTime() - (playableNodes.length * intervalMs) - 1000;
                    if (baseTime.getTime() > latestBaseTime) {
                        const minimumBaseTime = parsedFrom && !Number.isNaN(parsedFrom.getTime())
                            ? parsedFrom.getTime()
                            : latestBaseTime;
                        baseTime = new Date(Math.max(minimumBaseTime, latestBaseTime));
                    }
                }

                for (const [index, node] of playableNodes.entries()) {
                    const startAt = new Date(baseTime.getTime() + (index * intervalMs));
                    const endAt = node.type === "game"
                        ? new Date(startAt.getTime() + 1000)
                        : null;

                    await db.addUserGameHistory({
                        hn: patientCode,
                        gid: node.gid,
                        stage: node.stage ?? null,
                        startAt: startAt.toISOString(),
                        endAt: endAt ? endAt.toISOString() : null,
                        userGameDataId: null,
                        rest: node.type === "rest",
                        checkIn: false,
                        reuseExisting: false,
                    });
                }

                SessionStorageManager.delete(PENDING_GAME_LAUNCH_KEY);
                writePendingGameHistoryMap({});

                await showPopup({
                    title: "บันทึกสำเร็จ",
                    message: "ระบบเพิ่มประวัติทดสอบว่าเล่นเกมครบทั้งหมดแล้ว",
                    confirmText: "รับทราบ",
                    icon: "check_circle",
                });
            },
            // Test-only placeholder: daily game data management tools will be wired here later.
            onTestDailyDataTools: async () => {
                navigateTo(ROUTES.dailyPresetTool);
            },
            onCheckInNode: async () => {
                await db.addUserGameHistory({
                    hn: patientCode,
                    gid: null,
                    startAt: new Date().toISOString(),
                    userGameDataId: null,
                    rest: false,
                    checkIn: true,
                });

                navigateTo(ROUTES.checkInSummary);
                return { redirected: true };
            },
            // Test-only hub control: leaves the patient/admin test session from this screen.
            onTestLogout: async () => {
                const hasConfirmed = await showPopup({
                    title: "ยืนยันการออกจากระบบ",
                    message: "ต้องการออกจากระบบผู้ดูแลและกลับไปยังหน้าเกมใช่หรือไม่",
                    confirmText: "ตกลง",
                    cancelText: "ยกเลิก",
                    icon: "logout",
                    tone: "error",
                });

                if (!hasConfirmed) {
                    return;
                }

                clearPatientClientState();

                try {
                    await db.signOut();
                } catch (error) {
                    console.warn("Unable to sign out Supabase session:", error);
                }

                navigateTo(ROUTES.login);
            },
        });
    };

    const showTestGameHub = async (options = {}) => {
        if (!uiRoot || !gameContainer) {
            return;
        }

        EventBus.emit("minigame:hide-hud");

        document.body.classList.remove("game-mode");
        document.body.classList.add("hub-mode");
        document.body.classList.remove("landing-mode");
        app?.classList.remove("game-mode");
        app?.classList.add("hub-mode");
        app?.classList.remove("landing-mode");
        destroyActiveGame();
        gameContainer.classList.add("game-container--hidden");
        showUiRoot();

        await renderTestGameHubScreen(uiRoot, {
            loadGamesByCategory: (categoryId, pageOptions) => db.getGamesByMciGroup(categoryId, pageOptions),
            initialScene: options.initialScene,
            initialCategory: options.initialCategory,
            sharedState: testGameHubUiState,
            onStateChange: ({ scene, activeCategory }) => {
                navigateTo(getTestGameHubRouteHash({
                    scene,
                    category: activeCategory,
                }), { replace: true });
            },
            onLaunchGame: async (selectedGame) => {
                const selectedGid = String(selectedGame?.gid || "").trim();
                if (!selectedGid) {
                    return;
                }

                persistSelectedGame(selectedGame);
                SessionStorageManager.save(TEST_GAME_HUB_LAUNCH_GID_KEY, selectedGid);
                SessionStorageManager.delete(PENDING_GAME_LAUNCH_KEY);
                removePendingGameHistoryByKey(getGameHistoryNodeKey(selectedGame));
                navigateTo(getGameRouteHash(selectedGame));
            },
        });
    };

    const showDailyPresetTool = async () => {
        if (!uiRoot || !gameContainer) {
            return;
        }

        document.body.classList.remove("game-mode");
        document.body.classList.remove("landing-mode");
        document.body.classList.add("hub-mode");
        app?.classList.remove("game-mode");
        app?.classList.remove("landing-mode");
        app?.classList.add("hub-mode");
        destroyActiveGame();
        gameContainer.classList.add("game-container--hidden");
        showUiRoot();

        const renderPresetToolView = (presetOptions = {}) => renderDailyPresetTool(uiRoot, {
            ...presetOptions,
            onBack: () => navigateTo(ROUTES.hub),
            onOpenPreset: (preset) => {
                const presetId = String(preset?.id || "preset-1").trim();
                navigateTo(`${ROUTES.dailyPresetTool}/${encodeURIComponent(presetId)}`);
            },
            onAddPreset: () => {
                navigateTo(`${ROUTES.dailyPresetTool}/new`);
            },
        });

        renderPresetToolView({ presets: [], isLoading: true });

        try {
            const presets = await getGameLevelPresetLists();
            renderPresetToolView({ presets });
        } catch (error) {
            console.error("Failed to load daily preset list:", error);
            renderPresetToolView({
                presets: [],
                errorMessage: "ไม่สามารถโหลด preset ได้",
            });
        }
    };

    const showDailyPresetEditor = async (presetId = "new") => {
        if (!uiRoot || !gameContainer) {
            return;
        }

        document.body.classList.remove("game-mode");
        document.body.classList.remove("landing-mode");
        document.body.classList.add("hub-mode");
        app?.classList.remove("game-mode");
        app?.classList.remove("landing-mode");
        app?.classList.add("hub-mode");
        destroyActiveGame();
        gameContainer.classList.add("game-container--hidden");
        showUiRoot();

        const isNewPreset = presetId === "new";
        let preset = {
            id: null,
            name: "Preset",
            isNew: true,
        };
        // Future editor metadata flags: default them here, pass them into
        // renderDailyPresetEditor, and forward them to saveGameLevelPreset.
        let presetEditorData = {
            rows: null,
            stageFields: null,
            hasDailyGoal: false,
            hasDailyLoop: false,
        };

        if (!isNewPreset) {
            try {
                presetEditorData = await getGameLevelPresetEditorData(presetId);
                preset = presetEditorData.preset;
            } catch (error) {
                console.error("Failed to load daily preset:", error);
                await showPopup({
                    title: "โหลด Preset ไม่สำเร็จ",
                    message: "ไม่สามารถโหลดข้อมูล preset นี้ได้",
                    confirmText: "กลับ",
                    icon: "error",
                    tone: "error",
                });
                navigateTo(ROUTES.dailyPresetTool);
                return;
            }
        }

        let gameOptions = [];
        try {
            gameOptions = await getGameListOptions();
        } catch (error) {
            console.error("Failed to load game list options:", error);
            await showPopup({
                title: "โหลดรายชื่อเกมไม่สำเร็จ",
                message: "ไม่สามารถโหลดรายชื่อเกมสำหรับ preset ได้",
                confirmText: "รับทราบ",
                icon: "error",
                tone: "error",
            });
        }

        renderDailyPresetEditor(uiRoot, {
            preset,
            gameOptions,
            initialRows: presetEditorData.rows,
            initialStageFields: presetEditorData.stageFields,
            initialHasDailyGoal: presetEditorData.hasDailyGoal,
            initialHasDailyLoop: presetEditorData.hasDailyLoop,
            onBack: () => navigateTo(ROUTES.dailyPresetTool),
            onSavePreset: async (presetData) => {
                const name = String(presetData.name || "").trim();
                if (!name) {
                    await showPopup({
                        title: "กรุณากรอกชื่อ preset",
                        message: "ต้องมีชื่อ preset ก่อนบันทึก",
                        confirmText: "รับทราบ",
                        icon: "edit",
                    });
                    return;
                }

                try {
                    const savedPreset = await saveGameLevelPreset({
                        id: presetData.isNew ? null : presetData.id,
                        name,
                        rowData: presetData.rowData,
                        rows: presetData.rowData,
                        stageFields: presetData.stageFields,
                        hasDailyGoal: presetData.hasDailyGoal,
                        hasDailyLoop: presetData.hasDailyLoop,
                    });

                    await showPopup({
                        title: "บันทึก Preset แล้ว",
                        message: "บันทึก preset ลง database เรียบร้อยแล้ว",
                        confirmText: "ตกลง",
                        icon: "check_circle",
                    });
                    navigateTo(`${ROUTES.dailyPresetTool}/${encodeURIComponent(savedPreset.id)}`);
                } catch (error) {
                    console.error("Failed to save daily preset:", error);
                    await showPopup({
                        title: "บันทึกไม่สำเร็จ",
                        message: "ไม่สามารถบันทึก preset ได้",
                        confirmText: "รับทราบ",
                        icon: "error",
                        tone: "error",
                    });
                }
            },
            onDeletePreset: async (presetData) => {
                if (!presetData?.id) {
                    return;
                }

                const hasConfirmed = await showPopup({
                    title: "ลบ Preset",
                    message: `ต้องการลบ preset "${presetData.name}" ใช่หรือไม่`,
                    confirmText: "ลบ",
                    cancelText: "ยกเลิก",
                    icon: "delete",
                    tone: "error",
                });

                if (!hasConfirmed) {
                    return;
                }

                try {
                    await deleteGameLevelPresetList(presetData.id);
                    navigateTo(ROUTES.dailyPresetTool);
                } catch (error) {
                    console.error("Failed to delete daily preset:", error);
                    await showPopup({
                        title: "ลบไม่สำเร็จ",
                        message: "ไม่สามารถลบ preset ได้",
                        confirmText: "รับทราบ",
                        icon: "error",
                        tone: "error",
                    });
                }
            },
        });
    };

    const showCheckInSummary = async () => {
        if (!uiRoot || !gameContainer) {
            return;
        }

        document.body.classList.remove("game-mode");
        document.body.classList.remove("landing-mode");
        document.body.classList.add("hub-mode");
        app?.classList.remove("game-mode");
        app?.classList.remove("landing-mode");
        app?.classList.add("hub-mode");
        destroyActiveGame();
        gameContainer.classList.add("game-container--hidden");
        showUiRoot();

        const rememberedPatient = getPatientSessionCookie();
        const patientCode = String(rememberedPatient?.patientCode || SessionStorageManager.get(PATIENT_LOGIN_ID_KEY, "") || "").trim();

        if (!patientCode) {
            navigateTo(ROUTES.login, { replace: true });
            return;
        }

        let checkInDates = [];
        let programStartedAt = rememberedPatient?.startedProgram || rememberedPatient?.started_program || "";
        try {
            if (!programStartedAt) {
                const patient = await db.getPatientByHn(patientCode);
                programStartedAt = patient?.started_program || patient?.startedProgram || "";
            }

            const { playedFrom } = getProgramDateRange(programStartedAt || new Date());
            const { playedTo } = getProgramDateRange(new Date());
            checkInDates = await db.getUserCheckInDatesByHn({
                hn: patientCode,
                playedFrom,
                playedTo,
            });
        } catch (error) {
            console.warn("Unable to load check-in dates:", error);
        }

        renderCheckInSummaryScreen(uiRoot, {
            checkInDates,
            programStartedAt: programStartedAt || new Date(),
            defaultDayCount: 14,
            onBackHome: () => {
                navigateTo(ROUTES.hub);
            },
        });
    };

    const showGame = async (selectedGame) => {
        if (!gameContainer || !uiRoot) {
            return false;
        }

        const { parsedName, slug, loader } = resolveGameModuleLoader(selectedGame?.name);
        currentGameSlug = slug || null;

        if (!parsedName) {
            await showPopup({
                title: "ข้อมูลเกมไม่ครบ",
                message: "ไม่พบชื่อเกมที่ใช้สำหรับเปิดเกมนี้ กรุณาตรวจสอบข้อมูลในฐานข้อมูล",
                confirmText: "รับทราบ",
                icon: "warning",
                tone: "error",
            });
            return false;
        }

        if (!loader) {
            await showPopup({
                title: "ยังไม่สามารถโหลดเกมได้",
                message: `เกม ${parsedName} มีอยู่ในฐานข้อมูลแล้ว แต่ยังไม่มีไฟล์เกมในระบบตอนนี้`,
                confirmText: "รับทราบ",
                icon: "stadia_controller",
                tone: "error",
            });
            return false;
        }

        let module;
        try {
            module = await loader();
        } catch (error) {
            console.error(`Unable to import game module for ${parsedName}:`, error);
            await showPopup({
                title: "โหลดเกมไม่สำเร็จ",
                message: `ระบบไม่สามารถเปิดเกม ${parsedName} ได้ในตอนนี้ กรุณาลองใหม่อีกครั้ง`,
                confirmText: "ปิด",
                icon: "error",
                tone: "error",
            });
            return false;
        }

        const startGame = module?.StartGame || module?.default;
        if (typeof startGame !== "function") {
            await showPopup({
                title: "ไฟล์เกมไม่สมบูรณ์",
                message: `เกม ${parsedName} ถูกพบในระบบ แต่ไม่มีฟังก์ชันเริ่มเกมที่เรียกใช้งานได้`,
                confirmText: "รับทราบ",
                icon: "warning",
                tone: "error",
            });
            return false;
        }

        document.body.classList.add("game-mode");
        document.body.classList.remove("hub-mode");
        document.body.classList.remove("landing-mode");
        app?.classList.add("game-mode");
        app?.classList.remove("hub-mode");
        app?.classList.remove("landing-mode");
        hideUiRoot();
        destroyActiveGame();
        gameContainer.classList.remove("game-container--hidden");

        try {
            activeGameInstance = await startGame("game-container");

            // Mount Minigame HUD
            uiRoot.innerHTML = "";
            uiRoot.hidden = false;
            const hud = new MinigameHUD(uiRoot, {
                gameTitle: selectedGame?.name,
                gameSlug: slug,
                timeLimit: selectedGame?.time_limit || 60, // Fallback
                showTimer: slug !== "zoo-detective",
            });
            hud.render();
            let activeResultPanel = null;

            // --- Back button guard for minigames ---
            const isBackProtected = BACK_BUTTON_PROTECTED_SLUGS.has(slug);

            const installBackGuard = () => {
                if (!isBackProtected || isBackGuardActive) {
                    return;
                }
                isBackGuardActive = true;
                backGuardSelectedGame = selectedGame;
                backGuardCleanup = cleanup;

                // Push a sentinel history entry with the exact same URL.
                // If the current history state is ALREADY the sentinel (e.g. after a page reload),
                // we don't need to push another one.
                if (window.history.state && window.history.state.__backGuard) {
                    return;
                }
                window.history.pushState({ __backGuard: true }, "", window.location.href);
            };

            const removeBackGuard = () => {
                isBackGuardActive = false;
                backGuardSelectedGame = null;
                backGuardCleanup = null;
                isBackGuardBlocking = false;
            };



            const handleExit = async (eventData = {}) => {
                const colors = eventData?.colors || activeThemeColors || GAME_COLORS[slug] || {};
                const confirmed = await showGameExitPopup({
                    confirmText: "ออก",
                    panelBorderColor: colors.border,
                    panelHeaderColor: colors.header,
                    primaryFontColor: colors.textPrimary,
                    secondaryFontColor: colors.textSecondary,
                });

                if (confirmed) {
                    cleanup();
                    navigateTo(getGameExitRoute(selectedGame));
                }
            };

            const handleGameOver = async ({ score, level: eventLevel, panelBorderColor = null, panelHeaderColor = null, resultImage = null }) => {
                const gid = String(selectedGame?.gid || "").trim();
                const historyMap = readPendingGameHistoryMap();
                const pendingHistory = historyMap[gid];

                activeResultPanel?.destroy();
                activeResultPanel = new MinigameResultPanel(uiRoot, {
                    score,
                    highScore: StorageManager.get("highscore", 0),
                    gameTitle: selectedGame?.name,
                    panelBorderColor,
                    panelHeaderColor,
                    resultImage,
                });
                activeResultPanel.render();

                if (pendingHistory) {
                    try {
                        const level = Number(eventLevel || selectedGame?.level || 1);
                        await MiniGameDBUtil.pushGameData(
                            score,
                            level,
                            pendingHistory.startAt,
                            new Date().toISOString(),
                        );
                        console.log(`Successfully saved score ${score} for game ${gid} at level ${level}`);
                    } catch (error) {
                        console.error("Failed to save game result to database:", error);
                    }
                }
            };

            const handleLevelSelect = () => {
                cleanup();
                showGame(selectedGame);
            };

            const handleRetry = () => {
                handleLevelSelect();
            };

            const handleExitConfirmed = () => {
                cleanup();
                navigateTo(getGameExitRoute(selectedGame));
            };

            const cleanup = () => {
                removeBackGuard();
                EventBus.off("minigame:exit-request", handleExit);
                EventBus.off("minigame:game-over", handleGameOver);
                EventBus.off("minigame:retry-request", handleRetry);
                EventBus.off("minigame:level-select-request", handleLevelSelect);
                EventBus.off("minigame:exit-confirmed", handleExitConfirmed);
                activeResultPanel?.destroy();
                activeResultPanel = null;
                hud.destroy();
            };

            installBackGuard();

            EventBus.on("minigame:exit-request", handleExit);
            EventBus.on("minigame:game-over", handleGameOver);
            EventBus.on("minigame:retry-request", handleRetry);
            EventBus.on("minigame:level-select-request", handleLevelSelect);
            EventBus.on("minigame:exit-confirmed", handleExitConfirmed);

            return true;
        } catch (error) {
            console.error(`Unable to start game ${parsedName}:`, error);
            document.body.classList.remove("game-mode");
            document.body.classList.remove("hub-mode");
            document.body.classList.remove("landing-mode");
            app?.classList.remove("game-mode");
            app?.classList.remove("hub-mode");
            app?.classList.remove("landing-mode");
            gameContainer.classList.add("game-container--hidden");
            destroyActiveGame();

            await showPopup({
                title: "เปิดเกมไม่สำเร็จ",
                message: `ระบบพบไฟล์ของเกม ${parsedName} แล้ว แต่เกิดข้อผิดพลาดระหว่างเริ่มเกม`,
                confirmText: "รับทราบ",
                icon: "error",
                tone: "error",
            });
            return false;
        }
    };

    const showSignup = async ({ patientCode = "" } = {}) => {
        document.body.classList.remove("landing-mode");
        document.body.classList.remove("hub-mode");
        app?.classList.remove("landing-mode");
        app?.classList.remove("hub-mode");
        showUiRoot();

        let educationLevels = [];
        let educationLevelsError = "";

        try {
            educationLevels = await db.getEducationLevels();
            if (!educationLevels.length) {
                educationLevelsError = "ไม่พบข้อมูลระดับการศึกษา";
            }
        } catch (error) {
            console.error("Unable to load education levels:", error);
            educationLevelsError = "ไม่สามารถโหลดรายการระดับการศึกษาได้";
        }

        renderSignupScreen(uiRoot, {
            initialHn: patientCode,
            educationLevels,
            educationLevelsError,
            onBack: () => navigateTo(ROUTES.login),
            onSubmit: async (formData) => {
                const patientCodeLabel = `ID ${String(formData?.hn || "").trim()}`;
                const shouldCreatePatient = await showPopup({
                    title: "ยืนยันการลงทะเบียน",
                    message: `ต้องการสร้างข้อมูลผู้เล่นเลข ${patientCodeLabel} ใช่หรือไม่`,
                    confirmText: "ยืนยัน",
                    cancelText: "ยกเลิก",
                    icon: "how_to_reg",
                });

                if (!shouldCreatePatient) {
                    return false;
                }

                await db.validatePatientSignupDependencies(formData);
                const createdPatient = await db.createPatientProfile(formData);

                try {
                    await db.createUserGameProfile({ hn: createdPatient?.hn || formData?.hn });
                } catch (error) {
                    // TODO: Replace this client-side compensation with a Supabase RPC transaction
                    // that creates user_data and user_game_profile_data atomically.
                    console.error("Unable to create user game profile after patient signup:", error);
                    try {
                        await db.deletePatientProfileByHn({ hn: createdPatient?.hn || formData?.hn });
                    } catch (rollbackError) {
                        console.error("Unable to rollback patient after game profile failure:", rollbackError);
                    }
                    throw error;
                }

                await rememberPatientSession(createdPatient);
                SessionStorageManager.save(PATIENT_LOGIN_ID_KEY, String(formData?.hn || "").trim());
                SessionStorageManager.delete(PATIENT_SIGNUP_DRAFT_KEY);
                navigateTo(ROUTES.hub);
            },
        });
    };

    const showLogin = ({ patientCode = "" } = {}) => {
        document.body.classList.remove("landing-mode");
        document.body.classList.remove("hub-mode");
        app?.classList.remove("landing-mode");
        app?.classList.remove("hub-mode");
        showUiRoot();
        renderLoginScreen(uiRoot, {
            initialPatientCode: patientCode,
            onAccept: async ({ patientId: acceptedId }) => {
                const patient = await db.getPatientByHn(acceptedId);
                SessionStorageManager.save(PATIENT_LOGIN_ID_KEY, acceptedId);

                if (patient) {
                    await rememberPatientSession(patient);
                    SessionStorageManager.delete(PATIENT_SIGNUP_DRAFT_KEY);
                    edgeFunction.logUserEvent(acceptedId, "user.login").catch(() => { });
                    navigateTo(ROUTES.hub);
                    return;
                }

                const patientCodeLabel = `ID ${acceptedId}`;
                const shouldCreatePatient = await showPopup({
                    title: "ไม่พบเลข ID",
                    message: `ไม่พบข้อมูลผู้เล่นเลข ${patientCodeLabel} ต้องการลงทะเบียนผู้เล่นใหม่หรือไม่`,
                    confirmText: "ตกลง",
                    cancelText: "ยกเลิก",
                    icon: "person_add",
                });

                if (!shouldCreatePatient) {
                    return false;
                }

                navigateTo(ROUTES.signup);
            },
        });
    };

    const showAdminLogin = () => {
        if (!uiRoot || !gameContainer) {
            return;
        }

        document.body.classList.remove("game-mode");
        document.body.classList.remove("hub-mode");
        document.body.classList.remove("landing-mode");
        app?.classList.remove("game-mode");
        app?.classList.remove("hub-mode");
        app?.classList.remove("landing-mode");
        destroyActiveGame();
        gameContainer.classList.add("game-container--hidden");
        showUiRoot();

        renderAdminLoginScreen(uiRoot, {
            onSubmit: async ({ email, password }) => {
                try {
                    await db.login(email, password);
                } catch (error) {
                    const errorMessage = String(error?.message || "").toLowerCase();
                    if (
                        errorMessage.includes("invalid login credentials")
                        || errorMessage.includes("email not confirmed")
                        || errorMessage.includes("email")
                        || errorMessage.includes("password")
                    ) {
                        await showPopup({
                            title: "เข้าสู่ระบบไม่สำเร็จ",
                            message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
                            confirmText: "ลองอีกครั้ง",
                            icon: "lock",
                            tone: "error",
                        });
                        return false;
                    }

                    console.warn("Unable to sign in admin:", error);
                    await showPopup({
                        title: "เข้าสู่ระบบไม่สำเร็จ",
                        message: "ไม่สามารถเข้าสู่ระบบผู้ดูแลได้ในขณะนี้",
                        confirmText: "รับทราบ",
                        icon: "error",
                        tone: "error",
                    });
                    return false;
                }

                navigateTo(ROUTES.playerInfo);
                return true;
            },
        });
    };

    const showPlayerInfo = async () => {
        if (!uiRoot || !gameContainer) {
            return;
        }

        document.body.classList.remove("game-mode");
        document.body.classList.remove("hub-mode");
        document.body.classList.remove("landing-mode");
        app?.classList.remove("game-mode");
        app?.classList.remove("hub-mode");
        app?.classList.remove("landing-mode");
        destroyActiveGame();
        gameContainer.classList.add("game-container--hidden");
        showUiRoot();

        const rememberedPatient = getPatientSessionCookie();
        let player = rememberedPatient || {};
        let playerProgram = null;
        let testGames = [];
        let testProgramPresets = [];

        if (rememberedPatient?.patientCode) {
            try {
                const patient = await db.getPatientByHn(rememberedPatient.patientCode);
                if (patient) {
                    player = patient;
                }
            } catch (error) {
                console.warn("Unable to load player info:", error);
            }
        }

        try {
            const educationLevels = await db.getEducationLevels();
            const educationLevelMap = new Map(
                educationLevels.map((level) => [String(level?.eduid || "").trim(), String(level?.name || "").trim()]),
            );
            const educationLevelId = String(player?.education_level || player?.educationLevel || "").trim();

            if (educationLevelId && educationLevelMap.has(educationLevelId)) {
                player = {
                    ...player,
                    educationName: educationLevelMap.get(educationLevelId) || educationLevelId,
                };
            }
        } catch (error) {
            console.warn("Unable to load education levels for player info:", error);
        }

        const playerHn = String(player?.hn || rememberedPatient?.patientCode || "").trim();
        if (playerHn) {
            try {
                playerProgram = await db.getDailyGameProgramByHn({
                    hn: playerHn,
                    windowBefore: 0,
                    windowAfter: 0,
                });
            } catch (error) {
                console.warn("Unable to load player program date info:", error);
            }
        }

        try {
            const [
                gameListItems,
                programPresets,
            ] = await Promise.all([
                db.getGameList(),
                db.getGameLevelPresetList(),
            ]);
            testGames = Array.isArray(gameListItems) ? gameListItems : [];
            testProgramPresets = Array.isArray(programPresets) ? programPresets : [];
        } catch (error) {
            console.warn("Unable to load player info test menu data:", error);
        }

        renderPlayerInfoScreen(uiRoot, {
            player,
            programDayCount: playerProgram?.programDayCount ?? null,
            programEndedAt: playerProgram?.programEndDate || "",
            testGames,
            testProgramPresets,
            activeProgramId: playerProgram?.programId ?? null,
            onBack: async () => {
                const hasConfirmed = await showPopup({
                    title: "กลับไปหน้าเกม",
                    message: "ต้องการออกจากระบบผู้ดูแลและกลับไปหน้าเกมของผู้เล่นใช่หรือไม่",
                    confirmText: "ตกลง",
                    cancelText: "ยกเลิก",
                    icon: "arrow_back",
                    tone: "error",
                });

                if (!hasConfirmed) {
                    return;
                }

                try {
                    await db.signOut();
                    await db.initAuth();
                } catch (error) {
                    console.warn("Unable to sign out admin session:", error);
                    await showPopup({
                        title: "ออกจากระบบไม่สำเร็จ",
                        message: "ระบบยังไม่สามารถออกจากระบบผู้ดูแลได้ กรุณาลองใหม่อีกครั้ง",
                        confirmText: "รับทราบ",
                        icon: "error",
                        tone: "error",
                    });
                    return;
                }

                navigateTo(ROUTES.hub);
            },
            onEndProgram: async () => {
                await showPopup({
                    title: "จบโปรแกรม",
                    message: "ฟังก์ชันจบโปรแกรมจะถูกเชื่อมต่อในขั้นตอนถัดไป",
                    confirmText: "รับทราบ",
                    icon: "flag",
                });
            },
            onLogout: async () => {
                const hasConfirmed = await showPopup({
                    title: "ยืนยันการออกจากระบบ",
                    message: "ต้องการออกจากระบบผู้ดูแลและผู้เล่น แล้วกลับไปหน้าเข้าสู่ระบบใช่หรือไม่",
                    confirmText: "ตกลง",
                    cancelText: "ยกเลิก",
                    icon: "logout",
                    tone: "error",
                });

                if (!hasConfirmed) {
                    return;
                }

                try {
                    await db.signOut();
                } catch (error) {
                    console.warn("Unable to sign out admin session:", error);
                    await showPopup({
                        title: "ออกจากระบบไม่สำเร็จ",
                        message: "ระบบยังไม่สามารถออกจากระบบผู้ดูแลได้ กรุณาลองใหม่อีกครั้ง",
                        confirmText: "รับทราบ",
                        icon: "error",
                        tone: "error",
                    });
                    return;
                }

                clearPatientClientState();
                navigateTo(ROUTES.login);
            },
            onTestQuickLaunchGame: async (selectedGame) => {
                const selectedGid = String(selectedGame?.gid || "").trim();
                if (!selectedGid) {
                    return;
                }

                const launchMode = await showPopup({
                    title: "เปิดเกมทดสอบ",
                    message: `เลือกวิธีเปิดเกม ${getGameDisplayName(selectedGame)}`,
                    icon: "sports_esports",
                    actions: [
                        { value: "cancel", label: "ยกเลิก", variant: "outlined" },
                        { value: "no-history", label: "เปิดเกมไม่เก็บประวัติ", variant: "outlined" },
                        { value: "with-history", label: "เปิดเกมเก็บประวัติ", variant: "filled" },
                    ],
                });

                if (launchMode === "cancel" || !launchMode) {
                    return;
                }

                if (launchMode === "with-history") {
                    const selectedNodeKey = getGameHistoryNodeKey(selectedGame);
                    try {
                        const startedAt = new Date().toISOString();
                        const historyRecord = await db.addUserGameHistory({
                            hn: playerHn,
                            gid: selectedGid,
                            stage: selectedGame?.stage ?? null,
                            startAt: startedAt,
                            userGameDataId: null,
                        });

                        if (!historyRecord?.id) {
                            throw new Error("Missing user_game_history id");
                        }

                        setPendingGameHistoryByKey(selectedNodeKey, selectedGame, historyRecord, startedAt);
                        persistSelectedGame(selectedGame);
                        SessionStorageManager.delete(TEST_GAME_HUB_LAUNCH_GID_KEY);
                        SessionStorageManager.save(PENDING_GAME_LAUNCH_KEY, selectedNodeKey);
                        navigateTo(getGameRouteHash(selectedGame));
                        return;
                    } catch (error) {
                        console.warn("Unable to write test launch history:", error);
                        await showPopup({
                            title: "บันทึกประวัติไม่สำเร็จ",
                            message: "ระบบยังไม่สามารถบันทึกประวัติการเล่นเกมทดสอบลงฐานข้อมูลได้",
                            confirmText: "รับทราบ",
                            icon: "error",
                            tone: "error",
                        });
                        return;
                    }
                }

                persistSelectedGame(selectedGame);
                SessionStorageManager.delete(TEST_GAME_HUB_LAUNCH_GID_KEY);
                SessionStorageManager.delete(PENDING_GAME_LAUNCH_KEY);
                removePendingGameHistoryByKey(getGameHistoryNodeKey(selectedGame));
                navigateTo(getGameRouteHash(selectedGame));
            },
            onTestChangeProgram: async () => {
                await showPopup({
                    title: "เปลี่ยนโปรแกรมผู้ใช้",
                    message: "ฟังก์ชันนี้ยังไม่ได้เชื่อมต่อกับหน้าโปรไฟล์ผู้เล่น",
                    confirmText: "รับทราบ",
                    icon: "assignment",
                });
            },
            onTestClearTodayHistory: async () => {
                if (!playerHn) {
                    await showPopup({
                        title: "ไม่พบผู้เล่น",
                        message: "ยังไม่พบข้อมูลผู้เล่นที่กำลังใช้งาน จึงไม่สามารถลบประวัติได้",
                        confirmText: "รับทราบ",
                        icon: "warning",
                    });
                    return;
                }

                const hasConfirmed = await showPopup({
                    title: "ยืนยันการลบประวัติ",
                    message: "ต้องการลบประวัติการเล่นทั้งหมดของวันนี้ใช่หรือไม่",
                    confirmText: "ตกลง",
                    cancelText: "ยกเลิก",
                    icon: "delete",
                    tone: "error",
                });

                if (!hasConfirmed) {
                    return;
                }

                const start = new Date();
                start.setHours(0, 0, 0, 0);
                const end = new Date(start);
                end.setDate(end.getDate() + 1);

                await db.deleteUserGameHistoryByHn({
                    hn: playerHn,
                    playedFrom: start.toISOString(),
                    playedTo: end.toISOString(),
                });

                await showPopup({
                    title: "ลบประวัติสำเร็จ",
                    message: "ระบบลบประวัติการเล่นของวันนี้เรียบร้อยแล้ว",
                    confirmText: "รับทราบ",
                    icon: "check_circle",
                });
            },
            onTestCompleteAll: async () => {
                if (!playerHn) {
                    await showPopup({
                        title: "ไม่พบผู้เล่น",
                        message: "ยังไม่พบข้อมูลผู้เล่นที่กำลังใช้งาน จึงไม่สามารถบันทึกประวัติได้",
                        confirmText: "รับทราบ",
                        icon: "warning",
                    });
                    return;
                }

                const dailyProgram = playerProgram || await db.getDailyGameProgramByHn({
                    hn: playerHn,
                    windowBefore: 0,
                    windowAfter: 0,
                });
                const currentDay = Number(dailyProgram?.programDay || 1);
                const dayItem = (dailyProgram?.days || []).find((item) => Number(item?.day) === currentDay);
                const dailyGames = Array.isArray(dayItem?.games)
                    ? dayItem.games
                    : Array.isArray(dailyProgram?.games)
                        ? dailyProgram.games
                        : [];
                const gameNodes = dailyGames
                    .filter((game) => {
                        const gid = String(game?.gid || "").trim();
                        return gid && gid !== "REST001";
                    })
                    .map((game, index) => ({
                        type: "game",
                        gid: String(game.gid || "").trim(),
                        stage: game?.stage == null || game?.stage === "" ? null : Number(game.stage),
                        order: index,
                    }));
                const splitIndex = Math.ceil(gameNodes.length / 2);
                const playableNodes = [
                    ...gameNodes.slice(0, splitIndex),
                    ...(gameNodes.length ? [{ type: "rest", gid: "REST001", stage: null }] : []),
                    ...gameNodes.slice(splitIndex),
                ];

                if (!playableNodes.length) {
                    await showPopup({
                        title: "ไม่พบรายการเกม",
                        message: "ยังไม่มีรายการภารกิจประจำวันที่ใช้บันทึกข้อมูลทดสอบได้",
                        confirmText: "รับทราบ",
                        icon: "info",
                    });
                    return;
                }

                const hasConfirmed = await showPopup({
                    title: "บันทึกว่าเล่นครบทั้งหมด",
                    message: "ระบบจะเพิ่มประวัติทดสอบของวันนี้ให้ครบทุกเกม รวมจุดพัก โดยไม่บันทึกเช็คชื่อ",
                    confirmText: "ตกลง",
                    cancelText: "ยกเลิก",
                    icon: "checklist",
                });

                if (!hasConfirmed) {
                    return;
                }

                const intervalMs = 2000;
                const baseTime = new Date();
                baseTime.setMilliseconds(0);

                for (const [index, node] of playableNodes.entries()) {
                    const startAt = new Date(baseTime.getTime() + (index * intervalMs));
                    const endAt = node.type === "game"
                        ? new Date(startAt.getTime() + 1000)
                        : null;

                    await db.addUserGameHistory({
                        hn: playerHn,
                        gid: node.gid,
                        stage: node.stage ?? null,
                        startAt: startAt.toISOString(),
                        endAt: endAt ? endAt.toISOString() : null,
                        userGameDataId: null,
                        rest: node.type === "rest",
                        checkIn: false,
                        reuseExisting: false,
                    });
                }

                SessionStorageManager.delete(PENDING_GAME_LAUNCH_KEY);
                writePendingGameHistoryMap({});

                await showPopup({
                    title: "บันทึกสำเร็จ",
                    message: "ระบบเพิ่มประวัติทดสอบว่าเล่นเกมครบทั้งหมดแล้ว",
                    confirmText: "รับทราบ",
                    icon: "check_circle",
                });
            },
            onTestDailyDataTools: async () => {
                navigateTo(ROUTES.dailyPresetTool);
            },
            onTestLogout: async () => {
                const hasConfirmed = await showPopup({
                    title: "ยืนยันการออกจากระบบ",
                    message: "ต้องการออกจากระบบผู้ดูแลและกลับไปยังหน้าเกมใช่หรือไม่",
                    confirmText: "ตกลง",
                    cancelText: "ยกเลิก",
                    icon: "logout",
                    tone: "error",
                });

                if (!hasConfirmed) {
                    return;
                }

                clearPatientClientState();

                try {
                    await db.signOut();
                } catch (error) {
                    console.warn("Unable to sign out Supabase session:", error);
                }

                navigateTo(ROUTES.login);
            },
            onExport: async (exportPlayer, { exportTypes, exportScope } = {}) => {
                const wantsPlayerExport = exportTypes?.includes(CsvExportType.Player);
                const wantsGameExport = exportTypes?.includes(CsvExportType.Game);
                const wantsHistoryExport = exportTypes?.includes(CsvExportType.History);

                if (!wantsPlayerExport && !wantsGameExport && !wantsHistoryExport) {
                    return false;
                }

                const exportedItems = [];

                if (exportScope === CsvExportScope.All) {
                    if (wantsPlayerExport) {
                        const players = await db.getAllPatientCsvExportRows();

                        if (players.length) {
                            downloadCsv(getPlayersCsvFilename(), buildPlayersCsv(players));
                            exportedItems.push(`ข้อมูลผู้เล่น ${players.length} คน`);
                        }
                    }

                    if (wantsGameExport) {
                        const gameRecords = await db.getGameCsvExportRows();

                        if (gameRecords.length) {
                            downloadCsv(getGamesCsvFilename(), buildGameCsv(gameRecords));
                            exportedItems.push(`ข้อมูลเกม ${gameRecords.length} record`);
                        }
                    }

                    if (wantsHistoryExport) {
                        const historyRecords = await db.getGameHistoryCsvExportRows();

                        if (historyRecords.length) {
                            downloadCsv(getGameHistoriesCsvFilename(), buildGameHistoryCsv(historyRecords));
                            exportedItems.push(`ประวัติการเล่นรายวัน ${historyRecords.length} record`);
                        }
                    }

                    if (!exportedItems.length) {
                        await showPopup({
                            title: "ส่งออกข้อมูล",
                            message: "ยังไม่มีข้อมูลสำหรับส่งออก",
                            confirmText: "รับทราบ",
                            icon: "download",
                        });
                        return false;
                    }

                    await showPopup({
                        title: "ส่งออกข้อมูล",
                        message: `ส่งออก${exportedItems.join(" และ ")}เป็นไฟล์ CSV เรียบร้อยแล้ว`,
                        confirmText: "รับทราบ",
                        icon: "download",
                    });
                    return true;
                }

                const missingItems = [];

                if (wantsPlayerExport) {
                    let programName = "";

                    try {
                        const programPresets = await db.getGameLevelPresetList();
                        const programId = Number(playerProgram?.programId);
                        programName = programPresets.find((preset) => Number(preset.id) === programId)?.name || "";
                    } catch (error) {
                        console.warn("Unable to load program preset name for CSV export:", error);
                    }

                    const csvContent = buildPlayerCsv(exportPlayer, {
                        educationName: exportPlayer.educationName,
                        programDayCount: playerProgram?.programDayCount ?? null,
                        programName,
                    });

                    downloadCsv(getPlayerCsvFilename(exportPlayer), csvContent);
                    exportedItems.push("ข้อมูลผู้เล่น");
                }

                if (wantsGameExport) {
                    const hn = String(exportPlayer.hn || exportPlayer.patientCode || "").trim();
                    const gameRecords = await db.getGameCsvExportRows({ hn });

                    if (!gameRecords.length) {
                        missingItems.push("ข้อมูลเกม");
                    } else {
                        downloadCsv(getGameCsvFilename(exportPlayer), buildGameCsv(gameRecords));
                        exportedItems.push(`ข้อมูลเกม ${gameRecords.length} record`);
                    }
                }

                if (wantsHistoryExport) {
                    const hn = String(exportPlayer.hn || exportPlayer.patientCode || "").trim();
                    const historyRecords = await db.getGameHistoryCsvExportRows({ hn });

                    if (!historyRecords.length) {
                        missingItems.push("ประวัติการเล่นรายวัน");
                    } else {
                        downloadCsv(getGameHistoryCsvFilename(exportPlayer), buildGameHistoryCsv(historyRecords));
                        exportedItems.push(`ประวัติการเล่นรายวัน ${historyRecords.length} record`);
                    }
                }

                if (!exportedItems.length) {
                    await showPopup({
                        title: "ส่งออกข้อมูล",
                        message: missingItems.length
                            ? `ยังไม่มี${missingItems.join(" และ ")}ของผู้เล่นคนนี้สำหรับส่งออก`
                            : "ยังไม่มีข้อมูลสำหรับส่งออก",
                        confirmText: "รับทราบ",
                        icon: "download",
                    });
                    return false;
                }

                await showPopup({
                    title: "ส่งออกข้อมูล",
                    message: missingItems.length
                        ? `ส่งออก${exportedItems.join(" และ ")}เป็นไฟล์ CSV เรียบร้อยแล้ว แต่ยังไม่มี${missingItems.join(" และ ")}ของผู้เล่นคนนี้`
                        : `ส่งออก${exportedItems.join(" และ ")}เป็นไฟล์ CSV เรียบร้อยแล้ว`,
                    confirmText: "รับทราบ",
                    icon: "download",
                });
                return true;
            },
        });
    };

    const showLeaderboard = async () => {
        if (!uiRoot || !gameContainer) {
            return;
        }

        EventBus.emit("minigame:hide-hud");

        document.body.classList.remove("game-mode");
        document.body.classList.add("hub-mode");
        document.body.classList.remove("landing-mode");
        app?.classList.remove("game-mode");
        app?.classList.add("hub-mode");
        app?.classList.remove("landing-mode");
        destroyActiveGame();
        gameContainer.classList.add("game-container--hidden");
        showUiRoot();

        const rememberedPatient = getPatientSessionCookie();
        const patientLabel = rememberedPatient ? getPatientSessionLabel(rememberedPatient) : "ผู้เล่น";
        const currentHn = String(rememberedPatient?.patientCode || "").trim() || null;
        const onBack = () => navigateTo(rememberedPatient ? ROUTES.hub : ROUTES.login);

        renderLeaderboardScreen(uiRoot, {
            patientLabel,
            onBack,
            getUserRank: () => db.getUserRank(currentHn),
            loadPlayers: ({ offset, limit }) => db.getLeaderboard({ currentHn, offset, limit }),
        });
    };

    const renderCurrentRoute = async () => {
        const currentRenderVersion = ++routeRenderVersion;
        const route = getCurrentRoute();
        const rememberedPatient = getPatientSessionCookie();

        if (!uiRoot || !gameContainer) {
            return;
        }

        // Version badge is scoped to the Game Hub only (US-E7-05). Clear the marker on every
        // route change; `showHub()` re-adds it so the badge shows on the Game Hub and nowhere
        // else (CSS gates `.app-version-badge` on `body.game-hub-route`).
        document.body.classList.remove("game-hub-route");

        if (route.name === "unknown") {
            return navigateTo(rememberedPatient ? ROUTES.hub : ROUTES.home, { replace: true });
        }

        if ((route.name === "login" || route.name === "signup") && rememberedPatient) {
            return navigateTo(ROUTES.hub, { replace: true });
        }

        if (
            route.name !== "login"
            && route.name !== "signup"
            && route.name !== "admin-login"
            && route.name !== "player-info"
            && route.name !== "test-game-hub"
            && !(
                route.name === "game"
                && String(SessionStorageManager.get(TEST_GAME_HUB_LAUNCH_GID_KEY, "") || "").trim() === route.gid
            )
            && !rememberedPatient
        ) {
            if (route.name === "home") {
                showLanding();
                return;
            }

            clearPatientClientState();
            return navigateTo(ROUTES.home, { replace: true });
        }

        if (route.name === "home") {
            await renderWithFade(uiRoot, () => showLanding());
            return;
        }

        if (route.name === "login") {
            await renderWithFade(uiRoot, () => showLogin({
                patientCode: SessionStorageManager.get(PATIENT_LOGIN_ID_KEY, "") || "",
            }));
            return;
        }

        if (route.name === "admin-login") {
            await renderWithFade(uiRoot, () => showAdminLogin());
            return;
        }

        if (route.name === "player-info") {
            let isAdminSession = false;

            try {
                const currentSession = await db.getCurrentSession();
                isAdminSession = Boolean(currentSession?.user) && currentSession.user.is_anonymous !== true;
            } catch (error) {
                console.warn("Unable to verify admin session for player info:", error);
            }

            if (!isAdminSession) {
                return navigateTo(rememberedPatient ? ROUTES.hub : ROUTES.login, { replace: true });
            }

            await renderWithFade(uiRoot, () => showPlayerInfo());
            return;
        }

        if (route.name === "leaderboard") {
            await renderWithFade(uiRoot, () => showLeaderboard());
            return;
        }

        if (route.name === "signup") {
            const pendingPatientCode = SessionStorageManager.get(PATIENT_LOGIN_ID_KEY, "") || "";
            if (!pendingPatientCode) {
                return navigateTo(ROUTES.login, { replace: true });
            }

            await renderWithFade(uiRoot, () => showSignup({
                patientCode: pendingPatientCode,
            }));
            return;
        }

        if (route.name === "checkin-summary") {
            await renderWithFade(uiRoot, () => showCheckInSummary());
            return;
        }

        if (route.name === "daily-preset-tool") {
            await renderWithFade(uiRoot, () => showDailyPresetTool());
            return;
        }

        if (route.name === "daily-preset-editor") {
            await renderWithFade(uiRoot, () => showDailyPresetEditor(route.presetId));
            return;
        }

        if (route.name === "test-game-hub") {
            const canonicalTestHubRoute = getTestGameHubRouteHash({
                scene: route.scene,
                category: route.category,
            });

            if (window.location.hash !== canonicalTestHubRoute) {
                return navigateTo(canonicalTestHubRoute, { replace: true });
            }

            // US-E7-20: Game Hub entry shows the loading overlay (not a fade).
            showLoadingOverlay();
            try {
                await showTestGameHub({
                    initialScene: route.scene,
                    initialCategory: route.category,
                });
            } finally {
                hideLoadingOverlay();
            }
            return;
        }

        if (route.name === "hub") {
            const canonicalHubRoute = getHubRouteHash({
                scene: route.scene,
                category: route.category,
            });

            if (window.location.hash !== canonicalHubRoute) {
                return navigateTo(canonicalHubRoute, { replace: true });
            }

            // US-E7-20: Game Hub entry shows the loading overlay (not a fade).
            showLoadingOverlay();
            try {
                await showHub({
                    initialScene: route.scene,
                    initialCategory: route.category,
                });
            } finally {
                hideLoadingOverlay();
            }
            return;
        }

        if (route.name === "game") {
            // US-E7-20: minigame entry shows the loading overlay while the game module
            // + Phaser boot; hidden in `finally` once the game is up (or on any exit).
            showLoadingOverlay();
            try {
                let selectedGame = null;

                try {
                    selectedGame = await db.getGameByGid(route.gid);
                } catch (error) {
                    console.error(`Unable to fetch game by gid ${route.gid}:`, error);
                }

                const persistedGame = getPersistedSelectedGameByGid(route.gid);
                selectedGame = selectedGame || persistedGame;
                if (selectedGame && persistedGame) {
                    selectedGame = {
                        ...selectedGame,
                        stage: persistedGame.stage,
                        level: persistedGame.level,
                        day: persistedGame.day,
                        presetDataId: persistedGame.presetDataId,
                        displayName: persistedGame.displayName || selectedGame.displayName,
                        th_name: persistedGame.th_name || selectedGame.th_name,
                    };
                }

                if (currentRenderVersion !== routeRenderVersion) {
                    return;
                }

                if (!selectedGame) {
                    clearSelectedGameState();
                    await showPopup({
                        title: "ไม่พบข้อมูลเกม",
                        message: "ระบบไม่พบเกมที่ระบุในฐานข้อมูล จึงไม่สามารถเปิดเกมนี้ได้",
                        confirmText: "รับทราบ",
                        icon: "warning",
                        tone: "error",
                    });
                    navigateTo(ROUTES.hub, { replace: true });
                    return;
                }

                const canonicalRoute = getGameRouteHash(selectedGame);
                if (window.location.hash !== canonicalRoute) {
                    navigateTo(canonicalRoute, { replace: true });
                    return;
                }

                persistSelectedGame(selectedGame);
                const hasStarted = await showGame(selectedGame);

                if (currentRenderVersion !== routeRenderVersion) {
                    return;
                }

                const pendingLaunchKey = SessionStorageManager.get(PENDING_GAME_LAUNCH_KEY, "") || "";
                const selectedNodeKey = getGameHistoryNodeKey(selectedGame);
                if (hasStarted && pendingLaunchKey === selectedNodeKey) {
                    SessionStorageManager.delete(PENDING_GAME_LAUNCH_KEY);
                    return;
                }

                SessionStorageManager.delete(PENDING_GAME_LAUNCH_KEY);
                if (!hasStarted) {
                    removePendingGameHistoryByKey(selectedNodeKey);
                    navigateTo(getGameExitRoute(selectedGame), { replace: true });
                }
            } finally {
                hideLoadingOverlay();
            }
        }
    };

    // --- Back-button guard: intercept popstate when leaving a protected minigame ---
    const handleBackGuardIntercept = async () => {
        isBackGuardBlocking = true;

        // Pause all active Phaser scenes while the popup is shown
        const pausedScenes = [];
        if (activeGameInstance?.scene) {
            for (const scene of activeGameInstance.scene.scenes) {
                if (scene.scene.isActive() && !scene.scene.isPaused()) {
                    scene.scene.pause();
                    pausedScenes.push(scene);
                }
            }
        }

        const guardedGame = backGuardSelectedGame;
        const guardedCleanup = backGuardCleanup;
        const slug = guardedGame ? String(guardedGame.name || "").toLowerCase().replace(/\s+/g, "-") : "";
        const colors = activeThemeColors || GAME_COLORS[slug] || {};

        const confirmed = await showGameExitPopup({
            panelBorderColor: colors.border,
            panelHeaderColor: colors.header,
            primaryFontColor: colors.textPrimary,
            secondaryFontColor: colors.textSecondary,
        });

        isBackGuardBlocking = false;

        if (confirmed) {
            // Clear guard state before navigating
            isBackGuardActive = false;
            backGuardSelectedGame = null;
            backGuardCleanup = null;
            if (typeof guardedCleanup === "function") {
                guardedCleanup();
            }
            navigateTo(getGameExitRoute(guardedGame));
        } else {
            // Resume all scenes that were paused
            for (const scene of pausedScenes) {
                try {
                    scene.scene.resume();
                } catch (_) {
                    // Scene may have been destroyed
                }
            }
        }
    };

    window.addEventListener("popstate", (e) => {
        if (!isBackGuardActive || isBackGuardBlocking) {
            return;
        }
        // If the state has our marker, it means we are ON the sentinel.
        // We only care when the user navigates AWAY from the sentinel (popping it).
        if (e.state && e.state.__backGuard) {
            return;
        }

        // Re-push sentinel immediately so the URL stays locked.
        window.history.pushState({ __backGuard: true }, "", window.location.href);
        void handleBackGuardIntercept();
    });

    window.addEventListener("hashchange", () => {
        // Normal routing — skip if a back-guard popup is currently blocking
        if (!isBackGuardBlocking) {
            void renderCurrentRoute();
        }
    });

    // Safety net: never let the boot overlay trap the user if the first render hangs. Normal
    // dismissal is at first paint (fast), so this is just a last-resort backstop.
    const bootLoadingSafety = setTimeout(finishBootLoading, 8000);

    // Kick off the first route render, then dismiss the boot loading overlay once the first
    // screen is ready. navigateTo(replace) and renderCurrentRoute both return the render promise
    // (and redirects chain through it), so this resolves only after the real screen has painted.
    const firstRender = !window.location.hash
        ? navigateTo(ROUTES.home, { replace: true })
        : renderCurrentRoute();

    Promise.resolve(firstRender).finally(() => {
        clearTimeout(bootLoadingSafety);
        finishBootLoading();
    });
});
