import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AppointmentList from "../appointment-list";
import { appointmentRequest } from "@/lib/appointment-client";
const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
jest.mock("@/lib/appointment-client", () => ({
    appointmentRequest: jest.fn(),
}));
const initial = {
    connected: true,
    account: "owner@example.com",
    types: [
        {
            typeId: "default",
            title: "60分相談",
            duration: 60,
            enabled: false,
            version: 1,
        },
        {
            typeId: "menu-90",
            title: "90分相談",
            duration: 90,
            enabled: false,
            version: 1,
        },
    ],
};
beforeEach(() => jest.clearAllMocks());
it("shows a navigable menu list without the settings form and offers common connection separately", () => {
    render(<AppointmentList initial={initial} />);
    expect(screen.getByRole("link", { name: /60分相談/ })).toHaveAttribute(
        "href",
        "/dashboard/appointments/default",
    );
    expect(screen.getByRole("link", { name: /90分相談/ })).toHaveAttribute(
        "href",
        "/dashboard/appointments/menu-90",
    );
    expect(screen.queryByLabelText("予約の受付")).not.toBeInTheDocument();
    expect(
        screen.getByRole("link", { name: "接続を確認・設定" }),
    ).toHaveAttribute("href", "/dashboard/appointments/connection");
    fireEvent.change(screen.getByRole("textbox", { name: "個別相談を検索" }), {
        target: { value: "90" },
    });
    expect(
        screen.queryByRole("link", { name: /60分相談/ }),
    ).not.toBeInTheDocument();
});
it("creates a 90-minute paused menu then opens its detail", async () => {
    (appointmentRequest as jest.Mock).mockResolvedValue({ typeId: "new-menu" });
    render(<AppointmentList initial={initial} />);
    fireEvent.click(screen.getByRole("button", { name: "個別相談を作る" }));
    fireEvent.change(screen.getByRole("textbox", { name: "相談名" }), {
        target: { value: "長めの相談" },
    });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "90" } });
    fireEvent.click(screen.getByRole("button", { name: "受付停止で作成" }));
    await waitFor(() =>
        expect(push).toHaveBeenCalledWith("/dashboard/appointments/new-menu"),
    );
    expect(appointmentRequest).toHaveBeenCalledWith("types", {
        name: "長めの相談",
        duration: 90,
    });
});
