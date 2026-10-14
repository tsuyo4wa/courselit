import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { appointmentContext, settingsFor } from "@/services/appointments";
import { appointmentSettingsForType } from "@/lib/appointment-types";
import { appointmentTypeAdminData } from "@/services/appointment-types";
import AppointmentAdmin from "@/components/admin/appointments";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const h = await headers();
    const c = await appointmentContext(h);
    if (!c.owner) notFound();
    const { id } = await params;
    if (!appointmentSettingsForType(await settingsFor(c.domainId), id))
        notFound();
    return (
        <AppointmentAdmin
            mode="detail"
            initial={await appointmentTypeAdminData(c, h, id)}
        />
    );
}
