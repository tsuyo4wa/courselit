import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appointmentContext } from "@/services/appointments";
import { getPolicyReview } from "@/services/policy-review";
import { appointmentReleaseHtml } from "@/lib/appointment-release-review";
import { appointmentReleaseText as t } from "@/config/strings";

export const dynamic = "force-dynamic";
export const metadata = {
    title: t.title,
    robots: { index: false, follow: false },
};
export default async function Page() {
    const c = await appointmentContext(await headers());
    if (!c.owner) notFound();
    const review = await getPolicyReview(c.domain);
    if (!review?.consultationHtml) notFound();
    return (
        <main className="mx-auto w-full max-w-6xl space-y-6 px-3 py-6 sm:px-6 sm:py-8">
            <header className="space-y-3 border-b pb-6">
                <Link
                    href="/dashboard/appointments"
                    className="text-sm underline underline-offset-4"
                >
                    {t.back}
                </Link>
                <h1 className="text-2xl font-semibold">{t.title}</h1>
                <p className="text-sm leading-7 text-muted-foreground">
                    {t.notice}
                </p>
            </header>
            <section
                data-admin-surface="panel"
                className="space-y-4 p-4 sm:p-6"
            >
                <p className="text-sm leading-7">{t.sample}</p>
                <ol className="space-y-2 text-sm">
                    {t.flow.map((step, i) => (
                        <li key={step} className="flex items-center gap-3">
                            <span className="font-semibold text-primary">
                                {i + 1}
                            </span>
                            {step}
                            {i < t.flow.length - 1 && (
                                <ChevronDown
                                    size={16}
                                    aria-hidden="true"
                                    className="ml-auto text-muted-foreground"
                                />
                            )}
                        </li>
                    ))}
                </ol>
                <div className="flex flex-wrap gap-3">
                    <Button asChild>
                        <Link href="/dashboard/appointments/default/preview?sample=1">
                            {t.booking}
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/policy-preview#consultations">
                            {t.privacy}
                        </Link>
                    </Button>
                </div>
            </section>
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">{t.lp}</h2>
                <iframe
                    title={t.lp}
                    srcDoc={appointmentReleaseHtml(review.consultationHtml)}
                    sandbox="allow-top-navigation-by-user-activation"
                    referrerPolicy="no-referrer"
                    className="h-[1000px] w-full rounded-lg border bg-white"
                />
            </section>
            <p className="text-xs leading-6 text-muted-foreground">
                {t.retention}
            </p>
        </main>
    );
}
