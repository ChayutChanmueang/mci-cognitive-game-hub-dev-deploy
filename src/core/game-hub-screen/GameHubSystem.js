import { GameHubState } from "./GameHubState.js";
import { GameHubUtils } from "./GameHubUtils.js";
import { GameHubDataNormalizer } from "./GameHubDataNormalizer.js";
import { GameHubProgramBuilder } from "./GameHubProgramBuilder.js";
import { GameHubHistoryManager } from "./GameHubHistoryManager.js";
import { HubMapScreen } from "../../ui/game-hub/HubMapScreen.js";
import { showCheckInPopup } from "../../ui/checkin-summary-screen.js";
import db from "../database.js";

export class GameHubSystem {
    constructor(root, options = {}) {
        this.root = root;
        this.options = options;
        this.state = options.sharedState || new GameHubState();
        this.activeScreen = null;
        this.parsedPatientHn = String(options.patientHn || options.patientCode || "").trim();
        this.patientLabel = options.patientLabel || GameHubUtils.getPatientLabel();
        this.visibleDayFrom = null;
        this.visibleDayTo = null;

        this.ensureStateShape();
    }

    ensureStateShape() {
        if (!Array.isArray(this.state.programGames)) this.state.programGames = [];
        if (!Array.isArray(this.state.programDays)) this.state.programDays = [];
        if (!Array.isArray(this.state.allGames)) this.state.allGames = [];
        if (!Array.isArray(this.state.historyRecords)) this.state.historyRecords = [];
        if (typeof this.state.dailyGoal !== "string") this.state.dailyGoal = "";
        if (typeof this.state.autoCheckInLoading !== "boolean") this.state.autoCheckInLoading = false;
        if (typeof this.state.autoCheckInCompletedKey !== "string") this.state.autoCheckInCompletedKey = "";
        if (typeof this.state.scrollTop !== "number") this.state.scrollTop = 0;
    }

    getCurrentProgramDay() {
        return Number(this.state.dailyProgram?.programDay || this.state.programDays[0]?.day || 1);
    }

    getStartedProgram() {
        return this.state.dailyProgram?.startedProgram || this.options.programDate || new Date().toISOString();
    }

    getDayHistory(programDay) {
        return GameHubHistoryManager.getHistoryRecordsForProgramDay(
            this.state.historyRecords,
            this.getStartedProgram(),
            programDay,
        );
    }

    getDayCompletion(daySection) {
        return GameHubHistoryManager.getProgramDayCompletion(
            daySection,
            this.getDayHistory(Number(daySection?.day || 1)),
        );
    }

    getActiveProgramDay(daySections, currentProgramDay) {
        const sortedDays = [...(daySections || [])]
            .filter((daySection) => Number(daySection?.day) >= currentProgramDay)
            .sort((first, second) => Number(first.day) - Number(second.day));

        const firstOpenDay = sortedDays.find((daySection) => {
            const completion = this.getDayCompletion(daySection);
            return daySection?.nodes?.length && !completion.isComplete;
        });

        return Number(firstOpenDay?.day || currentProgramDay);
    }

    buildDaySections() {
        return GameHubProgramBuilder.buildProgramDaySections(this.state.programDays, this.state.restGame)
            .filter((daySection) => Array.isArray(daySection?.nodes) && daySection.nodes.length > 0)
            .sort((first, second) => Number(first.day) - Number(second.day));
    }

    render() {
        this.activeScreen?.destroy();
        this.root.innerHTML = "";

        const daySections = this.buildDaySections();
        const currentProgramDay = this.getCurrentProgramDay();
        const activeProgramDay = this.getActiveProgramDay(daySections, currentProgramDay);
        const currentDaySection = daySections.find((daySection) => Number(daySection?.day) === currentProgramDay)
            || daySections[0]
            || { day: currentProgramDay, nodes: [] };
        const currentDayCompletion = this.getDayCompletion(currentDaySection);
        const dailyGameTarget = currentDayCompletion.gameTarget;
        const completedGameCount = Math.min(dailyGameTarget, currentDayCompletion.completedGameCount);

        this.activeScreen = new HubMapScreen({
            nodes: GameHubProgramBuilder.flattenProgramDaySections(daySections),
            daySections,
            historyRecords: this.state.historyRecords,
            startedProgram: this.getStartedProgram(),
            activeProgramDay,
            dailyGameTarget,
            completedCount: currentDayCompletion.completedCount,
            completedGameCount,
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
                await this.options.onTestQuickLaunchGame?.(selectedGame);
            },
            onTestClearHistory: async () => {
                await this.options.onTestClearTodayHistory?.();
                await this.loadPlayedHistory(true);
            },
            onTestCompleteAll: async () => {
                await this.completeActiveDayForTest(daySections, activeProgramDay);
            },
            onTestDailyDataTools: this.options.onTestDailyDataTools,
            onNodeAction: async (selectedNode) => {
                await this.handleNodeAction(selectedNode);
            },
        });

