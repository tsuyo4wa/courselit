import { getFullSiteSetup } from "@ui-lib/utils";
import { getAddressFromHeaders } from "@/app/actions";
import { generateThemeStyles } from "@/lib/theme-styles";
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
export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ sample?: string }>;
}) {
    const c = await appointmentContext(await headers());
    if (!c.owner) notFound();
    const s = await settingsFor(c.domainId);
    const site = await getFullSiteSetup(await getAddressFromHeaders(headers));
    const themeStyles = site?.theme
        ? generateThemeStyles(site.theme).replaceAll(
              ".courselit-theme",
              ".appointment-booking-shell",
          )
        : "";
    const sample = (await searchParams).sample === "1";
    return (
        <AppointmentBooker
            preview
            themeStyles={themeStyles}
            sample={sample}
            title={s.config.title}
            description={s.config.description}
            loggedIn
            initialBookings={
                sample
                    ? []
                    : (await listBookings(c, s)).filter((b) => b.preview)
            }
        />
    );
}
