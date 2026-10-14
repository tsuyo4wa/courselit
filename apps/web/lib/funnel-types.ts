import type { WidgetInstance, Media } from "@courselit/common-models";
export interface FunnelEntry {
    pageId: string;
    enabled: boolean;
    booking: boolean;
    focused: boolean;
}
export interface FunnelPageSnapshot extends FunnelEntry {
    name: string;
    title: string;
    description: string;
    robotsAllowed: boolean;
    socialImage?: Media;
    layout: WidgetInstance[];
}
export interface FunnelPublication {
    revision: string;
    at: string;
    courseId: string;
    name: string;
    pages: FunnelPageSnapshot[];
}
export interface FunnelRecord {
    domainId: string;
    funnelId: string;
    name: string;
    courseId: string;
    entries: FunnelEntry[];
    active: boolean;
    archived: boolean;
    version: number;
    publication?: FunnelPublication;
    previous?: FunnelPublication[];
    publishedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface FunnelCourse {
    courseId: string;
    title: string;
    slug: string;
    published: boolean;
    thankYouUrl?: string;
    plans: { name: string; type: string; planId: string }[];
    sourcePageId?: string;
}
export interface FunnelAdminItem extends FunnelRecord {
    course?: FunnelCourse;
    pages: { pageId: string; name: string }[];
}

export interface FunnelAdminData {
    funnels: FunnelAdminItem[];
    courses: FunnelCourse[];
    pages: { pageId: string; name: string; managed: boolean }[];
    publicOrigin: string;
}
