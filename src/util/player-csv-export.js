import { calculateAgeFromBirthDate } from "./patient-date-util.js";
import { getProgramEndDate } from "./program-date-util.js";

export const CsvExportType = Object.freeze({
    Player: "player",
    Game: "game",
    History: "history",
});

export const PlayerCsvExportType = CsvExportType;

export const CsvExportScope = Object.freeze({
    Current: "current",
    All: "all",
});

export const PlayerCsvExportScope = CsvExportScope;

export const PLAYER_CSV_COLUMNS = Object.freeze([
    "hn",
    "firstname",
    "lastname",
    "gender",
    "date",
    "age",
    "education_level",
    "phone",
    "started_program",
    "ended_program",
    "program",
]);

export const GAME_CSV_COLUMNS = Object.freeze([
    "hn",
    "gid",
    "minigame_name",
    "mci_group",
    "start_at",
    "end_at",
    "total_playtime",
    "total_correct",
    "total_wrong",
    "score",
    "level",
]);

export const GAME_HISTORY_CSV_COLUMNS = Object.freeze([
    "user_hn",
    "firstgame_at",
    "lastgame_at",
    "total_time",
    "check-in",
    "last_stage",
]);

export function buildPlayerCsvRecord(player = {}, options = {}) {
    const startedProgram = player.started_program || player.startedProgram || "";
    const birthDate = player.birth_date || player.date || player.birthDate || "";
    const programDayCount = options.programDayCount
        ?? player.programDayCount
        ?? player.program_day_count
        ?? null;
    const endedProgram = options.programEndedAt
        || player.programEndedAt
        || player.programEndDate
        || getProgramEndDateTime(startedProgram, programDayCount)
        || getProgramEndDate(startedProgram, programDayCount)
        || "";

    return {
        hn: player.hn || player.patientCode || "",
        firstname: player.firstname || "",
        lastname: player.lastname || "",
        gender: player.gender || "",
        date: formatCsvDate(birthDate),
        age: formatAge(birthDate),
        education_level: options.educationName
            || player.educationName
            || player.education_level
            || player.educationLevel
            || "",
        phone: player.phone || "",
        started_program: formatCsvDateTime(startedProgram),
        ended_program: formatCsvDateTime(endedProgram),
        program: options.programName || player.programName || "",
    };
}

export function buildPlayerCsv(player = {}, options = {}) {
    return stringifyCsv([buildPlayerCsvRecord(player, options)], PLAYER_CSV_COLUMNS);
}

export function buildPlayersCsv(players = []) {
    return stringifyCsv(
        players.map((player) => buildPlayerCsvRecord(player)),
        PLAYER_CSV_COLUMNS,
    );
}

export function buildGameCsvRecord(gameRecord = {}) {
    const startAt = gameRecord.start_at || gameRecord.ingame_started_at || gameRecord.ingameStartedAt || "";
    const endAt = gameRecord.end_at || gameRecord.ingame_ended_at || gameRecord.ingameEndedAt || "";

    return {
        hn: gameRecord.hn || "",
        gid: gameRecord.gid || "",
        minigame_name: gameRecord.minigame_name || gameRecord.minigameName || "",
        mci_group: gameRecord.mci_group || gameRecord.mciGroup || "",
        start_at: formatCsvDateTime(startAt),
        end_at: formatCsvDateTime(endAt),
        total_playtime: formatPlaytimeMinutes(
            gameRecord.total_playtime ?? gameRecord.totalPlaytime,
            startAt,
            endAt,
        ),
        total_correct: gameRecord.total_correct ?? gameRecord.totalCorrect ?? "",
        total_wrong: gameRecord.total_wrong ?? gameRecord.totalWrong ?? "",
        score: gameRecord.score ?? "",
        level: formatGameLevel(gameRecord.level),
    };
}

export function buildGameCsv(gameRecords = []) {
    return stringifyCsv(
        gameRecords.map((gameRecord) => buildGameCsvRecord(gameRecord)),
        GAME_CSV_COLUMNS,
    );
}

