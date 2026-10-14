import { randomUUID } from "crypto";
import { z } from "zod";
import { Settings } from "@models/Appointment";
import { AppointmentGoogle } from "./appointment-google";
import {
    settingsFor,
    requireOwner,
    hostLock,
    ready,
    AppointmentError,
    listBookings,
    originFor,
} from "./appointments";
import type { AppointmentContext } from "./appointments";
import { appointmentConfigSchema } from "@/lib/appointment-input";
import {
    appointmentSettingsForType,
    appointmentTypeSummaries,
} from "@/lib/appointment-types";
export function selectedAppointmentSettings(
    s: Awaited<ReturnType<typeof settingsFor>>,
    id = "default",
) {
    const selected = appointmentSettingsForType(s, id);
    if (!selected) throw new AppointmentError("not_found", 404);
    return selected;
}
export async function appointmentTypeAdminData(
    c: AppointmentContext,
    h: Headers,
    id = "default",
) {
    requireOwner(c);
    const s = await settingsFor(c.domainId);
    const selected = selectedAppointmentSettings(s, id);
    return {
        typeId: id,
        version: appointmentTypeSummaries(s).find((t) => t.typeId === id)!
            .version,
        config: selected.config,
        clientId: s.clientId,
        secretConfigured: !!s.secret,
        connected: !!s.refresh,
        account: s.account,
        checkedAt: s.checkedAt?.toISOString(),
        redirectUri: originFor(c, h) + "/api/appointments/google/callback",
        calendars: [],
        bookings: await listBookings(c, s, true, id),
    };
}
const createSchema = z
    .object({
        name: z.string().trim().min(1).max(100),
        duration: z.number().int().min(15).max(180).multipleOf(5),
    })
    .strict();
export async function createAppointmentType(
    c: AppointmentContext,
    raw: unknown,
) {
    requireOwner(c);
    const input = createSchema.safeParse(raw);
    if (!input.success) throw new AppointmentError("invalid", 400);
    return hostLock(c.domainId, async (assertLease) => {
        const s = await settingsFor(c.domainId);
        if ((s.types?.length || 0) >= 19)
            throw new AppointmentError("type_limit", 400);
        const typeId = randomUUID();
        const types = [
            ...(s.types || []),
            {
                typeId,
                config: {
                    ...s.config,
                    title: input.data.name,
                    duration: input.data.duration,
                    enabled: false,
                },
                version: 1,
                createdAt: new Date().toISOString(),
            },
        ];
        await assertLease();
        await Settings.updateOne(
            { domainId: c.domainId },
            {
                $set: { types, updatedAt: new Date() },
                $setOnInsert: {
                    config: s.config,
                    clientId: s.clientId,
                    secret: s.secret,
                    refresh: s.refresh,
                    account: s.account,
                },
            },
            { upsert: true },
        );
        return { typeId };
    });
}
const saveSchema = z
    .object({
        config: appointmentConfigSchema,
        version: z.number().int().positive(),
    })
    .strict();
export async function saveAppointmentType(
    c: AppointmentContext,
    id: string,
    raw: unknown,
) {
    requireOwner(c);
    const input = saveSchema.safeParse(raw);
    if (!input.success) throw new AppointmentError("invalid", 400);
    return hostLock(c.domainId, async (assertLease) => {
        const s = await settingsFor(c.domainId);
        selectedAppointmentSettings(s, id);
        const version = appointmentTypeSummaries(s).find(
            (t) => t.typeId === id,
        )!.version;
        if (input.data.version !== version)
            throw new AppointmentError("stale", 409);
        const config = {
            ...input.data.config,
            calendarId: s.config.calendarId,
            busyCalendarIds: s.config.busyCalendarIds,
        };
        const selected = { ...s, config };
        if (config.enabled) {
            if (!ready(selected))
                throw new AppointmentError("setup_required", 400);
            const google = new AppointmentGoogle(selected);
            await google.validateCalendars();
            await google.busy(
                new Date().toISOString(),
                new Date(Date.now() + 86400000).toISOString(),
            );
        }
        const update =
            id === "default"
                ? { config, configVersion: version + 1 }
                : {
                      types: s.types!.map((t) =>
                          t.typeId === id
                              ? { ...t, config, version: version + 1 }
                              : t,
                      ),
                  };
        await assertLease();
        await Settings.updateOne(
            { domainId: c.domainId },
            {
                $set: { ...update, updatedAt: new Date() },
                $setOnInsert:
                    id === "default"
                        ? {
                              clientId: s.clientId,
                              secret: s.secret,
                              refresh: s.refresh,
                              account: s.account,
                          }
                        : {
                              config: s.config,
                              clientId: s.clientId,
                              secret: s.secret,
                              refresh: s.refresh,
                              account: s.account,
                          },
            },
            { upsert: true },
        );
        return { ok: true };
    });
}
