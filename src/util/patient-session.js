const PATIENT_SESSION_COOKIE = "patient_session";
const PATIENT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function parseCookieMap() {
    if (typeof document === "undefined") {
        return new Map();
    }

    return document.cookie
        .split(";")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .reduce((map, entry) => {
            const separatorIndex = entry.indexOf("=");
            const key = separatorIndex >= 0 ? entry.slice(0, separatorIndex) : entry;
            const value = separatorIndex >= 0 ? entry.slice(separatorIndex + 1) : "";
            map.set(key, value);
            return map;
        }, new Map());
}

export function buildPatientSession(patient) {
    const firstname = String(patient?.firstname || "").trim();
    const lastname = String(patient?.lastname || "").trim();
    const patientCode = String(patient?.hn || "").trim();

    return {
        patientId: patient?.id ?? null,
        patientCode,
        firstname,
        lastname,
    };
}

export function setPatientSessionCookie(patientSession) {
    if (typeof document === "undefined") {
        return;
    }

    const normalizedSession = {
        patientId: patientSession?.patientId ?? null,
        patientCode: String(patientSession?.patientCode || "").trim(),
        firstname: String(patientSession?.firstname || "").trim(),
        lastname: String(patientSession?.lastname || "").trim(),
    };

    document.cookie = [
        `${PATIENT_SESSION_COOKIE}=${encodeURIComponent(JSON.stringify(normalizedSession))}`,
        `Max-Age=${PATIENT_SESSION_MAX_AGE_SECONDS}`,
        "Path=/",
        "SameSite=Lax",
    ].join("; ");
}

export function getPatientSessionCookie() {
    const cookieValue = parseCookieMap().get(PATIENT_SESSION_COOKIE);
    if (!cookieValue) {
        return null;
    }

    try {
        const parsed = JSON.parse(decodeURIComponent(cookieValue));
        const patientCode = String(parsed?.patientCode || "").trim();

        if (!patientCode) {
            return null;
        }

        return {
            patientId: parsed?.patientId ?? null,
            patientCode,
            firstname: String(parsed?.firstname || "").trim(),
            lastname: String(parsed?.lastname || "").trim(),
        };
    } catch (error) {
        console.warn("Unable to parse patient session cookie:", error);
        return null;
    }
}

export function clearPatientSessionCookie() {
    if (typeof document === "undefined") {
        return;
    }

    document.cookie = [
        `${PATIENT_SESSION_COOKIE}=`,
        "Max-Age=0",
        "Path=/",
        "SameSite=Lax",
    ].join("; ");
}

export function getPatientSessionLabel(patientSession) {
    if (!patientSession) {
        return "";
    }

    if (patientSession.firstname) {
        return `${patientSession.firstname} ${patientSession.lastname || ""}`.trim();
    }

    return patientSession.patientCode || "";
}
