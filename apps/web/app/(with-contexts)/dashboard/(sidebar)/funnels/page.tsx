import { funnelUiText } from "@/config/strings";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { funnelContext } from "@/services/funnel-context";
import { funnelAdminData } from "@/services/funnels";
import Funnels from "@/components/admin/funnels";
export const dynamic = "force-dynamic";
export const metadata = {
    title: funnelUiText.menu,
    robots: { index: false, follow: false },
};
export default async function Page() {
    const c = await funnelContext(await headers());
    if (!c.manager) notFound();
    return (
        <Funnels
            initial={JSON.parse(JSON.stringify(await funnelAdminData(c)))}
        />
    );
}
