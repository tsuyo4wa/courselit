import { JSDOM } from "jsdom";
import {
    portableSiteLink,
    siteLinkOrigins,
    SiteUrlDomain,
} from "./portable-site-url";

// Bound both entry count and total text size; large embedded images must not
// grow a process-wide cache without a limit. A changed host gets a new key.
const htmlCache = new Map<string, string>();
let cachedCharacters = 0;
const cacheBudget = 2_000_000;

// Edit only navigation attribute spans. Do not reserialize an entire document:
// image data, scripts, styles, prose and formatting must remain byte-for-byte.
export function portablePageHtml(html: string, domain: SiteUrlDomain): string {
    const key = JSON.stringify(siteLinkOrigins(domain)) + html;
    const cached = htmlCache.get(key);
    if (cached !== undefined) return cached;
    if (
        !siteLinkOrigins(domain).some((origin) =>
            html.toLowerCase().includes(new URL(origin).hostname),
        )
    )
        return html;
    const dom = new JSDOM(html, { includeNodeLocations: true });
    try {
        // A third-party base changes relative-link semantics; leave such custom
        // documents untouched rather than silently sending links to that host.
        if (dom.window.document.querySelector("base[href]")) return html;
        const edits: { start: number; end: number; text: string }[] = [];
        for (const node of dom.window.document.querySelectorAll(
            "a[href],area[href],form[action]",
        )) {
            const key = node.tagName === "FORM" ? "action" : "href";
            const old = node.getAttribute(key)!;
            const next = portableSiteLink(old, domain);
            const location = dom.nodeLocation(node)?.attrs?.[key];
            if (next === old || !location) continue;
            const escaped = next
                .replace(/&/g, "&amp;")
                .replace(/"/g, "&quot;")
                .replace(/</g, "&lt;");
            edits.push({
                start: location.startOffset,
                end: location.endOffset,
                text: `${key}="${escaped}"`,
            });
        }
        for (const edit of edits.sort((a, b) => b.start - a.start)) {
            html = html.slice(0, edit.start) + edit.text + html.slice(edit.end);
        }
        const size = key.length + html.length;
        if (size <= cacheBudget) {
            while (
                htmlCache.size >= 16 ||
                cachedCharacters + size > cacheBudget
            ) {
                const first = htmlCache.keys().next().value;
                if (first === undefined) break;
                cachedCharacters -= first.length + htmlCache.get(first)!.length;
                htmlCache.delete(first);
            }
            htmlCache.set(key, html);
            cachedCharacters += size;
        }
        return html;
    } finally {
        dom.window.close();
    }
}

// Traverse only plain Page JSON. A media file/url/src is deliberately excluded.
export function portablePageLayout<T>(layout: T, domain: SiteUrlDomain): T {
    function visit(value: unknown, key = ""): unknown {
        if (typeof value === "string") {
            if (["href", "yearlyHref"].includes(key))
                return portableSiteLink(value, domain);
            if (
                ["content", "html", "text", "value"].includes(key) &&
                /<(?:a|area|form)\b/i.test(value)
            )
                return portablePageHtml(value, domain);
            return value;
        }
        if (Array.isArray(value)) return value.map((item) => visit(item));
        if (
            value &&
            typeof value === "object" &&
            (Object.getPrototypeOf(value) === Object.prototype ||
                Object.getPrototypeOf(value) === null)
        ) {
            return Object.fromEntries(
                Object.entries(value).map(([k, v]) => [k, visit(v, k)]),
            );
        }
        return value;
    }
    return visit(JSON.parse(JSON.stringify(layout))) as T;
}
