import { NextRequest } from "next/server";
import { GET, POST } from "../route";
import { contactContext } from "@/services/contact-form";
import { getLaunchReview, saveLaunchReview } from "@/services/launch-review";
jest.mock("@/services/contact-form", () => ({ contactContext: jest.fn() }));
jest.mock("@/services/launch-review", () => ({
    ...jest.requireActual("@/services/launch-review"),
    getLaunchReview: jest.fn(),
    saveLaunchReview: jest.fn(),
}));
const owner = {
    owner: true,
    domain: {
        _id: "school",
        email: "owner@example.com",
        customDomain: "school.example.com",
        settings: { catalogHiddenProductIds: ["bundle"] },
    },
};
const input = {
    revision: "a".repeat(64),
    pages: {
        home: "<h1>Home</h1>",
        recruitment: "<h1>Course</h1>",
        signup: "<h1>Preview</h1>",
    },
    hiddenProductIds: ["bundle"],
};
const request = (
    body: unknown = input,
    origin = "https://school.example.com",
) =>
    new NextRequest("https://school.example.com/api/launch-preview", {
        method: "POST",
        headers: { "content-type": "application/json", origin },
        body: JSON.stringify(body),
    });
beforeEach(() => {
    jest.clearAllMocks();
    (contactContext as jest.Mock).mockResolvedValue(owner);
    (saveLaunchReview as jest.Mock).mockResolvedValue(undefined);
});
it("rejects anonymous and learner writes before storage", async () => {
    for (const context of [null, { ...owner, owner: false }]) {
        (contactContext as jest.Mock).mockResolvedValue(context);
        expect((await POST(request())).status).toBe(403);
        expect((await GET(request())).status).toBe(403);
    }
    expect(saveLaunchReview).not.toHaveBeenCalled();
});
it("rejects cross-origin writes", async () => {
    expect(
        (await POST(request(input, "https://attacker.example.com"))).status,
    ).toBe(403);
    expect(saveLaunchReview).not.toHaveBeenCalled();
});
it("validates bounds and unknown fields", async () => {
    expect((await POST(request({ ...input, publish: true }))).status).toBe(400);
    expect(
        (
            await POST(
                request({
                    ...input,
                    pages: { ...input.pages, home: "x".repeat(60001) },
                }),
            )
        ).status,
    ).toBe(400);
    expect(saveLaunchReview).not.toHaveBeenCalled();
});
it("stores preview and scoped catalog ids only", async () => {
    const result = await POST(request());
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ ready: true });
    expect(saveLaunchReview).toHaveBeenCalledWith(owner.domain, input);
});
it("returns status without draft html or credentials", async () => {
    (getLaunchReview as jest.Mock).mockResolvedValue({
        pages: input.pages,
        revision: input.revision,
    });
    const result = await GET(request());
    expect(result.headers.get("cache-control")).toBe("no-store");
    expect(await result.json()).toEqual({
        ready: true,
        revision: input.revision,
        hiddenProductIds: ["bundle"],
    });
});
it("does not disclose exceptions", async () => {
    (saveLaunchReview as jest.Mock).mockRejectedValue(
        new Error("private detail"),
    );
    const result = await POST(request());
    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ ready: false });
});
