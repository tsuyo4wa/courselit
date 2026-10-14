import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Funnels from "../funnels";
import { funnelRequest } from "@/lib/funnel-client";
const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("@/lib/funnel-client", () => ({ funnelRequest: jest.fn() }));
jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ children, ...p }: any) => <a {...p}>{children}</a>,
}));
const course = {
    courseId: "course-1",
    title: "ChatGPT基礎講座",
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
function tab(name: string) {
    fireEvent.mouseDown(screen.getByRole("tab", { name }), {
        button: 0,
        ctrlKey: false,
    });
}
function options() {
    fireEvent.click(screen.getAllByText("LPの設定")[0]);
}

it("shows two LPs for one course and uses only the existing common URL setting", () => {
    render(<Funnels initial={fixture()} selectedId="f-1" />);
    expect(screen.getByText("広告用LP")).toBeInTheDocument();
    expect(screen.getByText("メルマガ用LP")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "公開前の確認" })).toHaveLength(
        2,
    );
    expect(
        screen.getAllByRole("link", { name: "本文を編集" })[0],
    ).toHaveAttribute(
        "href",
        "/dashboard/page/ad?redirectTo=%2Fdashboard%2Ffunnels%2Ff-1",
    );
    tab("基本設定");
    expect(screen.getByText(course.thankYouUrl)).toBeInTheDocument();
    expect(
        screen.getByRole("link", { name: "講座のURL設定を開く →" }),
    ).toHaveAttribute("href", "/dashboard/product/course-1/manage");
    expect(
        screen.queryByRole("textbox", { name: /サンクス/ }),
    ).not.toBeInTheDocument();
    expect(funnelRequest).not.toHaveBeenCalled();
});
it("saves booking display independently for one LP without changing thanks or publishing", async () => {
    const initial = fixture();
    const next = fixture();
    next.funnels[0].version = 2;
    next.funnels[0].entries[0].booking = true;
    (funnelRequest as jest.Mock).mockResolvedValue(next);
    render(<Funnels initial={initial} selectedId="f-1" />);
    options();
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
it("creates a draft from the list and navigates to its own detail URL", async () => {
    const next = fixture();
    next.funnels.unshift({
        ...next.funnels[0],
        funnelId: "new-id",
        name: "新しい募集",
    });
    (funnelRequest as jest.Mock).mockResolvedValue(next);
    render(<Funnels initial={fixture()} />);
    fireEvent.click(
        screen.getByRole("button", { name: "プロモーションを作る" }),
    );
    fireEvent.change(
        screen
            .getByRole("form", { name: "プロモーションの作成" })
            .querySelector("input")!,
        { target: { value: "新しい募集" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "下書きで作成" }));
    await waitFor(() =>
        expect(funnelRequest).toHaveBeenCalledWith({
            action: "create",
            name: "新しい募集",
            courseId: "course-1",
        }),
    );
    expect(push).toHaveBeenCalledWith("/dashboard/funnels/new-id");
});
it("shows a save conflict and never automatically repeats an action", async () => {
    (funnelRequest as jest.Mock).mockRejectedValue(
        new Error("別の画面で更新されました。"),
    );
    render(<Funnels initial={fixture()} selectedId="f-1" />);
    options();
    fireEvent.click(
        screen.getAllByRole("checkbox", { name: "次回の公開に含める" })[0],
    );
    fireEvent.click(screen.getByRole("button", { name: "設定を保存" }));
    expect(
        await screen.findByText("別の画面で更新されました。"),
    ).toBeInTheDocument();
    expect(funnelRequest).toHaveBeenCalledTimes(1);
});

it("opens on the list without automatically expanding the first editor", () => {
    render(<Funnels initial={fixture()} />);
    expect(
        screen.getByRole("heading", { level: 1, name: "プロモーション" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("募集企画")).toHaveLength(1);
    expect(screen.getByText("無料講座")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /募集企画/ })).toHaveAttribute(
        "href",
        "/dashboard/funnels/f-1",
    );
    expect(
        screen.queryByRole("article", { name: "ファネル" }),
    ).not.toBeInTheDocument();
    expect(
        screen.queryByRole("checkbox", { name: "予約フォームを表示" }),
    ).not.toBeInTheDocument();
    expect(funnelRequest).not.toHaveBeenCalled();
});
it("shows LPs first and requires a separate publication tab with explicit review", () => {
    render(<Funnels initial={fixture()} selectedId="f-1" />);
    expect(
        screen.getByRole("heading", { level: 1, name: "募集企画" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("プロモーション名")).not.toBeInTheDocument();
    expect(screen.getByText(course.thankYouUrl)).toBeInTheDocument();
    expect(
        screen.queryByRole("button", { name: "確認した内容を公開する" }),
    ).not.toBeInTheDocument();
    expect(
        screen.getByRole("link", { name: "プロモーションへ戻る" }),
    ).toHaveAttribute("href", "/dashboard/funnels");
    tab("公開・停止");
    expect(
        screen.getByRole("button", { name: "確認した内容を公開する" }),
    ).toBeDisabled();
    fireEvent.click(
        screen.getByRole("checkbox", {
            name: "公開する本文とリンクを確認しました",
        }),
    );
    expect(
        screen.getByRole("button", { name: "確認した内容を公開する" }),
    ).toBeEnabled();
    expect(funnelRequest).not.toHaveBeenCalled();
});
it("searches the list and reveals archived recruitment without writing", () => {
    const initial = fixture();
    initial.funnels.push({
        ...initial.funnels[0],
        funnelId: "archived",
        name: "以前の募集",
        archived: true,
    });
    render(<Funnels initial={initial} />);
    expect(
        screen.queryByRole("link", { name: /以前の募集/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "アーカイブも表示" }));
    expect(
        screen.getByRole("link", { name: /以前の募集/ }),
    ).toBeInTheDocument();
    fireEvent.change(
        screen.getByRole("textbox", { name: "プロモーションを検索" }),
        {
            target: { value: "ありません" },
        },
    );
    expect(
        screen.getByText("一致するプロモーションがありません"),
    ).toBeInTheDocument();
    expect(funnelRequest).not.toHaveBeenCalled();
});
it("keeps unsaved edits when the list back control is used", () => {
    render(<Funnels initial={fixture()} selectedId="f-1" />);
    tab("基本設定");
    fireEvent.change(
        screen.getByRole("textbox", { name: "プロモーション名" }),
        {
            target: { value: "編集中" },
        },
    );
    fireEvent.click(screen.getByRole("link", { name: "プロモーションへ戻る" }));
    expect(screen.getByRole("status")).toHaveTextContent("保存していない変更");
    expect(
        screen.getByRole("textbox", { name: "プロモーション名" }),
    ).toHaveValue("編集中");
    expect(push).not.toHaveBeenCalled();
    expect(funnelRequest).not.toHaveBeenCalled();
});
it("shows the vertical LP-to-checkout-to-thanks flow and opens settings from its node", () => {
    render(<Funnels initial={fixture()} selectedId="f-1" />);
    const signup = screen.getByRole("region", { name: "販売・申込" });
    const thanks = screen.getByRole("region", { name: "サンクスページ" });
    expect(
        signup.compareDocumentPosition(thanks) &
            Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "URLを設定" })).toHaveAttribute(
        "href",
        "/dashboard/product/course-1/manage",
    );
    expect(screen.getByRole("link", { name: "ページを確認" })).toHaveAttribute(
        "href",
        course.thankYouUrl,
    );
    fireEvent.click(screen.getByRole("button", { name: "設定" }));
    expect(
        screen.getByRole("textbox", { name: "プロモーション名" }),
    ).toHaveValue("募集企画");
    expect(funnelRequest).not.toHaveBeenCalled();
});

it("opens the add-LP form when copying a specific LP", () => {
    render(<Funnels initial={fixture()} selectedId="f-1" />);
    options();
    fireEvent.click(
        screen.getAllByRole("button", { name: "このLPを複製する" })[0],
    );
    expect(screen.getByRole("textbox", { name: "LP名" })).toHaveValue(
        "広告用LP コピー",
    );
    expect(screen.getByRole("combobox", { name: "コピー元" })).toHaveValue(
        "ad",
    );
    expect(funnelRequest).not.toHaveBeenCalled();
});
