import {
    createCourse,
    getCourse,
    getCourseOrThrow,
    getCoursesAsAdmin,
    getProducts,
    getProductsCount,
    updateCourse,
    deleteCourse,
} from "../logic";
import { updateSiteInfo } from "../../settings/logic";
import { getPages, getPage, updatePage, publish } from "../../pages/logic";
import DomainModel from "@models/Domain";
import CourseModel from "@models/Course";
import UserModel from "@models/User";
import PageModel from "@models/Page";
import PaymentPlanModel from "@models/PaymentPlan";
import constants from "@/config/constants";
import {
    isBlogEnabled,
    isBlogRoute,
    blogAwareWidgetSettings,
} from "@/lib/blog-feature";
import { invalidateDomainCache } from "@/lib/domain-cache";

jest.mock("@/lib/domain-cache", () => ({ invalidateDomainCache: jest.fn() }));
jest.mock("@/services/medialit", () => ({
    deleteMedia: jest.fn(),
    sealMedia: jest.fn(),
}));
jest.mock("@/services/queue");
jest.mock("nanoid", () => ({
    nanoid: () => Math.random().toString(36).slice(2),
}));
const prefix = `blog-switch-${Date.now()}`;

describe("tenant blog switch", () => {
    let domain: any, user: any, ctx: any, blog: any, course: any;
    beforeEach(async () => {
        domain = await DomainModel.create({
            name: prefix + Math.random(),
            email: "operator@example.com",
            settings: { title: "School", blogEnabled: true },
        });
        user = await UserModel.create({
            domain: domain._id,
            userId: prefix + Math.random(),
            email: prefix + Math.random() + "@example.com",
            name: "Operator",
            permissions: [
                constants.permissions.manageSettings,
                constants.permissions.manageAnyCourse,
                constants.permissions.manageSite,
                constants.permissions.publishCourse,
            ],
            active: true,
            unsubscribeToken: prefix + Math.random(),
        });
        ctx = { user, subdomain: domain };
        blog = await createCourse(
            { title: "Existing article", type: "blog" },
            ctx,
        );
        blog.published = true;
        blog.privacy = "public";
        blog.description = "Preserved article";
        await blog.save();
        course = await createCourse(
            { title: "Existing training", type: "course" },
            ctx,
        );
        await PaymentPlanModel.create({
            domain: domain._id,
            name: "Free plan",
            type: "free",
            entityId: course.courseId,
            entityType: "course",
            userId: user.userId,
        });
        course.published = true;
        course.privacy = "public";
        await course.save();
    });
    async function disable() {
        domain = await updateSiteInfo({ blogEnabled: false }, ctx);
        ctx.subdomain = domain;
    }
    it("retains compatible defaults and only an explicit false disables", () => {
        expect(isBlogEnabled()).toBe(true);
        expect(isBlogEnabled({})).toBe(true);
        expect(isBlogEnabled({ blogEnabled: true })).toBe(true);
        expect(isBlogEnabled({ blogEnabled: false })).toBe(false);
    });
    it("saves OFF and ON, invalidates the tenant cache, and preserves article content", async () => {
        await disable();
        expect(
            (await DomainModel.findById(domain._id))!.settings!.blogEnabled,
        ).toBe(false);
        expect(invalidateDomainCache).toHaveBeenCalledWith(domain.name);
        expect((await CourseModel.findById(blog._id))!.description).toBe(
            "Preserved article",
        );
        domain = await updateSiteInfo({ blogEnabled: true }, ctx);
        ctx.subdomain = domain;
        expect(await getCourse(blog.courseId, ctx, true)).toMatchObject({
            title: "Existing article",
        });
    });
    it("does not grant students settings permission", async () => {
        await expect(
            updateSiteInfo(
                { blogEnabled: false },
                { ...ctx, user: { ...user.toObject(), permissions: [] } },
            ),
        ).rejects.toThrow();
        expect(
            (await DomainModel.findById(domain._id))!.settings!.blogEnabled,
        ).toBe(true);
    });
    it("rejects blog creation and preserves course creation while OFF", async () => {
        await disable();
        await expect(
            createCourse({ title: "Denied article", type: "blog" }, ctx),
        ).rejects.toThrow("ブログ機能はOFF");
        expect(
            await createCourse({ title: "New course", type: "course" }, ctx),
        ).toMatchObject({ type: "course" });
    });
    it("rejects blog reads, updates and deletes including REST shared logic", async () => {
        await disable();
        await expect(getCourse(blog.courseId, ctx, true)).rejects.toThrow(
            "ブログ機能はOFF",
        );
        await expect(
            getCourseOrThrow(undefined, ctx, blog.courseId),
        ).rejects.toThrow("ブログ機能はOFF");
        await expect(
            updateCourse({ id: blog.courseId, title: "Changed" }, ctx),
        ).rejects.toThrow("ブログ機能はOFF");
        await expect(deleteCourse(blog.courseId, ctx)).rejects.toThrow(
            "ブログ機能はOFF",
        );
        expect((await CourseModel.findById(blog._id))!.title).toBe(
            "Existing article",
        );
    });
    it("retains course reads and updates while OFF", async () => {
        await disable();
        expect(await getCourse(course.courseId, ctx, true)).toMatchObject({
            type: "course",
        });
        expect(
            await updateCourse(
                { id: course.courseId, title: "Updated training" },
                ctx,
            ),
        ).toMatchObject({ title: "Updated training" });
    });
    it("filters blog list and count without removing courses from mixed queries", async () => {
        await disable();
        expect(
            await getProducts({
                ctx,
                page: 1,
                limit: 20,
                filterBy: ["blog"],
                publicView: true,
            }),
        ).toEqual([]);
        expect(
            await getProductsCount({
                ctx,
                filterBy: ["blog"],
                publicView: true,
            }),
        ).toBe(0);
        const mixed = await getProducts({
            ctx,
            page: 1,
            limit: 20,
            filterBy: ["blog", "course"],
            publicView: true,
        });
        expect(mixed.map((x) => x.type)).toEqual(["course"]);
        expect(
            await getCoursesAsAdmin({
                offset: 1,
                context: ctx,
                filterBy: ["blog"],
            }),
        ).toEqual([]);
    });
    it("does not disable a second tenant", async () => {
        await disable();
        const other = await DomainModel.create({
            name: prefix + Math.random(),
            email: "other@example.com",
            settings: { title: "Other" },
        });
        const otherCtx = { user, subdomain: other };
        expect(
            await createCourse(
                { title: "Other article", type: "blog" },
                otherCtx as any,
            ),
        ).toMatchObject({ type: "blog" });
    });
    it("hides the default blog page and refuses edits and publication", async () => {
        const page = await PageModel.create({
            domain: domain._id,
            pageId: "blog",
            type: "blog",
            creatorId: user.userId,
            name: "Blog",
            entityId: domain.name,
            layout: [],
            draftLayout: [],
        });
        await disable();
        expect(await getPage({ id: "blog", ctx })).toBeUndefined();
        expect(await getPages(ctx, "blog")).toEqual([]);
        await expect(
            updatePage({ context: ctx, pageId: "blog", title: "Blocked" }),
        ).rejects.toThrow("ブログ機能はOFF");
        await expect(publish("blog", ctx)).rejects.toThrow("ブログ機能はOFF");
        expect((await PageModel.findById(page._id))!.title).toBeUndefined();
    });
});

