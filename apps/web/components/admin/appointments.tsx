"use client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { CalendarDays, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { appointmentText as t } from "@/config/strings";
import { appointmentRequest, appointmentTime } from "@/lib/appointment-client";
import { settingsInputSchema } from "@/lib/appointment-input";
import type {
    AppointmentAdminProps,
    AppointmentConfigForm,
    AppointmentCalendar,
    AppointmentView,
} from "@courselit/common-models";
export default function AppointmentAdmin({
    initial,
    connectionStatus,
}: AppointmentAdminProps) {
    const [data, setData] = useState(initial);
    const [calendars, setCalendars] = useState<AppointmentCalendar[]>(
        initial.calendars,
    );
    const [excluded, setExcluded] = useState(
        initial.config.excludedDates.join("\n"),
    );
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState(
        connectionStatus === "connected"
            ? t.connected
            : connectionStatus
              ? t.failedConnection
              : "",
    );
    const [rows, setRows] = useState(initial.bookings);
    const defaults = {
        config: initial.config,
        clientId: initial.clientId,
        clientSecret: "",
    };
    const saved = useRef(JSON.stringify(defaults));
    const current = useRef(defaults);
    const form = useForm<AppointmentConfigForm>({
        resolver: zodResolver(settingsInputSchema),
        defaultValues: defaults,
    });
    current.current = form.watch();
    const dirty = JSON.stringify(current.current) !== saved.current;
    async function action(name: string) {
        setBusy(true);
        setMessage("");
        try {
            if (name === "disconnect" && !window.confirm(t.disconnectConfirm))
                return;
            const result = await appointmentRequest("settings", {
                action: name,
            });
            if (name === "connect") {
                window.location.assign(result.url);
                return;
            }
            if (name === "check") {
                setCalendars(result.calendars);
                setMessage(t.checked);
                setData((v) => ({ ...v, checkedAt: result.checkedAt }));
            }
            if (name === "disconnect") {
                setData((v) => ({ ...v, connected: false, account: "" }));
                setMessage(t.disconnectDone);
            }
        } catch (e) {
            setMessage((e as Error).message);
        } finally {
            setBusy(false);
        }
    }
    async function save() {
        setBusy(true);
        setMessage("");
        try {
            await appointmentRequest("settings", {
                action: "save",
                data: current.current,
            });
            const next = await appointmentRequest("settings");
            setData(next);
            const values = {
                config: next.config,
                clientId: next.clientId,
                clientSecret: "",
            };
            saved.current = JSON.stringify(values);
            form.reset(values);
            setExcluded(values.config.excludedDates.join("\n"));
            setMessage(t.saved);
        } catch (e) {
            setMessage((e as Error).message);
        } finally {
            setBusy(false);
        }
    }
    async function mutate(
        row: AppointmentView,
        actionName: "cancel" | "reconcile",
    ) {
        if (actionName === "cancel" && !window.confirm(t.cancelConfirm)) return;
        setBusy(true);
        setMessage("");
        try {
            const result = await appointmentRequest("bookings", {
                action: actionName,
                preview: row.preview,
                id: row.bookingId,
                version: row.version,
                key: crypto.randomUUID(),
            });
            setRows((v) =>
                v.map((b) =>
                    b.bookingId === row.bookingId ? result.booking : b,
                ),
            );
            setMessage(t.updated);
        } catch (e) {
            setMessage((e as Error).message);
        } finally {
            setBusy(false);
        }
    }
    const numberFields = [
        "duration",
        "interval",
        "bufferBefore",
        "bufferAfter",
        "noticeHours",
        "horizonDays",
    ] as const;
    const labels = {
        duration: t.duration,
        interval: t.interval,
        bufferBefore: t.before,
        bufferAfter: t.after,
        noticeHours: t.notice,
        horizonDays: t.horizon,
    };
    return (
        <main className="mx-auto w-full max-w-5xl p-4 sm:p-7 space-y-8">
            <header className="space-y-3">
                <p className="flex items-center gap-2 text-sm text-primary">
                    <CalendarDays size={18} />
                    {data.config.enabled ? t.public : t.private}
                </p>
                <h1 className="text-2xl font-bold">{t.adminTitle}</h1>
                <p className="text-muted-foreground text-sm leading-7">
                    {t.adminIntro}
                </p>
                <div className="flex flex-wrap gap-3">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/appointments/preview">
                            {t.preview}
                            <ArrowUpRight size={16} />
                        </Link>
                    </Button>
                    <Button asChild variant="ghost">
                        <Link href="/dashboard/appointments/preview?sample=1">
                            {t.sample}
                        </Link>
                    </Button>
                </div>
            </header>
            <p
                role="status"
                aria-live="polite"
                className={
                    message
                        ? "border-l-2 border-primary bg-muted/40 px-4 py-3 text-sm leading-7"
                        : "sr-only"
                }
            >
                {message}
            </p>
            <form onSubmit={form.handleSubmit(save)} className="space-y-8">
                <section className="space-y-5 border rounded-lg p-4 sm:p-6">
                    <h2 className="font-bold text-lg">{t.connection}</h2>
                    <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 size={17} className="text-primary" />
                        {data.connected ? t.connected : t.missing}
                        {data.connected && (
                            <span className="text-muted-foreground">
                                {data.account}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {t.checkedAt}：
                        {data.checkedAt
                            ? appointmentTime(data.checkedAt)
                            : t.unchecked}
                    </p>
                    <details className="text-sm leading-7 text-muted-foreground">
                        <summary className="cursor-pointer text-foreground">
                            {t.setupHelp}
                        </summary>
                        <p className="mt-3">{t.setupDetails}</p>
                    </details>
                    <div className="space-y-2">
                        <Label htmlFor="appointment-client">{t.clientId}</Label>
                        <Input
                            id="appointment-client"
                            autoComplete="off"
                            {...form.register("clientId")}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="appointment-secret">
                            {t.clientSecret}：
                            {data.secretConfigured ? t.configured : t.missing}
                        </Label>
                        <Input
                            id="appointment-secret"
                            type="password"
                            autoComplete="new-password"
                            {...form.register("clientSecret")}
                        />
                        <p className="text-xs text-muted-foreground">
                            {t.secretHelp}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="appointment-callback">
                            {t.callback}
                        </Label>
                        <Input
                            id="appointment-callback"
                            readOnly
                            value={data.redirectUri}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            onClick={() => action("connect")}
                            disabled={
                                busy ||
                                dirty ||
                                !data.clientId ||
                                !data.secretConfigured
                            }
                        >
                            {t.reconnect}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => action("check")}
                            disabled={busy || !data.connected}
                        >
                            {t.check}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => action("disconnect")}
                            disabled={
                                busy || !data.connected || data.config.enabled
                            }
                        >
                            {t.disconnect}
                        </Button>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="appointment-calendar">
                            {t.targetCalendar}
                        </Label>
                        <select
                            id="appointment-calendar"
                            className="w-full rounded-md border bg-background p-2 text-sm"
                            {...form.register("config.calendarId")}
                        >
                            <option value="">{t.choose}</option>
                            {data.config.calendarId &&
                                !calendars.some(
                                    (c) => c.id === data.config.calendarId,
                                ) && (
                                    <option value={data.config.calendarId}>
                                        {data.config.calendarId}
                                    </option>
                                )}
                            {calendars
                                .filter((c) =>
                                    ["writer", "owner"].includes(c.accessRole),
                                )
                                .map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.summary}
                                    </option>
                                ))}
                        </select>
                        <p className="text-xs text-muted-foreground leading-6">
                            {t.calendarHelp}
                        </p>
                    </div>
                    <fieldset className="space-y-2">
                        <legend className="text-sm font-medium mb-2">
                            {t.busyCalendars}
                        </legend>
                        {!calendars.length && (
                            <p className="text-xs text-muted-foreground">
                                {t.refreshCalendars}
                            </p>
                        )}
                        {calendars.map((c) => (
                            <label
                                key={c.id}
                                className="flex items-center gap-2 text-sm"
                            >
                                <input
                                    type="checkbox"
                                    value={c.id}
                                    {...form.register("config.busyCalendarIds")}
                                />
                                {c.summary}
                            </label>
                        ))}
                    </fieldset>
                </section>
                <section className="border rounded-lg p-4 sm:p-6 space-y-5">
                    <h2 className="font-bold text-lg">{t.settings}</h2>
                    <div className="space-y-2">
                        <Label htmlFor="appointment-title">
                            {t.titleField}
                        </Label>
                        <Input
                            id="appointment-title"
                            {...form.register("config.title")}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="appointment-description">
                            {t.description}
                        </Label>
                        <Textarea
                            id="appointment-description"
                            {...form.register("config.description")}
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {numberFields.map((key) => (
                            <div key={key} className="space-y-2">
                                <Label htmlFor={"appointment-" + key}>
                                    {labels[key]}
                                </Label>
                                <Input
                                    id={"appointment-" + key}
                                    type="number"
                                    {...form.register(`config.${key}`, {
                                        valueAsNumber: true,
                                    })}
                                />
                            </div>
                        ))}
                        {(["startDate", "endDate"] as const).map((key) => (
                            <div key={key} className="space-y-2">
                                <Label htmlFor={"appointment-" + key}>
                                    {t[key]}
                                </Label>
                                <Input
                                    id={"appointment-" + key}
                                    type="date"
                                    {...form.register(`config.${key}`)}
                                />
                            </div>
                        ))}
                    </div>
                    <fieldset className="space-y-3">
                        <legend className="text-sm font-medium mb-2">
                            {t.windows}
                        </legend>
                        {t.weekdays.map((label, day) => {
                            const rows = current.current.config.windows;
                            const i = rows.findIndex((v) => v.day === day);
                            return (
                                <div
                                    key={day}
                                    className="flex flex-wrap items-center gap-3"
                                >
                                    <label className="flex items-center gap-2 w-12 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={i >= 0}
                                            onChange={(e) =>
                                                form.setValue(
                                                    "config.windows",
                                                    e.target.checked
                                                        ? [
                                                              ...rows,
                                                              {
                                                                  day,
                                                                  start: "10:00",
                                                                  end: "17:00",
                                                              },
                                                          ]
                                                        : rows.filter(
                                                              (v) =>
                                                                  v.day !== day,
                                                          ),
                                                    { shouldDirty: true },
                                                )
                                            }
                                        />
                                        {label}
                                    </label>
                                    {i >= 0 && (
                                        <>
                                            <Input
                                                type="time"
                                                className="w-28"
                                                aria-label={label + t.fromTime}
                                                {...form.register(
                                                    `config.windows.${i}.start`,
                                                )}
                                            />
                                            <span aria-hidden>〜</span>
                                            <Input
                                                type="time"
                                                className="w-28"
                                                aria-label={label + t.toTime}
                                                {...form.register(
                                                    `config.windows.${i}.end`,
                                                )}
                                            />
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </fieldset>
                    <div className="space-y-2">
                        <Label htmlFor="appointment-excluded">
                            {t.excluded}
                        </Label>
                        <Textarea
                            id="appointment-excluded"
                            value={excluded}
                            onChange={(e) => {
                                setExcluded(e.target.value);
                                form.setValue(
                                    "config.excludedDates",
                                    e.target.value.split("\n").filter(Boolean),
                                    { shouldDirty: true },
                                );
                            }}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="appointment-zoom">{t.zoom}</Label>
                        <Input
                            id="appointment-zoom"
                            type="url"
                            autoComplete="off"
                            {...form.register("config.zoomUrl")}
                        />
                    </div>
                    <label className="flex items-center gap-3 text-sm font-medium">
                        <input
                            type="checkbox"
                            {...form.register("config.enabled")}
                        />
                        {t.enable}
                    </label>
                    <p className="text-xs text-muted-foreground leading-6">
                        {t.offHelp}
                    </p>
                    {Object.keys(form.formState.errors).length > 0 && (
                        <p role="alert" className="text-sm text-destructive">
                            {t.errors.invalid}
                        </p>
                    )}
                    <Button disabled={busy || !dirty} type="submit">
                        {busy ? t.saving : t.save}
                    </Button>
                </section>
            </form>
            <section className="space-y-4">
                <h2 className="font-bold text-lg">{t.bookings}</h2>
                {!rows.length && (
                    <p className="text-sm text-muted-foreground">{t.empty}</p>
                )}
                {rows.map((row) => (
                    <article
                        key={row.bookingId}
                        className="border-t py-4 space-y-2 text-sm"
                    >
                        <div className="flex flex-wrap justify-between gap-2">
                            <p className="font-semibold">
                                {appointmentTime(row.start)} · {row.name}
                            </p>
                            <span className="text-primary">
                                {t.statuses[row.status]}
                                {row.preview && " · " + t.private}
                            </span>
                        </div>
                        <p>{row.email}</p>
                        <p className="whitespace-pre-wrap leading-7">
                            {row.notes}
                        </p>
                        <p className="text-muted-foreground text-xs break-all">
                            {t.id}：{row.bookingId}
                        </p>
                        <p className="text-xs">
                            {t.mail}：
                            {(t.mailStates as Record<string, string>)[
                                row.mailState
                            ] || row.mailState}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {row.status === "confirmed" &&
                                Date.parse(row.start) > Date.now() && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={busy}
                                        onClick={() => mutate(row, "cancel")}
                                    >
                                        {t.cancel}
                                    </Button>
                                )}
                            {[
                                "confirmed",
                                "pending",
                                "changing",
                                "cancelling",
                                "needs_review",
                            ].includes(row.status) && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={busy}
                                    onClick={() => mutate(row, "reconcile")}
                                >
                                    {t.reconcile}
                                </Button>
                            )}
                        </div>
                    </article>
                ))}
            </section>
        </main>
    );
}
