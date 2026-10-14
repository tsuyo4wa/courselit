import { randomUUID } from "crypto";
import { z } from "zod";
import { Constants, WidgetInstance } from "@courselit/common-models";
import { extractMediaIDs } from "@courselit/utils";
import Funnel from "@models/Funnel";
import Page from "@models/Page";
import Course from "@models/Course";
import Plan from "@models/PaymentPlan";
import type { FunnelContext } from "./funnel-context";
import { FunnelError, requireFunnelManager } from "@/lib/funnel-access";
import type {
    FunnelRecord,
    FunnelEntry,
    FunnelPublication,
    FunnelPageSnapshot,
    FunnelCourse,
} from "@/lib/funnel-types";
const id = z
    .string()
    .min(1)
    .max(200)
    .regex(/^[A-Za-z0-9_-]+$/);
const entry = z
    .object({
        pageId: id,
        enabled: z.boolean(),
        booking: z.boolean(),
        focused: z.boolean(),
    })
    .strict();
export const funnelInput = z
    .object({
        action: z.enum([
            "create",
            "save",
            "add",
            "attach",
            "clonePage",
            "clone",
            "publish",
            "pause",
            "rollback",
            "archive",
            "restore",
        ]),
        funnelId: id.optional(),
        version: z.number().int().positive().optional(),
        name: z.string().trim().min(1).max(120).optional(),
        courseId: id.optional(),
        entries: z.array(entry).max(30).optional(),
        sourcePageId: id.optional(),
        pageId: id.optional(),
        slug: z
            .string()
            .min(1)
            .max(100)
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            .optional(),
        confirmed: z.boolean().optional(),
    })
    .strict();
