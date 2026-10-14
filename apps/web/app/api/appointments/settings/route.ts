import { NextRequest } from "next/server";
import { createHash, randomBytes } from "crypto";
import { z } from "zod";
import { Settings, Bookings, Transient } from "@models/Appointment";
import {
    appointmentContext,
    requireOwner,
    settingsFor,
    checkOrigin,
    originFor,
    hostLock,
    ready,
    rateLimit,
    listBookings,
    AppointmentError,
} from "@/services/appointments";
import { AppointmentGoogle, seal } from "@/services/appointment-google";
import { settingsInputSchema } from "@/lib/appointment-input";
import {
    appointmentJson,
    appointmentFailure,
    appointmentBody,
} from "@/lib/appointment-http";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
    try {
        const c = await appointmentContext(req.headers);
        requireOwner(c);
        const s = await settingsFor(c.domainId);
        return appointmentJson({
            config: s.config,
            clientId: s.clientId,
            secretConfigured: !!s.secret,
            connected: !!s.refresh,
            account: s.account,
            checkedAt: s.checkedAt?.toISOString(),
            redirectUri:
                originFor(c, req.headers) + "/api/appointments/google/callback",
            calendars: [],
            bookings: await listBookings(c, s, true),
        });
    } catch (e) {
        return appointmentFailure(e);
    }
}
export async function POST(req: NextRequest) {
    try {
        const c = await appointmentContext(req.headers);
        requireOwner(c);
        checkOrigin(c, req.headers);
        await rateLimit(c, req.headers, "settings");
        const raw = await appointmentBody(req);
        const action = z
            .enum(["save", "check", "connect", "disconnect"])
            .parse(raw.action);
        if (action === "connect") {
            const s = await settingsFor(c.domainId);
            if (!s.clientId || !s.secret)
                throw new AppointmentError("setup_required", 400);
            const state = randomBytes(32).toString("base64url");
            const verifier = randomBytes(32).toString("base64url");
            const hash = createHash("sha256").update(state).digest("hex");
            const origin = originFor(c, req.headers);
            await Transient.create({
                key: "oauth:" + hash,
                value: {
                    domainId: c.domainId,
                    userId: c.user!.userId,
                    verifier: seal(verifier, c.domainId),
                    origin,
                },
                expiresAt: new Date(Date.now() + 600000),
            });
            const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
            url.search = new URLSearchParams({
                client_id: s.clientId,
                redirect_uri: origin + "/api/appointments/google/callback",
                response_type: "code",
                scope: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.events.freebusy https://www.googleapis.com/auth/calendar.calendarlist.readonly",
                access_type: "offline",
                prompt: "consent",
                state,
                code_challenge_method: "S256",
                code_challenge: createHash("sha256")
                    .update(verifier)
                    .digest("base64url"),
            }).toString();
            const r = appointmentJson({ url: url.toString() });
            r.cookies.set("appointment_oauth", state, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                path: "/api/appointments/google/callback",
                maxAge: 600,
            });
            return r;
        }
        const result = await hostLock(c.domainId, async () => {
            const s = await settingsFor(c.domainId);
            if (action === "check") {
                const provider = new AppointmentGoogle(s);
                const calendars = await provider.calendars();
                if (s.config.calendarId) {
                    await provider.validateCalendars();
                    await provider.busy(
                        new Date().toISOString(),
                        new Date(Date.now() + 86400000).toISOString(),
                    );
                }
                await Settings.updateOne(
                    { domainId: c.domainId },
                    { $set: { checkedAt: new Date() } },
                );
                return { calendars, checkedAt: new Date().toISOString() };
            }
            const protectedBookings = await Bookings.exists({
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
            });
            if (action === "disconnect") {
                if (s.config.enabled || protectedBookings)
                    throw new AppointmentError("active_bookings", 409);
                await Settings.updateOne(
                    { domainId: c.domainId },
                    {
                        $set: { refresh: "", account: "" },
                        $unset: { checkedAt: 1 },
                    },
                );
                return { ok: true };
            }
            const parsed = settingsInputSchema.safeParse(raw.data);
            if (!parsed.success) throw new AppointmentError("invalid", 400);
            const input = parsed.data;
            const credentialChange =
                (input.clientId !== undefined &&
                    input.clientId !== s.clientId) ||
                !!input.clientSecret;
            if (
                protectedBookings &&
                (credentialChange ||
                    input.config.calendarId !== s.config.calendarId)
            )
                throw new AppointmentError("active_bookings", 409);
            if (credentialChange) {
                s.clientId = input.clientId ?? s.clientId;
                if (input.clientSecret)
                    s.secret = seal(input.clientSecret, c.domainId);
                s.refresh = "";
                s.account = "";
                s.checkedAt = undefined;
            }
            s.config = input.config;
            if (s.config.enabled) {
                if (!ready(s))
                    throw new AppointmentError("setup_required", 400);
                const google = new AppointmentGoogle(s);
                await google.validateCalendars();
                await google.busy(
                    new Date().toISOString(),
                    new Date(Date.now() + 86400000).toISOString(),
                );
                s.checkedAt = new Date();
            }
            const value = { ...s, updatedAt: new Date() };
            delete (value as typeof value & { _id?: unknown })._id;
            if (!s.checkedAt) delete value.checkedAt;
            await Settings.updateOne(
                { domainId: c.domainId },
                {
                    $set: value,
                    ...(!s.checkedAt ? { $unset: { checkedAt: 1 } } : {}),
                },
                { upsert: true },
            );
            return { ok: true };
        });
        return appointmentJson(result);
    } catch (e) {
        return appointmentFailure(
            e instanceof z.ZodError ? new AppointmentError("invalid", 400) : e,
        );
    }
}
