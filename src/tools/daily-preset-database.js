import db from "../core/database.js";

const GAME_LEVEL_PRESET_LIST_TABLE = "game_level_preset_list";
const GAME_DAILY_PRESET_DATA_TABLE = "game_daily_preset_data";
const GAME_LEVEL_PRESET_DATA_TABLE = "game_level_preset_data";
const GAME_LIST_TABLE = "game_list_data";
const DAILY_RECORD_ID_FIELD = "__dailyPresetDataId";
const LEVEL_RECORD_ID_FIELD = "__levelPresetDataId";

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

function parseExistingId(id) {
    const parsedId = Number(id);
    return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
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
        .select("id, gdid, gid, stage, level, day")
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
            [DAILY_RECORD_ID_FIELD]: dailyRow.id,
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
                [LEVEL_RECORD_ID_FIELD]: levelRow.id,
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

    const { data: existingDailyRows, error: existingDailyError } = await client
        .from(GAME_DAILY_PRESET_DATA_TABLE)
        .select("id")
        .eq("gpid", parsedPresetId);

    if (existingDailyError) {
        throw existingDailyError;
    }

    const { data: existingLevelRows, error: existingLevelError } = await client
        .from(GAME_LEVEL_PRESET_DATA_TABLE)
        .select("id")
        .eq("gpid", parsedPresetId);

    if (existingLevelError) {
        throw existingLevelError;
    }

    const existingDailyIds = new Set((existingDailyRows || []).map((row) => Number(row.id)));
    const existingLevelIds = new Set((existingLevelRows || []).map((row) => Number(row.id)));
    const keptDailyIds = new Set();
    const keptLevelIds = new Set();
    const rowDailyIds = new Map();
    const newDailyPayloads = [];

    const getDailyPayload = (row) => ({
        gpid: parsedPresetId,
        goal: hasDailyGoal ? String(row.dailyGoal || "").trim() || null : null,
        loop: hasDailyLoop ? normalizeDailyLoop(row.dailyLoop) : 1,
    });

    for (const [rowIndex, row] of rows.entries()) {
        const existingDailyId = parseExistingId(row[DAILY_RECORD_ID_FIELD]);
        const dailyPayload = getDailyPayload(row);

        if (existingDailyId && existingDailyIds.has(existingDailyId)) {
            const { error: dailyUpdateError } = await client
                .from(GAME_DAILY_PRESET_DATA_TABLE)
                .update(dailyPayload)
                .eq("id", existingDailyId)
                .eq("gpid", parsedPresetId);

            if (dailyUpdateError) {
                throw dailyUpdateError;
            }

            keptDailyIds.add(existingDailyId);
            rowDailyIds.set(rowIndex, existingDailyId);
            continue;
        }

        newDailyPayloads.push({
            rowIndex,
            payload: dailyPayload,
        });
    }

    if (newDailyPayloads.length) {
        const { data: insertedDailyRows, error: dailyInsertError } = await client
            .from(GAME_DAILY_PRESET_DATA_TABLE)
            .insert(newDailyPayloads.map((entry) => entry.payload))
            .select("id");

        if (dailyInsertError) {
            throw dailyInsertError;
        }

        (insertedDailyRows || []).forEach((dailyRow, index) => {
            const rowIndex = newDailyPayloads[index]?.rowIndex;
            const dailyId = parseExistingId(dailyRow?.id);
            if (rowIndex == null || !dailyId) {
                return;
            }

            rows[rowIndex][DAILY_RECORD_ID_FIELD] = dailyId;
            keptDailyIds.add(dailyId);
            rowDailyIds.set(rowIndex, dailyId);
        });
    }

    const newLevelPayloads = [];
    for (const [rowIndex, row] of rows.entries()) {
        const dailyId = rowDailyIds.get(rowIndex);
        if (!dailyId) {
            continue;
        }

        for (const [stageIndex, field] of stageFields.entries()) {
            const value = row[field];
            const gid = String(value?.gid || "").trim();
            const level = Number(value?.level);

            if (!gid || !Number.isFinite(level)) {
                continue;
            }

            const levelPayload = {
                gpid: parsedPresetId,
                gdid: dailyId,
                gid,
                stage: stageIndex + 1,
                level,
                day: Number(row.day) || rowIndex + 1,
            };
            const existingLevelId = parseExistingId(value?.[LEVEL_RECORD_ID_FIELD]);

            if (existingLevelId && existingLevelIds.has(existingLevelId)) {
                const { error: levelUpdateError } = await client
                    .from(GAME_LEVEL_PRESET_DATA_TABLE)
                    .update(levelPayload)
                    .eq("id", existingLevelId)
                    .eq("gpid", parsedPresetId);

                if (levelUpdateError) {
                    throw levelUpdateError;
                }

                keptLevelIds.add(existingLevelId);
                continue;
            }

            newLevelPayloads.push({
                rowIndex,
                field,
                payload: levelPayload,
            });
        }
    }

    if (newLevelPayloads.length) {
        const { data: insertedLevelRows, error: levelInsertError } = await client
            .from(GAME_LEVEL_PRESET_DATA_TABLE)
            .insert(newLevelPayloads.map((entry) => entry.payload))
            .select("id");

        if (levelInsertError) {
            throw levelInsertError;
        }

        (insertedLevelRows || []).forEach((levelRow, index) => {
            const rowIndex = newLevelPayloads[index]?.rowIndex;
            const field = newLevelPayloads[index]?.field;
            const levelId = parseExistingId(levelRow?.id);
            if (rowIndex == null || !field || !levelId || !rows[rowIndex]?.[field]) {
                return;
            }

            rows[rowIndex][field][LEVEL_RECORD_ID_FIELD] = levelId;
        });
    }

    const levelIdsToDelete = [...existingLevelIds].filter((levelId) => !keptLevelIds.has(levelId));
    if (levelIdsToDelete.length) {
        const { error: staleLevelDeleteError } = await client
            .from(GAME_LEVEL_PRESET_DATA_TABLE)
            .delete()
            .in("id", levelIdsToDelete);

        if (staleLevelDeleteError) {
            throw staleLevelDeleteError;
        }
    }

    const dailyIdsToDelete = [...existingDailyIds].filter((dailyId) => !keptDailyIds.has(dailyId));
    if (dailyIdsToDelete.length) {
        const { error: staleDailyDeleteError } = await client
            .from(GAME_DAILY_PRESET_DATA_TABLE)
            .delete()
            .in("id", dailyIdsToDelete);

        if (staleDailyDeleteError) {
            throw staleDailyDeleteError;
        }
    }

    return preset;
}
