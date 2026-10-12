import mongoose, { Model } from "mongoose";
import { AdminPaymentTestSchema } from "@courselit/orm-models";
import type { AdminPaymentTest } from "@courselit/common-models";
export default (mongoose.models.AdminPaymentTest as
    | Model<AdminPaymentTest>
    | undefined) ||
    mongoose.model<AdminPaymentTest>(
        "AdminPaymentTest",
        AdminPaymentTestSchema,
    );
