// US-E9-11: Buddhist-era date entry. `<input type="date">` always renders its calendar and text in
// the browser's own locale, so it cannot show พ.ศ. — there is no attribute that changes this. This
// replaces it with three native <select>s (วัน / เดือน / ปี พ.ศ.), fused into a single field-box-shaped
// pill so the row keeps the form's usual label/field rhythm. It also removes typing entirely for
// elderly users and makes a malformed date impossible to enter.
//
// The selects speak พ.ศ.; getValue()/setValue() speak ISO ค.ศ., so callers and the database never
// see a Buddhist year.
import {
    THAI_MONTH_ABBREVIATIONS,
    THAI_MONTH_NAMES,
    buddhistPartsToIso,
    getCurrentBuddhistYear,
    getDaysInBuddhistMonth,
    isoToBuddhistParts,
} from "../../util/thai-era-date.js";
import { escapeText, escapeAttr } from "./escape.js";

const SEGMENT_CLASSES = {
    day: "gh-frame-field-box-date-l",
    month: "gh-frame-field-box-date-c",
    year: "gh-frame-field-box-date-r",
};

function optionMarkup(value, label, selected) {
    return `<option value="${escapeAttr(value)}"${selected ? " selected" : ""}>${escapeText(label)}</option>`;
}

function buildYearOptions(minYear, maxYear, selectedYear) {
    const options = [];
    for (let year = maxYear; year >= minYear; year -= 1) {
        options.push(optionMarkup(year, String(year), year === selectedYear));
    }
    return options.join("");
}

/**
 * @param {object} opts
 * @param {string} opts.id            id prefix; the three selects become `${id}-day|-month|-year`
 * @param {number} [opts.minYear]     earliest selectable พ.ศ. year
 * @param {number} [opts.maxYear]     latest selectable พ.ศ. year
 * @param {string} [opts.value]       initial value as an ISO ค.ศ. date (YYYY-MM-DD)
 * @param {string} [opts.ariaLabel]   describes the group, e.g. "วันเกิด"
 */
export function renderThaiDateSelect({ id, minYear, maxYear, value = "", ariaLabel = "" } = {}) {
    const currentYear = getCurrentBuddhistYear();
    const lastYear = maxYear ?? currentYear;
    const firstYear = minYear ?? lastYear - 120;
    const parts = isoToBuddhistParts(value) || {};

    const dayCount = getDaysInBuddhistMonth(parts.month, parts.year);
    const dayOptions = Array.from({ length: dayCount }, (unused, index) => {
        const day = index + 1;
        return optionMarkup(day, String(day), day === parts.day);
    }).join("");

    // Options carry the full month name; attachThaiDateSelect swaps the chosen one to its
    // abbreviation, since the full name is wider than the closed select.
    const monthOptions = THAI_MONTH_NAMES
        .map((name, index) => optionMarkup(index + 1, name, index + 1 === parts.month))
        .join("");

    // `placeholder` is what the empty segment shows and has to survive a ~50px column; `srLabel` is
    // the spoken one, which has no such limit.
    const segment = (key, placeholder, srLabel, options, hasValue) => `
        <div class="gh-date-select__segment ${SEGMENT_CLASSES[key]}">
            <select
                id="${escapeAttr(`${id}-${key}`)}"
                class="gh-frame-field-box__select"
                aria-label="${escapeAttr(ariaLabel ? `${ariaLabel} — ${srLabel}` : srLabel)}"
            >
                <option value="" disabled${hasValue ? "" : " selected"}>${escapeText(placeholder)}</option>
                ${options}
            </select>
        </div>`;

    return `
        <div class="gh-date-select" role="group"${ariaLabel ? ` aria-label="${escapeAttr(ariaLabel)}"` : ""}>
            ${segment("day", "วัน", "วัน", dayOptions, Boolean(parts.day))}
            ${segment("month", "เดือน", "เดือน", monthOptions, Boolean(parts.month))}
            ${segment("year", "พ.ศ.", "ปี พ.ศ.", buildYearOptions(firstYear, lastYear, parts.year), Boolean(parts.year))}
        </div>`;
}

/**
 * Wire up a rendered group. Returns a controller whose value is an ISO ค.ศ. date, or "" when the
 * user has not finished picking all three parts.
 *
 * @param {ParentNode} root
 * @param {string} id                 the same id prefix passed to renderThaiDateSelect
 * @param {object} [opts]
 * @param {() => void} [opts.onChange]
 */
export function attachThaiDateSelect(root, id, { onChange } = {}) {
    const daySelect = root.querySelector(`#${id}-day`);
    const monthSelect = root.querySelector(`#${id}-month`);
    const yearSelect = root.querySelector(`#${id}-year`);

    if (!daySelect || !monthSelect || !yearSelect) {
        return null;
    }

    const selects = [daySelect, monthSelect, yearSelect];
    const group = daySelect.closest(".gh-date-select");

    // A native select can only ever show its selected option's own text, so "มกราคม in the list,
    // ม.ค. once chosen" means rewriting that text as the list opens and closes. Expand every option
    // before the dropdown appears; collapse the chosen one back once it is closed.
    const setMonthLabels = (collapseSelected) => {
        for (const option of monthSelect.options) {
            const month = Number(option.value);
            if (!month) {
                continue;
            }

            option.textContent = collapseSelected && option.selected
                ? THAI_MONTH_ABBREVIATIONS[month - 1]
                : THAI_MONTH_NAMES[month - 1];
        }
    };

    ["mousedown", "touchstart", "focus", "keydown"].forEach((type) => {
        monthSelect.addEventListener(type, () => setMonthLabels(false));
    });
    monthSelect.addEventListener("blur", () => setMonthLabels(true));

    // กุมภาพันธ์ has 28 or 29 days, and short months have 30 — so the day list has to follow the
    // month and year. A selected day past the new end of the month clamps down to the last one.
    const syncDayOptions = () => {
        const dayCount = getDaysInBuddhistMonth(monthSelect.value, yearSelect.value);
        const selectedDay = Number(daySelect.value);

        if (daySelect.options.length - 1 !== dayCount) {
            const placeholder = daySelect.options[0];
            daySelect.replaceChildren(placeholder);
            for (let day = 1; day <= dayCount; day += 1) {
                daySelect.add(new Option(String(day), String(day)));
            }
        }

        if (selectedDay) {
            daySelect.value = String(Math.min(selectedDay, dayCount));
        }
    };

    const handleChange = () => {
        syncDayOptions();
        setMonthLabels(true);
        onChange?.();
    };

    selects.forEach((select) => select.addEventListener("change", handleChange));
    setMonthLabels(true);

    return {
        getValue() {
            return buddhistPartsToIso({
                day: daySelect.value,
                month: monthSelect.value,
                year: yearSelect.value,
            }) || "";
        },
        setValue(isoDate) {
            const parts = isoToBuddhistParts(isoDate);
            if (!parts) {
                selects.forEach((select) => {
                    select.value = "";
                });
                syncDayOptions();
                setMonthLabels(true);
                return;
            }

            yearSelect.value = String(parts.year);
            monthSelect.value = String(parts.month);
            syncDayOptions();
            daySelect.value = String(parts.day);
            setMonthLabels(true);
        },
        setError(hasError) {
            selects.forEach((select) => {
                select
                    .closest(".gh-date-select__segment")
                    ?.classList.toggle("gh-date-select__segment--error", Boolean(hasError));
            });
        },
        focus() {
            daySelect.focus();
        },
        get element() {
            return group;
        },
    };
}
