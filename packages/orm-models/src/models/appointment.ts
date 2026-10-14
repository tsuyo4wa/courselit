import mongoose from "mongoose";
import type {
    AppointmentSettings,
    AppointmentBooking,
    AppointmentTransient,
} from "@courselit/common-models";
export const AppointmentSettingsSchema =
    new mongoose.Schema<AppointmentSettings>({
        domainId: { type: String, required: true, unique: true },
        config: { type: mongoose.Schema.Types.Mixed, required: true },
        clientId: { type: String, default: "" },
        secret: { type: String, default: "" },
        refresh: { type: String, default: "" },
        account: { type: String, default: "" },
        checkedAt: Date,
        updatedAt: { type: Date, default: Date.now },
    });
export const AppointmentBookingSchema = new mongoose.Schema<AppointmentBooking>(
    {
        bookingId: { type: String, required: true, unique: true },
        domainId: { type: String, required: true, index: true },
        userId: { type: String, required: true },
        email: { type: String, required: true },
        name: { type: String, required: true },
        notes: { type: String, default: "" },
        preview: { type: Boolean, required: true },
        start: { type: String, required: true },
        end: { type: String, required: true },
        holds: {
            type: [{ start: String, end: String, _id: false }],
            default: [],
        },
        status: { type: String, required: true },
        operation: { type: String, required: true },
        proposedStart: String,
        proposedEnd: String,
        calendarId: { type: String, required: true },
        eventId: { type: String, required: true },
        version: { type: Number, required: true },
        idempotencyKey: { type: String, required: true },
        requestHash: { type: String, required: true },
        origin: { type: String, required: true },
        mailState: { type: String, default: "not_sent" },
        mailVersion: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
);
AppointmentBookingSchema.index(
    { domainId: 1, userId: 1, idempotencyKey: 1 },
    { unique: true },
);
AppointmentBookingSchema.index({
    domainId: 1,
    "holds.start": 1,
    "holds.end": 1,
});
// Bookings are retained until deliberate operator cleanup after Google cancellation.
// Never TTL-delete unresolved reservations, which could release a live Google appointment.
export const AppointmentTransientSchema =
    new mongoose.Schema<AppointmentTransient>({
        key: { type: String, unique: true, required: true },
        value: mongoose.Schema.Types.Mixed,
        expiresAt: { type: Date, required: true },
    });
AppointmentTransientSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
