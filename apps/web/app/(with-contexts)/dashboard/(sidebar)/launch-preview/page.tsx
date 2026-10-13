import type { LaunchReviewPageProps } from "@courselit/common-models";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { contactContext } from "@/services/contact-form";
import { getLaunchReview } from "@/services/launch-review";
import {
    LAUNCH_PREVIEW_TITLE,
    LAUNCH_PREVIEW_NOTICE,
    LAUNCH_PREVIEW_HOME,
    LAUNCH_PREVIEW_RECRUITMENT,
    LAUNCH_PREVIEW_SIGNUP,
    LAUNCH_PREVIEW_POLICY,
    LAUNCH_PREVIEW_CONTACT,
} from "@/config/strings";
export const dynamic = "force-dynamic";
export const metadata = {
    title: LAUNCH_PREVIEW_TITLE,
    robots: { index: false, follow: false },
};
export default async function Page({ searchParams }: LaunchReviewPageProps) {
    const context = await contactContext(await headers());
    if (!context?.owner) notFound();
    const review = await getLaunchReview(context.domain);
    if (!review) notFound();
    const { view } = await searchParams;
    const selected =
        view === "recruitment" || view === "signup" ? view : "home";
    return (
        <main className="mx-auto w-full max-w-6xl space-y-4 p-4 sm:p-6">
            <h1 className="text-xl font-semibold">{LAUNCH_PREVIEW_TITLE}</h1>
            <p className="text-sm text-muted-foreground">
                {LAUNCH_PREVIEW_NOTICE}
            </p>
            <nav className="flex flex-wrap gap-3 text-sm underline underline-offset-4">
                <Link href="/dashboard/launch-preview">
                    {LAUNCH_PREVIEW_HOME}
                </Link>
                <Link href="/dashboard/launch-preview?view=recruitment">
                    {LAUNCH_PREVIEW_RECRUITMENT}
                </Link>
                <Link href="/dashboard/launch-preview?view=signup">
                    {LAUNCH_PREVIEW_SIGNUP}
                </Link>
                <Link href="/dashboard/policy-preview">
                    {LAUNCH_PREVIEW_POLICY}
                </Link>
                <Link href="/dashboard/contact-preview">
                    {LAUNCH_PREVIEW_CONTACT}
                </Link>
            </nav>
            <iframe
                title={LAUNCH_PREVIEW_TITLE}
                srcDoc={review.pages[selected]}
                sandbox="allow-top-navigation-by-user-activation"
                referrerPolicy="no-referrer"
                className="h-[78vh] min-h-[600px] w-full rounded-lg border bg-white"
            />
        </main>
    );
}
