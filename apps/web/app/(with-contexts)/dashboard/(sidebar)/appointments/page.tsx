import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
    appointmentContext,
    settingsFor,
    listBookings,
    originFor,
} from "@/services/appointments";
import AppointmentAdmin from "@/components/admin/appointments";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ connection?: string }>;
}) {
    const h = await headers();
    const c = await appointmentContext(h);
    if (!c.owner) notFound();
    const s = await settingsFor(c.domainId);
    return (
        <AppointmentAdmin
            connectionStatus={(await searchParams).connection}
            initial={{
                config: s.config,
                clientId: s.clientId,
                secretConfigured: !!s.secret,
                connected: !!s.refresh,
                account: s.account,
                checkedAt: s.checkedAt?.toISOString(),
                redirectUri:
                    originFor(c, h) + "/api/appointments/google/callback",
                calendars: [],
                bookings: await listBookings(c, s, true),
            }}
        />
    );
}
