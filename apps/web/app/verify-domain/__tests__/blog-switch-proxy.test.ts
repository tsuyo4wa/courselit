import { NextRequest } from "next/server";
import { proxy } from "../../../proxy";
import { getBackendAddress } from "@/app/actions";
import { auth } from "@/auth";
jest.mock("@/app/actions", () => ({ getBackendAddress: jest.fn() }));
jest.mock("@/auth", () => ({ auth: { api: { getSession: jest.fn() } } }));
const originalFetch = global.fetch;
function domainResponse(blogEnabled?: boolean) {
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
            domain: "school",
            domainId: "domain-id",
            domainEmail: "operator@example.com",
            domainTitle: "スクール",
            blogEnabled,
        }),
    });
}
beforeEach(() => {
    jest.clearAllMocks();
    (getBackendAddress as jest.Mock).mockResolvedValue(
        "https://school.example",
    );
    (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({
        user: { id: "owner" },
    });
});
afterAll(() => {
    global.fetch = originalFetch;
});
it.each([
    "/blog",
    "/blog/slug/id",
    "/dashboard/blogs",
    "/dashboard/blog/new",
    "/p/blog",
    "/dashboard/page/blog",
])("blocks direct blog route %s when OFF", async (path) => {
    domainResponse(false);
    const res = await proxy(new NextRequest("https://school.example" + path));
    expect(res.status).toBe(404);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.text()).toContain("ブログ機能はOFF");
});
it("preserves course and community routes when OFF", async () => {
    domainResponse(false);
    for (const path of [
        "/course/slug/id",
        "/dashboard/products",
        "/dashboard/my-content/feed",
    ]) {
        const res = await proxy(
            new NextRequest("https://school.example" + path),
        );
        expect(res.headers.get("x-middleware-next")).toBe("1");
    }
});
it.each([true, undefined])(
    "keeps blog accessible with compatible enabled state %s",
    async (state) => {
        domainResponse(state);
        const res = await proxy(new NextRequest("https://school.example/blog"));
        expect(res.headers.get("x-middleware-next")).toBe("1");
    },
);
it("ignores an inbound client flag claiming the blog is enabled", async () => {
    domainResponse(false);
    const res = await proxy(
        new NextRequest("https://school.example/blog", {
            headers: { blogEnabled: "true" },
        }),
    );
    expect(res.status).toBe(404);
});
