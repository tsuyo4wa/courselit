import { isAppointmentLoginDestination } from "@/lib/appointment-login-route";
it("keeps the original consultation OTP intent flow", () => {
    expect(isAppointmentLoginDestination("/appointments")).toBe(true);
});
it("recognizes the embedded LP consultation return as the same OTP intent flow", () => {
    expect(
        isAppointmentLoginDestination(
            "/lp/ad?slot=2026-10-16T01%3A00%3A00.000Z",
        ),
    ).toBe(true);
});
it.each([
    "https://other.example/lp/ad?slot=2026-10-16T01:00:00.000Z",
    "//other.example/lp/ad?slot=2026-10-16T01:00:00.000Z",
    "/lp/ad",
    "/lp/ad?slot=invalid",
    "/lp/ad?slot=2026-10-16T01:00:00.000Z&email=person@example.com",
    "/checkout?type=course&id=1",
])(
    "does not treat an unrelated login destination as consultation signup: %s",
    (value) => {
        expect(isAppointmentLoginDestination(value)).toBe(false);
    },
);
