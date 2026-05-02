export function calculateAgeFromBirthDate(birthDateValue) {
    const rawValue = String(birthDateValue || "").trim();
    if (!rawValue) {
        return null;
    }

    const parsedBirthDate = new Date(rawValue);
    if (Number.isNaN(parsedBirthDate.getTime())) {
        return null;
    }

    const today = new Date();
    let age = today.getFullYear() - parsedBirthDate.getFullYear();
    const hasBirthdayPassedThisYear = (
        today.getMonth() > parsedBirthDate.getMonth()
        || (
            today.getMonth() === parsedBirthDate.getMonth()
            && today.getDate() >= parsedBirthDate.getDate()
        )
    );

    if (!hasBirthdayPassedThisYear) {
        age -= 1;
    }

    if (age < 0) {
        return null;
    }

    return age;
}
