import { useState } from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
} from "@testing-library/react";
import AppointmentSlotPicker from "../appointment-slot-picker";
import { appointmentRequest } from "@/lib/appointment-client";
jest.mock("@/lib/appointment-client", () => ({
    appointmentRequest: jest.fn(),
}));
const request = appointmentRequest as jest.Mock;
const interval = (day: string, hour = 10) => ({
    start: new Date(`${day}T${hour}:00:00+09:00`).toISOString(),
    end: new Date(`${day}T${hour + 1}:00:00+09:00`).toISOString(),
});
beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, "now").mockReturnValue(
        Date.parse("2026-10-14T12:00:00+09:00"),
    );
});
afterEach(() => jest.restoreAllMocks());
function Harness({
    sample = false,
    bookingId,
}: {
    sample?: boolean;
    bookingId?: string;
}) {
    const [selected, select] = useState("");
    return (
        <>
            <AppointmentSlotPicker
                preview
                sample={sample}
                bookingId={bookingId}
                selected={selected}
                onSelect={select}
            />
            <output aria-label="選択した時間">{selected}</output>
        </>
    );
}
it("loads month availability in bounded chunks and changes days without extra requests", async () => {
    request.mockImplementation(async (path) => ({
        slots: path.includes("from=2026-10-14")
            ? [interval("2026-10-16"), interval("2026-10-17", 12)]
            : [],
    }));
    render(<Harness bookingId="existing-booking" />);
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    fireEvent.click(
        await screen.findByRole("button", { name: "2026年10月16日 空きあり" }),
    );
    fireEvent.click(
        screen.getByRole("radio", { name: "10月16日(金) 10:00〜11:00" }),
    );
    expect(screen.getByLabelText("選択した時間")).toHaveTextContent(
        interval("2026-10-16").start,
    );
    const calls = request.mock.calls.map(
        (call) => new URLSearchParams(call[0].split("?")[1]),
    );
    expect(calls.map((q) => [q.get("from"), q.get("days")])).toEqual([
        ["2026-10-14", "14"],
        ["2026-10-28", "4"],
    ]);
    expect(
        calls.every(
            (q) =>
                q.get("preview") === "1" &&
                q.get("bookingId") === "existing-booking",
        ),
    ).toBe(true);
    fireEvent.click(
        screen.getByRole("button", { name: "2026年10月17日 空きあり" }),
    );
    expect(screen.getByLabelText("選択した時間")).toBeEmptyDOMElement();
    expect(
        screen.getByRole("radio", { name: "10月17日(土) 12:00〜13:00" }),
    ).not.toBeChecked();
    expect(
        screen.queryByRole("radio", { name: "10月16日(金) 10:00〜11:00" }),
    ).not.toBeInTheDocument();
    expect(request).toHaveBeenCalledTimes(2);
    expect(
        screen.getByRole("button", { name: "2026年10月18日 受付なし" }),
    ).toBeDisabled();
});
it("does not expose partial availability when a later chunk fails and supports retry", async () => {
    request
        .mockResolvedValueOnce({ slots: [interval("2026-10-16")] })
        .mockRejectedValueOnce(new Error("接続を確認してください"));
    render(<Harness />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
        "接続を確認してください",
    );
    expect(
        screen.queryByRole("button", { name: /空きあり/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    request.mockResolvedValue({ slots: [] });
    fireEvent.click(screen.getByRole("button", { name: "空き状況を再確認" }));
    await screen.findByText(
        "この月に予約できる日時はありません。別の月をご確認ください。",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
it("ignores stale responses when another month is chosen and bounds month navigation", async () => {
    let release!: (value: unknown) => void;
    request.mockImplementation((path) =>
        path.includes("from=2026-10-14")
            ? new Promise((resolve) => {
                  release = resolve;
              })
            : Promise.resolve({
                  slots: path.includes("from=2026-11-01")
                      ? [interval("2026-11-02")]
                      : [],
              }),
    );
    render(<Harness />);
    expect(screen.getByRole("button", { name: "前の月" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "次の月" }));
    await screen.findByRole("button", { name: "2026年11月2日 空きあり" });
    await act(async () => release({ slots: [interval("2026-10-16")] }));
    expect(screen.getByRole("heading", { name: "2026年11月" })).toBeVisible();
    expect(
        screen.queryByRole("button", { name: "2026年10月16日 空きあり" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "次の月" })).toBeDisabled();
    expect(request.mock.calls[0][2].aborted).toBe(true);
});
it("renders leap month dates and clears a selection on a month change without writes in sample mode", async () => {
    jest.spyOn(Date, "now").mockReturnValue(
        Date.parse("2028-01-31T12:00:00+09:00"),
    );
    render(<Harness sample />);
    fireEvent.click(screen.getByRole("button", { name: "次の月" }));
    fireEvent.click(
        await screen.findByRole("button", { name: "2028年2月29日 空きあり" }),
    );
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    fireEvent.click(screen.getAllByRole("radio")[0]);
    expect(screen.getByLabelText("選択した時間")).not.toBeEmptyDOMElement();
    fireEvent.click(screen.getByRole("button", { name: "前の月" }));
    await waitFor(() =>
        expect(screen.getByLabelText("選択した時間")).toBeEmptyDOMElement(),
    );
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
});

it("restores a login return time only when the current availability still contains it", async () => {
    const choice = interval("2026-10-16", 12);
    request.mockImplementation(async (path) => ({
        slots: path.includes("from=2026-10-14") ? [choice] : [],
    }));
    const onSelect = jest.fn();
    render(
        <AppointmentSlotPicker
            preview={false}
            sample={false}
            selected=""
            initialStart={choice.start}
            onSelect={onSelect}
        />,
    );
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith(choice.start));
    expect(screen.getByRole("radio")).toBeInTheDocument();
});
it("does not restore a no-longer-available requested time", async () => {
    request.mockResolvedValue({ slots: [] });
    const onSelect = jest.fn();
    render(
        <AppointmentSlotPicker
            preview={false}
            sample={false}
            selected=""
            initialStart={interval("2026-10-16").start}
            onSelect={onSelect}
        />,
    );
    await waitFor(() => expect(request).toHaveBeenCalled());
    expect(onSelect.mock.calls.every((args) => args[0] === "")).toBe(true);
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
});

it("keeps the selected menu on every month availability request", async () => {
    request.mockResolvedValue({ slots: [] });
    render(
        <AppointmentSlotPicker
            preview
            sample={false}
            typeId="11111111-1111-4111-8111-111111111111"
            durationMinutes={90}
            selected=""
            onSelect={() => {}}
        />,
    );
    await screen.findByText(
        "この月に予約できる日時はありません。別の月をご確認ください。",
    );
    expect(request.mock.calls.length).toBeGreaterThan(0);
    expect(
        request.mock.calls.every(
            (call) =>
                new URLSearchParams(call[0].split("?")[1]).get("typeId") ===
                "11111111-1111-4111-8111-111111111111",
        ),
    ).toBe(true);
});
