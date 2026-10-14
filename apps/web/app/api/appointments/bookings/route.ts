import { NextRequest } from "next/server";
import {
    appointmentContext,
    settingsFor,
    listBookings,
    checkOrigin,
    originFor,
    rateLimit,
    mutateBooking,
    AppointmentError,
} from "@/services/appointments";
import { bookingInputSchema } from "@/lib/appointment-input";
import {
    appointmentJson,
    appointmentFailure,
    appointmentBody,
} from "@/lib/appointment-http";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
    try {
        const c = await appointmentContext(req.headers);
        return appointmentJson({
            bookings: await listBookings(c, await settingsFor(c.domainId)),
        });
    } catch (e) {
        return appointmentFailure(e);
    }
}
export async function POST(req: NextRequest) {
    try {
        const c = await appointmentContext(req.headers);
        checkOrigin(c, req.headers);
        await rateLimit(c, req.headers, "book");
        const input = bookingInputSchema.safeParse(await appointmentBody(req));
        if (!input.success) throw new AppointmentError("invalid", 400);
        return appointmentJson({
            booking: await mutateBooking(
                c,
                input.data,
                originFor(c, req.headers),
            ),
        });
    } catch (e) {
        return appointmentFailure(e);
    }
}
