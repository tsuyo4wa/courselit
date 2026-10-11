import { NextRequest, NextResponse } from "next/server";
import { contactContext, deliverContact } from "@/services/contact-form";
import { parseContactInput } from "@/lib/contact-input";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  const reply = (message: string, status: number, id?: string) =>
    NextResponse.json(
      { message, id },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  try {
    const context = await contactContext(req.headers, req);
    if (
      !context ||
      (!context.owner && process.env.CONTACT_FORM_PUBLIC !== "true")
    )
      return reply("現在このフォームは公開前の確認中です。", 403);
    // Only the trusted tenant's canonical host is an allowed browser origin.
    const host = context.domain.customDomain || process.env.DOMAIN;
    if (!host) return reply("受付の準備中です。", 503);
    const origin = req.headers.get("origin");
    if (
      !(context.owner && req.headers.has("x-api-key")) &&
      origin !== `https://${host}` &&
      !(context.owner && origin === `https://${req.headers.get("host")}`)
    )
      return reply("この画面からは送信できません。", 403);
    if (!req.headers.get("content-type")?.startsWith("application/json"))
      return reply("入力内容を確認してください。", 400);
    const length = Number(req.headers.get("content-length") || 0);
    if (length > 20000)
      return reply("お問い合わせは4,000文字以内で入力してください。", 413);
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > 20000)
      return reply("お問い合わせは4,000文字以内で入力してください。", 413);
    let input;
    try {
      input = parseContactInput(JSON.parse(raw));
    } catch {
      return reply("入力内容と情報の取り扱いをご確認ください。", 400);
    }
    const ip =
      req.headers.get("x-forwarded-for")?.split(",").pop()?.trim() || "unknown";
    const result = await deliverContact(
      context.domain,
      input,
      ip,
      context.owner && process.env.CONTACT_FORM_PUBLIC !== "true",
    );
    return reply(result.message, result.status, input.id);
  } catch {
    // Never expose SMTP exceptions, mailbox addresses, form contents or keys.
    return reply("受付の準備中です。時間をおいてお試しください。", 503);
  }
}
