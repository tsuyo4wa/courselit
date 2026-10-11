import { createHmac } from "crypto";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import DomainModel from "@models/Domain";
import UserModel from "@models/User";
import { auth } from "@/auth";
import { validatePublicApiRequest } from "@/app/api/public-api";
import { ContactInput, htmlEscape } from "@/lib/contact-input";
import type { NextRequest } from "next/server";

export async function contactContext(headers: Headers, req?: NextRequest) {
  const domain = await DomainModel.findOne({ name: headers.get("domain") });
  if (!domain) return null;
  let owner = false;
  if (req && headers.has("x-api-key")) {
    const result = await validatePublicApiRequest(req);
    owner = !result.error;
  } else {
    const session = await auth.api.getSession({ headers });
    owner = !!(
      session?.user?.email === domain.email &&
      (await UserModel.exists({
        domain: domain._id,
        email: domain.email,
        active: true,
      }))
    );
  }
  return { domain, owner };
}
let indexes: Promise<unknown> | undefined;
function database() {
  if (!mongoose.connection.db) throw new Error("Database unavailable");
  return mongoose.connection.db;
}
async function stores() {
  const db = database();
  indexes ||= Promise.all([
    db
      .collection("contact_receipts")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db
      .collection("contact_limits")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]).catch((e) => {
    indexes = undefined;
    throw e;
  });
  await indexes;
  return {
    receipts: db.collection<any>("contact_receipts"),
    limits: db.collection<any>("contact_limits"),
  };
}
export async function deliverContact(
  domain: any,
  input: ContactInput,
  ip: string,
  preview = false,
) {
  const key = process.env.AUTH_SECRET;
  const from = process.env.EMAIL_FROM;
  const recipient = process.env.CONTACT_TO || domain.email;
  if (
    !key ||
    !from ||
    !recipient ||
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  )
    throw new Error("Mail unavailable");
  const hash = (s: string) => createHmac("sha256", key).update(s).digest("hex");
  const payloadHash = hash(JSON.stringify(input));
  const id = `${domain._id}:${input.id}`;
  const { receipts, limits } = await stores();
  const previous = await receipts.findOne({ _id: id });
  if (previous) return receiptResult(previous, payloadHash);
  const hour = Math.floor(Date.now() / 3600000);
  for (const [scope, max] of [
    ["all", 120],
    [`ip:${hash(ip)}`, 10],
    [`email:${hash(input.email)}`, 3],
  ] as const) {
    const count = await limits.findOneAndUpdate(
      { _id: `${domain._id}:${hour}:${scope}` },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt: new Date((hour + 2) * 3600000) },
      },
      { upsert: true, returnDocument: "after" },
    );
    if (count.count > max)
      return {
        status: 429,
        message: "送信回数が多いため、時間をおいてお試しください。",
      };
  }
  try {
    await receipts.insertOne({
      _id: id,
      payloadHash,
      state: "sending",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 86400000),
    });
  } catch (e: any) {
    if (e.code === 11000)
      return receiptResult(await receipts.findOne({ _id: id }), payloadHash);
    throw e;
  }
  const port = Number(process.env.EMAIL_PORT || 587);
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    connectionTimeout: 10000,
    socketTimeout: 20000,
  });
  const ref = input.id;
  try {
    const sent = await transport.sendMail({
      from,
      to: preview ? Array.from(new Set([recipient, domain.email])) : recipient,
      replyTo: input.email,
      subject: `【スクールお問い合わせ】${input.topic} [${ref}]`,
      text: `受付番号：${ref}\nお名前：${input.name || "未入力"}\n返信先：${input.email}\n種類：${input.topic}\n\n${input.message}\n\nこのメールへの返信でお問い合わせ者へ返答できます。`,
      html: `<p>受付番号：${ref}</p><p>お名前：${htmlEscape(input.name || "未入力")}<br>返信先：${htmlEscape(input.email)}<br>種類：${htmlEscape(input.topic)}</p><div style="white-space:pre-wrap">${htmlEscape(input.message)}</div><p>このメールへの返信でお問い合わせ者へ返答できます。</p>`,
    });
    if (!sent.accepted?.length || sent.rejected?.length)
      throw new Error("Notification not accepted");
    await receipts.updateOne({ _id: id }, { $set: { state: "notified" } });
  } catch {
    // SMTP outcome may be uncertain; do not automatically send again.
    await receipts.updateOne(
      { _id: id },
      { $set: { state: "review_required" } },
    );
    transport.close();
    return {
      status: 503,
      message: `送信結果を確認できませんでした。受付番号 ${ref} を控え、再送せず運営者にご確認ください。`,
    };
  }
  try {
    const sent = await transport.sendMail({
      from,
      to: input.email,
      replyTo: recipient,
      subject: `【なまけものスクール】お問い合わせを受け付けました [${ref}]`,
      text: `お問い合わせを受け付けました。\n受付番号：${ref}\n種類：${input.topic}\n\n内容を確認し、担当者から返信します。認証コード・パスワード・カード番号は送らないでください。\nこの受付によるメルマガ登録はありません。\n\nなまけものスクール`,
      html: `<p>お問い合わせを受け付けました。</p><p>受付番号：${ref}<br>種類：${htmlEscape(input.topic)}</p><p>内容を確認し、担当者から返信します。</p><p>認証コード・パスワード・カード番号は送らないでください。この受付によるメルマガ登録はありません。</p><p>なまけものスクール</p>`,
    });
    if (!sent.accepted?.length || sent.rejected?.length)
      throw new Error("Receipt not accepted");
    await receipts.updateOne({ _id: id }, { $set: { state: "complete" } });
  } catch {
    await receipts.updateOne(
      { _id: id },
      { $set: { state: "receipt_failed" } },
    );
  } finally {
    transport.close();
  }
  return receiptResult(await receipts.findOne({ _id: id }), payloadHash);
}
function receiptResult(record: any, hash: string) {
  if (!record || record.payloadHash !== hash)
    return {
      status: 409,
      message: "入力内容が変わりました。ページを開き直してください。",
    };
  if (record.state === "complete")
    return {
      status: 200,
      message: "お問い合わせを受け付けました。受付メールをご確認ください。",
    };
  if (["notified", "receipt_failed"].includes(record.state))
    return {
      status: 202,
      message:
        "お問い合わせは受け付けました。受付メールの送信は確認できていませんが、再送は不要です。",
    };
  return {
    status: 409,
    message:
      "送信結果を確認中です。二重送信を避けるため、再送せず受付番号を控えてください。",
  };
}
