"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Constants } from "@courselit/common-models";
import { Input } from "@/components/ui/input";
import AdminEmptyState from "./empty-state";
import type { FunnelAdminData, FunnelCourse } from "@/lib/funnel-types";
import { funnelUiText as t } from "@/config/strings";
interface FunnelListProps {
    data: FunnelAdminData;
    busy: boolean;
}
export function recruitmentKind(course?: FunnelCourse): string {
    const plans = course?.plans || [];
    if (!plans.length) return t.unspecified;
    const free = plans.some((p) => p.type === Constants.PaymentPlanType.FREE);
    const paid = plans.some((p) => p.type !== Constants.PaymentPlanType.FREE);
    return free && paid ? t.mixed : free ? t.free : t.paid;
}
export default function FunnelList({ data, busy }: FunnelListProps) {
    const [search, setSearch] = useState("");
    const [archived, setArchived] = useState(false);
    const list = useMemo(
        () =>
            data.funnels.filter(
                (f) =>
                    (archived || !f.archived) &&
                    (f.name + " " + (f.course?.title || ""))
                        .toLowerCase()
                        .includes(search.trim().toLowerCase()),
            ),
        [data, search, archived],
    );
    return (
        <section aria-label={t.listTitle} className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Input
                    aria-label={t.search}
                    placeholder={t.searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="sm:max-w-sm"
                />
                <label className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                    <input
                        type="checkbox"
                        checked={archived}
                        onChange={(e) => setArchived(e.target.checked)}
                    />
                    {t.archivedToggle}
                </label>
            </div>
            {!!list.length && (
                <>
                    <div
                        className="hidden gap-5 border-b px-4 pb-3 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.3fr)_3rem_6rem_1rem]"
                        aria-hidden="true"
                    >
                        <span>{t.name}</span>
                        <span>{t.course}</span>
                        <span>{t.count}</span>
                        <span>{t.status}</span>
                        <span />
                    </div>
                    <ul className="divide-y border-b">
                        {list.map((f) => (
                            <li key={f.funnelId}>
                                <Link
                                    aria-disabled={busy}
                                    tabIndex={busy ? -1 : undefined}
                                    href={`/dashboard/funnels/${f.funnelId}`}
                                    className={`group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 rounded-sm px-3 py-5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.3fr)_3rem_6rem_1rem] md:gap-5 md:px-4 ${busy ? "pointer-events-none opacity-60" : ""}`}
                                >
                                    <div className="min-w-0">
                                        <p className="break-words font-semibold leading-6">
                                            {f.name}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {recruitmentKind(f.course)}
                                        </p>
                                    </div>
                                    <p className="col-span-2 row-start-2 min-w-0 break-words text-sm leading-6 text-muted-foreground md:col-span-1 md:row-auto">
                                        {f.course?.title || t.unspecified}
                                    </p>
                                    <span className="col-start-1 row-start-3 text-sm tabular-nums md:col-auto md:row-auto">
                                        {f.entries.length}
                                        <span className="ml-1 text-xs text-muted-foreground md:hidden">
                                            LP
                                        </span>
                                    </span>
                                    <span className="col-start-2 row-start-3 text-xs font-medium md:col-auto md:row-auto">
                                        {f.archived
                                            ? t.archived
                                            : f.active
                                              ? t.live
                                              : f.publication
                                                ? t.paused
                                                : t.draft}
                                    </span>
                                    <ChevronRight
                                        size={17}
                                        className="col-start-2 row-start-1 justify-self-end text-muted-foreground transition-transform group-hover:translate-x-0.5 md:col-auto md:row-auto"
                                        aria-hidden
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </>
            )}
            {!list.length && (
                <AdminEmptyState
                    title={data.funnels.length ? t.noMatches : t.emptyTitle}
                    description={
                        data.funnels.length
                            ? t.noMatchesDescription
                            : t.emptyDescription
                    }
                />
            )}
        </section>
    );
}
