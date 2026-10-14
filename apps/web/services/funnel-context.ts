import { auth } from "@/auth";
import Domain from "@models/Domain";
import User from "@models/User";
import { UIConstants } from "@courselit/common-models";
import { FunnelError } from "@/lib/funnel-access";
export { FunnelError, requireFunnelManager } from "@/lib/funnel-access";
export async function funnelContext(headers: Headers) {
    const domain = await Domain.findOne({ name: headers.get("domain") });
    if (!domain) throw new FunnelError("ページが見つかりません。", 404);
    const session = await auth.api.getSession({ headers });
    const user = session?.user?.email
        ? await User.findOne({
              domain: domain._id,
              email: session.user.email,
              active: true,
          })
        : null;
    return {
        domain,
        domainId: String(domain._id),
        user,
        manager: !!user?.permissions?.includes(
            UIConstants.permissions.manageSite,
        ),
    };
}
export type FunnelContext = Awaited<ReturnType<typeof funnelContext>>;
export function funnelOrigin(c: FunnelContext, h: Headers) {
    const host = h.get("host");
    const allowed = [
        c.domain.customDomain,
        process.env.DOMAIN,
        process.env.RENDER_EXTERNAL_HOSTNAME,
    ].filter(Boolean);
    if (
        !host ||
        !allowed.includes(host) ||
        h.get("origin") !== "https://" + host
    )
        throw new FunnelError("この画面から設定を保存してください。", 403);
}
