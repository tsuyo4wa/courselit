"use client";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { CalendarDays, ArrowRight, Check, Video, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { appointmentText as t } from "@/config/strings";
import { appointmentRequest, appointmentTime } from "@/lib/appointment-client";
import type {
    AppointmentInterval,
    AppointmentView,
    AppointmentUiProps,
} from "@courselit/common-models";
const formSchema = z.object({
    name: z.string().trim().min(1).max(100),
    notes: z.string().trim().max(2000),
    consent: z.boolean().refine(Boolean),
});
export default function AppointmentBooker({
    preview,
    sample = false,
    title,
    description,
    loggedIn,
    initialBookings = [],
}: AppointmentUiProps) {
    const [date, setDate] = useState(
        new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10),
    );
    const [times, setTimes] = useState<AppointmentInterval[]>([]);
    const [displayDay, setDisplayDay] = useState("");
    const [selected, setSelected] = useState("");
    const [bookings, setBookings] = useState(initialBookings);
    const [changing, setChanging] = useState<AppointmentView | null>(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [searched, setSearched] = useState(false);
    const abort = useRef<AbortController | null>(null);
    const generation = useRef(0);
    const createKey = useRef("");
    const formRef = useRef({ name: "", notes: "", consent: false });
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: formRef.current,
    });
    formRef.current = form.watch();
    useEffect(() => () => abort.current?.abort(), []);
    async function load() {
        const n = ++generation.current;
        abort.current?.abort();
        const controller = new AbortController();
        abort.current = controller;
        setBusy(true);
        setMessage("");
        setSelected("");
        setTimes([]);
        setSearched(false);
        try {
            if (sample) {
                const d = new Date(date + "T10:00:00+09:00");
                setTimes(
                    [0, 2, 4].map((h) => ({
                        start: new Date(
                            d.getTime() + h * 3600000,
                        ).toISOString(),
                        end: new Date(
                            d.getTime() + (h + 1) * 3600000,
                        ).toISOString(),
                    })),
                );
                setDisplayDay(date);
                setSearched(true);
            } else {
                const data = await appointmentRequest(
                    "availability?" +
                        new URLSearchParams({
                            from: date,
                            days: "7",
                            preview: preview ? "1" : "0",
                            ...(changing
                                ? { bookingId: changing.bookingId }
                                : {}),
                        }),
                    undefined,
                    controller.signal,
                );
                if (n === generation.current) {
                    setTimes(data.slots);
                    setDisplayDay(
                        data.slots.length
                            ? new Date(
                                  Date.parse(data.slots[0].start) + 9 * 3600000,
                              )
                                  .toISOString()
                                  .slice(0, 10)
                            : date,
                    );
                    setSearched(true);
                }
            }
        } catch (e) {
            if (!controller.signal.aborted) setMessage((e as Error).message);
        } finally {
            if (n === generation.current) setBusy(false);
        }
    }
    function resetSelection() {
        generation.current++;
        abort.current?.abort();
        setTimes([]);
        setSelected("");
        setSearched(false);
        setBusy(false);
        createKey.current = "";
    }
    async function submit() {
        if (sample || !selected) return;
        setBusy(true);
        setMessage("");
        createKey.current ||= crypto.randomUUID();
        try {
            const data = await appointmentRequest("bookings", {
                action: changing ? "reschedule" : "create",
                preview,
                key: createKey.current,
                start: selected,
                ...(changing
                    ? { id: changing.bookingId, version: changing.version }
                    : {
                          name: formRef.current.name,
                          notes: formRef.current.notes,
                          consent: formRef.current.consent,
                      }),
            });
            setBookings((v) => [
                data.booking,
                ...v.filter((b) => b.bookingId !== data.booking.bookingId),
            ]);
            setChanging(null);
            resetSelection();
            setMessage(
                data.booking.status === "needs_review"
                    ? t.uncertainty
                    : t.updated,
            );
        } catch (e) {
            setMessage((e as Error).message);
        } finally {
            setBusy(false);
        }
    }
    async function cancel(b: AppointmentView) {
        if (sample || !window.confirm(t.cancelConfirm)) return;
        setBusy(true);
        setMessage("");
        try {
            const data = await appointmentRequest("bookings", {
                action: "cancel",
                preview: b.preview,
                key: crypto.randomUUID(),
                id: b.bookingId,
                version: b.version,
            });
            setBookings((v) =>
                v.map((row) =>
                    row.bookingId === b.bookingId ? data.booking : row,
                ),
            );
            setMessage(
                data.booking.status === "needs_review"
                    ? t.uncertainty
                    : t.updated,
            );
        } catch (e) {
            setMessage((e as Error).message);
        } finally {
            setBusy(false);
        }
    }
    return (
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 space-y-9 text-foreground">
            {(preview || sample) && (
                <p className="border-l-2 border-primary bg-muted/50 px-4 py-3 text-sm leading-7">
                    {sample ? t.sampleNotice : t.previewNotice}
                </p>
            )}
            <header className="space-y-4">
                <p className="flex items-center gap-2 text-sm text-primary">
                    <CalendarDays size={18} />
                    {t.title}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold leading-relaxed">
                    {title}
                </h1>
                <p className="text-base leading-8 text-muted-foreground">
                    {description}
                </p>
                <p className="text-sm flex items-center gap-2 text-muted-foreground">
                    <Video size={16} />
                    {t.online}
                    <span aria-hidden> · </span>
                    <Clock3 size={16} />
                    {t.timezone}
                </p>
            </header>
            <ol className="flex flex-wrap gap-x-3 gap-y-2 border-y py-4 text-sm">
                {t.flow.map((label, i) => (
                    <li key={label} className="flex items-center gap-2">
                        <span className="text-primary font-semibold">
                            {i + 1}
                        </span>
                        {label}
                        {i < 2 && (
                            <ArrowRight
                                size={14}
                                className="ml-1 text-muted-foreground"
                                aria-hidden
                            />
                        )}
                    </li>
                ))}
            </ol>
            <div
                role="status"
                aria-live="polite"
                className={
                    message
                        ? "rounded-md border border-primary/30 px-4 py-3 text-sm leading-7"
                        : "sr-only"
                }
            >
                {message}
            </div>
            {bookings.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-bold">{t.yours}</h2>
                    {bookings.map((b) => (
                        <article
                            key={b.bookingId}
                            className="border rounded-lg p-4 sm:p-5 space-y-3"
                        >
                            <div className="flex flex-wrap justify-between gap-2">
                                <p className="font-semibold">
                                    {appointmentTime(b.start)}
                                </p>
                                <span className="text-sm text-primary">
                                    {t.statuses[b.status]}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t.id}：{b.bookingId}
                            </p>
                            {b.zoomUrl && (
                                <a
                                    href={b.zoomUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-primary underline underline-offset-4"
                                >
                                    <Video size={16} />
                                    {t.zoomJoin}
                                </a>
                            )}
                            {b.status === "confirmed" &&
                                Date.parse(b.start) > Date.now() && (
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            disabled={busy}
                                            onClick={() => {
                                                setChanging(b);
                                                resetSelection();
                                                setMessage("");
                                            }}
                                        >
                                            {t.change}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            disabled={busy}
                                            onClick={() => cancel(b)}
                                        >
                                            {t.cancel}
                                        </Button>
                                    </div>
                                )}
                            {b.status === "needs_review" && (
                                <p className="text-sm leading-7">
                                    {t.uncertainty}{" "}
                                    <Link className="underline" href="/contact">
                                        {t.contact}
                                    </Link>
                                </p>
                            )}
                        </article>
                    ))}
                </section>
            )}
            {(!bookings.some(
                (b) =>
                    b.status !== "cancelled" && Date.parse(b.end) > Date.now(),
            ) ||
                changing ||
                sample) && (
                <>
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <CalendarDays size={20} className="text-primary" />
                            {changing ? t.change : t.times}
                        </h2>
                        {changing && (
                            <Button
                                variant="link"
                                onClick={() => {
                                    setChanging(null);
                                    resetSelection();
                                }}
                            >
                                {t.cancelChange}
                            </Button>
                        )}
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="appointment-date">
                                    {t.date}
                                </Label>
                                <Input
                                    id="appointment-date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => {
                                        setDate(e.target.value);
                                        resetSelection();
                                    }}
                                />
                            </div>
                            <Button onClick={load} disabled={busy || !date}>
                                {busy ? t.loading : t.search}
                            </Button>
                        </div>
                        {searched && times.length === 0 && (
                            <p className="py-5 text-muted-foreground">
                                {t.noSlots}
                            </p>
                        )}
                        {searched && times.length > 0 && (
                            <div
                                className="flex flex-wrap gap-2"
                                aria-label={t.date}
                            >
                                {Array.from(
                                    new Set(
                                        times.map((time) =>
                                            new Date(
                                                Date.parse(time.start) +
                                                    9 * 3600000,
                                            )
                                                .toISOString()
                                                .slice(0, 10),
                                        ),
                                    ),
                                ).map((day) => (
                                    <Button
                                        key={day}
                                        type="button"
                                        variant={
                                            displayDay === day
                                                ? "default"
                                                : "outline"
                                        }
                                        aria-pressed={displayDay === day}
                                        onClick={() => {
                                            setDisplayDay(day);
                                            setSelected("");
                                            createKey.current = "";
                                        }}
                                    >
                                        {new Intl.DateTimeFormat("ja-JP", {
                                            timeZone: "Asia/Tokyo",
                                            month: "numeric",
                                            day: "numeric",
                                            weekday: "short",
                                        }).format(
                                            new Date(day + "T12:00:00+09:00"),
                                        )}
                                    </Button>
                                ))}
                            </div>
                        )}
                        <fieldset
                            aria-label={t.times}
                            className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 gap-2"
                        >
                            {times
                                .filter(
                                    (time) =>
                                        !displayDay ||
                                        new Date(
                                            Date.parse(time.start) +
                                                9 * 3600000,
                                        )
                                            .toISOString()
                                            .slice(0, 10) === displayDay,
                                )
                                .map((time) => (
                                    <label
                                        key={time.start}
                                        className={
                                            "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-3 text-sm " +
                                            (selected === time.start
                                                ? "border-primary bg-primary/10"
                                                : "hover:bg-muted")
                                        }
                                    >
                                        <input
                                            type="radio"
                                            name="appointment-time"
                                            value={time.start}
                                            checked={selected === time.start}
                                            onChange={() => {
                                                setSelected(time.start);
                                                createKey.current = "";
                                            }}
                                            className="accent-primary"
                                        />
                                        {appointmentTime(time.start)}
                                    </label>
                                ))}
                        </fieldset>
                    </section>
                    {selected &&
                        (!loggedIn && !sample ? (
                            <div className="space-y-3">
                                <p className="text-sm leading-7">
                                    {t.loginHelp}
                                </p>
                                <Button asChild>
                                    <Link href="/login?redirect=%2Fappointments">
                                        {t.login}
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <form
                                onSubmit={
                                    changing
                                        ? (e) => {
                                              e.preventDefault();
                                              submit();
                                          }
                                        : form.handleSubmit(submit)
                                }
                                className="border-t pt-7 space-y-5"
                            >
                                <p className="font-semibold flex items-center gap-2">
                                    <Check size={18} className="text-primary" />
                                    {appointmentTime(selected)}
                                </p>
                                {!changing && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="appointment-name">
                                                {t.name}
                                            </Label>
                                            <Input
                                                id="appointment-name"
                                                autoComplete="name"
                                                maxLength={100}
                                                {...form.register("name")}
                                                aria-invalid={
                                                    !!form.formState.errors.name
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="appointment-notes">
                                                {t.notes}
                                            </Label>
                                            <Textarea
                                                id="appointment-notes"
                                                maxLength={2000}
                                                {...form.register("notes")}
                                            />
                                            <p className="text-xs text-muted-foreground leading-6">
                                                {t.notesHelp}
                                            </p>
                                        </div>
                                        <label className="flex items-start gap-3 text-sm leading-7">
                                            <input
                                                type="checkbox"
                                                {...form.register("consent")}
                                                className="mt-2"
                                            />
                                            {t.consent}
                                        </label>
                                        <Link
                                            className="text-sm underline"
                                            href="/p/privacy"
                                        >
                                            {t.privacy}
                                        </Link>
                                    </>
                                )}
                                {Object.keys(form.formState.errors).length >
                                    0 && (
                                    <p
                                        role="alert"
                                        className="text-sm text-destructive"
                                    >
                                        {t.errors.invalid}
                                    </p>
                                )}
                                <div>
                                    <Button
                                        type="submit"
                                        disabled={busy || sample}
                                    >
                                        {busy
                                            ? t.saving
                                            : changing
                                              ? t.changeSubmit
                                              : preview
                                                ? t.confirmPreview
                                                : t.confirm}
                                    </Button>
                                </div>
                            </form>
                        ))}
                </>
            )}
        </div>
    );
}
