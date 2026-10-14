/** Recognize the explicit consultation login flow without accepting arbitrary return URLs. */
export function isAppointmentLoginDestination(value?: string) {
    if (value === "/appointments") return true;
    if (!value || !/^\/lp\/[a-z0-9-]+\?/.test(value)) return false;
    try {
        const url = new URL(value, "https://school.invalid");
        const slot = url.searchParams.get("slot") || "";
        return (
            url.origin === "https://school.invalid" &&
            /^\/lp\/[a-z0-9-]+$/.test(url.pathname) &&
            Array.from(url.searchParams.keys()).length === 1 &&
            !url.hash &&
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(slot) &&
            Number.isFinite(Date.parse(slot))
        );
    } catch {
        return false;
    }
}
