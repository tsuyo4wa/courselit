"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { funnelUiText as t } from "@/config/strings";
import FunnelFlow from "./funnel-flow";
import FunnelList, { recruitmentKind } from "./funnel-list";
import { ArrowLeft, Files, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { funnelRequest } from "@/lib/funnel-client";
import type {
    FunnelAdminData,
    FunnelAdminItem,
    FunnelEntry,
} from "@/lib/funnel-types";
interface FunnelsProps {
    initial: FunnelAdminData;
    selectedId?: string;
}
const selectClass =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
export default function Funnels({ initial, selectedId }: FunnelsProps) {
    const router = useRouter();
    const selected = selectedId || "";
    const [data, setData] = useState(initial);
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createName, setCreateName] = useState("");
    const [createCourse, setCreateCourse] = useState(
        initial.courses[0]?.courseId || "",
    );
    const [name, setName] = useState("");
    const [courseId, setCourseId] = useState("");
    const [entries, setEntries] = useState<FunnelEntry[]>([]);
    const [lpName, setLpName] = useState("");
    const [slug, setSlug] = useState("");
    const [source, setSource] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [adding, setAdding] = useState(false);
    const [panel, setPanel] = useState("lps");
    const f = data.funnels.find((x) => x.funnelId === selected);
    const course = data.courses.find((x) => x.courseId === courseId);
    const shared = f
        ? data.funnels.filter(
              (x) =>
                  x.funnelId !== f.funnelId &&
                  x.entries.some((e) =>
                      f.entries.some((p) => p.pageId === e.pageId),
                  ),
          )
        : [];
    const dirty =
        !!f &&
        (name !== f.name ||
            courseId !== f.courseId ||
            JSON.stringify(entries) !== JSON.stringify(f.entries));
    useEffect(() => {
        setName(f?.name || "");
        setCourseId(f?.courseId || "");
        setEntries(f?.entries || []);
        setConfirmed(false);
        setSource(f?.course?.sourcePageId || "");
        setLpName("");
        setSlug("");
    }, [f]);
    const formRef = useRef({ name, courseId, entries });
    formRef.current = { name, courseId, entries };
    async function run(action: string, extra: Record<string, unknown> = {}) {
        if (busy) return;
        setBusy(true);
        setMessage("");
        try {
            const next = await funnelRequest({
                action,
                ...(f && action !== "create"
                    ? { funnelId: f.funnelId, version: f.version }
                    : {}),
                ...extra,
            });
            setData(next);
            setConfirmed(false);
            setMessage(
                action === "publish"
                    ? "公開しました。公開URLから確認できます。"
                    : action === "pause"
                      ? t.pauseMessage
                      : "保存しました。公開中の内容は「公開設定」から切り替えるまで変わりません。",
            );
            if (action === "create" || action === "clone") {
                const created = next.funnels.find(
                    (x: FunnelAdminItem) =>
                        !data.funnels.some((y) => y.funnelId === x.funnelId),
                );
                if (created)
                    router.push(`/dashboard/funnels/${created.funnelId}`);
                setCreating(false);
                setCreateName("");
            }
            setLpName("");
            setSlug("");
        } catch (e) {
            setMessage((e as Error).message);
        } finally {
            setBusy(false);
        }
    }
    const changeEntry = (pageId: string, patch: Partial<FunnelEntry>) =>
        setEntries((es) =>
            es.map((e) => (e.pageId === pageId ? { ...e, ...patch } : e)),
        );
    return (
        <main className="mx-auto max-w-6xl space-y-6 px-3 py-6 text-foreground sm:px-6 sm:py-8">
            {f && (
                <Link
                    href="/dashboard/funnels"
                    onClick={(e) => {
                        if (dirty) {
                            e.preventDefault();
                            setMessage(t.unsaved);
                        }
                    }}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft size={16} aria-hidden />
                    {t.back}
                </Link>
            )}
            <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
                <div className="min-w-0 flex-1 basis-full sm:basis-0">
                    <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                        {f ? f.name : t.listTitle}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {f
                            ? `${recruitmentKind(f.course)} · ${f.course?.title || t.course}`
                            : t.listDescription}
                    </p>
                </div>
                {f ? (
                    <span className="mt-1 border-l-2 border-primary pl-3 text-sm">
                        {f.archived
                            ? t.archived
                            : f.active
                              ? t.live
                              : f.publication
                                ? t.paused
                                : "一般公開していません"}
                    </span>
                ) : (
                    <Button
                        disabled={busy}
                        onClick={() => setCreating((v) => !v)}
                    >
                        <Plus size={16} className="mr-2" />
                        {t.create}
                    </Button>
                )}
            </header>
            {(busy || message) && (
                <div
                    role="status"
                    aria-live="polite"
                    className="text-sm leading-6"
                >
                    {busy ? "保存しています…" : message}
                    {dirty && message === t.unsaved && (
                        <Button
                            type="button"
                            variant="outline"
                            className="ml-3"
                            onClick={() => router.push("/dashboard/funnels")}
                        >
                            {t.discard}
                        </Button>
                    )}
                </div>
            )}
            {!f && creating && (
                <form
                    className="grid gap-4 border-b pb-6 md:grid-cols-[1fr_1fr_auto]"
                    aria-label={t.createForm}
                    onSubmit={(e) => {
                        e.preventDefault();
                        void run("create", {
                            name: createName,
                            courseId: createCourse,
                        });
                    }}
                >
                    <label className="space-y-2 text-sm">
                        {t.name}
                        <Input
                            required
                            maxLength={120}
                            value={createName}
                            onChange={(e) => setCreateName(e.target.value)}
                            placeholder="例：ChatGPT無料講座の募集"
                        />
                    </label>
                    <label className="space-y-2 text-sm">
                        対象の講座
                        <select
                            required
                            className={selectClass}
                            value={createCourse}
                            onChange={(e) => setCreateCourse(e.target.value)}
                        >
                            <option value="">講座を選んでください</option>
                            {data.courses.map((c) => (
                                <option key={c.courseId} value={c.courseId}>
                                    {c.title}
                                    {c.published ? "" : "（未公開）"}
                                </option>
                            ))}
                        </select>
                    </label>
                    <Button
                        className="self-end"
                        disabled={busy || !createName.trim() || !createCourse}
                    >
                        下書きで作成
                    </Button>
                </form>
            )}

            {!f && !selectedId && <FunnelList data={data} busy={busy} />}
            {f && (
                <article aria-label={t.flowLabel} className="min-w-0">
                    <Tabs value={panel} onValueChange={setPanel}>
                        <TabsList
                            aria-label={t.menu}
                            className="mb-6 h-auto w-full justify-start gap-4 overflow-x-auto rounded-none border-b bg-transparent p-0 text-sm sm:gap-7"
                        >
                            <TabsTrigger
                                value="lps"
                                className="rounded-none border-b-2 border-transparent px-0 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                {t.lpTab}
                            </TabsTrigger>
                            <TabsTrigger
                                value="settings"
                                className="rounded-none border-b-2 border-transparent px-0 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                {t.settingsTab}
                            </TabsTrigger>
                            <TabsTrigger
                                value="publication"
                                className="rounded-none border-b-2 border-transparent px-0 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                            >
                                {t.publicationTab}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="lps" className="space-y-6">
                            <FunnelFlow
                                course={course}
                                lpCount={entries.length}
                                dirty={dirty}
                                onSettings={() => setPanel("settings")}
                            >
                                <fieldset
                                    disabled={busy || f.archived}
                                    className="space-y-6"
                                >
                                    <section
                                        aria-label="入口LP"
                                        className="space-y-4"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <h2 className="text-lg font-semibold">
                                                <span className="admin-step mr-3">
                                                    01
                                                </span>
                                                {t.lpStage}
                                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                                    {entries.length}件
                                                </span>
                                            </h2>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    disabled={
                                                        !dirty || !name.trim()
                                                    }
                                                    onClick={() =>
                                                        void run(
                                                            "save",
                                                            formRef.current,
                                                        )
                                                    }
                                                >
                                                    設定を保存
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    disabled={dirty}
                                                    onClick={() =>
                                                        setAdding((v) => !v)
                                                    }
                                                >
                                                    <Plus
                                                        size={16}
                                                        className="mr-2"
                                                    />
                                                    {adding
                                                        ? t.cancelAdd
                                                        : t.addLp}
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {t.lpDescription}
                                        </p>
                                        <ul className="grid gap-4 sm:grid-cols-2">
                                            {entries.map((e) => {
                                                const p = f.pages.find(
                                                    (p) =>
                                                        p.pageId === e.pageId,
                                                );
                                                const owners =
                                                    data.funnels.filter(
                                                        (x) =>
                                                            x.funnelId !==
                                                                f.funnelId &&
                                                            x.entries.some(
                                                                (p) =>
                                                                    p.pageId ===
                                                                    e.pageId,
                                                            ),
                                                    );
                                                return (
                                                    <li
                                                        key={e.pageId}
                                                        data-admin-surface="tinted"
                                                        className="min-w-0 space-y-4 rounded-lg border bg-card p-4"
                                                    >
                                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <h4 className="text-base font-semibold">
                                                                    {p?.name ||
                                                                        e.pageId}
                                                                </h4>
                                                                <p className="mt-1 break-all text-xs text-muted-foreground">
                                                                    {
                                                                        data.publicOrigin
                                                                    }
                                                                    /lp/
                                                                    {e.pageId}
                                                                </p>
                                                                {owners.length >
                                                                    0 && (
                                                                    <p className="mt-2 text-xs">
                                                                        共有中：
                                                                        {owners
                                                                            .map(
                                                                                (
                                                                                    x,
                                                                                ) =>
                                                                                    x.name,
                                                                            )
                                                                            .join(
                                                                                "／",
                                                                            )}
                                                                        。公開した最新の版を共通で表示します。
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                                                                <Link
                                                                    className={
                                                                        dirty
                                                                            ? "pointer-events-none opacity-50"
                                                                            : "underline underline-offset-4"
                                                                    }
                                                                    aria-disabled={
                                                                        dirty
                                                                    }
                                                                    onClick={(
                                                                        event,
                                                                    ) => {
                                                                        if (
                                                                            dirty
                                                                        )
                                                                            event.preventDefault();
                                                                    }}
                                                                    href={`/dashboard/page/${e.pageId}?redirectTo=${encodeURIComponent(`/dashboard/funnels/${f.funnelId}`)}`}
                                                                >
                                                                    本文を編集
                                                                </Link>
                                                                <Link
                                                                    className={
                                                                        dirty
                                                                            ? "pointer-events-none opacity-50"
                                                                            : "underline underline-offset-4"
                                                                    }
                                                                    aria-disabled={
                                                                        dirty
                                                                    }
                                                                    onClick={(
                                                                        event,
                                                                    ) => {
                                                                        if (
                                                                            dirty
                                                                        )
                                                                            event.preventDefault();
                                                                    }}
                                                                    href={`/dashboard/funnels/${f.funnelId}/preview/${e.pageId}`}
                                                                >
                                                                    公開前の確認
                                                                </Link>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                                                            <span>
                                                                {f.active &&
                                                                f.publication?.pages.some(
                                                                    (p) =>
                                                                        p.pageId ===
                                                                            e.pageId &&
                                                                        p.enabled,
                                                                )
                                                                    ? t.live
                                                                    : t.lpDraft}
                                                            </span>
                                                            <span>
                                                                {e.enabled
                                                                    ? t.inclusion
                                                                    : t.excluded}
                                                            </span>
                                                            <details className="w-full text-sm text-foreground open:w-full sm:ml-auto sm:w-auto">
                                                                <summary className="cursor-pointer select-none py-1">
                                                                    {
                                                                        t.lpSettings
                                                                    }
                                                                </summary>
                                                                <div className="space-y-4 py-4">
                                                                    {" "}
                                                                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                                                                        <label className="flex items-center gap-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={
                                                                                    e.enabled
                                                                                }
                                                                                onChange={(
                                                                                    x,
                                                                                ) =>
                                                                                    changeEntry(
                                                                                        e.pageId,
                                                                                        {
                                                                                            enabled:
                                                                                                x
                                                                                                    .target
                                                                                                    .checked,
                                                                                        },
                                                                                    )
                                                                                }
                                                                            />
                                                                            {
                                                                                t.include
                                                                            }
                                                                        </label>
                                                                        <label className="flex items-center gap-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={
                                                                                    e.booking
                                                                                }
                                                                                onChange={(
                                                                                    x,
                                                                                ) =>
                                                                                    changeEntry(
                                                                                        e.pageId,
                                                                                        {
                                                                                            booking:
                                                                                                x
                                                                                                    .target
                                                                                                    .checked,
                                                                                        },
                                                                                    )
                                                                                }
                                                                            />
                                                                            予約フォームを表示
                                                                        </label>
                                                                        <label className="flex items-center gap-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={
                                                                                    e.focused
                                                                                }
                                                                                onChange={(
                                                                                    x,
                                                                                ) =>
                                                                                    changeEntry(
                                                                                        e.pageId,
                                                                                        {
                                                                                            focused:
                                                                                                x
                                                                                                    .target
                                                                                                    .checked,
                                                                                        },
                                                                                    )
                                                                                }
                                                                            />
                                                                            LP用のシンプルなヘッダー
                                                                        </label>
                                                                    </div>
                                                                    <div className="flex gap-4 text-xs">
                                                                        <button
                                                                            type="button"
                                                                            disabled={
                                                                                dirty
                                                                            }
                                                                            onClick={() => {
                                                                                setAdding(
                                                                                    true,
                                                                                );
                                                                                setSource(
                                                                                    e.pageId,
                                                                                );
                                                                                setLpName(
                                                                                    (p?.name ||
                                                                                        "LP") +
                                                                                        " コピー",
                                                                                );
                                                                                setSlug(
                                                                                    "",
                                                                                );
                                                                                setMessage(
                                                                                    "下のLP追加欄にコピー元を設定しました。新しいURLを入力してください。",
                                                                                );
                                                                            }}
                                                                            className="underline underline-offset-4"
                                                                        >
                                                                            このLPを複製する
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setEntries(
                                                                                    (
                                                                                        es,
                                                                                    ) =>
                                                                                        es.filter(
                                                                                            (
                                                                                                x,
                                                                                            ) =>
                                                                                                x.pageId !==
                                                                                                e.pageId,
                                                                                        ),
                                                                                )
                                                                            }
                                                                            className="text-muted-foreground underline underline-offset-4"
                                                                        >
                                                                            このプロモーションから外す
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </details>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                        {!entries.length && (
                                            <p className="py-4 text-sm text-muted-foreground">
                                                下の欄からLPを追加してください。既存の募集ページをコピーして始められます。
                                            </p>
                                        )}
                                    </section>

                                    {adding && (
                                        <section
                                            aria-label="LPを追加"
                                            className="space-y-4 border-t pt-6"
                                        >
                                            <h3 className="flex items-center gap-2 font-semibold">
                                                <Files size={18} />
                                                LPを追加・複製
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                元のページを保ったまま、独立した下書きを作成します。
                                            </p>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <label className="space-y-2 text-sm">
                                                    LP名
                                                    <Input
                                                        maxLength={120}
                                                        value={lpName}
                                                        onChange={(e) =>
                                                            setLpName(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="例：メルマガからのご案内"
                                                    />
                                                </label>
                                                <label className="space-y-2 text-sm">
                                                    URLの末尾
                                                    <Input
                                                        value={slug}
                                                        onChange={(e) =>
                                                            setSlug(
                                                                e.target.value,
                                                            )
                                                        }
                                                        pattern="[a-z0-9]+(-[a-z0-9]+)*"
                                                        placeholder="例：ai-work-mail"
                                                    />
                                                    <span className="text-xs text-muted-foreground">
                                                        半角英小文字・数字・ハイフン
                                                    </span>
                                                </label>
                                            </div>
                                            <label className="block space-y-2 text-sm">
                                                コピー元
                                                <select
                                                    className={selectClass}
                                                    value={source}
                                                    onChange={(e) =>
                                                        setSource(
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        空のページから作る
                                                    </option>
                                                    {data.pages.map((p) => (
                                                        <option
                                                            key={p.pageId}
                                                            value={p.pageId}
                                                        >
                                                            {p.name}（{p.pageId}
                                                            ）
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={
                                                    dirty ||
                                                    !lpName.trim() ||
                                                    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
                                                        slug,
                                                    )
                                                }
                                                onClick={() =>
                                                    void run("add", {
                                                        name: lpName,
                                                        slug,
                                                        ...(source
                                                            ? {
                                                                  sourcePageId:
                                                                      source,
                                                              }
                                                            : {}),
                                                    })
                                                }
                                            >
                                                下書きLPを追加
                                            </Button>
                                            <details className="text-sm">
                                                <summary className="cursor-pointer py-2">
                                                    作成済みのLPを共有して使う
                                                </summary>
                                                <p className="mb-3 text-muted-foreground">
                                                    同じ講座のLPを共有できます。公開した最新の本文は共有先にも反映されます。
                                                </p>
                                                <select
                                                    aria-label="共有するLP"
                                                    className={selectClass}
                                                    value=""
                                                    disabled={dirty}
                                                    onChange={(e) => {
                                                        if (e.target.value)
                                                            void run("attach", {
                                                                pageId: e.target
                                                                    .value,
                                                            });
                                                    }}
                                                >
                                                    <option value="">
                                                        共有するLPを選んでください
                                                    </option>
                                                    {data.pages
                                                        .filter(
                                                            (p) =>
                                                                p.managed &&
                                                                !entries.some(
                                                                    (e) =>
                                                                        e.pageId ===
                                                                        p.pageId,
                                                                ),
                                                        )
                                                        .map((p) => (
                                                            <option
                                                                key={p.pageId}
                                                                value={p.pageId}
                                                            >
                                                                {p.name}
                                                            </option>
                                                        ))}
                                                </select>
                                            </details>
                                        </section>
                                    )}
                                </fieldset>
                            </FunnelFlow>
                        </TabsContent>
                        <TabsContent value="settings" className="space-y-6">
                            <p className="text-sm text-muted-foreground">
                                {t.settingsDescription}
                            </p>
                            <fieldset
                                disabled={busy || f.archived}
                                className="space-y-6"
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <label className="space-y-2 text-sm">
                                        {t.name}
                                        <Input
                                            maxLength={120}
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm">
                                        {t.course}
                                        <select
                                            className={selectClass}
                                            value={courseId}
                                            onChange={(e) =>
                                                setCourseId(e.target.value)
                                            }
                                        >
                                            {data.courses.map((c) => (
                                                <option
                                                    key={c.courseId}
                                                    value={c.courseId}
                                                >
                                                    {c.title}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <section
                                    className="space-y-3"
                                    aria-label="共通サンクスの設定"
                                >
                                    <h3 className="font-semibold">
                                        申込後の共通URL
                                    </h3>
                                    <p className="break-all text-sm leading-6">
                                        {course?.thankYouUrl ||
                                            "未設定：通常の受講案内へ進みます。"}
                                    </p>
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        講座の「申込・購入後のページ」で変更できます。この講座につながる全LPに共通で適用されます。
                                    </p>
                                    {course && (
                                        <Link
                                            className="inline-block text-sm underline underline-offset-4"
                                            href={`/dashboard/product/${course.courseId}/manage`}
                                        >
                                            講座のURL設定を開く →
                                        </Link>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        利用中の料金プラン：
                                        {course?.plans
                                            .map((p) => p.name)
                                            .join("／") ||
                                            "有効な料金プランがありません"}
                                    </p>
                                </section>
                                <Button
                                    type="button"
                                    disabled={!dirty || !name.trim()}
                                    onClick={() =>
                                        void run("save", formRef.current)
                                    }
                                >
                                    設定を保存
                                </Button>
                            </fieldset>
                            <div className="flex flex-wrap gap-5 border-t pt-5 text-sm">
                                <button
                                    disabled={busy || dirty}
                                    className="underline underline-offset-4"
                                    onClick={() => void run("clone")}
                                >
                                    {t.clone}
                                </button>
                                {f.archived && (
                                    <button
                                        disabled={busy}
                                        className="underline underline-offset-4"
                                        onClick={() => void run("restore")}
                                    >
                                        下書きとして戻す
                                    </button>
                                )}
                                {!f.archived && (
                                    <button
                                        disabled={busy || dirty || f.active}
                                        className="text-muted-foreground underline underline-offset-4"
                                        onClick={() => void run("archive")}
                                    >
                                        {t.archive}
                                    </button>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="publication" className="space-y-6">
                            <section
                                aria-label={t.publicationTab}
                                key={f.funnelId + f.version}
                            >
                                <h2 className="text-lg font-semibold">
                                    {t.publicationTab}
                                </h2>
                                <div className="min-w-0 space-y-4 rounded-lg border bg-card p-4">
                                    <p className="text-sm leading-6">
                                        公開前の確認で各LPの本文・申込先・共通URLをご確認ください。公開するLPをまとめて同じ版として切り替えます。
                                    </p>
                                    {shared.length > 0 && (
                                        <p className="text-sm">
                                            共有LPがあります：
                                            {shared
                                                .map((x) => x.name)
                                                .join("／")}
                                            。同じLPの最新公開版は共有先にも表示されます。
                                        </p>
                                    )}
                                    <label className="flex items-start gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={confirmed}
                                            onChange={(e) =>
                                                setConfirmed(e.target.checked)
                                            }
                                        />
                                        公開する本文とリンクを確認しました
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            disabled={
                                                busy ||
                                                dirty ||
                                                f.archived ||
                                                !confirmed ||
                                                !entries.some((e) => e.enabled)
                                            }
                                            onClick={() =>
                                                void run("publish", {
                                                    confirmed: true,
                                                })
                                            }
                                        >
                                            確認した内容を公開する
                                        </Button>
                                        <Button
                                            variant="outline"
                                            disabled={busy || !f.active}
                                            onClick={() => void run("pause")}
                                        >
                                            {t.pause}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            disabled={
                                                busy ||
                                                dirty ||
                                                f.archived ||
                                                !confirmed ||
                                                !f.previous?.length
                                            }
                                            onClick={() =>
                                                void run("rollback", {
                                                    confirmed: true,
                                                })
                                            }
                                        >
                                            ひとつ前の公開版へ戻す
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        停止しても講座・受講者・予約は消えません。別の公開ファネルと共有中のLPは、そちらから引き続き表示されます。
                                    </p>
                                    {f.active &&
                                        f.publication?.pages
                                            .filter((p) => p.enabled)
                                            .map((p) => (
                                                <a
                                                    key={p.pageId}
                                                    className="block break-all text-sm underline"
                                                    href={
                                                        data.publicOrigin +
                                                        "/lp/" +
                                                        p.pageId
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    公開URL：{data.publicOrigin}
                                                    /lp/
                                                    {p.pageId}
                                                </a>
                                            ))}
                                </div>
                            </section>
                        </TabsContent>
                    </Tabs>
                </article>
            )}
        </main>
    );
}
