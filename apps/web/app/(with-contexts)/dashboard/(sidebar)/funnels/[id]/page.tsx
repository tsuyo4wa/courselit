import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { funnelContext } from "@/services/funnel-context";
import { funnelAdminData } from "@/services/funnels";
import Funnels from "@/components/admin/funnels";
import { funnelUiText } from "@/config/strings";
export const dynamic = "force-dynamic";
export const metadata = {
    title: funnelUiText.menu,
    robots: { index: false, follow: false },
};
interface RouteParams {
    id: string;
}
interface Props {
    params: Promise<RouteParams>;
}
export default async function Page({ params }: Props) {
    const { id } = await params;
    const c = await funnelContext(await headers());
    if (!c.manager) notFound();
    const data = await funnelAdminData(c);
    if (!data.funnels.some((f) => f.funnelId === id)) notFound();
    return (
        <Funnels
            key={id}
            initial={JSON.parse(JSON.stringify(data))}
            selectedId={id}
        />
    );
}
