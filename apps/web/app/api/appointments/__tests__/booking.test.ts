import nodemailer from "nodemailer";
import { randomUUID } from "crypto";
import {
    defaultAppointmentConfig,
    slots,
    calendarMidnight,
    zoomIsValid,
} from "@/lib/appointment-input";
import {
    AppointmentGoogle,
    seal,
    unseal,
    AppointmentError,
} from "@/services/appointment-google";
import { Settings, Bookings, Transient } from "@models/Appointment";
import {
    mutateBooking,
    availability,
    hostLock,
    ownedBooking,
    notifyBooking,
} from "@/services/appointments";
import type { AppointmentContext } from "@/services/appointments";
import type {
    AppointmentSettings,
    AppointmentGoogleEvent,
    AppointmentBooking,
} from "@courselit/common-models";
jest.mock("@/auth", () => ({
    auth: { api: { getSession: jest.fn().mockResolvedValue(null) } },
}));
jest.mock("nodemailer", () => ({
    __esModule: true,
    default: {
        createTransport: jest.fn(() => ({
            sendMail: jest
                .fn()
                .mockResolvedValue({ accepted: ["test"], rejected: [] }),
            close: jest.fn(),
        })),
    },
}));
const origin = "https://school.example.com";
const context = {
    domainId: "tenant-a",
    domain: {
        _id: "tenant-a",
        email: "owner@example.com",
        customDomain: "school.example.com",
    },
    owner: true,
    user: { userId: "owner-1", email: "owner@example.com" },
} as unknown as AppointmentContext;
const student = {
    ...context,
    owner: false,
    user: { userId: "student-1", email: "student@example.com" },
} as AppointmentContext;
function setting(): AppointmentSettings {
    return {
        domainId: context.domainId,
        config: {
            ...defaultAppointmentConfig,
            enabled: true,
            windows: Array.from({ length: 7 }, (_, day) => ({
                day,
                start: "09:00",
                end: "18:00",
            })),
            zoomUrl: "https://us02web.zoom.us/j/123456789",
            calendarId: "target",
            busyCalendarIds: ["other"],
        },
        clientId: "client",
        secret: "encrypted",
        refresh: "encrypted",
        account: "owner",
        updatedAt: new Date(),
    };
}
const tomorrow = () => {
    const d = new Date(Date.now() + 3 * 86400000);
    d.setUTCHours(1, 0, 0, 0);
    return d.toISOString();
};
const create = (start = tomorrow(), preview = false) => ({
    action: "create" as const,
    key: randomUUID(),
    preview,
    start,
    name: "予約確認",
    notes: "相談",
    consent: true as const,
});
const events = new Map<string, AppointmentGoogleEvent>();
function eventFor(b: AppointmentBooking): AppointmentGoogleEvent {
    return {
        id: b.eventId,
        etag: "etag",
        start: { dateTime: b.proposedStart || b.start },
        end: { dateTime: b.proposedEnd || b.end },
        extendedProperties: {
            private: {
                bookingId: b.bookingId,
                domainId: b.domainId,
                version: String(b.version),
            },
        },
    };
}
let busy: jest.SpyInstance;
let write: jest.SpyInstance;
let owned: jest.SpyInstance;
beforeAll(async () => {
    await Promise.all([Settings.init(), Bookings.init(), Transient.init()]);
});
beforeEach(async () => {
    jest.restoreAllMocks();
    process.env.AUTH_SECRET = "test-secret-never-real";
    process.env.EMAIL_HOST = "smtp.example.com";
    process.env.EMAIL_FROM = "school@example.com";
    process.env.DOMAIN = "school.example.com";
    await Promise.all([
        Settings.deleteMany({}),
        Bookings.deleteMany({}),
        Transient.deleteMany({}),
    ]);
    await Settings.create(setting());
    events.clear();
    busy = jest
        .spyOn(AppointmentGoogle.prototype, "busy")
        .mockImplementation(async (_a, _b, exclude) =>
            Array.from(events.values())
                .filter((e) => e.id !== exclude?.eventId)
                .map((e) => ({
                    start: e.start!.dateTime!,
                    end: e.end!.dateTime!,
                })),
        );
    write = jest
        .spyOn(AppointmentGoogle.prototype, "write")
        .mockImplementation(async (b, op) => {
            if (op === "cancel") events.delete(b.eventId);
            else events.set(b.eventId, eventFor(b));
        });
    owned = jest
        .spyOn(AppointmentGoogle.prototype, "ownedEvent")
        .mockImplementation(async (b) => events.get(b.eventId) || null);
});
describe("Japanese-time availability and secrets", () => {
    const cfg = {
        ...defaultAppointmentConfig,
        noticeHours: 1,
        bufferBefore: 15,
        bufferAfter: 15,
        windows: [{ day: 1, start: "10:00", end: "13:00" }],
    };
    const now = Date.parse("2030-01-06T00:00:00Z");
    it("keeps slots in the window and converts JST to UTC", () => {
        const v = slots(cfg, "2030-01-07", 1, [], now);
        expect(v[0]).toEqual({
            start: "2030-01-07T01:00:00.000Z",
            end: "2030-01-07T02:00:00.000Z",
        });
        expect(v.at(-1)?.end).toBe("2030-01-07T04:00:00.000Z");
    });
    it("blocks overlapping intervals plus buffers, including different start times", () => {
        const v = slots(
            cfg,
            "2030-01-07",
            1,
            [
                {
                    start: "2030-01-07T02:10:00.000Z",
                    end: "2030-01-07T02:40:00.000Z",
                },
            ],
            now,
        );
        expect(v.some((t) => t.start === "2030-01-07T01:00:00.000Z")).toBe(
            false,
        );
        expect(v.length).toBe(1);
    });
    it("blocks all-day and closed dates", () => {
        expect(
            slots(
                cfg,
                "2030-01-07",
                1,
                [
                    {
                        start: "2030-01-06T15:00:00.000Z",
                        end: "2030-01-07T15:00:00.000Z",
                    },
                ],
                now,
            ),
        ).toHaveLength(0);
        expect(
            slots(
                { ...cfg, excludedDates: ["2030-01-07"] },
                "2030-01-07",
                1,
                [],
                now,
            ),
        ).toHaveLength(0);
    });
    it("respects notice, date limits, and deduplicates windows", () => {
        expect(
            slots({ ...cfg, noticeHours: 72 }, "2030-01-07", 1, [], now),
        ).toHaveLength(0);
        expect(
            slots({ ...cfg, endDate: "2030-01-06" }, "2030-01-07", 1, [], now),
        ).toHaveLength(0);
        expect(
            slots(
                { ...cfg, windows: [...cfg.windows, ...cfg.windows] },
                "2030-01-07",
                1,
                [],
                now,
            ),
        ).toHaveLength(5);
    });
    it("interprets all-day dates in the selected calendar zone, including DST", () => {
        expect(calendarMidnight("2030-03-11", "America/New_York")).toBe(
            "2030-03-11T04:00:00.000Z",
        );
        expect(calendarMidnight("2030-01-07", "Asia/Tokyo")).toBe(
            "2030-01-06T15:00:00.000Z",
        );
    });
    it("accepts fixed Zoom meetings and refuses hostile destinations", () => {
        expect(zoomIsValid("https://us02web.zoom.us/j/123456?pwd=abc")).toBe(
            true,
        );
        for (const v of [
            "http://zoom.us/j/123",
            "https://zoom.us.evil.com/j/123",
            "https://user@zoom.us/j/123",
            "https://zoom.us/redirect?url=evil",
        ])
            expect(zoomIsValid(v)).toBe(false);
    });
    it("encrypts per tenant with authenticated tamper protection", () => {
        const encrypted = seal("秘密の接続値", "tenant-a");
        expect(encrypted).not.toContain("秘密");
        expect(unseal(encrypted, "tenant-a")).toBe("秘密の接続値");
        expect(() => unseal(encrypted, "tenant-b")).toThrow();
        expect(() =>
            unseal(encrypted.slice(0, -2) + "ff", "tenant-a"),
        ).toThrow();
    });
});
describe("booking state machine with real MongoDB and mocked Google/SMTP", () => {
    it("confirms only after Google verification, then idempotently returns one booking", async () => {
        const i = create();
        const a = await mutateBooking(student, i, origin);
        expect(a.status).toBe("confirmed");
        expect(a.zoomUrl).toContain("zoom.us");
        const again = await mutateBooking(student, i, origin);
        expect(again.bookingId).toBe(a.bookingId);
        expect(await Bookings.countDocuments({})).toBe(1);
        expect(write).toHaveBeenCalledTimes(1);
        expect((await Bookings.findOne())!.mailState).toBe("sent");
    });
    it("rejects overlap and same key with a changed payload", async () => {
        const i = create();
        await mutateBooking(student, i, origin);
        await expect(
            mutateBooking(student, { ...i, name: "違う" }, origin),
        ).rejects.toMatchObject({ code: "stale" });
        const other = {
            ...student,
            user: { userId: "student-2", email: "two@example.com" },
        } as AppointmentContext;
        const t = new Date(Date.parse(i.start) + 30 * 60000).toISOString();
        await expect(
            mutateBooking(other, create(t), origin),
        ).rejects.toMatchObject({ code: "slot_taken" });
        expect(write).toHaveBeenCalledTimes(1);
    });
    it("serializes simultaneous callers while retaining reserved intervals", async () => {
        let release!: () => void;
        const pending = new Promise<void>((r) => (release = r));
        let entered!: () => void;
        const started = new Promise<void>((r) => (entered = r));
        write.mockImplementationOnce(async (b) => {
            entered();
            await pending;
            events.set(b.eventId, eventFor(b));
        });
        const first = mutateBooking(student, create(), origin);
        await started;
        await expect(
            mutateBooking(context, create(), origin),
        ).rejects.toMatchObject({ code: "processing" });
        release();
        expect((await first).status).toBe("confirmed");
        expect(await Bookings.countDocuments({})).toBe(1);
    });
    it("retains the hold after a Google timeout and reconciles without another insert", async () => {
        write.mockImplementationOnce(async (b) => {
            events.set(b.eventId, eventFor(b));
            throw new Error("timeout");
        });
        const a = await mutateBooking(student, create(), origin);
        expect(a.status).toBe("needs_review");
        expect(a.zoomUrl).toBeUndefined();
        expect((await Bookings.findOne())!.holds.length).toBe(1);
        const fixed = await mutateBooking(
            context,
            {
                action: "reconcile",
                preview: false,
                id: a.bookingId,
                version: a.version,
                key: randomUUID(),
            },
            origin,
        );
        expect(fixed.status).toBe("confirmed");
        expect(write).toHaveBeenCalledTimes(1);
    });
    it("does not release unknown reservations by age or TTL", async () => {
        write.mockRejectedValueOnce(new Error());
        const a = await mutateBooking(student, create(), origin);
        await Bookings.updateOne(
            { bookingId: a.bookingId },
            { $set: { createdAt: new Date(0), updatedAt: new Date(0) } },
        );
        const b = await Bookings.findOne();
        expect(b!.holds.length).toBe(1);
        expect(
            Bookings.schema
                .indexes()
                .some(
                    ([, options]) => options.expireAfterSeconds !== undefined,
                ),
        ).toBe(false);
    });
    it("reschedules atomically and rejects stale updates", async () => {
        const a = await mutateBooking(student, create(), origin);
        const start = new Date(Date.parse(a.start) + 3 * 3600000).toISOString();
        const input = {
            action: "reschedule" as const,
            preview: false,
            id: a.bookingId,
            version: a.version,
            key: randomUUID(),
            start,
        };
        const b = await mutateBooking(student, input, origin);
        expect(b.start).toBe(start);
        expect(b.status).toBe("confirmed");
        expect((await Bookings.findOne())!.holds.length).toBe(1);
        const again = await mutateBooking(student, input, origin);
        expect(again.version).toBe(b.version);
        await expect(
            mutateBooking(student, { ...input, key: randomUUID() }, origin),
        ).rejects.toMatchObject({ code: "stale" });
    });
    it("keeps old and new holds if a date change is uncertain", async () => {
        const a = await mutateBooking(student, create(), origin);
        write.mockRejectedValueOnce(new Error());
        const b = await mutateBooking(
            student,
            {
                action: "reschedule",
                preview: false,
                id: a.bookingId,
                version: a.version,
                key: randomUUID(),
                start: new Date(
                    Date.parse(a.start) + 3 * 3600000,
                ).toISOString(),
            },
            origin,
        );
        expect(b.status).toBe("needs_review");
        expect(b.start).toBe(a.start);
        expect((await Bookings.findOne())!.holds).toHaveLength(2);
    });
    it("confirms cancellation only after Google absence and keeps history", async () => {
        const a = await mutateBooking(student, create(), origin);
        const b = await mutateBooking(
            student,
            {
                action: "cancel",
                preview: false,
                id: a.bookingId,
                version: a.version,
                key: randomUUID(),
            },
            origin,
        );
        expect(b.status).toBe("cancelled");
        expect((await Bookings.findOne())!.holds).toHaveLength(0);
        expect(await Bookings.countDocuments({})).toBe(1);
    });
    it("blocks a conflicting manual Google appointment discovered after insert", async () => {
        busy.mockResolvedValueOnce([]).mockResolvedValueOnce([
            {
                start: tomorrow(),
                end: new Date(Date.parse(tomorrow()) + 60000).toISOString(),
            },
        ]);
        const b = await mutateBooking(student, create(), origin);
        expect(b.status).toBe("needs_review");
        expect(b.zoomUrl).toBeUndefined();
        expect((await Bookings.findOne())!.holds.length).toBe(1);
    });
    it("fails closed on Google read error before writing", async () => {
        busy.mockRejectedValueOnce(new AppointmentError("google_unavailable"));
        await expect(
            mutateBooking(student, create(), origin),
        ).rejects.toMatchObject({ code: "google_unavailable" });
        expect(await Bookings.countDocuments({})).toBe(0);
        expect(write).not.toHaveBeenCalled();
    });
    it("blocks public booking when OFF but allows owner-only preview", async () => {
        const s = setting();
        s.config.enabled = false;
        await Settings.updateOne(
            { domainId: context.domainId },
            { $set: { config: s.config } },
        );
        await expect(
            mutateBooking(student, create(), origin),
        ).rejects.toMatchObject({ code: "not_open" });
        await expect(
            mutateBooking(student, create(tomorrow(), true), origin),
        ).rejects.toMatchObject({ code: "forbidden" });
        expect(
            (await mutateBooking(context, create(tomorrow(), true), origin))
                .preview,
        ).toBe(true);
    });
    it("prevents other members and tenants from accessing or cancelling a booking", async () => {
        const a = await mutateBooking(student, create(), origin);
        await expect(
            ownedBooking(
                { ...student, user: { userId: "other" } } as AppointmentContext,
                a.bookingId,
            ),
        ).rejects.toMatchObject({ code: "not_found" });
        await expect(
            ownedBooking({ ...context, domainId: "other-school" }, a.bookingId),
        ).rejects.toMatchObject({ code: "not_found" });
    });
    it("does not disclose meeting URLs or notes in availability", async () => {
        const result = await availability(
            student,
            setting(),
            tomorrow().slice(0, 10),
            7,
            false,
        );
        expect(JSON.stringify(result)).not.toContain("zoom");
        expect(Object.keys(result[0]).sort()).toEqual(["end", "start"]);
    });
    it("rejects expired leases without running the guarded operation", async () => {
        await Transient.create({
            key: "lock:" + context.domainId,
            value: { token: "elsewhere" },
            expiresAt: new Date(Date.now() + 60000),
        });
        await expect(
            hostLock(context.domainId, async () => "bad"),
        ).rejects.toMatchObject({ code: "processing" });
    });
});