        this.root.append(this.activeScreen.render());
    }

    async handleNodeAction(selectedNode) {
        try {
            if (selectedNode?.type === "game") {
                await this.options.onLaunchGame?.(selectedNode.gameData);
                return;
            }

            if (selectedNode?.type === "rest") {
                const result = await this.options.onRestNode?.(selectedNode);
                if (result?.redirected || result?.cancelled) {
                    return;
                }
                await this.loadPlayedHistory(true);
            }
        } catch (error) {
            console.error("Unable to handle selected game hub node:", error);
        }
    }

    async completeActiveDayForTest(daySections, activeProgramDay) {
        const activeDaySection = daySections.find((daySection) => Number(daySection?.day) === Number(activeProgramDay))
            || daySections.find((daySection) => Number(daySection?.day) === this.getCurrentProgramDay())
            || daySections[0];
        const anchor = GameHubDataNormalizer.getProgramDayAnchorDate(this.getStartedProgram(), Number(activeDaySection?.day || 1));
        const { playedFrom, playedTo } = GameHubUtils.getProgramDateRange(anchor);

        await this.options.onTestCompleteAll?.({
            nodes: activeDaySection?.nodes || [],
            historyRecords: this.state.historyRecords,
            playedFrom,
            playedTo,
        });
        await this.loadPlayedHistory(true);
    }

    async loadProgramGames(force = false, dayWindow = null) {
        if (this.state.programLoading) {
            return;
        }

        if (!force && this.state.programInitialized) {
            return;
        }

        this.state.programLoading = true;
        if (!this.state.programInitialized) {
            this.state.programGames = [];
            this.state.programDays = [];
        }
        this.render();

        try {
            const gameListItems = typeof this.options.loadGameList === "function"
                ? await this.options.loadGameList()
                : [];
            this.state.allGames = GameHubProgramBuilder.buildAllGames(gameListItems);
            this.state.restGame = GameHubProgramBuilder.findRestGame(this.state.allGames);

            const dailyProgram = await this.loadDailyProgram(dayWindow);
            const programDays = GameHubProgramBuilder.buildProgramDaysFromDailyProgram(dailyProgram);
            const programGames = GameHubProgramBuilder.buildProgramGamesFromDailyProgram(dailyProgram);
            const currentProgramDay = Number(dailyProgram?.programDay || programDays[0]?.day || 1);
            const currentDay = programDays.find((dayItem) => Number(dayItem?.day) === currentProgramDay)
                || programDays[0]
                || null;

            this.state.dailyProgram = dailyProgram || null;
            this.state.programDays = programDays;
            this.state.programGames = programGames;
            this.state.dailyGoal = String(currentDay?.goal || dailyProgram?.dailyPreset?.goal || "").trim();
            this.visibleDayFrom = Number(dailyProgram?.visibleDayFrom || programDays[0]?.day || currentProgramDay);
            this.visibleDayTo = Number(dailyProgram?.visibleDayTo || programDays[programDays.length - 1]?.day || currentProgramDay);
            this.state.programError = "";
        } catch (error) {
            console.warn("Unable to load game hub program:", error);
            this.state.dailyProgram = null;
            this.state.programDays = [];
            this.state.programGames = [];
            this.state.dailyGoal = "";
            this.state.programError = error?.message || "Unable to load game hub program";
        } finally {
            this.state.programInitialized = true;
            this.state.programLoading = false;
            this.options.onStateChange?.({ scene: "intro", activeCategory: "Attention" });
            this.render();
        }
    }

    async loadDailyProgram(dayWindow = null) {
        if (typeof this.options.loadDailyProgram !== "function" || !this.parsedPatientHn) {
            return null;
        }

        const explicitDayFrom = Number(dayWindow?.dayFrom);
        const explicitDayTo = Number(dayWindow?.dayTo);
        if (Number.isFinite(explicitDayFrom) && Number.isFinite(explicitDayTo)) {
            return this.options.loadDailyProgram({
                hn: this.parsedPatientHn,
                dayFrom: Math.floor(explicitDayFrom),
                dayTo: Math.floor(explicitDayTo),
                windowBefore: 0,
                windowAfter: 0,
            });
        }

        return this.options.loadDailyProgram({
            hn: this.parsedPatientHn,
            windowBefore: 2,
            windowAfter: 1,
        });
    }

    async loadPlayedHistory(force = false) {
        if (this.state.historyLoading && !force) {
            return;
        }

        if (!this.parsedPatientHn) {
            this.state.historyRecords = [];
            this.state.historyError = "";
            this.render();
            return;
        }

        this.state.historyLoading = true;
        this.render();

        try {
            const startDate = this.state.dailyProgram?.startedProgram || this.options.programDate || new Date();
            const endDate = this.state.dailyProgram?.programEndDate || startDate;
            const { playedFrom } = GameHubUtils.getProgramDateRange(startDate);
            const { playedTo } = GameHubUtils.getProgramDateRange(endDate);
            const gids = this.state.allGames
                .map((game) => String(game?.gid || "").trim())
                .filter(Boolean);

            this.state.historyRecords = await this.fetchHistoryRecords({ gids, playedFrom, playedTo });
            this.state.historyError = "";
            this.state.historyLoading = false;
            this.render();

            await this.maybeAutoCheckInCurrentDay();
            await this.ensureNextDayVisibleWhenCurrentDayComplete();
        } catch (error) {
            console.warn("Unable to load played game history:", error);
            this.state.historyRecords = [];
            this.state.historyError = error?.message || "Unable to load played game history";
            this.state.historyLoading = false;
            this.render();
        }
    }

    async fetchHistoryRecords({ gids, playedFrom, playedTo }) {
        if (
            typeof this.options.loadCompletedGameHistoryRecords === "function"
            || typeof this.options.loadInstantNodeHistoryRecords === "function"
        ) {
            const [completedGameRows, instantNodeRows] = await Promise.all([
                typeof this.options.loadCompletedGameHistoryRecords === "function"
                    ? this.options.loadCompletedGameHistoryRecords({
                        hn: this.parsedPatientHn,
                        gids,
                        playedFrom,
                        playedTo,
                    })
                    : [],
                typeof this.options.loadInstantNodeHistoryRecords === "function"
                    ? this.options.loadInstantNodeHistoryRecords({
                        hn: this.parsedPatientHn,
                        playedFrom,
                        playedTo,
                    })
                    : [],
            ]);

            return [
                ...(Array.isArray(completedGameRows) ? completedGameRows : []),
                ...(Array.isArray(instantNodeRows) ? instantNodeRows : []),
            ].map((record) => GameHubDataNormalizer.normalizeHistoryRecord(record));
        }

        if (typeof this.options.loadHistoryRecords === "function") {
            const historyRows = await this.options.loadHistoryRecords({
                hn: this.parsedPatientHn,
                playedFrom,
                playedTo,
            });
            return Array.isArray(historyRows)
                ? historyRows.map((record) => GameHubDataNormalizer.normalizeHistoryRecord(record))
                : [];
        }

        return [];
    }

    async maybeAutoCheckInCurrentDay() {
        const currentProgramDay = this.getCurrentProgramDay();
        const currentDaySection = this.buildDaySections()
            .find((daySection) => Number(daySection?.day) === currentProgramDay);
        if (!currentDaySection?.nodes?.length) {
            return;
        }

        const anchor = GameHubDataNormalizer.getProgramDayAnchorDate(this.getStartedProgram(), currentProgramDay);
        const checkInKey = GameHubDataNormalizer.getCheckInDateKey(anchor);
        const dayHistory = GameHubHistoryManager.getHistoryRecordsByDateKey(this.state.historyRecords, checkInKey);
        const targetNodes = GameHubProgramBuilder.getAutoCheckInTargetNodes(currentDaySection.nodes);

        if (!this.parsedPatientHn || !targetNodes.length) {
            return;
        }

        if (this.state.autoCheckInLoading || this.state.autoCheckInCompletedKey === checkInKey) {
            return;
        }

        if (GameHubHistoryManager.hasCheckInRecord(dayHistory)) {
            this.state.autoCheckInCompletedKey = checkInKey;
            return;
        }

        const completedCount = GameHubHistoryManager.getSequentialCompletedCount(targetNodes, dayHistory);
        if (completedCount < targetNodes.length) {
            return;
        }

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

    async ensureNextDayVisibleWhenCurrentDayComplete() {
        const currentProgramDay = this.getCurrentProgramDay();
        const programDayCount = Number(this.state.dailyProgram?.programDayCount || 0);
        if (!programDayCount || currentProgramDay >= programDayCount) {
            return;
        }

        const currentDaySection = this.buildDaySections()
            .find((daySection) => Number(daySection?.day) === currentProgramDay);
        if (!currentDaySection) {
            return;
        }

        const completion = this.getDayCompletion(currentDaySection);
        if (!completion.isComplete) {
            return;
        }

        const nextDay = currentProgramDay + 1;
        const hasNextDay = this.state.programDays
            .some((dayItem) => Number(dayItem?.day) === nextDay && Array.isArray(dayItem?.games) && dayItem.games.length > 0);
        if (hasNextDay) {
            this.render();
            return;
        }

        const dayFrom = Math.max(1, currentProgramDay - 1);
        const dayTo = Math.min(programDayCount, nextDay);
        await this.loadProgramGames(true, { dayFrom, dayTo });
        await this.loadPlayedHistory(true);
    }

    async init() {
        this.render();
        await this.loadProgramGames();
        await this.loadPlayedHistory();
    }
}
