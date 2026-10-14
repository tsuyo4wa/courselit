import { appointmentText as t } from "@/config/strings";
export async function appointmentRequest(
    path: string,
    body?: unknown,
    signal?: AbortSignal,
) {
    const r = await fetch("/api/appointments/" + path, {
        method: body ? "POST" : "GET",
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
        signal,
    });
    const data = await r.json();
    if (!r.ok)
        throw new Error(
            (t.errors as Record<string, string>)[data.error] ||
                t.errors.unavailable,
        );
    return data;
}
export function appointmentTime(value: string) {
    return new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        month: "long",
        day: "numeric",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}
