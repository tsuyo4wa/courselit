import { portablePageLayout } from "@/lib/portable-page-layout";
import { publicSiteOrigin } from "@/lib/portable-site-url";
import { Constants } from "@courselit/common-models";
import Page from "@models/Page";
import Funnel from "@models/Funnel";
import Course from "@models/Course";
import Plan from "@models/PaymentPlan";
import {
    funnelContext,
    FunnelError,
    requireFunnelManager,
} from "./funnel-context";
import { publicFunnelSnapshot } from "./funnels";
import { settingsFor } from "./appointments";
import type { FunnelPageSnapshot } from "@/lib/funnel-types";
export async function funnelView(
    h: Headers,
    pageId: string,
    previewFunnelId?: string,
) {
    const c = await funnelContext(h);
    let page: FunnelPageSnapshot;
    let courseId: string;
    if (previewFunnelId) {
        requireFunnelManager(c);
        const f = await Funnel.findOne({
            domainId: c.domainId,
            funnelId: previewFunnelId,
        }).lean();
        const entry = f?.entries.find((e) => e.pageId === pageId);
        const p: any = entry
            ? await Page.findOne({
                  domain: c.domain._id,
                  pageId,
                  funnelManaged: true,
                  deleted: { $ne: true },
              }).lean()
            : null;
        if (!p || !entry || !f)
            throw new FunnelError("LPが見つかりません。", 404);
        courseId = f.courseId;
        page = {
            ...entry,
            name: p.name,
            title: p.draftTitle || p.title || p.name,
            description: p.draftDescription || p.description || "",
            socialImage:
                p.draftSocialImage === null
                    ? undefined
                    : p.draftSocialImage || p.socialImage,
            robotsAllowed: false,
            layout: p.draftLayout?.length ? p.draftLayout : p.layout,
        };
    } else {
        const view = await publicFunnelSnapshot(c.domainId, pageId);
        if (!view) throw new FunnelError("このLPは現在公開していません。", 404);
        page = view.page;
        courseId = view.course.courseId;
    }
    const course = await Course.findOne({
        domain: c.domain._id,
        courseId,
        deleted: { $ne: true },
        ...(!previewFunnelId ? { published: true } : {}),
    })
        .select(
            "courseId title slug cost costType type tags featuredImage defaultPaymentPlan leadMagnet",
        )
        .lean();
    if (!course) throw new FunnelError("講座が見つかりません。", 404);
    const plans = await Plan.find({
        domain: c.domain._id,
        entityId: courseId,
        entityType: "course",
        archived: false,
        internal: false,
    })
        .select(
            "name planId type oneTimeAmount emiAmount emiTotalInstallments subscriptionMonthlyAmount subscriptionYearlyAmount",
        )
        .lean();
    const appointment = page.booking ? await settingsFor(c.domainId) : null;
    // Never serialize Google credentials, calendar IDs, fixed Zoom, or full Course/Settings documents.
    return JSON.parse(
        JSON.stringify({
            page: {
                ...page,
                layout: portablePageLayout(page.layout, c.domain),
                pageData: {
                    pageType: Constants.PageType.PRODUCT,
                    ...course,
                    _id: undefined,
                    paymentPlans: plans.map(({ _id, ...p }) => p),
                },
            },
            preview: !!previewFunnelId,
            courseTitle: course.title,
            courseId,
            siteTitle: c.domain.settings?.title || "なまけものマーケティング",
            origin: publicSiteOrigin(c.domain),
            booking: appointment
                ? {
                      enabled: appointment.config.enabled,
                      title: appointment.config.title,
                      description: appointment.config.description,
                      durationMinutes: appointment.config.duration,
                      horizonDays: appointment.config.horizonDays,
                  }
                : null,
            loggedIn: !!c.user,
        }),
    );
}
