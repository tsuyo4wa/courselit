import { render, screen } from "@testing-library/react";
import FunnelLanding from "../funnel-landing";
import { generateThemeStyles } from "@/lib/theme-styles";
jest.mock("@/lib/theme-styles", () => ({
    generateThemeStyles: jest.fn(() => ""),
}));
jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ children, ...p }: any) => <a {...p}>{children}</a>,
}));
jest.mock(
    "@/app/(with-contexts)/(with-layout)/p/[id]/client-side-page",
    () => ({ __esModule: true, default: () => <p>LPの本文</p> }),
);
jest.mock("../appointment-booker", () => ({
    __esModule: true,
    default: (p: any) => (
        <div
            data-testid="booking"
            data-sample={String(p.sample)}
            data-return={p.returnTo}
            data-theme={p.themeStyles}
        >
            カレンダー
        </div>
    ),
}));
const view = {
    page: { pageId: "ad", focused: true, booking: true },
    preview: true,
    courseTitle: "無料講座",
    courseId: "course-1",
    siteTitle: "なまけものマーケティング",
    loggedIn: false,
    booking: { enabled: false, title: "個別相談" },
};
it("renders a non-writing booking sample and disables the typed checkout in preview", () => {
    render(
        <FunnelLanding view={view} siteInfo={{ settings: {}, theme: {} }} />,
    );
    expect(
        screen.getByRole("button", { name: "この講座に申し込む（確認用）" }),
    ).toBeDisabled();
    expect(screen.getByTestId("booking")).toHaveAttribute(
        "data-sample",
        "true",
    );
    expect(
        screen.queryByRole("navigation", { name: "サイトのメニュー" }),
    ).not.toBeInTheDocument();
});
it("respects the real booking pause in a public LP", () => {
    render(
        <FunnelLanding
            view={{ ...view, preview: false }}
            siteInfo={{ settings: {}, theme: {} }}
        />,
    );
    expect(screen.queryByTestId("booking")).not.toBeInTheDocument();
    expect(
        screen.getByText("個別相談は現在、予約受付を停止しています。"),
    ).toBeInTheDocument();
    expect(
        screen.getByRole("link", { name: "この講座に申し込む" }),
    ).toHaveAttribute("href", "/checkout?type=course&id=course-1");
});
it("uses the same-site LP return path and enabled booking without an iframe", () => {
    render(
        <FunnelLanding
            view={{
                ...view,
                preview: false,
                booking: { ...view.booking, enabled: true },
            }}
            siteInfo={{ settings: {}, theme: {} }}
        />,
    );
    expect(screen.getByTestId("booking")).toHaveAttribute(
        "data-return",
        "/lp/ad",
    );
    expect(screen.getByTestId("booking")).toHaveAttribute(
        "data-sample",
        "false",
    );
});

it("uses the published site theme inside the admin preview and passes it to the embedded calendar", () => {
    const publishedTheme = { theme: { colors: { light: {}, dark: {} } } };
    (generateThemeStyles as jest.Mock).mockReturnValueOnce(
        ".courselit-theme{color:green}",
    );
    render(
        <FunnelLanding
            view={view}
            siteInfo={{ settings: {}, theme: publishedTheme }}
        />,
    );
    expect(generateThemeStyles).toHaveBeenCalledWith(publishedTheme);
    expect(screen.getByTestId("booking")).toHaveAttribute(
        "data-theme",
        ".appointment-booking-shell{color:green}",
    );
});
