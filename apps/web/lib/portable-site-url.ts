import { siteLinkAliases } from "@/config/site-link-aliases";
import { readThankYouUrl } from "./thank-you-url";

export interface SiteUrlDomain {
    name?: string;
    customDomain?: string;
}

// Only configured tenant data is used. Never derive emailed/public URLs from
// an untrusted Host, Origin, returnTo or redirect parameter.
export function publicSiteOrigin(domain: SiteUrlDomain): string | undefined {
    const root = process.env.DOMAIN;
    const host =
        domain.customDomain ||
        (domain.name && domain.name !== "main" && root
            ? `${domain.name}.${root}`
            : root);
    if (!host || /[\s/@?#\\]/.test(host)) return;
    try {
        const url = new URL(`https://${host}`);
        if (url.port || url.username || url.password) return;
        return url.origin;
    } catch {
        return;
    }
}

export function siteLinkOrigins(domain: SiteUrlDomain): string[] {
    const configured = publicSiteOrigin(domain);
    return Array.from(
        new Set([
            ...(configured ? [configured] : []),
            ...(domain.name &&
            Object.prototype.hasOwnProperty.call(siteLinkAliases, domain.name)
                ? siteLinkAliases[domain.name]
                : []),
        ]),
    );
}

export function portableSiteLink(value: string, domain: SiteUrlDomain): string {
    if (
        !/^(?:https:\/\/|\/\/)/i.test(value) ||
        /[\u0000-\u0020\u007f\\]/.test(value)
    )
        return value;
    try {
        const url = new URL(value.startsWith("//") ? `https:${value}` : value);
        if (
            url.username ||
            url.password ||
            url.pathname.startsWith("//") ||
            !siteLinkOrigins(domain).includes(url.origin)
        )
            return value;
        return url.pathname + url.search + url.hash;
    } catch {
        return value;
    }
}

// Keep the existing strict HTTPS thank-you validation and absolute response
// contract. Only a stored same-school destination follows the configured host.
export function readSiteThankYouUrl(
    value: string | null | undefined,
    domain: SiteUrlDomain,
): string | undefined {
    const safe = readThankYouUrl(value);
    if (!safe) return;
    const path = portableSiteLink(safe, domain);
    if (path === safe) return safe;
    const origin = publicSiteOrigin(domain);
    return origin ? readThankYouUrl(origin + path) : undefined;
}
