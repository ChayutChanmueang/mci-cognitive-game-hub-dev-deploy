import { createGrid, ModuleRegistry, AllCommunityModule, themeMaterial } from "ag-grid-community";
import { showDailyPresetAddDayPopup } from "./daily-preset-add-day-popup.js";
import { showDailyPresetEditStagePopup } from "./daily-preset-edit-stage-popup.js";
import { showDailyPresetAddFieldPopup } from "./daily-preset-add-field-popup.js";
import { showDailyPresetImportPopup } from "./daily-preset-import-popup.js";
import { parseDailyPresetCsv } from "./daily-preset-csv-import.js";
import { showPopup } from "../ui/popup-dialog.js";
import "material-design-lite";
import "material-design-lite/dist/material.min.css";
import "./daily-preset-editor.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const DEFAULT_STAGE_COUNT = 3;
const DAILY_GOAL_FIELD = "dailyGoal";
const DAILY_LOOP_FIELD = "dailyLoop";
const DAY_FIELD = "day";
const ROW_ID_FIELD = "__presetRowId";
const LEVEL_RECORD_ID_FIELD = "__levelPresetDataId";

// Future optional daily fields: add a field constant here, track a hasX flag in
// renderDailyPresetEditor, add a locked column in buildColumnDefs, wire add/remove
// handlers, include it in add-day fields, CSV import/export, and onSavePreset.
function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

class DeletableHeader {
    init(params) {
        this.params = params;
        this.eGui = document.createElement("div");
        this.eGui.className = "daily-preset-editor__header-cell";

        this.label = document.createElement("span");
        this.label.className = "daily-preset-editor__header-label";
        this.label.textContent = params.displayName || "";

        this.deleteButton = document.createElement("md-icon-button");
        this.deleteButton.type = "button";
        this.deleteButton.className = "daily-preset-editor__delete-column";
        this.deleteButton.setAttribute("aria-label", `ลบ ${params.displayName || "ข้อมูล"}`);

        const icon = document.createElement("span");
        icon.className = "material-symbols-rounded";
        icon.textContent = "delete";
        this.deleteButton.appendChild(icon);

        this.onDelete = (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.params.onRemoveColumn?.(this.params.field, this.params.columnType);
        };

        this.deleteButton.addEventListener("click", this.onDelete);
        this.eGui.append(this.label, this.deleteButton);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params) {
        this.params = params;
        this.label.textContent = params.displayName || "";
        this.deleteButton.setAttribute("aria-label", `ลบ ${params.displayName || "ข้อมูล"}`);
        return true;
    }

    destroy() {
        this.deleteButton?.removeEventListener("click", this.onDelete);
    }
}

class DeleteDayCell {
    init(params) {
        this.params = params;
        this.eGui = document.createElement("div");
        this.eGui.className = "daily-preset-editor__delete-day-cell";

        this.deleteButton = document.createElement("md-icon-button");
        this.deleteButton.type = "button";
        this.deleteButton.className = "daily-preset-editor__delete-day";
        this.deleteButton.setAttribute("aria-label", `ลบวันที่ ${params.data?.[DAY_FIELD] || ""}`);

        const icon = document.createElement("span");
        icon.className = "material-symbols-rounded";
        icon.textContent = "delete";
        this.deleteButton.appendChild(icon);

        this.onDelete = (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.params.onRemoveRow?.(this.params.data?.[ROW_ID_FIELD]);
        };

        this.deleteButton.addEventListener("click", this.onDelete);
        this.eGui.append(this.deleteButton);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params) {
        this.params = params;
        this.deleteButton.setAttribute("aria-label", `ลบวันที่ ${params.data?.[DAY_FIELD] || ""}`);
        return true;
    }

    destroy() {
        this.deleteButton?.removeEventListener("click", this.onDelete);
    }
}

const DEFAULT_ROWS = Object.freeze([]);

function getDefaultStageFields() {
    return Array.from({ length: DEFAULT_STAGE_COUNT }, (_, index) => `stage${index + 1}`);
}

function normalizeDailyLoop(value) {
    const parsedLoop = Number(value);
    if (!Number.isFinite(parsedLoop)) {
        return 1;
    }

    return Math.max(1, Math.min(32767, Math.round(parsedLoop)));
}

