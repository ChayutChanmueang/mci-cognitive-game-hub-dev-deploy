const THAI_PHONE_DIGIT_LIMIT = 10;

export function normalizeThaiPhoneNumber(value) {
    return String(value || "")
        .replaceAll(/\D/g, "")
        .slice(0, THAI_PHONE_DIGIT_LIMIT);
}

export function formatThaiPhoneNumber(value) {
    const digits = normalizeThaiPhoneNumber(value);

    if (digits.length <= 3) {
        return digits;
    }

    if (digits.length <= 6) {
        const firstGroup = digits.slice(0, 3);
        const secondGroup = digits.slice(3);
        return `${firstGroup}-${secondGroup}`;
    }

    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function isCompleteThaiPhoneNumber(value) {
    return normalizeThaiPhoneNumber(value).length === THAI_PHONE_DIGIT_LIMIT;
}
