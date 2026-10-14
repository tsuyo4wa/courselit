import { NextRequest } from "next/server";
import {
    appointmentContext,
    requireOwner,
    checkOrigin,
    rateLimit,
} from "@/services/appointments";
import {
    appointmentTypeAdminData,
    saveAppointmentType,
} from "@/services/appointment-types";
import {
    appointmentBody,
    appointmentJson,
    appointmentFailure,
} from "@/lib/appointment-http";
export const runtime = "nodejs";
interface Params {
    params: Promise<{ id: string }>;
}
export async function GET(req: NextRequest, { params }: Params) {
    try {
        const c = await appointmentContext(req.headers);
        requireOwner(c);
        return appointmentJson(
            await appointmentTypeAdminData(c, req.headers, (await params).id),
        );
    } catch (e) {
        return appointmentFailure(e);
    }
}
export async function POST(req: NextRequest, { params }: Params) {
    try {
        const c = await appointmentContext(req.headers);
        requireOwner(c);
        checkOrigin(c, req.headers);
        await rateLimit(c, req.headers, "types");
        return appointmentJson(
            await saveAppointmentType(
                c,
                (await params).id,
                await appointmentBody(req),
            ),
        );
    } catch (e) {
        return appointmentFailure(e);
    }
}
