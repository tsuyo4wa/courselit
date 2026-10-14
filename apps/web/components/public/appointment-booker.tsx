"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ThemeContext } from "@/components/contexts";
import { generateThemeStyles } from "@/lib/theme-styles";
import { CalendarDays, ArrowRight, Check, Video, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { appointmentText as t } from "@/config/strings";
import { appointmentRequest, appointmentTime } from "@/lib/appointment-client";
import AppointmentSlotPicker from "./appointment-slot-picker";
import type {
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
    themeStyles,
    sample = false,
    title,
    description,
    loggedIn,
    initialBookings = [],
    horizonDays = 30,
    durationMinutes = 60,
    returnTo,
}: AppointmentUiProps & {
    horizonDays?: number;
    durationMinutes?: number;
    returnTo?: string;
}) {
    const { theme } = useContext(ThemeContext);
    const [selected, setSelected] = useState("");
    const [resumeStart, setResumeStart] = useState("");
    useEffect(() => {
        if (!preview && !sample && loggedIn && returnTo?.startsWith("/lp/")) {
            const value = new URLSearchParams(window.location.search).get(
                "slot",
            );
            if (
                value &&
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
                Number.isFinite(Date.parse(value))
            )
                setResumeStart(value);
        }
    }, [loggedIn, preview, sample, returnTo]);
    const loginTarget =
        returnTo && /^\/lp\/[a-z0-9-]+$/.test(returnTo)
            ? "/login?" +
              new URLSearchParams({
                  redirect:
                      returnTo +
                      "?" +
                      new URLSearchParams({ slot: selected }).toString(),
              })
            : "/login?redirect=%2Fappointments";
    const [bookings, setBookings] = useState(initialBookings);
    const [changing, setChanging] = useState<AppointmentView | null>(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const createKey = useRef("");
    const formRef = useRef({ name: "", notes: "", consent: false });
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: formRef.current,
    });
    formRef.current = form.watch();
    function resetSelection() {
        setSelected("");
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
        <div className="courselit-theme appointment-booking-shell mx-auto w-full max-w-5xl bg-background px-3 py-6 sm:px-6 sm:py-8 space-y-6 text-foreground">
            <style>
                {themeStyles ||
                    (theme?.theme?.colors
                        ? generateThemeStyles(theme).replaceAll(
                              ".courselit-theme",
                              ".appointment-booking-shell",
                          )
                        : "")}
            </style>
            {(preview || sample) && (
                <p className="border-l-2 border-primary bg-muted/50 px-4 py-3 text-sm leading-7">
                    {sample ? t.sampleNotice : t.previewNotice}
                </p>
            )}
            <header className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold leading-snug">
                    {title}
                </h1>
                <p className="text-base leading-7 text-muted-foreground">
                    {description}
                </p>
                <p className="text-sm flex flex-wrap items-center gap-2 text-muted-foreground">
                    <Video size={16} />
                    {t.online}
                    <span aria-hidden> · </span>
                    <Clock3 size={16} />
                    {t.timezone}
                </p>
            </header>
            <ol className="flex flex-wrap gap-x-3 gap-y-2 border-y py-3 text-sm">
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
                    <section className="space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <CalendarDays
                                    size={20}
                                    className="text-primary"
                                />
                                {changing ? t.change : "日付と時間を選ぶ"}
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
                        </div>
                        <AppointmentSlotPicker
                            key={changing?.bookingId || "new"}
                            preview={preview}
                            sample={sample}
                            bookingId={changing?.bookingId}
                            selected={selected}
                            initialStart={resumeStart}
                            disabled={busy}
                            horizonDays={horizonDays}
                            durationMinutes={durationMinutes}
                            onSelect={(value) => {
                                setSelected(value);
                                createKey.current = "";
                            }}
                        />
                    </section>
                    {selected &&
                        (!loggedIn && !sample ? (
                            <div
                                id="appointment-details"
                                className="scroll-mt-6 space-y-3"
                            >
                                <p className="text-sm leading-7">
                                    {t.loginHelp}
                                </p>
                                <Button asChild>
                                    <Link href={loginTarget}>{t.login}</Link>
                                </Button>
                            </div>
                        ) : (
                            <form
                                id="appointment-details"
                                onSubmit={
                                    changing
                                        ? (e) => {
                                              e.preventDefault();
                                              submit();
                                          }
                                        : form.handleSubmit(submit)
                                }
                                className="scroll-mt-6 border-t pt-6 space-y-5"
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
