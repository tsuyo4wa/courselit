import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
    appointmentContext,
    settingsFor,
    listBookings,
} from "@/services/appointments";
import AppointmentBooker from "@/components/public/appointment-booker";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function Page() {
    const c = await appointmentContext(await headers());
    const s = await settingsFor(c.domainId);
    const bookings = c.user
        ? (await listBookings(c, s)).filter((b) => !b.preview)
        : [];
    if (!s.config.enabled && !bookings.length) notFound();
    return (
        <AppointmentBooker
            preview={false}
            durationMinutes={s.config.duration}
            horizonDays={s.config.horizonDays}
            title={s.config.title}
            description={s.config.description}
            loggedIn={!!c.user}
            initialBookings={bookings}
        />
    );
}