export function buildGameHistoryCsvRecord(historyRecord = {}) {
    return {
        user_hn: historyRecord.user_hn || historyRecord.userHn || historyRecord.hn || "",
        firstgame_at: formatCsvDateTime(historyRecord.firstgame_at || historyRecord.firstgameAt || ""),
        lastgame_at: formatCsvDateTime(historyRecord.lastgame_at || historyRecord.lastgameAt || ""),
        total_time: formatPlaytimeMinutes(historyRecord.total_time ?? historyRecord.totalTime),
        "check-in": formatBoolean(historyRecord["check-in"] ?? historyRecord.check_in ?? historyRecord.checkIn),
        last_stage: historyRecord.last_stage ?? historyRecord.lastStage ?? "",
    };
}

export function buildGameHistoryCsv(historyRecords = []) {
    return stringifyCsv(
        historyRecords.map((historyRecord) => buildGameHistoryCsvRecord(historyRecord)),
        GAME_HISTORY_CSV_COLUMNS,
    );
}

export function getPlayerCsvFilename(player = {}) {
    const hn = String(player.hn || player.patientCode || "").trim();
    const dateKey = new Date().toISOString().slice(0, 10);
    return `${hn || "player"}-${dateKey}.csv`;
}

export function getGameCsvFilename(player = {}) {
    const hn = String(player.hn || player.patientCode || "").trim();
    const dateKey = new Date().toISOString().slice(0, 10);
    return `${hn || "player"}-game-${dateKey}.csv`;
}

export function getGameHistoryCsvFilename(player = {}) {
    const hn = String(player.hn || player.patientCode || "").trim();
    const dateKey = new Date().toISOString().slice(0, 10);
    return `${hn || "player"}-game-history-${dateKey}.csv`;
}

export function getPlayersCsvFilename() {
    const dateKey = new Date().toISOString().slice(0, 10);
    return `players-${dateKey}.csv`;
}

export function getGamesCsvFilename() {
    const dateKey = new Date().toISOString().slice(0, 10);
    return `games-${dateKey}.csv`;
}

export function getGameHistoriesCsvFilename() {
    const dateKey = new Date().toISOString().slice(0, 10);
    return `game-history-${dateKey}.csv`;
}

export function downloadCsv(filename, csvContent) {
    const blob = new Blob([`\uFEFF${csvContent}`], {
        type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

export function stringifyCsv(records, columns) {
    return [
        columns.map(escapeCsvCell).join(","),
        ...records.map((record) => columns
            .map((column) => escapeCsvCell(record[column]))
            .join(",")),
    ].join("\r\n");
}

export function escapeCsvCell(value) {
    if (value == null) {
        return "";
    }

    const text = String(value);
    if (!/[",\r\n]/.test(text)) {
        return text;
    }

    return `"${text.replaceAll('"', '""')}"`;
}

function formatAge(birthDate) {
    const age = calculateAgeFromBirthDate(birthDate);
    return Number.isInteger(age) ? age : "";
}

function formatCsvDate(value) {
    const date = parseDate(value);
    if (!date) {
        return String(value || "");
    }

    return [
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
        date.getFullYear(),
    ].join("/");
}

function formatCsvDateTime(value) {
    const date = parseDate(value);
    if (!date) {
        return String(value || "");
    }

    return `${formatCsvDate(date)} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatPlaytimeMinutes(value, startedAt, endedAt) {
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }

    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) {
        return formatDecimal(numericValue);
    }

    const startDate = parseDate(startedAt);
    const endDate = parseDate(endedAt);
    if (!startDate || !endDate || endDate < startDate) {
        return "";
    }

    return formatDecimal((endDate.getTime() - startDate.getTime()) / 60000);
}

function formatDecimal(value) {
    if (!Number.isFinite(value)) {
        return "";
    }

    return value.toFixed(1);
}

function formatBoolean(value) {
    return value === true ? "TRUE" : "FALSE";
}

function formatGameLevel(level) {
    const levelMap = new Map([
        [1, "ง่าย"],
        [2, "กลาง"],
        [3, "ยาก"],
    ]);
    const parsedLevel = Number(level);

    return levelMap.get(parsedLevel) || (level == null ? "" : String(level));
}

function getProgramEndDateTime(startedProgram, programDayCount) {
    const startDate = parseDate(startedProgram);
    const dayCount = Number(programDayCount);

    if (!startDate || !Number.isFinite(dayCount) || dayCount <= 0) {
        return null;
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.max(0, Math.floor(dayCount) - 1));
    return endDate;
}

function parseDate(value) {
    if (!value) {
        return null;
    }

    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
        const [year, month, day] = value.trim().split("-").map(Number);
        const date = new Date(year, month - 1, day);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = value instanceof Date ? new Date(value) : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}
