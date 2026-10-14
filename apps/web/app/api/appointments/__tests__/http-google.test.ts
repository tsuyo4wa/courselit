import { NextRequest } from "next/server";
import { createHash, randomUUID } from "crypto";
import * as appointments from "@/services/appointments";
import * as google from "@/services/appointment-google";
import { Settings, Bookings, Transient } from "@models/Appointment";
import { defaultAppointmentConfig } from "@/lib/appointment-input";
import { GET as settingsGet, POST as settingsPost } from "../settings/route";
import { GET as availabilityGet } from "../availability/route";
import { POST as bookingPost } from "../bookings/route";
import { GET as callbackGet } from "../google/callback/route";
import type { AppointmentContext } from "@/services/appointments";
import type {
    AppointmentSettings,
    AppointmentBooking,
} from "@courselit/common-models";
jest.mock("@/auth", () => ({
    auth: { api: { getSession: jest.fn().mockResolvedValue(null) } },
}));
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
const base = "https://school.example.com";
const data = (): AppointmentSettings => ({
    domainId: context.domainId,
    config: { ...defaultAppointmentConfig },
    clientId: "client-id",
    secret: google.seal("client-secret", context.domainId),
    refresh: google.seal("refresh-token", context.domainId),
    account: "owner@example.com",
    updatedAt: new Date(),
});
function request(path: string, body?: unknown, origin = base) {
    return new NextRequest(base + "/api/appointments/" + path, {
        method: body ? "POST" : "GET",
        headers: {
            host: "school.example.com",
            origin,
            "Content-Type": "application/json",
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });
}
let ctx: jest.SpyInstance;
beforeAll(async () => {
    await Promise.all([Settings.init(), Bookings.init(), Transient.init()]);
});
beforeEach(async () => {
    jest.restoreAllMocks();
    process.env.AUTH_SECRET = "testing-only";
    process.env.DOMAIN = "school.example.com";
    await Promise.all([
        Settings.deleteMany({}),
        Bookings.deleteMany({}),
        Transient.deleteMany({}),
    ]);
    ctx = jest
        .spyOn(appointments, "appointmentContext")
        .mockResolvedValue(context);
    await Settings.create(data());
});
it("never returns encrypted or raw Google secrets in settings", async () => {
    const response = await settingsGet(request("settings"));
    const text = JSON.stringify(await response.json());
    expect(text).not.toContain("client-secret");
    expect(text).not.toContain("refresh-token");
    expect(text).not.toContain('"secret":');
    expect(text).toContain('"secretConfigured":true');
    expect(response.headers.get("cache-control")).toContain("no-store");
});
it("rejects a non-owner on owner settings and direct preview availability", async () => {
    ctx.mockResolvedValue({ ...context, owner: false });
    expect((await settingsGet(request("settings"))).status).toBe(403);
    expect(
        (
            await availabilityGet(
                request("availability?from=2030-01-01&preview=1"),
            )
        ).status,
    ).toBe(403);
});
it("rejects cross-origin writes before parsing or contacting Google", async () => {
    const spy = jest.spyOn(google.AppointmentGoogle.prototype, "calendars");
    expect(
        (
            await settingsPost(
                request(
                    "settings",
                    { action: "check" },
                    "https://evil.example",
                ),
            )
        ).status,
    ).toBe(403);
    expect(spy).not.toHaveBeenCalled();
});
it("blocks public availability and purchase-less unauthenticated mutations while OFF", async () => {
    ctx.mockResolvedValue({ ...context, owner: false, user: null });
    expect(
        (await availabilityGet(request("availability?from=2030-01-01"))).status,
    ).toBe(403);
    const r = await bookingPost(
        request("bookings", {
            action: "create",
            key: randomUUID(),
            preview: false,
            name: "A",
            consent: true,
            start: "2030-01-01T00:00:00.000Z",
        }),
    );
    expect(r.status).toBe(401);
});
it("does not enable an incomplete configuration", async () => {
    const r = await settingsPost(
        request("settings", {
            action: "save",
            data: {
                config: { ...defaultAppointmentConfig, enabled: true },
                clientId: "client-id",
                clientSecret: "",
            },
        }),
    );
    expect(r.status).toBe(400);
    expect((await Settings.findOne())!.config.enabled).toBe(false);
});
it("saves and reloads write-only credentials without clearing unchanged ones", async () => {
    const s = data();
    const original = (await Settings.findOne())!.secret;
    const r = await settingsPost(
        request("settings", {
            action: "save",
            data: { config: s.config, clientId: s.clientId, clientSecret: "" },
        }),
    );
    expect(r.status).toBe(200);
    expect((await Settings.findOne())!.secret).toBe(original);
});
it("binds the OAuth request to an owner, tenant, short-lived cookie and PKCE", async () => {
    const r = await settingsPost(request("settings", { action: "connect" }));
    expect(r.status).toBe(200);
    const { url } = await r.json();
    const u = new URL(url);
    expect(u.origin).toBe("https://accounts.google.com");
    expect(u.searchParams.get("code_challenge_method")).toBe("S256");
    expect(r.cookies.get("appointment_oauth")?.value).toBe(
        u.searchParams.get("state"),
    );
    const state = await Transient.findOne({
        key:
            "oauth:" +
            createHash("sha256")
                .update(u.searchParams.get("state")!)
                .digest("hex"),
    });
    expect(state!.value.userId).toBe(context.user!.userId);
    expect(state!.expiresAt.getTime() - Date.now()).toBeLessThanOrEqual(600000);
});
it("rejects callback without the matching cookie and never exchanges the code", async () => {
    const exchange = jest.spyOn(google, "exchangeCode");
    const r = await callbackGet(
        request("google/callback?state=unknown&code=do-not-log"),
    );
    expect(r.headers.get("location")).toBe(
        base + "/dashboard/appointments?connection=failed",
    );
    expect(exchange).not.toHaveBeenCalled();
});
describe("Google adapter with mocked HTTP", () => {
    beforeEach(() => {
        jest.spyOn(
            google.AppointmentGoogle.prototype,
            "token",
        ).mockResolvedValue("test-access");
    });
    it("uses FreeBusy and fails closed on a per-calendar error", async () => {
        const s = data();
        s.config.calendarId = "target";
        const fn = jest.spyOn(global, "fetch").mockResolvedValue(
            Response.json({
                calendars: { target: { errors: [{ reason: "notFound" }] } },
            }),
        );
        await expect(
            new google.AppointmentGoogle(s).busy(
                "2030-01-01T00:00:00Z",
                "2030-01-02T00:00:00Z",
            ),
        ).rejects.toMatchObject({ code: "calendar_unavailable" });
        expect(String(fn.mock.calls[0][0])).toContain("/freeBusy");
    });
    it("expands recurrence, includes all-day busy in its calendar timezone and excludes only the matching owned event", async () => {
        const s = data();
        s.config.calendarId = "target";
        const b = {
            bookingId: "booking",
            domainId: "tenant-a",
            calendarId: "target",
            eventId: "owned",
        } as AppointmentBooking;
        const fn = jest.spyOn(global, "fetch").mockResolvedValue(
            Response.json({
                timeZone: "America/New_York",
                items: [
                    {
                        id: "owned",
                        start: { dateTime: "2030-03-11T09:00:00Z" },
                        end: { dateTime: "2030-03-11T10:00:00Z" },
                        extendedProperties: {
                            private: {
                                bookingId: "booking",
                                domainId: "tenant-a",
                            },
                        },
                    },
                    {
                        id: "all-day",
                        start: { date: "2030-03-11" },
                        end: { date: "2030-03-12" },
                    },
                    {
                        id: "transparent",
                        transparency: "transparent",
                        start: { date: "2030-03-11" },
                        end: { date: "2030-03-12" },
                    },
                ],
            }),
        );
        const result = await new google.AppointmentGoogle(s).busy(
            "2030-03-11T00:00:00Z",
            "2030-03-12T00:00:00Z",
            b,
        );
        expect(result).toEqual([
            {
                start: "2030-03-11T04:00:00.000Z",
                end: "2030-03-12T04:00:00.000Z",
            },
        ]);
        expect(String(fn.mock.calls[0][0])).toContain("singleEvents=true");
    });
    it("never deletes an unrelated Google event", async () => {
        const s = data();
        const fn = jest.spyOn(global, "fetch").mockResolvedValue(
            Response.json({
                id: "other",
                extendedProperties: {
                    private: { bookingId: "foreign", domainId: "tenant-b" },
                },
            }),
        );
        await expect(
            new google.AppointmentGoogle(s).write(
                {
                    bookingId: "ours",
                    domainId: "tenant-a",
                    calendarId: "target",
                    eventId: "other",
                } as AppointmentBooking,
                "cancel",
            ),
        ).rejects.toMatchObject({ code: "event_mismatch" });
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn.mock.calls[0][1]?.method).toBe("GET");
    });
    it("rejects a manually changed Google appointment instead of overwriting it", async () => {
        const s = data();
        const b = {
            bookingId: "ours",
            domainId: "tenant-a",
            calendarId: "target",
            eventId: "owned",
            version: 2,
            start: "2030-01-01T00:00:00.000Z",
            end: "2030-01-01T01:00:00.000Z",
        } as AppointmentBooking;
        const fn = jest.spyOn(global, "fetch").mockResolvedValue(
            Response.json({
                id: "owned",
                start: { dateTime: "2030-01-01T02:00:00Z" },
                end: { dateTime: "2030-01-01T03:00:00Z" },
                extendedProperties: {
                    private: {
                        bookingId: "ours",
                        domainId: "tenant-a",
                        version: "1",
                    },
                },
            }),
        );
        await expect(
            new google.AppointmentGoogle(s).write(b, "cancel"),
        ).rejects.toMatchObject({ code: "event_mismatch" });
        expect(fn).toHaveBeenCalledTimes(1);
    });
});

