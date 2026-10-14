import { NextRequest } from "next/server";
import { POST } from "@/app/api/policy-preview/route";
import { contactContext } from "@/services/contact-form";
import { savePolicyReview } from "@/services/policy-review";
jest.mock("@/services/contact-form", () => ({ contactContext: jest.fn() }));
jest.mock("@/services/policy-review", () => ({
    ...jest.requireActual("@/services/policy-review"),
    savePolicyReview: jest.fn(),
}));
const good = {
    terms: "# 利用規約\n\n無料講座です。",
    privacy: "# プライバシーポリシー\n\n情報を保護します。",
};
function request(
    content: unknown = good,
    origin = "https://school.example.com",
) {
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
beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(contactContext).mockResolvedValue({
        owner: true,
        domain: { customDomain: "school.example.com" },
    } as never);
});
it("does not permit a learner or anonymous visitor to store drafts", async () => {
    jest.mocked(contactContext).mockResolvedValue({
        owner: false,
        domain: {},
    } as never);
    expect((await POST(request())).status).toBe(403);
    expect(savePolicyReview).not.toHaveBeenCalled();
});
it("rejects a foreign browser origin even for the owner", async () => {
    expect((await POST(request(good, "https://evil.example"))).status).toBe(
        403,
    );
    expect(savePolicyReview).not.toHaveBeenCalled();
});
it("rejects unknown fields and invalid manuscripts", async () => {
    expect((await POST(request({ ...good, public: true }))).status).toBe(400);
    expect(savePolicyReview).not.toHaveBeenCalled();
});
it("saves only the owner tenant's draft and returns no manuscript", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ready: true });
    expect(savePolicyReview).toHaveBeenCalledWith(
        { customDomain: "school.example.com" },
        good,
    );
});
it("stores a bounded consultation LP for the same owner-only review", async () => {
    const content = {
        ...good,
        consultationHtml: "<!doctype html><p>Private LP</p>",
    };
    const response = await POST(request(content));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ready: true });
    expect(savePolicyReview).toHaveBeenCalledWith(
        { customDomain: "school.example.com" },
        content,
    );
});
it("rejects oversized HTML and oversized UTF-8 bodies", async () => {
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
