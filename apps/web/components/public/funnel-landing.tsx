"use client";
import Link from "next/link";
import { useContext } from "react";
import ClientSidePage from "@/app/(with-contexts)/(with-layout)/p/[id]/client-side-page";
import { ThemeContext } from "@/components/contexts";
import { generateThemeStyles } from "@/lib/theme-styles";
import AppointmentBooker from "./appointment-booker";
import { Button } from "@/components/ui/button";
export default function FunnelLanding({
    view,
    siteInfo,
}: {
    view: any;
    siteInfo: any;
}) {
    const { theme } = useContext(ThemeContext);
    const styles = theme?.theme?.colors
        ? generateThemeStyles(theme).replaceAll(
              ".courselit-theme",
              ".funnel-landing-shell",
          )
        : "";
    const checkout =
        "/checkout?" +
        new URLSearchParams({ type: "course", id: view.courseId });
    return (
        <div className="courselit-theme funnel-landing-shell min-h-dvh bg-background text-foreground">
            <style>{styles}</style>
            <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 border-b px-3 py-5 sm:px-6">
                <Link href="/" className="font-semibold tracking-tight">
                    {view.siteTitle}
                </Link>
                {!view.page.focused && (
                    <nav
                        aria-label="サイトのメニュー"
                        className="flex gap-4 text-sm"
                    >
                        <Link href="/products">講座を探す</Link>
                        <Link href="/dashboard/my-content/products">
                            受講中の講座
                        </Link>
                    </nav>
                )}
            </header>
            {view.preview && (
                <aside
                    role="status"
                    className="mx-auto my-4 max-w-5xl border-l-2 border-primary px-3 py-3 text-sm sm:px-5"
                >
                    公開前の確認画面です。下部の共通申込ボタンは無効、予約は画面見本です。公開中のページは変わりません。
                </aside>
            )}
            <main>
                <ClientSidePage
                    page={view.page}
                    siteinfo={siteInfo.settings}
                    theme={siteInfo.theme}
                />
                <section
                    aria-label="講座のお申し込み"
                    className="mx-auto max-w-5xl border-t px-3 py-8 sm:px-6 sm:py-12"
                >
                    <p className="mb-4 text-lg font-semibold">
                        {view.courseTitle}
                    </p>
                    {view.preview ? (
                        <Button disabled>この講座に申し込む（確認用）</Button>
                    ) : (
                        <Button asChild>
                            <Link href={checkout}>この講座に申し込む</Link>
                        </Button>
                    )}
                    <p className="mt-3 text-sm text-muted-foreground">
                        講座のお申し込み後に、共通のご案内ページへ進みます。
                    </p>
                </section>
                {view.page.booking && (
                    <section
                        aria-label="個別相談の予約"
                        className="mx-auto max-w-5xl border-t px-0 py-6"
                    >
                        {view.preview || view.booking?.enabled ? (
                            <AppointmentBooker
                                preview={false}
                                sample={view.preview}
                                title={view.booking?.title || "個別相談"}
                                description={
                                    view.booking?.description ||
                                    "ご都合のよい日時をお選びください。"
                                }
                                loggedIn={view.loggedIn}
                                returnTo={"/lp/" + view.page.pageId}
                                durationMinutes={view.booking?.durationMinutes}
                                horizonDays={view.booking?.horizonDays}
                            />
                        ) : (
                            <p className="px-3 py-5">
                                個別相談は現在、予約受付を停止しています。
                            </p>
                        )}
                    </section>
                )}
            </main>
            <footer className="mx-auto flex max-w-6xl flex-wrap gap-x-6 gap-y-3 border-t px-3 py-6 text-sm text-muted-foreground sm:px-6">
                <Link href="/">トップページ</Link>
                <Link href="/p/terms">利用規約</Link>
                <Link href="/p/privacy">プライバシーポリシー</Link>
                <Link href="/contact">お問い合わせ</Link>
            </footer>
        </div>
    );
}
