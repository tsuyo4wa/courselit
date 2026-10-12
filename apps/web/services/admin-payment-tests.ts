import Stripe from "stripe";
import nodemailer from "nodemailer";
import { z } from "zod";
import type {
    AdminPaymentTest,
    PaymentTestSettingsInput,
    PaymentTestStatus,
    PaymentTestProduct,
} from "@courselit/common-models";
import { Constants, UIConstants } from "@courselit/common-models";
import type { Domain } from "@models/Domain";
import DomainModel from "@models/Domain";
import TestModel from "@models/AdminPaymentTest";
import CourseModel from "@models/Course";
import CommunityModel from "@models/Community";
import PaymentPlanModel from "@models/PaymentPlan";
import { invalidateDomainCache } from "@/lib/domain-cache";
import { getStripeUnitAmount } from "../payments-new/stripe-payment";
import {
    acceptsTestSession,
    testKeys,
    paymentConnectionStatus,
} from "@/lib/payment-test-guards";
export const startTestInput = z
    .object({
        entityId: z.string().min(1).max(100),
        entityType: z.enum(["course", "community"]),
        planId: z.string().min(1).max(100),
        requestId: z.string().uuid(),
    })
    .strict();
export const configureTestInput = z
    .object({
        mode: z.enum(["live", "test"]),
        publicKey: z.string().min(10).max(300),
        secretKey: z.string().min(10).max(300),
        webhookSecret: z
            .string()
            .regex(/^whsec_[A-Za-z0-9]+$/)
            .max(300),
    })
    .strict();
