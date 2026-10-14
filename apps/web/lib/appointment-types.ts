import type {
    AppointmentSettings,
    AppointmentTypeSummary,
} from "@courselit/common-models";
export const DEFAULT_APPOINTMENT_TYPE = "default";
export function appointmentTypeSummaries(
    s: AppointmentSettings,
): AppointmentTypeSummary[] {
    return [
        {
            typeId: DEFAULT_APPOINTMENT_TYPE,
            title: s.config.title,
            duration: s.config.duration,
            enabled: s.config.enabled,
            version: s.configVersion || 1,
        },
        ...(s.types || []).map((t) => ({
            typeId: t.typeId,
            title: t.config.title,
            duration: t.config.duration,
            enabled: t.config.enabled,
            version: t.version,
        })),
    ];
}
/** Reuse the single Google connection and calendar selection for every consultation. */
export function appointmentSettingsForType(
    s: AppointmentSettings,
    typeId = DEFAULT_APPOINTMENT_TYPE,
): AppointmentSettings | null {
    if (typeId === DEFAULT_APPOINTMENT_TYPE) return s;
    const t = s.types?.find((t) => t.typeId === typeId);
    return t
        ? {
              ...s,
              config: {
                  ...t.config,
                  calendarId: s.config.calendarId,
                  busyCalendarIds: s.config.busyCalendarIds,
              },
          }
        : null;
}
export function appointmentTypePath(typeId = DEFAULT_APPOINTMENT_TYPE) {
    return typeId === DEFAULT_APPOINTMENT_TYPE
        ? "/appointments"
        : `/appointments/${typeId}`;
}
export function appointmentTypeFilter(typeId: string) {
    return typeId === DEFAULT_APPOINTMENT_TYPE
        ? {
              $or: [
                  { typeId: DEFAULT_APPOINTMENT_TYPE },
                  { typeId: { $exists: false } },
              ],
          }
        : { typeId };
}
