import { appointmentText } from "@/config/strings";
import { createHash, createHmac } from "crypto";
import { Transient } from "@models/Appointment";
import { sanitizeEmail } from "./sanitize-email";
export const APPOINTMENT_LOGIN_COOKIE = "__Host-courselit-appointment";
export function appointmentEmailHash(domainId: string, email: string) {
    if (!process.env.AUTH_SECRET)
        throw new Error("Appointment authentication unavailable");
    return createHmac("sha256", process.env.AUTH_SECRET)
        .update(domainId + ":" + sanitizeEmail(email))
        .digest("hex");
}
export function appointmentIntentKey(token: string) {
    return "login-intent:" + createHash("sha256").update(token).digest("hex");
}
export function appointmentIntentCookie(headers?: Headers) {
    const cookies = headers?.get("cookie") || "";
    return cookies
        .split(";")
        .map((v) => v.trim())
        .find((v) => v.startsWith(APPOINTMENT_LOGIN_COOKIE + "="))
        ?.slice(APPOINTMENT_LOGIN_COOKIE.length + 1);
}
// Only new accounts created by the explicit booking OTP flow opt out. Existing
// members keep their preferences; unrelated account creation keeps its defaults.
export async function appointmentSignupSubscribed(
    headers: Headers | undefined,
    domainId: string,
    email: string,
) {
    const token = appointmentIntentCookie(headers);
    if (!token) return true;
    if (!domainId || !/^[A-Za-z0-9_-]{43}$/.test(token))
        throw new Error(appointmentText.loginExpired);
    const record = await Transient.findOneAndDelete({
        key: appointmentIntentKey(token),
        expiresAt: { $gt: new Date() },
        "value.domainId": domainId,
        "value.emailHash": appointmentEmailHash(domainId, email),
    }).lean();
    if (!record) throw new Error(appointmentText.loginExpired);
    return false;
}
