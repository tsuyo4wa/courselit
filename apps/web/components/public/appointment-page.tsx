import type { AppointmentUiProps } from "@courselit/common-models";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
    appointmentContext,
    settingsFor,
    listBookings,
} from "@/services/appointments";
import { appointmentSettingsForType } from "@/lib/appointment-types";
import AppointmentBooker from "./appointment-booker";
export default async function AppointmentPage({
    typeId = "default",
}: Pick<AppointmentUiProps, "typeId">) {
    const c = await appointmentContext(await headers());
    const base = await settingsFor(c.domainId);
    const s = appointmentSettingsForType(base, typeId);
    if (!s) notFound();
    const bookings = c.user
        ? (await listBookings(c, base, false, typeId)).filter((b) => !b.preview)
        : [];
    if (!s.config.enabled && !bookings.length) notFound();
    return (
        <AppointmentBooker
            typeId={typeId}
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
