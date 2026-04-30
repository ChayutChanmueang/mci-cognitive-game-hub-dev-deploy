import db from "../core/database.js";

const GAME_LEVEL_PRESET_LIST_TABLE = "game_level_preset_list";

function normalizePresetListRow(row) {
    return {
        id: row.id,
        createdAt: row.created_at,
        name: row.name,
        description: row.description || "",
        dayCount: 0,
    };
}

function normalizePresetName(name) {
    const parsedName = String(name || "").trim();
    if (!parsedName) {
        throw new Error("Invalid preset name");
    }

    return parsedName;
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

    return (data || []).map(normalizePresetListRow);
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
    const { error } = await client
        .from(GAME_LEVEL_PRESET_LIST_TABLE)
        .delete()
        .eq("id", parsedId);

    if (error) {
        throw error;
    }

    return true;
}
