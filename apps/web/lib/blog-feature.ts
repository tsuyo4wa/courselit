import type { SiteInfo, WidgetDefaultSettings } from "@courselit/common-models";

// Existing schools retain their blog until explicitly disabled by an operator.
export function isBlogEnabled(settings?: Pick<SiteInfo, "blogEnabled"> | null) {
    return settings?.blogEnabled !== false;
}

export function assertBlogEnabled(
    settings: Pick<SiteInfo, "blogEnabled"> | undefined,
    type?: string,
) {
    if (type === "blog" && !isBlogEnabled(settings)) {
        throw new Error("ブログ機能はOFFになっています");
    }
}

export function isBlogRoute(path: string) {
    return (
        /^\/(?:blog|post)(?:\/|$)/.test(path) ||
        /^\/dashboard\/(?:blogs|blog)(?:\/|$)/.test(path) ||
        /^\/(?:p|dashboard\/page)\/blog(?:\/|$)/.test(path)
    );
}

export function withoutBlogTypes(
    types: readonly string[],
    settings?: SiteInfo,
) {
    return isBlogEnabled(settings)
        ? [...types]
        : types.filter((type) => type !== "blog");
}

export function isLocalBlogLink(href: string, backend: string) {
    try {
        const base = new URL(backend);
        const target = new URL(href, base);
        return target.origin === base.origin && isBlogRoute(target.pathname);
    } catch {
        return (
            /^\/(?:blog|post)(?:[/?#]|$)/.test(href) ||
            /^\/p\/blog(?:[/?#]|$)/.test(href)
        );
    }
}

// Filter only the rendered copy. Stored links return automatically when ON.
export function blogAwareWidgetSettings<T extends WidgetDefaultSettings>(
    name: string,
    settings: T,
    siteinfo: SiteInfo,
    backend: string,
): T {
    if (isBlogEnabled(siteinfo)) return settings;
    const data = settings as T & {
        links?: { href: string }[];
        sections?: { links: { href: string }[] }[];
    };
    if (name === "header" && Array.isArray(data.links)) {
        return {
            ...data,
            links: data.links.filter(
                (link) => !isLocalBlogLink(link.href, backend),
            ),
        };
    }
    if (name === "footer" && Array.isArray(data.sections)) {
        return {
            ...data,
            sections: data.sections.map((section) => ({
                ...section,
                links: section.links.filter(
                    (link) => !isLocalBlogLink(link.href, backend),
                ),
            })),
        };
    }
    return settings;
}
