import db from "../core/database.js";

const GAME_LEVEL_PRESET_LIST_TABLE = "game_level_preset_list";
const GAME_DAILY_PRESET_DATA_TABLE = "game_daily_preset_data";
const GAME_LEVEL_PRESET_DATA_TABLE = "game_level_preset_data";
const GAME_LIST_TABLE = "game_list_data";

function normalizePresetListRow(row) {
    return {
        id: row.id,
        createdAt: row.created_at,
        name: row.name,
        description: row.description || "",
        dayCount: Number(row.dayCount || row.day_count || 0),
    };
}

function normalizeGameListRow(row) {
    return {
        id: row.id,
        gid: row.gid,
        name: row.name,
        mciGroup: row.mci_group || "",
        maxScore: row.max_score,
    };
}

function normalizePresetName(name) {
    const parsedName = String(name || "").trim();
    if (!parsedName) {
        throw new Error("Invalid preset name");
    }

    return parsedName;
}

function normalizeDailyLoop(loop) {
    const parsedLoop = Number(loop);
    if (!Number.isFinite(parsedLoop)) {
        return 1;
    }

    return Math.max(1, Math.min(32767, Math.round(parsedLoop)));
}

export async function getGameLevelPresetLists() {
    await db.initAuth();

    const client = db.getClient();
    const { data, error } = await client
        .from(GAME_LEVEL_PRESET_LIST_TABLE)
        .select("id, created_at, name, description")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });

    if (error) {
        throw error;
    }

    const presets = (data || []).map(normalizePresetListRow);
    if (!presets.length) {
        return presets;
    }

    const presetIds = presets.map((preset) => preset.id);
    const { data: dailyRows, error: dailyError } = await client
        .from(GAME_DAILY_PRESET_DATA_TABLE)
        .select("gpid")
        .in("gpid", presetIds);

    if (dailyError) {
        throw dailyError;
    }

    const dayCounts = new Map();
    (dailyRows || []).forEach((row) => {
        const gpid = Number(row.gpid);
        dayCounts.set(gpid, (dayCounts.get(gpid) || 0) + 1);
    });

    return presets.map((preset) => ({
        ...preset,
        dayCount: dayCounts.get(Number(preset.id)) || 0,
    }));
}

export async function getGameLevelPresetList(id) {
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        throw new Error("Invalid preset id");
    }

    await db.initAuth();

    const client = db.getClient();
    const { data, error } = await client
        .from(GAME_LEVEL_PRESET_LIST_TABLE)
        .select("id, created_at, name, description")
        .eq("id", parsedId)
        .single();

    if (error) {
        throw error;
    }

    return normalizePresetListRow(data);
}

export async function getGameListOptions() {
    await db.initAuth();

    const client = db.getClient();
    const { data, error } = await client
        .from(GAME_LIST_TABLE)
        .select("id, gid, name, mci_group, max_score")
        .order("mci_group", { ascending: true, nullsFirst: false })
        .order("name", { ascending: true });

    if (error) {
        throw error;
    }

    return (data || []).map(normalizeGameListRow);
}

export async function getGameLevelPresetEditorData(id) {
    const preset = await getGameLevelPresetList(id);
    const parsedPresetId = Number(preset.id);

    await db.initAuth();
    const client = db.getClient();

    // Future daily-level fields live in game_daily_preset_data. Select them here,
    // map them into editor row fields below, return a hasX flag, and write them
    // again in saveGameLevelPreset dailyPayloads with a safe default.
    const { data: dailyRows, error: dailyError } = await client
        .from(GAME_DAILY_PRESET_DATA_TABLE)
        .select("id, goal, loop")
        .eq("gpid", parsedPresetId)
        .order("id", { ascending: true });

    if (dailyError) {
        throw dailyError;
    }

    const { data: levelRows, error: levelError } = await client
        .from(GAME_LEVEL_PRESET_DATA_TABLE)
        .select("gdid, gid, stage, level, day")
        .eq("gpid", parsedPresetId)
        .order("day", { ascending: true })
        .order("stage", { ascending: true });

    if (levelError) {
        throw levelError;
    }

    const levelsByDailyId = new Map();
    (levelRows || []).forEach((levelRow) => {
        const gdid = Number(levelRow.gdid);
        if (!levelsByDailyId.has(gdid)) {
            levelsByDailyId.set(gdid, []);
        }
        levelsByDailyId.get(gdid).push(levelRow);
    });

    const maxStage = (levelRows || []).reduce((max, levelRow) => {
        const stage = Number(levelRow.stage);
        return Number.isFinite(stage) ? Math.max(max, stage) : max;
    }, 0);
    const stageFields = Array.from({ length: maxStage || 3 }, (_, index) => `stage${index + 1}`);
    const hasDailyGoal = (dailyRows || []).some((row) => String(row.goal || "").trim());
    const hasDailyLoop = (dailyRows || []).some((row) => normalizeDailyLoop(row.loop) !== 1);

    const rows = (dailyRows || []).map((dailyRow, index) => {
        const dailyLevels = levelsByDailyId.get(Number(dailyRow.id)) || [];
        const storedDay = dailyLevels.find((levelRow) => Number.isFinite(Number(levelRow.day)))?.day;
        const row = {
            day: Number.isFinite(Number(storedDay)) ? Number(storedDay) : index + 1,
        };

        if (hasDailyGoal) {
            row.dailyGoal = dailyRow.goal || "";
        }

        if (hasDailyLoop) {
            row.dailyLoop = normalizeDailyLoop(dailyRow.loop);
        }

        stageFields.forEach((field) => {
            row[field] = null;
        });

        dailyLevels.forEach((levelRow) => {
            const stage = Number(levelRow.stage);
            if (!Number.isFinite(stage) || stage < 1) {
                return;
            }

            row[`stage${stage}`] = {
                gid: levelRow.gid,
                level: levelRow.level,
            };
        });

        return row;
    }).sort((firstRow, secondRow) => Number(firstRow.day) - Number(secondRow.day));

    return {
        preset,
        rows,
        stageFields,
        hasDailyGoal,
        hasDailyLoop,
    };
}

