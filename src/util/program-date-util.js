const DAY_MS = 24 * 60 * 60 * 1000;

export class ProgramDateCalculator {
    static getLocalDayStart(value = new Date()) {
        const date = new Date(value);
        const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
        safeDate.setHours(0, 0, 0, 0);
        return safeDate;
    }

    static getProgramDateRange(value = new Date()) {
        const start = ProgramDateCalculator.getLocalDayStart(value);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        return {
            playedFrom: start.toISOString(),
            playedTo: end.toISOString(),
        };
    }

    static getDateKey(value = new Date()) {
        const date = ProgramDateCalculator.getLocalDayStart(value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    static getProgramDayDate(startedProgram, programDay) {
        const date = ProgramDateCalculator.getLocalDayStart(startedProgram || new Date());
        date.setDate(date.getDate() + Math.max(0, (Number(programDay) || 1) - 1));
        return date;
    }

    static getProgramEndDate(startedProgram, programDayCount) {
        const parsedDayCount = Math.floor(Number(programDayCount) || 0);
        if (parsedDayCount <= 0) {
            return null;
        }

        return ProgramDateCalculator.getProgramDayDate(startedProgram, parsedDayCount);
    }

    static getProgramDayStatus(startedProgram, programDayCount, currentDate = new Date()) {
        const parsedDayCount = Math.floor(Number(programDayCount) || 0);
        if (parsedDayCount <= 0) {
            return {
                programDay: 0,
                rawProgramDay: 0,
                programDayCount: 0,
                programStarted: false,
                programEnded: false,
                programEndDate: null,
            };
        }

        const startDay = ProgramDateCalculator.getLocalDayStart(startedProgram || new Date());
        const currentDay = ProgramDateCalculator.getLocalDayStart(currentDate);
        const rawProgramDay = Math.floor((currentDay.getTime() - startDay.getTime()) / DAY_MS) + 1;
        const programDay = Math.min(Math.max(rawProgramDay, 1), parsedDayCount);
        const programEndDate = ProgramDateCalculator.getProgramEndDate(startDay, parsedDayCount);

        return {
            programDay,
            rawProgramDay,
            programDayCount: parsedDayCount,
            programStarted: rawProgramDay >= 1,
            programEnded: rawProgramDay > parsedDayCount,
            programEndDate,
        };
    }

    static formatThaiDisplayDate(value, { shortYear = true } = {}) {
        if (!value) {
            return "";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const buddhistYear = String(date.getFullYear() + 543);
        const year = shortYear ? buddhistYear.slice(-2) : buddhistYear;
        return `${day}/${month}/${year}`;
    }
}

export const getLocalDayStart = (...args) => ProgramDateCalculator.getLocalDayStart(...args);
export const getProgramDateRange = (...args) => ProgramDateCalculator.getProgramDateRange(...args);
export const getDateKey = (...args) => ProgramDateCalculator.getDateKey(...args);
export const getProgramDayDate = (...args) => ProgramDateCalculator.getProgramDayDate(...args);
export const getProgramEndDate = (...args) => ProgramDateCalculator.getProgramEndDate(...args);
export const getProgramDayStatus = (...args) => ProgramDateCalculator.getProgramDayStatus(...args);
export const formatThaiProgramDate = (...args) => ProgramDateCalculator.formatThaiDisplayDate(...args);
