"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, ChevronRight, CalendarDays } from "lucide-react";
import { appointmentText as t } from "@/config/strings";
import { appointmentReleaseText } from "@/config/strings";
import AdminEmptyState from "./empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { appointmentRequest } from "@/lib/appointment-client";
import type { AppointmentListProps } from "@courselit/common-models";
const schema = z.object({
    name: z.string().trim().min(1).max(100),
    duration: z.number().int().min(15).max(180).multipleOf(5),
});
export default function AppointmentList({ initial }: AppointmentListProps) {
    const router = useRouter();
    const [creating, setCreating] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: { name: "", duration: 60 },
    });
    const values = useRef(form.getValues());
    values.current = form.watch();
    const types = initial.types.filter((v) =>
        v.title.toLowerCase().includes(search.trim().toLowerCase()),
    );
    async function create() {
        if (busy) return;
        setBusy(true);
        setMessage("");
        try {
            const result = await appointmentRequest("types", values.current);
            router.push(`/dashboard/appointments/${result.typeId}`);
        } catch (e) {
            setMessage((e as Error).message);
        } finally {
            setBusy(false);
        }
    }
    return (
        <main className="mx-auto w-full max-w-6xl space-y-6 px-3 py-6 sm:px-6 sm:py-8">
            <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-2xl font-semibold">{t.listTitle}</h1>
                    <p className="mt-3 text-sm text-muted-foreground">
                        {t.listIntro}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/appointments/release-review">
                            {appointmentReleaseText.title}
                        </Link>
                    </Button>
                    <Button
                        disabled={busy}
                        onClick={() => setCreating((v) => !v)}
                    >
                        <Plus size={16} />
                        {t.createType}
                    </Button>
                </div>
            </header>
            <section
                data-admin-surface="panel"
                className="flex flex-wrap items-center justify-between gap-4 p-4"
            >
                <div>
                    <p className="font-semibold">{t.sharedConnection}</p>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        {t.sharedConnectionHelp}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                        {initial.connected ? t.connected : t.notConnected}
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/dashboard/appointments/connection">
                        {t.connectionSettings}
                    </Link>
                </Button>
            </section>
            <p
                role="status"
                aria-live="polite"
                className={message ? "text-sm" : "sr-only"}
            >
                {message}
            </p>
            {creating && (
                <form
                    onSubmit={form.handleSubmit(create)}
                    aria-label={t.createTypeForm}
                    data-admin-surface="panel"
                    className="grid gap-4 p-4 sm:grid-cols-[1fr_10rem_auto]"
                >
                    <label className="space-y-2 text-sm">
                        {t.typeName}
                        <Input
                            required
                            maxLength={100}
                            {...form.register("name")}
                        />
                    </label>
                    <label className="space-y-2 text-sm">
                        {t.duration}
                        <select
                            className="h-10 w-full border px-3"
                            {...form.register("duration", {
                                valueAsNumber: true,
                            })}
                        >
                            {[30, 45, 60, 90, 120].map((n) => (
                                <option key={n} value={n}>
                                    {n}分
                                </option>
                            ))}
                        </select>
                    </label>
                    <Button
                        className="self-end"
                        disabled={busy || !values.current.name.trim()}
                    >
                        {t.createPaused}
                    </Button>
                </form>
            )}
            <Input
                aria-label={t.typeSearch}
                placeholder={t.typeSearch}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="sm:max-w-sm"
            />
            <ul data-admin-surface="panel" className="divide-y">
                {types.map((v) => (
                    <li key={v.typeId}>
                        <Link
                            href={`/dashboard/appointments/${v.typeId}`}
                            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-4 transition-colors hover:bg-muted/50 sm:grid-cols-[auto_minmax(0,1fr)_5rem_7rem_auto]"
                        >
                            <CalendarDays size={20} className="text-primary" />
                            <div>
                                <h2 className="break-words font-semibold">
                                    {v.title}
                                </h2>
                                <p className="text-xs text-muted-foreground sm:hidden">
                                    {v.duration}分・
                                    {v.enabled ? t.accepting : t.paused}
                                </p>
                            </div>
                            <span className="hidden text-sm tabular-nums sm:block">
                                {v.duration}分
                            </span>
                            <span className="hidden text-sm sm:block">
                                {v.enabled ? t.accepting : t.paused}
                            </span>
                            <ChevronRight
                                size={18}
                                className="text-muted-foreground"
                            />
                        </Link>
                    </li>
                ))}
            </ul>
            {!types.length && <AdminEmptyState title={t.noTypeMatch} />}
        </main>
    );
}
