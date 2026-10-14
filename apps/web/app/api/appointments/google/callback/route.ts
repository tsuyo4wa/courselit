import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import {
    appointmentContext,
    requireOwner,
    settingsFor,
    originFor,
    hostLock,
    AppointmentError,
} from "@/services/appointments";
import {
    AppointmentGoogle,
    exchangeCode,
    unseal,
} from "@/services/appointment-google";
import { Settings, Transient, Bookings } from "@models/Appointment";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
    let target = new URL("/dashboard/appointments", req.url);
    target.searchParams.set("connection", "failed");
    try {
        const c = await appointmentContext(req.headers);
        requireOwner(c);
        const origin = originFor(c, req.headers);
        target = new URL("/dashboard/appointments?connection=failed", origin);
        const state = req.nextUrl.searchParams.get("state") || "";
        if (!state || state !== req.cookies.get("appointment_oauth")?.value)
            throw new AppointmentError("invalid", 400);
        const key = "oauth:" + createHash("sha256").update(state).digest("hex");
        const record = await Transient.findOneAndDelete({
            key,
            expiresAt: { $gt: new Date() },
            "value.domainId": c.domainId,
            "value.userId": c.user!.userId,
            "value.origin": origin,
        }).lean();
        const code = req.nextUrl.searchParams.get("code");
        if (!record || !code || code.length > 4096)
            throw new AppointmentError("invalid", 400);
        await hostLock(c.domainId, async () => {
            if (
                await Bookings.exists({
                    domainId: c.domainId,
                    status: { $ne: "cancelled" },
                    $or: [
                        { end: { $gt: new Date().toISOString() } },
                        {
                            status: {
                                $in: [
                                    "needs_review",
                                    "pending",
                                    "changing",
                                    "cancelling",
                                ],
                            },
                        },
                    ],
                })
            )
                throw new AppointmentError("active_bookings", 409);
            const s = await settingsFor(c.domainId);
            if (s.config.enabled)
                throw new AppointmentError("active_bookings", 409);
            const token = await exchangeCode(
                s,
                code,
                unseal(record.value.verifier, c.domainId),
                origin + "/api/appointments/google/callback",
            );
            const list = await AppointmentGoogle.listWithToken(token.access);
            await Settings.updateOne(
                { domainId: c.domainId },
                {
                    $set: {
                        refresh: token.refresh,
                        account:
                            list.find((x) => x.primary)?.id ||
                            "Google Calendar",
                        updatedAt: new Date(),
                    },
                    $unset: { checkedAt: 1 },
                },
            );
        });
        target.searchParams.set("connection", "connected");
    } catch {
        /* No provider errors, credentials, code or user data in redirect/logs. */
    }
    const r = NextResponse.redirect(target);
    r.headers.set("Cache-Control", "no-store");
    r.cookies.set("appointment_oauth", "", {
        maxAge: 0,
        path: "/api/appointments/google/callback",
        secure: true,
        httpOnly: true,
        sameSite: "lax",
    });
    return r;
}
