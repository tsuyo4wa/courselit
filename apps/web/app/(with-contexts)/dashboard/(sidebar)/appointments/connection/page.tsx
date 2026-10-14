import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { appointmentContext } from "@/services/appointments";
import { appointmentTypeAdminData } from "@/services/appointment-types";
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
    return (
        <AppointmentAdmin
            mode="connection"
            connectionStatus={(await searchParams).connection}
            initial={await appointmentTypeAdminData(c, h)}
        />
    );
}
