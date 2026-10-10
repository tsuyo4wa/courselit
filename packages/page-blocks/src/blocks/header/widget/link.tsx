import React from "react";
import { Button, Link as PageLink } from "@courselit/page-primitives";
import { Link as AppLink } from "@courselit/components-library";
import { ThemeStyle } from "@courselit/page-models";

export default function Link({
    href,
    theme,
    linkFontWeight,
    onClick,
    isButton,
    label,
}: {
    href: string;
    theme: ThemeStyle;
    linkFontWeight: string;
    onClick?: () => void;
    isButton: boolean;
    label: string;
}) {
    const localizedLabel =
        (
            {
                Products: "講座一覧",
                Blog: "ブログ",
                "Start learning": "学習を始める",
            } as Record<string, string>
        )[label] ?? label;

    return (
        <AppLink href={href} className={`${linkFontWeight}`} onClick={onClick}>
            {isButton && (
                <Button size="sm" theme={theme}>
                    {localizedLabel}
                </Button>
            )}
            {!isButton && (
                <PageLink theme={theme} className="no-underline">
                    {localizedLabel}
                </PageLink>
            )}
        </AppLink>
    );
}
