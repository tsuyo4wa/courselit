import {
    localizeCurrencyName,
    localizeUiError,
    checkoutStrings,
    finalUiErrors,
    responses,
} from "@/config/strings";
import currencies from "@/data/currencies.json";

describe("Japanese display without changing stored codes", () => {
    it("uses Japanese currency names and leaves unknown codes intact", () => {
        expect(localizeCurrencyName("jpy")).toBe("日本円");
        expect(localizeCurrencyName("usd")).toBe("米ドル");
        expect(localizeCurrencyName("eur")).toBe("ユーロ");
        expect(localizeCurrencyName("ZZZ")).toBe("ZZZ");
        expect(localizeCurrencyName("bad code")).toBe("BAD CODE");
        for (const currency of currencies) {
            expect(localizeCurrencyName(currency.isoCode)).toMatch(
                /[\u3040-\u30ff\u3400-\u9fff]/,
            );
        }
    });
    it.each([
        ["INVALID_OTP", checkoutStrings.invalidOtp],
        ["OTP_EXPIRED", finalUiErrors.expiredOtp],
        ["TOO_MANY_ATTEMPTS", finalUiErrors.tooManyAttempts],
        ["TOO_MANY_REQUESTS", finalUiErrors.tooManyRequests],
        ["INVALID_EMAIL", finalUiErrors.invalidEmail],
    ])(
        "translates auth code %s without relying on vendor wording",
        (code, expected) => {
            expect(localizeUiError("Vendor detail", undefined, code)).toBe(
                expected,
            );
        },
    );
    it("keeps Japanese feedback and handles missing or unknown provider errors safely", () => {
        expect(localizeUiError("名前を入力してください")).toBe(
            "名前を入力してください",
        );
        expect(localizeUiError("Invalid OTP")).toBe(checkoutStrings.invalidOtp);
        expect(localizeUiError("Unauthorized")).toBe(
            responses.request_not_authenticated,
        );
        expect(localizeUiError("provider internal exception")).toBe(
            responses.internal_error,
        );
        expect(localizeUiError(undefined)).toBe(responses.internal_error);
    });
});
