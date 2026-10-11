import { NextRequest, NextResponse } from "next/server";
import { contactContext } from "@/services/contact-form";
import { policyReviewInput, savePolicyReview } from "@/services/policy-review";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
    const reply = (status: number) =>
        NextResponse.json(
            { ready: status === 200 },
            { status, headers: { "Cache-Control": "no-store" } },
        );
    try {
        const context = await contactContext(req.headers, req);
        if (!context?.owner) return reply(403);
        const origin = req.headers.get("origin");
        const host = context.domain.customDomain || process.env.DOMAIN;
        if (
            !req.headers.has("x-api-key") &&
            origin !== `https://${host}` &&
            origin !== `https://${req.headers.get("host")}`
        )
            return reply(403);
        if (!req.headers.get("content-type")?.startsWith("application/json"))
            return reply(400);
        if (Number(req.headers.get("content-length") || 0) > 128000)
            return reply(413);
        const raw = await req.text();
        if (new TextEncoder().encode(raw).length > 128000) return reply(413);
        let content;
        try {
            content = policyReviewInput.parse(JSON.parse(raw));
        } catch {
            return reply(400);
        }
        await savePolicyReview(context.domain, content);
        return reply(200);
    } catch {
        return reply(503);
    }
}
