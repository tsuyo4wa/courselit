"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { CreditCard, FileCheck2, Settings2 } from "lucide-react";
import AdminFlowConnector from "./admin-flow-connector";
import { Button } from "@/components/ui/button";
import type { FunnelCourse } from "@/lib/funnel-types";
import { readThankYouUrl } from "@/lib/thank-you-url";
import { funnelUiText as t } from "@/config/strings";
interface FunnelFlowProps {
    children: ReactNode;
    course?: FunnelCourse;
    lpCount: number;
    dirty: boolean;
    onSettings: () => void;
}
export default function FunnelFlow({
    children,
    course,
    lpCount,
    dirty,
    onSettings,
}: FunnelFlowProps) {
    const thanks = readThankYouUrl(course?.thankYouUrl);
    return (
        <section aria-label={t.flowLabel} className="mx-auto max-w-4xl">
            {children}
            <AdminFlowConnector
                merge={lpCount > 1}
                label={lpCount > 1 ? t.merge : t.checkoutStage}
            />
            <section
                aria-label={t.checkoutStage}
                data-admin-surface="panel"
                data-admin-node="true"
                className="mx-auto max-w-xl rounded-lg border border-border bg-card p-4 sm:p-5"
            >
                <div className="admin-node-heading flex items-center gap-3">
                    <CreditCard
                        size={20}
                        className="shrink-0 text-primary"
                        aria-hidden
                    />
                    <h2 className="min-w-0 flex-1 font-semibold">
                        <span className="admin-step mr-3">02</span>
                        {t.checkoutStage}
                    </h2>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onSettings}
                    >
                        <Settings2 size={14} className="mr-1.5" />
                        {t.nodeSettings}
                    </Button>
                </div>
                <p className="mt-4 break-words text-sm leading-6">
                    {course?.title || t.course}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                    {course?.plans.map((p) => p.name).join("／") ||
                        t.unspecified}
                </p>
                {course && (
                    <Link
                        href={`/dashboard/product/${course.courseId}/manage`}
                        aria-disabled={dirty}
                        onClick={(event) => {
                            if (dirty) event.preventDefault();
                        }}
                        className={`mt-3 inline-block text-sm underline underline-offset-4 ${dirty ? "pointer-events-none opacity-50" : ""}`}
                    >
                        {t.checkoutSettings}
                    </Link>
                )}
            </section>
            <AdminFlowConnector label={t.afterSignup} />
            <section
                aria-label={t.thanksStage}
                data-admin-surface="panel"
                data-admin-node="true"
                className="mx-auto max-w-xl rounded-lg border border-border bg-card p-4 sm:p-5"
            >
                <div className="admin-node-heading flex flex-wrap items-center gap-3">
                    <FileCheck2
                        size={20}
                        className="shrink-0 text-primary"
                        aria-hidden
                    />
                    <h2 className="min-w-0 flex-1 font-semibold">
                        <span className="admin-step mr-3">03</span>
                        {t.thanksStage}
                    </h2>
                    {course && (
                        <Button asChild variant="outline" size="sm">
                            <Link
                                aria-disabled={dirty}
                                onClick={(event) => {
                                    if (dirty) event.preventDefault();
                                }}
                                className={
                                    dirty
                                        ? "pointer-events-none opacity-50"
                                        : ""
                                }
                                href={`/dashboard/product/${course.courseId}/manage`}
                            >
                                {t.thanksSettings}
                            </Link>
                        </Button>
                    )}
                </div>
                <p className="mt-4 break-all text-sm leading-6">
                    {thanks || t.normalThanks}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {t.commonThanksDescription}
                </p>
                {thanks && (
                    <a
                        className="mt-3 inline-block text-sm underline underline-offset-4"
                        href={thanks}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t.thanksPreview}
                    </a>
                )}
            </section>
        </section>
    );
}
