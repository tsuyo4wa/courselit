import AppointmentPreview from "@/components/admin/appointment-preview";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function Page({
    searchParams,
    params,
}: {
    searchParams: Promise<{ sample?: string }>;
    params: Promise<{ id: string }>;
}) {
    return (
        <AppointmentPreview
            sample={(await searchParams).sample === "1"}
            typeId={(await params).id}
        />
    );
}