export async function configurePayments(
    domain: Domain,
    mode: "live" | "test",
    input: PaymentTestSettingsInput,
) {
    const prefix = mode === "live" ? "live" : "test";
    if (
        !input.publicKey.startsWith(`pk_${prefix}_`) ||
        !input.secretKey.startsWith(`sk_${prefix}_`)
    )
        throw new Error("公開キーとシークレットキーの環境が一致していません。");
    const stripe = new Stripe(input.secretKey);
    const account = await stripe.accounts.retrieve();
    if (mode === "live" && !account.charges_enabled)
        throw new Error("Stripeアカウントで本番決済を有効にしてください。");
    if (mode === "test") {
        domain.settings.stripeTestKey = input.publicKey;
        domain.settings.stripeTestSecret = input.secretKey;
        domain.settings.stripeTestWebhookSecret = input.webhookSecret;
    } else {
        const settings = domain.settings;
        // Preserve the currently working test connection inside the same school.
        if (
            !settings.stripeTestSecret &&
            settings.stripeSecret?.startsWith("sk_test_")
        ) {
            settings.stripeTestKey = settings.stripeKey;
            settings.stripeTestSecret = settings.stripeSecret;
            settings.stripeTestWebhookSecret =
                settings.stripeWebhookSecret ||
                process.env.STRIPE_WEBHOOK_SECRET;
        }
        if (!settings.stripeLiveReady) {
            // Existing paid test products must never silently start charging real money.
            const paid = await PaymentPlanModel.find({
                domain: domain._id,
                archived: false,
                type: { $ne: Constants.PaymentPlanType.FREE },
            })
                .select("entityId")
                .lean();
            settings.stripeBlockedProductIds = Array.from(
                new Set<string>(paid.map((x) => x.entityId)),
            );
        }
        settings.stripeKey = input.publicKey;
        settings.stripeSecret = input.secretKey;
        settings.stripeWebhookSecret = input.webhookSecret;
        settings.stripeLiveReady = true;
        settings.paymentMethod = UIConstants.PAYMENT_METHOD_STRIPE;
    }
    const fields =
        mode === "test"
            ? ["stripeTestKey", "stripeTestSecret", "stripeTestWebhookSecret"]
            : [
                  "stripeKey",
                  "stripeSecret",
                  "stripeWebhookSecret",
                  "stripeTestKey",
                  "stripeTestSecret",
                  "stripeTestWebhookSecret",
                  "stripeLiveReady",
                  "stripeBlockedProductIds",
                  "paymentMethod",
              ];
    const updated = await DomainModel.updateOne(
        { _id: domain._id, email: domain.email, deleted: false },
        {
            $set: Object.fromEntries(
                fields
                    .filter(
                        (key) => (domain.settings as any)[key] !== undefined,
                    )
                    .map((key) => [
                        `settings.${key}`,
                        (domain.settings as any)[key],
                    ]),
            ),
        },
    );
    if (updated.matchedCount !== 1)
        throw new Error("スクール設定を保存できませんでした。");
    invalidateDomainCache(domain.name);
}
export async function paymentTestStatus(
    domain: Domain,
): Promise<PaymentTestStatus> {
    const products: PaymentTestProduct[] = [];
    const plans = await PaymentPlanModel.find({
        domain: domain._id,
        archived: false,
        type: Constants.PaymentPlanType.ONE_TIME,
        oneTimeAmount: { $gt: 0 },
    }).lean();
    for (const type of ["course", "community"] as const) {
        const entities =
            type === "course"
                ? await CourseModel.find({ domain: domain._id }).lean()
                : await CommunityModel.find({ domain: domain._id }).lean();
        for (const entity of entities) {
            const id =
                type === "course"
                    ? (entity as any).courseId
                    : (entity as any).communityId;
            const entityPlans = plans.filter(
                (p) => p.entityId === id && p.entityType === type,
            );
            if (
                entityPlans.length &&
                (type !== "course" ||
                    (entity as any).type !== Constants.CourseType.BLOG)
            )
                products.push({
                    id,
                    type,
                    title: (entity as any).title || (entity as any).name,
                    plans: entityPlans.map((p) => ({
                        id: p.planId,
                        title: p.name,
                        amount: p.oneTimeAmount!,
                    })),
                });
        }
    }
    let testReady = false;
    try {
        testKeys(domain.settings);
        testReady = true;
    } catch {
        /* readiness only */
    }
    const tests = await TestModel.find({
        domainId: String(domain._id),
        ownerEmail: domain.email,
        expiresAt: { $gt: new Date() },
    })
        .sort({ createdAt: -1 })
        .limit(25)
        .lean();
    return {
        currency: domain.settings.currencyISOCode || "JPY",
        liveReady:
            domain.settings.stripeLiveReady === true &&
            !!domain.settings.stripeKey?.startsWith("pk_live_") &&
            !!domain.settings.stripeSecret?.startsWith("sk_live_") &&
            !!domain.settings.stripeWebhookSecret,
        testReady,
        connections: paymentConnectionStatus(
            domain.settings,
            process.env.STRIPE_WEBHOOK_SECRET,
        ),
        blockedProducts: domain.settings.stripeBlockedProductIds || [],
        products,
        tests: tests as AdminPaymentTest[],
    };
}
export async function startPaymentTest(
    domain: Domain,
    input: z.infer<typeof startTestInput>,
    origin: string,
) {
    const { secret } = testKeys(domain.settings);
    const previous = await TestModel.findOne({
        testId: input.requestId,
        domainId: String(domain._id),
        ownerEmail: domain.email,
    });
    if (previous?.checkoutUrl) return previous.checkoutUrl;
    if (previous)
        throw new Error(
            "この試験は受付済みです。履歴から結果を確認してください。",
        );
    if (
        (await TestModel.countDocuments({
            domainId: String(domain._id),
            createdAt: { $gt: new Date(Date.now() - 3600000) },
        })) >= 10
    )
        throw new Error("1時間あたりの試験回数に達しました。");
    const plan = await PaymentPlanModel.findOne({
        domain: domain._id,
        planId: input.planId,
        entityId: input.entityId,
        entityType: input.entityType,
        archived: false,
        type: Constants.PaymentPlanType.ONE_TIME,
    });
    if (!plan?.oneTimeAmount || plan.oneTimeAmount <= 0)
        throw new Error("買い切りの有料プランを選択してください。");
    const entity =
        input.entityType === "course"
            ? await CourseModel.findOne({
                  domain: domain._id,
                  courseId: input.entityId,
                  type: { $ne: Constants.CourseType.BLOG },
              })
            : await CommunityModel.findOne({
                  domain: domain._id,
                  communityId: input.entityId,
              });
    if (!entity) throw new Error("商品が見つかりません。");
    const currency = domain.settings.currencyISOCode?.toLowerCase();
    if (!currency) throw new Error("決済通貨を設定してください。");
    const included =
        input.entityType === "course"
            ? [input.entityId]
            : plan.includedProducts || [];
    const available = await CourseModel.find({
        domain: domain._id,
        courseId: { $in: included },
        type: { $ne: Constants.CourseType.BLOG },
    })
        .select("courseId")
        .lean();
    if (available.length !== included.length)
        throw new Error("同梱講座の設定を確認してください。");
    const amount = getStripeUnitAmount(plan.oneTimeAmount, currency);
    await TestModel.createIndexes();
    const order = await TestModel.create({
        testId: input.requestId,
        domainId: String(domain._id),
        ownerEmail: domain.email,
        entityId: input.entityId,
        entityType: input.entityType,
        title: (entity as any).title || (entity as any).name,
        planId: plan.planId,
        amount,
        currency,
        courseIds: available.map((x) => x.courseId),
        status: "pending",
        mailStatus: "pending",
        origin,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 86400000),
    });
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create(
        {
            mode: "payment",
            payment_method_types: ["card"],
            locale: "ja",
            customer_email: domain.email,
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency,
                        unit_amount: amount,
                        product_data: { name: `【テスト】${order.title}` },
                    },
                },
            ],
            metadata: {
                adminPaymentTestId: order.testId,
                schoolDomainId: String(domain._id),
            },
            success_url: `${origin}/dashboard/payment-tests?testId=${order.testId}`,
            cancel_url: `${origin}/dashboard/payment-tests?testId=${order.testId}`,
        },
        { idempotencyKey: `school-admin-test-${order.testId}` },
    );
    if (
        session.livemode !== false ||
        !session.url ||
        !session.id.startsWith("cs_test_")
    )
        throw new Error("テスト環境の決済を確認できませんでした。");
    order.sessionId = session.id;
    order.checkoutUrl = session.url;
    await order.save();
    return session.url;
}
export async function completePaymentTest(
    domain: Domain,
    session: Stripe.Checkout.Session,
) {
    const order = await TestModel.findOne({
        domainId: String(domain._id),
        ownerEmail: domain.email,
        testId: session.metadata?.adminPaymentTestId,
        expiresAt: { $gt: new Date() },
    });
    if (!order || !acceptsTestSession(order, session)) return false;
    await TestModel.updateOne(
        {
            testId: order.testId,
            domainId: String(domain._id),
            status: "pending",
        },
        { $set: { status: "paid" } },
    );
    const claimed = await TestModel.findOneAndUpdate(
        {
            testId: order.testId,
            domainId: String(domain._id),
            mailStatus: "pending",
        },
        { $set: { mailStatus: "sending" } },
    );
    if (claimed) {
        try {
            if (
                !process.env.EMAIL_HOST ||
                !process.env.EMAIL_USER ||
                !process.env.EMAIL_PASS ||
                !process.env.EMAIL_FROM
            )
                throw new Error("Mail unavailable");
            const port = Number(process.env.EMAIL_PORT || 587);
            const mail = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port,
                secure: port === 465,
                requireTLS: port !== 465,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                connectionTimeout: 10000,
                socketTimeout: 20000,
            });
            await mail.sendMail({
                from: process.env.EMAIL_FROM,
                to: domain.email,
                subject: `【テスト購入】${order.title}`,
                text: `管理者専用のテスト購入を確認しました。実際の請求・本番の売上・受講権限の変更はありません。

商品：${order.title}
試験番号：${order.testId}
試験結果・学習プレビュー：${order.origin}/dashboard/payment-tests?testId=${order.testId}

この記録は30日で期限切れになります。`,
            });
            await TestModel.updateOne(
                { testId: order.testId, domainId: String(domain._id) },
                { $set: { mailStatus: "sent" } },
            );
        } catch {
            await TestModel.updateOne(
                { testId: order.testId, domainId: String(domain._id) },
                { $set: { mailStatus: "failed" } },
            );
        }
    }
    return true;
}
export async function refreshPaymentTest(domain: Domain, testId: string) {
    const order = await TestModel.findOne({
        domainId: String(domain._id),
        ownerEmail: domain.email,
        testId,
        expiresAt: { $gt: new Date() },
    });
    if (!order?.sessionId) throw new Error("試験記録が見つかりません。");
    const { secret } = testKeys(domain.settings);
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.retrieve(order.sessionId);
    await completePaymentTest(domain, session);
}
export async function signedTestEvent(
    domain: Domain,
    raw: string,
    signature: string,
) {
    const secret =
        domain.settings.stripeTestWebhookSecret ||
        (domain.settings.stripeSecret?.startsWith("sk_test_")
            ? domain.settings.stripeWebhookSecret ||
              process.env.STRIPE_WEBHOOK_SECRET
            : undefined);
    if (!secret) return false;
    let stripe: Stripe;
    try {
        stripe = new Stripe(testKeys(domain.settings).secret);
    } catch {
        return false;
    }
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(raw, signature, secret);
    } catch {
        return false;
    }
    if (event.livemode !== false) return false;
    if (
        event.type === "checkout.session.completed" &&
        (event.data.object as Stripe.Checkout.Session).metadata
            ?.adminPaymentTestId
    )
        await completePaymentTest(
            domain,
            event.data.object as Stripe.Checkout.Session,
        );
    return true;
}
export async function testLearningLinks(domain: Domain, testId: string) {
    const order = await TestModel.findOne({
        domainId: String(domain._id),
        ownerEmail: domain.email,
        testId,
        status: "paid",
        expiresAt: { $gt: new Date() },
    });
    if (!order) throw new Error("決済確認済みの試験記録がありません。");
    const courses = await CourseModel.find({
        domain: domain._id,
        courseId: { $in: order.courseIds },
        type: { $ne: Constants.CourseType.BLOG },
    }).lean();
    return courses.map((c) => ({
        title: c.title,
        url: `/course/${c.slug}/${c.courseId}?preview=true&returnTo=${encodeURIComponent(`/dashboard/payment-tests?testId=${testId}`)}`,
    }));
}
