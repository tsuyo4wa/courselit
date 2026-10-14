import {
    render,
    screen,
    fireEvent,
    waitFor,
    within,
} from "@testing-library/react";
import AppointmentAdmin from "../appointments";
import { appointmentRequest } from "@/lib/appointment-client";
import { defaultAppointmentConfig, slots } from "@/lib/appointment-input";
import type {
    AppointmentAdminData,
    AppointmentView,
} from "@courselit/common-models";
jest.mock("@/lib/appointment-client", () => ({
    appointmentRequest: jest.fn(),
    appointmentTime: (value: string) => value,
}));
jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
function data(bookings: AppointmentView[] = []): AppointmentAdminData {
    return {
        config: {
            ...defaultAppointmentConfig,
            windows: [
                { day: 1, start: "10:00", end: "12:00" },
                { day: 2, start: "10:00", end: "20:00" },
            ],
        },
        clientId: "",
        secretConfigured: false,
        connected: false,
        account: "",
        redirectUri: "https://example.com/api/appointments/google/callback",
        calendars: [],
        bookings,
    };
}
beforeEach(() => jest.clearAllMocks());
it("keeps the saved calendar selected when refreshed options replace its fallback", async () => {
    const initial = data();
    initial.connected = true;
    initial.config.calendarId = "consultation-calendar";
    (appointmentRequest as jest.Mock).mockResolvedValue({
        calendars: [
            {
                id: "consultation-calendar",
                summary: "個別コンサル",
                accessRole: "owner",
            },
        ],
        checkedAt: new Date().toISOString(),
    });
    render(<AppointmentAdmin initial={initial} />);
    fireEvent.click(screen.getByRole("button", { name: "Google連携" }));
    expect(screen.getByLabelText("予約を書き込むカレンダー")).toHaveValue(
        "consultation-calendar",
    );
    fireEvent.click(
        screen.getByRole("button", { name: "接続とカレンダーを確認" }),
    );
    await screen.findByRole("option", { name: "個別コンサル" });
    expect(screen.getByLabelText("予約を書き込むカレンダー")).toHaveValue(
        "consultation-calendar",
    );
    expect(screen.getByRole("button", { name: "設定を保存" })).toBeDisabled();
});
it("retains edited multiple weekday windows across management panels and saves without enabling public booking", async () => {
    const initial = data();
    const request = appointmentRequest as jest.Mock;
    request.mockImplementation(async (_path, body) => {
        if (body?.action === "save") {
            initial.config = body.data.config;
            return {};
        }
        return initial;
    });
    render(<AppointmentAdmin initial={initial} />);
    fireEvent.click(screen.getByRole("button", { name: "月に時間帯を追加" }));
    fireEvent.change(screen.getByLabelText("月開始2"), {
        target: { value: "13:00" },
    });
    fireEvent.change(screen.getByLabelText("月終了2"), {
        target: { value: "18:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Google連携" }));
    expect(
        screen.getByRole("textbox", { name: "Google OAuth クライアントID" }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "日程・受付設定" }));
    expect(screen.getByLabelText("月開始2")).toHaveValue("13:00");
    fireEvent.click(screen.getByRole("button", { name: "設定を保存" }));
    await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent(
            "設定を保存しました。",
        ),
    );
    const saved = request.mock.calls.find(
        (call) => call[1]?.action === "save",
    )[1].data;
    expect(saved.config.windows).toEqual([
        { day: 1, start: "10:00", end: "12:00" },
        { day: 2, start: "10:00", end: "20:00" },
        { day: 1, start: "13:00", end: "18:00" },
    ]);
    expect(saved.config.enabled).toBe(false);
});
it("removes only a selected window and preserves the other weekday values", () => {
    render(<AppointmentAdmin initial={data()} />);
    fireEvent.click(screen.getByRole("button", { name: "月に時間帯を追加" }));
    fireEvent.click(screen.getByRole("button", { name: "月の時間帯1を削除" }));
    expect(screen.getByLabelText("月開始1")).toHaveValue("12:00");
    expect(screen.getByLabelText("火終了1")).toHaveValue("20:00");
    fireEvent.click(screen.getByRole("checkbox", { name: "月曜日" }));
    expect(screen.queryByLabelText("月開始1")).not.toBeInTheDocument();
    expect(screen.getByLabelText("火終了1")).toHaveValue("20:00");
});
it("preset selection changes duration without submitting or hiding the custom input", () => {
    render(<AppointmentAdmin initial={data()} />);
    const choices = screen.getByRole("group", { name: "所要時間（分）の候補" });
    fireEvent.click(within(choices).getByRole("button", { name: "90分" }));
    expect(screen.getByLabelText("所要時間（分）")).toHaveValue(90);
    expect(
        within(choices).getByRole("button", { name: "90分" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(appointmentRequest).not.toHaveBeenCalled();
});
it("filters loaded bookings by name, local booking date and status", () => {
    const row = {
        bookingId: "a",
        name: "予約テスト",
        email: "test@example.com",
        start: "2030-01-01T15:00:00Z",
        end: "2030-01-01T16:00:00Z",
        status: "cancelled",
        preview: true,
        version: 1,
        mailState: "sent",
    } as AppointmentView;
    render(
        <AppointmentAdmin
            initial={data([
                row,
                {
                    ...row,
                    bookingId: "b",
                    name: "別の予約",
                    email: "other@example.com",
                    status: "confirmed",
                },
            ])}
        />,
    );
    fireEvent.click(screen.getByRole("button", { name: "予約一覧" }));
    fireEvent.change(screen.getByLabelText("名前・メールアドレス"), {
        target: { value: "test@example" },
    });
    expect(screen.queryByText("other@example.com")).not.toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("予約日（終了）"), {
        target: { value: "2030-01-01" },
    });
    expect(
        screen.getByText("条件に合う予約はありません。"),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("予約日（終了）"), {
        target: { value: "2030-01-02" },
    });
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("予約の状態"), {
        target: { value: "confirmed" },
    });
    expect(
        screen.getByText("条件に合う予約はありません。"),
    ).toBeInTheDocument();
});

it("does not offer the midday gap between two windows on the same day", () => {
    const day = new Date("2030-01-07T12:00:00+09:00").getUTCDay();
    const config = {
        ...defaultAppointmentConfig,
        windows: [
            { day, start: "10:00", end: "12:00" },
            { day, start: "13:00", end: "16:00" },
        ],
    };
    const times = slots(
        config,
        "2030-01-07",
        1,
        [],
        Date.parse("2030-01-01T00:00:00Z"),
    );
    expect(times.length).toBeGreaterThan(0);
    expect(times.some((v) => v.start === "2030-01-07T04:00:00.000Z")).toBe(
        true,
    );
    expect(
        times.every(
            (v) =>
                v.end <= "2030-01-07T03:00:00.000Z" ||
                v.start >= "2030-01-07T04:00:00.000Z",
        ),
    ).toBe(true);
});

it("imports only the web client fields locally and waits for explicit save", async () => {
    render(<AppointmentAdmin initial={data()} />);
    fireEvent.click(screen.getByRole("button", { name: "Google連携" }));
    const file = new File(["{}"], "client.json", { type: "application/json" });
    Object.defineProperty(file, "text", {
        value: async () =>
            JSON.stringify({
                web: {
                    client_id: "test.apps.googleusercontent.com",
                    client_secret: "fake-secret-for-test",
                    redirect_uris: [
                        "https://example.com/api/appointments/google/callback",
                    ],
                },
                extra: "not submitted",
            }),
    });
    fireEvent.change(screen.getByLabelText("Google接続用JSONを読み込む"), {
        target: { files: [file] },
    });
    await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent(
            "JSONから接続情報を読み込みました。",
        ),
    );
    expect(screen.getByLabelText("Google OAuth クライアントID")).toHaveValue(
        "test.apps.googleusercontent.com",
    );
    expect(
        screen.getByLabelText("クライアントシークレット：未設定"),
    ).toHaveValue("fake-secret-for-test");
    expect(
        screen.getByLabelText("クライアントシークレット：未設定"),
    ).toHaveAttribute("type", "password");
    expect(appointmentRequest).not.toHaveBeenCalled();
});
it("rejects a client JSON registered for another callback without filling credentials", async () => {
    render(<AppointmentAdmin initial={data()} />);
    fireEvent.click(screen.getByRole("button", { name: "Google連携" }));
    const file = new File(["{}"], "wrong-client.json");
    Object.defineProperty(file, "text", {
        value: async () =>
            JSON.stringify({
                web: {
                    client_id: "other.apps.googleusercontent.com",
                    client_secret: "fake",
                    redirect_uris: ["https://other.example/callback"],
                },
            }),
    });
    fireEvent.change(screen.getByLabelText("Google接続用JSONを読み込む"), {
        target: { files: [file] },
    });
    await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent(
            "JSONを読み込めませんでした。",
        ),
    );
    expect(screen.getByLabelText("Google OAuth クライアントID")).toHaveValue(
        "",
    );
    expect(
        screen.getByLabelText("クライアントシークレット：未設定"),
    ).toHaveValue("");
    expect(appointmentRequest).not.toHaveBeenCalled();
});
