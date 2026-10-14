import { publicSiteOrigin } from "@/lib/portable-site-url";
import { createHash, createHmac, randomUUID } from "crypto";
import nodemailer from "nodemailer";
import { auth } from "@/auth";
import DomainModel from "@models/Domain";
import UserModel from "@models/User";
import { Settings, Bookings, Transient } from "@models/Appointment";
import { AppointmentGoogle, AppointmentError } from "./appointment-google";
import {
    defaultAppointmentConfig,
    heldInterval,
    jstDate,
    slots,
} from "@/lib/appointment-input";
import type {
    AppointmentSettings,
    AppointmentBooking,
    AppointmentView,
} from "@courselit/common-models";
export { AppointmentError };
export async function appointmentContext(headers: Headers) {
    const domain = await DomainModel.findOne({ name: headers.get("domain") });
    if (!domain) throw new AppointmentError("not_found", 404);
    const session = await auth.api.getSession({ headers });
    const user = session?.user?.email
        ? await UserModel.findOne({
              domain: domain._id,
              email: session.user.email,
              active: true,
          })
        : null;
    return {
        domain,
        domainId: String(domain._id),
        user,
        owner: !!user && user.email === domain.email,
    };
}
export type AppointmentContext = Awaited<ReturnType<typeof appointmentContext>>;
export async function settingsFor(
    domainId: string,
): Promise<AppointmentSettings> {
    const s = await Settings.findOne({ domainId }).lean();
    return (
        s || {
            domainId,
            config: { ...defaultAppointmentConfig },
            clientId: "",
            secret: "",
            refresh: "",
            account: "",
            updatedAt: new Date(),
        }
    );
}
export function requireOwner(c: AppointmentContext) {
    if (!c.owner) throw new AppointmentError("forbidden", 403);
}
export function gate(
    c: AppointmentContext,
    s: AppointmentSettings,
    preview: boolean,
    existing = false,
) {
    if (preview) requireOwner(c);
    else if (!s.config.enabled && !existing)
        throw new AppointmentError("not_open", 403);
}
export function requireUser(c: AppointmentContext) {
    if (!c.user) throw new AppointmentError("login_required", 401);
    return c.user;
}
export function originFor(c: AppointmentContext, headers: Headers) {
    const host = headers.get("host") || "";
    const canonical = c.domain.customDomain || process.env.DOMAIN;
    if (
        host !== canonical &&
        !(
            c.owner &&
            (host === process.env.DOMAIN ||
                host === process.env.RENDER_EXTERNAL_HOSTNAME)
        )
    )
        throw new AppointmentError("forbidden", 403);
    return "https://" + host;
}
export function checkOrigin(c: AppointmentContext, headers: Headers) {
    if (headers.get("origin") !== originFor(c, headers))
        throw new AppointmentError("forbidden", 403);
}
export async function rateLimit(
    c: AppointmentContext,
    headers: Headers,
    operation: string,
) {
    const ip =
        headers.get("x-forwarded-for")?.split(",").pop()?.trim() || "unknown";
    const secret = process.env.AUTH_SECRET;
    if (!secret) throw new AppointmentError("encryption_missing");
    const hash = createHmac("sha256", secret)
        .update(c.domainId + ":" + ip + ":" + operation)
        .digest("hex");
    const key = "rate:" + hash + ":" + Math.floor(Date.now() / 60000);
    const r = await Transient.findOneAndUpdate(
        { key },
        {
            $inc: { "value.count": 1 },
            $setOnInsert: { expiresAt: new Date(Date.now() + 120000) },
        },
        { upsert: true, new: true },
    );
    if ((r.value?.count || 0) > (c.owner ? 120 : 30))
        throw new AppointmentError("rate_limited", 429);
}
export async function hostLock<T>(
    domainId: string,
    work: (assertLease: () => Promise<void>) => Promise<T>,
): Promise<T> {
    await Promise.all([Transient.init(), Bookings.init(), Settings.init()]);
    const key = "lock:" + domainId;
    const token = randomUUID();
    const now = new Date();
    try {
        await Transient.updateOne(
            { key },
            { $setOnInsert: { value: { token: "" }, expiresAt: new Date(0) } },
            { upsert: true },
        );
    } catch (e) {
        if ((e as { code?: number }).code !== 11000) throw e;
    }
    const lock = await Transient.findOneAndUpdate(
        { key, expiresAt: { $lte: now } },
        {
            $set: {
                value: { token },
                expiresAt: new Date(now.getTime() + 120000),
            },
        },
        { new: true },
    );
    if (!lock) throw new AppointmentError("processing", 409);
    const assertLease = async () => {
        if (
            !(await Transient.exists({
                key,
                "value.token": token,
                expiresAt: { $gt: new Date() },
            }))
        )
            throw new AppointmentError("processing", 409);
    };
    try {
        return await work(assertLease);
    } finally {
        await Transient.updateOne(
            { key, "value.token": token },
            { $set: { expiresAt: new Date(0) } },
        );
    }
}
export function ready(s: AppointmentSettings) {
    return !!(
        s.clientId &&
        s.secret &&
        s.refresh &&
        s.config.calendarId &&
        s.config.zoomUrl &&
        s.config.windows.length
    );
}
export function bookingView(
    b: AppointmentBooking,
    s: AppointmentSettings,
    owner = false,
): AppointmentView {
    return {
        bookingId: b.bookingId,
        name: b.name,
        start: b.start,
        end: b.end,
        status: b.status,
        preview: b.preview,
        version: b.version,
        mailState: b.mailState,
        ...(b.status === "confirmed" ? { zoomUrl: s.config.zoomUrl } : {}),
        ...(owner ? { email: b.email, notes: b.notes } : {}),
    };
}
export async function listBookings(
    c: AppointmentContext,
    s: AppointmentSettings,
    owner = false,
) {
    const user = requireUser(c);
    if (owner) requireOwner(c);
    const data = await Bookings.find({
        domainId: c.domainId,
        ...(!owner ? { userId: user.userId } : {}),
    })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
    return data.map((b) => bookingView(b, s, owner));
}
export async function availability(
    c: AppointmentContext,
    s: AppointmentSettings,
    from: string,
    days: number,
    preview: boolean,
    exclude?: AppointmentBooking,
) {
    gate(c, s, preview, !!exclude);
    if (!ready(s)) throw new AppointmentError("setup_required", 503);
    const today = jstDate(Date.now());
    if (
        from < today ||
        from > jstDate(Date.now() + s.config.horizonDays * 86400000)
    )
        return [];
    const start = new Date(
        Date.parse(from + "T00:00:00+09:00") - s.config.bufferBefore * 60000,
    ).toISOString();
    const end = new Date(
        Date.parse(from + "T00:00:00+09:00") +
            days * 86400000 +
            s.config.bufferAfter * 60000,
    ).toISOString();
    const provider = new AppointmentGoogle(s);
    const busy = await provider.busy(start, end, exclude);
    const rows = await Bookings.find({
        domainId: c.domainId,
        ...(exclude ? { bookingId: { $ne: exclude.bookingId } } : {}),
        "holds.start": { $lt: end },
        "holds.end": { $gt: start },
    }).lean();
    busy.push(...rows.flatMap((b) => b.holds));
    return slots(s.config, from, days, busy);
}
export async function ownedBooking(c: AppointmentContext, id: string) {
    const u = requireUser(c);
    const b = await Bookings.findOne({
        domainId: c.domainId,
        bookingId: id,
        ...(!c.owner ? { userId: u.userId } : {}),
    }).lean();
    if (!b) throw new AppointmentError("not_found", 404);
    if (b.preview) requireOwner(c);
    return b;
}
function fingerprint(v: unknown) {
    return createHash("sha256").update(JSON.stringify(v)).digest("hex");
}
export type AppointmentMutation = {
    action: "create" | "reschedule" | "cancel" | "reconcile";
    preview: boolean;
    id?: string;
    key: string;
    version?: number;
    start?: string;
    name?: string;
    notes?: string;
    consent?: true;
};
export async function mutateBooking(
    c: AppointmentContext,
    input: AppointmentMutation,
    origin: string,
) {
    const user = requireUser(c);
    const result = await hostLock(c.domainId, async (assertLease) => {
        const s = await settingsFor(c.domainId);
        gate(c, s, input.preview, input.action !== "create");
        const hash = fingerprint(input);
        const receiptKey =
            "action:" + c.domainId + ":" + user.userId + ":" + input.key;
        const receipt = await Transient.findOne({ key: receiptKey }).lean();
        if (receipt) {
            if (receipt.value.hash !== hash)
                throw new AppointmentError("stale", 409);
            return ownedBooking(c, receipt.value.bookingId);
        }
        let b: AppointmentBooking;
        if (input.action === "create") {
            const duplicate = await Bookings.findOne({
                domainId: c.domainId,
                userId: user.userId,
                idempotencyKey: input.key,
            }).lean();
            if (duplicate) {
                if (duplicate.requestHash !== hash)
                    throw new AppointmentError("stale", 409);
                return duplicate;
            }
            if (!ready(s)) throw new AppointmentError("setup_required", 503);
            if (
                await Bookings.exists({
                    domainId: c.domainId,
                    userId: user.userId,
                    preview: input.preview,
                    status: { $ne: "cancelled" },
                    end: { $gt: new Date().toISOString() },
                })
            )
                throw new AppointmentError("already_booked", 409);
            const available = await availability(
                c,
                s,
                jstDate(Date.parse(input.start!)),
                1,
                input.preview,
            );
            if (!available.some((v) => v.start === input.start))
                throw new AppointmentError("slot_taken", 409);
            await assertLease();
            const id = randomUUID();
            b = {
                bookingId: id,
                domainId: c.domainId,
                userId: user.userId,
                email: user.email,
                name: input.name!,
                notes: input.notes || "",
                preview: input.preview,
                start: input.start!,
                end: new Date(
                    Date.parse(input.start!) + s.config.duration * 60000,
                ).toISOString(),
                holds: [heldInterval(input.start!, s.config)],
                status: "pending",
                operation: "create",
                calendarId: s.config.calendarId,
                eventId: id.replace(/-/g, ""),
                version: 1,
                idempotencyKey: input.key,
                requestHash: hash,
                origin,
                mailState: "not_sent",
                mailVersion: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await Bookings.create(b);
        } else {
            b = await ownedBooking(c, input.id!);
            if (b.preview !== input.preview)
                throw new AppointmentError("forbidden", 403);
            if (b.version !== input.version)
                throw new AppointmentError("stale", 409);
            if (input.action === "reconcile") {
                requireOwner(c);
                if (b.status === "confirmed") {
                    const event = await new AppointmentGoogle(s).ownedEvent(b);
                    await assertLease();
                    if (
                        !event ||
                        event.extendedProperties?.private?.version !==
                            String(b.version) ||
                        Date.parse(event.start?.dateTime || "") !==
                            Date.parse(b.start) ||
                        Date.parse(event.end?.dateTime || "") !==
                            Date.parse(b.end)
                    ) {
                        b.status = "needs_review";
                        await saveBooking(b);
                    }
                    return b;
                }
                if (
                    ![
                        "needs_review",
                        "pending",
                        "changing",
                        "cancelling",
                    ].includes(b.status)
                )
                    return b;
                const provider = new AppointmentGoogle(s);
                const e = await provider.ownedEvent(b);
                await assertLease();
                if (b.operation === "cancel") {
                    if (e) {
                        await provider.write(b, "cancel");
                        await assertLease();
                        if (await provider.ownedEvent(b))
                            throw new AppointmentError("review_required", 409);
                    }
                    b.status = "cancelled";
                    b.holds = [];
                } else if (b.operation === "create" && !e) {
                    b.status = "cancelled";
                    b.holds = [];
                } else if (
                    e &&
                    e.extendedProperties?.private?.version ===
                        String(b.version) &&
                    Date.parse(e.start?.dateTime || "") ===
                        Date.parse(b.proposedStart || b.start) &&
                    Date.parse(e.end?.dateTime || "") ===
                        Date.parse(b.proposedEnd || b.end)
                ) {
                    const held = b.holds[b.holds.length - 1];
                    const busy = await provider.busy(held.start, held.end, b);
                    if (
                        busy.some(
                            (v) => v.start < held.end && held.start < v.end,
                        )
                    )
                        throw new AppointmentError("review_required", 409);
                    await assertLease();
                    b.status = "confirmed";
                    b.start = b.proposedStart || b.start;
                    b.end = b.proposedEnd || b.end;
                    b.holds = [held];
                    b.proposedStart = undefined;
                    b.proposedEnd = undefined;
                } else if (
                    b.operation === "reschedule" &&
                    e &&
                    e.extendedProperties?.private?.version ===
                        String(b.version - 1) &&
                    Date.parse(e.start?.dateTime || "") ===
                        Date.parse(b.start) &&
                    Date.parse(e.end?.dateTime || "") === Date.parse(b.end)
                ) {
                    b.status = "confirmed";
                    b.version--;
                    b.holds = b.holds.slice(0, 1);
                    b.proposedStart = undefined;
                    b.proposedEnd = undefined;
                } else throw new AppointmentError("review_required", 409);
                await saveBooking(b);
                return b;
            }
            if (b.status !== "confirmed" || Date.parse(b.start) <= Date.now())
                throw new AppointmentError("review_required", 409);
            if (input.action === "reschedule") {
                const available = await availability(
                    c,
                    s,
                    jstDate(Date.parse(input.start!)),
                    1,
                    input.preview,
                    b,
                );
                if (!available.some((v) => v.start === input.start))
                    throw new AppointmentError("slot_taken", 409);
                await assertLease();
                b.proposedStart = input.start;
                b.proposedEnd = new Date(
                    Date.parse(input.start!) + s.config.duration * 60000,
                ).toISOString();
                b.holds.push(heldInterval(input.start!, s.config));
                b.status = "changing";
            } else b.status = "cancelling";
            b.version++;
            b.operation = input.action;
            b.mailState = "not_sent";
            await saveBooking(b);
        }
        await Transient.create({
            key: receiptKey,
            value: { hash, bookingId: b.bookingId },
            expiresAt: new Date(Date.now() + 86400000),
        });
        try {
            const provider = new AppointmentGoogle(s);
            await provider.write(b, b.operation);
            await assertLease();
            // A deterministic ID allows the operator to reconcile a timeout without another insert.
            const event = await provider.ownedEvent(b);
            await assertLease();
            if (b.operation === "cancel") {
                if (event) throw new AppointmentError("review_required", 409);
                b.status = "cancelled";
                b.holds = [];
            } else {
                if (
                    !event ||
                    event.extendedProperties?.private?.version !==
                        String(b.version) ||
                    Date.parse(event.start?.dateTime || "") !==
                        Date.parse(b.proposedStart || b.start) ||
                    Date.parse(event.end?.dateTime || "") !==
                        Date.parse(b.proposedEnd || b.end)
                )
                    throw new AppointmentError("review_required", 409);
                // Recheck other Google events after insertion. Own event alone is excluded.
                const check = {
                    ...b,
                    start: b.proposedStart || b.start,
                    end: b.proposedEnd || b.end,
                };
                const external = await provider.busy(
                    b.holds[b.holds.length - 1].start,
                    b.holds[b.holds.length - 1].end,
                    check,
                );
                await assertLease();
                if (
                    external.some(
                        (v) =>
                            v.start < b.holds[b.holds.length - 1].end &&
                            b.holds[b.holds.length - 1].start < v.end,
                    )
                )
                    throw new AppointmentError("review_required", 409);
                b.status = "confirmed";
                b.start = check.start;
                b.end = check.end;
                b.holds = b.holds.slice(-1);
                b.proposedStart = undefined;
                b.proposedEnd = undefined;
            }
            await saveBooking(b);
        } catch {
            b.status = "needs_review";
            await Bookings.updateOne(
                {
                    domainId: b.domainId,
                    bookingId: b.bookingId,
                    version: b.version,
                },
                { $set: { status: b.status, updatedAt: new Date() } },
            );
        }
        return b;
    });
    await notifyBooking(c, result);
    return bookingView(
        (await Bookings.findOne({
            bookingId: result.bookingId,
            domainId: c.domainId,
        }).lean())!,
        await settingsFor(c.domainId),
        c.owner,
    );
}
async function saveBooking(b: AppointmentBooking) {
    const value = { ...b, updatedAt: new Date() };
    delete (value as Partial<AppointmentBooking> & { _id?: unknown })._id;
    if (!b.proposedStart) {
        delete value.proposedStart;
        delete value.proposedEnd;
    }
    await Bookings.updateOne(
        { domainId: b.domainId, bookingId: b.bookingId },
        {
            $set: value,
            $unset: {
                ...(!b.proposedStart
                    ? { proposedStart: 1, proposedEnd: 1 }
                    : {}),
            },
        },
    );
}
export async function notifyBooking(
    c: AppointmentContext,
    b: AppointmentBooking,
) {
    if (!["confirmed", "cancelled"].includes(b.status)) return;
    const claim = await Bookings.updateOne(
        {
            domainId: b.domainId,
            bookingId: b.bookingId,
            version: b.version,
            mailVersion: { $lt: b.version },
        },
        { $set: { mailVersion: b.version, mailState: "sending" } },
    );
    if (!claim.modifiedCount) return;
    const s = await settingsFor(c.domainId);
    const time = new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        dateStyle: "full",
        timeStyle: "short",
    }).format(new Date(b.start));
    const cancelled = b.status === "cancelled";
    const title = cancelled
        ? "個別相談のキャンセルを受け付けました"
        : b.operation === "reschedule"
          ? "個別相談の日時を変更しました"
          : "個別相談のご予約が確定しました";
    const notificationOrigin = publicSiteOrigin(c.domain);
    const text = [
        b.name + " 様",
        title,
        "日時：" + time + "（日本時間）",
        "予約番号：" + b.bookingId,
        ...(!cancelled ? ["Zoom：" + s.config.zoomUrl] : []),
        "予約の確認・変更・キャンセル：" + notificationOrigin + "/appointments",
        "※変更・キャンセルには予約時のメールアドレスでのログインが必要です。",
    ].join("\n\n");
    let state = "failed";
    try {
        if (
            !notificationOrigin ||
            !process.env.EMAIL_HOST ||
            !process.env.EMAIL_FROM
        )
            throw new Error();
        const port = Number(process.env.EMAIL_PORT || 587);
        const smtp = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port,
            secure: port === 465,
            requireTLS: port !== 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            connectionTimeout: 10000,
            socketTimeout: 15000,
        });
        try {
            for (const to of Array.from(
                new Set([b.email, process.env.CONTACT_TO || c.domain.email]),
            )) {
                const r = await smtp.sendMail({
                    from: process.env.EMAIL_FROM,
                    to,
                    subject: (b.preview ? "【確認用】" : "") + title,
                    text,
                    messageId:
                        "<appointments-" +
                        b.bookingId +
                        "-" +
                        b.version +
                        "-" +
                        fingerprint(to).slice(0, 8) +
                        "@" +
                        new URL(b.origin).hostname +
                        ">",
                });
                if (!r.accepted?.length || r.rejected?.length)
                    throw new Error();
            }
            state = "sent";
        } finally {
            smtp.close();
        }
    } catch {
        state = "delivery_unconfirmed";
    }
    // A timeout may have delivered. Never automatically resend an uncertain notification.
    await Bookings.updateOne(
        {
            domainId: b.domainId,
            bookingId: b.bookingId,
            version: b.version,
            mailVersion: b.version,
        },
        { $set: { mailState: state } },
    );
}
