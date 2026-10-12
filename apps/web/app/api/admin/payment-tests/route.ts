import { NextRequest, NextResponse } from "next/server";
import { contactContext } from "@/services/contact-form";
import { sameOrigin } from "@/lib/payment-test-guards";
import {
    configurePayments,
    configureTestInput,
    paymentTestStatus,
    refreshPaymentTest,
    startPaymentTest,
    startTestInput,
    testLearningLinks,
} from "@/services/admin-payment-tests";
import { z } from "zod";
export const runtime = "nodejs";
const actionInput = z.discriminatedUnion("action", [
    startTestInput.extend({ action: z.literal("start") }),
    configureTestInput.extend({ action: z.literal("configure") }),
    z
        .object({ action: z.literal("refresh"), testId: z.string().uuid() })
        .strict(),
]);
const reply = (data: unknown, status = 200) =>
    NextResponse.json(data, {
        status,
        headers: { "Cache-Control": "no-store" },
    });
export async function GET(req: NextRequest) {
    const ctx = await contactContext(req.headers);
    if (!ctx?.owner) return reply({ error: "管理者専用です。" }, 403);
    try {
        const testId = req.nextUrl.searchParams.get("learn");
        return reply(
            testId
                ? {
                      links: await testLearningLinks(
                          ctx.domain,
                          z.string().uuid().parse(testId),
                      ),
                  }
                : await paymentTestStatus(ctx.domain),
        );
    } catch {
        return reply({ error: "試験記録を取得できませんでした。" }, 400);
    }
}
export async function POST(req: NextRequest) {
    if (!sameOrigin(req.headers))
        return reply({ error: "操作元を確認できませんでした。" }, 403);
    const ctx = await contactContext(req.headers);
    if (!ctx?.owner) return reply({ error: "管理者専用です。" }, 403);
    try {
        if (!req.headers.get("content-type")?.startsWith("application/json"))
            return reply({ error: "入力を確認してください。" }, 400);
        const raw = await req.text();
        if (raw.length > 4000)
            return reply({ error: "入力が長すぎます。" }, 413);
        const data = actionInput.parse(JSON.parse(raw));
        if (data.action === "start")
            return reply({
                url: await startPaymentTest(
                    ctx.domain,
                    data,
                    req.headers.get("origin")!,
                ),
            });
        if (data.action === "configure")
            await configurePayments(ctx.domain, data.mode, data);
        else await refreshPaymentTest(ctx.domain, data.testId);
        return reply({ saved: true });
    } catch (e) {
        // Never return SDK errors containing requests or credentials to the browser.
        const known =
            e instanceof Error &&
            !e.message.includes("key") &&
            !e.message.includes("sk_") &&
            /[ぁ-んァ-ヶ一-龯]/.test(e.message);
        return reply(
            {
                error: known
                    ? (e as Error).message
                    : "接続または入力を確認してください。",
            },
            400,
        );
    }
}
