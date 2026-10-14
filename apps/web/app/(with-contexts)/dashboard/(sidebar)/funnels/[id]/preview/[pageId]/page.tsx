import Link from "next/link";
import { funnelUiText } from "@/config/strings";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getFullSiteSetup } from "@ui-lib/utils";
import { getAddressFromHeaders } from "@/app/actions";
import { funnelView } from "@/services/funnel-view";
import { FunnelError } from "@/services/funnel-context";
import FunnelLanding from "@/components/public/funnel-landing";
export const dynamic = "force-dynamic";
export const metadata = {
    robots: { index: false, follow: false },
    title: "LPの公開前確認",
};
export default async function Page({
    params,
}: {
    params: Promise<{ id: string; pageId: string }>;
}) {
    const p = await params;
    let view;
    try {
        view = await funnelView(await headers(), p.pageId, p.id);
    } catch (e) {
        if (e instanceof FunnelError && [403, 404].includes(e.status))
            notFound();
        throw e;
    }
    const siteInfo = await getFullSiteSetup(
        await getAddressFromHeaders(headers),
    );
    if (!siteInfo) notFound();
    return (
        <>
            <nav className="px-3 py-4 text-sm sm:px-6">
                <Link
                    className="underline underline-offset-4"
                    href={`/dashboard/funnels/${p.id}`}
                >
                    {funnelUiText.previewBack}
                </Link>
            </nav>
            <FunnelLanding view={view} siteInfo={siteInfo} />
        </>
    );
}
