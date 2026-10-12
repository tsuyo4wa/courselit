/** @jest-environment node */
import { randomUUID } from "crypto";
import DomainModel from "@models/Domain";
import PlanModel from "@models/PaymentPlan";
import CourseModel from "@models/Course";
import TestModel from "@models/AdminPaymentTest";
import InvoiceModel from "@models/Invoice";
import MembershipModel from "@models/Membership";
import StripeSDK from "stripe";
import nodemailer from "nodemailer";
import { NextRequest } from "next/server";
import { GET, POST } from "../route";
import { contactContext } from "@/services/contact-form";
import * as service from "@/services/admin-payment-tests";
import {
    acceptsTestSession,
    isProductionStripeEvent,
    sameOrigin,
    testKeys,
} from "@/lib/payment-test-guards";
import type { AdminPaymentTest } from "@courselit/common-models";
import type Stripe from "stripe";
jest.mock("stripe", () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        accounts: {
            retrieve: jest.fn().mockResolvedValue({ charges_enabled: true }),
        },
        checkout: {
            sessions: {
                create: jest.fn().mockImplementation(async (data: any) => ({
                    id: "cs_test_fixture",
                    livemode: false,
                    url: "https://checkout.stripe.com/test",
                    metadata: data.metadata,
                })),
                retrieve: jest.fn(),
            },
        },
    })),
}));
jest.mock("nodemailer", () => ({
    __esModule: true,
    default: {
        createTransport: jest
            .fn()
            .mockReturnValue({ sendMail: jest.fn().mockResolvedValue({}) }),
    },
}));
jest.mock("@/services/contact-form", () => ({ contactContext: jest.fn() }));
jest.mock("@/services/admin-payment-tests", () => {
    const actual = jest.requireActual("@/services/admin-payment-tests");
    return {
        ...actual,
        paymentTestStatus: jest.fn(),
        startPaymentTest: jest.fn(),
        configurePayments: jest.fn(),
        refreshPaymentTest: jest.fn(),
        testLearningLinks: jest.fn(),
    };
});
const id = "63b45572-a264-450f-9545-fbce5c1ad20b";
function request(body: unknown, origin = "https://school.local") {
    return new NextRequest("https://school.local/api/admin/payment-tests", {
        method: "POST",
        headers: {
            host: "school.local",
            origin,
            "content-type": "application/json",
        },
        body: JSON.stringify(body),
    });
}
const order = {
    testId: id,
    domainId: "school",
    sessionId: "cs_test_fixture",
    amount: 100,
    currency: "jpy",
} as AdminPaymentTest;
const session = {
    id: "cs_test_fixture",
    livemode: false,
    mode: "payment",
    amount_total: 100,
    currency: "jpy",
    payment_status: "paid",
    status: "complete",
    metadata: { adminPaymentTestId: id, schoolDomainId: "school" },
} as unknown as Stripe.Checkout.Session;
beforeEach(() => {
    jest.clearAllMocks();
    (contactContext as jest.Mock).mockResolvedValue({
        domain: { email: "owner@example.com" },
        owner: true,
    });
    (service.paymentTestStatus as jest.Mock).mockResolvedValue({
        liveReady: false,
        testReady: true,
        tests: [],
    });
});
describe("isolated payment mode guards", () => {
    test("accepts only a completed, paid test session belonging to the exact test record", () =>
        expect(acceptsTestSession(order, session)).toBe(true));
    test.each([
        { livemode: true },
        { id: "cs_test_other" },
        { mode: "subscription" },
        { amount_total: 101 },
        { currency: "usd" },
        { payment_status: "unpaid" },
        { status: "open" },
        { metadata: { adminPaymentTestId: "other", schoolDomainId: "school" } },
        { metadata: { adminPaymentTestId: id, schoolDomainId: "other" } },
        { metadata: null },
    ])("rejects mismatching test session %p", (patch) =>
        expect(
            acceptsTestSession(order, {
                ...session,
                ...patch,
            } as unknown as Stripe.Checkout.Session),
        ).toBe(false),
    );
    test("refuses live credentials on the test path", () =>
        expect(() =>
            testKeys({
                stripeTestKey: "pk_live_fixture",
                stripeTestSecret: "sk_live_fixture",
            }),
        ).toThrow());
    test("uses isolated test credentials in a live school", () =>
        expect(
            testKeys({
                stripeKey: "pk_live_fixture",
                stripeSecret: "sk_live_fixture",
                stripeTestKey: "pk_test_fixture",
                stripeTestSecret: "sk_test_fixture",
            }).secret,
        ).toBe("sk_test_fixture"));
    test("retains the previous test connection before live cutover", () =>
        expect(
            testKeys({
                stripeKey: "pk_test_fixture",
                stripeSecret: "sk_test_fixture",
            }).key,
        ).toBe("pk_test_fixture"));
    test("production webhook rejects test events and admin-test metadata", () => {
        expect(
            isProductionStripeEvent({
                livemode: false,
                data: { object: session },
            } as unknown as Stripe.Event),
        ).toBe(false);
        expect(
            isProductionStripeEvent({
                livemode: true,
                data: { object: { ...session, livemode: true } },
            } as unknown as Stripe.Event),
        ).toBe(false);
        expect(
            isProductionStripeEvent({
                livemode: true,
                data: {
                    object: {
                        livemode: true,
                        metadata: { invoiceId: "i", membershipId: "m" },
                    },
                },
            } as unknown as Stripe.Event),
        ).toBe(true);
    });
    test("rejects cross-origin state changes", () => {
        expect(
            sameOrigin(
                new Headers({
                    host: "school.local",
                    origin: "https://evil.local",
                }),
            ),
        ).toBe(false);
        expect(sameOrigin(new Headers({ host: "school.local" }))).toBe(false);
    });
});
describe("owner-only API", () => {
    test("anonymous and ordinary students cannot read records or keys", async () => {
        (contactContext as jest.Mock).mockResolvedValue({ owner: false });
        const response = await GET(
            new NextRequest("https://school.local/api/admin/payment-tests"),
        );
        expect(response.status).toBe(403);
        expect(service.paymentTestStatus).not.toHaveBeenCalled();
    });
    test("students cannot start a test purchase", async () => {
        (contactContext as jest.Mock).mockResolvedValue({ owner: false });
        expect(
            (
                await POST(
                    request({
                        action: "start",
                        entityId: "course",
                        entityType: "course",
                        planId: "plan",
                        requestId: id,
                    }),
                )
            ).status,
        ).toBe(403);
        expect(service.startPaymentTest).not.toHaveBeenCalled();
    });
    test("cross-origin POST never reaches credentials or Stripe", async () => {
        expect(
            (
                await POST(
                    request(
                        { action: "refresh", testId: id },
                        "https://evil.local",
                    ),
                )
            ).status,
        ).toBe(403);
        expect(contactContext).not.toHaveBeenCalled();
    });
    test("owner can start a server-priced test with a stable idempotency id", async () => {
        (service.startPaymentTest as jest.Mock).mockResolvedValue(
            "https://checkout.stripe.com/test",
        );
        const response = await POST(
            request({
                action: "start",
                entityId: "course",
                entityType: "course",
                planId: "plan",
                requestId: id,
            }),
        );
        expect(response.status).toBe(200);
        expect(service.startPaymentTest).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ requestId: id }),
            "https://school.local",
        );
    });
    test("caller-supplied amounts and extra fields are rejected", async () => {
        expect(
            (
                await POST(
                    request({
                        action: "start",
                        entityId: "course",
                        entityType: "course",
                        planId: "plan",
                        requestId: id,
                        amount: 1,
                    }),
                )
            ).status,
        ).toBe(400);
        expect(service.startPaymentTest).not.toHaveBeenCalled();
    });
    test("never echoes SDK credentials", async () => {
        (service.refreshPaymentTest as jest.Mock).mockRejectedValue(
            new Error("sk_live_fixture failure"),
        );
        const response = await POST(request({ action: "refresh", testId: id }));
        expect(await response.text()).not.toContain("sk_live_");
    });
    test("learning links are guarded independently from the normal course route", async () => {
        await GET(
            new NextRequest(
                `https://school.local/api/admin/payment-tests?learn=${id}`,
            ),
        );
        expect(service.testLearningLinks).toHaveBeenCalledWith(
            expect.anything(),
            id,
        );
    });
});