function buildColumnDefs(stageFields, hasDailyGoal, hasDailyLoop, onRemoveColumn, onRemoveRow, gameNameByGid) {
    const stageColumns = stageFields.map((field, index) => ({
        field,
        headerName: `ด่านที่ ${index + 1}`,
        editable: false,
        minWidth: 190,
        flex: 1,
        valueFormatter: (params) => {
            const gid = String(params.value?.gid || "").trim();
            const level = params.value?.level;
            if (!gid) {
                return "";
            }

            const gameName = gameNameByGid.get(gid) || gid;
            return level ? `${gameName} / Level ${level}` : gameName;
        },
        headerComponent: DeletableHeader,
        headerComponentParams: {
            field,
            columnType: "stage",
            onRemoveColumn,
        },
    }));

    const dailyGoalColumn = hasDailyGoal
        ? [
            {
                field: DAILY_GOAL_FIELD,
                headerName: "เป้าหมายประจำวัน",
                editable: true,
                minWidth: 220,
                flex: 1,
                lockPosition: "left",
                suppressMovable: true,
                headerComponent: DeletableHeader,
                headerComponentParams: {
                    field: DAILY_GOAL_FIELD,
                    columnType: "dailyGoal",
                    onRemoveColumn,
                },
            },
        ]
        : [];

    const dailyLoopColumn = hasDailyLoop
        ? [
            {
                field: DAILY_LOOP_FIELD,
                headerName: "จำนวนรอบการเล่น",
                editable: true,
                width: 170,
                minWidth: 150,
                cellEditor: "agNumberCellEditor",
                valueParser: (params) => normalizeDailyLoop(params.newValue),
                lockPosition: "left",
                suppressMovable: true,
                headerComponent: DeletableHeader,
                headerComponentParams: {
                    field: DAILY_LOOP_FIELD,
                    columnType: "dailyLoop",
                    onRemoveColumn,
                },
            },
        ]
        : [];

    return [
        {
            field: DAY_FIELD,
            headerName: "วันที่",
            editable: true,
            width: 130,
            minWidth: 110,
            cellEditor: "agNumberCellEditor",
            lockPosition: "left",
            suppressMovable: true,
        },
        {
            colId: "deleteDay",
            headerName: "",
            width: 64,
            minWidth: 56,
            maxWidth: 72,
            editable: false,
            resizable: false,
            sortable: false,
            suppressMovable: true,
            lockPosition: "left",
            cellRenderer: DeleteDayCell,
            cellRendererParams: {
                onRemoveRow,
            },
        },
        ...dailyGoalColumn,
        ...dailyLoopColumn,
        ...stageColumns,
    ];
}

function getRowsWithField(rowData, field, defaultValue = "") {
    return rowData.map((row) => ({
        ...row,
        [field]: defaultValue,
    }));
}

function getRowsWithoutField(rowData, field) {
    return rowData.map((row) => {
        const {
            [field]: _removed,
            ...nextRow
        } = row;
        return nextRow;
    });
}

function getNextDayNumber(rowData) {
    const maxDay = rowData.reduce((max, row) => {
        const day = Number(row[DAY_FIELD]);
        return Number.isFinite(day) ? Math.max(max, day) : max;
    }, 0);

    return maxDay + 1;
}

function getStageNumber(stageFields, field) {
    const index = stageFields.indexOf(field);
    return index >= 0 ? index + 1 : null;
}

