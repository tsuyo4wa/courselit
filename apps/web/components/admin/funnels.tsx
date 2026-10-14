"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Files, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { funnelRequest } from "@/lib/funnel-client";
import type {
    FunnelAdminItem,
    FunnelCourse,
    FunnelEntry,
} from "@/lib/funnel-types";
type Data = {
    funnels: FunnelAdminItem[];
    courses: FunnelCourse[];
    pages: { pageId: string; name: string; managed: boolean }[];
    publicOrigin: string;
};
const selectClass =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
export default function Funnels({ initial }: { initial: Data }) {
    const [data, setData] = useState(initial);
    const [selected, setSelected] = useState(
        initial.funnels.find((f) => !f.archived)?.funnelId || "",
    );
    const [search, setSearch] = useState("");
    const [showArchived, setShowArchived] = useState(false);
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const [creating, setCreating] = useState(!initial.funnels.length);
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
    const list = useMemo(
        () =>
            data.funnels.filter(
                (x) =>
                    (showArchived || !x.archived) &&
                    (x.name + " " + (x.course?.title || ""))
                        .toLowerCase()
                        .includes(search.toLowerCase()),
            ),
        [data, search, showArchived],
    );
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
                      ? "このファネルの公開を停止しました。"
                      : "保存しました。公開中の内容は「公開設定」から切り替えるまで変わりません。",
            );
            if (action === "create" || action === "clone") {
                const created = next.funnels.find(
                    (x: FunnelAdminItem) =>
                        !data.funnels.some((y) => y.funnelId === x.funnelId),
                );
                if (created) setSelected(created.funnelId);
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
    function pick(id: string) {
        if (dirty) {
            setMessage(
                "編集中の設定を保存してから、別のファネルを開いてください。",
            );
            return;
        }
        setSelected(id);
        setCreating(false);
        setMessage("");
    }
    const changeEntry = (pageId: string, patch: Partial<FunnelEntry>) =>
        setEntries((es) =>
            es.map((e) => (e.pageId === pageId ? { ...e, ...patch } : e)),
        );
    return (
        <main className="mx-auto max-w-7xl space-y-6 px-3 py-6 text-foreground sm:px-6 sm:py-9">
            <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
                <div>
                    <p className="mb-2 text-sm text-muted-foreground">
                        ページと申込導線の管理
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        LP・ファネル
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        複数のLPを、ひとつの講座へ。申込後は講座に設定した共通URLへ進みます。
                    </p>
                </div>
                <Button
                    disabled={busy || dirty}
                    onClick={() => setCreating((v) => !v)}
                >
                    <Plus size={16} className="mr-2" />
                    ファネルを作る
                </Button>
            </header>
            <p role="status" aria-live="polite" className="min-h-5 text-sm">
                {busy ? "保存しています…" : message}
            </p>
            {creating && (
                <form
                    className="grid gap-4 border-b pb-6 md:grid-cols-[1fr_1fr_auto]"
                    aria-label="ファネルの作成"
                    onSubmit={(e) => {
                        e.preventDefault();
                        void run("create", {
                            name: createName,
                            courseId: createCourse,
                        });
                    }}
                >
                    <label className="space-y-2 text-sm">
                        企画名
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
            <div className="grid gap-7 xl:grid-cols-[15rem_minmax(0,1fr)]">
                <aside aria-label="ファネル一覧" className="space-y-4">
                    <Input
                        aria-label="ファネルを検索"
                        placeholder="企画名・講座で検索"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={showArchived}
                            onChange={(e) => setShowArchived(e.target.checked)}
                        />
                        アーカイブも表示
                    </label>
                    <ul className="divide-y">
                        {list.map((x) => (
                            <li key={x.funnelId}>
                                <button
                                    disabled={busy}
                                    aria-pressed={selected === x.funnelId}
                                    onClick={() => pick(x.funnelId)}
                                    className="w-full rounded-sm px-3 py-4 text-left transition-colors hover:bg-muted aria-pressed:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <span className="block font-medium">
                                        {x.name}
                                    </span>
                                    <span className="mt-2 flex justify-between gap-2 text-xs text-muted-foreground">
                                        <span>
                                            {x.archived
                                                ? "アーカイブ"
                                                : x.active
                                                  ? "公開中"
                                                  : x.publication
                                                    ? "公開停止中"
                                                    : "下書き"}
                                        </span>
                                        <span>{x.entries.length} LP</span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                    {!list.length && (
                        <p className="py-5 text-sm text-muted-foreground">
                            ファネルはまだありません。「ファネルを作る」から企画と講座を選べます。
                        </p>
                    )}
                </aside>
                {f && (
                    <article
                        aria-label="ファネルの編集"
                        className="min-w-0 space-y-7"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-xl font-semibold">{f.name}</h2>
                            <span className="border-l-2 border-primary pl-3 text-sm">
                                {f.archived
                                    ? "アーカイブ"
                                    : f.active
                                      ? "公開中"
                                      : "一般公開していません"}
                            </span>
                        </div>
                        <fieldset
                            disabled={busy || f.archived}
                            className="space-y-7"
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="space-y-2 text-sm">
                                    企画名
                                    <Input
                                        maxLength={120}
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                    />
                                </label>
                                <label className="space-y-2 text-sm">
                                    共通の講座
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
                                aria-label="申込の流れ"
                                className="flex flex-col gap-3 border-y py-5 text-sm sm:flex-row sm:items-center"
                            >
                                <span className="font-semibold">
                                    入口LP {entries.length}件
                                </span>
                                <ArrowRight
                                    size={16}
                                    className="rotate-90 text-muted-foreground sm:rotate-0"
                                    aria-hidden
                                />
                                <span className="min-w-0 flex-1 break-words">
                                    {course?.title || "講座を選んでください"}
                                </span>
                                <ArrowRight
                                    size={16}
                                    className="rotate-90 text-muted-foreground sm:rotate-0"
                                    aria-hidden
                                />
                                <span className="font-semibold">
                                    共通サンクス
                                </span>
                            </section>
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
                            <section aria-label="入口LP" className="space-y-4">
                                <h3 className="font-semibold">入口LP</h3>
                                <p className="text-sm text-muted-foreground">
                                    下書きの設定です。「公開するLP」の変更は、確認後の公開操作で反映されます。
                                </p>
                                <ul className="divide-y border-y">
                                    {entries.map((e) => {
                                        const p = f.pages.find(
                                            (p) => p.pageId === e.pageId,
                                        );
                                        const owners = data.funnels.filter(
                                            (x) =>
                                                x.funnelId !== f.funnelId &&
                                                x.entries.some(
                                                    (p) =>
                                                        p.pageId === e.pageId,
                                                ),
                                        );
                                        return (
                                            <li
                                                key={e.pageId}
                                                className="space-y-4 py-5"
                                            >
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h4 className="font-medium">
                                                            {p?.name ||
                                                                e.pageId}
                                                        </h4>
                                                        <p className="mt-1 break-all text-xs text-muted-foreground">
                                                            {data.publicOrigin}
                                                            /lp/{e.pageId}
                                                        </p>
                                                        {owners.length > 0 && (
                                                            <p className="mt-2 text-xs">
                                                                共有中：
                                                                {owners
                                                                    .map(
                                                                        (x) =>
                                                                            x.name,
                                                                    )
                                                                    .join("／")}
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
                                                            href={`/dashboard/page/${e.pageId}?redirectTo=/dashboard/funnels`}
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
                                                            href={`/dashboard/funnels/${f.funnelId}/preview/${e.pageId}`}
                                                        >
                                                            公開前の確認
                                                        </Link>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={e.enabled}
                                                            onChange={(x) =>
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
                                                        公開するLP
                                                    </label>
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={e.booking}
                                                            onChange={(x) =>
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
                                                            checked={e.focused}
                                                            onChange={(x) =>
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
                                                        disabled={dirty}
                                                        onClick={() => {
                                                            setSource(e.pageId);
                                                            setLpName(
                                                                (p?.name ||
                                                                    "LP") +
                                                                    " コピー",
                                                            );
                                                            setSlug("");
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
                                                            setEntries((es) =>
                                                                es.filter(
                                                                    (x) =>
                                                                        x.pageId !==
                                                                        e.pageId,
                                                                ),
                                                            )
                                                        }
                                                        className="text-muted-foreground underline underline-offset-4"
                                                    >
                                                        この企画から外す
                                                    </button>
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
                            <Button
                                type="button"
                                disabled={!dirty || !name.trim()}
                                onClick={() =>
                                    void run("save", {
                                        name,
                                        courseId,
                                        entries,
                                    })
                                }
                            >
                                設定を保存
                            </Button>
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
                                                setLpName(e.target.value)
                                            }
                                            placeholder="例：メルマガからのご案内"
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm">
                                        URLの末尾
                                        <Input
                                            value={slug}
                                            onChange={(e) =>
                                                setSlug(e.target.value)
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
                                            setSource(e.target.value)
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
                                                {p.name}（{p.pageId}）
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
                                        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
                                    }
                                    onClick={() =>
                                        void run("add", {
                                            name: lpName,
                                            slug,
                                            ...(source
                                                ? { sourcePageId: source }
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
                                                    pageId: e.target.value,
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
                        </fieldset>
                        <details
                            className="border-t pt-5"
                            key={f.funnelId + f.version}
                        >
                            <summary className="cursor-pointer font-medium">
                                公開設定・停止
                            </summary>
                            <div className="space-y-4 py-5">
                                <p className="text-sm leading-6">
                                    公開前の確認で各LPの本文・申込先・共通URLをご確認ください。公開するLPをまとめて同じ版として切り替えます。
                                </p>
                                {shared.length > 0 && (
                                    <p className="text-sm">
                                        共有LPがあります：
                                        {shared.map((x) => x.name).join("／")}
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
                                        このファネルを公開停止
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
                                                公開URL：{data.publicOrigin}/lp/
                                                {p.pageId}
                                            </a>
                                        ))}
                            </div>
                        </details>
                        <div className="flex flex-wrap gap-5 border-t pt-5 text-sm">
                            <button
                                disabled={busy || dirty}
                                className="underline underline-offset-4"
                                onClick={() => void run("clone")}
                            >
                                ファネルを複製する
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
                                    停止済みの企画をアーカイブ
                                </button>
                            )}
                        </div>
                    </article>
                )}
            </div>
        </main>
    );
}