describe("blog navigation filtering", () => {
    it.each([
        "/blog",
        "/blog/a/id",
        "/post/id",
        "/p/blog",
        "/dashboard/blogs",
        "/dashboard/blog/new",
        "/dashboard/page/blog",
    ])("guards exact blog route %s", (path) =>
        expect(isBlogRoute(path)).toBe(true),
    );
    it.each([
        "/course/blog/id",
        "/dashboard/products",
        "/dashboard/my-content/feed",
        "/p/blogging",
        "/blogging",
        "/dashboard/page/chatgpt-work-5days",
    ])("preserves other route %s", (path) =>
        expect(isBlogRoute(path)).toBe(false),
    );
    it("filters both desktop/mobile header settings without mutating stored links or external blogs", () => {
        const links = [
            { href: "/blog?x=1" },
            { href: "/products" },
            { href: "https://school.example/blog/a/id" },
            { href: "https://namakemono.info/blog" },
        ];
        const source: any = { links };
        const result: any = blogAwareWidgetSettings(
            "header",
            source,
            { blogEnabled: false },
            "https://school.example",
        );
        expect(result.links.map((x) => x.href)).toEqual([
            "/products",
            "https://namakemono.info/blog",
        ]);
        expect(source.links).toHaveLength(4);
        expect(
            blogAwareWidgetSettings(
                "header",
                source,
                { blogEnabled: true },
                "https://school.example",
            ),
        ).toBe(source);
    });
    it("filters footer links without changing theme properties or original sections", () => {
        const source: any = {
            background: "#fff",
            sections: [
                {
                    name: "Links",
                    links: [{ href: "/p/blog" }, { href: "/p/terms" }],
                },
            ],
        };
        const result: any = blogAwareWidgetSettings(
            "footer",
            source,
            { blogEnabled: false },
            "https://school.example",
        );
        expect(result.sections[0].links).toEqual([{ href: "/p/terms" }]);
        expect(result.background).toBe("#fff");
        expect(source.sections[0].links).toHaveLength(2);
    });
});
