import { selectedAppointmentSettings } from "@/services/appointment-types";
import { NextRequest } from "next/server";
import {
    appointmentContext,
    settingsFor,
    availability,
    ownedBooking,
    rateLimit,
    AppointmentError,
} from "@/services/appointments";
import { appointmentJson, appointmentFailure } from "@/lib/appointment-http";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
    try {
        const c = await appointmentContext(req.headers);
        const q = req.nextUrl.searchParams;
        const from = q.get("from") || "";
        const days = Number(q.get("days") || 7);
        const preview = q.get("preview") === "1";
        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(from) ||
            Number.isNaN(Date.parse(from)) ||
            new Date(from).toISOString().slice(0, 10) !== from ||
            !Number.isInteger(days) ||
            days < 1 ||
            days > 14
        )
            throw new AppointmentError("invalid", 400);
        const base = await settingsFor(c.domainId);
        const b = q.get("bookingId")
            ? await ownedBooking(c, q.get("bookingId")!)
            : undefined;
        if (b && b.preview !== preview)
            throw new AppointmentError("forbidden", 403);
        const typeId = b ? b.typeId || "default" : q.get("typeId") || "default";
        if (b && q.get("typeId") && q.get("typeId") !== typeId)
            throw new AppointmentError("forbidden", 403);
        const s = selectedAppointmentSettings(base, typeId);
        await rateLimit(c, req.headers, "availability");
        return appointmentJson({
            slots: await availability(c, s, from, days, preview, b),
            timeZone: "Asia/Tokyo",
        });
    } catch (e) {
        return appointmentFailure(e);
    }
}
