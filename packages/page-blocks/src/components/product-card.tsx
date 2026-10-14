import React from "react";
import { Image, Link, Skeleton } from "@courselit/components-library";
import { Badge, PageCardHeader, Subheader1 } from "@courselit/page-primitives";
import { PageCardContent } from "@courselit/page-primitives";
import { PageCard, PageCardImage } from "@courselit/page-primitives";
import { ThemeStyle } from "@courselit/page-models";

export function ProductCard({
    title,
    user,
    theme,
    href,
    image,
    badgeChildren,
    thumbnailLabel,
}: {
    title: string;
    user: {
        name: string;
        thumbnail: string;
    };
    theme?: ThemeStyle;
    href: string;
    image: string;
    badgeChildren?: any;
    thumbnailLabel?: string;
}) {
    return (
        <Link href={href} className="flex">
            <PageCard
                isLink={true}
                className="flex flex-col overflow-hidden w-full"
                theme={theme}
            >
                <div className="relative">
                    <PageCardImage
                        src={image}
                        alt={title}
                        className="aspect-video object-cover"
                        theme={theme}
                    />
                    {thumbnailLabel && (
                        <span className="absolute left-3 top-3 z-10 inline-flex rounded-md border border-white/80 px-3 py-1.5 text-[13px] font-semibold leading-5 tracking-[0.02em] bg-primary/95 text-primary-foreground ring-2 ring-white/50 shadow-[0_3px_10px_rgba(0,0,0,0.14)] backdrop-blur-sm pointer-events-none">
                            {thumbnailLabel}
                        </span>
                    )}
                </div>
                <PageCardContent theme={theme} className="flex flex-col grow">
                    <PageCardHeader theme={theme} className="grow">
                        {title}
                    </PageCardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Image
                                src={user?.thumbnail}
                                alt={user?.name || "ユーザーのアイコン"}
                                width="w-8"
                                height="h-8"
                                className="rounded-full"
                                objectFit="cover"
                            />
                            <Subheader1 theme={theme}>{user?.name}</Subheader1>
                        </div>
                        {badgeChildren && (
                            <Badge theme={theme}>{badgeChildren}</Badge>
                        )}
                    </div>
                </PageCardContent>
            </PageCard>
        </Link>
    );
}

export function ProductCardSkeleton({ theme }: { theme?: ThemeStyle }) {
    return (
        <PageCard className="overflow-hidden" theme={theme}>
            <Skeleton className="aspect-video w-full" />
            <PageCardContent theme={theme}>
                <Skeleton className="h-6 w-3/4 mb-4" />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                </div>
            </PageCardContent>
        </PageCard>
    );
}