export async function createGameLevelPresetList({
    name,
    description = null,
}) {
    await db.initAuth();

    const payload = {
        name: normalizePresetName(name),
        description: description == null ? null : String(description).trim() || null,
    };

    const client = db.getClient();
    const { data, error } = await client
        .from(GAME_LEVEL_PRESET_LIST_TABLE)
        .insert([payload])
        .select("id, created_at, name, description")
        .single();

    if (error) {
        throw error;
    }

    return normalizePresetListRow(data);
}

export async function updateGameLevelPresetList(id, {
    name,
    description,
}) {
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        throw new Error("Invalid preset id");
    }

    await db.initAuth();

    const payload = {};
    if (name !== undefined) {
        payload.name = normalizePresetName(name);
    }
    if (description !== undefined) {
        payload.description = description == null ? null : String(description).trim() || null;
    }

    const client = db.getClient();
    const { data, error } = await client
        .from(GAME_LEVEL_PRESET_LIST_TABLE)
        .update(payload)
        .eq("id", parsedId)
        .select("id, created_at, name, description")
        .single();

    if (error) {
        throw error;
    }

    return normalizePresetListRow(data);
}

export async function deleteGameLevelPresetList(id) {
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        throw new Error("Invalid preset id");
    }

    await db.initAuth();

    const client = db.getClient();
    const { error: levelError } = await client
        .from(GAME_LEVEL_PRESET_DATA_TABLE)
        .delete()
        .eq("gpid", parsedId);

    if (levelError) {
        throw levelError;
    }

    const { error: dailyError } = await client
        .from(GAME_DAILY_PRESET_DATA_TABLE)
        .delete()
        .eq("gpid", parsedId);

    if (dailyError) {
        throw dailyError;
    }

    const { error } = await client
        .from(GAME_LEVEL_PRESET_LIST_TABLE)
        .delete()
        .eq("id", parsedId);

    if (error) {
        throw error;
    }

    return true;
}

export async function saveGameLevelPreset({
    id = null,
    name,
    description = null,
    rows = [],
    stageFields = [],
    hasDailyGoal = false,
    hasDailyLoop = false,
}) {
    const preset = id
        ? await updateGameLevelPresetList(id, { name, description })
        : await createGameLevelPresetList({ name, description });
    const parsedPresetId = Number(preset.id);

    await db.initAuth();
    const client = db.getClient();

    const { error: deleteLevelError } = await client
        .from(GAME_LEVEL_PRESET_DATA_TABLE)
        .delete()
        .eq("gpid", parsedPresetId);

    if (deleteLevelError) {
        throw deleteLevelError;
    }

    const { error: deleteDailyError } = await client
        .from(GAME_DAILY_PRESET_DATA_TABLE)
        .delete()
        .eq("gpid", parsedPresetId);

    if (deleteDailyError) {
        throw deleteDailyError;
    }

    const dailyPayloads = rows.map((row) => ({
        gpid: parsedPresetId,
        goal: hasDailyGoal ? String(row.dailyGoal || "").trim() || null : null,
        loop: hasDailyLoop ? normalizeDailyLoop(row.dailyLoop) : 1,
    }));

    if (!dailyPayloads.length) {
        return preset;
    }

    const { data: dailyRows, error: dailyInsertError } = await client
        .from(GAME_DAILY_PRESET_DATA_TABLE)
        .insert(dailyPayloads)
        .select("id");

    if (dailyInsertError) {
        throw dailyInsertError;
    }

    const levelPayloads = [];
    rows.forEach((row, rowIndex) => {
        const dailyRow = dailyRows?.[rowIndex];
        if (!dailyRow?.id) {
            return;
        }

        stageFields.forEach((field, stageIndex) => {
            const value = row[field];
            const gid = String(value?.gid || "").trim();
            const level = Number(value?.level);

            if (!gid || !Number.isFinite(level)) {
                return;
            }

            levelPayloads.push({
                gpid: parsedPresetId,
                gdid: dailyRow.id,
                gid,
                stage: stageIndex + 1,
                level,
                day: Number(row.day) || rowIndex + 1,
            });
        });
    });

    if (!levelPayloads.length) {
        return preset;
    }

    const { error: levelInsertError } = await client
        .from(GAME_LEVEL_PRESET_DATA_TABLE)
        .insert(levelPayloads);

    if (levelInsertError) {
        throw levelInsertError;
    }

    return preset;
}
