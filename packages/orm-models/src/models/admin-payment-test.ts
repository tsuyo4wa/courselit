import mongoose from "mongoose";
import type { AdminPaymentTest } from "@courselit/common-models";
export const AdminPaymentTestSchema = new mongoose.Schema<AdminPaymentTest>({
    testId: { type: String, required: true, unique: true },
    domainId: { type: String, required: true, index: true },
    ownerEmail: { type: String, required: true },
    entityId: { type: String, required: true },
    entityType: { type: String, enum: ["course", "community"], required: true },
    title: { type: String, required: true },
    planId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    courseIds: { type: [String], default: [] },
    sessionId: { type: String },
    checkoutUrl: { type: String },
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
    mailStatus: {
        type: String,
        enum: ["pending", "sending", "sent", "failed"],
        default: "pending",
    },
    origin: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
});
// Isolated test records and their preview access expire after 30 days.
AdminPaymentTestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
AdminPaymentTestSchema.index({ domainId: 1, ownerEmail: 1, createdAt: -1 });
