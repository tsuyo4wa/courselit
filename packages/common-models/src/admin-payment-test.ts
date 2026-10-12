export interface AdminPaymentTest {
    testId: string;
    domainId: string;
    ownerEmail: string;
    entityId: string;
    entityType: "course" | "community";
    title: string;
    planId: string;
    amount: number;
    currency: string;
    courseIds: string[];
    sessionId?: string;
    checkoutUrl?: string;
    status: "pending" | "paid";
    mailStatus: "pending" | "sending" | "sent" | "failed";
    origin: string;
    createdAt: Date;
    expiresAt: Date;
}
export interface PaymentTestSettingsInput {
    publicKey: string;
    secretKey: string;
    webhookSecret: string;
}
export interface PaymentTestProduct {
    id: string;
    type: "course" | "community";
    title: string;
    plans: PaymentTestPlan[];
}
export interface PaymentTestStatus {
    currency: string;
    liveReady: boolean;
    testReady: boolean;
    connections: Record<
        "live" | "test",
        Record<keyof PaymentTestSettingsInput, boolean>
    >;
    blockedProducts: string[];
    products: PaymentTestProduct[];
    tests: AdminPaymentTest[];
}

export interface PaymentTestPlan {
    id: string;
    title: string;
    amount: number;
}
export interface PaymentTestLearningLink {
    title: string;
    url: string;
}
export interface AdminPaymentConnectionProps {
    mode: "live" | "test";
    status?: PaymentTestStatus["connections"]["live"];
    ready?: boolean;
    onSaved: () => void;
}
