import { sendLearningWelcome } from "@/services/learning-welcome";
import MembershipModel from "@models/Membership";
import UserModel from "@models/User";
import CourseModel from "@models/Course";
import CommunityModel from "@models/Community";
import { addMailJob } from "@/services/queue";
import { Constants } from "@courselit/common-models";

jest.mock("@models/Membership");
jest.mock("@models/User");
jest.mock("@models/Course");
jest.mock("@models/Community");
jest.mock("@/services/queue", () => ({ addMailJob: jest.fn() }));
jest.mock("@/services/logger", () => ({ error: jest.fn() }));

describe("transactional learning welcome", () => {
    const domain = {
        _id: "school",
        customDomain: "school.example.com",
        settings: { title: "学校" },
    } as any;
    const membership = {
        membershipId: "membership",
        userId: "student",
        entityId: "course",
        entityType: Constants.MembershipEntityType.COURSE,
        status: Constants.MembershipStatus.ACTIVE,
    } as any;
    const plan = { type: Constants.PaymentPlanType.FREE } as any;
    beforeEach(() => {
        jest.clearAllMocks();
        (UserModel.findOne as jest.Mock).mockResolvedValue({
            email: "student@example.com",
        });
        (CourseModel.findOne as jest.Mock).mockResolvedValue({
            title: "講座 <script>",
            slug: "course",
        });
        (MembershipModel.findOneAndUpdate as jest.Mock).mockResolvedValue({});
        (MembershipModel.updateOne as jest.Mock).mockResolvedValue({});
        (addMailJob as jest.Mock).mockResolvedValue(undefined);
    });
    it("sends Japanese guidance using the canonical school domain and login return path", async () => {
        await sendLearningWelcome(domain, membership, plan);
        const mail = (addMailJob as jest.Mock).mock.calls[0][0];
        expect(mail.to).toEqual(["student@example.com"]);
        expect(mail.subject).toContain("受講のご案内");
        expect(mail.body).toContain("学習を始める");
        expect(mail.body).toContain(
            "https://school.example.com/login?redirect=%2Fcourse%2Fcourse%2Fcourse%3Flearn%3Dtrue",
        );
        expect(mail.body).not.toContain("<script>");
        expect(UserModel.findOne).toHaveBeenCalledWith({
            domain: domain._id,
            userId: membership.userId,
        });
    });
    it("claims only one delivery attempt across repeated or concurrent activations", async () => {
        (MembershipModel.findOneAndUpdate as jest.Mock)
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce(null);
        await Promise.all([
            sendLearningWelcome(domain, membership, plan),
            sendLearningWelcome(domain, membership, plan),
        ]);
        expect(addMailJob).toHaveBeenCalledTimes(1);
        expect(MembershipModel.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                domain: "school",
                learningEmailAttemptedAt: { $exists: false },
            }),
            expect.anything(),
        );
    });
    it("does not send for pending approval, internal invitations or included child memberships", async () => {
        await sendLearningWelcome(
            domain,
            { ...membership, status: Constants.MembershipStatus.PENDING },
            plan,
        );
        await sendLearningWelcome(domain, membership, {
            ...plan,
            internal: true,
        });
        await sendLearningWelcome(
            domain,
            { ...membership, isIncludedInPlan: true },
            plan,
        );
        expect(addMailJob).not.toHaveBeenCalled();
    });
    it("records a delivery failure without revoking learning access or throwing", async () => {
        (addMailJob as jest.Mock).mockRejectedValue(
            new Error("SMTP unavailable"),
        );
        await expect(
            sendLearningWelcome(domain, membership, plan),
        ).resolves.toBeUndefined();
        expect(membership.status).toBe(Constants.MembershipStatus.ACTIVE);
        expect(MembershipModel.updateOne).toHaveBeenCalledWith(
            expect.anything(),
            { $set: { learningEmailFailedAt: expect.any(Date) } },
        );
    });
    it("sends one bundle welcome leading to all enrolled courses", async () => {
        (CommunityModel.findOne as jest.Mock).mockResolvedValue({
            name: "2講座セット",
        });
        await sendLearningWelcome(
            domain,
            {
                ...membership,
                entityType: Constants.MembershipEntityType.COMMUNITY,
            },
            plan,
        );
        expect((addMailJob as jest.Mock).mock.calls[0][0].body).toContain(
            "redirect=%2Fdashboard%2Fmy-content%2Fproducts",
        );
    });
});
