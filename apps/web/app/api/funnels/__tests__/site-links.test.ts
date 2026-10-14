import {
    portablePageHtml,
    portablePageLayout,
} from "@/lib/portable-page-layout";
import {
    portableSiteLink,
    publicSiteOrigin,
    readSiteThankYouUrl,
} from "@/lib/portable-site-url";
const moved = { name: "main", customDomain: "academy.example.com" };
describe("portable school links", () => {
    it.each([
        "https://school.namakemono.info",
        "https://namakemono-courselit.onrender.com",
        "https://academy.example.com",
        "//school.namakemono.info",
    ])("makes exact owned origin relative: %s", (host) => {
        expect(
            portableSiteLink(host + "/checkout?type=course&id=c#top", moved),
        ).toBe("/checkout?type=course&id=c#top");
    });
    it.each([
        "https://lp.namakemono.info/offer",
        "https://us02web.zoom.us/j/123?pwd=example",
        "https://school.namakemono.info.evil.test/path",
        "https://school.namakemono.info@evil.test/path",
        "https://user:pass@school.namakemono.info/path",
        "https://school.namakemono.info:8443/path",
        "https://school.namakemono.info//evil.test/path",
        "javascript:alert(1)",
        "mailto:info@example.com",
        "/p/course?x=1#top",
        "#content",
    ])("preserves external/special/unsafe URL: %s", (url) =>
        expect(portableSiteLink(url, moved)).toBe(url),
    );
    it("does not apply another tenant's historical hosts", () => {
        expect(
            portableSiteLink("https://school.namakemono.info/p/a", {
                name: "another",
                customDomain: "other.example.com",
            }),
        ).toBe("https://school.namakemono.info/p/a");
    });
    it("edits only real navigation attributes and leaves image data, prose, CSS, script and src unchanged", () => {
        const prefix =
            '<!-- <a href="https://school.namakemono.info/fake"> --><style>a{background:url(https://school.namakemono.info/bg.png)}</style><script>const fake=\'<a href="https://school.namakemono.info/fake">\';</script><p>https://school.namakemono.info</p><img src="https://school.namakemono.info/photo.png"><img src="data:image/png;base64,ABC">';
        const body =
            '<a CLASS="cta" HREF=\'https://school.namakemono.info/checkout?type=course&amp;id=c#top\' target="_blank">申し込む</a><form action="https://school.namakemono.info/contact"></form><a href="https://lp.namakemono.info/offer">相談LP</a>';
        expect(portablePageHtml(prefix + body, moved)).toBe(
            prefix +
                body
                    .replace(
                        "HREF='https://school.namakemono.info/checkout?type=course&amp;id=c#top'",
                        'href="/checkout?type=course&amp;id=c#top"',
                    )
                    .replace(
                        'action="https://school.namakemono.info/contact"',
                        'action="/contact"',
                    ),
        );
    });
    it("does not execute inline scripts or change base-dependent custom HTML", () => {
        const html =
            '<base href="https://external.example/"><a href="https://school.namakemono.info/p/course">講座</a><script>throw new Error("must not execute")</script>';
        expect(portablePageHtml(html, moved)).toBe(html);
    });
    it("normalizes Page navigation, rich text and embed content without changing media or original layout", () => {
        const layout = [
            {
                name: "header",
                settings: {
                    links: [
                        { href: "https://school.namakemono.info/products" },
                    ],
                },
            },
            {
                name: "embed",
                settings: {
                    content:
                        '<a href="https://school.namakemono.info/p/course">講座</a>',
                    image: { file: "https://school.namakemono.info/media.png" },
                    url: "https://school.namakemono.info/media",
                },
            },
        ];
        expect(
            portablePageHtml(
                '<a href="https://SCHOOL.NAMAKEMONO.INFO/p/course">講座</a>',
                moved,
            ),
        ).toBe('<a href="/p/course">講座</a>');
        const result = portablePageLayout(layout, moved);
        expect(result[0].settings.links![0].href).toBe("/products");
        expect(result[1].settings.content).toContain('href="/p/course"');
        expect(result[1].settings.image!.file).toBe(
            layout[1].settings.image!.file,
        );
        expect(result[1].settings.url).toBe(layout[1].settings.url);
        expect(layout[0].settings.links![0].href).toMatch(/^https:/);
        expect(portablePageLayout(result, moved)).toEqual(result);
    });
    it("uses the current configured origin for a stored internal thanks URL, retaining the client HTTPS contract", () => {
        expect(
            readSiteThankYouUrl(
                "https://school.namakemono.info/p/thanks?x=1#next",
                moved,
            ),
        ).toBe("https://academy.example.com/p/thanks?x=1#next");
        expect(
            readSiteThankYouUrl(
                "https://lp.namakemono.info/ai-personal-training/aipt-lp001",
                moved,
            ),
        ).toBe("https://lp.namakemono.info/ai-personal-training/aipt-lp001");
        expect(
            readSiteThankYouUrl("javascript:alert(1)", moved),
        ).toBeUndefined();
    });
    it("builds email links only from configured hosts, not arbitrary input", () => {
        expect(publicSiteOrigin(moved)).toBe("https://academy.example.com");
        expect(
            portableSiteLink("https://school.namakemono.info/p/course", {
                name: "__proto__",
                customDomain: "other.example.com",
            }),
        ).toBe("https://school.namakemono.info/p/course");
        expect(
            publicSiteOrigin({ customDomain: "evil.test/path" }),
        ).toBeUndefined();
        expect(
            publicSiteOrigin({ customDomain: "user@evil.test" }),
        ).toBeUndefined();
    });
});
