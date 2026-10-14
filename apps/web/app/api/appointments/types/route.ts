import { NextRequest } from "next/server";
import {
    appointmentContext,
    settingsFor,
    requireOwner,
    checkOrigin,
    rateLimit,
} from "@/services/appointments";
import { createAppointmentType } from "@/services/appointment-types";
import { appointmentTypeSummaries } from "@/lib/appointment-types";
import {
    appointmentBody,
    appointmentJson,
    appointmentFailure,
} from "@/lib/appointment-http";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
    try {
        const c = await appointmentContext(req.headers);
        requireOwner(c);
        const s = await settingsFor(c.domainId);
        return appointmentJson({
            types: appointmentTypeSummaries(s),
            connected: !!s.refresh,
            account: s.account,
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
        await rateLimit(c, req.headers, "types");
        return appointmentJson(
            await createAppointmentType(c, await appointmentBody(req)),
        );
    } catch (e) {
        return appointmentFailure(e);
    }
}