function getCsvFilename(presetName) {
    const normalizedName = String(presetName || "daily-preset")
        .trim()
        .replace(/[^a-zA-Z0-9ก-๙_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return `${normalizedName || "daily-preset"}.csv`;
}

function downloadCsv(filename, csvContent) {
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

function showSavingOverlay() {
    if (typeof document === "undefined") {
        return () => {};
    }

    const overlay = document.createElement("div");
    const titleId = `daily-preset-saving-title-${Date.now()}`;
    const messageId = `daily-preset-saving-message-${Date.now()}`;
    const previousOverflow = document.body.style.overflow;

    overlay.className = "app-popup daily-preset-editor__saving-popup";
    overlay.innerHTML = `
        <div class="app-popup__backdrop"></div>
        <div
            class="app-popup__dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="${titleId}"
            aria-describedby="${messageId}"
        >
            <div class="app-popup__header">
                <div class="app-popup__icon-wrap">
                    <span class="material-symbols-rounded app-popup__icon">hourglass_top</span>
                </div>
                <div class="app-popup__copy">
                    <h2 id="${titleId}">กำลังบันทึกข้อมูล</h2>
                    <p id="${messageId}">กรุณารอสักครู่</p>
                </div>
            </div>
        </div>
    `;

    document.body.style.overflow = "hidden";
    document.body.appendChild(overlay);

    return () => {
        overlay.remove();
        document.body.style.overflow = previousOverflow;
    };
}

function upgradeMdlTooltips(root) {
    const componentHandler = globalThis.componentHandler;
    if (!componentHandler?.upgradeElements) {
        return;
    }

    const tooltips = root.querySelectorAll(".mdl-tooltip");
    componentHandler.upgradeElements(tooltips);

    root.querySelectorAll(".daily-preset-editor__csv-tooltip").forEach((tooltip) => {
        const target = root.querySelector(`#${CSS.escape(tooltip.getAttribute("for") || "")}`);
        if (!target) {
            return;
        }

        const placeTooltip = () => {
            requestAnimationFrame(() => {
                const targetRect = target.getBoundingClientRect();
                const tooltipRect = tooltip.getBoundingClientRect();
                const x = 72;
                const y = -42;
                const viewportPadding = 8;
                const left = Math.max(viewportPadding, targetRect.left - tooltipRect.width - x);
                const top = Math.min(
                    Math.max(viewportPadding, targetRect.top + (targetRect.height - tooltipRect.height + y) / 2),
                    window.innerHeight - tooltipRect.height - viewportPadding,
                );

                tooltip.style.left = `${left}px`;
                tooltip.style.top = `${top}px`;
            });
        };

        target.addEventListener("mouseenter", placeTooltip);
        target.addEventListener("focus", placeTooltip);
        const onResize = () => {
            if (!target.isConnected || !tooltip.isConnected) {
                window.removeEventListener("resize", onResize);
                return;
            }

            placeTooltip();
        };
        window.addEventListener("resize", onResize);
    });
}

function fitEditorSurfaceToViewport(root) {
    root.__dailyPresetSurfaceHeightCleanup?.();

    const surface = root.querySelector(".daily-preset-editor__surface");
    if (!surface || typeof window === "undefined") {
        root.__dailyPresetSurfaceHeightCleanup = null;
        return;
    }

    const visualViewport = window.visualViewport;
    let frameId = null;

    const updateSurfaceHeight = () => {
        frameId = null;
        if (!surface.isConnected) {
            root.__dailyPresetSurfaceHeightCleanup?.();
            return;
        }

        const viewportHeight = visualViewport?.height || window.innerHeight;
        const surfaceTop = surface.getBoundingClientRect().top;
        const bottomGap = 24;
        const minSurfaceHeight = 420;
        const nextHeight = Math.max(minSurfaceHeight, Math.floor(viewportHeight - surfaceTop - bottomGap));

        surface.style.setProperty("--daily-preset-editor-surface-height", `${nextHeight}px`);
    };

    const scheduleUpdate = () => {
        if (frameId != null) {
            return;
        }

        frameId = requestAnimationFrame(updateSurfaceHeight);
    };

    const cleanup = () => {
        if (frameId != null) {
            cancelAnimationFrame(frameId);
            frameId = null;
        }
        window.removeEventListener("resize", scheduleUpdate);
        visualViewport?.removeEventListener("resize", scheduleUpdate);
        root.__dailyPresetSurfaceHeightCleanup = null;
    };

    root.__dailyPresetSurfaceHeightCleanup = cleanup;
    window.addEventListener("resize", scheduleUpdate);
    visualViewport?.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();
}

function escapeCsvCell(value) {
    if (value == null) {
        return "";
    }

    const text = String(value);
    if (!/[",\r\n]/.test(text)) {
        return text;
    }

    return `"${text.replaceAll('"', '""')}"`;
}

function stringifyCsv(records, columns) {
    const lines = [
        columns.map(escapeCsvCell).join(","),
        ...records.map((record) => columns
            .map((column) => escapeCsvCell(record[column]))
            .join(",")),
    ];

    return lines.join("\r\n");
}

function pickCsvFile() {
    return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".csv,text/csv";
        input.style.display = "none";

        input.addEventListener("change", () => {
            resolve(input.files?.[0] || null);
            input.remove();
        }, { once: true });

        document.body.appendChild(input);
        input.click();
    });
}

export function renderDailyPresetEditor(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        preset = { name: "Preset 1" },
        gameOptions = [],
        initialRows = null,
        initialStageFields = null,
        initialHasDailyGoal = false,
        initialHasDailyLoop = false,
        onBack = () => {},
        onSavePreset = async () => {},
        onDeletePreset = async () => {},
    } = options;

    let presetName = preset?.name || "Preset";
    const gameNameByGid = new Map(
        (Array.isArray(gameOptions) ? gameOptions : [])
            .map((game) => [String(game.gid), game.name]),
    );
    const canDeletePreset = Boolean(preset?.id && !preset?.isNew);
    let stageFields = Array.isArray(initialStageFields) && initialStageFields.length
        ? [...initialStageFields]
        : getDefaultStageFields();
    let nextStageId = stageFields.reduce((max, field) => {
        const stageId = Number(String(field || "").replace("stage", ""));
        return Number.isFinite(stageId) ? Math.max(max, stageId) : max;
    }, DEFAULT_STAGE_COUNT) + 1;
    let nextRowId = 1;
    let hasDailyGoal = Boolean(initialHasDailyGoal);
    let hasDailyLoop = Boolean(initialHasDailyLoop);
    const sourceRows = Array.isArray(initialRows) ? initialRows : DEFAULT_ROWS;
    let rowData = sourceRows.map((row) => ({
        [ROW_ID_FIELD]: nextRowId++,
        ...row,
    }));
    let gridApi = null;
    let isSaving = false;
    let hideSavingOverlay = null;

    root.innerHTML = `
        <section class="daily-preset-editor-screen">
            <div class="daily-preset-editor">
                <header class="daily-preset-editor__header">
                    <div class="daily-preset-editor__header-title">
                        <md-icon-button type="button" aria-label="กลับ" data-editor-back>
                            <span class="material-symbols-rounded">arrow_back</span>
                        </md-icon-button>
                        <h2>ระบบ เพิ่ม/แก้ไข ข้อมูลรายวัน</h2>
                    </div>
                    <md-filled-text-field
                        class="daily-preset-editor__preset-name-field"
                        label="ชื่อ preset"
                        value="${escapeHtml(presetName)}"
                        data-preset-name
                    ></md-filled-text-field>
                    <div class="daily-preset-editor__header-actions">
                        ${
                            canDeletePreset
                                ? `
                                    <md-outlined-button type="button" data-delete-preset>
                                        ลบ preset
                                    </md-outlined-button>
                                `
                                : ""
                        }
                        <md-filled-button type="button" data-save-preset>
                            บันทึก
                        </md-filled-button>
                    </div>
                </header>

                <main class="daily-preset-editor__surface">
                    <div class="daily-preset-editor__table-shell">
                        <div class="daily-preset-editor__table-area">
                            <div class="daily-preset-editor__grid" data-preset-grid></div>
                            <div class="daily-preset-editor__add-row">
                                <md-filled-button class="daily-preset-editor__add-day" type="button" has-icon data-add-day>
                                    เพิ่มวัน
                                    <svg slot="icon" viewBox="0 -960 960 960"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
                                </md-filled-button>
                            </div>
                        </div>
                        <div class="daily-preset-editor__add-column">
                            <strong>เพิ่มข้อมูล</strong>
                            <md-filled-tonal-icon-button type="button" aria-label="เพิ่มข้อมูล" data-add-stage>
                                <span class="material-symbols-rounded">add</span>
                            </md-filled-tonal-icon-button>
                        </div>
                    </div>
                </main>

                <div class="daily-preset-editor__file-actions" aria-label="เครื่องมือนำเข้าและส่งออก">
                    <md-fab id="daily-preset-export-csv" size="small" aria-label="ส่งออก CSV" data-export-csv>
                        <span class="material-symbols-rounded" slot="icon">file_download</span>
                    </md-fab>
                    <div class="mdl-tooltip mdl-tooltip--large daily-preset-editor__csv-tooltip" for="daily-preset-export-csv">
                        ส่งออก CSV
                    </div>
                    <md-fab id="daily-preset-import-csv" size="small" aria-label="นำเข้า CSV" data-import-csv>
                        <span class="material-symbols-rounded" slot="icon">file_upload</span>
                    </md-fab>
                    <div class="mdl-tooltip mdl-tooltip--large daily-preset-editor__csv-tooltip" for="daily-preset-import-csv">
                        นำเข้า CSV
                    </div>
                </div>
            </div>
        </section>
    `;

    upgradeMdlTooltips(root);
    fitEditorSurfaceToViewport(root);

    const gridEl = root.querySelector("[data-preset-grid]");
    const addStage = () => {
        const nextField = `stage${nextStageId}`;
        nextStageId += 1;
        stageFields = [...stageFields, nextField];
        rowData = getRowsWithField(rowData, nextField);
        gridApi.setGridOption("columnDefs", getGridColumns());
        gridApi.setGridOption("rowData", rowData);
    };
    const addDailyGoal = () => {
        if (hasDailyGoal) {
            return;
        }

        hasDailyGoal = true;
        rowData = getRowsWithField(rowData, DAILY_GOAL_FIELD);
        gridApi.setGridOption("columnDefs", getGridColumns());
        gridApi.setGridOption("rowData", rowData);
    };
    const addDailyLoop = () => {
        if (hasDailyLoop) {
            return;
        }

        hasDailyLoop = true;
        rowData = getRowsWithField(rowData, DAILY_LOOP_FIELD, 1);
        gridApi.setGridOption("columnDefs", getGridColumns());
        gridApi.setGridOption("rowData", rowData);
    };
    const removeColumn = (field, columnType) => {
        if (columnType === "dailyGoal") {
            hasDailyGoal = false;
            rowData = getRowsWithoutField(rowData, DAILY_GOAL_FIELD);
            gridApi.setGridOption("columnDefs", getGridColumns());
            gridApi.setGridOption("rowData", rowData);
            return;
        }

        if (columnType === "dailyLoop") {
            hasDailyLoop = false;
            rowData = getRowsWithoutField(rowData, DAILY_LOOP_FIELD);
            gridApi.setGridOption("columnDefs", getGridColumns());
            gridApi.setGridOption("rowData", rowData);
            return;
        }

        if (columnType !== "stage" || !stageFields.includes(field)) {
            return;
        }

        stageFields = stageFields.filter((stageField) => stageField !== field);
        rowData = getRowsWithoutField(rowData, field);
        gridApi.setGridOption("columnDefs", getGridColumns());
        gridApi.setGridOption("rowData", rowData);
    };
    const removeRow = (rowId) => {
        if (!rowId) {
            return;
        }

        rowData = rowData
            .filter((row) => row[ROW_ID_FIELD] !== rowId)
            .map((row, index) => ({
                ...row,
                [DAY_FIELD]: index + 1,
            }));
        gridApi.setGridOption("rowData", rowData);
    };
    const syncStageOrderFromGrid = () => {
        const displayedColumns = gridApi?.getAllDisplayedColumns?.();
        if (!displayedColumns?.length) {
            return;
        }

        const displayedStageFields = displayedColumns
            .map((column) => column.getColId())
            .filter((field) => stageFields.includes(field));

        if (displayedStageFields.length !== stageFields.length) {
            return;
        }

        const isSameOrder = displayedStageFields.every((field, index) => field === stageFields[index]);
        if (isSameOrder) {
            return;
        }

        stageFields = displayedStageFields;
        gridApi.setGridOption("columnDefs", getGridColumns());
    };
    const getGridColumns = () => buildColumnDefs(stageFields, hasDailyGoal, hasDailyLoop, removeColumn, removeRow, gameNameByGid);
    const replacePresetRows = (importedPreset) => {
        stageFields = importedPreset.stageFields.length
            ? [...importedPreset.stageFields]
            : getDefaultStageFields();
        nextStageId = stageFields.reduce((max, field) => {
            const stageId = Number(String(field || "").replace("stage", ""));
            return Number.isFinite(stageId) ? Math.max(max, stageId) : max;
        }, DEFAULT_STAGE_COUNT) + 1;
        hasDailyGoal = Boolean(importedPreset.hasDailyGoal);
        hasDailyLoop = Boolean(importedPreset.hasDailyLoop);
        rowData = importedPreset.rows.map((row) => ({
            [ROW_ID_FIELD]: nextRowId++,
            ...row,
        }));
        gridApi.setGridOption("columnDefs", getGridColumns());
        gridApi.setGridOption("rowData", rowData);
    };
    const getStageCsvValue = (value) => {
        const gid = String(value?.gid || "").trim();
        const level = value?.level ?? "";
        if (!gid) {
            return "";
        }

        return level ? `${gid}(${level})` : gid;
    };
    const getCsvRecords = () => {
        return [...rowData]
            .sort((firstRow, secondRow) => Number(firstRow[DAY_FIELD]) - Number(secondRow[DAY_FIELD]))
            .map((row) => {
                const record = {
                    "วันที่": row[DAY_FIELD],
                };

                if (hasDailyGoal) {
                    record["เป้าหมายประจำวัน"] = row[DAILY_GOAL_FIELD] || "";
                }

                if (hasDailyLoop) {
                    record["จำนวนรอบการเล่น"] = normalizeDailyLoop(row[DAILY_LOOP_FIELD]);
                }

                stageFields.forEach((field, index) => {
                    record[`ด่านที่ ${index + 1}`] = getStageCsvValue(row[field]);
                });

                return record;
            });
    };
    const getCsvGameReferenceRecords = () => {
        const usedGids = new Set();
        rowData.forEach((row) => {
            stageFields.forEach((field) => {
                const gid = String(row[field]?.gid || "").trim();
                if (gid) {
                    usedGids.add(gid);
                }
            });
        });

        return [...usedGids]
            .sort((firstGid, secondGid) => firstGid.localeCompare(secondGid))
            .map((gid) => ({
                gid,
                game_name: gameNameByGid.get(gid) || "",
            }));
    };
    const exportCsv = () => {
        const columns = [
            "วันที่",
            ...(hasDailyGoal ? ["เป้าหมายประจำวัน"] : []),
            ...(hasDailyLoop ? ["จำนวนรอบการเล่น"] : []),
            ...stageFields.map((_, index) => `ด่านที่ ${index + 1}`),
        ];
        const gameReferenceRecords = getCsvGameReferenceRecords();
        const csvSections = [
            stringifyCsv(getCsvRecords(), columns),
        ];

        if (gameReferenceRecords.length) {
            csvSections.push(stringifyCsv(gameReferenceRecords, ["gid", "game_name"]));
        }

        const csvContent = csvSections.join("\r\n\r\n");

        downloadCsv(getCsvFilename(presetName), csvContent);
    };
    const updateStageCell = (rowId, field, value) => {
        rowData = rowData.map((row) => {
            if (row[ROW_ID_FIELD] !== rowId) {
                return row;
            }

            const existingValue = row[field];
            return {
                ...row,
                [field]: value?.gid
                    ? {
                        ...(existingValue?.[LEVEL_RECORD_ID_FIELD]
                            ? { [LEVEL_RECORD_ID_FIELD]: existingValue[LEVEL_RECORD_ID_FIELD] }
                            : {}),
                        gid: value.gid,
                        level: value.level,
                    }
                    : null,
            };
        });
        gridApi.setGridOption("rowData", rowData);
    };
    const getAddDayFields = () => {
        const dailyGoalFields = hasDailyGoal
            ? [
                {
                    field: DAILY_GOAL_FIELD,
                    label: "เป้าหมายประจำวัน",
                    value: "",
                },
            ]
            : [];

        const dailyLoopFields = hasDailyLoop
            ? [
                {
                    field: DAILY_LOOP_FIELD,
                    label: "จำนวนรอบการเล่น",
                    value: 1,
                    inputType: "number",
                },
            ]
            : [];

        const stageInputFields = stageFields.map((field, index) => ({
            field,
            type: "stage",
            label: `ด่านที่ ${index + 1}`,
            value: null,
        }));

        return [...dailyGoalFields, ...dailyLoopFields, ...stageInputFields];
    };

    gridApi = createGrid(gridEl, {
        theme: themeMaterial,
        columnDefs: getGridColumns(),
        rowData,
        defaultColDef: {
            resizable: true,
            sortable: false,
            filter: false,
            suppressHeaderMenuButton: true,
            cellClass: "daily-preset-editor__cell",
        },
        rowHeight: 52,
        headerHeight: 52,
        stopEditingWhenCellsLoseFocus: true,
        onColumnMoved: (event) => {
            if (event.finished) {
                syncStageOrderFromGrid();
            }
        },
        onCellClicked: async (event) => {
            const field = event.column?.getColId?.();
            if (!field || !stageFields.includes(field) || !event.data) {
                return;
            }

            const stageNumber = getStageNumber(stageFields, field);
            if (!stageNumber) {
                return;
            }

            const values = await showDailyPresetEditStagePopup({
                dayNumber: event.data[DAY_FIELD],
                stageNumber,
                value: event.data[field],
                gameOptions,
            });

            if (!values) {
                return;
            }

            updateStageCell(event.data[ROW_ID_FIELD], field, values);
        },
        onCellValueChanged: () => {
            rowData = [];
            gridApi.forEachNode((node) => {
                if (node.data) {
                    rowData.push({ ...node.data });
                }
            });
        },
    });

    root.querySelector("[data-editor-back]")?.addEventListener("click", onBack);
    root.querySelector("[data-preset-name]")?.addEventListener("input", (event) => {
        presetName = event.target.value || "";
    });
    const saveButton = root.querySelector("[data-save-preset]");
    const setSaving = (nextIsSaving) => {
        isSaving = nextIsSaving;
        if (saveButton) {
            saveButton.disabled = nextIsSaving;
        }

        if (nextIsSaving) {
            hideSavingOverlay = showSavingOverlay();
            return;
        }

        hideSavingOverlay?.();
        hideSavingOverlay = null;
    };
    root.querySelector("[data-save-preset]")?.addEventListener("click", async () => {
        if (isSaving) {
            return;
        }

        setSaving(true);
        try {
            await onSavePreset({
                id: preset?.id || null,
                isNew: Boolean(preset?.isNew),
                name: presetName,
                rowData,
                stageFields,
                hasDailyGoal,
                hasDailyLoop,
            });
        } finally {
            setSaving(false);
        }
    });
    root.querySelector("[data-delete-preset]")?.addEventListener("click", async () => {
        await onDeletePreset(preset);
    });
    root.querySelector("[data-export-csv]")?.addEventListener("click", () => {
        exportCsv();
    });
    root.querySelector("[data-import-csv]")?.addEventListener("click", async () => {
        const importType = await showDailyPresetImportPopup();
        if (!importType) {
            return;
        }

        const file = await pickCsvFile();
        if (!file) {
            return;
        }

        try {
            const importedPreset = parseDailyPresetCsv(await file.text(), importType, gameOptions);
            replacePresetRows(importedPreset);
            await showPopup({
                title: "นำเข้า CSV แล้ว",
                message: `นำเข้าข้อมูล ${importedPreset.rows.length} วันเรียบร้อยแล้ว`,
                confirmText: "ตกลง",
                icon: "check_circle",
            });
        } catch (error) {
            console.error("Failed to import daily preset CSV:", error);
            await showPopup({
                title: "นำเข้า CSV ไม่สำเร็จ",
                message: error?.message || "ไม่สามารถอ่านข้อมูล CSV ได้",
                confirmText: "รับทราบ",
                icon: "error",
                tone: "error",
            });
        }
    });
    root.querySelector("[data-add-stage]")?.addEventListener("click", async () => {
        const fieldType = await showDailyPresetAddFieldPopup({ hasDailyGoal, hasDailyLoop });

        if (fieldType === "stage") {
            addStage();
            return;
        }

        if (fieldType === "dailyGoal") {
            addDailyGoal();
            return;
        }

        if (fieldType === "dailyLoop") {
            addDailyLoop();
        }
    });
    root.querySelector("[data-add-day]")?.addEventListener("click", async () => {
        const nextDay = getNextDayNumber(rowData);
        const values = await showDailyPresetAddDayPopup({
            dayNumber: nextDay,
            fields: getAddDayFields(),
            gameOptions,
        });

        if (!values) {
            return;
        }

        const nextRow = {
            [ROW_ID_FIELD]: nextRowId++,
            [DAY_FIELD]: nextDay,
        };
        if (hasDailyGoal) {
            nextRow[DAILY_GOAL_FIELD] = values[DAILY_GOAL_FIELD] || "";
        }
        if (hasDailyLoop) {
            nextRow[DAILY_LOOP_FIELD] = normalizeDailyLoop(values[DAILY_LOOP_FIELD]);
        }
        stageFields.forEach((field) => {
            nextRow[field] = values[field] || "";
        });
        rowData = [...rowData, nextRow];
        gridApi.setGridOption("rowData", rowData);
    });
}
