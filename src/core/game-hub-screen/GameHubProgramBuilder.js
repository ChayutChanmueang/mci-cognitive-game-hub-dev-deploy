import { REST_GAME_GID } from "./GameHubConstants.js";
import { GameHubDataNormalizer } from "./GameHubDataNormalizer.js";

/**
 * GameHubProgramBuilder
 * คลาสสำหรับสร้างและจัดการโครงสร้างของ Program เกม, Node เกมรายวัน (OOP Pattern)
 */
export class GameHubProgramBuilder {
    static findRestGame(gameListItems) {
        const list = Array.isArray(gameListItems) ? gameListItems : [];
        const target = list.find((item) => String(item?.gid || "").trim() === REST_GAME_GID);

        return target ? GameHubDataNormalizer.normalizeGame(target, 0, target?.mci_group || "Attention") : null;
    }

    static buildAllGames(gameListItems) {
        const normalized = (gameListItems || []).map((item, index) =>
            GameHubDataNormalizer.normalizeGame(item, index, item?.mci_group || "Attention"),
        );
        const uniqueGames = [];
        const seen = new Set();

        normalized.forEach((item) => {
            const game = GameHubDataNormalizer.normalizeGame(item, uniqueGames.length, item?.mci_group || "Attention");
            if (!game.gid || seen.has(game.gid)) {
                return;
            }
            seen.add(game.gid);
            uniqueGames.push(game);
        });

        return uniqueGames;
    }

    static buildProgramGamesFromDailyProgram(dailyProgram) {
        const rows = Array.isArray(dailyProgram?.games)
            ? dailyProgram.games
            : [];

        return rows.map((item, index) => {
            const game = GameHubDataNormalizer.normalizeGame(item, index, item?.mci_group || "Attention");
            if (!game.gid || game.gid === REST_GAME_GID) {
                return null;
            }

            return {
                ...game,
                presetDataId: item?.preset_data_id ?? item?.presetDataId ?? null,
                dailyPresetId: item?.daily_preset_id ?? item?.dailyPresetId ?? null,
                programId: item?.program_id ?? item?.programId ?? dailyProgram?.programId ?? null,
                stage: Number(item?.stage),
                level: Number(item?.level),
                day: Number(item?.day ?? dailyProgram?.programDay),
                loop: Number(item?.loop || dailyProgram?.dailyPreset?.loop || 1),
                goal: String(item?.goal || dailyProgram?.dailyPreset?.goal || "").trim(),
            };
        }).filter(Boolean);
    }

    static buildProgramDaysFromDailyProgram(dailyProgram) {
        const days = Array.isArray(dailyProgram?.days) ? dailyProgram.days : [];

        if (!days.length && Array.isArray(dailyProgram?.games)) {
            return [{
                day: Number(dailyProgram?.programDay || 1),
                goal: String(dailyProgram?.dailyPreset?.goal || "").trim(),
                loop: Number(dailyProgram?.dailyPreset?.loop || 1),
                games: this.buildProgramGamesFromDailyProgram(dailyProgram),
            }];
        }

        return days.map((dayItem) => {
            const dayProgram = {
                ...dailyProgram,
                dailyPreset: dayItem?.dailyPreset || dailyProgram?.dailyPreset || null,
                games: Array.isArray(dayItem?.games) ? dayItem.games : [],
            };

            return {
                day: Number(dayItem?.day),
                goal: String(dayItem?.goal || dayItem?.dailyPreset?.goal || "").trim(),
                loop: Number(dayItem?.loop || dayItem?.dailyPreset?.loop || 1),
                games: this.buildProgramGamesFromDailyProgram(dayProgram),
            };
        }).filter((dayItem) => Number.isFinite(dayItem.day));
    }

    static buildDailyProgramNodes(games, restGame) {
        const gameNodes = (games || []).map((game, index) => ({
            id: `game-${String(game?.presetDataId || game?.gid || index)}`,
            type: "game",
            gid: String(game?.gid || "").trim(),
            stage: game?.stage ?? null,
            day: game?.day ?? null,
            title: game?.displayName || game?.th_name || game?.name || `เกมที่ ${index + 1}`,
            gameNumber: index + 1,
            gameData: game,
        }));

        if (!gameNodes.length) {
            return [];
        }

        const splitIndex = Math.ceil(gameNodes.length / 2);
        const restNode = {
            id: "rest-node",
            type: "rest",
            gid: REST_GAME_GID,
            title: restGame?.displayName || restGame?.th_name || restGame?.name || "พักยืดเส้นยืดสาย",
            gameData: restGame,
            emoji: "🏋️",
        };
        return [
            ...gameNodes.slice(0, splitIndex),
            restNode,
            ...gameNodes.slice(splitIndex),
        ];
    }

    static buildProgramDaySections(programDays, restGame) {
        return (programDays || []).map((dayItem) => ({
            ...dayItem,
            nodes: this.buildDailyProgramNodes(dayItem?.games || [], restGame),
        }));
    }

    static flattenProgramDaySections(daySections) {
        return (daySections || []).flatMap((dayItem) => dayItem?.nodes || []);
    }

    static getAutoCheckInTargetNodes(nodes) {
        return (nodes || []).filter((node) => node?.type === "game" || node?.type === "rest");
    }
}
