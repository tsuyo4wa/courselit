import { thankYouStrings } from "@/config/strings";

// Only trusted product settings are accepted; request/query parameters never set a destination.
export function normalizeThankYouUrl(value?: string | null): string {
    if (value == null || value === "") return "";
    if (
        typeof value !== "string" ||
        value.length > 2048 ||
        /[\u0000-\u001f\u007f]/.test(value)
    ) {
        throw new Error(thankYouStrings.invalid);
    }
    const input = value.trim();
    if (!input) return "";
    let url: URL;
    try {
        url = new URL(input);
    } catch {
        throw new Error(thankYouStrings.invalid);
    }
    const host = url.hostname.toLowerCase();
    if (
        !/^https:\/\//i.test(input) ||
        url.protocol !== "https:" ||
        url.username ||
        url.password ||
        (url.port && url.port !== "443") ||
        !host.includes(".") ||
        host.endsWith(".") ||
        host.endsWith(".localhost") ||
        host.endsWith(".local") ||
        host.endsWith(".internal") ||
        /^[0-9.]+$/.test(host) ||
        host.includes(":") ||
        /^\/(?:api|checkout|login|logout|auth)(?:\/|$)/i.test(url.pathname)
    ) {
        throw new Error(thankYouStrings.invalid);
    }
    return url.href;
}

// Fail closed for malformed legacy settings without breaking enrollment/payment verification.
export function readThankYouUrl(value?: string | null): string | undefined {
    try {
        return normalizeThankYouUrl(value) || undefined;
    } catch {
        return undefined;
    }
}
