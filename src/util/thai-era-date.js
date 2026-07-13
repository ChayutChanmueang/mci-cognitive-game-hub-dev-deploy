// US-E9-11: the database stores ISO Gregorian (ค.ศ.) dates; the sign-up form collects and shows
// Buddhist-era (พ.ศ.) years only. Conversion happens at the UI boundary — never in storage.

const BUDDHIST_ERA_OFFSET = 543;

export const THAI_MONTH_NAMES = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
];

// Shown in the closed select, where the full name would be cropped.
export const THAI_MONTH_ABBREVIATIONS = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
];

export function toBuddhistYear(gregorianYear) {
    return Number(gregorianYear) + BUDDHIST_ERA_OFFSET;
}

export function toGregorianYear(buddhistYear) {
    return Number(buddhistYear) - BUDDHIST_ERA_OFFSET;
}

export function getCurrentBuddhistYear() {
    return toBuddhistYear(new Date().getFullYear());
}

// Month is 1-indexed. Day 0 of the next month is the last day of this one.
export function getDaysInBuddhistMonth(month, buddhistYear) {
    const monthNumber = Number(month);
    const yearNumber = Number(buddhistYear);

    if (!monthNumber || monthNumber < 1 || monthNumber > 12) {
        return 31;
    }

    if (!yearNumber) {
        return 31;
    }

    return new Date(Date.UTC(toGregorianYear(yearNumber), monthNumber, 0)).getUTCDate();
}

/** Split an ISO ค.ศ. date ("1967-01-15") into พ.ศ. parts for the day/month/year selects. */
export function isoToBuddhistParts(isoDate) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoDate || "").trim());
    if (!match) {
        return null;
    }

    const [, year, month, day] = match;
    return {
        day: Number(day),
        month: Number(month),
        year: toBuddhistYear(year),
    };
}

/** Build an ISO ค.ศ. date from พ.ศ. parts. Returns null unless the parts are a real calendar date. */
export function buddhistPartsToIso({ day, month, year } = {}) {
    const dayNumber = Number(day);
    const monthNumber = Number(month);
    const buddhistYear = Number(year);

    if (!dayNumber || !monthNumber || !buddhistYear) {
        return null;
    }

    if (monthNumber < 1 || monthNumber > 12) {
        return null;
    }

    // Reject 31 กุมภาพันธ์ and friends — the Date constructor would roll them into the next month.
    if (dayNumber < 1 || dayNumber > getDaysInBuddhistMonth(monthNumber, buddhistYear)) {
        return null;
    }

    const gregorianYear = toGregorianYear(buddhistYear);
    return [
        String(gregorianYear).padStart(4, "0"),
        String(monthNumber).padStart(2, "0"),
        String(dayNumber).padStart(2, "0"),
    ].join("-");
}
