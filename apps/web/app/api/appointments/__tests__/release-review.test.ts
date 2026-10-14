import { NextRequest } from "next/server";
jest.mock("next/headers", () => ({
    headers: jest.fn().mockResolvedValue(new Headers()),
}));
jest.mock("next/navigation", () => ({
    notFound: jest.fn(() => {
        throw new Error("NOT_FOUND");
    }),
}));
jest.mock("@/services/appointments", () => ({ appointmentContext: jest.fn() }));
jest.mock("@/services/contact-form", () => ({ contactContext: jest.fn() }));
jest.mock("@/services/policy-review", () => ({
    ...jest.requireActual("@/services/policy-review"),
    getPolicyReview: jest.fn(),
    savePolicyReview: jest.fn(),
}));
import Page from "@/app/(with-contexts)/dashboard/(sidebar)/appointments/release-review/page";
import { appointmentContext } from "@/services/appointments";
import { getPolicyReview, savePolicyReview } from "@/services/policy-review";
import { contactContext } from "@/services/contact-form";
import { POST } from "@/app/api/policy-preview/route";
import { appointmentReleaseHtml } from "@/lib/appointment-release-review";

beforeEach(() => jest.clearAllMocks());
it.each([false, undefined])(
    "denies non-owners before reading the review (%s)",
    async (owner) => {
        jest.mocked(appointmentContext).mockResolvedValue({
            owner,
            domain: {},
        } as never);
        await expect(Page()).rejects.toThrow("NOT_FOUND");
        expect(getPolicyReview).not.toHaveBeenCalled();
    },
);
it("refuses missing, expired or legacy drafts without an LP", async () => {
    jest.mocked(appointmentContext).mockResolvedValue({
        owner: true,
        domain: { _id: "tenant" },
    } as never);
    for (const draft of [
        null,
        { terms: "# 利用規約", privacy: "# プライバシーポリシー" },
    ]) {
        jest.mocked(getPolicyReview).mockResolvedValue(draft);
        await expect(Page()).rejects.toThrow("NOT_FOUND");
    }
});
it("renders an owner's LP in a frame without scripts, forms or same-origin permission", async () => {
    jest.mocked(appointmentContext).mockResolvedValue({
        owner: true,
        domain: { _id: "tenant" },
    } as never);
    jest.mocked(getPolicyReview).mockResolvedValue({
        terms: "# 利用規約",
        privacy: "# プライバシーポリシー",
        consultationHtml:
            '<a href="https://school.namakemono.info/appointments">予約</a>',
    });
    const page = await Page();
    const frame = page.props.children[2].props.children[1];
    expect(frame.type).toBe("iframe");
    expect(frame.props.sandbox).toBe("allow-top-navigation-by-user-activation");
    expect(frame.props.srcDoc).toContain(
        "/dashboard/appointments/default/preview?sample=1",
    );
    expect(getPolicyReview).toHaveBeenCalledWith({ _id: "tenant" });
});
it("rewrites all staged reservation CTAs and privacy links only, keeping existing assets and other destinations", () => {
    const html =
        '<img src="https://lp.example/assets/a.png"><a href="https://school.namakemono.info/appointments" target="_blank">予約</a>'.repeat(
            3,
        ) +
        '<a href="https://school.namakemono.info/p/privacy#consultations">案内</a><a href="https://lin.ee/example">LINE</a>';
    const review = appointmentReleaseHtml(html);
    expect(review.match(/preview\?sample=1/g)).toHaveLength(3);
    expect(review).not.toContain('target="_blank"');
    expect(review).toContain(
        'href="/dashboard/policy-preview#consultations" target="_top"',
    );
    expect(review).toContain("https://lp.example/assets/a.png");
    expect(review).toContain("https://lin.ee/example");
    expect(review).not.toContain(
        'href="https://school.namakemono.info/appointments"',
    );
});
function request(content: unknown, origin = "https://school.example.com") {
    return new NextRequest("https://school.example.com/api/policy-preview", {
        method: "POST",
        headers: {
            origin,
            host: "school.example.com",
            "content-type": "application/json",
        },
        body: JSON.stringify(content),
    });
}
const good = {
    terms: "# 利用規約",
    privacy: "# プライバシーポリシー",
    consultationHtml: "<p>LP</p>",
};
it("keeps API owner and origin boundaries for a review containing HTML", async () => {
    jest.mocked(contactContext).mockResolvedValue({
        owner: false,
        domain: {},
    } as never);
    expect((await POST(request(good))).status).toBe(403);
    jest.mocked(contactContext).mockResolvedValue({
        owner: true,
        domain: { customDomain: "school.example.com" },
    } as never);
    expect((await POST(request(good, "https://evil.example"))).status).toBe(
        403,
    );
    expect(savePolicyReview).not.toHaveBeenCalled();
});
it("accepts bounded HTML and returns no manuscript, rejects unknown fields and oversized payloads", async () => {
    jest.mocked(contactContext).mockResolvedValue({
        owner: true,
        domain: { customDomain: "school.example.com" },
    } as never);
    const response = await POST(request(good));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ready: true });
    expect(savePolicyReview).toHaveBeenCalledWith(
        { customDomain: "school.example.com" },
        good,
    );
    jest.clearAllMocks();
    expect((await POST(request({ ...good, enabled: true }))).status).toBe(400);
    expect(
        (await POST(request({ ...good, consultationHtml: "x".repeat(150001) })))
            .status,
    ).toBe(400);
    expect(
        (
            await POST(
                request({ ...good, consultationHtml: "あ".repeat(100000) }),
            )
        ).status,
    ).toBe(413);
    expect(savePolicyReview).not.toHaveBeenCalled();
});
