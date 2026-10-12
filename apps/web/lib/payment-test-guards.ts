import type { AdminPaymentTest, SiteInfo } from "@courselit/common-models";
import type Stripe from "stripe";
export function testKeys(settings: SiteInfo) {
    const key =
        settings.stripeTestKey ||
        (settings.stripeKey?.startsWith("pk_test_") ? settings.stripeKey : "");
    const secret =
        settings.stripeTestSecret ||
        (settings.stripeSecret?.startsWith("sk_test_")
            ? settings.stripeSecret
            : "");
    if (!key?.startsWith("pk_test_") || !secret?.startsWith("sk_test_"))
        throw new Error("テスト用のStripe接続を設定してください。");
    return { key, secret };
}
export function acceptsTestSession(
    order: AdminPaymentTest,
    session: Stripe.Checkout.Session,
): boolean {
    return (
        session.livemode === false &&
        session.mode === "payment" &&
        session.id === order.sessionId &&
        session.metadata?.adminPaymentTestId === order.testId &&
        session.metadata?.schoolDomainId === order.domainId &&
        session.amount_total === order.amount &&
        session.currency === order.currency &&
        session.payment_status === "paid" &&
        session.status === "complete"
    );
}
export function isProductionStripeEvent(event: Stripe.Event): boolean {
    const session = event.data.object as Stripe.Checkout.Session;
    return (
        event.livemode === true &&
        session.livemode === true &&
        !session.metadata?.adminPaymentTestId
    );
}
export function sameOrigin(headers: Headers): boolean {
    const host = headers.get("host");
    return !!host && headers.get("origin") === `https://${host}`;
}
