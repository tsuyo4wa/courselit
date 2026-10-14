import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
beforeEach(() => {
    global.fetch = jest.fn();
});
afterEach(() => jest.restoreAllMocks());
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
    fireEvent.click(screen.getByRole("button", { name: t.search }));
    await waitFor(() => expect(screen.getAllByRole("radio")).toHaveLength(3));
    fireEvent.click(screen.getAllByRole("radio")[0]);
    expect(
        screen.getByRole("button", { name: t.confirmPreview }),
    ).toBeDisabled();
    expect(request).not.toHaveBeenCalled();
});
it("requires existing login without forcing course enrollment", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({
            slots: [
                {
                    start: "2030-01-01T01:00:00.000Z",
                    end: "2030-01-01T02:00:00.000Z",
                },
            ],
        }),
    } as Response);
    render(
        <AppointmentBooker
            preview={false}
            loggedIn={false}
            title={t.title}
            description={t.description}
        />,
    );
    fireEvent.click(screen.getByRole("button", { name: t.search }));
    await waitFor(() => expect(screen.getByRole("radio")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("radio"));
    expect(screen.getByRole("link", { name: t.login })).toHaveAttribute(
        "href",
        "/login?redirect=%2Fappointments",
    );
    expect(screen.getByText(t.loginHelp)).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole("button", { name: t.search }));
    await waitFor(() => expect(screen.getAllByRole("radio")).toHaveLength(3));
    fireEvent.click(screen.getAllByRole("radio")[0]);
    expect(screen.getByLabelText(t.name)).toBeInTheDocument();
    expect(screen.getByLabelText(t.notes)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: t.consent })).not.toBeChecked();
    expect(screen.getByRole("link", { name: t.privacy })).toBeInTheDocument();
});
