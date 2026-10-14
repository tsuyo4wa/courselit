import mongoose from "mongoose";
import {
    AppointmentSettingsSchema,
    AppointmentBookingSchema,
    AppointmentTransientSchema,
} from "@courselit/orm-models";
import type {
    AppointmentSettings,
    AppointmentBooking,
    AppointmentTransient,
} from "@courselit/common-models";
export const Settings =
    (mongoose.models
        .AppointmentSettings as mongoose.Model<AppointmentSettings>) ||
    mongoose.model<AppointmentSettings>(
        "AppointmentSettings",
        AppointmentSettingsSchema,
    );
export const Bookings =
    (mongoose.models
        .AppointmentBooking as mongoose.Model<AppointmentBooking>) ||
    mongoose.model<AppointmentBooking>(
        "AppointmentBooking",
        AppointmentBookingSchema,
    );
export const Transient =
    (mongoose.models
        .AppointmentTransient as mongoose.Model<AppointmentTransient>) ||
    mongoose.model<AppointmentTransient>(
        "AppointmentTransient",
        AppointmentTransientSchema,
    );
