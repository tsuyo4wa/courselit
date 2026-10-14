import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import {
    appointmentContext,
    settingsFor,
    gate,
    checkOrigin,
    rateLimit,
    AppointmentError,
} from "@/services/appointments";
import { Transient } from "@models/Appointment";
import {
    appointmentBody,
    appointmentJson,
    appointmentFailure,
} from "@/lib/appointment-http";
import {
    APPOINTMENT_LOGIN_COOKIE,
    appointmentEmailHash,
    appointmentIntentKey,
} from "@/lib/appointment-login-intent";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
    try {
        const c = await appointmentContext(req.headers);
        checkOrigin(c, req.headers);
        gate(c, await settingsFor(c.domainId), false);
        await rateLimit(c, req.headers, "login-intent");
        const body = z
            .object({ email: z.string().trim().email().max(254) })
            .strict()
            .safeParse(await appointmentBody(req));
        if (!body.success) throw new AppointmentError("invalid", 400);
        const token = randomBytes(32).toString("base64url");
        await Transient.create({
            key: appointmentIntentKey(token),
            value: {
                domainId: c.domainId,
                emailHash: appointmentEmailHash(c.domainId, body.data.email),
            },
            expiresAt: new Date(Date.now() + 1800000),
        });
        const r = appointmentJson({ ok: true });
        r.cookies.set(APPOINTMENT_LOGIN_COOKIE, token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 1800,
        });
        return r;
    } catch (e) {
        return appointmentFailure(e);
    }
}
export async function DELETE(req: NextRequest) {
    try {
        const c = await appointmentContext(req.headers);
        checkOrigin(c, req.headers);
        const r = appointmentJson({ ok: true });
        r.cookies.set(APPOINTMENT_LOGIN_COOKIE, "", {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 0,
        });
        return r;
    } catch (e) {
        return appointmentFailure(e);
    }
}
