const DAY_HEADER = "วันที่";
const DAILY_GOAL_HEADER = "เป้าหมายประจำวัน";
const DAILY_LOOP_HEADER = "จำนวนรอบการเล่น";

// Future CSV daily fields: add a header constant, detect it in parseDailyPresetCsv,
// assign row values in buildRows, and return a hasX flag for the editor.
const THAI_DIFFICULTY_LEVELS = Object.freeze({
    "ง่าย": 1,
    "กลาง": 2,
    "ยาก": 3,
});

const THAI_GROUP_TO_MCI_GROUP = Object.freeze({
    "สมาธิ": "Attention",
    "ภาษา": "Language",
    "ความจำ": "Memory",
    "บริหารจัดการ": "Executive",
    "มิติสัมพันธ์": "Visuospatial",
});

const FALLBACK_THAI_GROUP_TO_GID = Object.freeze({
    "สมาธิ": "ATTN001",
    "ภาษา": "LANG001",
    "ความจำ": "MEM001",
    "บริหารจัดการ": "EXEC001",
    "มิติสัมพันธ์": "VSP001",
});

function normalizeCell(value) {
    return String(value || "").replace(/^\uFEFF/, "").trim();
}

function parseCsvRows(csvText) {
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;
    const text = String(csvText || "").replace(/^\uFEFF/, "");

    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        const nextChar = text[index + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                cell += '"';
                index += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === "," && !inQuotes) {
            row.push(cell);
            cell = "";
            continue;
        }

        if ((char === "\n" || char === "\r") && !inQuotes) {
            if (char === "\r" && nextChar === "\n") {
                index += 1;
            }
            row.push(cell);
            rows.push(row);
            row = [];
            cell = "";
            continue;
        }

        cell += char;
    }

    if (cell || row.length) {
        row.push(cell);
        rows.push(row);
    }

    return rows;
}

function splitCsvSections(rows) {
    const sections = [[]];

    rows.forEach((row) => {
        const isBlank = row.every((cell) => normalizeCell(cell) === "");
        if (isBlank) {
            if (sections[sections.length - 1].length) {
                sections.push([]);
            }
            return;
        }

        sections[sections.length - 1].push(row);
    });

    return sections.filter((section) => section.length);
}

function sectionToObjects(section) {
    const headers = (section[0] || []).map(normalizeCell);

    return section.slice(1).map((row) => {
        const record = {};
        headers.forEach((header, index) => {
            record[header] = normalizeCell(row[index]);
        });
        return record;
    });
}

function getStageHeaders(headers) {
    return headers
        .filter((header) => /^ด่านที่\s*\d+/u.test(header))
        .sort((firstHeader, secondHeader) => {
            const firstNumber = Number(firstHeader.match(/\d+/u)?.[0] || 0);
            const secondNumber = Number(secondHeader.match(/\d+/u)?.[0] || 0);
            return firstNumber - secondNumber;
        });
}

function getCustomStageHeaders(headers) {
    return getStageHeaders(headers).filter((header) => !header.includes("พัก"));
}

function parseNormalStageValue(value) {
    const text = normalizeCell(value);
    if (!text) {
        return null;
    }

    const match = text.match(/^([A-Za-z0-9_-]+)(?:\(([^)]+)\))?$/u);
    if (!match) {
        return null;
    }

    return {
        gid: match[1],
        level: match[2] || "",
    };
}

function getThaiGroupGid(thaiGroup, gameOptions) {
    const mciGroup = THAI_GROUP_TO_MCI_GROUP[thaiGroup];
    const game = (Array.isArray(gameOptions) ? gameOptions : [])
        .find((entry) => entry.gid !== "REST001" && entry.mciGroup === mciGroup);

    return game?.gid || FALLBACK_THAI_GROUP_TO_GID[thaiGroup] || "";
}

function isRestValue(value) {
    const text = normalizeCell(value);
    return !text || text.includes("พัก") || /^\d+\s*นาที$/u.test(text);
}

function normalizeDailyLoop(value) {
    const parsedLoop = Number(normalizeCell(value));
    if (!Number.isFinite(parsedLoop)) {
        return 1;
    }

    return Math.max(1, Math.min(32767, Math.round(parsedLoop)));
}

function parseCustomStageValue(value, gameOptions) {
    const text = normalizeCell(value);
    if (isRestValue(text)) {
        return null;
    }

    const match = text.match(/^(.+?)\s*\(([^)]+)\)$/u);
    if (!match) {
        return null;
    }

    const thaiGroup = normalizeCell(match[1]);
    const difficulty = normalizeCell(match[2]);
    const gid = getThaiGroupGid(thaiGroup, gameOptions);
    const level = THAI_DIFFICULTY_LEVELS[difficulty];

    if (!gid || !level) {
        return null;
    }

    return {
        gid,
        level,
    };
}

function buildRows(records, stageHeaders, hasDailyGoal, hasDailyLoop, parseStageValue) {
    const stageFields = stageHeaders.map((_, index) => `stage${index + 1}`);
    const rows = records.map((record, rowIndex) => {
        const row = {
            day: Number(record[DAY_HEADER]) || rowIndex + 1,
        };

        if (hasDailyGoal) {
            row.dailyGoal = record[DAILY_GOAL_HEADER] || "";
        }

        if (hasDailyLoop) {
            row.dailyLoop = normalizeDailyLoop(record[DAILY_LOOP_HEADER]);
        }

        stageHeaders.forEach((header, index) => {
            row[stageFields[index]] = parseStageValue(record[header]);
        });

        return row;
    });

    return {
        rows,
        stageFields,
        hasDailyGoal,
        hasDailyLoop,
    };
}

export function parseDailyPresetCsv(csvText, importType, gameOptions = []) {
    const sections = splitCsvSections(parseCsvRows(csvText));
    const mainSection = sections[0] || [];
    const headers = (mainSection[0] || []).map(normalizeCell);
    const records = sectionToObjects(mainSection)
        .filter((record) => normalizeCell(record[DAY_HEADER]));
    const hasDailyGoal = headers.includes(DAILY_GOAL_HEADER);
    const hasDailyLoop = headers.includes(DAILY_LOOP_HEADER);

    if (!records.length) {
        throw new Error("CSV ไม่มีข้อมูลวันที่");
    }

    if (importType === "normal") {
        const stageHeaders = getStageHeaders(headers);
        return buildRows(records, stageHeaders, hasDailyGoal, hasDailyLoop, parseNormalStageValue);
    }

    if (importType === "custom-1") {
        const stageHeaders = getCustomStageHeaders(headers);
        return buildRows(records, stageHeaders, hasDailyGoal, hasDailyLoop, (value) => parseCustomStageValue(value, gameOptions));
    }

    throw new Error("ไม่รู้จักประเภทข้อมูลนำเข้า");
}
