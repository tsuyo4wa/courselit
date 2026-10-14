import { normalizeThankYouUrl, readThankYouUrl } from "@/lib/thank-you-url";

describe("thank-you destination validation", () => {
    it.each([undefined, null, "", "  "])(
        "keeps omitted/cleared settings optional: %s",
        (value) => expect(normalizeThankYouUrl(value)).toBe(""),
    );
    it("normalizes only the configured public URL and preserves its query/fragment", () =>
        expect(
            normalizeThankYouUrl(
                "  https://EXAMPLE.com/lp?source=course#intro  ",
            ),
        ).toBe("https://example.com/lp?source=course#intro"));
    it.each([
        "javascript:alert(1)",
        "data:text/html,test",
        "//example.com",
        "http://example.com",
        "https://name:password@example.com",
        "https://localhost/a",
        "https://127.0.0.1/a",
        "https://[::1]/a",
        "https://host.local/a",
        "https://host.internal/a",
        "https://example.com:8443/a",
        "https://example.com/checkout/verify",
        "https://example.com/api/a",
        "https://example.com/\nattack",
        "https://example.com/" + "x".repeat(2048),
    ])("rejects unsafe destination %s", (value) => {
        expect(() => normalizeThankYouUrl(value)).toThrow();
        expect(readThankYouUrl(value)).toBeUndefined();
    });
});
