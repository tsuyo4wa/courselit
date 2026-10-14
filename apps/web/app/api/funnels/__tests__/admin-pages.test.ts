import ListPage from "@/app/(with-contexts)/dashboard/(sidebar)/funnels/page";
import DetailPage from "@/app/(with-contexts)/dashboard/(sidebar)/funnels/[id]/page";
import { funnelContext } from "@/services/funnel-context";
import { funnelAdminData } from "@/services/funnels";
import { notFound } from "next/navigation";
jest.mock("next/headers", () => ({
    headers: jest.fn(async () => new Headers()),
}));
jest.mock("next/navigation", () => ({
    notFound: jest.fn(() => {
        throw new Error("not-found");
    }),
}));
jest.mock("@/services/funnel-context", () => ({ funnelContext: jest.fn() }));
jest.mock("@/services/funnels", () => ({ funnelAdminData: jest.fn() }));
jest.mock("@/components/admin/funnels", () => () => null, { virtual: true });
beforeEach(() => {
    jest.clearAllMocks();
    (funnelContext as jest.Mock).mockResolvedValue({
        manager: true,
        domainId: "own",
    });
    (funnelAdminData as jest.Mock).mockResolvedValue({
        funnels: [{ funnelId: "own-promotion", name: "自分の企画" }],
        courses: [],
        pages: [],
        publicOrigin: "https://school.example",
    });
});
it("keeps the list route unselected", async () => {
    const page = await ListPage();
    expect(page.props.selectedId).toBeUndefined();
});
it("opens a bookmarked promotion as its own detail page", async () => {
    const page = await DetailPage({
        params: Promise.resolve({ id: "own-promotion" }),
    });
    expect(page.props.selectedId).toBe("own-promotion");
});
it("blocks a non-manager before reading management data on both routes", async () => {
    (funnelContext as jest.Mock).mockResolvedValue({ manager: false });
    await expect(ListPage()).rejects.toThrow("not-found");
    await expect(
        DetailPage({ params: Promise.resolve({ id: "own-promotion" }) }),
    ).rejects.toThrow("not-found");
    expect(funnelAdminData).not.toHaveBeenCalled();
});
it("does not render another tenant's or a missing promotion", async () => {
    await expect(
        DetailPage({ params: Promise.resolve({ id: "foreign-promotion" }) }),
    ).rejects.toThrow("not-found");
    expect(notFound).toHaveBeenCalled();
});
