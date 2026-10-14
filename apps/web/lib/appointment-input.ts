import { z } from "zod";
import type {
    AppointmentConfig,
    AppointmentInterval,
} from "@courselit/common-models";
const date = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(
        (v) =>
            !Number.isNaN(Date.parse(v)) &&
            new Date(v).toISOString().slice(0, 10) === v,
    );
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export function zoomIsValid(value: string) {
    try {
        const u = new URL(value);
        return (
            u.protocol === "https:" &&
            !u.username &&
            !u.password &&
            !u.port &&
            (u.hostname === "zoom.us" || u.hostname.endsWith(".zoom.us")) &&
            /^\/(j\/\d+|my\/[\w.-]+)\/?$/.test(u.pathname) &&
            !u.hash
        );
    } catch {
        return false;
    }
}
export const appointmentConfigSchema = z
    .object({
        enabled: z.boolean(),
        title: z.string().trim().min(1).max(100),
        description: z.string().trim().max(1000),
        duration: z.number().int().min(15).max(180).multipleOf(5),
        interval: z.number().int().min(5).max(120).multipleOf(5),
        bufferBefore: z.number().int().min(0).max(120),
        bufferAfter: z.number().int().min(0).max(120),
        noticeHours: z.number().int().min(1).max(720),
        horizonDays: z.number().int().min(1).max(60),
        startDate: date.or(z.literal("")),
        endDate: date.or(z.literal("")),
        excludedDates: z.array(date).max(180),
        windows: z
            .array(
                z
                    .object({
                        day: z.number().int().min(0).max(6),
                        start: time,
                        end: time,
                    })
                    .strict()
                    .refine((v) => v.start < v.end),
            )
            .max(21),
        zoomUrl: z
            .string()
            .max(2048)
            .refine((v) => !v || zoomIsValid(v)),
        calendarId: z.string().max(300),
        busyCalendarIds: z.array(z.string().min(1).max(300)).max(20),
    })
    .strict()
    .refine((v) => !v.startDate || !v.endDate || v.startDate <= v.endDate);
export const settingsInputSchema = z
    .object({
        config: appointmentConfigSchema,
        clientId: z.string().max(300).optional(),
        clientSecret: z.string().max(1000).optional(),
    })
    .strict();
export const bookingInputSchema = z
    .object({
        action: z.enum(["create", "reschedule", "cancel", "reconcile"]),
        preview: z.boolean(),
        id: z.string().uuid().optional(),
        key: z.string().uuid(),
        version: z.number().int().positive().optional(),
        start: z.string().datetime().optional(),
        name: z.string().trim().min(1).max(100).optional(),
        notes: z.string().trim().max(2000).optional(),
        consent: z.literal(true).optional(),
    })
    .strict()
    .superRefine((v, c) => {
        if (v.action === "create" && (!v.start || !v.name || !v.consent))
            c.addIssue({ code: "custom", message: "invalid" });
        if (v.action !== "create" && (!v.id || !v.version))
            c.addIssue({ code: "custom", message: "invalid" });
        if (v.action === "reschedule" && !v.start)
            c.addIssue({ code: "custom", message: "invalid" });
    });
export const defaultAppointmentConfig: AppointmentConfig = {
    enabled: false,
    title: "個別相談",
    description: "お仕事やAI活用について、オンラインでお話ししましょう。",
    duration: 60,
    interval: 30,
    bufferBefore: 0,
    bufferAfter: 15,
    noticeHours: 24,
    horizonDays: 30,
    startDate: "",
    endDate: "",
    excludedDates: [],
    windows: [],
    zoomUrl: "",
    calendarId: "",
    busyCalendarIds: [],
};
export function overlaps(a: AppointmentInterval, b: AppointmentInterval) {
    return a.start < b.end && b.start < a.end;
}
export function heldInterval(
    start: string,
    c: AppointmentConfig,
): AppointmentInterval {
    return {
        start: new Date(
            Date.parse(start) - c.bufferBefore * 60000,
        ).toISOString(),
        end: new Date(
            Date.parse(start) + (c.duration + c.bufferAfter) * 60000,
        ).toISOString(),
    };
}
export function jstDate(instant: number) {
    return new Date(instant + 9 * 3600000).toISOString().slice(0, 10);
}
export function slots(
    c: AppointmentConfig,
    from: string,
    days: number,
    busy: AppointmentInterval[],
    now = Date.now(),
): AppointmentInterval[] {
    const result: AppointmentInterval[] = [];
    const today = jstDate(now);
    const last = jstDate(now + c.horizonDays * 86400000);
    for (let i = 0; i < days; i++) {
        const d = new Date(Date.parse(from + "T00:00:00+09:00") + i * 86400000);
        const day = jstDate(d.getTime());
        if (
            day < today ||
            day > last ||
            (c.startDate && day < c.startDate) ||
            (c.endDate && day > c.endDate) ||
            c.excludedDates.includes(day)
        )
            continue;
        const dow = new Date(day + "T12:00:00+09:00").getUTCDay();
        for (const window of c.windows.filter((w) => w.day === dow)) {
            const min = Date.parse(day + "T" + window.start + ":00+09:00");
            const max = Date.parse(day + "T" + window.end + ":00+09:00");
            for (
                let t = min;
                t + c.duration * 60000 <= max;
                t += c.interval * 60000
            ) {
                if (t < now + c.noticeHours * 3600000) continue;
                const start = new Date(t).toISOString();
                const range = heldInterval(start, c);
                if (busy.some((b) => overlaps(b, range))) continue;
                result.push({
                    start,
                    end: new Date(t + c.duration * 60000).toISOString(),
                });
            }
        }
    }
    return Array.from(new Map(result.map((r) => [r.start, r])).values()).sort(
        (a, b) => a.start.localeCompare(b.start),
    );
}

export function calendarMidnight(date: string, timeZone: string) {
    const desired = Date.parse(date + "T00:00:00Z");
    let guess = desired;
    const f = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
    });
    for (let n = 0; n < 4; n++) {
        const p = Object.fromEntries(
            f.formatToParts(new Date(guess)).map((v) => [v.type, v.value]),
        );
        const seen = Date.parse(
            `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`,
        );
        const correction = desired - seen;
        if (!correction) return new Date(guess).toISOString();
        guess += correction;
    }
    throw new Error("Invalid calendar time zone");
}
