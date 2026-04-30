import { createGrid, ModuleRegistry, AllCommunityModule, themeMaterial } from "ag-grid-community";
import "./daily-preset-editor.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const DEFAULT_STAGE_COUNT = 3;

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

function buildColumnDefs(stageCount) {
    const stageColumns = Array.from({ length: stageCount }, (_, index) => ({
        field: `stage${index + 1}`,
        headerName: `ด่านที่ ${index + 1}`,
        editable: true,
        minWidth: 190,
        flex: 1,
    }));

    return [
        {
            field: "day",
            headerName: "วันที่",
            editable: true,
            width: 130,
            minWidth: 110,
            cellEditor: "agNumberCellEditor",
        },
        ...stageColumns,
    ];
}

function getRowsWithStage(rowData, stageField) {
    return rowData.map((row) => ({
        ...row,
        [stageField]: "",
    }));
}

export function renderDailyPresetEditor(root, options = {}) {
    if (!root) {
        return;
    }

    const {
        preset = { name: "Preset 1" },
        onBack = () => {},
    } = options;

    let stageCount = DEFAULT_STAGE_COUNT;
    let rowData = DEFAULT_ROWS.map((row) => ({ ...row }));
    let gridApi = null;

    root.innerHTML = `
        <section class="daily-preset-editor-screen">
            <div class="daily-preset-editor">
                <header class="daily-preset-editor__header">
                    <md-icon-button type="button" aria-label="กลับ" data-editor-back>
                        <span class="material-symbols-rounded">arrow_back</span>
                    </md-icon-button>
                    <h2>ระบบ เพิ่ม/แก้ไข ข้อมูลรายวัน</h2>
                    <span class="daily-preset-editor__preset-name">${preset?.name || "Preset"}</span>
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
        stageCount += 1;
        const nextField = `stage${stageCount}`;
        rowData = getRowsWithStage(rowData, nextField);
        gridApi.setGridOption("columnDefs", getGridColumns());
        gridApi.setGridOption("rowData", rowData);
    };
    const getGridColumns = () => buildColumnDefs(stageCount);

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
    root.querySelector("[data-add-stage]")?.addEventListener("click", addStage);
    root.querySelector("[data-add-day]")?.addEventListener("click", () => {
        const nextDay = rowData.length + 1;
        const nextRow = { day: nextDay };
        for (let index = 1; index <= stageCount; index += 1) {
            nextRow[`stage${index}`] = "";
        }
        rowData = [...rowData, nextRow];
        gridApi.setGridOption("rowData", rowData);
    });
}
