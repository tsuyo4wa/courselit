import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { appointmentContext, settingsFor } from "@/services/appointments";
import { appointmentTypeSummaries } from "@/lib/appointment-types";
import AppointmentList from "@/components/admin/appointment-list";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ connection?: string }>;
}) {
    const c = await appointmentContext(await headers());
    if (!c.owner) notFound();
    const flag = (await searchParams).connection;
    if (flag)
        redirect(
            `/dashboard/appointments/connection?connection=${flag === "connected" ? "connected" : "failed"}`,
        );
    const s = await settingsFor(c.domainId);
    return (
        <AppointmentList
            initial={{
                types: appointmentTypeSummaries(s),
                connected: !!s.refresh,
                account: s.account,
            }}
        />
    );
}
