"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appointmentRequest } from "@/lib/appointment-client";
import type { AppointmentInterval } from "@courselit/common-models";

const DAY = 86400000;
const localDay = (value: string | number) =>
    new Date(
        (typeof value === "string" ? Date.parse(value) : value) + 9 * 3600000,
    )
        .toISOString()
        .slice(0, 10);
const dayTime = (day: string) => Date.parse(day + "T00:00:00+09:00");
const clock = (value: string) =>
    new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
const dateLabel = (day: string) =>
    new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        month: "long",
        day: "numeric",
        weekday: "short",
    }).format(new Date(day + "T12:00:00+09:00"));

export default function AppointmentSlotPicker({
    preview,
    sample,
    bookingId,
    selected,
    onSelect,
    disabled = false,
    horizonDays = 30,
    durationMinutes = 60,
}: {
    preview: boolean;
    sample: boolean;
    bookingId?: string;
    selected: string;
    onSelect: (value: string) => void;
    disabled?: boolean;
    horizonDays?: number;
    durationMinutes?: number;
}) {
    const [today] = useState(() => localDay(Date.now()));
    const [month, setMonth] = useState(() => today.slice(0, 7));
    const [day, setDay] = useState("");
    const [slots, setSlots] = useState<AppointmentInterval[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [revision, setRevision] = useState(0);
    const generation = useRef(0);
    const select = useRef(onSelect);
    select.current = onSelect;
    const lastDay = localDay(dayTime(today) + horizonDays * DAY);
    const first = new Date(month + "-01T12:00:00Z");
    const year = first.getUTCFullYear();
    const monthNumber = first.getUTCMonth();
    const count = new Date(Date.UTC(year, monthNumber + 1, 0)).getUTCDate();
    const previousMonth = new Date(Date.UTC(year, monthNumber - 1, 1))
        .toISOString()
        .slice(0, 7);
    const nextMonth = new Date(Date.UTC(year, monthNumber + 1, 1))
        .toISOString()
        .slice(0, 7);
    const days = Array.from(
        { length: Math.ceil((first.getUTCDay() + count) / 7) * 7 },
        (_, index) => {
            const number = index - first.getUTCDay() + 1;
            return number > 0 && number <= count
                ? month + "-" + String(number).padStart(2, "0")
                : "";
        },
    );
    const grouped = new Map<string, AppointmentInterval[]>();
    for (const slot of slots) {
        const key = localDay(slot.start);
        grouped.set(key, [...(grouped.get(key) || []), slot]);
    }
    useEffect(() => {
        const run = ++generation.current;
        const controller = new AbortController();
        setSlots([]);
        setDay("");
        setError("");
        setLoading(true);
        select.current("");
        async function loadMonth() {
            try {
                const start = month + "-01" < today ? today : month + "-01";
                const endOfMonth = month + "-" + String(count).padStart(2, "0");
                const end = endOfMonth > lastDay ? lastDay : endOfMonth;
                const result: AppointmentInterval[] = [];
                for (
                    let cursor = dayTime(start);
                    cursor <= dayTime(end);
                    cursor += 14 * DAY
                ) {
                    const length = Math.min(
                        14,
                        Math.round((dayTime(end) - cursor) / DAY) + 1,
                    );
                    if (sample) {
                        for (let i = 0; i < length; i++) {
                            const date = localDay(cursor + i * DAY);
                            if (
                                date <= today ||
                                new Date(date + "T12:00:00Z").getUTCDay() === 0
                            )
                                continue;
                            for (const hour of [10, 12, 14]) {
                                const time = Date.parse(
                                    date + `T${hour}:00:00+09:00`,
                                );
                                result.push({
                                    start: new Date(time).toISOString(),
                                    end: new Date(
                                        time + durationMinutes * 60000,
                                    ).toISOString(),
                                });
                            }
                        }
                    } else {
                        const data = await appointmentRequest(
                            "availability?" +
                                new URLSearchParams({
                                    from: localDay(cursor),
                                    days: String(length),
                                    preview: preview ? "1" : "0",
                                    ...(bookingId ? { bookingId } : {}),
                                }),
                            undefined,
                            controller.signal,
                        );
                        result.push(...data.slots);
                    }
                    if (controller.signal.aborted) return;
                }
                if (run === generation.current && !controller.signal.aborted) {
                    setSlots(
                        result
                            .filter(
                                (s) => localDay(s.start).slice(0, 7) === month,
                            )
                            .sort((a, b) => a.start.localeCompare(b.start)),
                    );
                }
            } catch (e) {
                if (run === generation.current && !controller.signal.aborted)
                    setError((e as Error).message);
            } finally {
                if (run === generation.current && !controller.signal.aborted)
                    setLoading(false);
            }
        }
        void loadMonth();
        return () => controller.abort();
    }, [
        month,
        today,
        count,
        lastDay,
        preview,
        sample,
        bookingId,
        revision,
        durationMinutes,
    ]);

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-8">
            <section aria-label="予約日カレンダー" className="min-w-0">
                <div className="mb-4 flex items-center justify-between gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="前の月"
                        disabled={disabled || previousMonth < today.slice(0, 7)}
                        onClick={() => setMonth(previousMonth)}
                    >
                        <ChevronLeft size={18} />
                    </Button>
                    <h3 className="text-xl font-semibold tabular-nums">
                        {year}年{monthNumber + 1}月
                    </h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="次の月"
                        disabled={disabled || nextMonth > lastDay.slice(0, 7)}
                        onClick={() => setMonth(nextMonth)}
                    >
                        <ChevronRight size={18} />
                    </Button>
                </div>
                <table
                    className="w-full table-fixed border-collapse"
                    aria-busy={loading}
                >
                    <caption className="sr-only">
                        {year}年{monthNumber + 1}
                        月の予約受付日。空きありの日を選んでください。
                    </caption>
                    <thead>
                        <tr>
                            {["日", "月", "火", "水", "木", "金", "土"].map(
                                (label) => (
                                    <th
                                        key={label}
                                        scope="col"
                                        className="pb-2 text-center text-xs font-medium text-muted-foreground"
                                    >
                                        {label}
                                    </th>
                                ),
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: days.length / 7 }, (_, week) => (
                            <tr key={week}>
                                {days
                                    .slice(week * 7, week * 7 + 7)
                                    .map((value, index) => {
                                        const available =
                                            !!grouped.get(value)?.length;
                                        return (
                                            <td
                                                key={value || `blank-${index}`}
                                                className="p-0.5"
                                            >
                                                {value ? (
                                                    <button
                                                        type="button"
                                                        aria-label={`${year}年${monthNumber + 1}月${Number(value.slice(-2))}日 ${loading ? "確認中" : available ? "空きあり" : "受付なし"}`}
                                                        aria-pressed={
                                                            day === value
                                                        }
                                                        aria-current={
                                                            value === today
                                                                ? "date"
                                                                : undefined
                                                        }
                                                        disabled={
                                                            disabled ||
                                                            loading ||
                                                            !available
                                                        }
                                                        onClick={() => {
                                                            setDay(value);
                                                            select.current("");
                                                        }}
                                                        className={
                                                            "flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-md border text-sm tabular-nums transition-colors sm:min-h-16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 " +
                                                            (day === value
                                                                ? "border-primary bg-primary text-primary-foreground"
                                                                : available
                                                                  ? "border-primary/20 bg-primary/5 font-semibold text-foreground hover:border-primary hover:bg-primary/10"
                                                                  : "border-transparent text-muted-foreground/50")
                                                        }
                                                    >
                                                        <span>
                                                            {Number(
                                                                value.slice(-2),
                                                            )}
                                                        </span>
                                                        <span
                                                            className={
                                                                "text-[10px] leading-none " +
                                                                (day === value
                                                                    ? "text-primary-foreground"
                                                                    : "text-primary")
                                                            }
                                                            aria-hidden
                                                        >
                                                            {loading
                                                                ? "·"
                                                                : available
                                                                  ? "○"
                                                                  : ""}
                                                        </span>
                                                    </button>
                                                ) : (
                                                    <span className="block min-h-14 sm:min-h-16" />
                                                )}
                                            </td>
                                        );
                                    })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <p>
                        <span className="font-semibold text-primary">○</span>{" "}
                        空きあり{" "}
                        <span className="ml-3">日時は日本時間です</span>
                    </p>
                    <button
                        type="button"
                        disabled={loading || disabled}
                        onClick={() => setRevision((v) => v + 1)}
                        className="underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                    >
                        空き状況を再確認
                    </button>
                </div>
            </section>
            <section
                aria-label="選んだ日の空き時間"
                className="min-w-0 border-t pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0"
            >
                <h3 className="text-lg font-semibold">
                    {day ? dateLabel(day) : "希望の日を選んでください"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    {day
                        ? `空いている時間から選べます（${durationMinutes}分）`
                        : "カレンダーの「○」がある日を押すと、空き時間が表示されます。"}
                </p>
                {loading && (
                    <p
                        role="status"
                        className="py-10 text-sm text-muted-foreground"
                    >
                        空き状況を確認しています…
                    </p>
                )}
                {error && (
                    <p
                        role="alert"
                        className="mt-5 text-sm leading-7 text-destructive"
                    >
                        {error} 「空き状況を再確認」からお試しください。
                    </p>
                )}
                {!loading && !error && !slots.length && (
                    <p className="py-8 text-sm leading-7 text-muted-foreground">
                        この月に予約できる日時はありません。別の月をご確認ください。
                    </p>
                )}
                {day && !loading && !error && (
                    <fieldset
                        aria-label="空いている日時"
                        className="mt-5 grid grid-cols-3 gap-2 lg:max-h-96 lg:overflow-y-auto lg:p-0.5"
                    >
                        {(grouped.get(day) || []).map((time) => (
                            <label key={time.start} className="cursor-pointer">
                                <input
                                    className="peer sr-only"
                                    type="radio"
                                    name="appointment-time"
                                    aria-label={`${dateLabel(day)} ${clock(time.start)}〜${clock(time.end)}`}
                                    value={time.start}
                                    checked={selected === time.start}
                                    disabled={disabled}
                                    onChange={() => select.current(time.start)}
                                />
                                <span className="flex min-h-12 items-center justify-center gap-0.5 rounded-md border px-1 text-sm tabular-nums transition-colors hover:border-primary peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-disabled:opacity-50">
                                    <span className="font-medium">
                                        {clock(time.start)}
                                    </span>
                                    <span className="text-xs">
                                        〜{clock(time.end)}
                                    </span>
                                </span>
                            </label>
                        ))}
                    </fieldset>
                )}
                {selected && (
                    <a
                        href="#appointment-details"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary underline underline-offset-4"
                    >
                        お名前・内容の確認へ
                        <ArrowRight size={16} />
                    </a>
                )}
            </section>
        </div>
    );
}