export type FunnelInput = z.infer<typeof funnelInput>;
function clone<T>(v: T): T {
    return JSON.parse(JSON.stringify(v));
}
function plain(f: any): FunnelRecord {
    return clone(f.toObject ? f.toObject() : f);
}
export async function funnelCourses(c: FunnelContext): Promise<FunnelCourse[]> {
    requireFunnelManager(c);
    const courses = await Course.find({
        domain: c.domain._id,
        type: {
            $in: [Constants.CourseType.COURSE, Constants.CourseType.DOWNLOAD],
        },
        deleted: { $ne: true },
    })
        .select("courseId title slug published thankYouUrl")
        .sort({ updatedAt: -1 })
        .limit(200)
        .lean();
    const ids = courses.map((x) => x.courseId);
    const plans = await Plan.find({
        domain: c.domain._id,
        entityId: { $in: ids },
        entityType: "course",
        archived: false,
        internal: false,
    })
        .select("entityId planId name type")
        .lean();
    const pages = await Page.find({
        domain: c.domain._id,
        type: "product",
        entityId: { $in: ids },
        deleted: { $ne: true },
    })
        .select("entityId pageId")
        .lean();
    return courses.map((x) => ({
        courseId: x.courseId,
        title: x.title,
        slug: x.slug,
        published: x.published,
        thankYouUrl: x.thankYouUrl || "",
        sourcePageId: pages.find((p) => p.entityId === x.courseId)?.pageId,
        plans: plans
            .filter((p) => p.entityId === x.courseId)
            .map((p) => ({ name: p.name, type: p.type, planId: p.planId })),
    }));
}
async function target(c: FunnelContext, courseId: string, publishing = false) {
    const course = await Course.findOne({
        domain: c.domain._id,
        courseId,
        deleted: { $ne: true },
        type: {
            $in: [Constants.CourseType.COURSE, Constants.CourseType.DOWNLOAD],
        },
    }).lean();
    if (!course) throw new FunnelError("対象の講座が見つかりません。", 404);
    if (publishing && !course.published)
        throw new FunnelError("対象講座がまだ公開されていません。");
    if (
        publishing &&
        !(await Plan.exists({
            domain: c.domain._id,
            entityId: courseId,
            entityType: "course",
            archived: false,
            internal: false,
        }))
    )
        throw new FunnelError("対象講座の有効な料金プランを確認してください。");
    return course;
}
export async function funnelAdminData(c: FunnelContext) {
    requireFunnelManager(c);
    const [records, courses, pages] = await Promise.all([
        Funnel.find({ domainId: c.domainId })
            .select(
                "-publication.pages.layout -previous.pages.layout -publication.pages.socialImage -previous.pages.socialImage",
            )
            .sort({ updatedAt: -1 })
            .limit(200)
            .lean(),
        funnelCourses(c),
        Page.find({ domain: c.domain._id, deleted: { $ne: true } })
            .select("pageId name funnelManaged type")
            .sort({ name: 1 })
            .limit(1000)
            .lean(),
    ]);
    return {
        funnels: records.map((f) => ({
            ...plain(f),
            course: courses.find((x) => x.courseId === f.courseId),
            pages: f.entries.map((e) => ({
                pageId: e.pageId,
                name:
                    pages.find((p) => p.pageId === e.pageId)?.name || e.pageId,
            })),
        })),
        courses,
        pages: pages.map((p) => ({
            pageId: p.pageId,
            name: p.name,
            managed: !!p.funnelManaged,
        })),
        publicOrigin:
            "https://" + (c.domain.customDomain || process.env.DOMAIN),
    };
}
async function read(c: FunnelContext, input: FunnelInput) {
    const f = await Funnel.findOne({
        domainId: c.domainId,
        funnelId: input.funnelId,
    }).lean();
    if (!f) throw new FunnelError("ファネルが見つかりません。", 404);
    if (input.version !== f.version)
        throw new FunnelError(
            "別の画面で更新されました。再読み込みしてから操作してください。",
            409,
        );
    return plain(f);
}
async function save(
    c: FunnelContext,
    f: FunnelRecord,
    patch: Record<string, unknown>,
) {
    const result = await Funnel.updateOne(
        { domainId: c.domainId, funnelId: f.funnelId, version: f.version },
        { $set: patch, $inc: { version: 1 } },
    );
    if (!result.modifiedCount)
        throw new FunnelError(
            "別の画面で更新されました。再読み込みしてください。",
            409,
        );
}
async function copyPage(
    c: FunnelContext,
    courseId: string,
    sourceId: string | undefined,
    slug: string,
    name: string,
) {
    if (await Page.exists({ domain: c.domain._id, pageId: slug }))
        throw new FunnelError(
            "このURLは既に使われています。別の名前にしてください。",
            409,
        );
    const source: any = sourceId
        ? await Page.findOne({
              domain: c.domain._id,
              pageId: sourceId,
              deleted: { $ne: true },
          }).lean()
        : null;
    if (sourceId && !source)
        throw new FunnelError("コピー元のページが見つかりません。", 404);
    if (source?.type === "product" && source.entityId !== courseId)
        throw new FunnelError("対象講座とコピー元の講座が異なります。");
    // Copies share media references; managed media is retained by protectFunnelMedia.
    const layout = clone(
        (source?.draftLayout?.length ? source.draftLayout : source?.layout) || [
            { name: "header", shared: true, deleteable: false },
            { name: "footer", shared: true, deleteable: false },
        ],
    ).map((w: any) => ({ ...w, widgetId: randomUUID() }));
    await Page.create({
        domain: c.domain._id,
        pageId: slug,
        name,
        type: "site",
        entityId: c.domain.name,
        creatorId: c.user!.userId,
        deleteable: true,
        funnelManaged: true,
        layout: [],
        draftLayout: layout,
        draftTitle: source?.draftTitle || source?.title || name,
        draftDescription: source?.draftDescription || source?.description || "",
        draftSocialImage: source?.draftSocialImage || source?.socialImage,
        draftRobotsAllowed: false,
        robotsAllowed: false,
    });
    return { pageId: slug, enabled: true, booking: false, focused: true };
}
async function validateEntries(
    c: FunnelContext,
    courseId: string,
    entries: FunnelEntry[],
    funnelId?: string,
) {
    if (new Set(entries.map((e) => e.pageId)).size !== entries.length)
        throw new FunnelError("同じLPが重複しています。");
    for (const e of entries) {
        if (
            !(await Page.exists({
                domain: c.domain._id,
                pageId: e.pageId,
                funnelManaged: true,
                deleted: { $ne: true },
            }))
        )
            throw new FunnelError(
                "管理対象のLPが見つかりません。既存ページはコピーして追加してください。",
            );
        if (
            await Funnel.exists({
                domainId: c.domainId,
                courseId: { $ne: courseId },
                ...(funnelId ? { funnelId: { $ne: funnelId } } : {}),
                "entries.pageId": e.pageId,
            })
        )
            throw new FunnelError(
                "共有LPは同じ講座のファネルで使ってください。別講座にはLPを複製してください。",
            );
    }
}
export function checkFunnelLinks(layout: WidgetInstance[], courseId: string) {
    // Existing custom HTML may contain a hard-coded checkout link. Never silently sell another course.
    const text = JSON.stringify(layout);
    for (const match of Array.from(
        text.matchAll(/(?:https?:[^\s"'<>\\]*)?\/checkout\?[^\s"'<>\\]+/g),
    )) {
        const u = new URL(
            match[0].replaceAll("&amp;", "&"),
            "https://school.invalid",
        );
        if (
            u.searchParams.get("type") !== "course" ||
            u.searchParams.get("id") !== courseId
        )
            throw new FunnelError(
                "LP内に別商品の申込リンクがあります。ページ編集で対象講座のリンクに直してください。",
            );
    }
}
async function snapshot(
    c: FunnelContext,
    f: FunnelRecord,
): Promise<FunnelPublication> {
    await target(c, f.courseId, true);
    await validateEntries(c, f.courseId, f.entries, f.funnelId);
    if (!f.entries.some((e) => e.enabled))
        throw new FunnelError("公開するLPを1つ以上選んでください。");
    const pages: FunnelPageSnapshot[] = [];
    for (const e of f.entries) {
        const p: any = await Page.findOne({
            domain: c.domain._id,
            pageId: e.pageId,
            funnelManaged: true,
        }).lean();
        if (!p) throw new FunnelError("LPが見つかりません。", 404);
        const layout = clone(p.draftLayout?.length ? p.draftLayout : p.layout);
        if (
            e.enabled &&
            !layout.some((w: any) => !["header", "footer"].includes(w.name))
        )
            throw new FunnelError(
                "本文が空のLPがあります。ページを編集してください。",
            );
        checkFunnelLinks(layout, f.courseId);
        pages.push({
            ...e,
            name: p.name,
            title: p.draftTitle || p.title || p.name,
            description: p.draftDescription ?? p.description ?? "",
            robotsAllowed: p.draftRobotsAllowed ?? p.robotsAllowed ?? false,
            socialImage:
                p.draftSocialImage === null
                    ? undefined
                    : p.draftSocialImage || p.socialImage,
            layout,
        });
    }
    if (Buffer.byteLength(JSON.stringify(pages), "utf8") > 2_000_000)
        throw new FunnelError(
            "LPの合計容量が大きすぎます。画像を圧縮するか、企画を分けてください。",
        );
    return {
        revision: randomUUID(),
        at: new Date().toISOString(),
        name: f.name,
        courseId: f.courseId,
        pages,
    };
}
export async function mutateFunnel(c: FunnelContext, raw: unknown) {
    requireFunnelManager(c);
    const input = funnelInput.parse(raw);
    if (input.action === "create") {
        if (!input.name || !input.courseId)
            throw new FunnelError("企画名と講座を選んでください。");
        await target(c, input.courseId);
        await Funnel.create({
            domainId: c.domainId,
            funnelId: randomUUID(),
            name: input.name,
            courseId: input.courseId,
        });
        return;
    }
    const f = await read(c, input);
    if (input.action === "save") {
        const courseId = input.courseId || f.courseId;
        await target(c, courseId);
        await validateEntries(
            c,
            courseId,
            input.entries || f.entries,
            f.funnelId,
        );
        await save(c, f, {
            name: input.name || f.name,
            courseId,
            entries: input.entries || f.entries,
        });
    } else if (input.action === "add" || input.action === "clonePage") {
        if (!input.slug || !input.name || f.entries.length >= 30)
            throw new FunnelError(
                "LP名とURLを入力してください（1企画30LPまで）。",
            );
        if (
            input.action === "clonePage" &&
            !f.entries.some((e) => e.pageId === input.sourcePageId)
        )
            throw new FunnelError("コピー元のLPを確認してください。");
        const e = await copyPage(
            c,
            f.courseId,
            input.sourcePageId,
            input.slug,
            input.name,
        );
        await save(c, f, { entries: [...f.entries, e] });
    } else if (input.action === "attach") {
        if (!input.pageId || f.entries.length >= 30)
            throw new FunnelError("共有するLPを選んでください。");
        const entries = [
            ...f.entries,
            {
                pageId: input.pageId,
                enabled: true,
                booking: false,
                focused: true,
            },
        ];
        await validateEntries(c, f.courseId, entries);
        await save(c, f, { entries });
    } else if (input.action === "clone") {
        const funnelId = randomUUID();
        await Funnel.create({
            domainId: c.domainId,
            funnelId,
            name: (input.name || f.name + " コピー").slice(0, 120),
            courseId: f.courseId,
        });
        const entries: FunnelEntry[] = [];
        for (const e of f.entries) {
            const copied = await copyPage(
                c,
                f.courseId,
                e.pageId,
                "lp-" + randomUUID(),
                "コピー " + e.pageId,
            );
            entries.push({
                ...copied,
                booking: e.booking,
                focused: e.focused,
                enabled: e.enabled,
            });
        }
        await Funnel.updateOne(
            { domainId: c.domainId, funnelId, version: 1 },
            { $set: { entries }, $inc: { version: 1 } },
        );
    } else if (input.action === "publish") {
        if (!input.confirmed || f.archived)
            throw new FunnelError("公開する内容を確認してください。");
        const publication = await snapshot(c, f);
        await save(c, f, {
            publication,
            active: true,
            publishedAt: new Date(),
            previous: [f.publication, ...(f.previous || [])]
                .filter(Boolean)
                .slice(0, 3),
        });
    } else if (input.action === "rollback") {
        if (!input.confirmed || f.archived || !f.previous?.length)
            throw new FunnelError("戻せる公開版がありません。");
        const publication = f.previous[0];
        await target(c, publication.courseId, true);
        await validateEntries(
            c,
            publication.courseId,
            publication.pages,
            f.funnelId,
        );
        await save(c, f, {
            publication,
            active: true,
            publishedAt: new Date(),
            previous: [f.publication, ...f.previous.slice(1)]
                .filter(Boolean)
                .slice(0, 3),
        });
    } else if (input.action === "restore") {
        await save(c, f, { archived: false, active: false });
    } else if (input.action === "pause" || input.action === "archive") {
        await save(c, f, {
            active: false,
            ...(input.action === "archive" ? { archived: true } : {}),
        });
    }
}
export async function publicFunnelSnapshot(domainId: string, pageId: string) {
    const f = await Funnel.findOne({
        domainId,
        active: true,
        archived: false,
        "publication.pages": { $elemMatch: { pageId, enabled: true } },
    })
        .select("funnelId publication")
        .sort({ publishedAt: -1, funnelId: 1 })
        .lean();
    if (!f?.publication) return null;
    const course = await Course.findOne({
        domain: domainId,
        courseId: f.publication.courseId,
        published: true,
        deleted: { $ne: true },
    })
        .select(
            "courseId title slug published thankYouUrl cost costType featuredImage defaultPaymentPlan leadMagnet type tags",
        )
        .lean();
    const p = f.publication.pages.find((e) => e.pageId === pageId && e.enabled);
    if (!p || !course) return null;
    return { page: clone(p), course: clone(course), funnelId: f.funnelId };
}
export async function protectFunnelMedia(
    domain: unknown,
    candidates: string[],
) {
    if (!candidates.length) return candidates;
    const [pages, records] = await Promise.all([
        Page.find({ domain, funnelManaged: true })
            .select("layout draftLayout socialImage draftSocialImage")
            .lean(),
        Funnel.find({ domainId: String(domain) })
            .select("publication previous")
            .lean(),
    ]);
    const serialized = JSON.stringify({ pages, records });
    const retained = extractMediaIDs(serialized);
    for (const match of Array.from(
        serialized.matchAll(/"mediaId"\s*:\s*"([^"\\]+)"/g),
    ))
        retained.add(match[1]);
    return candidates.filter((x) => !retained.has(x));
}