describe("booking-only account creation intent", () => {
    const {
        POST: prepareIntent,
        DELETE: clearIntent,
    } = require("../login-intent/route");
    const {
        appointmentSignupSubscribed,
        APPOINTMENT_LOGIN_COOKIE,
    } = require("@/lib/appointment-login-intent");
    async function prepare() {
        await Settings.updateOne(
            { domainId: context.domainId },
            { $set: { "config.enabled": true } },
        );
        const r = await prepareIntent(
            request("login-intent", { email: "new-person@example.com" }),
        );
        expect(r.status).toBe(200);
        const token = r.cookies.get(APPOINTMENT_LOGIN_COOKIE).value;
        return new Headers({ cookie: APPOINTMENT_LOGIN_COOKIE + "=" + token });
    }
    it("does not change subscription defaults for unrelated signup", async () => {
        expect(
            await appointmentSignupSubscribed(
                new Headers(),
                context.domainId,
                "new-person@example.com",
            ),
        ).toBe(true);
    });
    it("opts out only the matching new booking account and consumes the intent once", async () => {
        const h = await prepare();
        expect(
            await appointmentSignupSubscribed(
                h,
                context.domainId,
                "new-person@example.com",
            ),
        ).toBe(false);
        await expect(
            appointmentSignupSubscribed(
                h,
                context.domainId,
                "new-person@example.com",
            ),
        ).rejects.toThrow();
    });
    it("rejects different emails or tenants rather than subscribing by accident", async () => {
        const h = await prepare();
        await expect(
            appointmentSignupSubscribed(
                h,
                context.domainId,
                "another@example.com",
            ),
        ).rejects.toThrow();
        await expect(
            appointmentSignupSubscribed(
                h,
                "tenant-b",
                "new-person@example.com",
            ),
        ).rejects.toThrow();
        expect(
            await appointmentSignupSubscribed(
                h,
                context.domainId,
                "new-person@example.com",
            ),
        ).toBe(false);
    });
    it("does not store a plain email address in transient login records", async () => {
        await prepare();
        const record = await Transient.findOne({
            key: /^login-intent:/,
        }).lean();
        expect(JSON.stringify(record)).not.toContain("new-person@example.com");
        expect(record!.value.emailHash).toMatch(/^[a-f0-9]{64}$/);
    });
    it("expires intent and rejects a replayed/expired context", async () => {
        const h = await prepare();
        await Transient.updateMany(
            { key: /^login-intent:/ },
            { $set: { expiresAt: new Date(0) } },
        );
        await expect(
            appointmentSignupSubscribed(
                h,
                context.domainId,
                "new-person@example.com",
            ),
        ).rejects.toThrow();
    });
    it("blocks preparation while public booking is OFF and supports clearing the cookie", async () => {
        expect(
            (
                await prepareIntent(
                    request("login-intent", {
                        email: "new-person@example.com",
                    }),
                )
            ).status,
        ).toBe(403);
        const r = await clearIntent(request("login-intent", {}));
        expect(r.cookies.get(APPOINTMENT_LOGIN_COOKIE).value).toBe("");
    });
});
