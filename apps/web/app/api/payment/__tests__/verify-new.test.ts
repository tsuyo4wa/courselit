import { POST } from "../verify-new/route";
import { getDomain, getUser } from "../initiate/route";
import { auth } from "@/auth";
import InvoiceModel from "@models/Invoice";
import Membership from "@models/Membership";
import CourseModel from "@models/Course";
import { Constants } from "@courselit/common-models";

jest.mock("../initiate/route", () => ({
    getDomain: jest.fn(),
    getUser: jest.fn(),
}));
jest.mock("@/auth", () => ({ auth: { api: { getSession: jest.fn() } } }));
jest.mock("@/services/logger", () => ({ error: jest.fn() }));
jest.mock("@models/Invoice");
jest.mock("@models/Membership");
jest.mock("@models/Course");

describe("paid learning access verification", () => {
    const request = () =>
        ({
            json: async () => ({ id: "invoice" }),
            headers: new Headers({ domain: "school" }),
        }) as any;
    beforeEach(() => {
        jest.clearAllMocks();
        (getDomain as jest.Mock).mockResolvedValue({ _id: "tenant" });
        (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({
            user: {},
        });
        (getUser as jest.Mock).mockResolvedValue({ userId: "buyer" });
        (InvoiceModel.findOne as jest.Mock).mockResolvedValue({
            status: "paid",
            membershipId: "m",
        });
        (Membership.findOne as jest.Mock).mockResolvedValue({
            status: Constants.MembershipStatus.ACTIVE,
            userId: "buyer",
            entityType: Constants.MembershipEntityType.COURSE,
            entityId: "c",
        });
        (CourseModel.findOne as jest.Mock).mockResolvedValue({
            title: "講座",
            slug: "course",
        });
    });
    it("returns the purchased course only after payment and learning access are ready", async () => {
        const response = await POST(request());
        expect(await response.json()).toEqual({
            status: "paid",
            learningPath: "/course/course/c?learn=true",
            title: "講座",
        });
        expect(InvoiceModel.findOne).toHaveBeenCalledWith({
            domain: "tenant",
            invoiceId: "invoice",
        });
        expect(Membership.findOne).toHaveBeenCalledWith({
            domain: "tenant",
            membershipId: "m",
        });
    });
    it("never reveals another purchaser's learning link", async () => {
        (Membership.findOne as jest.Mock).mockResolvedValue({
            userId: "other-buyer",
        });
        expect((await POST(request())).status).toBe(401);
        expect(CourseModel.findOne).not.toHaveBeenCalled();
    });
    it("keeps pending payment and incomplete learning grants pending", async () => {
        (InvoiceModel.findOne as jest.Mock).mockResolvedValueOnce({
            status: "pending",
            membershipId: "m",
        });
        expect(await (await POST(request())).json()).toEqual({
            status: "pending",
        });
        (Membership.findOne as jest.Mock).mockResolvedValue({
            userId: "buyer",
            status: Constants.MembershipStatus.PENDING,
        });
        expect(await (await POST(request())).json()).toEqual({
            status: "pending",
        });
        expect(CourseModel.findOne).not.toHaveBeenCalled();
    });
    it("requires a signed-in purchaser", async () => {
        (getUser as jest.Mock).mockResolvedValue(null);
        expect((await POST(request())).status).toBe(401);
        expect(InvoiceModel.findOne).not.toHaveBeenCalled();
    });
    it("uses the course list for a bundle", async () => {
        (Membership.findOne as jest.Mock).mockResolvedValue({
            userId: "buyer",
            status: Constants.MembershipStatus.ACTIVE,
            entityType: Constants.MembershipEntityType.COMMUNITY,
            entityId: "bundle",
        });
        expect((await (await POST(request())).json()).learningPath).toBe(
            "/dashboard/my-content/products",
        );
    });
});
