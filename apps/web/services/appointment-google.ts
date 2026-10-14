import { calendarMidnight } from "@/lib/appointment-input";
import {
    createCipheriv,
    createDecipheriv,
    randomBytes,
    hkdfSync,
} from "crypto";
import type {
    AppointmentSettings,
    AppointmentCalendar,
    AppointmentInterval,
    AppointmentGoogleEvent,
    AppointmentBooking,
} from "@courselit/common-models";
export class AppointmentError extends Error {
    constructor(
        public code: string,
        public status = 503,
    ) {
        super(code);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
function key(domainId: string) {
    const secret = process.env.AUTH_SECRET;
    if (!secret) throw new AppointmentError("encryption_missing");
    return new Uint8Array(
        hkdfSync("sha256", secret, domainId, "appointments-v1", 32),
    );
}
export function seal(value: string, domainId: string) {
    const iv = new Uint8Array(randomBytes(12));
    const c = createCipheriv("aes-256-gcm", key(domainId), iv);
    const body = c.update(value, "utf8", "hex") + c.final("hex");
    return [
        "v1",
        Buffer.from(iv).toString("hex"),
        c.getAuthTag().toString("hex"),
        body,
    ].join(".");
}
export function unseal(value: string, domainId: string) {
    const [v, iv, tag, body] = value.split(".");
    if (v !== "v1") throw new AppointmentError("connection_required");
    const d = createDecipheriv(
        "aes-256-gcm",
        key(domainId),
        new Uint8Array(Buffer.from(iv, "hex")),
    );
    d.setAuthTag(new Uint8Array(Buffer.from(tag, "hex")));
    return d.update(body, "hex", "utf8") + d.final("utf8");
}
async function jsonFetch(url: string, init: RequestInit = {}) {
    let response: Response;
    try {
        response = await fetch(url, {
            ...init,
            signal: AbortSignal.timeout(10000),
            cache: "no-store",
            redirect: "error",
        });
    } catch {
        throw new AppointmentError("google_unavailable");
    }
    if (response.status === 404)
        throw new AppointmentError("google_not_found", 404);
    if (!response.ok)
        throw new AppointmentError(
            response.status === 401 || response.status === 403
                ? "connection_required"
                : "google_unavailable",
        );
    if (response.status === 204) return {};
    try {
        return await response.json();
    } catch {
        throw new AppointmentError("google_unavailable");
    }
}
export async function exchangeCode(
    s: AppointmentSettings,
    code: string,
    verifier: string,
    redirectUri: string,
) {
    const body = new URLSearchParams({
        client_id: s.clientId,
        client_secret: unseal(s.secret, s.domainId),
        code,
        code_verifier: verifier,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
    });
    const data = await jsonFetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        body,
    });
    if (!data.refresh_token || !data.access_token)
        throw new AppointmentError("connection_required");
    return {
        refresh: seal(data.refresh_token, s.domainId),
        access: data.access_token as string,
    };
}
export class AppointmentGoogle {
    private access = "";
    constructor(private settings: AppointmentSettings) {}
    async token() {
        if (this.access) return this.access;
        const s = this.settings;
        if (!s.clientId || !s.secret || !s.refresh)
            throw new AppointmentError("connection_required");
        const data = await jsonFetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            body: new URLSearchParams({
                client_id: s.clientId,
                client_secret: unseal(s.secret, s.domainId),
                refresh_token: unseal(s.refresh, s.domainId),
                grant_type: "refresh_token",
            }),
        });
        if (!data.access_token)
            throw new AppointmentError("connection_required");
        this.access = data.access_token;
        return this.access;
    }
    async call(path: string, method = "GET", body?: unknown, etag?: string) {
        const token = await this.token();
        return jsonFetch("https://www.googleapis.com/calendar/v3/" + path, {
            method,
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
                ...(etag ? { "If-Match": etag } : {}),
            },
            ...(body ? { body: JSON.stringify(body) } : {}),
        });
    }
    async calendars(): Promise<AppointmentCalendar[]> {
        return AppointmentGoogle.listWithToken(await this.token());
    }
    static async listWithToken(token: string): Promise<AppointmentCalendar[]> {
        let page = "";
        const all: AppointmentCalendar[] = [];
        for (let i = 0; i < 5; i++) {
            const data = await jsonFetch(
                "https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=250&fields=items(id,summary,accessRole,primary,timeZone),nextPageToken" +
                    (page ? "&pageToken=" + encodeURIComponent(page) : ""),
                { headers: { Authorization: "Bearer " + token } },
            );
            all.push(...(data.items || []));
            if (!data.nextPageToken) return all;
            page = data.nextPageToken;
        }
        throw new AppointmentError("too_many_calendars");
    }
    async validateCalendars() {
        const c = this.settings.config;
        const list = await this.calendars();
        const target = list.find((v) => v.id === c.calendarId);
        if (!target || !["writer", "owner"].includes(target.accessRole))
            throw new AppointmentError("calendar_required", 400);
        if (c.busyCalendarIds.some((id) => !list.some((v) => v.id === id)))
            throw new AppointmentError("calendar_required", 400);
        return list;
    }
    async busy(
        start: string,
        end: string,
        exclude?: AppointmentBooking,
    ): Promise<AppointmentInterval[]> {
        const c = this.settings.config;
        const ids = Array.from(
            new Set([c.calendarId, ...c.busyCalendarIds]),
        ).filter(Boolean);
        if (!ids.length) throw new AppointmentError("calendar_required");
        const ranges: AppointmentInterval[] = [];
        const queryIds = exclude
            ? ids.filter((id) => id !== exclude.calendarId)
            : ids;
        if (queryIds.length) {
            const data = await this.call("freeBusy", "POST", {
                timeMin: start,
                timeMax: end,
                timeZone: "Asia/Tokyo",
                items: queryIds.map((id) => ({ id })),
            });
            for (const id of queryIds) {
                const item = data.calendars?.[id];
                if (!item || item.errors?.length || !Array.isArray(item.busy))
                    throw new AppointmentError("calendar_unavailable");
                for (const b of item.busy) {
                    if (!b.start || !b.end)
                        throw new AppointmentError("calendar_unavailable");
                    ranges.push({
                        start: new Date(b.start).toISOString(),
                        end: new Date(b.end).toISOString(),
                    });
                }
            }
        }
        if (exclude) {
            let page = "";
            for (let n = 0; n < 10; n++) {
                const q = new URLSearchParams({
                    timeMin: start,
                    timeMax: end,
                    singleEvents: "true",
                    maxResults: "2500",
                    fields: "items(id,status,transparency,start,end,extendedProperties/private),nextPageToken,timeZone",
                    ...(page ? { pageToken: page } : {}),
                });
                const data = await this.call(
                    "calendars/" +
                        encodeURIComponent(exclude.calendarId) +
                        "/events?" +
                        q,
                );
                for (const e of (data.items ||
                    []) as AppointmentGoogleEvent[]) {
                    if (
                        e.status === "cancelled" ||
                        e.transparency === "transparent"
                    )
                        continue;
                    if (
                        e.id === exclude.eventId &&
                        e.extendedProperties?.private?.bookingId ===
                            exclude.bookingId &&
                        e.extendedProperties?.private?.domainId ===
                            exclude.domainId
                    )
                        continue;
                    const a =
                        e.start?.dateTime ||
                        (e.start?.date
                            ? calendarMidnight(
                                  e.start.date,
                                  data.timeZone || "Asia/Tokyo",
                              )
                            : "");
                    const b =
                        e.end?.dateTime ||
                        (e.end?.date
                            ? calendarMidnight(
                                  e.end.date,
                                  data.timeZone || "Asia/Tokyo",
                              )
                            : "");
                    if (!a || !b)
                        throw new AppointmentError("calendar_unavailable");
                    ranges.push({
                        start: new Date(a).toISOString(),
                        end: new Date(b).toISOString(),
                    });
                }
                if (!data.nextPageToken) return ranges;
                page = data.nextPageToken;
            }
            throw new AppointmentError("calendar_unavailable");
        }
        return ranges;
    }
    path(b: AppointmentBooking) {
        return "calendars/" + encodeURIComponent(b.calendarId) + "/events";
    }
    async ownedEvent(
        b: AppointmentBooking,
    ): Promise<AppointmentGoogleEvent | null> {
        try {
            const event = (await this.call(
                this.path(b) + "/" + b.eventId,
            )) as AppointmentGoogleEvent;
            if (event.status === "cancelled") return null;
            if (
                event.extendedProperties?.private?.bookingId !== b.bookingId ||
                event.extendedProperties?.private?.domainId !== b.domainId
            )
                throw new AppointmentError("event_mismatch", 409);
            return event;
        } catch (e) {
            if (e instanceof AppointmentError && e.code === "google_not_found")
                return null;
            throw e;
        }
    }
    async write(
        b: AppointmentBooking,
        operation: "create" | "reschedule" | "cancel",
    ) {
        const existing =
            operation === "create" ? null : await this.ownedEvent(b);
        if (operation === "cancel") {
            if (
                existing &&
                (existing.extendedProperties?.private?.version !==
                    String(b.version - 1) ||
                    Date.parse(existing.start?.dateTime || "") !==
                        Date.parse(b.start) ||
                    Date.parse(existing.end?.dateTime || "") !==
                        Date.parse(b.end))
            )
                throw new AppointmentError("event_mismatch", 409);
            if (existing)
                await this.call(
                    this.path(b) + "/" + b.eventId + "?sendUpdates=none",
                    "DELETE",
                    undefined,
                    existing.etag,
                );
            return;
        }
        if (
            operation === "reschedule" &&
            (!existing ||
                existing.extendedProperties?.private?.version !==
                    String(b.version - 1) ||
                (existing.start?.dateTime &&
                    Date.parse(existing.start.dateTime) !==
                        Date.parse(b.start)))
        )
            throw new AppointmentError("event_mismatch", 409);
        const payload = {
            summary:
                this.settings.config.title +
                " [" +
                b.bookingId.slice(0, 8) +
                "]",
            description:
                "予約番号: " +
                b.bookingId +
                "\n変更・キャンセルは予約したサイトから行ってください。",
            location: this.settings.config.zoomUrl,
            start: {
                dateTime: b.proposedStart || b.start,
                timeZone: "Asia/Tokyo",
            },
            end: { dateTime: b.proposedEnd || b.end, timeZone: "Asia/Tokyo" },
            transparency: "opaque",
            extendedProperties: {
                private: {
                    bookingId: b.bookingId,
                    domainId: b.domainId,
                    version: String(b.version),
                },
            },
        };
        await this.call(
            this.path(b) +
                (existing ? "/" + b.eventId : "") +
                "?sendUpdates=none",
            existing ? "PATCH" : "POST",
            existing ? payload : { ...payload, id: b.eventId },
            existing?.etag,
        );
    }
}
