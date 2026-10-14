"use client";
import { useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
    const [panel, setPanel] = useState(
        connectionStatus ? "connection" : "settings",
    );
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
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
    const windows = useFieldArray({
        control: form.control,
        name: "config.windows",
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
    const filteredRows = rows
        .filter((row) => {
            const day = new Date(Date.parse(row.start) + 9 * 3600000)
                .toISOString()
                .slice(0, 10);
            const query = search.trim().toLocaleLowerCase();
            return (
                (!status || row.status === status) &&
                (!dateFrom || day >= dateFrom) &&
                (!dateTo || day <= dateTo) &&
                (!query ||
                    `${row.name} ${row.email || ""}`
                        .toLocaleLowerCase()
                        .includes(query))
            );
        })
        .sort((a, b) => a.start.localeCompare(b.start));
    const presets = {
        duration: [30, 45, 60, 90, 120],
        interval: [15, 30, 45, 60, 90, 120],
        bufferBefore: [0, 15, 30, 45, 60],
        bufferAfter: [0, 15, 30, 45, 60],
        noticeHours: [12, 24, 48, 72],
        horizonDays: [7, 14, 21, 30, 60],
    };
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
            <nav
                aria-label="個別相談の管理"
                className="flex flex-wrap gap-1 border-b"
            >
                {[
                    ["settings", "日程・受付設定"],
                    ["bookings", "予約一覧"],
                    ["connection", "Google連携"],
                ].map(([value, label]) => (
                    <Button
                        key={value}
                        type="button"
                        variant="ghost"
                        aria-pressed={panel === value}
                        className={
                            panel === value
                                ? "rounded-none border-b-2 border-primary text-primary"
                                : "rounded-none text-muted-foreground"
                        }
                        onClick={() => setPanel(value)}
                    >
                        {label}
                    </Button>
                ))}
            </nav>
            <form onSubmit={form.handleSubmit(save)} className="space-y-6">
                <section
                    hidden={panel !== "connection"}
                    aria-label="Google連携設定"
                    className="space-y-5 border rounded-lg p-4 sm:p-6"
                >
                    <h2 className="font-bold text-lg">{t.connection}</h2>
                    <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2
                            size={17}
                            className={
                                data.connected
                                    ? "text-primary"
                                    : "text-muted-foreground"
                            }
                        />
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
                <section
                    hidden={panel !== "settings"}
                    aria-label="日程・受付設定"
                    className="border rounded-lg p-4 sm:p-6 space-y-6"
                >
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
                                <div
                                    role="group"
                                    aria-label={labels[key] + "の候補"}
                                    className="flex flex-wrap gap-1"
                                >
                                    {presets[key].map((value) => (
                                        <Button
                                            key={value}
                                            type="button"
                                            size="sm"
                                            variant={
                                                current.current.config[key] ===
                                                value
                                                    ? "default"
                                                    : "outline"
                                            }
                                            aria-pressed={
                                                current.current.config[key] ===
                                                value
                                            }
                                            onClick={() =>
                                                form.setValue(
                                                    `config.${key}`,
                                                    value,
                                                    { shouldDirty: true },
                                                )
                                            }
                                        >
                                            {value}
                                            {key === "noticeHours"
                                                ? "時間"
                                                : key === "horizonDays"
                                                  ? "日"
                                                  : "分"}
                                        </Button>
                                    ))}
                                </div>
                                <Input
                                    id={"appointment-" + key}
                                    className="max-w-28 tabular-nums"
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
                    <fieldset className="space-y-1">
                        <legend className="font-semibold mb-2">
                            {t.windows}
                        </legend>
                        <p className="text-xs text-muted-foreground leading-6 pb-3">
                            曜日ごとに受付時間を設定します。昼休みを挟む場合は、時間帯を分けて追加してください（1日3枠まで）。
                        </p>
                        {t.weekdays.map((label, day) => {
                            const dayRows = windows.fields
                                .map((field, index) => ({ field, index }))
                                .filter(({ field }) => field.day === day);
                            const values =
                                current.current.config.windows.filter(
                                    (w) => w.day === day,
                                );
                            const latest = values.reduce(
                                (end, w) => (w.end > end ? w.end : end),
                                "00:00",
                            );
                            const addDisabled =
                                dayRows.length >= 3 ||
                                windows.fields.length >= 21 ||
                                latest >= "23:59";
                            return (
                                <div
                                    key={day}
                                    className="grid gap-3 border-t py-4 sm:grid-cols-[5rem_1fr]"
                                >
                                    <label className="flex items-center gap-2 self-start pt-2 text-sm font-medium">
                                        <input
                                            type="checkbox"
                                            checked={dayRows.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked)
                                                    windows.append({
                                                        day,
                                                        start: "10:00",
                                                        end: "17:00",
                                                    });
                                                else
                                                    windows.remove(
                                                        dayRows.map(
                                                            ({ index }) =>
                                                                index,
                                                        ),
                                                    );
                                            }}
                                        />
                                        {label}曜日
                                    </label>
                                    <div className="space-y-2 min-w-0">
                                        {!dayRows.length && (
                                            <p className="py-2 text-sm text-muted-foreground">
                                                受付しない
                                            </p>
                                        )}
                                        {dayRows.map(({ field, index }, n) => (
                                            <div
                                                key={field.id}
                                                className="flex flex-wrap items-center gap-2"
                                            >
                                                <Input
                                                    type="time"
                                                    className="w-28 tabular-nums"
                                                    aria-label={`${label}開始${n + 1}`}
                                                    {...form.register(
                                                        `config.windows.${index}.start`,
                                                    )}
                                                />
                                                <span aria-hidden>〜</span>
                                                <Input
                                                    type="time"
                                                    className="w-28 tabular-nums"
                                                    aria-label={`${label}終了${n + 1}`}
                                                    {...form.register(
                                                        `config.windows.${index}.end`,
                                                    )}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    aria-label={`${label}の時間帯${n + 1}を削除`}
                                                    onClick={() =>
                                                        windows.remove(index)
                                                    }
                                                >
                                                    削除
                                                </Button>
                                            </div>
                                        ))}
                                        {!!dayRows.length && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                disabled={addDisabled}
                                                aria-label={`${label}に時間帯を追加`}
                                                onClick={() => {
                                                    const [h, m] = latest
                                                        .split(":")
                                                        .map(Number);
                                                    const end = Math.min(
                                                        h * 60 + m + 60,
                                                        1439,
                                                    );
                                                    const endText = `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
                                                    windows.append({
                                                        day,
                                                        start: latest,
                                                        end: endText,
                                                    });
                                                }}
                                            >
                                                ＋ 時間帯を追加
                                            </Button>
                                        )}
                                    </div>
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
                </section>
                <div
                    className={
                        panel === "bookings"
                            ? "hidden"
                            : "sticky bottom-0 z-10 flex flex-wrap items-center gap-3 border-t bg-background py-4"
                    }
                >
                    {Object.keys(form.formState.errors).length > 0 && (
                        <p role="alert" className="text-sm text-destructive">
                            {t.errors.invalid}
                        </p>
                    )}
                    <Button disabled={busy || !dirty} type="submit">
                        {busy ? t.saving : t.save}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        {dirty
                            ? "変更はまだ保存されていません。"
                            : "保存済みの設定を表示しています。"}
                    </p>
                </div>
            </form>
            <section
                hidden={panel !== "bookings"}
                aria-label="予約一覧"
                className="space-y-4"
            >
                <h2 className="font-bold text-lg">{t.bookings}</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                        <Label htmlFor="appointment-search">
                            名前・メールアドレス
                        </Label>
                        <Input
                            id="appointment-search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            type="search"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="appointment-from">予約日（開始）</Label>
                        <Input
                            id="appointment-from"
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="appointment-to">予約日（終了）</Label>
                        <Input
                            id="appointment-to"
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="appointment-status">予約の状態</Label>
                        <select
                            id="appointment-status"
                            className="w-full rounded-md border bg-background p-2 text-sm"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">すべて</option>
                            {Object.entries(t.statuses).map(
                                ([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ),
                            )}
                        </select>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    直近100件を対象に検索します。表示：{filteredRows.length}件
                </p>
                {!!rows.length && !filteredRows.length && (
                    <p className="text-sm text-muted-foreground">
                        条件に合う予約はありません。
                    </p>
                )}
                {!rows.length && (
                    <p className="text-sm text-muted-foreground">{t.empty}</p>
                )}
                {filteredRows.map((row) => (
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
