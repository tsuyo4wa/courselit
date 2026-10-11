import Link from "next/link";
import type { ReactNode } from "react";
import {
    POLICY_REVIEW_TITLE,
    POLICY_REVIEW_NOTICE,
    POLICY_REVIEW_TERMS,
    POLICY_REVIEW_PRIVACY,
    POLICY_REVIEW_CONTACT,
    POLICY_REVIEW_RESULT,
    POLICY_REVIEW_PENDING,
    POLICY_REVIEW_DATE,
} from "@/config/strings";

function inline(text: string): ReactNode {
    return text.split(/(\[[^\]]+\]\(https:\/\/[^)]+\))/g).map((part, i) => {
        const match = part.match(/^\[([^\]]+)\]\((https:\/\/[^)]+)\)$/);
        if (!match) return part;
        const href =
            match[2] === "https://school.namakemono.info/p/contact"
                ? "/dashboard/contact-preview"
                : match[2];
        return (
            <a key={i} href={href}>
                {match[1]}
            </a>
        );
    });
}
function manuscript(text: string) {
    return text
        .trim()
        .split(/\n\s*\n/)
        .map((block, i) => {
            if (block.startsWith("# "))
                return (
                    <h2 className="article-title" key={i}>
                        {block.slice(2)}
                    </h2>
                );
            if (block.startsWith("## "))
                return <h3 key={i}>{block.slice(3)}</h3>;
            if (block.startsWith("- "))
                return (
                    <ul key={i}>
                        {block.split("\n").map((item, n) => (
                            <li key={n}>{inline(item.slice(2))}</li>
                        ))}
                    </ul>
                );
            return <p key={i}>{inline(block.split("\n").join(" "))}</p>;
        });
}
export default function PolicyReview(content: Record<string, string>) {
    return (
        <section className="policy-review">
            <style>
                {
                    '.policy-review{max-width:800px;margin:24px auto;padding:28px 24px;color:#28382f;background:#fff;border:1px solid #dce5dc;border-radius:12px;font:400 16px/1.9 Inter,"Noto Sans JP",-apple-system,Meiryo,sans-serif;overflow-wrap:anywhere}.policy-review h1{font-size:28px;line-height:1.5;margin:0 0 16px}.policy-review nav{display:flex;flex-wrap:wrap;gap:10px;margin:20px 0 28px}.policy-review nav a{padding:8px 16px;border:1px solid #dce5dc;border-radius:6px;font-weight:600;text-decoration:none}.policy-review a{color:#285c43;text-decoration:underline;text-underline-offset:4px}.policy-review a:focus-visible{outline:3px solid #779e68;outline-offset:3px}.policy-review .review-notice{padding:16px 20px;background:#f3f6f1;border-left:3px solid #779e68;font-size:14px}.policy-review .review-notice p{margin:0 0 10px}.policy-review article{margin-top:36px;scroll-margin-top:24px}.policy-review h2.article-title{font-size:26px;line-height:1.5;margin:0 0 24px;padding-bottom:16px;border-bottom:2px solid #285c43}.policy-review h3{font-size:20px;line-height:1.55;margin:30px 0 14px;padding-left:12px;border-left:3px solid #779e68}.policy-review article p{margin:0 0 20px}.policy-review ul{padding-left:1.4em;margin:0 0 22px}.policy-review li{margin:8px 0}.policy-review footer{margin-top:32px;font-size:13px;color:#667368}@media(max-width:600px){.policy-review{padding:24px 16px;margin:16px 0}.policy-review h1{font-size:23px}.policy-review h2.article-title{font-size:22px}.policy-review h3{font-size:19px}}'
                }
            </style>
            <h1>{POLICY_REVIEW_TITLE}</h1>
            <div className="review-notice">
                <p>{POLICY_REVIEW_NOTICE}</p>
                <p>{POLICY_REVIEW_RESULT}</p>
                <p>{POLICY_REVIEW_PENDING}</p>
            </div>
            <nav aria-label={POLICY_REVIEW_TITLE}>
                <a href="#terms">{POLICY_REVIEW_TERMS}</a>
                <a href="#privacy">{POLICY_REVIEW_PRIVACY}</a>
                <Link href="/dashboard/contact-preview">
                    {POLICY_REVIEW_CONTACT}
                </Link>
            </nav>
            <article id="terms">{manuscript(content.terms)}</article>
            <article id="privacy">{manuscript(content.privacy)}</article>
            <footer>{POLICY_REVIEW_DATE}</footer>
        </section>
    );
}
