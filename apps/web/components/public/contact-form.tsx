"use client";
import { useRef, useState } from "react";
import { contactTopics } from "@/lib/contact-input";
export default function ContactForm({
    privacyHref = "/p/privacy",
}: {
    privacyHref?: "/p/privacy" | "/dashboard/policy-preview#privacy";
}) {
    const id = useRef<string | null>(null);
    const [busy, setBusy] = useState(false),
        [locked, setLocked] = useState(false);
    const [result, setResult] = useState(""),
        [receipt, setReceipt] = useState("");
    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy || locked) return;
        id.current ||= crypto.randomUUID();
        const data = new FormData(event.currentTarget);
        setBusy(true);
        setResult("");
        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: id.current,
                    name: data.get("name"),
                    email: data.get("email"),
                    topic: data.get("topic"),
                    message: data.get("message"),
                    website: data.get("website"),
                    privacyAcknowledged: data.get("privacy") === "on",
                }),
            });
            const json = await response.json();
            setResult(json.message || "送信結果を確認できませんでした。");
            if (json.id) setReceipt(json.id);
            if (
                response.ok ||
                response.status >= 500 ||
                response.status === 409
            )
                setLocked(true);
        } catch {
            setReceipt(id.current);
            setLocked(true);
            setResult(
                "送信結果を確認できませんでした。二重送信を避けるため、再送せず受付番号を控えてください。",
            );
        } finally {
            setBusy(false);
        }
    }
    return (
        <section className="school-contact">
            <style>{`.school-contact{max-width:720px;margin:24px auto;padding:32px;border:1px solid #dce5dc;border-radius:16px;background:#fff;color:#28382f;font:400 16px/1.9 Inter,"Noto Sans JP",-apple-system,Meiryo,sans-serif;overflow-wrap:anywhere}.school-contact h1{font-size:28px;line-height:1.5;margin:0 0 16px;padding-bottom:16px;border-bottom:3px solid #779e68}.school-contact h2{font-size:20px;margin-top:32px}.school-contact p{margin-bottom:20px}.school-contact label{display:block;font-weight:600;margin:18px 0 6px}.school-contact input,.school-contact select,.school-contact textarea{width:100%;padding:11px 12px;background:#fff;border:1px solid #aabaae;border-radius:6px;font:inherit;color:inherit}.school-contact textarea{resize:vertical;min-height:160px}.school-contact .help{font-size:14px;color:#546458;margin-top:8px}.school-contact .check{display:flex;gap:10px;font-weight:400;align-items:flex-start}.school-contact input[type=checkbox]{width:20px;height:20px;margin-top:6px;flex-shrink:0;accent-color:#285c43}.school-contact button{background:#285c43;color:white;padding:12px 26px;border-radius:8px;font:600 16px/1.6 inherit;min-height:48px;margin-top:20px}.school-contact button:disabled{opacity:.65;cursor:default}.school-contact :focus-visible{outline:3px solid #779e68;outline-offset:3px}.school-contact .result{padding:16px;background:#f3f6f1;border-left:3px solid #285c43;margin-top:20px}.school-contact a{color:#285c43;text-decoration:underline;text-underline-offset:3px}.school-contact .trap{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}@media(max-width:600px){.school-contact{padding:24px 16px;margin:16px 0}.school-contact h1{font-size:24px}}`}</style>
            <h1>お問い合わせ</h1>
            <p>
                ログインや受講、登録情報、退会などのご相談を受け付けます。連絡先メールアドレスのご案内を希望される場合も、こちらからお知らせください。
            </p>
            <form onSubmit={submit}>
                <fieldset disabled={busy || locked}>
                    <label htmlFor="contact-name">お名前（任意）</label>
                    <input
                        id="contact-name"
                        name="name"
                        autoComplete="name"
                        maxLength={80}
                    />
                    <label htmlFor="contact-email">
                        返信先メールアドレス（必須）
                    </label>
                    <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        maxLength={254}
                        required
                    />
                    <p className="help">
                        登録済みの方は、スクールに登録したアドレスを入力してください。
                    </p>
                    <label htmlFor="contact-topic">お問い合わせの種類</label>
                    <select id="contact-topic" name="topic">
                        {contactTopics.map((topic) => (
                            <option key={topic}>{topic}</option>
                        ))}
                    </select>
                    <label htmlFor="contact-message">
                        お問い合わせ内容（必須）
                    </label>
                    <textarea
                        id="contact-message"
                        name="message"
                        rows={6}
                        maxLength={4000}
                        required
                    />
                    <p className="help">
                        認証コード・パスワード・カード番号・APIキーは入力しないでください。
                    </p>
                    <div className="trap" aria-hidden="true">
                        <label htmlFor="contact-website">ウェブサイト</label>
                        <input
                            id="contact-website"
                            name="website"
                            tabIndex={-1}
                            autoComplete="off"
                        />
                    </div>
                    <p className="help">
                        入力情報はお問い合わせへの対応と、そのためのメール送信に利用します。送信にはResend（米国で情報を保存）を使用します。この受付によるメルマガ登録はありません。
                    </p>
                    <p className="help">
                        <a
                            href={privacyHref}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            プライバシーポリシーの全文を確認する
                        </a>
                    </p>
                    <label className="check">
                        <input name="privacy" type="checkbox" required />
                        <span>上記の情報の取り扱いを確認しました。</span>
                    </label>
                    <button type="submit">
                        {busy
                            ? "送信中…"
                            : locked
                              ? "送信済み・受付結果をご確認ください"
                              : "お問い合わせを送信する"}
                    </button>
                </fieldset>
            </form>
            {result && (
                <div className="result" role="status">
                    <p>{result}</p>
                    {receipt && <p>受付番号：{receipt}</p>}
                </div>
            )}
            <h2>運営者</h2>
            <p>
                合同会社ワタナベオプト
                <br />
                代表者：渡辺毅
            </p>
        </section>
    );
}
