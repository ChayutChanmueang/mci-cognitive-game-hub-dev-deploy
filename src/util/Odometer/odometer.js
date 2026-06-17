const DEFAULT_DIGIT_COUNT = 2;
const DEFAULT_DURATION_MS = 520;

function normalizeValue(value, digitCount) {
    const safeValue = Math.max(0, Math.round(Number(value) || 0));
    return String(safeValue).padStart(digitCount, "0").slice(-digitCount);
}

function createDigitElement(value) {
    const digitEl = document.createElement("span");
    digitEl.className = "countdown-odometer__digit";

    const trackEl = document.createElement("span");
    trackEl.className = "countdown-odometer__track";

    const valueEl = document.createElement("span");
    valueEl.className = "countdown-odometer__value";
    valueEl.textContent = value;

    trackEl.append(valueEl);
    digitEl.append(trackEl);

    return { digitEl, trackEl };
}

function setStableDigit(trackEl, value) {
    trackEl.replaceChildren();
    trackEl.style.transitionDuration = "0ms";
    trackEl.style.transform = "translateY(0)";

    const valueEl = document.createElement("span");
    valueEl.className = "countdown-odometer__value";
    valueEl.textContent = value;
    trackEl.append(valueEl);
}

export class RollingCountdownTimer {
    constructor(options = {}) {
        const {
            el,
            value = 0,
            digitCount = DEFAULT_DIGIT_COUNT,
            durationMs = DEFAULT_DURATION_MS,
        } = options;

        if (!el) {
            throw new Error("RollingCountdownTimer requires an element.");
        }

        this.el = el;
        this.digitCount = digitCount;
        this.durationMs = durationMs;
        this.currentValue = normalizeValue(value, this.digitCount);
        this.digits = [];

        this.render();
    }

    render() {
        this.el.classList.add("countdown-odometer");
        this.el.replaceChildren();
        this.digits = this.currentValue.split("").map((value) => {
            const digit = createDigitElement(value);
            this.el.append(digit.digitEl);
            return {
                ...digit,
                value,
                animationCleanup: null,
            };
        });
    }

    update(value) {
        const nextValue = normalizeValue(value, this.digitCount);
        if (nextValue === this.currentValue) return;

        nextValue.split("").forEach((nextDigit, index) => {
            const digit = this.digits[index];
            if (!digit) return;
            if (digit.value === nextDigit) {
                if (digit.animationCleanup) {
                    digit.animationCleanup();
                    digit.animationCleanup = null;
                }
                digit.value = nextDigit;
                setStableDigit(digit.trackEl, nextDigit);
                return;
            }

            this.animateDigit(digit, nextDigit);
        });

        this.currentValue = nextValue;
    }

    animateDigit(digit, nextDigit) {
        const currentDigit = digit.value;

        if (digit.animationCleanup) {
            digit.animationCleanup();
            digit.animationCleanup = null;
        }

        const nextValueEl = document.createElement("span");
        nextValueEl.className = "countdown-odometer__value";
        nextValueEl.textContent = nextDigit;

        const currentValueEl = document.createElement("span");
        currentValueEl.className = "countdown-odometer__value";
        currentValueEl.textContent = currentDigit;

        digit.trackEl.replaceChildren(nextValueEl, currentValueEl);
        digit.trackEl.style.transitionDuration = "0ms";
        digit.trackEl.style.transform = "translateY(-50%)";

        digit.trackEl.getBoundingClientRect();

        digit.trackEl.style.transitionDuration = `${this.durationMs}ms`;
        digit.trackEl.style.transform = "translateY(0)";

        const finishAnimation = () => {
            digit.trackEl.removeEventListener("transitionend", finishAnimation);
            digit.animationCleanup = null;
            digit.value = nextDigit;
            setStableDigit(digit.trackEl, nextDigit);
        };

        digit.animationCleanup = () => {
            digit.trackEl.removeEventListener("transitionend", finishAnimation);
        };
        digit.trackEl.addEventListener("transitionend", finishAnimation, { once: true });
    }

    destroy() {
        this.digits.forEach((digit) => {
            if (digit.animationCleanup) {
                digit.animationCleanup();
                digit.animationCleanup = null;
            }
        });
        this.el.replaceChildren();
        this.el.classList.remove("countdown-odometer");
    }
}
