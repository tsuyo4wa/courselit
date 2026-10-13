import { NextRequest, NextResponse } from "next/server";
import { contactContext } from "@/services/contact-form";
import {
    getLaunchReview,
    launchReviewInput,
    saveLaunchReview,
} from "@/services/launch-review";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
    try {
        const context = await contactContext(req.headers, req);
        if (!context?.owner) return reply(403);
        const review = await getLaunchReview(context.domain);
        return NextResponse.json(
            {
                ready: !!review,
                revision: review?.revision || null,
                hiddenProductIds:
                    context.domain.settings?.catalogHiddenProductIds || [],
            },
            { headers: { "Cache-Control": "no-store" } },
        );
    } catch {
        return reply(503);
    }
}
function reply(status: number) {
    return NextResponse.json(
        { ready: status === 200 },
        { status, headers: { "Cache-Control": "no-store" } },
    );
}
export async function POST(req: NextRequest) {
    try {
        const context = await contactContext(req.headers, req);
        if (!context?.owner) return reply(403);
        const origin = req.headers.get("origin");
        if (
            !req.headers.has("x-api-key") &&
            origin !==
                `https://${context.domain.customDomain || process.env.DOMAIN}` &&
            origin !== `https://${req.headers.get("host")}`
        )
            return reply(403);
        if (!req.headers.get("content-type")?.startsWith("application/json"))
            return reply(400);
        if (Number(req.headers.get("content-length") || 0) > 180000)
            return reply(413);
        const raw = await req.text();
        if (new TextEncoder().encode(raw).length > 180000) return reply(413);
        let data;
        try {
            data = JSON.parse(raw);
        } catch {
            return reply(400);
        }
        const parsed = launchReviewInput.safeParse(data);
        if (!parsed.success) return reply(400);
        await saveLaunchReview(context.domain, parsed.data);
        return reply(200);
    } catch {
        return reply(503);
    }
}
