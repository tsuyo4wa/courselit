import mongoose from "mongoose";
import Funnel from "@models/Funnel";
import Page from "@models/Page";
import Course from "@models/Course";
import Plan from "@models/PaymentPlan";
import {
    mutateFunnel,
    publicFunnelSnapshot,
    protectFunnelMedia,
    checkFunnelLinks,
    funnelAdminData,
} from "@/services/funnels";
import { funnelOrigin } from "@/services/funnel-context";
jest.mock("@/auth", () => ({ auth: { api: { getSession: jest.fn() } } }));
let c: any;
async function current() {
    return (await Funnel.findOne({ domainId: c.domainId }).lean())!;
}
async function act(action: string, extra: any = {}) {
    const f = await current();
    return mutateFunnel(c, {
        action,
        funnelId: f.funnelId,
        version: f.version,
        ...extra,
    });
}
beforeEach(async () => {
    await Promise.all([
        Funnel.deleteMany({}),
        Page.deleteMany({}),
        Course.deleteMany({}),
        Plan.deleteMany({}),
    ]);
    const domain = new mongoose.Types.ObjectId();
    c = {
        domainId: String(domain),
        domain: {
            _id: domain,
            name: "test",
            customDomain: "school.example.com",
            settings: {},
        },
        manager: true,
        user: { userId: "owner" },
    };
    await Course.collection.insertOne({
        domain,
        courseId: "course-1",
        title: "無料講座",
        slug: "course",
        published: true,
        type: "course",
        thankYouUrl: "https://school.example.com/p/thanks",
        cost: 0,
        costType: "free",
    });
    await Plan.collection.insertOne({
        domain,
        planId: "free",
        name: "無料",
        entityId: "course-1",
        entityType: "course",
        type: "free",
        archived: false,
        internal: false,
    });
    await Page.create({
        domain,
        creatorId: "owner",
        type: "product",
        entityId: "course-1",
        name: "元の募集ページ",
        pageId: "original",
        layout: [
            { name: "header", shared: true },
            {
                name: "embed",
                settings: {
                    content: "<p>元の本文</p>",
                    media: { mediaId: "image-1" },
                },
            },
            { name: "footer", shared: true },
        ],
    });
    await mutateFunnel(c, {
        action: "create",
        name: "募集企画",
        courseId: "course-1",
    });
});
it("adds two independent LPs to one course and preserves the common thanks and original", async () => {
    await act("add", { name: "広告用", slug: "ad", sourcePageId: "original" });
    await act("add", {
        name: "メルマガ用",
        slug: "mail",
        sourcePageId: "original",
    });
    const f = await current();
    expect(f.entries.map((e) => e.pageId)).toEqual(["ad", "mail"]);
    expect(await Course.countDocuments({})).toBe(1);
    expect((await Course.findOne({ courseId: "course-1" }))!.thankYouUrl).toBe(
        "https://school.example.com/p/thanks",
    );
    const source: any = await Page.findOne({ pageId: "original" }).lean();
    expect(source.layout[1].settings?.content).toBe("<p>元の本文</p>");
    await Page.updateOne(
        { pageId: "ad" },
        { $set: { "draftLayout.1.settings.content": "広告だけ変更" } },
    );
    const mail: any = await Page.findOne({ pageId: "mail" }).lean();
    expect(mail.draftLayout[1].settings.content).toBe("<p>元の本文</p>");
    expect(await publicFunnelSnapshot(c.domainId, "ad")).toBeNull();
    expect(
        await protectFunnelMedia(c.domain._id, ["image-1", "unused"]),
    ).toEqual(["unused"]);
    const data = await funnelAdminData(c);
    expect(data.funnels[0].pages).toHaveLength(2);
});
it("publishes one atomic snapshot, leaves draft edits private, pauses and rolls back", async () => {
    await act("add", { name: "広告用", slug: "ad", sourcePageId: "original" });
    await expect(act("publish")).rejects.toThrow("確認");
    await act("publish", { confirmed: true });
    const first = await publicFunnelSnapshot(c.domainId, "ad");
    expect(first?.page.layout[1].settings?.content).toBe("<p>元の本文</p>");
    await Page.updateOne(
        { pageId: "ad" },
        { $set: { "draftLayout.1.settings.content": "未公開の変更" } },
    );
    expect(
        (await publicFunnelSnapshot(c.domainId, "ad"))?.page.layout[1].settings
            ?.content,
    ).toBe("<p>元の本文</p>");
    await act("publish", { confirmed: true });
    expect(
        (await publicFunnelSnapshot(c.domainId, "ad"))?.page.layout[1].settings
            ?.content,
    ).toBe("未公開の変更");
    await act("rollback", { confirmed: true });
    expect(
        (await publicFunnelSnapshot(c.domainId, "ad"))?.page.layout[1].settings
            ?.content,
    ).toBe("<p>元の本文</p>");
    await act("pause");
    expect(await publicFunnelSnapshot(c.domainId, "ad")).toBeNull();
    await act("archive");
    expect((await current()).archived).toBe(true);
    await act("restore");
    expect((await current()).active).toBe(false);
    expect((await current()).archived).toBe(false);
});
it("rejects cross-tenant input, ordinary-page attachment, stale versions and missing plan", async () => {
    const f = await current();
    await expect(
        mutateFunnel(
            { ...c, manager: false },
            { action: "create", name: "x", courseId: "course-1" },
        ),
    ).rejects.toThrow("権限");
    await expect(
        mutateFunnel(
            { ...c, domainId: String(new mongoose.Types.ObjectId()) },
            { action: "pause", funnelId: f.funnelId, version: f.version },
        ),
    ).rejects.toThrow("見つかりません");
    await expect(act("attach", { pageId: "original" })).rejects.toThrow(
        "コピー",
    );
    await act("add", { name: "LP", slug: "ad", sourcePageId: "original" });
    await expect(
        mutateFunnel(c, {
            action: "pause",
            funnelId: f.funnelId,
            version: f.version,
        }),
    ).rejects.toThrow("別の画面");
    await Plan.deleteMany({});
    await expect(act("publish", { confirmed: true })).rejects.toThrow(
        "料金プラン",
    );
    expect(await publicFunnelSnapshot(c.domainId, "ad")).toBeNull();
});
it("shares an LP only across funnels for the same course and preserves the other public entry on pause", async () => {
    await act("add", {
        name: "共有LP",
        slug: "shared",
        sourcePageId: "original",
    });
    const a = await current();
    await act("publish", { confirmed: true });
    await mutateFunnel(c, {
        action: "create",
        name: "別企画",
        courseId: "course-1",
    });
    const b = (await Funnel.findOne({ funnelId: { $ne: a.funnelId } }).lean())!;
    await mutateFunnel(c, {
        action: "attach",
        funnelId: b.funnelId,
        version: b.version,
        pageId: "shared",
    });
    await mutateFunnel(c, {
        action: "publish",
        funnelId: b.funnelId,
        version: b.version + 1,
        confirmed: true,
    });
    const a2 = (await Funnel.findOne({ funnelId: a.funnelId }).lean())!;
    await mutateFunnel(c, {
        action: "pause",
        funnelId: a.funnelId,
        version: a2.version,
    });
    expect(await publicFunnelSnapshot(c.domainId, "shared")).not.toBeNull();
});
it("clones a funnel into a paused draft with new independent pages", async () => {
    await act("add", { name: "LP", slug: "ad", sourcePageId: "original" });
    await act("publish", { confirmed: true });
    const a = await current();
    await act("clone");
    const b = (await Funnel.findOne({ funnelId: { $ne: a.funnelId } }).lean())!;
    expect(b.active).toBe(false);
    expect(b.courseId).toBe(a.courseId);
    expect(b.entries[0].pageId).not.toBe("ad");
    expect(
        await publicFunnelSnapshot(c.domainId, b.entries[0].pageId),
    ).toBeNull();
});
it("blocks a mismatched checkout hidden inside copied HTML and validates request origin", () => {
    expect(() =>
        checkFunnelLinks(
            [
                {
                    name: "embed",
                    settings: {
                        content:
                            '<a href="/checkout?type=course&amp;id=other">申込</a>',
                    },
                },
            ] as any,
            "course-1",
        ),
    ).toThrow("別商品");
    expect(() =>
        checkFunnelLinks(
            [
                {
                    name: "embed",
                    settings: {
                        content:
                            '<a href="/checkout?type=course&amp;id=course-1">申込</a>',
                    },
                },
            ] as any,
            "course-1",
        ),
    ).not.toThrow();
    expect(() =>
        funnelOrigin(
            c,
            new Headers({
                host: "school.example.com",
                origin: "https://attacker.example",
            }),
        ),
    ).toThrow();
    expect(() =>
        funnelOrigin(
            c,
            new Headers({
                host: "school.example.com",
                origin: "https://school.example.com",
            }),
        ),
    ).not.toThrow();
});
it("rejects duplicate URL and inactive course at publish without opening any LP", async () => {
    await act("add", { name: "LP", slug: "ad", sourcePageId: "original" });
    await expect(
        act("add", { name: "別LP", slug: "ad", sourcePageId: "original" }),
    ).rejects.toThrow("URL");
    await Course.updateOne(
        { courseId: "course-1" },
        { $set: { published: false } },
    );
    await expect(act("publish", { confirmed: true })).rejects.toThrow(
        "公開されていません",
    );
    expect(await publicFunnelSnapshot(c.domainId, "ad")).toBeNull();
});
