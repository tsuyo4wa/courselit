import {
    appointmentSettingsForType,
    appointmentTypeSummaries,
    appointmentTypePath,
    appointmentTypeFilter,
} from "../appointment-types";
import { defaultAppointmentConfig } from "../appointment-input";
import type { AppointmentSettings } from "@courselit/common-models";
const s = {
    domainId: "a",
    config: {
        ...defaultAppointmentConfig,
        calendarId: "write",
        busyCalendarIds: ["private"],
    },
    types: [
        {
            typeId: "ninety",
            config: {
                ...defaultAppointmentConfig,
                duration: 90,
                calendarId: "outdated",
                busyCalendarIds: [],
            },
            version: 2,
            createdAt: "2030-01-01",
        },
    ],
    clientId: "",
    secret: "",
    refresh: "",
    account: "",
    updatedAt: new Date(),
} as AppointmentSettings;
it("keeps the legacy default, shares live calendars and isolates menu settings", () => {
    expect(appointmentSettingsForType(s)).toBe(s);
    expect(appointmentSettingsForType(s, "ninety")!.config).toMatchObject({
        duration: 90,
        calendarId: "write",
        busyCalendarIds: ["private"],
    });
    expect(appointmentSettingsForType(s, "unknown")).toBeNull();
    expect(appointmentTypeSummaries(s).map((t) => t.duration)).toEqual([
        60, 90,
    ]);
    expect(appointmentTypePath()).toBe("/appointments");
    expect(appointmentTypePath("ninety")).toBe("/appointments/ninety");
    expect(appointmentTypeFilter("default")).toEqual({
        $or: [{ typeId: "default" }, { typeId: { $exists: false } }],
    });
});
