import type { AppointmentUiProps } from "@courselit/common-models";
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
import { appointmentSettingsForType } from "@/lib/appointment-types";
import AppointmentBooker from "@/components/public/appointment-booker";
export default async function AppointmentPreview({
    typeId = "default",
    sample = false,
}: Pick<AppointmentUiProps, "typeId" | "sample">) {
    const c = await appointmentContext(await headers());
    if (!c.owner) notFound();
    const base = await settingsFor(c.domainId);
    const s = appointmentSettingsForType(base, typeId);
    if (!s) notFound();
    const site = await getFullSiteSetup(await getAddressFromHeaders(headers));
    const themeStyles = site?.theme
        ? generateThemeStyles(site.theme).replaceAll(
              ".courselit-theme",
              ".appointment-booking-shell",
          )
        : "";
    return (
        <AppointmentBooker
            preview
            typeId={typeId}
            themeStyles={themeStyles}
            sample={sample}
            durationMinutes={s.config.duration}
            horizonDays={s.config.horizonDays}
            title={s.config.title}
            description={s.config.description}
            loggedIn
            initialBookings={
                sample
                    ? []
                    : (await listBookings(c, base, false, typeId)).filter(
                          (b) => b.preview,
                      )
            }
        />
    );
}
