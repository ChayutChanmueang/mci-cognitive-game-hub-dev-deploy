import db from "./core/database.js";
import { createGameHubState, renderGameHubScreen } from "./ui/game-hub-screen.js";
import { renderLandingScreen } from "./ui/landing-screen.js";
import { renderLoginScreen } from "./ui/login-screen.js";
import { showPopup } from "./ui/popup-dialog.js";
import { renderSignupScreen } from "./ui/signup-screen.js";
import {
    buildPatientSession,
    clearPatientSessionCookie,
    getPatientSessionCookie,
    getPatientSessionLabel,
    setPatientSessionCookie,
} from "./util/patient-session.js";
import StringUtil from "./util/string-util.js";

const gameModuleLoaders = import.meta.glob(["./game/*/main.js", "!./game/game-hub/main.js"]);

const ROUTES = Object.freeze({
    home: "#/home",
    login: "#/login",
    signup: "#/signup",
    hub: "#/hub",
});

const GAME_ROUTE_PREFIX = "#/game/";
const HUB_ROUTE_PREFIX = "#/hub/";
const DEFAULT_HUB_SCENE = "intro";
const DEFAULT_HUB_CATEGORY = "Attention";
const HUB_CATEGORIES = new Set(["Memory", "Visuospatial", "Attention", "Language", "Executive"]);
const HUB_CATEGORY_ORDER = ["Attention", "Memory", "Language", "Visuospatial", "Executive"];
const HUB_DAILY_TARGET = 10;
const PATIENT_LOGIN_ID_KEY = "patient_login_id";
const PATIENT_SIGNUP_DRAFT_KEY = "patient_signup_draft";
const PENDING_GAME_LAUNCH_KEY = "pending_game_launch_gid";
const SELECTED_GAME_STORAGE = Object.freeze({
    gid: "selected_game_gid",
    name: "selected_game_name",
    group: "selected_game_group",
});

