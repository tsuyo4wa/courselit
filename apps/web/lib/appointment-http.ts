import { NextResponse } from "next/server";
import { AppointmentError } from "@/services/appointment-google";
export function appointmentJson(value: unknown, status = 200) {
    return NextResponse.json(value, {
        status,
        headers: {
            "Cache-Control": "no-store, private",
            "X-Robots-Tag": "noindex, nofollow",
        },
    });
}
export function appointmentFailure(error: unknown) {
    return appointmentJson(
        {
            error:
                error instanceof AppointmentError ? error.code : "unavailable",
        },
        error instanceof AppointmentError ? error.status : 503,
    );
}
export async function appointmentBody(req: Request) {
    if (!req.headers.get("content-type")?.startsWith("application/json"))
        throw new AppointmentError("invalid", 400);
    if (Number(req.headers.get("content-length") || 0) > 24000)
        throw new AppointmentError("invalid", 413);
    const reader = req.body?.getReader();
    if (!reader) throw new AppointmentError("invalid", 400);
    const decoder = new TextDecoder();
    let size = 0;
    let raw = "";
    for (;;) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.byteLength;
        if (size > 24000) {
            await reader.cancel();
            throw new AppointmentError("invalid", 413);
        }
        raw += decoder.decode(part.value, { stream: true });
    }
    raw += decoder.decode();
    try {
        return JSON.parse(raw);
    } catch {
        throw new AppointmentError("invalid", 400);
    }
}
