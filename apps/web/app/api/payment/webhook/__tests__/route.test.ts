/** @jest-environment node */
import type { NextRequest } from "next/server";
import Stripe from "stripe";
import { POST } from "../route";
import { getStripeUnitAmount } from "../../../../../payments-new/stripe-payment";
import DomainModel from "@models/Domain";
import MembershipModel from "@models/Membership";
import PaymentPlanModel from "@models/PaymentPlan";
import InvoiceModel from "@models/Invoice";
import { getPaymentMethod } from "@/payments-new";
import { activateMembership } from "../../helpers";
import { Constants, UIConstants } from "@courselit/common-models";

jest.mock("@models/Domain", () => ({
    __esModule: true,
    default: { findOne: jest.fn() },
}));
jest.mock("@models/Membership", () => ({
    __esModule: true,
    default: { findOne: jest.fn() },
}));
jest.mock("@models/PaymentPlan", () => ({
    __esModule: true,
    default: { findOne: jest.fn() },
}));
jest.mock("@models/Invoice", () => ({
    __esModule: true,
    default: { findOne: jest.fn(), create: jest.fn() },
}));
jest.mock("@/payments-new", () => ({ getPaymentMethod: jest.fn() }));
jest.mock("../../helpers", () => ({ activateMembership: jest.fn() }));
jest.mock("@/services/logger", () => ({ error: jest.fn() }));

const stripe = new Stripe("sk_test_local_fixture_only");
const signingSecret = "whsec_local_fixture_only";
const payload = JSON.stringify({
    id: "evt_local",
    type: "checkout.session.completed",
    data: {
        object: {
            id: "cs_local",
            payment_status: "paid",
            metadata: {
                membershipId: "membership-local",
                invoiceId: "invoice-local",
                currencyISOCode: "jpy",
            },
        },
    },
});
const domain = {
    _id: { toString: () => "domain-local" },
    settings: {
        stripeSecret: "sk_test_local_fixture_only",
        stripeWebhookSecret: signingSecret,
    },
};
let invoiceSave: jest.Mock;
let verify: jest.Mock;
let previousSecret: string | undefined;

function request(body: string, signature?: string): NextRequest {
    const headers = new Headers({ domain: "school.local" });
    if (signature) headers.set("stripe-signature", signature);
    return new Request("https://school.local/api/payment/webhook", {
        method: "POST",
        headers,
        body,
    }) as NextRequest;
}
function sign(body = payload, timestamp = Math.floor(Date.now() / 1000)) {
    return stripe.webhooks.generateTestHeaderString({
        payload: body,
        secret: signingSecret,
        timestamp,
    });
}
function expectNoPaymentWrites() {
    expect(verify).not.toHaveBeenCalled();
    expect(MembershipModel.findOne).not.toHaveBeenCalled();
    expect(invoiceSave).not.toHaveBeenCalled();
    expect(InvoiceModel.create).not.toHaveBeenCalled();
    expect(activateMembership).not.toHaveBeenCalled();
}

beforeEach(() => {
    jest.clearAllMocks();
    previousSecret = process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    domain.settings.stripeWebhookSecret = signingSecret;
    (DomainModel.findOne as jest.Mock).mockResolvedValue(domain);
    (MembershipModel.findOne as jest.Mock).mockResolvedValue({
        membershipId: "membership-local",
        paymentPlanId: "plan-local",
    });
    (PaymentPlanModel.findOne as jest.Mock).mockResolvedValue({
        type: Constants.PaymentPlanType.ONE_TIME,
        oneTimeAmount: 100,
    });
    invoiceSave = jest.fn();
    (InvoiceModel.findOne as jest.Mock).mockResolvedValue({
        save: invoiceSave,
    });
    verify = jest.fn().mockResolvedValue(true);
    (getPaymentMethod as jest.Mock).mockResolvedValue({
        getName: () => UIConstants.PAYMENT_METHOD_STRIPE,
        verify,
        getMetadata: (event: Stripe.Event) =>
            (event.data.object as Stripe.Checkout.Session).metadata,
        getPaymentIdentifier: () => "cs_local",
    });
});
afterEach(() => {
    if (previousSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = previousSecret;
});

describe("Stripe charge amounts", () => {
    test.each([
        [100, "jpy", 100],
        [100, "JPY", 100],
        [10.99, "usd", 1099],
        [0.29, "usd", 29],
        [0, "jpy", 0],
    ])("%s %s is %s minor units", (amount, currency, expected) => {
        expect(getStripeUnitAmount(amount, currency)).toBe(expected);
    });
    test.each([1.5, -1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
        "rejects invalid yen amount %s",
        (amount) => expect(() => getStripeUnitAmount(amount, "jpy")).toThrow(),
    );
    test("rejects unsupported sub-cent amount", () => {
        expect(() => getStripeUnitAmount(1.001, "usd")).toThrow();
    });
});

describe("Stripe webhook signature", () => {
    test("rejects absent configuration before changing membership", async () => {
        domain.settings.stripeWebhookSecret = "";
        expect((await POST(request(payload, sign()))).status).toBe(503);
        expectNoPaymentWrites();
    });
    test("rejects absent signature", async () => {
        expect((await POST(request(payload))).status).toBe(400);
        expectNoPaymentWrites();
    });
    test("rejects forged signature", async () => {
        expect((await POST(request(payload, "t=1,v1=forged"))).status).toBe(
            400,
        );
        expectNoPaymentWrites();
    });
    test("rejects a modified body", async () => {
        expect(
            (
                await POST(
                    request(payload.replace("cs_local", "cs_changed"), sign()),
                )
            ).status,
        ).toBe(400);
        expectNoPaymentWrites();
    });
    test("rejects stale signature", async () => {
        expect(
            (
                await POST(
                    request(
                        payload,
                        sign(payload, Math.floor(Date.now() / 1000) - 600),
                    ),
                )
            ).status,
        ).toBe(400);
        expectNoPaymentWrites();
    });
    test("accepts a valid signature and saves payment before granting access", async () => {
        const response = await POST(request(payload, sign()));
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ message: "success" });
        expect(invoiceSave).toHaveBeenCalledTimes(1);
        expect(activateMembership).toHaveBeenCalledTimes(1);
        expect(invoiceSave.mock.invocationCallOrder[0]).toBeLessThan(
            (activateMembership as jest.Mock).mock.invocationCallOrder[0],
        );
    });
    test("uses the single-school host secret if the school secret is absent", async () => {
        domain.settings.stripeWebhookSecret = "";
        process.env.STRIPE_WEBHOOK_SECRET = signingSecret;
        expect((await POST(request(payload, sign()))).status).toBe(200);
        expect(activateMembership).toHaveBeenCalledTimes(1);
    });
    test("prefers the school secret over a different host secret", async () => {
        process.env.STRIPE_WEBHOOK_SECRET = "whsec_other_fixture";
        expect((await POST(request(payload, sign()))).status).toBe(200);
    });
    test("keeps non-Stripe JSON handling", async () => {
        (getPaymentMethod as jest.Mock).mockResolvedValue({
            getName: () => UIConstants.PAYMENT_METHOD_RAZORPAY,
            verify: jest.fn().mockResolvedValue(false),
        });
        const response = await POST(request(payload));
        expect(await response.json()).toEqual({
            message: "Payment not verified",
        });
        expect(activateMembership).not.toHaveBeenCalled();
    });
});
