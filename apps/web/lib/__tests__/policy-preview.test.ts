jest.mock("next/headers", () => ({
    headers: jest.fn().mockResolvedValue(new Headers()),
}));
jest.mock("next/navigation", () => ({
    notFound: jest.fn(() => {
        throw new Error("NOT_FOUND");
    }),
}));
jest.mock("@/services/contact-form", () => ({ contactContext: jest.fn() }));
jest.mock("@/services/policy-review", () => ({ getPolicyReview: jest.fn() }));
jest.mock("@/components/admin/policy-review", () => ({
    __esModule: true,
    default: () => null,
}));
import { contactContext } from "@/services/contact-form";
import { getPolicyReview } from "@/services/policy-review";
import { notFound } from "next/navigation";
import Page from "@/app/(with-contexts)/dashboard/(sidebar)/policy-preview/page";
describe("owner-only policy review", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(getPolicyReview).mockResolvedValue({
            terms: "# 利用規約",
            privacy: "# プライバシーポリシー",
        });
    });
    it("renders for the domain owner", async () => {
        jest.mocked(contactContext).mockResolvedValue({
            owner: true,
            domain: {},
        } as never);
        expect(await Page()).toBeTruthy();
        expect(notFound).not.toHaveBeenCalled();
    });
    it("does not expose the review to a learner", async () => {
        jest.mocked(contactContext).mockResolvedValue({
            owner: false,
            domain: {},
        } as never);
        await expect(Page()).rejects.toThrow("NOT_FOUND");
        expect(getPolicyReview).not.toHaveBeenCalled();
    });
    it("does not expose the review without a school owner context", async () => {
        jest.mocked(contactContext).mockResolvedValue(null);
        await expect(Page()).rejects.toThrow("NOT_FOUND");
        expect(getPolicyReview).not.toHaveBeenCalled();
    });
    it("does not render an expired or absent draft", async () => {
        jest.mocked(contactContext).mockResolvedValue({
            owner: true,
            domain: {},
        } as never);
        jest.mocked(getPolicyReview).mockResolvedValue(null);
        await expect(Page()).rejects.toThrow("NOT_FOUND");
    });
});