document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    const uiRoot = document.getElementById("ui-root");
    const gameContainer = document.getElementById("game-container");
    const hubUiState = createGameHubState();
    let activeGameInstance = null;
    let routeRenderVersion = 0;

    const destroyActiveGame = () => {
        if (activeGameInstance && typeof activeGameInstance.destroy === "function") {
            activeGameInstance.destroy(true);
        }

        activeGameInstance = null;

        if (gameContainer) {
            gameContainer.innerHTML = "";
        }
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

    const getHubRouteHash = (options = {}) => {
        const scene = options?.scene === "selection" ? "selection" : DEFAULT_HUB_SCENE;
        const rawCategory = String(options?.category || DEFAULT_HUB_CATEGORY).trim();
        const category = HUB_CATEGORIES.has(rawCategory) ? rawCategory : DEFAULT_HUB_CATEGORY;

        if (scene === "selection") {
            return `${HUB_ROUTE_PREFIX}selection/${category}`;
        }

        return `${HUB_ROUTE_PREFIX}intro`;
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

        if (normalizedPath === "/signup") {
            return { name: "signup" };
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
            void renderCurrentRoute();
            return;
        }

        if (replace) {
            const url = new URL(window.location.href);
            url.hash = nextHash.slice(1);
            window.history.replaceState(null, "", url);
            void renderCurrentRoute();
            return;
        }

        window.location.hash = nextHash;
    };

    const persistSelectedGame = (selectedGame) => {
        sessionStorage.setItem(SELECTED_GAME_STORAGE.gid, String(selectedGame?.gid || "").trim());
        sessionStorage.setItem(SELECTED_GAME_STORAGE.name, String(selectedGame?.name || "").trim());
        sessionStorage.setItem(SELECTED_GAME_STORAGE.group, String(selectedGame?.mci_group || "").trim());
    };

    const clearSelectedGameState = () => {
        sessionStorage.removeItem(PENDING_GAME_LAUNCH_KEY);
        sessionStorage.removeItem(SELECTED_GAME_STORAGE.gid);
        sessionStorage.removeItem(SELECTED_GAME_STORAGE.name);
        sessionStorage.removeItem(SELECTED_GAME_STORAGE.group);
    };

    const clearPatientClientState = () => {
        clearPatientSessionCookie();
        sessionStorage.removeItem(PATIENT_LOGIN_ID_KEY);
        sessionStorage.removeItem(PATIENT_SIGNUP_DRAFT_KEY);
        clearSelectedGameState();
        Object.assign(hubUiState, createGameHubState());
    };

    const rememberPatientSession = async (patient) => {
        const user = await db.getCurrentUser();
        const patientSession = buildPatientSession(patient, user?.id || "");
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

        renderLandingScreen(uiRoot, {
            onLogin: () => navigateTo(ROUTES.login),
        });
    };

    const loadGameHubProgram = async () => {
        const loadedGames = [];

        for (const categoryId of HUB_CATEGORY_ORDER) {
            if (loadedGames.length >= HUB_DAILY_TARGET) {
                break;
            }

            try {
                const result = await db.getGamesByMciGroup(categoryId, {
                    offset: 0,
                    pageSize: HUB_DAILY_TARGET,
                });

                loadedGames.push(...(result?.items || []));
            } catch (error) {
                console.warn(`Unable to load hub games for ${categoryId}:`, error);
            }
        }

        const uniqueGames = [];
        const seenGids = new Set();
        for (const game of loadedGames) {
            const gid = String(game?.gid || "").trim();
            if (!gid || seenGids.has(gid)) {
                continue;
            }

            seenGids.add(gid);
            uniqueGames.push(game);
        }

        return uniqueGames.slice(0, HUB_DAILY_TARGET);
    };

    const showHub = async (options = {}) => {
        if (!uiRoot || !gameContainer) {
            return;
        }

        document.body.classList.add("game-mode");
        document.body.classList.add("hub-mode");
        document.body.classList.remove("landing-mode");
        app?.classList.add("game-mode");
        app?.classList.add("hub-mode");
        app?.classList.remove("landing-mode");
        destroyActiveGame();
        hideUiRoot();
        gameContainer.classList.remove("game-container--hidden");

        const rememberedPatient = getPatientSessionCookie();
        const patientCode = String(rememberedPatient?.patientCode || sessionStorage.getItem(PATIENT_LOGIN_ID_KEY) || "").trim();
        const patientLabel = rememberedPatient ? getPatientSessionLabel(rememberedPatient) : patientCode;
        const games = await loadGameHubProgram();
        const gameHubModule = await import("./game/game-hub/main.js");
        const startGameHub = gameHubModule?.StartGame || gameHubModule?.default;

        activeGameInstance = startGameHub("game-container", {
            games,
            dailyTarget: HUB_DAILY_TARGET,
            completedCount: 0,
            patientCode,
            patientLabel,
            onLaunchGame: async (selectedGame) => {
                const hasConfirmed = await showPopup({
                    title: "ยืนยันการเข้าเกม",
                    message: `ต้องการเปิดเกม ${selectedGame?.name || "นี้"} ใช่หรือไม่`,
                    confirmText: "เริ่มเกม",
                    cancelText: "ยกเลิก",
                    icon: "play_circle",
                });

                if (!hasConfirmed) {
                    return;
                }

                persistSelectedGame(selectedGame);
                sessionStorage.setItem(PENDING_GAME_LAUNCH_KEY, String(selectedGame?.gid || "").trim());
                navigateTo(getGameRouteHash(selectedGame));
            },
            onAdmin: async () => {
                await showPopup({
                    title: "โหมดผู้ดูแล",
                    message: "หน้าเข้าสู่ระบบผู้ดูแลจะถูกเชื่อมในขั้นตอนถัดไป",
                    confirmText: "รับทราบ",
                    icon: "admin_panel_settings",
                });
            },
            onLogout: async () => {
                const hasConfirmed = await showPopup({
                    title: "ยืนยันการออกจากระบบ",
                    message: "ต้องการออกจากระบบและกลับไปยังหน้าเข้าสู่ระบบใช่หรือไม่",
                    confirmText: "ออกจากระบบ",
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

    const showGame = async (selectedGame) => {
        if (!gameContainer || !uiRoot) {
            return false;
        }

        const { parsedName, loader } = resolveGameModuleLoader(selectedGame?.name);

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

    const showSignup = ({ patientCode = "" } = {}) => {
        document.body.classList.remove("landing-mode");
        document.body.classList.remove("hub-mode");
        app?.classList.remove("landing-mode");
        app?.classList.remove("hub-mode");
        showUiRoot();
        renderSignupScreen(uiRoot, {
            initialHn: patientCode,
            onBack: () => navigateTo(ROUTES.login),
            onSubmit: async (formData) => {
                const patientCodeLabel = `HN${String(formData?.hn || "").trim()}`;
                const shouldCreatePatient = await showPopup({
                    title: "ยืนยันการลงทะเบียน",
                    message: `ต้องการสร้างข้อมูลผู้เล่นรหัส ${patientCodeLabel} ใช่หรือไม่`,
                    confirmText: "ยืนยัน",
                    cancelText: "ยกเลิก",
                    icon: "how_to_reg",
                });

                if (!shouldCreatePatient) {
                    return false;
                }

                const createdPatient = await db.createPatientProfile(formData);
                await rememberPatientSession(createdPatient);
                sessionStorage.setItem(PATIENT_LOGIN_ID_KEY, String(formData?.hn || "").trim());
                sessionStorage.removeItem(PATIENT_SIGNUP_DRAFT_KEY);
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
                sessionStorage.setItem(PATIENT_LOGIN_ID_KEY, acceptedId);

                if (patient) {
                    await rememberPatientSession(patient);
                    sessionStorage.removeItem(PATIENT_SIGNUP_DRAFT_KEY);
                    navigateTo(ROUTES.hub);
                    return;
                }

                const patientCodeLabel = `HN${acceptedId}`;
                const shouldCreatePatient = await showPopup({
                    title: "ไม่พบรหัส HN",
                    message: `ไม่พบข้อมูลผู้เล่นรหัส ${patientCodeLabel} ต้องการลงทะเบียนผู้เล่นใหม่หรือไม่`,
                    confirmText: "สร้างผู้เล่นใหม่",
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

    const renderCurrentRoute = async () => {
        const currentRenderVersion = ++routeRenderVersion;
        const route = getCurrentRoute();
        const rememberedPatient = getPatientSessionCookie();

        if (!uiRoot || !gameContainer) {
            return;
        }

        if (route.name === "unknown") {
            navigateTo(rememberedPatient ? ROUTES.hub : ROUTES.home, { replace: true });
            return;
        }

        if ((route.name === "login" || route.name === "signup") && rememberedPatient) {
            navigateTo(ROUTES.hub, { replace: true });
            return;
        }

        if (route.name !== "login" && route.name !== "signup" && !rememberedPatient) {
            if (route.name === "home") {
                showLanding();
                return;
            }

            clearPatientClientState();
            navigateTo(ROUTES.home, { replace: true });
            return;
        }

        if (route.name === "home") {
            showLanding();
            return;
        }

        if (route.name === "login") {
            showLogin({
                patientCode: sessionStorage.getItem(PATIENT_LOGIN_ID_KEY) || "",
            });
            return;
        }

        if (route.name === "signup") {
            const pendingPatientCode = sessionStorage.getItem(PATIENT_LOGIN_ID_KEY) || "";
            if (!pendingPatientCode) {
                navigateTo(ROUTES.login, { replace: true });
                return;
            }

            showSignup({
                patientCode: pendingPatientCode,
            });
            return;
        }

        if (route.name === "hub") {
            const canonicalHubRoute = getHubRouteHash({
                scene: route.scene,
                category: route.category,
            });

            if (window.location.hash !== canonicalHubRoute) {
                navigateTo(canonicalHubRoute, { replace: true });
                return;
            }

            await showHub({
                initialScene: route.scene,
                initialCategory: route.category,
            });
            return;
        }

        if (route.name === "game") {
            let selectedGame = null;

            try {
                selectedGame = await db.getGameByGid(route.gid);
            } catch (error) {
                console.error(`Unable to fetch game by gid ${route.gid}:`, error);
            }

            if (currentRenderVersion !== routeRenderVersion) {
                return;
            }

            if (!selectedGame) {
                clearSelectedGameState();
                await showPopup({
                    title: "ไม่พบข้อมูลเกม",
                    message: "ระบบไม่พบเกมที่ระบุในฐานข้อมูล จึงไม่สามารถเปิดเกมนี้ได้",
                    confirmText: "กลับไปหน้าเกม",
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

            const pendingLaunchGid = sessionStorage.getItem(PENDING_GAME_LAUNCH_KEY) || "";
            if (hasStarted && pendingLaunchGid === selectedGame.gid) {
                sessionStorage.removeItem(PENDING_GAME_LAUNCH_KEY);
                try {
                    await db.logUserEvent("SPG", selectedGame.gid);
                } catch (error) {
                    console.warn("Unable to log start game event:", error);
                }
                return;
            }

            sessionStorage.removeItem(PENDING_GAME_LAUNCH_KEY);
            if (!hasStarted) {
                navigateTo(ROUTES.hub, { replace: true });
            }
        }
    };

    window.addEventListener("hashchange", () => {
        void renderCurrentRoute();
    });

    const rememberedPatient = getPatientSessionCookie();
    if (!window.location.hash) {
        navigateTo(ROUTES.home, { replace: true });
        return;
    }

    void renderCurrentRoute();
});
