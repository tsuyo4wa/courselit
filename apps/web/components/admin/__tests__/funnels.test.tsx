import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Funnels from "../funnels";
import { funnelRequest } from "@/lib/funnel-client";
jest.mock("@/lib/funnel-client", () => ({ funnelRequest: jest.fn() }));
jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ children, ...p }: any) => <a {...p}>{children}</a>,
}));
const course = {
    courseId: "course-1",
    title: "無料講座",
    slug: "course",
    published: true,
    thankYouUrl: "https://school.example/p/thanks",
    plans: [{ name: "無料", planId: "free", type: "free" }],
    sourcePageId: "original",
};
const fixture = () => ({
    publicOrigin: "https://school.example",
    courses: [course],
    pages: [
        { pageId: "original", name: "元のLP", managed: false },
        { pageId: "ad", name: "広告用LP", managed: true },
        { pageId: "mail", name: "メルマガ用LP", managed: true },
    ],
    funnels: [
        {
            funnelId: "f-1",
            domainId: "domain",
            name: "募集企画",
            courseId: "course-1",
            version: 1,
            active: false,
            archived: false,
            course,
            entries: [
                { pageId: "ad", enabled: true, booking: false, focused: true },
                {
                    pageId: "mail",
                    enabled: true,
                    booking: false,
                    focused: true,
                },
            ],
            pages: [
                { pageId: "ad", name: "広告用LP" },
                { pageId: "mail", name: "メルマガ用LP" },
            ],
        },
    ],
});
beforeEach(() => jest.clearAllMocks());
it("shows two LPs for one course and uses only the existing common URL setting", () => {
    render(<Funnels initial={fixture()} />);
    expect(screen.getByText("広告用LP")).toBeInTheDocument();
    expect(screen.getByText("メルマガ用LP")).toBeInTheDocument();
    expect(screen.getByText(course.thankYouUrl)).toBeInTheDocument();
    expect(
        screen.getByRole("link", { name: "講座のURL設定を開く →" }),
    ).toHaveAttribute("href", "/dashboard/product/course-1/manage");
    expect(
        screen.queryByRole("textbox", { name: /サンクス/ }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "公開前の確認" })).toHaveLength(
        2,
    );
    expect(funnelRequest).not.toHaveBeenCalled();
});
it("saves booking display independently for one LP without changing thanks or publishing", async () => {
    const initial = fixture();
    const next = fixture();
    next.funnels[0].version = 2;
    next.funnels[0].entries[0].booking = true;
    (funnelRequest as jest.Mock).mockResolvedValue(next);
    render(<Funnels initial={initial} />);
    fireEvent.click(
        screen.getAllByRole("checkbox", { name: "予約フォームを表示" })[0],
    );
    fireEvent.click(screen.getByRole("button", { name: "設定を保存" }));
    await waitFor(() => expect(funnelRequest).toHaveBeenCalledTimes(1));
    const body = (funnelRequest as jest.Mock).mock.calls[0][0];
    expect(body.action).toBe("save");
    expect(body.courseId).toBe("course-1");
    expect(body.entries[0].booking).toBe(true);
    expect(body.entries[1].booking).toBe(false);
    expect(body).not.toHaveProperty("thankYouUrl");
    expect(body).not.toHaveProperty("active");
});
it("creates a draft only, and keeps publication disabled until explicit review", async () => {
    (funnelRequest as jest.Mock).mockResolvedValue(fixture());
    render(<Funnels initial={fixture()} />);
    expect(
        screen.getByRole("button", {
            name: "確認した内容を公開する",
            hidden: true,
        }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "ファネルを作る" }));
    fireEvent.change(
        screen
            .getByRole("form", { name: "ファネルの作成" })
            .querySelector("input")!,
        { target: { value: "新しい企画" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "下書きで作成" }));
    await waitFor(() =>
        expect(funnelRequest).toHaveBeenCalledWith({
            action: "create",
            name: "新しい企画",
            courseId: "course-1",
        }),
    );
});
it("shows a save conflict and never automatically repeats an action", async () => {
    (funnelRequest as jest.Mock).mockRejectedValue(
        new Error("別の画面で更新されました。"),
    );
    render(<Funnels initial={fixture()} />);
    fireEvent.click(screen.getAllByRole("checkbox", { name: "公開するLP" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "設定を保存" }));
    expect(
        await screen.findByText("別の画面で更新されました。"),
    ).toBeInTheDocument();
    expect(funnelRequest).toHaveBeenCalledTimes(1);
});
