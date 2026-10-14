import AppointmentPage from "@/components/public/appointment-page";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default function Page() {
    return <AppointmentPage />;
}
