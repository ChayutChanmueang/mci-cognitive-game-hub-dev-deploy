import { createGrid, ModuleRegistry, AllCommunityModule, themeMaterial } from "ag-grid-community";
import { showDailyPresetAddDayPopup } from "./daily-preset-add-day-popup.js";
import { showDailyPresetAddFieldPopup } from "./daily-preset-add-field-popup.js";
import "./daily-preset-editor.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const DEFAULT_STAGE_COUNT = 3;
const DAILY_GOAL_FIELD = "dailyGoal";
const DAY_FIELD = "day";
const ROW_ID_FIELD = "__presetRowId";

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

const DEFAULT_ROWS = Object.freeze([
    {
        day: 1,
        stage1: "Game 1 (ง่าย)",
        stage2: "Game 2 (ยาก)",
        stage3: "Game 3 (ง่าย)",
    },
    {
        day: 2,
        stage1: "Game 1 (กลาง)",
        stage2: "Game 2 (ง่าย)",
        stage3: "Game 3 (ง่าย)",
    },
]);

function getDefaultStageFields() {
    return Array.from({ length: DEFAULT_STAGE_COUNT }, (_, index) => `stage${index + 1}`);
}

function buildColumnDefs(stageFields, hasDailyGoal, onRemoveColumn, onRemoveRow) {
    const stageColumns = stageFields.map((field, index) => ({
        field,
        headerName: `ด่านที่ ${index + 1}`,
        editable: true,
        minWidth: 190,
        flex: 1,
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
        ...stageColumns,
    ];
}

function getRowsWithField(rowData, field) {
    return rowData.map((row) => ({
        ...row,
        [field]: "",
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

export function renderDailyPresetEditor(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        preset = { name: "Preset 1" },
        onBack = () => {},
    } = options;

    let presetName = preset?.name || "Preset";
    let stageFields = getDefaultStageFields();
    let nextStageId = DEFAULT_STAGE_COUNT + 1;
    let nextRowId = 1;
    let hasDailyGoal = false;
    let rowData = DEFAULT_ROWS.map((row) => ({
        [ROW_ID_FIELD]: nextRowId++,
        ...row,
    }));
    let gridApi = null;

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
                        value="${presetName}"
                        data-preset-name
                    ></md-filled-text-field>
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
            </div>
        </section>
    `;

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
    const removeColumn = (field, columnType) => {
        if (columnType === "dailyGoal") {
            hasDailyGoal = false;
            rowData = getRowsWithoutField(rowData, DAILY_GOAL_FIELD);
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
    const getGridColumns = () => buildColumnDefs(stageFields, hasDailyGoal, removeColumn, removeRow);
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

        const stageInputFields = stageFields.map((field, index) => ({
            field,
            label: `ด่านที่ ${index + 1}`,
            value: "",
        }));

        return [...dailyGoalFields, ...stageInputFields];
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
    root.querySelector("[data-add-stage]")?.addEventListener("click", async () => {
        const fieldType = await showDailyPresetAddFieldPopup({ hasDailyGoal });

        if (fieldType === "stage") {
            addStage();
            return;
        }

        if (fieldType === "dailyGoal") {
            addDailyGoal();
        }
    });
    root.querySelector("[data-add-day]")?.addEventListener("click", async () => {
        const nextDay = getNextDayNumber(rowData);
        const values = await showDailyPresetAddDayPopup({
            dayNumber: nextDay,
            fields: getAddDayFields(),
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
        stageFields.forEach((field) => {
            nextRow[field] = values[field] || "";
        });
        rowData = [...rowData, nextRow];
        gridApi.setGridOption("rowData", rowData);
    });
}
