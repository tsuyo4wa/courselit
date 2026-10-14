import AppointmentPage from "@/components/public/appointment-page";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    return <AppointmentPage typeId={(await params).id} />;
}