it("keeps confirmed booking and does not automatically resend an uncertain notification", async () => {
    jest.spyOn(nodemailer, "createTransport").mockReturnValue({
        sendMail: jest.fn().mockRejectedValue(new Error("timeout")),
        close: jest.fn(),
    } as any);
    const input = create();
    const result = await mutateBooking(student, input, origin);
    expect(result.status).toBe("confirmed");
    expect(result.mailState).toBe("delivery_unconfirmed");
    const transport = (nodemailer.createTransport as jest.Mock).mock.results.at(
        -1,
    )!.value;
    await mutateBooking(student, input, origin);
    expect(transport.sendMail).toHaveBeenCalledTimes(1);
});
it("detects a manually deleted confirmed Google event during owner audit", async () => {
    const a = await mutateBooking(student, create(), origin);
    events.clear();
    const b = await mutateBooking(
        context,
        {
            action: "reconcile",
            preview: false,
            id: a.bookingId,
            version: a.version,
            key: randomUUID(),
        },
        origin,
    );
    expect(b.status).toBe("needs_review");
    expect((await Bookings.findOne())!.holds).toHaveLength(1);
});

it("uses the current configured school host for notifications about bookings created on an older host", async () => {
    const created = await mutateBooking(student, create(), origin);
    const b = (await Bookings.findOne({
        bookingId: created.bookingId,
    }))!.toObject();
    await Bookings.updateOne(
        { bookingId: b.bookingId },
        { $set: { mailVersion: -1 } },
    );
    const movedContext = {
        ...student,
        domain: { ...student.domain, customDomain: "new-school.example.com" },
    } as AppointmentContext;
    const transport = {
        sendMail: jest
            .fn()
            .mockResolvedValue({ accepted: ["test"], rejected: [] }),
        close: jest.fn(),
    };
    (nodemailer.createTransport as jest.Mock).mockReturnValue(transport);
    await notifyBooking(movedContext, b);
    expect(transport.sendMail).toHaveBeenCalled();
    expect(transport.sendMail.mock.calls[0][0].text).toContain(
        "https://new-school.example.com/appointments",
    );
    expect(transport.sendMail.mock.calls[0][0].text).not.toContain(
        "https://school.example.com/appointments",
    );
    expect((await Bookings.findOne({ bookingId: b.bookingId }))!.origin).toBe(
        origin,
    );
});