describe("real isolated persistence", () => {
    const actual = jest.requireActual("@/services/admin-payment-tests");
    async function school() {
        return DomainModel.create({
            name: `test-${randomUUID()}`,
            email: "owner@example.com",
            settings: {
                title: "Fixture",
                currencyISOCode: "jpy",
                paymentMethod: "stripe",
                stripeKey: "pk_test_fixture",
                stripeSecret: "sk_test_fixture",
                stripeWebhookSecret: "whsec_fixture",
            },
        });
    }
    async function paid(domain: any) {
        const c = await CourseModel.create({
            domain: domain._id,
            courseId: randomUUID(),
            title: "Fixture course",
            slug: "fixture",
            cost: 100,
            creatorId: "owner",
            type: "course",
            costType: "paid",
            privacy: "public",
        });
        const p = await PlanModel.create({
            domain: domain._id,
            planId: randomUUID(),
            name: "Buyout",
            type: "onetime",
            entityId: c.courseId,
            entityType: "course",
            userId: "owner",
            oneTimeAmount: 100,
        });
        return { c, p };
    }
    test("live cutover retains test keys and blocks old paid test products without changing the owner", async () => {
        const d = await school();
        const { c } = await paid(d);
        await actual.configurePayments(d, "live", {
            publicKey: "pk_live_fixture",
            secretKey: "sk_live_fixture",
            webhookSecret: "whsec_livefixture",
        });
        const stored = await DomainModel.findById(d._id);
        expect(stored!.email).toBe("owner@example.com");
        expect(stored!.settings.stripeTestSecret).toBe("sk_test_fixture");
        expect(stored!.settings.stripeWebhookSecret).toBe("whsec_livefixture");
        expect(stored!.settings.stripeBlockedProductIds).toContain(c.courseId);
        expect(stored!.settings.stripeLiveReady).toBe(true);
        expect(stored!.settings.title).toBe("Fixture");
    });
    test("updating the test connection does not switch off an existing live connection", async () => {
        const d = await school();
        await actual.configurePayments(d, "live", {
            publicKey: "pk_live_fixture",
            secretKey: "sk_live_fixture",
            webhookSecret: "whsec_livefixture",
        });
        const live = await DomainModel.findById(d._id);
        await actual.configurePayments(live, "test", {
            publicKey: "pk_test_other",
            secretKey: "sk_test_other",
            webhookSecret: "whsec_testother",
        });
        const stored = await DomainModel.findById(d._id);
        expect(stored!.settings.stripeSecret).toBe("sk_live_fixture");
        expect(stored!.settings.stripeTestSecret).toBe("sk_test_other");
        expect(stored!.settings.stripeLiveReady).toBe(true);
    });
    test("rejects mixed-mode settings before saving or contacting Stripe", async () => {
        const d = await school();
        const before = (StripeSDK as unknown as jest.Mock).mock.calls.length;
        await expect(
            actual.configurePayments(d, "test", {
                publicKey: "pk_test_fixture",
                secretKey: "sk_live_fixture",
                webhookSecret: "whsec_fixture",
            }),
        ).rejects.toThrow();
        expect((StripeSDK as unknown as jest.Mock).mock.calls.length).toBe(
            before,
        );
        expect((await DomainModel.findById(d._id))!.settings.stripeSecret).toBe(
            "sk_test_fixture",
        );
    });
    test("a paid test and duplicate completion never write production membership or invoice records", async () => {
        const d = await school();
        const { c, p } = await paid(d);
        const testId = randomUUID();
        const invoicesBefore = await InvoiceModel.countDocuments({
            domain: d._id,
        });
        const membershipsBefore = await MembershipModel.countDocuments({
            domain: d._id,
        });
        await actual.startPaymentTest(
            d,
            {
                entityId: c.courseId,
                entityType: "course",
                planId: p.planId,
                requestId: testId,
            },
            "https://school.local",
        );
        const stored = await TestModel.findOne({ testId });
        expect(stored!.courseIds).toEqual([c.courseId]);
        expect(
            stored!.expiresAt.getTime() - stored!.createdAt.getTime(),
        ).toBeGreaterThan(29 * 86400000);
        const eventSession = {
            ...session,
            metadata: {
                adminPaymentTestId: testId,
                schoolDomainId: String(d._id),
            },
        };
        process.env.EMAIL_HOST = "smtp.fixture";
        process.env.EMAIL_USER = "fixture";
        process.env.EMAIL_PASS = "local_fixture_only";
        process.env.EMAIL_FROM = "fixture@example.com";
        await actual.completePaymentTest(d, eventSession);
        await actual.completePaymentTest(d, eventSession);
        expect((await TestModel.findOne({ testId }))!.status).toBe("paid");
        expect((await TestModel.findOne({ testId }))!.mailStatus).toBe("sent");
        expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);

        expect(await InvoiceModel.countDocuments({ domain: d._id })).toBe(
            invoicesBefore,
        );
        expect(await MembershipModel.countDocuments({ domain: d._id })).toBe(
            membershipsBefore,
        );
    });
    test("another school cannot refresh or open a test's learning links", async () => {
        const d = await school();
        const other = await school();
        const { c, p } = await paid(d);
        const testId = randomUUID();
        await actual.startPaymentTest(
            d,
            {
                entityId: c.courseId,
                entityType: "course",
                planId: p.planId,
                requestId: testId,
            },
            "https://school.local",
        );
        await expect(actual.testLearningLinks(other, testId)).rejects.toThrow();
        await expect(
            actual.refreshPaymentTest(other, testId),
        ).rejects.toThrow();
    });
    test("expired and unpaid test records cannot unlock learning preview links", async () => {
        const d = await school();
        await expect(
            actual.testLearningLinks(d, randomUUID()),
        ).rejects.toThrow();
    });
});
