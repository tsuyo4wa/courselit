import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { contactContext } from "@/services/contact-form";
import { getPolicyReview } from "@/services/policy-review";
import PolicyReview from "@/components/admin/policy-review";
import { POLICY_REVIEW_TITLE } from "@/config/strings";
export const dynamic = "force-dynamic";
export const metadata = {
    title: POLICY_REVIEW_TITLE,
    robots: { index: false, follow: false },
};
export default async function Page() {
    const context = await contactContext(await headers());
    if (!context?.owner) notFound();
    const content = await getPolicyReview(context.domain);
    if (!content) notFound();
    return <PolicyReview terms={content.terms} privacy={content.privacy} />;
}
