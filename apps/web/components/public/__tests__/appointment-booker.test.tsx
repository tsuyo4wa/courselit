jest.mock("color-convert", () => ({
    __esModule: true,
    default: { hex: { hsl: jest.fn(() => [210, 50, 30]) } },
}));
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeContext } from "@/components/contexts";
import { generateThemeStyles } from "@/lib/theme-styles";
import AppointmentBooker from "../appointment-booker";
import { appointmentText as t } from "@/config/strings";
jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ children, href, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));
const originalRandomUUID = crypto.randomUUID;
beforeEach(() => {
    global.fetch = jest.fn();
    Object.defineProperty(crypto, "randomUUID", {
        configurable: true,
        value: () => "00000000-0000-4000-8000-000000000001",
    });
    jest.spyOn(Date, "now").mockReturnValue(
        Date.parse("2026-10-14T12:00:00+09:00"),
    );
});
afterEach(() => {
    jest.restoreAllMocks();
    if (originalRandomUUID)
        Object.defineProperty(crypto, "randomUUID", {
            configurable: true,
            value: originalRandomUUID,
        });
    else Reflect.deleteProperty(crypto, "randomUUID");
});
it("shows a labelled sample, supports date selection and never creates a booking", async () => {
    const request = jest.spyOn(global, "fetch");
    render(
        <AppointmentBooker
            preview
            sample
            loggedIn
            title={t.title}
            description={t.description}
        />,
    );
    expect(screen.getByText(t.sampleNotice)).toBeInTheDocument();
    fireEvent.click(
        await screen.findByRole("button", { name: "2026年10月15日 空きあり" }),
    );
    await waitFor(() => expect(screen.getAllByRole("radio")).toHaveLength(3));
    fireEvent.click(screen.getAllByRole("radio")[0]);
    expect(
        screen.getByRole("button", { name: t.confirmPreview }),
    ).toBeDisabled();
    expect(request).not.toHaveBeenCalled();
});
it("requires existing login without forcing course enrollment", async () => {
    jest.spyOn(global, "fetch").mockImplementation(
        async (url) =>
            ({
                ok: true,
                json: async () => ({
                    slots: String(url).includes("from=2026-10-14")
                        ? [
                              {
                                  start: "2026-10-15T01:00:00.000Z",
                                  end: "2026-10-15T02:00:00.000Z",
                              },
                          ]
                        : [],
                }),
            }) as Response,
    );
    render(
        <AppointmentBooker
            preview={false}
            loggedIn={false}
            title={t.title}
            description={t.description}
        />,
    );
    fireEvent.click(
        await screen.findByRole("button", { name: "2026年10月15日 空きあり" }),
    );
    await waitFor(() => expect(screen.getByRole("radio")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("radio"));
    expect(screen.getByRole("link", { name: t.login })).toHaveAttribute(
        "href",
        "/login?redirect=%2Fappointments",
    );
    expect(screen.getByText(t.loginHelp)).toBeInTheDocument();
    expect(screen.getByText(t.privacyPurpose)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: t.privacy })).toHaveAttribute(
        "href",
        "/p/privacy#consultations",
    );
});
it("provides accessible date, name, note and consent fields before confirmation", async () => {
    render(
        <AppointmentBooker
            preview
            sample
            loggedIn
            title={t.title}
            description={t.description}
        />,
    );
    fireEvent.click(
        await screen.findByRole("button", { name: "2026年10月15日 空きあり" }),
    );
    await waitFor(() => expect(screen.getAllByRole("radio")).toHaveLength(3));
    fireEvent.click(screen.getAllByRole("radio")[0]);
    expect(screen.getByLabelText(t.name)).toBeInTheDocument();
    expect(screen.getByLabelText(t.notes)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: t.consent })).not.toBeChecked();
    expect(screen.getByRole("link", { name: t.privacy })).toHaveAttribute(
        "href",
        "/dashboard/policy-preview#consultations",
    );
    const notice = screen.getByText(t.privacyPurpose);
    const checkbox = screen.getByRole("checkbox", { name: t.consent });
    expect(
        notice.compareDocumentPosition(screen.getByLabelText(t.name)) &
            Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
        notice.compareDocumentPosition(checkbox) &
            Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText(t.privacyStorage)).toBeInTheDocument();
});

it("uses the saved school palette for private preview and scopes it to the booking surface", () => {
    const theme = {
        theme: {
            colors: {
                light: {
                    primary: "#1d3b5f",
                    background: "#ffffff",
                    foreground: "#222222",
                },
                dark: {
                    primary: "#aabbcc",
                    background: "#111111",
                    foreground: "#eeeeee",
                },
            },
        },
    } as any;
    const { container } = render(
        <ThemeContext.Provider value={{ theme, setTheme: jest.fn() }}>
            <AppointmentBooker
                preview
                sample
                loggedIn
                title={t.title}
                description={t.description}
            />
        </ThemeContext.Provider>,
    );
    const css = container.querySelector("style")!.textContent!;
    expect(css).toContain(".appointment-booking-shell");
    expect(css).not.toContain(".courselit-theme {");
    expect(css).toBe(
        generateThemeStyles(theme).replaceAll(
            ".courselit-theme",
            ".appointment-booking-shell",
        ),
    );
});

