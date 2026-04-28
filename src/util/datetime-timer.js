/**
 * DateTimeTimer
 *
 * A tiny helper to track elapsed time using JavaScript Date objects.
 * It stores a "start" datetime, then calculates:
 *   elapsed = current datetime - started datetime
 *
 * Usage example:
 *   const timer = new DateTimeTimer();
 *   timer.start(); // starts now
 *   // ...do something...
 *   const elapsedMs = timer.getElapsedMilliseconds();
 *
 * You can also start with a specific datetime:
 *   timer.start(new Date("2026-04-27T10:00:00.000Z"));
 */
export default class DateTimeTimer {
    /**
     * @param {Date|null} startAt Optional initial start datetime.
     * If not provided (or invalid), timer is not started yet.
     */
    constructor(startAt = null) {
        this.startedAt = startAt instanceof Date ? startAt : null;
        this.stoppedAt = null;
    }

    /**
     * Start or reset the timer.
     * @param {Date|string|number} startAt Datetime to use as start point.
     * Defaults to the current datetime.
     * @returns {Date} The stored start datetime.
     */
    start(startAt = new Date()) {
        this.startedAt = startAt instanceof Date ? startAt : new Date(startAt);
        this.stoppedAt = null;
        return this.startedAt;
    }

    /**
     * Read the stored start datetime.
     * @returns {Date|null} Start datetime, or null if never started.
     */
    getStartedAt() {
        return this.startedAt;
    }

    /**
     * Stop timer at current datetime (or a provided datetime).
     * After stopping, elapsed time is frozen until start() is called again.
     *
     * @param {Date|string|number} stopAt Datetime to use as stop point.
     * Defaults to the current datetime.
     * @returns {Date|null} The stored stop datetime, or null if timer never started.
     */
    stop(stopAt = new Date()) {
        if (!this.startedAt) {
            return null;
        }

        this.stoppedAt = stopAt instanceof Date ? stopAt : new Date(stopAt);
        return this.stoppedAt;
    }

    reset() {
        this.startedAt = null;
        this.stoppedAt = null;
    }

    /**
     * Read the stored stop datetime.
     * @returns {Date|null} Stop datetime, or null when timer is still running.
     */
    getStoppedAt() {
        return this.stoppedAt;
    }

    /**
     * Get elapsed time in milliseconds.
     * Formula: now - startedAt
     *
     * @param {Date} currentTime Datetime used as "now" (defaults to current datetime).
     * @returns {number} Elapsed milliseconds. Returns 0 if timer has not started.
     */
    getElapsedMilliseconds(currentTime = new Date()) {
        if (!this.startedAt) {
            return 0;
        }

        const effectiveNow = this.stoppedAt ?? currentTime;
        return effectiveNow.getTime() - this.startedAt.getTime();
    }
}
