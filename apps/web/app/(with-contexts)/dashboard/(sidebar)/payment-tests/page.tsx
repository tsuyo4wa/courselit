import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { contactContext } from "@/services/contact-form";
import PaymentTests from "@/components/admin/payment-tests";
import { paymentTestText } from "@/config/strings";
export const dynamic = "force-dynamic";
export const metadata = {
    title: paymentTestText.title,
    robots: { index: false, follow: false },
};
export default async function Page() {
    const ctx = await contactContext(await headers());
    if (!ctx?.owner) notFound();
    return <PaymentTests />;
}