it("uses the server-supplied public palette even inside the admin theme provider", () => {
    const css = ".appointment-booking-shell { --primary: 214 52% 25%; }";
    const { container } = render(
        <AppointmentBooker
            preview
            sample
            loggedIn
            title={t.title}
            description={t.description}
            themeStyles={css}
        />,
    );
    expect(container.querySelector("style")!.textContent).toBe(css);
});

it("keeps creation and owned rescheduling connected to the selected calendar time", async () => {
    const fetch = jest
        .spyOn(global, "fetch")
        .mockImplementation(async (url, init) => {
            if (init?.method === "POST") {
                const body = JSON.parse(init.body as string);
                return {
                    ok: true,
                    json: async () => ({
                        booking: {
                            bookingId: "calendar-test",
                            start: body.start,
                            end: new Date(
                                Date.parse(body.start) + 3600000,
                            ).toISOString(),
                            status: "confirmed",
                            preview: true,
                            version: body.action === "create" ? 1 : 2,
                        },
                    }),
                } as Response;
            }
            return {
                ok: true,
                json: async () => ({
                    slots: String(url).includes("from=2026-10-14")
                        ? [
                              {
                                  start: "2026-10-16T01:00:00.000Z",
                                  end: "2026-10-16T02:00:00.000Z",
                              },
                              {
                                  start: "2026-10-17T03:00:00.000Z",
                                  end: "2026-10-17T04:00:00.000Z",
                              },
                          ]
                        : [],
                }),
            } as Response;
        });
    render(
        <AppointmentBooker
            preview
            loggedIn
            title={t.title}
            description={t.description}
        />,
    );
    fireEvent.click(
        await screen.findByRole("button", { name: "2026年10月16日 空きあり" }),
    );
    fireEvent.click(screen.getByRole("radio"));
    fireEvent.change(screen.getByLabelText(t.name), {
        target: { value: "動作確認" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: t.consent }));
    fireEvent.click(screen.getByRole("button", { name: t.confirmPreview }));
    await screen.findByRole("button", { name: t.change });
    fireEvent.click(screen.getByRole("button", { name: t.change }));
    fireEvent.click(
        await screen.findByRole("button", { name: "2026年10月17日 空きあり" }),
    );
    fireEvent.click(screen.getByRole("radio"));
    fireEvent.click(screen.getByRole("button", { name: t.changeSubmit }));
    await waitFor(() =>
        expect(
            fetch.mock.calls.filter((call) => call[1]?.method === "POST"),
        ).toHaveLength(2),
    );
    const writes = fetch.mock.calls
        .filter((call) => call[1]?.method === "POST")
        .map((call) => JSON.parse(call[1]!.body as string));
    expect(writes[0]).toMatchObject({
        action: "create",
        preview: true,
        start: "2026-10-16T01:00:00.000Z",
        name: "動作確認",
        consent: true,
    });
    expect(writes[1]).toMatchObject({
        action: "reschedule",
        preview: true,
        start: "2026-10-17T03:00:00.000Z",
        id: "calendar-test",
        version: 1,
    });
    expect(
        fetch.mock.calls.some((call) =>
            String(call[0]).includes("bookingId=calendar-test"),
        ),
    ).toBe(true);
});

it("returns to the same LP after login while preserving only the requested time", async () => {
    jest.spyOn(global, "fetch").mockImplementation(
        async (url) =>
            ({
                ok: true,
                json: async () => ({
                    slots: String(url).includes("from=2026-10-14")
                        ? [
                              {
                                  start: "2026-10-15T01:00:00.000Z",
                                  end: "2026-10-15T02:00:00.000Z",
                              },
                          ]
                        : [],
                }),
            }) as Response,
    );
    render(
        <AppointmentBooker
            preview={false}
            loggedIn={false}
            title={t.title}
            description={t.description}
            returnTo="/lp/ad"
        />,
    );
    fireEvent.click(
        await screen.findByRole("button", { name: "2026年10月15日 空きあり" }),
    );
    fireEvent.click(await screen.findByRole("radio"));
    const href = screen
        .getByRole("link", { name: t.login })
        .getAttribute("href")!;
    const destination = new URL(
        href,
        "https://school.example",
    ).searchParams.get("redirect")!;
    const target = new URL(destination, "https://school.example");
    expect(target.pathname).toBe("/lp/ad");
    expect(target.searchParams.get("slot")).toBe("2026-10-15T01:00:00.000Z");
    expect(target.searchParams.has("email")).toBe(false);
});