// Multi-menu scheduling must preserve the shared host lock and legacy reservations.
import {
    createAppointmentType,
    saveAppointmentType,
} from "@/services/appointment-types";
import { appointmentSettingsForType } from "@/lib/appointment-types";
const menu90 = "11111111-1111-4111-8111-111111111111";
async function addMenu(enabled = true) {
    const s = setting();
    await Settings.updateOne(
        { domainId: context.domainId },
        {
            $set: {
                types: [
                    {
                        typeId: menu90,
                        config: {
                            ...s.config,
                            title: "90分相談",
                            duration: 90,
                            enabled,
                        },
                        version: 1,
                        createdAt: new Date().toISOString(),
                    },
                ],
            },
        },
    );
}
it("creates a 90-minute menu paused without changing the existing Google connection or 60-minute menu", async () => {
    const before = await Settings.findOne({
        domainId: context.domainId,
    }).lean();
    const made = await createAppointmentType(context, {
        name: "90分相談",
        duration: 90,
    });
    const after = await Settings.findOne({ domainId: context.domainId }).lean();
    expect(after!.config).toEqual(before!.config);
    expect(after!.refresh).toBe(before!.refresh);
    expect(after!.types![0]).toMatchObject({
        typeId: made.typeId,
        config: { duration: 90, enabled: false },
    });
    await expect(
        createAppointmentType(student, { name: "別", duration: 60 }),
    ).rejects.toMatchObject({ status: 403 });
});
it("saves only the selected menu, rejects stale versions and never changes shared calendars from a menu", async () => {
    await addMenu(false);
    const s = await Settings.findOne({ domainId: context.domainId }).lean();
    const config = {
        ...s!.types![0].config,
        title: "長めの相談",
        calendarId: "tampered",
        busyCalendarIds: [],
    };
    await saveAppointmentType(context, menu90, { config, version: 1 });
    const after = await Settings.findOne({ domainId: context.domainId }).lean();
    expect(after!.config).toEqual(s!.config);
    expect(after!.types![0]).toMatchObject({
        version: 2,
        config: {
            title: "長めの相談",
            calendarId: "target",
            busyCalendarIds: ["other"],
        },
    });
    await expect(
        saveAppointmentType(context, menu90, { config, version: 1 }),
    ).rejects.toMatchObject({ status: 409 });
    await expect(
        saveAppointmentType(context, randomUUID(), { config, version: 1 }),
    ).rejects.toMatchObject({ status: 404 });
});
it("reserves 90 minutes and blocks overlaps from another menu even without Google busy intervals", async () => {
    await addMenu();
    busy.mockResolvedValue([]);
    const first = await mutateBooking(
        student,
        { ...create(), typeId: menu90 },
        origin,
    );
    expect(Date.parse(first.end) - Date.parse(first.start)).toBe(90 * 60000);
    const another = {
        ...student,
        user: { userId: "student-2", email: "second@example.com" },
    } as AppointmentContext;
    await expect(
        mutateBooking(
            another,
            create(new Date(Date.parse(tomorrow()) + 60 * 60000).toISOString()),
            origin,
        ),
    ).rejects.toMatchObject({ code: "slot_taken" });
    const second = await mutateBooking(
        student,
        create(new Date(Date.parse(tomorrow()) + 180 * 60000).toISOString()),
        origin,
    );
    expect(second.status).toBe("confirmed");
    expect(await Bookings.countDocuments({ domainId: context.domainId })).toBe(
        2,
    );
});
it("isolates pause states and prevents a booking mutation from naming another menu", async () => {
    await addMenu(false);
    await expect(
        mutateBooking(student, { ...create(), typeId: menu90 }, origin),
    ).rejects.toMatchObject({ code: "not_open" });
    const first = await mutateBooking(student, create(), origin);
    await expect(
        mutateBooking(
            student,
            {
                action: "cancel",
                typeId: menu90,
                preview: false,
                id: first.bookingId,
                version: first.version,
                key: randomUUID(),
            },
            origin,
        ),
    ).rejects.toMatchObject({ status: 403 });
});
it("retains the originally purchased duration when a menu changes before rescheduling", async () => {
    await addMenu();
    const first = await mutateBooking(
        student,
        { ...create(), typeId: menu90 },
        origin,
    );
    const s = await Settings.findOne({ domainId: context.domainId }).lean();
    await Settings.updateOne(
        { domainId: context.domainId },
        {
            $set: {
                types: s!.types!.map((t) => ({
                    ...t,
                    config: { ...t.config, duration: 60 },
                })),
            },
        },
    );
    const changed = await mutateBooking(
        student,
        {
            action: "reschedule",
            preview: false,
            id: first.bookingId,
            version: first.version,
            key: randomUUID(),
            start: new Date(Date.parse(tomorrow()) + 3 * 3600000).toISOString(),
        },
        origin,
    );
    expect(Date.parse(changed.end) - Date.parse(changed.start)).toBe(
        90 * 60000,
    );
    const base = await Settings.findOne({ domainId: context.domainId }).lean();
    const selected = appointmentSettingsForType(base!, menu90)!;
    expect(selected.config.duration).toBe(60);
});

it("filters legacy rows into default and sends each menu's own title and return path", async () => {
    await addMenu();
    const created = await mutateBooking(
        student,
        { ...create(), typeId: menu90 },
        origin,
    );
    const { listBookings } = require("@/services/appointments");
    const base = await Settings.findOne({ domainId: context.domainId }).lean();
    expect(await listBookings(student, base, false, "default")).toHaveLength(0);
    expect(await listBookings(student, base, false, menu90)).toHaveLength(1);
    const transport = (nodemailer.createTransport as jest.Mock).mock.results.at(
        -1,
    )!.value;
    expect(transport.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
            text: expect.stringContaining("/appointments/" + menu90),
        }),
    );
    expect(transport.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ text: expect.stringContaining("90分相談") }),
    );
    await Bookings.collection.updateOne(
        { bookingId: created.bookingId },
        { $unset: { typeId: 1 } },
    );
    expect(await listBookings(student, base, false, "default")).toHaveLength(1);
});
