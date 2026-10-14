import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getAddressFromHeaders } from "@/app/actions";
import { getFullSiteSetup } from "@ui-lib/utils";
import { funnelView } from "@/services/funnel-view";
import { FunnelError } from "@/services/funnel-context";
import FunnelLanding from "@/components/public/funnel-landing";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props) {
    try {
        const view = await funnelView(await headers(), (await params).id);
        return {
            title: view.page.title,
            description: view.page.description,
            alternates: { canonical: view.origin + "/lp/" + view.page.pageId },
            robots: { index: view.page.robotsAllowed, follow: true },
            openGraph: {
                title: view.page.title,
                description: view.page.description,
                images: view.page.socialImage?.file
                    ? [view.page.socialImage.file]
                    : [],
            },
        };
    } catch {
        return {
            title: "ページが見つかりません",
            robots: { index: false, follow: false },
        };
    }
}
export default async function Page({ params }: Props) {
    let view;
    try {
        view = await funnelView(await headers(), (await params).id);
    } catch (e) {
        if (e instanceof FunnelError && [403, 404].includes(e.status))
            notFound();
        throw e;
    }
    const siteInfo = await getFullSiteSetup(
        await getAddressFromHeaders(headers),
    );
    if (!siteInfo) notFound();
    return <FunnelLanding view={view} siteInfo={siteInfo} />;
}
