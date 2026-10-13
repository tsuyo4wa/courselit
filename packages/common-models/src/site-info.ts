import { LoginProvider } from "./login-provider";
import { Media } from "./media";
import { PaymentMethod } from "./payment-method";

export default interface SiteInfo {
    title?: string;
    subtitle?: string;
    logo?: Partial<Media>;
    currencyISOCode?: string;
    paymentMethod?: PaymentMethod;
    stripeKey?: string;
    codeInjectionHead?: string;
    codeInjectionBody?: string;
    stripeSecret?: string;
    stripeWebhookSecret?: string;
    stripeTestKey?: string;
    stripeTestSecret?: string;
    stripeTestWebhookSecret?: string;
    stripeLiveReady?: boolean;
    stripeBlockedProductIds?: string[];
    catalogHiddenProductIds?: string[];
    paypalSecret?: string;
    paytmSecret?: string;
    mailingAddress?: string;
    hideCourseLitBranding?: boolean;
    blogEnabled?: boolean;
    razorpayKey?: string;
    razorpaySecret?: string;
    razorpayWebhookSecret?: string;
    lemonsqueezyKey?: string;
    lemonsqueezyStoreId?: string;
    lemonsqueezyOneTimeVariantId?: string;
    lemonsqueezySubscriptionMonthlyVariantId?: string;
    lemonsqueezySubscriptionYearlyVariantId?: string;
    lemonsqueezyWebhookSecret?: string;
    logins?: LoginProvider[];
    ssoTrustedDomain?: string;
}

export interface GeneralSchoolSettings {
    title: string;
    subtitle: string;
    hideCourseLitBranding: boolean;
    blogEnabled: boolean;
}

export interface LaunchReviewPageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}
