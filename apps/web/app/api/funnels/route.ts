import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
    funnelContext,
    funnelOrigin,
    requireFunnelManager,
    FunnelError,
} from "@/services/funnel-context";
import { funnelAdminData, mutateFunnel } from "@/services/funnels";
export const dynamic = "force-dynamic";
const response = (data: unknown, status = 200) =>
    NextResponse.json(data, {
        status,
        headers: {
            "Cache-Control": "no-store, private",
            "X-Robots-Tag": "noindex, nofollow",
        },
    });
function failure(e: unknown) {
    return response(
        {
            error:
                e instanceof FunnelError
                    ? e.message
                    : e instanceof z.ZodError
                      ? "入力内容を確認してください。"
                      : (e as any)?.code === 11000
                        ? "このURLは既に使われています。"
                        : "処理を完了できませんでした。再読み込みして保存状態を確認してください。",
        },
        e instanceof FunnelError
            ? e.status
            : e instanceof z.ZodError
              ? 400
              : (e as any)?.code === 11000
                ? 409
                : 503,
    );
}
async function body(req: NextRequest) {
    if (!req.headers.get("content-type")?.startsWith("application/json"))
        throw new FunnelError("入力形式が違います。", 400);
    const reader = req.body?.getReader();
    if (!reader) throw new FunnelError("入力がありません。");
    let length = 0;
    let raw = "";
    const decoder = new TextDecoder();
    for (;;) {
        const part = await reader.read();
        if (part.done) break;
        length += part.value.length;
        if (length > 24000) {
            await reader.cancel();
            throw new FunnelError("入力が長すぎます。", 413);
        }
        raw += decoder.decode(part.value, { stream: true });
    }
    try {
        return JSON.parse(raw + decoder.decode());
    } catch {
        throw new FunnelError("入力を読み込めません。");
    }
}
export async function GET(req: NextRequest) {
    try {
        const c = await funnelContext(req.headers);
        requireFunnelManager(c);
        return response(await funnelAdminData(c));
    } catch (e) {
        return failure(e);
    }
}
export async function POST(req: NextRequest) {
    try {
        const c = await funnelContext(req.headers);
        requireFunnelManager(c);
        funnelOrigin(c, req.headers);
        await mutateFunnel(c, await body(req));
        return response(await funnelAdminData(c));
    } catch (e) {
        return failure(e);
    }
}
